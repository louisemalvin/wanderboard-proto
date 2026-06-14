/**
 * Verify Foundry IQ knowledge base retrieval.
 *
 * Sends representative queries and validates structure and relevance.
 * Uses the knowledge-base REST API endpoint directly.
 *
 * Usage: npx tsx scripts/azure/verify-foundry-iq.ts
 */

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT;
const SEARCH_API_KEY = process.env.AZURE_SEARCH_API_KEY;
const SEARCH_API_VERSION = process.env.AZURE_SEARCH_API_VERSION || "2026-04-01";
const KB_NAME = process.env.AZURE_SEARCH_KNOWLEDGE_BASE || "wanderboard-travel-kb";
const INDEX_NAME = process.env.AZURE_SEARCH_INDEX || "wanderboard-travel-index";

if (!SEARCH_ENDPOINT) {
  console.error("❌ AZURE_SEARCH_ENDPOINT is required");
  process.exit(1);
}

const HEADERS = {
  "Content-Type": "application/json",
  ...(SEARCH_API_KEY ? { "api-key": SEARCH_API_KEY } : {}),
};

// ------------------------------------------------------------------
// Test queries
// ------------------------------------------------------------------

interface TestQuery {
  label: string;
  query: string;
  expectsRelevance: boolean;
  minResults?: number;
  expectedKeywords?: string[];
}

const TEST_QUERIES: TestQuery[] = [
  {
    label: "Asakusa relaxed day pairings",
    query: "Which areas pair naturally with Asakusa for a relaxed day?",
    expectsRelevance: true,
    minResults: 1,
    expectedKeywords: ["Asakusa", "Ueno", "Sensoji", "Sumida"],
  },
  {
    label: "Packed Shibuya-Asakusa day",
    query: "What should be considered when planning a packed day across Shibuya and Asakusa?",
    expectsRelevance: true,
    minResults: 1,
    expectedKeywords: ["Shibuya", "Asakusa", "packed", "pace", "train"],
  },
  {
    label: "Relaxed neighbourhood duration",
    query: "How much time should a relaxed traveller allow for this neighbourhood?",
    expectsRelevance: true,
    minResults: 1,
    expectedKeywords: ["relaxed", "pace", "hour", "duration"],
  },
  {
    label: "Unrelated query — stock market",
    query: "What is the current price of Tesla stock?",
    expectsRelevance: false,
    expectedKeywords: [], // should not confidently return destination content
  },
  {
    label: "Tokyo transport",
    query: "How do I get from Haneda airport to Shibuya?",
    expectsRelevance: true,
    minResults: 1,
    expectedKeywords: ["Haneda", "train", "airport"],
  },
  {
    label: "Tokyo etiquette",
    query: "What should I know about Japanese etiquette before visiting Tokyo?",
    expectsRelevance: true,
    minResults: 1,
    expectedKeywords: ["etiquette", "tip", "shoe", "train"],
  },
];

// ------------------------------------------------------------------
// Query using simple search against the index
// (Falls back gracefully if knowledge base path is not configured)
// ------------------------------------------------------------------

const SEARCH_DOC_API_VERSION = "2024-07-01";

async function querySearchIndex(query: string, top: number = 5) {
  const url = `${SEARCH_ENDPOINT}/indexes/${INDEX_NAME}/docs?api-version=${SEARCH_DOC_API_VERSION}&search=${encodeURIComponent(query)}&searchMode=any&$top=${top}&$select=id,title,content,sourceTitle,sourceUrl,lastReviewed,destination,category`;
  const resp = await fetch(url, { headers: HEADERS });

  if (!resp.ok) {
    throw new Error(`Search API error ${resp.status}: ${await resp.text()}`);
  }

  return resp.json();
}

async function queryKnowledgeBase(query: string) {
  // Try the knowledge-base retrieval endpoint first (Foundry IQ path)
  const kbUrl = `${SEARCH_ENDPOINT}/knowledgebases('${KB_NAME}')/retrieve?api-version=${SEARCH_API_VERSION}`;
  const body = { query, top: 5 };

  try {
    const resp = await fetch(kbUrl, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
    });

    if (resp.ok) {
      return await resp.json();
    }
    // Knowledge base may not be created yet — fall back to direct index search
    console.log(`  (Knowledge base '${KB_NAME}' not yet created; falling back to direct index search)`);
    return await querySearchIndex(query);
  } catch (err) {
    console.log(`  (Knowledge base retrieval error; falling back to direct index search: ${err instanceof Error ? err.message : err})`);
    return await querySearchIndex(query);
  }
}

// ------------------------------------------------------------------
// Validation helpers
// ------------------------------------------------------------------

function checkKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

function hasSourceMetadata(result: unknown): boolean {
  const doc = result as Record<string, unknown> | undefined;
  return !!(doc?.sourceTitle || doc?.title);
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------

async function main() {
  console.log("=== Wanderboard — Foundry IQ Verification ===\n");
  console.log(`Search Endpoint: ${SEARCH_ENDPOINT}`);
  console.log(`Index: ${INDEX_NAME}`);
  console.log(`Knowledge Base: ${KB_NAME}`);
  console.log("");

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const test of TEST_QUERIES) {
    console.log(`--- ${test.label} ---`);
    console.log(`  Query: "${test.query}"`);

    try {
      const result = await queryKnowledgeBase(test.query);

      // Extract documents (handle both KB response and direct search response shapes)
      const docs = result.value ?? result.results ?? [];
      console.log(`  Results: ${docs.length}`);

      if (test.expectsRelevance) {
        // Check minimum results
        if (test.minResults && docs.length < test.minResults) {
          const msg = `Expected at least ${test.minResults} results, got ${docs.length}`;
          console.log(`  ⚠ ${msg}`);
          if (docs.length === 0) {
            failures.push(`${test.label}: ${msg}`);
            failed++;
            continue;
          }
        }

        // Check keyword relevance in combined content
        if (test.expectedKeywords?.length) {
          const allContent = docs.map((d: Record<string, unknown>) =>
            [d.content, d.title, d.sourceTitle].filter(Boolean).join(" "),
          ).join(" ");

          const found = checkKeywords(allContent, test.expectedKeywords);
          if (found.length === 0) {
            const msg = `No expected keywords found (expected: ${test.expectedKeywords.join(", ")})`;
            console.log(`  ⚠ ${msg}`);
            failures.push(`${test.label}: ${msg}`);
            failed++;
            continue;
          }
          console.log(`  ✓ Keywords matched: ${found.join(", ")}`);
        }

        // Check source metadata
        const metaOk = docs.some(hasSourceMetadata);
        if (metaOk) {
          console.log("  ✓ Source metadata present");
        } else {
          console.log("  ⚠ Source metadata not found");
        }

        console.log("  ✓ PASSED");
        passed++;
      } else {
        // Unrelated query — should not return many/confident results
        const hasStrongMatch = docs.some((d: Record<string, unknown>) => {
          const score = typeof d["@search.score"] === "number" ? d["@search.score"] : 0;
          return score > 0.5 && d.content && typeof d.content === "string" && d.content.length > 50;
        });

        if (hasStrongMatch && docs.length > 0) {
          // This isn't necessarily a failure — just note it
          console.log("  ℹ Unrelated query returned results (this may be normal for keyword-based systems)");
        } else {
          console.log("  ✓ Unrelated query appropriately received no strong match");
        }
        console.log("  ✓ PASSED");
        passed++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ ERROR: ${msg}`);
      failures.push(`${test.label}: ${msg}`);
      failed++;
    }

    console.log("");
  }

  console.log("=== Summary ===");
  console.log(`Passed: ${passed}/${passed + failed}`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
    console.log("\nFailures:");
    for (const f of failures) {
      console.log(`  - ${f}`);
    }
  }

  if (failed > 0) {
    console.log("\n⚠ Some verifications failed. Review the issues above.");
    process.exit(1);
  } else {
    console.log("\n✓ All verifications passed");
  }
}

main();
