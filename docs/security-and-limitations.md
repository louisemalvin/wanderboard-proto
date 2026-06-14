# Security, Failure Handling, and Limitations

## Failure Handling

Wanderboard handles cloud and model failures as explicit product states.

Possible failures include:

- Missing server configuration
- Foundry IQ retrieval failure
- No relevant knowledge result
- Model timeout or unavailability
- Invalid structured output
- Schema-validation failure
- A proposal referencing outdated board data

When retrieval does not produce useful knowledge, Wanderboard marks the response as a planning suggestion rather than presenting it as grounded fact.

When a model response cannot be safely validated, no place or itinerary change is applied.

The current plan remains unchanged when an AI request fails.

## Security

- No Azure or Microsoft Foundry credentials are committed.
- Secrets are stored only in server-side environment variables.
- `.env.local` and generated Azure files are ignored by Git.
- Client components do not call Azure services directly.
- No Azure credentials use a `NEXT_PUBLIC_*` prefix.
- AI routes validate incoming requests.
- Request sizes and response schemas are bounded.
- Model responses are treated as untrusted input.
- Retrieved documents are treated as reference material, not instructions.
- Source URLs are mapped and validated by the server.
- Raw cloud errors and provider responses are not shown to users.
- Demo data allows reviewers to explore the interface without receiving project credentials.
- The knowledge base contains curated public demonstration content rather than private customer data.

## Limitations

Wanderboard is a planning assistant, not a guaranteed source of live travel information.

The current prototype has the following limitations:

- The Foundry IQ knowledge base focuses on Tokyo for the hackathon demonstration.
- The knowledge base does not cover every destination.
- Suggested coordinates may be approximate unless resolved through a reliable place service.
- Prices and visit durations are estimates.
- Opening hours and transport conditions may change.
- Live weather, closures, and transit disruption data are only available if corresponding real-time services are integrated.
- Guide Mode does not replace official safety, accessibility, visa, weather, or transport advice.
- Travellers should verify time-sensitive details with authoritative sources.
