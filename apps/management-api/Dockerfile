# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY libs/types ./libs/types
COPY apps/management-api ./apps/management-api

# Install dependencies for all workspaces
RUN npm install

# Build types library first
RUN cd libs/types && npm run build

# Build management-api
RUN cd apps/management-api && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace packages
COPY libs/types/package*.json ./libs/types/
COPY apps/management-api/package*.json ./apps/management-api/

# Install only production dependencies
RUN npm install --production --workspaces=false && \
    cd libs/types && npm install --production && \
    cd ../.. && cd apps/management-api && npm install --production

# Copy built types library
COPY --from=builder /app/libs/types/dist ./libs/types/dist

# Copy built management-api
COPY --from=builder /app/apps/management-api/dist ./apps/management-api/dist

# Set working directory to management-api
WORKDIR /app/apps/management-api

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/src/main.js"]
