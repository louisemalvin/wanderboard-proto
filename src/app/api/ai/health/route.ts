// ------------------------------------------------------------------
// GET /api/ai/health
// Diagnostic endpoint — returns safe configuration status.
// Never exposes endpoints, keys, tokens, or subscription IDs.
// ------------------------------------------------------------------

import { NextResponse } from "next/server";
import { hasAzureAI } from "@/lib/azure-openai";
import { checkFoundryIQHealth } from "@/lib/ai/foundry-iq";

export async function GET() {
  const modelConfigured = hasAzureAI();

  const foundryIq = await checkFoundryIQHealth();

  return NextResponse.json({
    model: {
      configured: modelConfigured,
    },
    foundryIq: {
      configured: foundryIq.configured,
      reachable: foundryIq.reachable,
    },
  });
}
