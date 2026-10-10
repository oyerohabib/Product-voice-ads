import { ElevenLabsError } from "@elevenlabs/elevenlabs-js";
import { APIError } from "openai";
import { ZodError } from "zod";

export class MissingKeyError extends Error {
  constructor(envVar: string) {
    super(`${envVar} is not set. Add it to .env.local and restart the dev server.`);
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

export function elevenLabsAccessProblem(err: unknown): string | undefined {
  if (!(err instanceof ElevenLabsError)) return undefined;
  const detail = elevenLabsDetail(err.body) ?? err.message;
  const blocked =
    [401, 402, 403].includes(err.statusCode ?? 0) ||
    /free users|paid plan|permission/i.test(detail);
  return blocked ? detail : undefined;
}

export function elevenLabsDetail(body: unknown): string | undefined {
  if (!body || typeof body !== "object" || !("detail" in body)) return undefined;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    return String((detail as { message: unknown }).message);
  }
  return undefined;
}

export function errorResponse(err: unknown) {
  if (err instanceof MissingKeyError) return json(500, err.message);
  if (err instanceof AppError) return json(err.status, err.message);
  if (err instanceof ZodError) return json(400, err.issues[0]?.message ?? "Invalid request.");
  if (err instanceof SyntaxError) return json(400, "Request body must be valid JSON.");

  if (err instanceof APIError) {
    const message = err.message.replace(/^\d{3}\s*/, "");
    if (err.status === 401) return json(401, `OpenAI rejected this API key: ${message}`);
    if (err.status === 429) {
      if (err.type === "insufficient_quota" || err.code === "insufficient_quota") {
        return json(
          429,
          `This OpenAI account has no API credits (${err.code ?? err.type}). API billing is separate from ChatGPT plans: add credits at platform.openai.com/settings/organization/billing.`,
        );
      }
      return json(429, `OpenAI rate limit (${err.code ?? "rate_limit_exceeded"}): ${message}`);
    }
    return json(502, `OpenAI error: ${message}`);
  }

  if (err instanceof ElevenLabsError) {
    const detail = elevenLabsDetail(err.body);
    if (err.statusCode === 401) {
      return json(502, detail ?? "ElevenLabs rejected the API key. Check ELEVENLABS_API_KEY.");
    }
    if (err.statusCode === 429) {
      return json(429, detail ?? "ElevenLabs rate limit or quota reached. Try again shortly.");
    }
    return json(502, `ElevenLabs error: ${detail ?? err.message}`);
  }

  console.error(err);
  return json(500, "Something went wrong. Check the server logs.");
}
