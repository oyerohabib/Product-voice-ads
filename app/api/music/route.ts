import { getElevenLabs } from "@/lib/elevenlabs";
import { errorResponse } from "@/lib/errors";
import { MUSIC_STYLES } from "@/lib/music";
import { musicInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = musicInputSchema.parse(await request.json());

    const audio = await getElevenLabs().music.compose({
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
    return errorResponse(err);
  }
}
