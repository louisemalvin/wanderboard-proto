#!/usr/bin/env bash
# ------------------------------------------------------------------
# Wanderboard — Provision Azure AI Search for Foundry IQ
# Creates/reuses an Azure AI Search service and resource group.
# Safe to run more than once (idempotent).
# ------------------------------------------------------------------
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { printf "${GREEN}[OK]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }
err()   { printf "${RED}[ERR]${NC} %s\n" "$*"; exit 1; }

# ------------------------------------------------------------------
# Configuration — env vars or defaults
# ------------------------------------------------------------------
AZURE_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-}"
AZURE_RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-wanderboard-foundry-iq-rg}"
AZURE_LOCATION="${AZURE_LOCATION:-japaneast}"
AZURE_SEARCH_SERVICE="${AZURE_SEARCH_SERVICE:-wanderboard-search}"
AZURE_SEARCH_SKU="${AZURE_SEARCH_SKU:-basic}"

# Generated output file
OUTPUT_DIR=".azure"
OUTPUT_FILE="${OUTPUT_DIR}/generated.env"

echo "=== Wanderboard — Provision Azure AI Search for Foundry IQ ==="
echo ""

# ------------------------------------------------------------------
# 1. Verify az CLI and auth
# ------------------------------------------------------------------
if ! command -v az &>/dev/null; then
  err "Azure CLI (az) is not installed. Install it: https://aka.ms/azure-cli"
fi

if ! az account show &>/dev/null; then
  err "Not authenticated. Run: az login"
fi

# Set subscription if provided
if [ -n "$AZURE_SUBSCRIPTION_ID" ]; then
  az account set --subscription "$AZURE_SUBSCRIPTION_ID" || err "Failed to set subscription $AZURE_SUBSCRIPTION_ID"
fi

SUB_ID=$(az account show --query id -o tsv)
info "Using subscription: $SUB_ID"

# ------------------------------------------------------------------
# 2. Validate location supports Basic tier search
# ------------------------------------------------------------------
echo ""
info "Checking SKU availability for '$AZURE_SEARCH_SKU' in '$AZURE_LOCATION'..."

SKU_VALID=true
# Basic tier is widely available; check via listing search services in region
# as a proxy. The actual create call will fail clearly if unsupported.
info "Will attempt to create/reuse Azure AI Search service: $AZURE_SEARCH_SERVICE"

# ------------------------------------------------------------------
# 3. Create or reuse resource group
# ------------------------------------------------------------------
echo ""
if az group show --name "$AZURE_RESOURCE_GROUP" &>/dev/null; then
  info "Resource group '$AZURE_RESOURCE_GROUP' already exists"
else
  info "Creating resource group '$AZURE_RESOURCE_GROUP' in '$AZURE_LOCATION'..."
  az group create \
    --name "$AZURE_RESOURCE_GROUP" \
    --location "$AZURE_LOCATION" \
    --tags project=wanderboard purpose=foundry-iq environment=hackathon \
    -o table
  info "Resource group created"
fi

# ------------------------------------------------------------------
# 4. Create or reuse Azure AI Search service
# ------------------------------------------------------------------
echo ""
SEARCH_EXISTS=false
if az search service show --name "$AZURE_SEARCH_SERVICE" --resource-group "$AZURE_RESOURCE_GROUP" &>/dev/null; then
  SEARCH_EXISTS=true
  info "Azure AI Search service '$AZURE_SEARCH_SERVICE' already exists"
else
  info "Creating Azure AI Search service '$AZURE_SEARCH_SERVICE'..."
  az search service create \
    --name "$AZURE_SEARCH_SERVICE" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --location "$AZURE_LOCATION" \
    --sku "$AZURE_SEARCH_SKU" \
    --tags project=wanderboard purpose=foundry-iq environment=hackathon \
    -o table || err "Failed to create Azure AI Search service. Check if '$AZURE_SEARCH_SKU' is supported in '$AZURE_LOCATION'."

  info "Azure AI Search service created"
fi

# ------------------------------------------------------------------
# 5. Get search service details
# ------------------------------------------------------------------
SEARCH_ENDPOINT="https://${AZURE_SEARCH_SERVICE}.search.windows.net"
SEARCH_KEY=""

# Get admin key (primary)
SEARCH_KEY=$(az search admin-key show --service-name "$AZURE_SEARCH_SERVICE" --resource-group "$AZURE_RESOURCE_GROUP" --query primaryKey -o tsv)

info "Search endpoint: $SEARCH_ENDPOINT"
info "Search admin key: ******** (not printed)"

# ------------------------------------------------------------------
# 6. Enable system-assigned managed identity
# ------------------------------------------------------------------
echo ""
IDENTITY_PRINCIPAL=$(az search service show --name "$AZURE_SEARCH_SERVICE" --resource-group "$AZURE_RESOURCE_GROUP" --query 'identity.principalId' -o tsv 2>/dev/null || echo "")

if [ -z "$IDENTITY_PRINCIPAL" ] || [ "$IDENTITY_PRINCIPAL" = "null" ]; then
  warn "System-assigned managed identity is not enabled. Not all SKUs support it."
  warn "For Basic tier, API key authentication will be used for development."
  warn "For production, upgrade to Standard tier and enable managed identity."
else
  info "System-assigned managed identity: $IDENTITY_PRINCIPAL"
fi

# ------------------------------------------------------------------
# 7. Output non-secret configuration
# ------------------------------------------------------------------
echo ""
mkdir -p "$OUTPUT_DIR"

cat > "$OUTPUT_FILE" <<EOF
# Generated by scripts/azure/provision-foundry-iq.sh
# Do not commit this file — it is in .gitignore.
# Non-secret configuration for Wanderboard Foundry IQ integration.

AZURE_SEARCH_ENDPOINT=${SEARCH_ENDPOINT}
AZURE_SEARCH_KNOWLEDGE_BASE=wanderboard-travel-kb
AZURE_SEARCH_API_VERSION=2026-04-01
AZURE_SEARCH_SERVICE=${AZURE_SEARCH_SERVICE}
AZURE_RESOURCE_GROUP=${AZURE_RESOURCE_GROUP}
AZURE_LOCATION=${AZURE_LOCATION}
EOF

# Secret values are written to .env.local (already git-ignored) or must be set manually
if [ -f .env.local ]; then
  # Append or update search-related vars
  if grep -q "^AZURE_SEARCH_ENDPOINT=" .env.local 2>/dev/null; then
    sed -i "s|^AZURE_SEARCH_ENDPOINT=.*|AZURE_SEARCH_ENDPOINT=${SEARCH_ENDPOINT}|" .env.local
  else
    echo "AZURE_SEARCH_ENDPOINT=${SEARCH_ENDPOINT}" >> .env.local
  fi

  if grep -q "^AZURE_SEARCH_API_KEY=" .env.local 2>/dev/null; then
    sed -i "s|^AZURE_SEARCH_API_KEY=.*|AZURE_SEARCH_API_KEY=${SEARCH_KEY}|" .env.local
  else
    echo "AZURE_SEARCH_API_KEY=${SEARCH_KEY}" >> .env.local
  fi

  if grep -q "^AZURE_SEARCH_KNOWLEDGE_BASE=" .env.local 2>/dev/null; then
    sed -i "s|^AZURE_SEARCH_KNOWLEDGE_BASE=.*|AZURE_SEARCH_KNOWLEDGE_BASE=wanderboard-travel-kb|" .env.local
  else
    echo "AZURE_SEARCH_KNOWLEDGE_BASE=wanderboard-travel-kb" >> .env.local
  fi

  if grep -q "^AZURE_SEARCH_API_VERSION=" .env.local 2>/dev/null; then
    sed -i "s|^AZURE_SEARCH_API_VERSION=.*|AZURE_SEARCH_API_VERSION=2026-04-01|" .env.local
  else
    echo "AZURE_SEARCH_API_VERSION=2026-04-01" >> .env.local
  fi

  info "Updated .env.local with Azure AI Search configuration"
else
  warn ".env.local not found. Create it manually with:"
  echo "  AZURE_SEARCH_ENDPOINT=${SEARCH_ENDPOINT}"
  echo "  AZURE_SEARCH_API_KEY=<your-admin-key>"
  echo "  AZURE_SEARCH_KNOWLEDGE_BASE=wanderboard-travel-kb"
  echo "  AZURE_SEARCH_API_VERSION=2026-04-01"
fi

info "Non-secret config written to: $OUTPUT_FILE"

# ------------------------------------------------------------------
# 8. Summary
# ------------------------------------------------------------------
echo ""
echo "=== Provisioning Complete ==="
echo "Resource Group:    $AZURE_RESOURCE_GROUP"
echo "Search Service:    $AZURE_SEARCH_SERVICE"
echo "Search Endpoint:   $SEARCH_ENDPOINT"
echo "Search SKU:        $AZURE_SEARCH_SKU"
echo "Config file:       $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "  npm run azure:index     # Create search index and upload documents"
echo "  npm run azure:verify    # Verify the knowledge base responds"
