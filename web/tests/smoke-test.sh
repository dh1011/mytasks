#!/bin/bash
set -e

echo "Running smoke tests on Docker container..."

# Test 1: Check if index.html is served
echo "Test 1: Checking if index.html is accessible..."
response=$(curl -s http://localhost:3000/)
if echo "$response" | grep -qi "<!doctype html>"; then
    echo "✅ Index.html is served correctly"
else
    echo "❌ Index.html not found or incorrect"
    exit 1
fi

# Test 2: Check if React app root element exists
echo "Test 2: Checking for React root element..."
if echo "$response" | grep -q 'id="root"'; then
    echo "✅ React root element found"
else
    echo "❌ React root element not found"
    exit 1
fi

# Test 3: Check if SPA routing fallback works
echo "Test 3: Checking SPA routing fallback..."
response=$(curl -s http://localhost:3000/some-route)
if echo "$response" | grep -qi "<!doctype html>"; then
    echo "✅ SPA routing fallback works"
else
    echo "❌ SPA routing fallback failed"
    exit 1
fi

# Test 4: Check if gzip compression is enabled
echo "Test 4: Checking gzip compression..."
if curl -sI http://localhost:3000/ -H "Accept-Encoding: gzip" | grep -qi "Content-Encoding.*gzip"; then
    echo "✅ Gzip compression is enabled"
else
    echo "⚠️  Gzip compression not detected (may be normal for small files)"
fi

echo "✅ All smoke tests passed!"
