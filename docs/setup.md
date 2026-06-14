# Local Setup and Azure Provisioning

## Prerequisites

- Node.js 18 or newer
- npm or another compatible package manager
- An Azure subscription for cloud-powered AI features
- Azure CLI for provisioning or inspecting Azure resources

## Install and Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The interface can be explored with included demo data without Azure credentials. AI generation, grounded retrieval, and board refinement require cloud configuration.

## Production Build

```bash
npm run build
npm start
```

## Lint and Tests

```bash
npm run lint
npm run test
```

## Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure the values used by the existing implementation:

```env
# Model inference
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=<your-api-key>
AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
AZURE_OPENAI_API_VERSION=<your-supported-api-version>

# Foundry IQ and Azure AI Search
AZURE_SEARCH_ENDPOINT=https://<your-search-service>.search.windows.net/
AZURE_SEARCH_API_KEY=<your-search-key>
AZURE_SEARCH_KNOWLEDGE_BASE=wanderboard-travel-kb
AZURE_SEARCH_API_VERSION=<your-supported-knowledge-base-api-version>
AZURE_SEARCH_INDEX=wanderboard-travel-index
```

Use the exact environment-variable names and API versions implemented by the repository.

Credentials must remain server-side and must never be committed.

Restart the development server after changing `.env.local`.

## Azure Provisioning

Authenticate and select the correct Azure subscription:

```bash
az login
az account show
```

Then run the repository scripts:

```bash
# 1. Discover existing Azure resources
export AZURE_RESOURCE_GROUP=wanderboard-foundry-iq-rg
export AZURE_LOCATION=japaneast
npm run azure:discover

# 2. Provision or reuse the Azure AI Search service
npm run azure:provision

# 3. Create the search assets and upload curated knowledge
npm run azure:index

# 4. Verify the knowledge base
npm run azure:verify
```

The scripts should reuse existing resources where possible.

## Resource Cleanup

To remove the dedicated demonstration resource group:

```bash
az group delete   --name wanderboard-foundry-iq-rg   --yes   --no-wait
```

Do not run this command if the resource group contains unrelated resources.
