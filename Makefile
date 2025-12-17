.PHONY: up down deploy-local deploy-prod deploy-applicationset

check-prereqs:
	@which kind > /dev/null || (echo "❌ Error: 'kind' not found. Please install: https://kind.sigs.k8s.io/" && exit 1)
	@which kubectl > /dev/null || (echo "❌ Error: 'kubectl' not found. Please install." && exit 1)
	@echo "✅ Found kind and kubectl"

up:	check-prereqs
	@echo "Creating kind cluster..."


	kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

	kubectl apply --server-side -n argocd -f argocd.yaml

	ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo)
	kubectl port-forward -n argocd service/argocd-server 3333:80

	@echo "argo-cd dashboard running on http://localhost:3333"
	@echo "argo-cd Credentials:"
