#!/usr/bin/env bash
set -euo pipefail

# Usage: RENDER_API_KEY=your_key ./deploy_render_backend.sh
# This script calls Render API to create a Docker web service for the backend
# and waits briefly for the service to be created and the deploy to start.
# It will not print your API key.

API_HOST="https://api.render.com"
REPO="RajAgarwal0108/SpiritualConnect"
BRANCH="main"
ROOT_DIR="backend"
SERVICE_NAME="spiritualconnect-backend"
DOCKERFILE_PATH="Dockerfile"
PLAN="free"
AUTO_DEPLOY=true

if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "Error: set RENDER_API_KEY environment variable before running."
  exit 1
fi

AUTH_HEADER="Authorization: Bearer ${RENDER_API_KEY}"

echo "Creating Render service: $SERVICE_NAME (repo: $REPO/$BRANCH, root: $ROOT_DIR)..."

create_payload=$(cat <<JSON
{
  "name": "$SERVICE_NAME",
  "repo": "https://github.com/$REPO",
  "branch": "$BRANCH",
  "rootDirectory": "$ROOT_DIR",
  "env": "docker",
  "dockerfilePath": "$DOCKERFILE_PATH",
  "plan": "$PLAN",
  "autoDeploy": $AUTO_DEPLOY,
  "type": "web_service"
}
JSON
)

# create service
resp=$(curl -sS -X POST "$API_HOST/v1/services" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "$create_payload")

echo "Response from create service:"
echo "$resp" | sed -n '1,200p'

service_id=$(echo "$resp" | sed -n '1,200p' | jq -r '.id // empty')

if [ -z "$service_id" ]; then
  echo "Failed to create service. See response above for details."
  exit 1
fi

echo "Service created with id: $service_id"
echo "Waiting 10s for deploy to start..."
sleep 10

# show deploys
curl -sS "$API_HOST/v1/services/$service_id/deploys" -H "$AUTH_HEADER" | jq '.'
echo "Done. Visit Render dashboard to watch build logs and add secrets."