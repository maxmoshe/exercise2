# Home assignment

## Run:

### Requirements:
*   kind: https://kind.sigs.k8s.io/
    `brew install kind`
    or 
    https://kind.sigs.k8s.io/docs/user/quick-start/#installing-from-release-binaries

*   kubectl


run
`make up`

to build docker images locally and use them instead: 
`make up ENV=local`

Should be idempotent - you can run it again if it fails, without needing to `make down`

### troubleshooting:
if port-forwarding breaks, you can use:
```
 make port-forward-argoc
 make port-forward-dashboar
```


## Develop locally:
```
docker compose up
npm run dev:front
npm run dev:web-server
npm run dev:management-api
```


web-server should extract userId from bearer token.

nest for backend
prisma for mongo

kind
kafka
mongo
api server
api client facing server
keda scaling - kafka lag, http request rate/latency

frontend

cicd? tests and push image

for A+
trpc
types lib
pretty react ui
mock jwt auth
argo

cicd - update argocd/ manifests

pulumi
deployed to gcp - needs to run on k8s so too expensive. localstack eks?



ecr repo 