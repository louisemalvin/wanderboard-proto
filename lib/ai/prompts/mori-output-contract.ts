// ------------------------------------------------------------------
// Mori Output Contract — structured output instructions for the model
// ------------------------------------------------------------------

export const MORI_OUTPUT_CONTRACT = `OUTPUT FORMAT:
Your response must be valid JSON matching the specified schema. The response has these sections:

1. "message" (string, 1-1200 chars): The natural-language text the traveller sees. This must be:
   - Warm, concise, and natural.
   - Free of internal IDs, mutation names, JSON, tool calls, or implementation narration.
   - Addressed directly to the traveller.
   - Explanatory about what you recommend, why it fits, any uncertainty, and what the traveller can do next.
   - Never describe backend operations.

2. "placeSuggestions" (array): Structured place suggestions. Each has:
   - clientId: A unique client-side ID you generate (e.g. "suggestion-1").
   - name, category, description, reason.
   - destination, neighbourhood (optional).
   - latitude, longitude (optional — only if coordinates are clearly known from retrieved knowledge).
   - coordinateConfidence: "verified" (only if retrieved knowledge confirms exact location), "approximate" (general area known), "missing" (no reliable coordinates).
   - estimatedDurationMinutes (optional).
   - estimatedCost with min/max/currency (optional).
   - suggestedDayId, suggestedAfterPlaceId (optional — use actual board day/place IDs, not visible message).
   - tags, warnings, sourceIds (source IDs from retrieved documents, or empty).

3. "itineraryProposals" (array): Structured change proposals for a day. Each has:
   - proposalId: A unique ID (e.g. "proposal-1").
   - title, summary, dayId.
   - operations: An array of typed operations (reorder_places, assign_place, unassign_place, move_place, add_suggested_place, update_day_summary, update_time_estimate).
   - rationale, warnings, affectedPlaceIds, sourceIds.
   - confidence: "high", "medium", or "low".

4. "guideActions" (array): Lightweight actions for guide mode. Each has a type:
   - navigate_to_place, show_on_map, suggest_nearby_place, mark_place_skipped, move_to_later, open_day_plan, propose_day_adjustment.
   - Use internal IDs where needed (placeId, dayId) — these are structured fields, not visible text.

5. "grounding" (object): { status: "grounded" | "partially_grounded" | "no_results" | "unavailable", sourceIds: string[] }.
   - sourceIds must be IDs found in the retrieved knowledge documents, not fabricated URLs.
   - "grounded": at least one retrieved source supports your response.
   - "partially_grounded": some sources support parts of your response.
   - "no_results": retrieval returned nothing relevant.
   - "unavailable": retrieval was not performed.

6. "warnings" (array): { code, message, severity: "info" | "warning" | "critical" }.

7. "followUpSuggestions" (array of strings, max 3): Natural follow-up questions the traveller might ask.

Remember: The traveller never sees this structure. They only see the "message" text and UI-rendered cards.`;
