import { z } from "zod";
import { ENERGIES, PACES } from "./delivery";
import { LANGUAGE_CODES } from "./languages";

export const TONES = ["friendly", "energetic", "calm", "premium"] as const;

export const languageSchema = z.enum(LANGUAGE_CODES);

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Add a product name.").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Add a short product description (at least 10 characters).")
    .max(2000),
  price: z.string().trim().max(40).optional().default(""),
  sellingPoints: z.string().trim().max(600).optional().default(""),
  tone: z.enum(TONES).default("friendly"),
  language: languageSchema,
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type ProductDraft = Omit<ProductInput, "language">;

export const scriptOutputSchema = z.object({
  script: z.string(),
});

export const speechInputSchema = z.object({
  script: z.string().trim().min(1, "The script is empty.").max(1500),
  voiceId: z.string().trim().min(1, "Pick a voice first."),
  language: languageSchema,
  energy: z.enum(ENERGIES).default("natural"),
  pace: z.enum(PACES).default("normal"),
});

export type SpeechInput = z.infer<typeof speechInputSchema>;

export const scriptEditInputSchema = z.object({
  script: z.string().trim().min(1, "There is no script to edit yet.").max(1500),
  language: languageSchema,
  instruction: z.string().trim().min(2, "Say what you want to change.").max(300),
});

export type VoiceOption = {
  id: string;
  name: string;
  description?: string;
  accent?: string;
  gender?: string;
  previewUrl?: string;
};
