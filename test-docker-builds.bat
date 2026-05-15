@echo off
echo ============================================
echo AgroPulse Docker Build Test
echo ============================================
echo.

echo Step 1: Testing Web Dockerfile build...
echo.
docker build -t agropulse-web-test -f infra/docker/web.Dockerfile .
if %errorlevel% neq 0 (
    echo ❌ Web Dockerfile build FAILED!
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo ✅ Web Dockerfile build SUCCESSFUL!
echo.

echo Step 2: Testing API Dockerfile build...
echo.
docker build -t agropulse-api-test -f infra/docker/api.Dockerfile .
if %errorlevel% neq 0 (
    echo ❌ API Dockerfile build FAILED!
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo ✅ API Dockerfile build SUCCESSFUL!
echo.

echo ============================================
echo All Docker builds completed successfully!
echo ============================================
echo.
echo You can now safely push to GitHub.
echo.
echo To test locally:
echo   docker-compose up -d
echo.
echo To clean up test images:
echo   docker rmi agropulse-web-test agropulse-api-test
echo.
pause
