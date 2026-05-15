#!/bin/bash

echo "============================================"
echo "AgroPulse Docker Build Test"
echo "============================================"
echo ""

echo "Step 1: Testing Web Dockerfile build..."
echo ""
docker build -t agropulse-web-test -f infra/docker/web.Dockerfile .
if [ $? -ne 0 ]; then
    echo "❌ Web Dockerfile build FAILED!"
    echo ""
    echo "Please check the error messages above."
    exit 1
fi
echo "✅ Web Dockerfile build SUCCESSFUL!"
echo ""

echo "Step 2: Testing API Dockerfile build..."
echo ""
docker build -t agropulse-api-test -f infra/docker/api.Dockerfile .
if [ $? -ne 0 ]; then
    echo "❌ API Dockerfile build FAILED!"
    echo ""
    echo "Please check the error messages above."
    exit 1
fi
echo "✅ API Dockerfile build SUCCESSFUL!"
echo ""

echo "============================================"
echo "All Docker builds completed successfully!"
echo "============================================"
echo ""
echo "You can now safely push to GitHub."
echo ""
echo "To test locally:"
echo "  docker-compose up -d"
echo ""
echo "To clean up test images:"
echo "  docker rmi agropulse-web-test agropulse-api-test"
echo ""
