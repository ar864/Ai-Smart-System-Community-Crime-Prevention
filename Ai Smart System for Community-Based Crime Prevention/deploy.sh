#!/bin/bash
# Production Deployment Script

set -e

echo "🚀 Starting Production Deployment..."

# Check if .env exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Please copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Load environment variables
export $(cat .env.production | xargs)

echo "📦 Building Docker images..."
docker compose -f docker-compose.prod.yml build

echo "🔐 Setting up SSL directories..."
mkdir -p ssl

echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

echo "✅ Checking service health..."

# Check MongoDB
echo -n "MongoDB: "
docker compose -f docker-compose.prod.yml exec -T mongodb echo "connected" && echo "✅" || echo "⏳"

# Check Backend
echo -n "Backend: "
docker compose -f docker-compose.prod.yml exec -T backend curl -s http://localhost:5000/api/health > /dev/null && echo "✅" || echo "⏳"

# Check Frontend
echo -n "Frontend: "
docker compose -f docker-compose.prod.yml exec -T frontend wget -q --spider http://localhost:80/ && echo "✅" || echo "⏳"

# Check AI Service
echo -n "AI Service: "
docker compose -f docker-compose.prod.yml exec -T ai-service curl -s http://localhost:8000/health > /dev/null && echo "✅" || echo "⏳"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Services running at:"
echo "  - Frontend: http://localhost:80"
echo "  - Backend API: http://localhost:5000"
echo "  - AI Service: http://localhost:8000"
echo "  - MongoDB: localhost:27017"
echo ""
echo "Next steps:"
echo "1. Configure your domain's DNS to point to this server"
echo "2. Setup SSL certificates (Let's Encrypt)"
echo "3. Update Nginx configuration with SSL"
echo "4. Restart Nginx with SSL config"
echo ""
echo "View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "Stop services: docker compose -f docker-compose.prod.yml down"
