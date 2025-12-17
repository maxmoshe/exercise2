# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY libs/types ./libs/types
COPY apps/frontend ./apps/frontend

# Install dependencies for all workspaces
RUN npm install

# Build types library first
RUN cd libs/types && npm run build

# Build frontend
RUN cd apps/frontend && npm run build

# Production stage - nginx
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/apps/frontend/build/client /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]