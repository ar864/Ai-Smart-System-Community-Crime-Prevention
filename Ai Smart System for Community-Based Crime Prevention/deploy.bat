@echo off
REM Production Deployment Script for Windows

setlocal enabledelayedexpansion

echo 🚀 Starting Production Deployment...

REM Check if .env exists
if not exist .env.production (
    echo ❌ Error: .env.production not found
    echo Please copy .env.production.example to .env.production and configure it
    exit /b 1
)

echo 📦 Building Docker images...
docker compose -f docker-compose.prod.yml build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

echo 🔐 Setting up SSL directories...
if not exist ssl mkdir ssl

echo 🚀 Starting services...
docker compose -f docker-compose.prod.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start services
    exit /b 1
)

echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak

echo ✅ Checking service health...

echo Checking services health... (wait 15 seconds)
timeout /t 15 /nobreak

echo.
echo 🎉 Deployment complete!
echo.
echo Services running at:
echo   - Frontend: http://localhost:80
echo   - Backend API: http://localhost:5000
echo   - AI Service: http://localhost:8000
echo   - MongoDB: localhost:27017
echo.
echo Next steps:
echo 1. Configure your domain's DNS to point to this server
echo 2. Setup SSL certificates (Let's Encrypt)
echo 3. Update Nginx configuration with SSL
echo 4. Restart Nginx with SSL config
echo.
echo View logs: docker compose -f docker-compose.prod.yml logs -f
echo Stop services: docker compose -f docker-compose.prod.yml down

endlocal
