#!/usr/bin/env bash
#
# Deploy Artifact A (Spotify Review RAG, Next.js 16) to Google Cloud Run.
# Mirrors the aiInterview backend deploy flow, adapted for a Node/Next.js image.
#
#   ./deploy.sh
#   PROJECT_ID=my-proj REGION=asia-south1 ./deploy.sh
#
# Reads env vars (OPENAI_API_KEY, DEFAULT_MODEL, ...) from .env.local and
# injects them into Cloud Run. .env.local is NEVER baked into the image.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_ID="${PROJECT_ID:-pythonlearn-407205}"
SERVICE_NAME="${SERVICE_NAME:-artifact-a-rag}"
REGION="${REGION:-asia-south1}"
AR_REPOSITORY="${AR_REPOSITORY:-prototypes}"
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/.env.local}"
TAG="${TAG:-$(git -C "${SCRIPT_DIR}" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
ALLOW_UNAUTHENTICATED="${ALLOW_UNAUTHENTICATED:-true}"
RUN_SMOKE_TEST="${RUN_SMOKE_TEST:-true}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${SERVICE_NAME}:${TAG}"

required_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: $1 is not installed or not on PATH." >&2
    exit 1
  fi
}

trim() { sed 's/^[[:space:]]*//; s/[[:space:]]*$//'; }

# Convert a KEY=value .env file into a gcloud --env-vars-file YAML.
# Skips comments, blanks, PORT (Cloud Run reserved), and NEXT_PUBLIC_* client vars.
write_env_yaml() {
  local source_file="$1" output_file="$2"
  echo "# Generated from ${source_file}" > "$output_file"

  while IFS= read -r raw_line || [ -n "$raw_line" ]; do
    local line key value escaped_value
    line="${raw_line%$'\r'}"

    case "$line" in ""|"#"*) continue ;; esac
    [[ "$line" == export\ * ]] && line="${line#export }"
    [[ "$line" != *=* ]] && continue

    key="$(printf '%s' "${line%%=*}" | trim)"
    value="$(printf '%s' "${line#*=}" | trim)"
    [ -z "$key" ] && continue

    case "$key" in
      PORT) echo "Skipping Cloud Run reserved env var: ${key}" >&2; continue ;;
      NEXT_PUBLIC_*) echo "Skipping client-exposed env var: ${key}" >&2; continue ;;
    esac

    # Strip a single layer of surrounding quotes.
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    escaped_value="$(printf '%s' "$value" | sed "s/'/''/g")"
    printf "%s: '%s'\n" "$key" "$escaped_value" >> "$output_file"
  done < "$source_file"
}

required_command gcloud

if [ ! -f "${SCRIPT_DIR}/Dockerfile" ] || [ ! -f "${SCRIPT_DIR}/package.json" ]; then
  echo "Error: expected Dockerfile and package.json in ${SCRIPT_DIR}." >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: ${ENV_FILE} not found. Copy .env.example to .env.local first." >&2
  exit 1
fi

TMP_ENV_YAML="$(mktemp "/tmp/${SERVICE_NAME}-env.XXXXXX")"
trap 'rm -f "$TMP_ENV_YAML"' EXIT
write_env_yaml "$ENV_FILE" "$TMP_ENV_YAML"

echo "Enabling required GCP services..."
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  --project "$PROJECT_ID"

if ! gcloud artifacts repositories describe "$AR_REPOSITORY" \
  --project "$PROJECT_ID" --location "$REGION" >/dev/null 2>&1; then
  echo "Creating Artifact Registry repository: ${AR_REPOSITORY}"
  gcloud artifacts repositories create "$AR_REPOSITORY" \
    --project "$PROJECT_ID" --location "$REGION" \
    --repository-format docker \
    --description "Prototype container images"
fi

echo "Building and uploading image..."
echo "Project:    ${PROJECT_ID}"
echo "Service:    ${SERVICE_NAME}"
echo "Region:     ${REGION}"
echo "Image:      ${IMAGE}"
echo "Env file:   ${ENV_FILE}"

# Builds using the Dockerfile in SCRIPT_DIR (the build context).
gcloud builds submit "$SCRIPT_DIR" \
  --project "$PROJECT_ID" \
  --tag "$IMAGE"

AUTH_FLAG="--allow-unauthenticated"
[ "$ALLOW_UNAUTHENTICATED" != "true" ] && AUTH_FLAG="--no-allow-unauthenticated"

echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --image "$IMAGE" \
  --port 8080 \
  --memory "${MEMORY:-1Gi}" \
  --cpu "${CPU:-1}" \
  --min-instances "${MIN_INSTANCES:-0}" \
  --max-instances "${MAX_INSTANCES:-1}" \
  --env-vars-file "$TMP_ENV_YAML" \
  "$AUTH_FLAG"

SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --project "$PROJECT_ID" --region "$REGION" \
  --format 'value(status.url)')"

if [ "$RUN_SMOKE_TEST" = "true" ] && command -v curl >/dev/null 2>&1; then
  echo "Smoke test: ${SERVICE_URL}/api/health"
  curl --fail --silent --show-error "${SERVICE_URL}/api/health" >/dev/null \
    && echo "  health OK"
fi

echo
echo "Deployment complete."
echo "Service URL: ${SERVICE_URL}"
echo "Verify:  ${SERVICE_URL}/  ${SERVICE_URL}/ask  ${SERVICE_URL}/api/health"
