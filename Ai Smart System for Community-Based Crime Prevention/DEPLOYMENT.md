# Deployment Guide - AI Smart System for Community-Based Crime Prevention

This guide covers deployment for local development, Docker-based deployment, and production environments.

## Prerequisites

- **Node.js** 18+ (for backend and frontend)
- **Python** 3.9+ (for AI service)
- **Docker & Docker Compose** (for containerized deployment)
- **MongoDB** (via Docker or standalone)
- **Git** (for version control)

---

## 1. Local Development Setup

### 1.1 Clone and Install Dependencies

```bash
# Navigate to project root
cd "Ai Smart System for Community-Based Crime Prevention"

# Install all dependencies for backend and frontend
npm install:all
```

### 1.2 Start MongoDB

```bash
# Start MongoDB container in background
docker compose up -d

# Verify MongoDB is running
docker ps
```

### 1.3 Configure Backend Environment Variables

Create `backend/.env` file (or copy from `backend/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crime-prevention
NODE_ENV=development
JWT_SECRET=your-secret-key-here
AI_SERVICE_URL=http://localhost:8000
```

### 1.4 Start All Services

**Option A: Run Frontend & Backend Together**

```bash
# From project root - runs both on concurrent processes
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

**Option B: Run Services Separately**

Terminal 1 - Backend:
```bash
npm run dev:backend
# Backend: http://localhost:5000
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
# Frontend: http://localhost:5173
```

### 1.5 Start AI Service (Separate Terminal)

```bash
cd ai-service

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload

# AI Service: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 1.6 Verify All Services

- **Frontend**: http://localhost:5173 (React Vite app)
- **Backend**: http://localhost:5000 (Express API)
- **AI Service**: http://localhost:8000 (FastAPI)
- **MongoDB**: localhost:27017

Test backend health:
```bash
curl http://localhost:5000/api/health
```

Test AI service health:
```bash
curl http://localhost:8000/health
```

---

## 2. Docker Deployment

### 2.1 Build Docker Images

```bash
# Build all images
docker compose build

# Or build specific services
docker compose build backend
docker compose build ai-service
```

### 2.2 Run with Docker Compose

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f mongodb
```

### 2.3 Verify Deployment

```bash
# Check running containers
docker compose ps

# Access services
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# AI Service: http://localhost:8000
# MongoDB: localhost:27017
```

### 2.4 Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (careful - removes data)
docker compose down -v
```

---

## 3. Production Deployment

### 3.1 Prepare for Production

#### Backend (Node.js + Express)

Create `backend/.env.production`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/crime-prevention
NODE_ENV=production
JWT_SECRET=strong-secret-key-for-production
AI_SERVICE_URL=https://ai-service.yourdomain.com
```

#### AI Service (Python FastAPI)

Create `ai-service/.env`:
```env
ENVIRONMENT=production
WORKERS=4
```

### 3.2 Deploy to Heroku, AWS, or Cloud Platform

#### Option A: Heroku Deployment

**For Backend:**
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-url"
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

**For AI Service:**
```bash
# Create second Heroku app for AI service
heroku create your-ai-service-name

# Deploy
git push heroku main
```

#### Option B: AWS EC2/ECS Deployment

```bash
# Build images
docker build -t backend:latest ./backend
docker build -t ai-service:latest ./ai-service
docker build -t frontend:latest ./frontend

# Push to ECR
aws ecr create-repository --repository-name ai-crime-backend
aws ecr create-repository --repository-name ai-crime-ai-service

docker tag backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ai-crime-backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/ai-crime-backend:latest
```

#### Option C: Google Cloud Run

```bash
# Build and deploy backend
gcloud run deploy crime-backend \
  --source . \
  --region us-central1 \
  --set-env-vars MONGODB_URI="your-mongodb-url",JWT_SECRET="your-secret"

# Build and deploy AI service
gcloud run deploy crime-ai-service \
  --source ./ai-service \
  --region us-central1
```

### 3.3 Database Migration (MongoDB)

```bash
# Backup local database
mongodump --uri "mongodb://localhost:27017/crime-prevention" --out backup/

# Import to production
mongorestore --uri "mongodb+srv://user:password@cluster.mongodb.net/crime-prevention" backup/

# Or use MongoDB Atlas UI for management
```

### 3.4 SSL/TLS Certificate Setup

For HTTPS with Let's Encrypt:

```bash
# Using Nginx as reverse proxy
sudo apt-get install nginx certbot python3-certbot-nginx

# Obtain certificate
sudo certbot certonly --nginx -d yourdomain.com

# Configure Nginx for reverse proxy
```

Example Nginx config (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    location /api {
        proxy_pass http://localhost:5000;
    }

    location /ai {
        proxy_pass http://localhost:8000;
    }
}
```

---

## 4. Environment-Specific Configuration

### Development
- Hot reload enabled
- Debug logging enabled
- Local MongoDB
- CORS permissive

### Staging
- MongoDB Atlas cluster
- Real SSL certificates
- Limited logging
- Controlled access

### Production
- Managed MongoDB (Atlas/AWS)
- Full SSL/TLS
- Minimal logging (performance)
- Rate limiting & security headers
- Monitoring & alerting enabled

---

## 5. Monitoring & Logs

### Monitor Services

```bash
# Check backend logs
docker compose logs -f backend

# Check AI service logs
docker compose logs -f ai-service

# Check MongoDB logs
docker compose logs -f mongodb

# Monitor resource usage
docker stats
```

### PM2 Process Manager (Production Alternative)

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start backend/src/server.js --name "crime-backend"

# Start AI service
pm2 start ai-service/app/main.py --interpreter python --name "crime-ai"

# View logs
pm2 logs

# Monitor
pm2 monit
```

---

## 6. Database Backup & Recovery

```bash
# Daily backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mongodump --uri "$MONGODB_URI" --out "$BACKUP_DIR/backup_$TIMESTAMP"

# Keep only last 7 backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

# Make executable and add to crontab
chmod +x backup.sh
# Add to crontab: 0 2 * * * /path/to/backup.sh
```

---

## 7. Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
mongo "mongodb://localhost:27017/crime-prevention"

# Check if MongoDB is running
docker compose ps mongodb

# Restart MongoDB
docker compose restart mongodb
```

### Backend Not Starting
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process using port
kill -9 <PID>

# Check logs
npm run dev
```

### AI Service Not Responding
```bash
# Verify Python environment activated
which python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Start with verbose logging
uvicorn app.main:app --reload --log-level debug
```

### Frontend Blank Page
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf frontend/.vite
npm run dev:frontend
```

---

## 8. Performance Optimization

- **Frontend**: Enable Vite production build
- **Backend**: Use connection pooling for MongoDB
- **AI Service**: Use multiple workers with Gunicorn
- **Database**: Add indexes for frequently queried fields
- **Caching**: Implement Redis for session management

---

## 9. Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS/SSL in production
- [ ] Implement rate limiting on API endpoints
- [ ] Add CORS restrictions
- [ ] Use environment variables for secrets
- [ ] Enable logging for audit trail
- [ ] Implement input validation
- [ ] Regular security updates for dependencies

---

## Quick Start Commands

```bash
# Development (All services)
npm install:all && docker compose up -d && npm run dev

# Docker only
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f
```

---

For more details on specific components, refer to individual README files in `backend/`, `frontend/`, and `ai-service/` directories.
