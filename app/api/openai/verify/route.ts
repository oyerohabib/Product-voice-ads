import { errorResponse } from "@/lib/errors";
import { openAIFromRequest, openaiModel } from "@/lib/openai";

// A tiny real request is the only reliable check: it catches bad keys, missing
// scopes on restricted keys and accounts with no API credits.
export async function POST(request: Request) {
  try {
    await openAIFromRequest(request).responses.create({
      model: openaiModel(),
      input: "Reply with OK.",
      max_output_tokens: 16,
    });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
