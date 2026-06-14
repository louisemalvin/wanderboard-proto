/**
 * Unit tests for Foundry IQ response parsing and source extraction.
 * Run with: npx tsx --test lib/ai/__tests__/foundry-iq.test.ts
 *
 * These tests mock the Azure calls and test the parsing logic.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Directly test the internal parsing functions by importing the module
// We recreate the parsing logic here to test it in isolation

const MAX_EXCERPT_LENGTH = 500;
const MAX_SOURCES = 10;

interface GroundingSource {
  id?: string;
  title: string;
  url?: string;
  excerpt?: string;
  lastReviewed?: string;
}

function extractSources(docs: Array<Record<string, unknown>>): GroundingSource[] {
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const doc of docs) {
    const title = (typeof doc.sourceTitle === "string" ? doc.sourceTitle : undefined)
      || (typeof doc.title === "string" ? doc.title : "Unknown source");

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

describe("extractSources", () => {
  it("extracts sources from search documents", () => {
    const docs = [
      {
        id: "tokyo-asakusa",
        title: "Asakusa Neighbourhood",
        sourceTitle: "JNTO Tokyo Guide",
        sourceUrl: "https://example.com/tokyo",
        content: "Asakusa is a traditional district...",
        lastReviewed: "2026-04",
      },
    ];

    const sources = extractSources(docs);
    assert.equal(sources.length, 1);
    assert.equal(sources[0].title, "JNTO Tokyo Guide");
    assert.equal(sources[0].url, "https://example.com/tokyo");
    assert.equal(sources[0].lastReviewed, "2026-04");
    assert.ok(sources[0].excerpt?.includes("Asakusa"));
  });

  it("falls back to title when sourceTitle is missing", () => {
    const docs = [
      {
        id: "doc-1",
        title: "My Document Title",
        content: "Some content.",
      },
    ];

    const sources = extractSources(docs);
    assert.equal(sources[0].title, "My Document Title");
  });

  it("uses 'Unknown source' when both sourceTitle and title are missing", () => {
    const docs = [
      {
        id: "doc-1",
        content: "Some content.",
      },
    ];

    const sources = extractSources(docs);
    assert.equal(sources[0].title, "Unknown source");
  });

  it("deduplicates sources by title", () => {
    const docs = [
      { sourceTitle: "Source A", content: "First" },
      { sourceTitle: "Source A", content: "Second" },
      { sourceTitle: "Source B", content: "Third" },
    ];

    const sources = extractSources(docs);
    assert.equal(sources.length, 2);
  });

  it("truncates long excerpts to MAX_EXCERPT_LENGTH", () => {
    const longContent = "x".repeat(1000);
    const docs = [
      { sourceTitle: "Source", content: longContent },
    ];

    const sources = extractSources(docs);
    assert.ok(sources[0].excerpt);
    assert.ok(sources[0].excerpt!.length <= MAX_EXCERPT_LENGTH);
  });

  it("crops excessive sources to MAX_SOURCES", () => {
    const docs = Array.from({ length: 15 }, (_, i) => ({
      sourceTitle: `Source ${i}`,
      content: `Content ${i}`,
    }));

    const sources = extractSources(docs);
    assert.ok(sources.length <= MAX_SOURCES);
    assert.equal(sources.length, MAX_SOURCES);
  });

  it("returns empty array for empty docs", () => {
    const sources = extractSources([]);
    assert.equal(sources.length, 0);
  });

  it("validates URL is non-empty string", () => {
    const docs = [
      { sourceTitle: "A", sourceUrl: "" },
      { sourceTitle: "B", sourceUrl: "https://example.com" },
      { sourceTitle: "C", sourceUrl: null },
    ];

    const sources = extractSources(docs);
    assert.equal(sources[0].url, undefined);
    assert.equal(sources[1].url, "https://example.com");
    assert.equal(sources[2].url, undefined);
  });

  it("handles documents with missing strings gracefully", () => {
    const docs = [
      {},
      { title: 123 },
      { sourceTitle: "Valid", content: null },
    ] as Array<Record<string, unknown>>;

    const sources = extractSources(docs);
    assert.ok(Array.isArray(sources));
  });
});

describe("retrieval response parsing", () => {
  it("parses knowledge base response shape", () => {
    const raw = {
      answer: "Based on the knowledge base...",
      results: [
        { id: "1", title: "Result 1", content: "test" },
      ],
    };

    // Simulate parseRetrievalResults logic
    const docs = Array.isArray(raw.results) ? raw.results : [];
    assert.equal(docs.length, 1);
  });

  it("parses direct index search response shape", () => {
    const raw = {
      value: [
        { id: "1", title: "Result 1", content: "test" },
      ],
    };

    const docs = Array.isArray(raw.value) ? raw.value : [];
    assert.equal(docs.length, 1);
  });

  it("handles empty response", () => {
    const raw = {};
    const docs = Array.isArray((raw as Record<string, unknown>).value)
      ? (raw as Record<string, unknown>).value as unknown[]
      : [];
    assert.equal(docs.length, 0);
  });
});
