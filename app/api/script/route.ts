import { zodTextFormat } from "openai/helpers/zod";
import { AppError, errorResponse } from "@/lib/errors";
import { LANGUAGES, measureScript, type ScriptLength } from "@/lib/languages";
import { openAIFromRequest, openaiModel } from "@/lib/openai";
import { scriptInstructions, scriptPrompt } from "@/lib/prompt";
import { productInputSchema, scriptOutputSchema } from "@/lib/schemas";

const MAX_ATTEMPTS = 2;

export async function POST(request: Request) {
  try {
    const openai = openAIFromRequest(request);
    const input = productInputSchema.parse(await request.json());
    const language = LANGUAGES[input.language];

    let script = "";
    let length: ScriptLength | null = null;
    let feedback = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const response = await openai.responses.parse({
        model: openaiModel(),
        instructions: scriptInstructions(language),
        input: scriptPrompt(input) + feedback,
        text: { format: zodTextFormat(scriptOutputSchema, "ad_script") },
      });

      if (!response.output_parsed) {
        throw new AppError("The model did not return a script. Try again.", 502);
      }

      script = response.output_parsed.script.trim();
      length = measureScript(script, language);
      if (length.withinRange) break;

      feedback =
        `\n\nYour previous draft was ${length.count} ${language.unit}. ` +
        `Rewrite it to between ${language.min} and ${language.max} ${language.unit}.`;
    }

    return Response.json({ script, length });
  } catch (err) {
    return errorResponse(err);
  }
}
