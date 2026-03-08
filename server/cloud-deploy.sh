#!/usr/bin/env bash
set -euo pipefail

# Maraya Storyteller - Cloud Run Deployment Script
# Usage:
#   GEMINI_API_KEY=xxx ./server/cloud-deploy.sh
# Optional overrides:
#   PROJECT_ID=my-gcp-project SERVICE_NAME=maraya-storyteller REGION=europe-west1 ./server/cloud-deploy.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
SERVICE_NAME="${SERVICE_NAME:-maraya-storyteller}"
REGION="${REGION:-europe-west1}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
GEMINI_TEXT_MODEL="${GEMINI_TEXT_MODEL:-gemini-2.5-flash}"
GEMINI_REQUEST_TIMEOUT_MS="${GEMINI_REQUEST_TIMEOUT_MS:-15000}"
GEMINI_MAX_RETRIES="${GEMINI_MAX_RETRIES:-2}"
PERSISTENCE_BACKEND="${PERSISTENCE_BACKEND:-firestore}"
DUO_RECONNECT_GRACE_MS="${DUO_RECONNECT_GRACE_MS:-60000}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "ERROR: PROJECT_ID is empty. Set it or run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

if [[ -z "${GEMINI_API_KEY}" ]]; then
  echo "ERROR: GEMINI_API_KEY is required. Run with:"
  echo "   GEMINI_API_KEY=your_key_here ./server/cloud-deploy.sh"
  exit 1
fi

IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "Deploying ${SERVICE_NAME} to Cloud Run"
echo "   PROJECT_ID=${PROJECT_ID}"
echo "   REGION=${REGION}"

echo "Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

echo "Building container image with Cloud Build..."
gcloud builds submit "${REPO_ROOT}" \
  --config "${REPO_ROOT}/server/cloudbuild-buildonly.yaml" \
  --substitutions "_SERVICE_NAME=${SERVICE_NAME}"

echo "Deploying service..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},GEMINI_TEXT_MODEL=${GEMINI_TEXT_MODEL},GEMINI_REQUEST_TIMEOUT_MS=${GEMINI_REQUEST_TIMEOUT_MS},GEMINI_MAX_RETRIES=${GEMINI_MAX_RETRIES},PERSISTENCE_BACKEND=${PERSISTENCE_BACKEND},DUO_RECONNECT_GRACE_MS=${DUO_RECONNECT_GRACE_MS}" \
  --timeout 900 \
  --session-affinity

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')"

echo "Deployment complete"
echo "SERVICE_URL=${SERVICE_URL}"
echo "HEALTH_CHECK=${SERVICE_URL}/health"
