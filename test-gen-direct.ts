import { AzureOpenAI } from "openai";
import { z } from "zod";

const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "",
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview",
});

const simpleSchema = z.object({
  name: z.string(),
  days: z.number(),
});

async function main() {
  try {
    const rawSchema = z.toJSONSchema(simpleSchema);
    const s = { ...rawSchema } as Record<string, unknown>;
    delete s.$schema;

    const response = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "",
      messages: [
        { role: "system", content: "You are a trip planner. Output valid JSON." },
        { role: "user", content: "Plan a 2 day Tokyo trip. Return: { name: 'trip name', days: 2 }" },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "test", strict: true, schema: s },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    console.log("Content:", content);
    if (content) {
      const parsed = JSON.parse(content);
      console.log("Parsed:", JSON.stringify(parsed));
      const result = simpleSchema.safeParse(parsed);
      console.log("Valid:", result.success);
      if (!result.success) console.log("Issues:", JSON.stringify(result.error.issues));
    }
  } catch (e) {
    console.error("Error type:", e instanceof Error ? e.constructor.name : typeof e);
    if (e instanceof Error) console.error("Message:", e.message);
  }
}
main();
