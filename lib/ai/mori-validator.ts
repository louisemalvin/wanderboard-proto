// ------------------------------------------------------------------
// Mori Output Validator — defensive post-processing for model output
// Detects and rejects malformed responses that expose internal IDs,
// implementation details, or violate user-facing rules.
// ------------------------------------------------------------------

import type { MoriResponse } from "./mori-schemas";

// Patterns that should never appear in user-facing text
const FORBIDDEN_PATTERNS = [
  /\bplace-\w+/gi,
  /\bday-\d+/gi,
  /\bmutation\b/gi,
  /\bschema\b/gi,
  /\bthe user\b/gi,
  /\bthe user asked\b/gi,
  /\bI will execute\b/gi,
  /\bI added\b/gi,
  /\bI have added\b/gi,
  /\bexecuting\b/gi,
  /\bexecuted\b/gi,
  /\btool call\b/gi,
  /\bAPI\b/,
  /\bjson\b/gi,
  /\braw payload\b/gi,
  /\bchain.of.thought\b/gi,
  /\bprompt\b/gi,
  /```json/,
  /```[a-z]*\n/,
];

export type ValidationResult = {
  valid: boolean;
  violations: string[];
};

/**
 * Validate a Mori message for forbidden patterns.
 * Returns the violations found, or an empty array if clean.
 */
export function validateMessage(message: string): ValidationResult {
  const violations: string[] = [];

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(message)) {
      violations.push(
        `Detected forbidden pattern in message: ${pattern.source}`,
      );
    }
  }

  // Check for raw JSON in the message
  if (message.includes("{") && message.includes("}") && message.includes('"')) {
    // Allow natural language brace usage (like emoji or formatting)
    // but flag likely JSON injection
    const jsonLike = message.match(/\{[^{}]*"[^"]*"[^{}]*\}/);
    if (jsonLike) {
      violations.push("Message contains JSON-like content");
    }
  }

  return { valid: violations.length === 0, violations };
}

/**
 * Full Mori response validation.
 * Checks the message field and performs structural validation.
 */
export function validateMoriResponse(response: MoriResponse): ValidationResult {
  const result = validateMessage(response.message);
  if (!result.valid) return result;

  // Validate place suggestions don't leak IDs in names
  for (const suggestion of response.placeSuggestions) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(suggestion.name)) {
        result.violations.push(
          `Place suggestion name contains forbidden pattern: ${suggestion.name}`,
        );
      }
      if (pattern.test(suggestion.description)) {
        result.violations.push(
          `Place suggestion description contains forbidden pattern`,
        );
      }
    }
    // Validate coordinates
    if (
      suggestion.coordinateConfidence === "verified" &&
      (suggestion.latitude === undefined || suggestion.longitude === undefined)
    ) {
      result.violations.push(
        `Place suggestion "${suggestion.clientId}" claims verified coordinates but none provided`,
      );
    }
    if (
      suggestion.latitude !== undefined &&
      (suggestion.latitude < -90 || suggestion.latitude > 90)
    ) {
      result.violations.push(
        `Place suggestion "${suggestion.clientId}" has invalid latitude`,
      );
    }
    if (
      suggestion.longitude !== undefined &&
      (suggestion.longitude < -180 || suggestion.longitude > 180)
    ) {
      result.violations.push(
        `Place suggestion "${suggestion.clientId}" has invalid longitude`,
      );
    }
  }

  // Validate itinerary proposals
  for (const proposal of response.itineraryProposals) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(proposal.title)) {
        result.violations.push(
          `Proposal title contains forbidden pattern: ${proposal.title}`,
        );
      }
      if (pattern.test(proposal.summary)) {
        result.violations.push(
          `Proposal summary contains forbidden pattern`,
        );
      }
    }
  }

  return { valid: result.violations.length === 0, violations: result.violations };
}

/**
 * Strip or clean a message that has leaked internal details.
 * Used as a defensive fallback when we cannot reject the entire response.
 */
export function sanitizeMessage(message: string): string {
  let cleaned = message;

  // Remove common ID patterns
  cleaned = cleaned.replace(/\bplace-[a-zA-Z0-9_-]+\b/g, "this place");
  cleaned = cleaned.replace(/\bday-[a-zA-Z0-9_-]+\b/g, "this day");

  // Remove narration patterns
  cleaned = cleaned.replace(
    /\bthe user (?:asked|wants|requested|said|mentioned)\b/gi,
    "you",
  );
  cleaned = cleaned.replace(/\bI will execute\b/gi, "I suggest");
  cleaned = cleaned.replace(/\bI added\b/gi, "I found");
  cleaned = cleaned.replace(/\bI have added\b/gi, "I found");
  cleaned = cleaned.replace(/\bexecuting\b/gi, "applying");
  cleaned = cleaned.replace(/\bexecuted\b/gi, "applied");
  cleaned = cleaned.replace(/\bJSON\b/gi, "");
  cleaned = cleaned.replace(/\bschema\b/gi, "format");
  cleaned = cleaned.replace(/\bmutation\b/gi, "change");

  return cleaned.trim();
}
