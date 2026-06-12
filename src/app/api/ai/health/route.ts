// ------------------------------------------------------------------
// GET /api/ai/health
// Diagnostic endpoint — always returns 200.
// ------------------------------------------------------------------

import { NextResponse } from "next/server";
import { hasAzureAI, getAIConfig } from "@/lib/azure-openai";

export async function GET() {
  if (!hasAzureAI()) {
    return NextResponse.json({
      configured: false,
      reason: "not_configured",
    });
  }

  const config = getAIConfig()!;
  return NextResponse.json({
    configured: true,
    deployment: config.deployment,
  });
}
