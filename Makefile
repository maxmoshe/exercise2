.PHONY up down

check-prereqs:
	@which kind > /dev/null || (echo "❌ Error: 'kind' not found. Please install: https://kind.sigs.k8s.io/" && exit 1)
	@which kubectl > /dev/null || (echo "❌ Error: 'kubectl' not found. Please install." && exit 1)
	@echo "✅ Found kind and kubectl"

up:	check-prereqs
	@echo "Creating kind cluster..."
