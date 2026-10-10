import { elevenLabsFromRequest } from "@/lib/elevenlabs";
import { elevenLabsAccessProblem, errorResponse } from "@/lib/errors";
import { MUSIC_STYLES } from "@/lib/music";
import { musicInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let ownKey = false;
  try {
    const input = musicInputSchema.parse(await request.json());
    const elevenLabs = elevenLabsFromRequest(request);
    ownKey = elevenLabs.ownKey;

    const audio = await elevenLabs.client.music.compose({
      prompt: MUSIC_STYLES[input.style].prompt,
      musicLengthMs: input.durationMs,
      forceInstrumental: true,
      outputFormat: "mp3_44100_128",
    });

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const problem = elevenLabsAccessProblem(err);
    if (problem) {
      return Response.json(
        {
          error: !ownKey
            ? "Background music needs a paid ElevenLabs plan, and this app's key is on the free plan. Add your own ElevenLabs key to use it."
            : /invalid api key/i.test(problem)
              ? "ElevenLabs rejected your key. Check it and try again."
              : `Your ElevenLabs key can't make music yet (${problem.replace(/\.$/, "")}). Music needs a paid plan (Starter or above) and the "Music Generation" permission on the key.`,
          needsKey: true,
        },
        { status: 402 },
      );
    }
    return errorResponse(err);
  }
}
