import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { MissingKeyError } from "./errors";

let client: ElevenLabsClient | null = null;

export function getElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new MissingKeyError("ELEVENLABS_API_KEY");
  client ??= new ElevenLabsClient({ apiKey });
  return client;
}

export function elevenLabsModel() {
  return process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
}
