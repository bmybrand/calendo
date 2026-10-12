import Groq from "groq-sdk";

/** Groq retired llama-3.3-70b-versatile (Aug 2026). Override with GROQ_MODEL if needed. */
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey });
}

export async function groqChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const groq = getGroqClient();

  try {
    const response = await groq.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });
    return response.choices[0]?.message?.content ?? "";
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Groq API request failed";
    throw new Error(message);
  }
}

export function parseGroqJson<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI response was not valid JSON. Try again.");
  }
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new Error("Could not parse AI response. Try generating again.");
  }
}
