import OpenAI from "openai";
import { MissingKeyError } from "./errors";

let client: OpenAI | null = null;

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new MissingKeyError("OPENAI_API_KEY");
  client ??= new OpenAI({ apiKey });
  return client;
}

export function openaiModel() {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}
