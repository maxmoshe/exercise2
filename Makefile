.PHONY: up down deploy load-images build-images port-forward-argocd port-forward-dashboard kill-ports

KUBE_CONTEXT := kind-moshe

check-prereqs:
	@which kind > /dev/null || (echo "❌ Error: 'kind' not found. Please install: https://kind.sigs.k8s.io/" && exit 1)
	@which kubectl > /dev/null || (echo "❌ Error: 'kubectl' not found. Please install." && exit 1)
	@echo "✅ Found kind and kubectl"

build-images:
	@echo "🔨 Building Docker images..."
	@docker build -t management-api:latest -f apps/management-api/Dockerfile . -q
	@docker build -t web-server:latest -f apps/web-server/Dockerfile . -q
	@docker build -t frontend:latest -f apps/frontend/Dockerfile . -q
	@echo "✅ Images built successfully"

load-images:
	@echo "📦 Loading Docker images into kind cluster..."
	@kind load docker-image management-api:latest web-server:latest frontend:latest --name moshe
	@echo "✅ Images loaded successfully"

deploy:
	@if [ "$(ENV)" = "local" ]; then \
		echo "🚀 Deploying LOCAL environment..."; \
		$(MAKE) build-images; \
		$(MAKE) load-images; \
		kubectl --context $(KUBE_CONTEXT) apply -k argocd/local/; \
		echo "✅ Local environment deployed"; \
	else \
		echo "🚀 Deploying PRODUCTION environment..."; \
		kubectl --context $(KUBE_CONTEXT) apply -k argocd/prod/; \
		echo "✅ Production environment deployed"; \
	fi

kill-ports:
	@lsof -ti:8085 | xargs kill -9 2>/dev/null || true
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true

port-forward-argocd:
	@lsof -ti:8085 | xargs kill -9 2>/dev/null || true
	@echo "🔌 Port forwarding ArgoCD in background..."
	@kubectl --context $(KUBE_CONTEXT) port-forward -n argocd service/argocd-server 8085:80 > /dev/null 2>&1 &
	@sleep 2
	@echo "✅ ArgoCD available at http://localhost:8085"
	@echo ""
	@echo "📝 Credentials:"
	@echo "   Username: admin"
	@echo "   Password: $$(kubectl --context $(KUBE_CONTEXT) -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)"
	@echo ""

port-forward-dashboard:
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	@echo "🔌 Port forwarding services..."
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Web Server:  http://localhost:8080"
	@kubectl --context $(KUBE_CONTEXT) port-forward -n default service/frontend 3000:80 & \
	kubectl --context $(KUBE_CONTEXT) port-forward -n default service/web-server 8080:8080 & \
	wait

up:	check-prereqs
	@echo "Setting up cluster..."
	@if ! kind get clusters 2>/dev/null | grep -q "^moshe$$"; then \
		kind create cluster --name moshe; \
	else \
		echo "Cluster 'moshe' already exists, skipping creation"; \
	fi

	@echo "Deploying argocd..."
	@kubectl --context $(KUBE_CONTEXT) create namespace argocd --dry-run=client -o yaml | kubectl --context $(KUBE_CONTEXT) apply -f -
	@kubectl --context $(KUBE_CONTEXT) apply --server-side -n argocd -f argocd.yaml
	@echo ""
	@echo "Waiting for argocd... May take a moment."
	@kubectl --context $(KUBE_CONTEXT) wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
	@echo ""
	@$(MAKE) port-forward-argocd

	@echo "Creating argocd applications..."

	@$(MAKE) deploy ENV=$(ENV)

	@echo "Waiting for ArgoCD to sync and create deployments... See progress in argocd dashboard above ^"
	@sleep 10
	@until kubectl --context $(KUBE_CONTEXT) get statefulset mongodb -n mongodb 2>/dev/null; do sleep 2; done
	@until kubectl --context $(KUBE_CONTEXT) get statefulset zookeeper -n kafka 2>/dev/null; do sleep 2; done
	@until kubectl --context $(KUBE_CONTEXT) get statefulset kafka -n kafka 2>/dev/null; do sleep 2; done
	@until kubectl --context $(KUBE_CONTEXT) get deployment frontend -n default 2>/dev/null; do sleep 2; done
	@until kubectl --context $(KUBE_CONTEXT) get deployment web-server -n default 2>/dev/null; do sleep 2; done
	@until kubectl --context $(KUBE_CONTEXT) get deployment management-api -n default 2>/dev/null; do sleep 2; done

	@echo "Waiting for infrastructure..."
	@kubectl --context $(KUBE_CONTEXT) wait --for=jsonpath='{.status.readyReplicas}'=1 --timeout=300s statefulset/mongodb -n mongodb
	@kubectl --context $(KUBE_CONTEXT) wait --for=jsonpath='{.status.readyReplicas}'=1 --timeout=300s statefulset/zookeeper -n kafka
	@kubectl --context $(KUBE_CONTEXT) wait --for=jsonpath='{.status.readyReplicas}'=1 --timeout=300s statefulset/kafka -n kafka

	@echo "Waiting for services..."
	@kubectl --context $(KUBE_CONTEXT) wait --for=condition=available --timeout=300s deployment/frontend -n default
	@kubectl --context $(KUBE_CONTEXT) wait --for=condition=available --timeout=300s deployment/web-server -n default
	@kubectl --context $(KUBE_CONTEXT) wait --for=condition=available --timeout=300s deployment/management-api -n default

	@$(MAKE) port-forward-dashboard

down:
	@kind delete cluster --name moshe
