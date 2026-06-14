/**
 * Create Azure AI Search index and upload knowledge documents.
 *
 * Uses the Azure AI Search REST API with API-key authentication.
 * Run after provision-foundry-iq.sh.
 *
 * Usage: npx tsx scripts/azure/create-search-assets.ts
 */
import {
  TOKYO_KNOWLEDGE_DOCUMENTS,
  type TravelKnowledgeDocument,
} from "../../src/data/knowledge/index";

// ------------------------------------------------------------------
// Configuration from environment
// ------------------------------------------------------------------

const SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const SEARCH_API_KEY = process.env.AZURE_SEARCH_API_KEY;
const SEARCH_API_VERSION = process.env.AZURE_SEARCH_API_VERSION || "2025-07-01-preview";
const INDEX_NAME = process.env.AZURE_SEARCH_INDEX || "wanderboard-travel-index";

if (!SEARCH_ENDPOINT) {
  console.error("❌ AZURE_SEARCH_ENDPOINT is required");
  process.exit(1);
}
if (!SEARCH_API_KEY) {
  console.error("❌ AZURE_SEARCH_API_KEY is required");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  "api-key": SEARCH_API_KEY,
};

// ------------------------------------------------------------------
// Index definition
// ------------------------------------------------------------------

const INDEX_DEFINITION = {
  name: INDEX_NAME,
  fields: [
    { name: "id", type: "Edm.String", key: true, searchable: false, filterable: true, retrievable: true },
    { name: "title", type: "Edm.String", searchable: true, filterable: true, retrievable: true },
    { name: "destination", type: "Edm.String", searchable: true, filterable: true, retrievable: true },
    { name: "category", type: "Edm.String", searchable: true, filterable: true, retrievable: true, facetable: true },
    { name: "content", type: "Edm.String", searchable: true, retrievable: true },
    { name: "sourceTitle", type: "Edm.String", searchable: true, retrievable: true },
    { name: "sourceUrl", type: "Edm.String", retrievable: true },
    { name: "lastReviewed", type: "Edm.String", filterable: true, retrievable: true, sortable: true },
  ],
  corsOptions: {
    allowedOrigins: ["*"],
  },
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function toIndexDocument(doc: TravelKnowledgeDocument) {
  return {
    "@search.action": "upload" as const,
    id: doc.id,
    title: doc.title,
    destination: doc.destination,
    category: doc.category,
    content: doc.content,
    sourceTitle: doc.sourceTitle,
    sourceUrl: doc.sourceUrl ?? null,
    lastReviewed: doc.lastReviewed,
  };
}

async function apiRequest(method: string, path: string, body?: unknown) {
  const url = `${SEARCH_ENDPOINT}${path}?api-version=${SEARCH_API_VERSION}`;
  const options: RequestInit = {
    method,
    headers: HEADERS,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const text = await response.text();

  if (!response.ok && response.status !== 201) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = parsed.error?.message || detail;
    } catch { /* use raw text */ }
    throw new Error(`API error ${response.status}: ${detail}`);
  }

  return response;
}

async function idempotentCreateIndex() {
  // Check if index already exists
  try {
    const check = await fetch(
      `${SEARCH_ENDPOINT}/indexes/${INDEX_NAME}?api-version=${SEARCH_API_VERSION}`,
      { headers: HEADERS },
    );
    if (check.ok) {
      console.log(`✓ Index '${INDEX_NAME}' already exists, updating...`);
      await apiRequest("PUT", `/indexes/${INDEX_NAME}`, INDEX_DEFINITION);
      console.log(`✓ Index '${INDEX_NAME}' updated`);
      return;
    }
  } catch { /* will create */ }

  console.log(`Creating index '${INDEX_NAME}'...`);
  await apiRequest("PUT", `/indexes/${INDEX_NAME}`, INDEX_DEFINITION);
  console.log(`✓ Index '${INDEX_NAME}' created`);
}

async function uploadDocuments() {
  const documents = TOKYO_KNOWLEDGE_DOCUMENTS.map(toIndexDocument);
  const batchSize = 20;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const body = { value: batch };

    try {
      await apiRequest("POST", `/indexes/${INDEX_NAME}/docs/index`, body);
      console.log(`✓ Uploaded batch ${Math.floor(i / batchSize) + 1} (${batch.length} documents)`);
    } catch (err) {
      console.error(`❌ Failed to upload batch at offset ${i}:`, err);
      throw err;
    }
  }
}

async function verifyIndex() {
  console.log("\n--- Index Verification ---");

  const countUrl = `${SEARCH_ENDPOINT}/indexes/${INDEX_NAME}/docs/$count?api-version=${SEARCH_API_VERSION}`;
  const countResp = await fetch(countUrl, { headers: HEADERS });
  const count = await countResp.text();
  console.log(`  Document count: ${count}`);

  const searchUrl = `${SEARCH_ENDPOINT}/indexes/${INDEX_NAME}/docs?api-version=${SEARCH_API_VERSION}&search=Asakusa&searchMode=all&$top=3`;
  const searchResp = await fetch(searchUrl, { headers: HEADERS });
  const searchResult = await searchResp.json();

  if (searchResult.value?.length > 0) {
    console.log(`  Search for "Asakusa": found ${searchResult.value.length} results`);
    for (const doc of searchResult.value) {
      console.log(`    - ${doc.title} (${doc.category})`);
    }
  } else {
    console.warn("  ⚠ Search for 'Asakusa' returned no results (documents may need indexing time)");
  }
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

async function main() {
  console.log("=== Wanderboard — Create Search Assets ===\n");

  try {
    await idempotentCreateIndex();
    console.log("");

    await uploadDocuments();
    console.log("");

    // Wait briefly for indexing
    console.log("Waiting 3 seconds for indexing...");
    await new Promise((r) => setTimeout(r, 3000));

    await verifyIndex();
    console.log("\n✓ Search assets created successfully");
  } catch (err) {
    console.error("\n❌ Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
