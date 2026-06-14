// ------------------------------------------------------------------
// Foundry IQ client — Azure AI Search knowledge base retrieval
// Server-side only — never imported in client components.
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type GroundingSource = {
  id?: string;
  title: string;
  url?: string;
  excerpt?: string;
  lastReviewed?: string;
};

export type GroundingResult = {
  status: "grounded" | "no_results" | "unavailable";
  answer?: string;
  sources: GroundingSource[];
  rawActivity?: unknown;
};

export type FoundryIQConfig = {
  searchEndpoint: string;
  knowledgeBase: string;
  apiVersion: string;
  apiKey?: string;
};

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const ENV_SEARCH_ENDPOINT = "AZURE_SEARCH_ENDPOINT";
const ENV_SEARCH_API_KEY = "AZURE_SEARCH_API_KEY";
const ENV_KB_NAME = "AZURE_SEARCH_KNOWLEDGE_BASE";
const ENV_API_VERSION = "AZURE_SEARCH_API_VERSION";
const ENV_INDEX_NAME = "AZURE_SEARCH_INDEX";

const DEFAULT_KB_NAME = "wanderboard-travel-kb";
const DEFAULT_API_VERSION = "2026-04-01";
const DEFAULT_INDEX_NAME = "wanderboard-travel-index";
const SEARCH_DOC_API_VERSION = "2024-07-01";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_EXCERPT_LENGTH = 500;
const MAX_SOURCES = 10;

// ------------------------------------------------------------------
// Config helpers
// ------------------------------------------------------------------

export function hasFoundryIQ(): boolean {
  return !!process.env[ENV_SEARCH_ENDPOINT];
}

export function getFoundryIQConfig(): FoundryIQConfig | null {
  const searchEndpoint = process.env[ENV_SEARCH_ENDPOINT];
  if (!searchEndpoint) return null;

  return {
    searchEndpoint: searchEndpoint.replace(/\/$/, ""),
    knowledgeBase: process.env[ENV_KB_NAME] || DEFAULT_KB_NAME,
    apiVersion: process.env[ENV_API_VERSION] || DEFAULT_API_VERSION,
    apiKey: process.env[ENV_SEARCH_API_KEY],
  };
}

// ------------------------------------------------------------------
// Knowledge base retrieval
// ------------------------------------------------------------------

/**
 * Query the Foundry IQ knowledge base via Azure AI Search.
 *
 * First attempts the knowledge-base retrieval endpoint.
 * Falls back to direct index search if the knowledge base is not provisioned.
 */
async function callKnowledgeBase(
  config: FoundryIQConfig,
  query: string,
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (config.apiKey) {
    headers["api-key"] = config.apiKey;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Try knowledge base retrieval endpoint first
    const kbUrl = `${config.searchEndpoint}/knowledgebases('${config.knowledgeBase}')/retrieve?api-version=${config.apiVersion}`;
    const resp = await fetch(kbUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, top: 5 }),
      signal: controller.signal,
    });

    if (resp.ok) {
      return await resp.json();
    }

    // KB not provisioned — fall back to direct index search for all non-2xx
    return await directIndexSearch(config, query, headers, controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function directIndexSearch(
  config: FoundryIQConfig,
  query: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<unknown> {
  const indexName = process.env[ENV_INDEX_NAME] || DEFAULT_INDEX_NAME;
  const url = `${config.searchEndpoint}/indexes/${indexName}/docs?api-version=${SEARCH_DOC_API_VERSION}&search=${encodeURIComponent(query)}&searchMode=any&$top=5&$select=id,title,content,sourceTitle,sourceUrl,lastReviewed,destination,category`;

  const resp = await fetch(url, { headers, signal });
  if (!resp.ok) {
    throw new Error(`Search index API error: ${resp.status}`);
  }
  return resp.json();
}

// ------------------------------------------------------------------
// Response parsing
// ------------------------------------------------------------------

function parseRetrievalResults(raw: unknown): {
  docs: Array<Record<string, unknown>>;
  answer?: string;
} {
  const obj = raw as Record<string, unknown> | undefined;
  if (!obj) return { docs: [] };

  // Knowledge base response shape
  const kbAnswer = typeof obj.answer === "string" ? obj.answer : undefined;
  const kbResults = Array.isArray(obj.results) ? obj.results : undefined;

  // Direct index search response shape
  const searchResults = Array.isArray(obj.value) ? obj.value : undefined;

  const docs = (kbResults || searchResults || []) as Array<Record<string, unknown>>;

  return {
    docs,
    answer: kbAnswer,
  };
}

function extractSources(docs: Array<Record<string, unknown>>): GroundingSource[] {
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const doc of docs) {
    const title = (typeof doc.sourceTitle === "string" ? doc.sourceTitle : undefined)
      || (typeof doc.title === "string" ? doc.title : "Unknown source");

    // Deduplicate by title
    if (seen.has(title)) continue;
    seen.add(title);

    const excerpt = typeof doc.content === "string"
      ? doc.content.slice(0, MAX_EXCERPT_LENGTH)
      : undefined;

    sources.push({
      id: typeof doc.id === "string" ? doc.id : undefined,
      title,
      url: typeof doc.sourceUrl === "string" && doc.sourceUrl.length > 0
        ? doc.sourceUrl
        : undefined,
      excerpt,
      lastReviewed: typeof doc.lastReviewed === "string" ? doc.lastReviewed : undefined,
    });

    if (sources.length >= MAX_SOURCES) break;
  }

  return sources;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export async function retrieveTravelKnowledge(input: {
  query: string;
  destination?: string;
}): Promise<GroundingResult> {
  const config = getFoundryIQConfig();
  if (!config) {
    return {
      status: "unavailable",
      sources: [],
    };
  }

  try {
    const raw = await callKnowledgeBase(config, input.query);
    const { docs, answer } = parseRetrievalResults(raw);
    const sources = extractSources(docs);

    if (sources.length > 0) {
      return {
        status: "grounded",
        answer,
        sources,
        rawActivity: process.env["WANDERBOARD_DEV_LOGGING"]
          ? raw
          : undefined,
      };
    }

    return {
      status: "no_results",
      sources: [],
      rawActivity: process.env["WANDERBOARD_DEV_LOGGING"]
        ? raw
        : undefined,
    };
  } catch (error) {
    // Distinguish timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        status: "unavailable",
        sources: [],
      };
    }

    // Other Azure failures
    return {
      status: "unavailable",
      sources: [],
    };
  }
}

// ------------------------------------------------------------------
// Health check
// ------------------------------------------------------------------

export async function checkFoundryIQHealth(): Promise<{
  configured: boolean;
  reachable: boolean;
}> {
  const config = getFoundryIQConfig();
  if (!config) {
    return { configured: false, reachable: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers: Record<string, string> = {};
    if (config.apiKey) {
      headers["api-key"] = config.apiKey;
    }

    const indexName = process.env[ENV_INDEX_NAME] || DEFAULT_INDEX_NAME;
    const url = `${config.searchEndpoint}/indexes/${indexName}/docs/$count?api-version=${SEARCH_DOC_API_VERSION}`;

    const resp = await fetch(url, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { configured: true, reachable: resp.ok };
  } catch {
    return { configured: true, reachable: false };
  }
}
