# GitHub Copilot Usage

Wanderboard was developed with meaningful GitHub Copilot assistance throughout design, implementation, debugging, and documentation.

Copilot supported the development process rather than defining the product independently. Product direction, interaction decisions, visual review, data boundaries, validation requirements, and final implementation choices remained human-directed.

| Development area | How GitHub Copilot assisted | Human contribution |
|---|---|---|
| Product modelling | Helped translate product requirements into typed trip, place, day, proposal, and action models | Defined the concepts, relationships, and permitted behaviour |
| Component development | Assisted with scaffolding planner, map, itinerary, guide, and Mori UI components | Directed layout, visual hierarchy, interaction design, and consistency |
| State management | Helped implement Zustand actions, temporary proposal state, and persistence | Selected the state model and verified cross-view behaviour |
| AI routes | Assisted with server route structure, parsing, prompt selection, and typed responses | Defined service boundaries and the role of each Mori surface |
| Structured output | Helped implement Zod validation and defensive response handling | Defined accepted output and failure behaviour |
| Foundry IQ | Assisted with Azure scripts, retrieval requests, response parsing, and source mapping | Selected the knowledge scope and verified retrieved content |
| Debugging | Helped investigate TypeScript, hydration, map, state, and AI integration issues | Reproduced problems and validated the final fixes |
| Documentation | Helped refine setup instructions, diagrams, and technical explanations | Checked documentation against the actual implementation |

Examples of meaningful Copilot-assisted work include:

- Converting travel-planning requirements into a reusable `TripBoard` model
- Designing typed proposals instead of applying freeform AI instructions
- Separating Mori’s behaviour across three product contexts
- Implementing validation and fallback paths for malformed model responses
- Integrating Foundry IQ retrieval with the existing model workflow
- Building reviewable suggestion and itinerary-proposal components
- Refactoring repeated interface elements into reusable components
- Producing and reviewing Azure provisioning scripts
