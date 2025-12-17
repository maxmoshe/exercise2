# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy workspace packages
COPY libs/types ./libs/types
COPY apps/web-server ./apps/web-server

# Install dependencies for all workspaces
RUN npm install

# Build types library first
RUN cd libs/types && npm run build

# Build web-server
RUN cd apps/web-server && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy workspace packages
COPY libs/types/package*.json ./libs/types/
COPY apps/web-server/package*.json ./apps/web-server/

# Install only production dependencies
RUN npm install --production --workspaces=false && \
    cd libs/types && npm install --production && \
    cd ../.. && cd apps/web-server && npm install --production

# Copy built types library
COPY --from=builder /app/libs/types/dist ./libs/types/dist

# Copy built web-server
COPY --from=builder /app/apps/web-server/dist ./apps/web-server/dist

# Set working directory to web-server
WORKDIR /app/apps/web-server

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/src/main.js"]
