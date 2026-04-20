#!/bin/bash

# Production HTTPS Deployment Guide
# This script helps set up HTTPS with Let's Encrypt and deploy to a cloud server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}AI Crime Prevention System - HTTPS Setup${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if running on a server (not local)
if [[ "$HOSTNAME" == "localhost" || "$HOSTNAME" == "127.0.0.1" ]]; then
    echo -e "${YELLOW}Warning: This script should run on a production server, not localhost${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

# Step 2: Install required tools
echo -e "${YELLOW}Step 2: Installing required tools...${NC}"
sudo apt-get install -y \
    curl \
    wget \
    git \
    certbot \
    python3-certbot-nginx \
    nginx \
    docker.io \
    docker-compose

# Step 3: Start Docker
echo -e "${YELLOW}Step 3: Starting Docker daemon...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (optional - for running docker without sudo)
sudo usermod -aG docker $USER

# Step 4: Clone/Pull repository
echo -e "${YELLOW}Step 4: Setting up application repository...${NC}"
if [ ! -d "crime-prevention" ]; then
    echo "Clone your repository here or run: git clone <your-repo-url>"
    mkdir -p crime-prevention
    cd crime-prevention
else
    cd crime-prevention
    git pull origin main
fi

# Step 5: Setup environment variables
echo -e "${YELLOW}Step 5: Setting up environment variables...${NC}"
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production 2>/dev/null || cp .env.production .env.production
    echo -e "${RED}⚠️  Please edit .env.production with your credentials${NC}"
    read -p "Open .env.production in editor? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano .env.production
    fi
fi

# Load environment variables
export $(cat .env.production | grep -v '#' | xargs)

# Step 6: Setup Nginx
echo -e "${YELLOW}Step 6: Configuring Nginx for HTTPS...${NC}"

# Create Nginx servers directory
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Create SSL directory
mkdir -p ./ssl

# Step 7: Obtain SSL Certificate with Let's Encrypt
echo -e "${YELLOW}Step 7: Obtaining SSL certificate from Let's Encrypt...${NC}"
read -p "Enter your domain (e.g., yourdomain.com): " DOMAIN
read -p "Enter your email for Let's Encrypt: " EMAIL

# Ensure port 80 is accessible for Let's Encrypt validation
echo -e "${YELLOW}Make sure port 80 is open for Let's Encrypt certificate validation${NC}"
read -p "Is port 80 open? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop any existing Nginx
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Obtain certificate
    sudo certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --preferred-challenges http
    
    # Copy certificates to project
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
    sudo chown $USER:$USER ./ssl/*
    
    echo -e "${GREEN}✓ SSL certificates obtained successfully${NC}"
else
    echo -e "${RED}Please open port 80 and run certificate setup manually${NC}"
fi

# Step 8: Create Nginx configuration with SSL
echo -e "${YELLOW}Step 8: Creating Nginx HTTPS configuration...${NC}"

cat > nginx-ssl.conf << EOF
upstream backend {
    server backend:5000;
}

upstream frontend {
    server frontend:80;
}

upstream ai_service {
    server ai-service:8000;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 20M;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 20M;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Security headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript;

    # Frontend - Root
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # AI Service
    location /ai/ {
        proxy_pass http://ai_service/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
    }

    # API documentation
    location /docs {
        proxy_pass http://ai_service/docs;
        proxy_set_header Host \$host;
    }

    location /openapi.json {
        proxy_pass http://ai_service/openapi.json;
        proxy_set_header Host \$host;
    }

    # Health check endpoints
    location /health {
        access_log off;
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}
EOF

# Step 9: Build and start Docker containers
echo -e "${YELLOW}Step 9: Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${YELLOW}Step 10: Starting services with Docker Compose...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Step 11: Setup Nginx
echo -e "${YELLOW}Step 11: Configuring Nginx...${NC}"
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
sudo cp nginx-ssl.conf /etc/nginx/sites-available/crime-prevention.conf
sudo ln -sf /etc/nginx/sites-available/crime-prevention.conf /etc/nginx/sites-enabled/

# Copy SSL certificates to Nginx
sudo mkdir -p /etc/nginx/ssl
sudo cp ./ssl/fullchain.pem /etc/nginx/ssl/
sudo cp ./ssl/privkey.pem /etc/nginx/ssl/
sudo chown -R www-data:www-data /etc/nginx/ssl

# Test and start Nginx
sudo nginx -t
sudo systemctl restart nginx

# Step 12: Setup automatic certificate renewal
echo -e "${YELLOW}Step 12: Setting up automatic certificate renewal...${NC}"

# Create renewal hook script
cat > renewal-hook.sh << 'EOF'
#!/bin/bash
# Copy renewed certificates
cp /etc/letsencrypt/live/$1/fullchain.pem /opt/crime-prevention/ssl/
cp /etc/letsencrypt/live/$1/privkey.pem /opt/crime-prevention/ssl/
sudo cp /etc/letsencrypt/live/$1/fullchain.pem /etc/nginx/ssl/
sudo cp /etc/letsencrypt/live/$1/privkey.pem /etc/nginx/ssl/
sudo systemctl reload nginx
EOF

chmod +x renewal-hook.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --post-hook 'systemctl reload nginx' >> /var/log/letsencrypt-renew.log 2>&1") | crontab -

# Step 13: Verify deployment
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}✓ Services running:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}✓ Access your application:${NC}"
echo -e "  🌐 Frontend: ${YELLOW}https://$DOMAIN${NC}"
echo -e "  🔌 Backend: ${YELLOW}https://$DOMAIN/api${NC}"
echo -e "  🤖 AI Service: ${YELLOW}https://$DOMAIN/ai${NC}"
echo -e "  📚 API Docs: ${YELLOW}https://$DOMAIN/docs${NC}"

echo -e "\n${GREEN}✓ SSL Certificate:${NC}"
echo -e "  Expires: $(sudo certbot certificates | grep Expiration)"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Update DNS records to point to this server:"
echo -e "     $DOMAIN -> $(curl -s https://checkip.amazonaws.com)"
echo -e "  2. Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  3. Backup MongoDB: ./backup.sh"

echo -e "\n${YELLOW}Useful commands:${NC}"
echo -e "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  Stop services: docker-compose -f docker-compose.prod.yml down"
echo -e "  Restart service: docker-compose -f docker-compose.prod.yml restart <service>"
echo -e "  Check SSL: echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates"
