// ------------------------------------------------------------------
// Azure OpenAI (AI Foundry) Client Factory
//
// Server-side only — no NEXT_PUBLIC_* vars, no browser imports.
// ------------------------------------------------------------------

import { AzureOpenAI } from "openai";
import { z } from "zod";

// ------------------------------------------------------------------
// Environment variable names
// ------------------------------------------------------------------

const ENV_API_KEY = "AZURE_OPENAI_API_KEY";
const ENV_ENDPOINT = "AZURE_OPENAI_ENDPOINT";
const ENV_DEPLOYMENT = "AZURE_OPENAI_DEPLOYMENT";
const ENV_API_VERSION = "AZURE_OPENAI_API_VERSION";

const DEFAULT_API_VERSION = "2024-02-15-preview";

// ------------------------------------------------------------------
// Configuration interface
// ------------------------------------------------------------------

export interface AIConfig {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion: string;
}

// ------------------------------------------------------------------
// Config helpers
// ------------------------------------------------------------------

/**
 * Returns `true` when all three required Azure env vars are set and non-empty.
 */
export function hasAzureAI(): boolean {
  return !!(
    process.env[ENV_API_KEY] &&
    process.env[ENV_ENDPOINT] &&
    process.env[ENV_DEPLOYMENT]
  );
}

/**
 * Returns an AIConfig object if all required env vars are present,
 * or `null` if any is missing. Never throws.
 */
export function getAIConfig(): AIConfig | null {
  const apiKey = process.env[ENV_API_KEY];
  const endpoint = process.env[ENV_ENDPOINT];
  const deployment = process.env[ENV_DEPLOYMENT];
  const apiVersion = process.env[ENV_API_VERSION] || DEFAULT_API_VERSION;

  if (!apiKey || !endpoint || !deployment) {
    return null;
  }

  return { apiKey, endpoint, deployment, apiVersion };
}

/**
 * Returns an initialized AzureOpenAI client or `null` if not configured.
 * Never throws.
 */
export function getAzureOpenAIClient(): AzureOpenAI | null {
  const config = getAIConfig();
  if (!config) return null;

  return new AzureOpenAI({
    apiKey: config.apiKey,
    endpoint: config.endpoint,
    deployment: config.deployment,
    apiVersion: config.apiVersion,
  });
}

// ------------------------------------------------------------------
// Typed error for structured output failures
// ------------------------------------------------------------------

export class StructuredResponseError extends Error {
  public readonly code:
    | "validation_failed"
    | "ai_error"
    | "content_filtered"
    | "parse_failed";

  constructor(
    message: string,
    code:
      | "validation_failed"
      | "ai_error"
      | "content_filtered"
      | "parse_failed",
  ) {
    super(message);
    this.name = "StructuredResponseError";
    this.code = code;
  }
}

// ------------------------------------------------------------------
// Structured response helper
// ------------------------------------------------------------------

/**
 * Strip the `$schema` field that zod v4 attaches to its JSON Schema output.
 * Azure OpenAI's structured output mode may reject the `$schema` field.
 */
function stripJsonSchemaMeta(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  const { $schema: _, ...rest } = schema;
  return rest;
}

/**
 * Call Azure OpenAI with JSON schema structured output mode.
 *
 * Converts the provided zod schema to a JSON Schema to pass to the API,
 * then validates the AI's JSON response against the same zod schema
 * before returning the typed result.
 *
 * @param systemPrompt - System-level instruction for the AI.
 * @param userMessage  - The user's prompt / request.
 * @param schemaName   - Name for the JSON schema (passed to `response_format`).
 * @param zodSchema    - Zod schema used both to derive the JSON schema and to
 *                        validate the AI response.
 * @returns Parsed and validated response of type `T`.
 * @throws {StructuredResponseError} on any failure (config missing, AI error, validation mismatch).
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userMessage: string,
  schemaName: string,
  zodSchema: z.ZodType<T>,
): Promise<T> {
  const client = getAzureOpenAIClient();
  if (!client) {
    throw new StructuredResponseError(
      "Azure OpenAI is not configured",
      "ai_error",
    );
  }

  const config = getAIConfig()!;

  // Convert zod schema to JSON Schema for the API's response_format.
  // Strip the $schema field that zod v4 attaches.
  const rawJsonSchema = z.toJSONSchema(zodSchema);
  const jsonSchema = stripJsonSchemaMeta(
    rawJsonSchema as Record<string, unknown>,
  );

  try {
    const response = await client.chat.completions.create({
      model: config.deployment,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema: jsonSchema,
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new StructuredResponseError(
        "The AI returned an empty response. Please try again.",
        "ai_error",
      );
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new StructuredResponseError(
        "The AI returned an invalid JSON response. Please try again.",
        "parse_failed",
      );
    }

    // Validate with zod
    const result = zodSchema.safeParse(parsed);
    if (!result.success) {
      throw new StructuredResponseError(
        "The AI response did not match the expected format. Please try again.",
        "validation_failed",
      );
    }

    return result.data;
  } catch (error) {
    // Re-throw our own typed errors unchanged
    if (error instanceof StructuredResponseError) {
      throw error;
    }

    // Detect content-filter errors (Azure returns them as API errors)
    const errMsg = String(error).toLowerCase();
    if (
      errMsg.includes("content_filter") ||
      errMsg.includes("content_filtered") ||
      errMsg.includes("content management policy")
    ) {
      throw new StructuredResponseError(
        "Your request was filtered by the content safety system. Please rephrase and try again.",
        "content_filtered",
      );
    }

    // Catch-all for network, auth, rate-limit, and other Azure errors
    throw new StructuredResponseError(
      "The AI service is currently unavailable. Please try again later.",
      "ai_error",
    );
  }
}
