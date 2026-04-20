#!/bin/bash

# Deploy to Heroku
# Prerequisites: Heroku CLI installed and authenticated

APP_NAME="crime-prevention"

echo "Deploying to Heroku..."

# Create Heroku apps
heroku create $APP_NAME-backend
heroku create $APP_NAME-ai
heroku create $APP_NAME-frontend

# Setup MongoDB Atlas
echo "Set MongoDB Atlas connection string in Heroku config"
heroku config:set MONGODB_URI="mongodb+srv://..." -a $APP_NAME-backend

# Deploy backend
git subtree push --prefix backend heroku main

# Deploy AI service
git subtree push --prefix ai-service heroku main

# Deploy frontend
git subtree push --prefix frontend heroku main

echo "✓ Deployed to Heroku"
echo "Apps:"
echo "  Backend: https://$APP_NAME-backend.herokuapp.com"
echo "  AI Service: https://$APP_NAME-ai.herokuapp.com"
echo "  Frontend: https://$APP_NAME-frontend.herokuapp.com"
