import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { ELEVENLABS_KEY_HEADER } from "./elevenlabs-key";
import { MissingKeyError } from "./errors";

let client: ElevenLabsClient | null = null;

export function getElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new MissingKeyError("ELEVENLABS_API_KEY");
  client ??= new ElevenLabsClient({ apiKey });
  return client;
}

// The user's own key (if sent) is used for that request only and never stored or logged.
export function userElevenLabsKey(request: Request) {
  return request.headers.get(ELEVENLABS_KEY_HEADER)?.trim() || null;
}

export function elevenLabsFromRequest(request: Request) {
  const apiKey = userElevenLabsKey(request);
  return apiKey
    ? { client: new ElevenLabsClient({ apiKey, maxRetries: 1 }), ownKey: true }
    : { client: getElevenLabs(), ownKey: false };
}

export function elevenLabsModel() {
  return process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
}
