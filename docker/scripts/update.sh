#!/bin/bash

# Load environment variables
set -a
source ../../.env
set +a

# Pull latest changes from GitLab
git pull origin main

# Rebuild and restart containers
docker-compose -f ../config/docker-compose.yml up -d --build

echo "Update completed successfully!"