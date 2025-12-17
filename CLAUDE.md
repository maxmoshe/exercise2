Build a Kubernetes-based microservices system with:

1. Customer Facing Web Server (Node.js/Express):
   - POST /buy - Publishes purchase events to Kafka (username, userid, price, timestamp)
   - GET /getAllUserBuys/:userid - Proxies to Customer Management API

2. Customer Management API (Node.js/Express):
   - Kafka consumer - Reads purchase events and saves to MongoDB
   - GET /purchases/:userid - Returns all user purchases from MongoDB

3. MongoDB - Store purchases

4. Kafka - Message broker for purchase events

5. Kubernetes configs with:
   - Deployments, Services for both apps
   - StatefulSets for Kafka & MongoDB
   - HPA (autoscaling) based on custom metrics (Kafka lag, HTTP request rate)

6. BONUS: Simple HTML frontend with "Buy" and "Get All Purchases" buttons

7. BONUS: GitHub Actions CI/CD with tests, Docker build/push, k8s deploy

Include: README with setup instructions, commented code, docker-compose for local testing