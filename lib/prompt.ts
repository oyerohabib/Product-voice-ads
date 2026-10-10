import type { Language } from "./languages";
import type { ProductInput } from "./schemas";

export function scriptInstructions(language: Language) {
  return [
    "You write short spoken audio ads for products sold in an online marketplace.",
    "The script is read aloud by a text-to-speech voice, so write for the ear:",
    "- Short, natural sentences. No emojis, hashtags, URLs, bullet points or markdown.",
    "- No stage directions, speaker labels or sound cues. Only the words to be spoken.",
    "- Write prices and numbers the way a person would say them out loud.",
    "- Say the product name early and end with one simple call to action.",
    "- Only use facts from the product details. Do not invent features, discounts or guarantees.",
    `Write the whole script in ${language.label}.`,
    `Length: between ${language.min} and ${language.max} ${language.unit}, about 30 seconds read aloud.`,
  ].join("\n");
}

export function editInstructions(language: Language) {
  return [
    "You edit short spoken audio ads that are read aloud by a text-to-speech voice.",
    "Apply the user's requested change to the script and return the full revised script.",
    "- Keep it in " + language.label + ", written for the ear: short natural sentences, no emojis, URLs, markdown, stage directions or sound cues.",
    "- Keep the product name, price and facts that are already in the script. Do not invent new features, discounts or guarantees.",
    "- Keep a call to action at the end unless the user asks otherwise.",
    `- Unless the user asks for a different length, stay under ${language.max} ${language.unit}.`,
  ].join("\n");
}

export function editPrompt(script: string, instruction: string) {
  return `Change requested: ${instruction}\n\nCurrent script:\n${script}`;
}

export function scriptPrompt(input: ProductInput) {
  return [
    `Product name: ${input.name}`,
    `Description: ${input.description}`,
    input.price && `Price: ${input.price}`,
    input.sellingPoints && `Key selling points: ${input.sellingPoints}`,
    `Tone: ${input.tone}`,
  ]
    .filter(Boolean)
    .join("\n");
}
