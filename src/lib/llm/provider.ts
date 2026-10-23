/** Gemini when its key is present (free tier), otherwise Claude. */
export const PROVIDER: "gemini" | "anthropic" | "none" = process.env.GEMINI_API_KEY
  ? "gemini"
  : process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN
    ? "anthropic"
    : "none";
