import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { userElevenLabsKey } from "@/lib/elevenlabs";
import { AppError, elevenLabsDetail, errorResponse } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const apiKey = userElevenLabsKey(request);
    if (!apiKey) throw new AppError("Add your ElevenLabs API key first.", 401);
    const client = new ElevenLabsClient({ apiKey, maxRetries: 0 });

    try {
      const { tier } = await client.user.subscription.get();
      if (tier === "free") {
        throw new AppError(
          "This key works, but it's on the free ElevenLabs plan. Background music needs Starter or above.",
          402,
        );
      }
      return Response.json({ ok: true, message: `Key works (${tier} plan).` });
    } catch (err) {
      if (!(err instanceof ElevenLabsError) || err.statusCode !== 401) throw err;
      // Restricted keys without "User: Read" can't see the plan, but a voices call still proves the key is real.
      await client.voices.search({ pageSize: 1 });
      return Response.json({
        ok: true,
        message:
          "Key works. It can't read the plan (no User: Read permission), so the first music request will confirm access.",
      });
    }
  } catch (err) {
    if (err instanceof ElevenLabsError && err.statusCode === 401) {
      return Response.json(
        { error: `ElevenLabs rejected this key: ${elevenLabsDetail(err.body) ?? err.message}` },
        { status: 401 },
      );
    }
    return errorResponse(err);
  }
}
