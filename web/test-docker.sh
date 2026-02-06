#!/bin/bash
set -e

# Detect if using podman or docker
if command -v podman &> /dev/null && ! command -v docker &> /dev/null; then
    COMPOSE_CMD="podman compose"
    CONTAINER_CMD="podman"
elif command -v docker &> /dev/null; then
    COMPOSE_CMD="docker compose"
    CONTAINER_CMD="docker"
else
    echo "❌ Neither Docker nor Podman found"
    exit 1
fi

echo "🔨 Building web Docker image using $COMPOSE_CMD..."

# Navigate to script directory
cd "$(dirname "$0")"

# Cleanup any existing containers first
echo "🧹 Cleaning up existing containers..."
$CONTAINER_CMD rm -f mytasks-web 2>/dev/null || true
$COMPOSE_CMD down -v 2>/dev/null || true

# Build the image
$COMPOSE_CMD build web

echo "✅ Docker image built successfully"

echo "🚀 Starting container for testing..."

# Start container in detached mode
$COMPOSE_CMD up -d web

# Wait for container to be running and healthy
echo "⏳ Waiting for container to be ready..."
timeout=30
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if $COMPOSE_CMD ps | grep -q "Up"; then
        echo "✅ Container is running"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Container failed to start"
    $COMPOSE_CMD logs web
    $COMPOSE_CMD down -v
    exit 1
fi

# Give nginx a moment to fully start
sleep 3

# Test if the application is accessible
echo "🧪 Testing application accessibility..."
if curl -sf http://localhost:3000 > /dev/null; then
    echo "✅ Application is accessible at http://localhost:3000"
else
    echo "❌ Application is not accessible"
    $COMPOSE_CMD logs web
    $COMPOSE_CMD down -v
    $CONTAINER_CMD rm -f mytasks-web 2>/dev/null || true
    exit 1
fi

# Run any additional tests
if [ -f "tests/smoke-test.sh" ]; then
    echo "🧪 Running smoke tests..."
    bash tests/smoke-test.sh
fi

echo "✅ All tests passed!"

# Cleanup
echo "🧹 Cleaning up..."
$COMPOSE_CMD down -v
$CONTAINER_CMD rm -f mytasks-web 2>/dev/null || true

echo "✨ Docker test completed successfully!"
