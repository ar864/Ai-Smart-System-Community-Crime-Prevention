#!/bin/bash

# Deploy to DigitalOcean App Platform
# Requires: doctl CLI installed and authenticated

APP_NAME="crime-prevention"
REGION="nyc"

echo "Deploying to DigitalOcean App Platform..."

# Create app spec file
cat > app-spec.yaml << 'EOF'
name: crime-prevention
services:
- github:
    branch: main
    repo: your-username/your-repo
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    scope: UNSET
  - key: MONGODB_URI
    scope: UNSET
  http_port: 5000
  instance_count: 1
  instance_size_slug: basic-s
  name: backend
  source_dir: backend

- name: frontend
  github:
    branch: main
    repo: your-username/your-repo
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-s
  source_dir: frontend

databases:
- engine: MONGODB
  name: crime-db
  production: true
  version: "6"
EOF

# Deploy
doctl apps create --spec app-spec.yaml

echo "✓ Deployment initiated on DigitalOcean"
echo "View progress at: https://cloud.digitalocean.com/apps"
