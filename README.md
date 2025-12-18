# Home Assignment

## Requirements

* **kind**: https://kind.sigs.k8s.io/

  Install with brew:
  ```
  brew install kind
  ```

  Or from release binaries:
  https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries

* **kubectl**

## Run

Build and deploy to kind cluster using Docker Hub images:

```
make up
```

Build docker images locally and use them instead:

```
make up ENV=local
```

The `make up` command is idempotent - you can run it again if it fails without needing to `make down`.

## Accessing Services

After deployment, access the services at:

* **Frontend**: http://localhost:3000
* **ArgoCD Dashboard**: http://localhost:8085 (credentials displayed during `make up`)

## Troubleshooting

If port-forwarding breaks, you can restart it:

```
make port-forward-argocd
make port-forward-dashboard
```

## Develop Locally

Start infrastructure and run services locally:

```
docker compose up
npm run dev:front
npm run dev:web-server
npm run dev:management-api
```

## Notes:
To deploy on a new cluster (theoretically), simply install argo with
```
kubectl apply --server-side -n argocd -f argocd.yaml
```
then install the applications with
```
kubectl apply -k argocd/prod/
```
for any other envs, you can copy the argocd/prod folder and alter values, and install like above, replacing prod with {env}.
point to a different git tag for granular promotion.

## Architecture

* **Frontend**: React application
* **Web Server**: Customer-facing API (Node.js/NestJS)
* **Management API**: Internal API with Kafka consumer (Node.js/NestJS)
* **Kafka**: Message broker for purchase events
* **MongoDB**: Purchase data storage
* **KEDA**: Autoscaling based on Kafka lag
* **ArgoCD**: GitOps continuous deployment

## CI/CD

GitHub Actions workflow builds and pushes Docker images to Docker Hub, then updates ArgoCD manifests with new image tags for automatic deployment. 