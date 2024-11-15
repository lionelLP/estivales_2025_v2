#!/bin/bash

# Load environment variables
set -a
source ../../.env
set +a

# Pull latest changes from GitLab
git pull origin main

# Build the Docker image
docker-compose -f ../config/docker-compose.yml build

# Stop running containers
docker-compose -f ../config/docker-compose.yml down

# Start the containers in detached mode
docker-compose -f ../config/docker-compose.yml up -d

# Remove unused images
docker image prune -f

echo "Deployment completed successfully!"