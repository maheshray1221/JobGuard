import groq from "./groqClient.js"
import ApiError from "./apiError.js"

// Groq ka JSON output ka type
export interface GroqAnalysisResult {
  risk_score: number
  verdict: "safe" | "suspicious" | "fake"
  red_flags: string[]
  green_flags: string[]
}

const SYSTEM_PROMPT = `
You are an expert job fraud detection AI.
Analyze the given job description and return ONLY a valid JSON object.
No explanation, no markdown, no extra text — just raw JSON.

Return this exact structure:
{
  "risk_score": <number 0-100>,
  "verdict": <"safe" | "suspicious" | "fake">,
  "red_flags": [<string>, ...],
  "green_flags": [<string>, ...]
}

Scoring guide:
- 0-30   → safe       (legitimate job)
- 31-60  → suspicious (some red flags)
- 61-100 → fake       (clear scam indicators)

Red flag examples:
- No company name mentioned
- Unrealistic salary for experience level
- Personal email (Gmail/Yahoo) instead of company email
- Asks for personal documents upfront (Aadhaar, bank details)
- Vague job responsibilities
- Too good to be true promises
- Urgency pressure (immediate joining, limited slots)

Green flag examples:
- Clear company name and registration details
- Official company email domain
- Realistic salary range
- Specific tech stack or skills mentioned
- Clear interview process explained
- Proper job responsibilities listed
`.trim()

export const analyzeWithGroq = async (
  textToAnalyze: string
): Promise<GroqAnalysisResult> => {

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,       // Low — consistent JSON chahiye
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Analyze this job description:\n\n${textToAnalyze}`,
      },
    ],
  })

  // Raw response nikalo
  const rawContent = completion.choices[0]?.message?.content

  if (!rawContent) {
    throw new ApiError(502, "Groq se empty response aaya — dobara try karo")
  }

  // JSON parse karo — AI kabhi kabhi markdown wrap karta hai
  const cleanJSON = rawContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  let parsed: GroqAnalysisResult

  try {
    parsed = JSON.parse(cleanJSON)
  } catch {
    throw new ApiError(502, "Groq ka response valid JSON nahi tha — dobara try karo")
  }

  // Parsed data validate karo
  if (
    typeof parsed.risk_score !== "number" ||
    !["safe", "suspicious", "fake"].includes(parsed.verdict) ||
    !Array.isArray(parsed.red_flags) ||
    !Array.isArray(parsed.green_flags)
  ) {
    throw new ApiError(502, "Groq ka response incomplete tha — dobara try karo")
  }

  // risk_score 0-100 ke beech clamp karo
  parsed.risk_score = Math.min(100, Math.max(0, parsed.risk_score))

  return parsed
}