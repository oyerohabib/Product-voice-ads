import { getElevenLabs } from "@/lib/elevenlabs";
import { errorResponse } from "@/lib/errors";
import type { VoiceOption } from "@/lib/schemas";

export async function GET() {
  try {
    const { voices } = await getElevenLabs().voices.search({ pageSize: 100 });

    const options: VoiceOption[] = voices
      .map((voice) => ({
        id: voice.voiceId,
        name: voice.name ?? "Unnamed voice",
        description: voice.labels?.descriptive ?? voice.description,
        accent: voice.labels?.accent,
        gender: voice.labels?.gender,
        previewUrl: voice.previewUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({ voices: options });
  } catch (err) {
    return errorResponse(err);
  }
}
