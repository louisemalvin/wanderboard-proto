# Architecture

Wanderboard is a Next.js application with:

- A client-side planning workspace
- A shared Zustand trip store
- Local persistence
- Server-side Mori routes
- Microsoft Foundry model inference
- Foundry IQ retrieval through Azure AI Search
- Zod validation for AI-generated data

The application is centred around a structured `TripBoard`. The same trip state is shared across the planning board, map, itinerary, and guide experiences.

```mermaid
flowchart LR
  User[Traveller] --> Web[Next.js Web App]

  Web --> Home[Trip Overview]
  Web --> Planner[Planning Board]
  Web --> Map[Plan and Discover Map]
  Web --> Itinerary[Day Itinerary]
  Web --> Guide[Guide Mode]

  Planner --> Store[Zustand Trip Store]
  Map --> Store
  Itinerary --> Store
  Guide --> Store
  Store --> Persistence[localStorage]

  Planner --> PlanContext[Plan and Discover context]
  Map --> PlanContext
  Itinerary --> ItineraryContext[Day Itinerary context]
  Guide --> GuideContext[Guide context]

  PlanContext --> Chat[POST /api/ai/chat]
  ItineraryContext --> Chat
  GuideContext --> Chat
  Planner --> Generate[POST /api/ai/generate-board]

  Generate --> Retrieval[Foundry IQ retrieval]
  Chat --> Retrieval
  Retrieval --> KnowledgeBase[Azure AI Search knowledge base]

  Generate --> Model[DeepSeek deployment]
  Chat --> Model

  Model --> Validation[Zod validation]
  Validation --> Proposals[Temporary suggestions and proposals]
  Proposals --> Store
```

## Request Flow

```mermaid
sequenceDiagram
  participant U as Traveller
  participant C as Next.js Client
  participant R as Server AI Route
  participant K as Foundry IQ
  participant M as Foundry Model
  participant V as Zod Validator
  participant S as Trip Store

  U->>C: Ask Mori for help
  C->>R: Send request, surface and relevant trip context
  R->>K: Retrieve destination knowledge
  K-->>R: Return content and source references
  R->>M: Send request, trip context and retrieved knowledge
  M-->>R: Return structured Mori response
  R->>V: Parse and validate
  V-->>R: Return typed response
  R-->>C: Return message, proposals, warnings and sources
  C->>U: Display reviewable response
  U->>C: Save, apply or dismiss
  C->>S: Update TripBoard after approval
```

## Service Boundary

All model and retrieval calls run through server-side Next.js routes.

Credentials remain outside the browser, retrieved sources are mapped by the server, and all model output is treated as untrusted until it passes Zod validation.

## Routes

| Route | Responsibility |
|---|---|
| `POST /api/ai/generate-board` | Generates an initial structured trip board |
| `POST /api/ai/chat` | Handles Plan and Discover, Day Itinerary, and Guide Mode requests |
| `GET /api/ai/health` | Reports safe configuration and availability status |

## Project Structure

Keep this section aligned with the real repository.

```text
src/
  app/
    page.tsx
    planner/
    itinerary/
    map/
    guide/
    api/
      ai/
        generate-board/
        chat/
        health/

  components/
    home/
    planner/
    itinerary/
    map-discovery/
    guide/
    mori/
    shared/

  stores/
    trip-store.ts

  data/
    demo/
    knowledge/

  lib/
    ai/
      prompts/
      foundry-iq.ts
      build-retrieval-query.ts
      schemas.ts
    trip-types.ts

scripts/
  azure/
    discover.sh
    provision-foundry-iq.sh
    create-search-assets.ts
    verify-foundry-iq.ts
```
