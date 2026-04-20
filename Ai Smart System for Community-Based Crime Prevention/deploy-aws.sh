#!/bin/bash

# Deploy to AWS EC2
# Prerequisites: AWS CLI configured, EC2 instance running

INSTANCE_IP="your-instance-ip"
KEY_PAIR="path/to/your-key.pem"
USER="ubuntu"  # or "ec2-user" for Amazon Linux

echo "Deploying to AWS EC2..."

# SSH and setup
ssh -i $KEY_PAIR $USER@$INSTANCE_IP << 'EOF'
    # Update system
    sudo yum update -y
    
    # Install Docker and Docker Compose
    sudo amazon-linux-extras install docker -y
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Clone repository
    cd /opt
    sudo git clone your-repo-url crime-prevention
    cd crime-prevention
    
    # Setup environment
    sudo cp .env.production.example .env.production
    
    # Start services
    sudo docker-compose -f docker-compose.prod.yml up -d
EOF

echo "✓ Deployed to AWS EC2 at $INSTANCE_IP"
