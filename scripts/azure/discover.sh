#!/usr/bin/env bash
# ------------------------------------------------------------------
# Wanderboard — Azure discovery script
# Prints active subscription, resource group, and relevant resources
# without exposing secrets.
# ------------------------------------------------------------------
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { printf "${GREEN}[OK]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$*"; }
err()   { printf "${RED}[ERR]${NC} %s\n" "$*"; exit 1; }

echo "=== Wanderboard Azure Discovery ==="
echo ""

# ------------------------------------------------------------------
# 1. Verify az CLI
# ------------------------------------------------------------------
if ! command -v az &>/dev/null; then
  err "Azure CLI (az) is not installed. Install it: https://aka.ms/azure-cli"
fi
info "Azure CLI found: $(az version --query '[].{version:version}' -o tsv 2>/dev/null || echo 'unknown')"

# ------------------------------------------------------------------
# 2. Verify authentication
# ------------------------------------------------------------------
if ! az account show &>/dev/null; then
  err "Not authenticated. Run: az login"
fi

ACCOUNT=$(az account show -o json)
TENANT_ID=$(echo "$ACCOUNT" | jq -r '.tenantId')
TENANT_NAME=$(echo "$ACCOUNT" | jq -r '.tenantDisplayName // "unknown"')
SUB_ID=$(echo "$ACCOUNT" | jq -r '.id')
SUB_NAME=$(echo "$ACCOUNT" | jq -r '.name')

info "Tenant:  ${TENANT_NAME} (${TENANT_ID})"
info "Subscription: ${SUB_NAME} (${SUB_ID})"

# ------------------------------------------------------------------
# 3. Allow configuration through env vars
# ------------------------------------------------------------------
AZURE_SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-$SUB_ID}"
AZURE_RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-}"
AZURE_LOCATION="${AZURE_LOCATION:-japaneast}"
AZURE_SEARCH_SERVICE="${AZURE_SEARCH_SERVICE:-wanderboard-search}"

echo ""
echo "Configuration:"
echo "  Subscription:   ${AZURE_SUBSCRIPTION_ID}"
echo "  Resource Group: ${AZURE_RESOURCE_GROUP:-<unset>}"
echo "  Location:       ${AZURE_LOCATION}"
echo "  Search Service: ${AZURE_SEARCH_SERVICE}"
echo ""

# Set subscription if different
if [ "$AZURE_SUBSCRIPTION_ID" != "$SUB_ID" ]; then
  az account set --subscription "$AZURE_SUBSCRIPTION_ID" || err "Failed to set subscription $AZURE_SUBSCRIPTION_ID"
  info "Switched to subscription: $AZURE_SUBSCRIPTION_ID"
fi

# ------------------------------------------------------------------
# 4. List resource groups
# ------------------------------------------------------------------
echo ""
echo "--- Resource Groups ---"
az group list --query '[].{Name:name,Location:location}' -o table 2>/dev/null || warn "Could not list resource groups"

# ------------------------------------------------------------------
# 5. Discover existing AI/Foundry resources
# ------------------------------------------------------------------
echo ""
echo "--- AI / Foundry Resources ---"

# Look for Azure AI Services (including Foundry hubs)
az cognitiveservices account list --query '[].{Name:name,Kind:kind,SKU:sku.name,Location:location,ResourceGroup:resourceGroup}' -o table 2>/dev/null || warn "No Cognitive Services / AI accounts found"

echo ""

# Look for Azure AI Search services
az search service list --query '[].{Name:name,SKU:sku.name,Location:location,ResourceGroup:resourceGroup,Hostname:hostName}' -o table 2>/dev/null || warn "No Azure AI Search services found"

echo ""

# Look for Azure OpenAI accounts specifically
az cognitiveservices account list --query "[?kind=='OpenAI'].{Name:name,Location:location,ResourceGroup:resourceGroup,Endpoint:properties.endpoint}" -o table 2>/dev/null || warn "No Azure OpenAI accounts found"

echo ""

# Look for Foundry projects (Azure ML workspaces in V2)
az ml workspace list --query '[].{Name:name,Location:location,ResourceGroup:resourceGroup}' -o table 2>/dev/null || warn "No Azure ML / Foundry workspaces found (this is OK for Azure OpenAI-only setups)"

echo ""

# ------------------------------------------------------------------
# 6. Check existing model deployments (non-secret)
# ------------------------------------------------------------------
echo "--- Model Deployments ---"

# Try to find Azure OpenAI deployments
OPENAI_ACCOUNTS=$(az cognitiveservices account list --query "[?kind=='OpenAI'].name" -o tsv 2>/dev/null || echo "")
if [ -n "$OPENAI_ACCOUNTS" ]; then
  for ACCT in $OPENAI_ACCOUNTS; do
    RG=$(az cognitiveservices account list --query "[?name=='$ACCT'].resourceGroup" -o tsv)
    echo "  Account: $ACCT (resource group: $RG)"
    az cognitiveservices account deployment list --name "$ACCT" --resource-group "$RG" \
      --query '[].{Name:name,Model:properties.model.name,Version:properties.model.version,SKU:sku.name,Capacity:sku.capacity}' \
      -o table 2>/dev/null || echo "  (could not list deployments)"
  done
else
  echo "  No Azure OpenAI accounts found with kind=OpenAI"
fi

echo ""

# ------------------------------------------------------------------
# 7. Check for existing resource group
# ------------------------------------------------------------------
if [ -n "${AZURE_RESOURCE_GROUP:-}" ]; then
  if az group show --name "$AZURE_RESOURCE_GROUP" &>/dev/null; then
    info "Resource group '$AZURE_RESOURCE_GROUP' exists"
    echo ""
    echo "Resources in '$AZURE_RESOURCE_GROUP':"
    az resource list --resource-group "$AZURE_RESOURCE_GROUP" \
      --query '[].{Name:name,Type:type,Location:location}' -o table 2>/dev/null || warn "Could not list resources"
  else
    warn "Resource group '$AZURE_RESOURCE_GROUP' does not exist"
  fi
fi

echo ""
info "Discovery complete."
