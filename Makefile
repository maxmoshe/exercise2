.PHONY: up down deploy-local deploy-prod deploy-applicationset load-images port-forward-argocd port-forward-dashboard

check-prereqs:
	@which kind > /dev/null || (echo "❌ Error: 'kind' not found. Please install: https://kind.sigs.k8s.io/" && exit 1)
	@which kubectl > /dev/null || (echo "❌ Error: 'kubectl' not found. Please install." && exit 1)
	@echo "✅ Found kind and kubectl"

load-images:
	@echo "📦 Loading Docker images into kind cluster..."
	@kind load docker-image management-api:latest web-server:latest frontend:latest
	@echo "✅ Images loaded successfully"

port-forward-argocd:
	@echo "🔌 Port forwarding ArgoCD to http://localhost:8080"
	@echo "Username: admin"
	@echo "Password: $$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)"
	@kubectl port-forward -n argocd service/argocd-server 8080:80

port-forward-dashboard:
	@echo "🔌 Port forwarding services..."
	@echo "  Frontend:    http://localhost:3000"
	@echo "  Web Server:  http://localhost:3001"
	@kubectl port-forward -n default service/frontend 3000:80 & \
	kubectl port-forward -n default service/web-server 8080:8080 & \
	wait

up:	check-prereqs
	@echo "Creating kind cluster..."


	kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

	kubectl apply --server-side -n argocd -f argocd.yaml

	ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo)
	kubectl port-forward -n argocd service/argocd-server 3333:80

	@echo "argo-cd dashboard running on http://localhost:3333"
	@echo "argo-cd Credentials:"
