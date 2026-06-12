# Wanderboard

**Your travel board, organized.**

Wanderboard turns messy trip ideas into an editable, map-first multi-day travel board — not a static itinerary, but a living planning canvas. Describe your trip in natural language, and Wanderboard builds a structured workspace with AI-generated places on a map, assigned to days, with cost ranges and practical notes. Edit, reorder, and refine — the board is your trip.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| State | [Zustand](https://zustand.docs.pmnd.rs) with localStorage persistence |
| Maps | [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) + OpenStreetMap |
| AI | [Azure AI Foundry](https://azure.microsoft.com/products/ai-services) (OpenAI) via server-side route handlers |
| Icons | [Lucide React](https://lucide.dev) |

---

## How to Run

### Prerequisites

- Node.js 18+ and npm (or your package manager of choice)

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app loads immediately — you can explore the sample trip and use all planning features without any cloud credentials.

To create a production build:

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Optional: Azure AI Setup

Wanderboard uses Azure AI Foundry (OpenAI) to power board generation from natural-language prompts and natural-language trip editing via "Ask Wanderboard." The sample trip and all planning features (saving places, assigning to days, reordering, itinerary preview) work **without** Azure.

To enable AI features, create a `.env.local` file at the repo root with these variables:

```env
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

Copy the template from `.env.example` and fill in your values:

```bash
cp .env.example .env.local
# edit .env.local with your Azure credentials
```

### How to obtain Azure credentials

1. Create an [Azure AI Foundry](https://ai.azure.com) resource (or use an existing Azure OpenAI resource).
2. Deploy a model (e.g., `gpt-4o`) in the Azure AI Foundry portal.
3. Copy the **Endpoint** URL and **API Key** from the resource's "Keys and Endpoint" page.
4. Set `AZURE_OPENAI_DEPLOYMENT` to your model deployment name.

After restarting `npm run dev`, the "Create board" button on the home page and the "Ask Wanderboard" pill in the planner will use your Azure deployment.

---

## Security

- **No secrets are committed to this repository.** All Azure API keys and credentials are stored in `.env.local`, which is excluded by `.gitignore`.
- **No `NEXT_PUBLIC_*` Azure environment variables.** All Azure AI calls are made from server-side API route handlers (`app/api/ai/`). Credentials are never exposed to the browser.
- `.env.example` contains placeholder values only — copy it to `.env.local` and fill in your own secrets.
- Never commit `.env.local`, `.env*.local`, or any file containing real credentials.

---

## AI / Copilot Assistance

This project was developed with significant assistance from AI coding tools (GitHub Copilot and Claude) throughout the rebuild process. AI agents were used for:

- Component scaffolding and TypeScript type definitions
- Zustand store implementation with localStorage persistence
- Azure OpenAI client factory and structured-response parsing
- UI layout, responsive Tailwind styling, and state management wiring
- Loading, empty, and error state UX across all views
- Code review, type-checking, and build validation

All AI-generated code was reviewed, tested, and refined by a human developer. The architecture, product decisions, and final polish remain human-directed.

---

## License

Private prototype — not licensed for redistribution.
