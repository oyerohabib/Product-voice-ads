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
