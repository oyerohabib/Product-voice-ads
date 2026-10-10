import { zodTextFormat } from "openai/helpers/zod";
import { AppError, errorResponse } from "@/lib/errors";
import { LANGUAGES, measureScript } from "@/lib/languages";
import { openAIFromRequest, openaiModel } from "@/lib/openai";
import { editInstructions, editPrompt } from "@/lib/prompt";
import { scriptEditInputSchema, scriptOutputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const openai = openAIFromRequest(request);
    const input = scriptEditInputSchema.parse(await request.json());
    const language = LANGUAGES[input.language];

    const response = await openai.responses.parse({
      model: openaiModel(),
      instructions: editInstructions(language),
      input: editPrompt(input.script, input.instruction),
      text: { format: zodTextFormat(scriptOutputSchema, "ad_script") },
    });

    if (!response.output_parsed) {
      throw new AppError("The model did not return a script. Try again.", 502);
    }

    const script = response.output_parsed.script.trim();
    return Response.json({ script, length: measureScript(script, language) });
  } catch (err) {
    return errorResponse(err);
  }
}
