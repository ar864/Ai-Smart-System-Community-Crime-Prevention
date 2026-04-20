# HTTPS Deployment Guide - AI Smart Crime Prevention System

Deploy your application with HTTPS to the internet using one of these methods.

---

## 🚀 Option 1: Railway.app (Recommended - Easiest)

Railway.app automatically provides HTTPS and is perfect for beginners.

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/crime-prevention.git
git push -u origin main
```

### Step 2: Connect to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects services:
   - Backend (Node.js)
   - Frontend (Vite)
   - MongoDB (auto-provision)
   - AI Service (Python)

### Step 3: Configure Environment Variables

For each service in Railway:

**Backend:**
```
PORT=5000
NODE_ENV=production
JWT_SECRET=generate-strong-secret-key
MONGODB_URI=From Railway MongoDB service
AI_SERVICE_URL=From AI Service Domain
```

**AI Service:**
```
ENVIRONMENT=production
WORKERS=4
```

**Frontend:**
- No env vars needed (builds automatically)

### Step 4: Access Your App

Your HTTPS URLs will be:
- **Frontend**: `https://crime-frontend-prod-xxxx.railway.app`
- **Backend API**: `https://crime-backend-prod-xxxx.railway.app`
- **AI Service**: `https://crime-ai-prod-xxxx.railway.app`

Done! ✅

---

## 🚀 Option 2: Render.com (Free Tier Available)

### Step 1: Push to GitHub (same as Railway)

### Step 2: Create Services on Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository

**For Backend:**
- **Repository**: Your GitHub repo
- **Runtime**: Node
- **Build Command**: `npm install --workspaces`
- **Start Command**: `npm run start --workspace backend`
- **Environment Variables**:
  ```
  NODE_ENV=production
  MONGODB_URI=From MongoDB Atlas
  JWT_SECRET=your-secret
  AI_SERVICE_URL=https://crime-ai-prod-xxxx.onrender.com
  ```

**For Frontend:**
- **Runtime**: Static Site (Vite)
- **Build Command**: `npm install --workspaces && npm run build --workspace frontend`
- **Publish Directory**: `frontend/dist`

**For AI Service:**
- **Runtime**: Python
- **Build Command**: `pip install -r ai-service/requirements.txt`
- **Start Command**: `gunicorn --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 ai-service.app.main:app`

3. MongoDB: Use MongoDB Atlas (free tier at [mongodb.com/cloud](https://www.mongodb.com/cloud))

### Step 3: Configure Custom Domain (Optional)

In Render Dashboard:
- Settings → Custom Domain
- Add your domain: `yourdomain.com`
- Add DNS records as shown

---

## 🚀 Option 3: DigitalOcean App Platform (Best for Control)

### Step 1: Create app.yaml

```yaml
name: crime-prevention-system
services:
  - name: frontend
    github:
      repo: YOUR-USERNAME/crime-prevention
      branch: main
    build_command: npm install --workspaces && npm run build --workspace frontend
    source_dir: frontend
    http_port: 80
    routes:
      - path: /
        destination_name: frontend
    envs:
      - key: VITE_API_URL
        value: /api

  - name: backend
    github:
      repo: YOUR-USERNAME/crime-prevention
      branch: main
    build_command: npm install --workspaces
    run_command: npm run start --workspace backend
    source_dir: backend
    http_port: 5000
    routes:
      - path: /api
        destination_name: backend
    envs:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${JWT_SECRET}
      - key: MONGODB_URI
        scope: RUN_AND_BUILD_TIME
        value: ${MONGODB_URI}
      - key: AI_SERVICE_URL
        value: https://yourdomain.com/ai

  - name: ai-service
    github:
      repo: YOUR-USERNAME/crime-prevention
      branch: main
    build_command: pip install -r requirements.txt
    run_command: gunicorn --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 app.main:app
    source_dir: ai-service
    http_port: 8000
    routes:
      - path: /ai
        destination_name: ai-service

databases:
  - name: mongodb
    engine: MONGODB
    version: "7"

domains:
  - domain: yourdomain.com
    type: PRIMARY
```

### Step 2: Deploy

```bash
# Install doctl CLI
# https://docs.digitalocean.com/reference/doctl/how-to/install/

doctl apps create --spec app.yaml
```

---

## 🚀 Option 4: AWS (Most Scalable)

### Step 1: Create EC2 Instance

```bash
# Launch Ubuntu 22.04 t3.medium instance
# Security Group: Allow HTTP (80), HTTPS (443), SSH (22)
```

### Step 2: SSH into Instance

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker ubuntu
```

### Step 4: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/crime-prevention.git
cd crime-prevention
```

### Step 5: Create .env File

```bash
# Edit environment variables
nano .env.production

# Add:
MONGO_USER=admin
MONGO_PASSWORD=strong-password-here
JWT_SECRET=your-super-secret-key
DOMAIN=yourdomain.com
```

### Step 6: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates at: /etc/letsencrypt/live/yourdomain.com/
```

### Step 7: Create Nginx Config with SSL

Create `nginx-ssl.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    client_max_body_size 20M;

    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /ai/ {
        proxy_pass http://ai-service:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /docs {
        proxy_pass http://ai-service:8000/docs;
        proxy_set_header Host $host;
    }
}
```

### Step 8: Update docker-compose.prod.yml

Add volumes section for SSL certificates:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro
```

### Step 9: Deploy

```bash
# Create .env file
cp .env.production .env

# Build and run
sudo docker compose -f docker-compose.prod.yml up -d

# View logs
sudo docker compose logs -f

# Setup auto-renewal for SSL
echo "0 3 * * * sudo certbot renew --quiet" | sudo crontab -
```

### Step 10: Point Your Domain

In your domain registrar (GoDaddy, Namecheap, etc.):
- A Record: `yourdomain.com` → Your EC2 Public IP
- CNAME Record: `www.yourdomain.com` → `yourdomain.com`

Your app is now at:
- **Frontend**: `https://yourdomain.com`
- **API**: `https://yourdomain.com/api`
- **AI Docs**: `https://yourdomain.com/docs`

---

## 🚀 Option 5: DigitalOcean Droplets (Similar to AWS)

```bash
# Create Droplet with Docker pre-installed
# Then follow AWS steps above

# Alternative: Use DigitalOcean App Platform (simpler)
doctl apps create --spec app.yaml
```

---

## 📋 Comparison Table

| Platform | Cost | Ease | HTTPS | Scalability |
|----------|------|------|-------|-------------|
| Railway | $7+/mo | ⭐⭐⭐⭐⭐ | Auto ✅ | Good |
| Render | Free | ⭐⭐⭐⭐ | Auto ✅ | Good |
| DigitalOcean | $5+/mo | ⭐⭐⭐ | Manual | Excellent |
| AWS | $20+/mo | ⭐⭐⭐ | Manual | Excellent |
| Self-hosted | $3+/mo | ⭐⭐ | Let's Encrypt | Excellent |

---

## ✅ Verification Checklist

After deployment, test everything:

```bash
# Test Frontend
curl -I https://yourdomain.com

# Test Backend API
curl https://yourdomain.com/api/health

# Test AI Service
curl https://yourdomain.com/ai/health

# Check SSL Certificate
openssl s_client -connect yourdomain.com:443

# Check SSL Grade
# Visit: https://www.ssllabs.com/ssltest/
```

---

## 🔒 Security Best Practices

1. **Change default credentials**
   ```bash
   MONGO_PASSWORD=generate-strong-random-password
   JWT_SECRET=another-random-secret
   ```

2. **Enable CORS restrictions**
   - Only allow your domain

3. **Setup firewall rules**
   - Only allow necessary ports (80, 443, 22)

4. **Enable backups**
   - Automatic MongoDB backups
   - Daily snapshots of database

5. **Monitor logs**
   - Check application logs daily
   - Setup alerts for errors

6. **Keep SSL updated**
   - Let's Encrypt auto-renewal
   - Monitor certificate expiration

---

## 🐛 Troubleshooting

### 503 Bad Gateway (Nginx → Backend)
```bash
# Check backend is running
docker compose logs backend

# Verify internal network
docker network ls
docker inspect crime-network
```

### SSL Certificate Error
```bash
# Check certificate validity
certbot certificates

# Renew if expiring
sudo certbot renew --force-renewal
```

### MongoDB Connection Failed
```bash
# Check MongoDB
docker compose logs mongodb

# Restart MongoDB
docker compose restart mongodb

# Check logs
docker exec crime-prevention-mongo mongosh
```

### High Memory Usage
```bash
# Monitor resources
docker stats

# Reduce workers
# In docker-compose: workers=2 instead of 4

# Restart services
docker compose restart
```

---

## 📞 Support

For detailed guides:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- AWS: https://docs.aws.amazon.com
- DigitalOcean: https://docs.digitalocean.com

---

## 🎉 Final URLs

Your application will be accessible at:

```
🌐 Frontend: https://yourdomain.com
📡 Backend API: https://yourdomain.com/api
🤖 AI Service: https://yourdomain.com/ai
📚 API Docs: https://yourdomain.com/docs
```

Share `https://yourdomain.com` with everyone! 🚀
