import { voiceSettingsFor } from "@/lib/delivery";
import { elevenLabsModel, getElevenLabs } from "@/lib/elevenlabs";
import { errorResponse } from "@/lib/errors";
import { speechInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = speechInputSchema.parse(await request.json());
    const modelId = elevenLabsModel();

    const audio = await getElevenLabs().textToSpeech.convert(input.voiceId, {
      text: input.script,
      modelId,
      outputFormat: "mp3_44100_128",
      voiceSettings: voiceSettingsFor(input.energy, input.pace),
      // languageCode is not supported on multilingual_v2, which detects the language from the text.
      languageCode: modelId === "eleven_multilingual_v2" ? undefined : input.language,
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
