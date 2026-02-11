# Multi-stage build for MyTasks Web Application

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency resolution
COPY web/package*.json ./web/
COPY packages/core/package.json ./packages/core/
COPY tsconfig.json ./


# Install dependencies (including local @mytasks/core)
WORKDIR /app/web
RUN npm install

# Copy core package source
COPY packages/core /app/packages/core

# Copy web source files
COPY web/src ./src
COPY web/public ./public
COPY web/index.html ./
COPY web/tsconfig*.json ./
COPY web/vite.config.ts ./
COPY web/tailwind.config.cjs ./
COPY web/postcss.config.cjs ./

# Build the application
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
