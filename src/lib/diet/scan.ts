import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { ThinkingLevel } from "@google/genai";
import { client, MODEL, SCAN_EFFORT, fallbackParams } from "../claude";
import { gemini, toGeminiSchema, withGemini } from "../llm/gemini";
import { PROVIDER } from "../llm/provider";
import { cacheGet, cacheKey, cacheSet } from "../llm/cache";
import { DIETS } from "./types";
export { analyze, analyzeText, type ScanResult } from "./analyze";

const LabelReading = z.object({
  readable: z
    .boolean()
    .describe("true only if a complete ingredient list (原材料名) or dish description is clearly legible"),
  product_name: z.string().describe("Product or dish name, Japanese then English in brackets"),
  transcription: z
    .string()
    .describe("Exact transcription of the ingredient list / allergen box in the original Japanese, verbatim"),
  ingredients: z.array(
    z.object({
      original: z.string().describe("Ingredient as written on the label"),
      english: z.string(),
    }),
  ),
  concerns: z
    .array(
      z.object({
        ingredient: z.string().describe("As written on the label"),
        reason: z.string(),
        diets: z.array(z.enum(DIETS)),
      }),
    )
    .describe("Every ingredient that could conflict with a vegetarian, Jain, or halal diet. Over-report rather than under-report."),
});
export type LabelReadingOut = z.infer<typeof LabelReading>;

const SYSTEM = `You read Japanese food labels, menus and packaging for Indian travellers.
Transcribe exactly what is printed. Do not guess unreadable characters: if the ingredient list is cut off, blurry or missing, set readable=false.
Pay special attention to hidden animal ingredients: dashi, katsuobushi/bonito, fish or meat extracts (エキス), gelatin, lard, shellfish, and to alcohol (mirin, sake, 酒精) and Jain-restricted items (onion, garlic, ginger, potato, carrot, mushrooms, honey).
Diet definitions: veg = no meat, fish, egg, gelatin. jain = veg plus no root/bulb vegetables, mushrooms, honey. halal = no pork, alcohol, or non-halal meat.`;

type Media = "image/jpeg" | "image/png" | "image/webp";
const UNREADABLE: LabelReadingOut = { readable: false, product_name: "", transcription: "", ingredients: [], concerns: [] };

/** Read a label with whichever provider is configured. Identical photos are served from cache. */
export async function readLabel(imageBase64: string, mediaType: Media): Promise<LabelReadingOut & { model?: string; cached?: boolean }> {
  const key = cacheKey("label-v1", PROVIDER, imageBase64);
  const hit = cacheGet<LabelReadingOut & { model?: string }>(key);
  if (hit) return { ...hit, cached: true };
  const out = PROVIDER === "gemini" ? await readWithGemini(imageBase64, mediaType) : await readWithClaude(imageBase64, mediaType);
  if (out.readable) cacheSet(key, out);
  return out;
}

const GEMINI_SCHEMA = toGeminiSchema(z.toJSONSchema(LabelReading));

async function readWithGemini(imageBase64: string, mediaType: Media): Promise<LabelReadingOut & { model: string }> {
  const { result, model } = await withGemini((model) =>
    gemini.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: mediaType, data: imageBase64 } }, { text: "Read this label." }] }],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: "application/json",
        responseJsonSchema: GEMINI_SCHEMA,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    }),
  );
  // Never trust the shape: validate, and treat anything off-schema as unreadable.
  try {
    const parsed = LabelReading.safeParse(JSON.parse(result.text ?? ""));
    return { ...(parsed.success ? parsed.data : UNREADABLE), model };
  } catch {
    return { ...UNREADABLE, model };
  }
}

async function readWithClaude(imageBase64: string, mediaType: Media): Promise<LabelReadingOut & { model: string }> {
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    ...fallbackParams,
    output_config: { effort: SCAN_EFFORT, format: betaZodOutputFormat(LabelReading) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: "Read this label." },
        ],
      },
    ],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) return { ...UNREADABLE, model: MODEL };
  return { ...res.parsed_output, model: MODEL };
}
