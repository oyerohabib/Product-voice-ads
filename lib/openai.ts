import OpenAI from "openai";
import { AppError } from "./errors";
import { OPENAI_KEY_HEADER } from "./openai-key";

// Each user brings their own key, so usage is billed to their OpenAI account.
export function openAIFromRequest(request: Request) {
  const apiKey = request.headers.get(OPENAI_KEY_HEADER)?.trim();
  if (!apiKey) throw new AppError("Add your OpenAI API key to use the AI script tools.", 401);
  return new OpenAI({ apiKey, maxRetries: 1 });
}

export function openaiModel() {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}
