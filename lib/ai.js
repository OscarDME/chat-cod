/**
 * Capa de IA aislada. Por defecto Gemini (barato). Cambia AI_PROVIDER=anthropic
 * en .env si quieres usar Claude. Toda la app llama solo a estas dos funciones:
 *   - generateText({ system, messages })  -> string
 *   - analyzeImage({ prompt, base64, mediaType }) -> string
 */

const PROVIDER = process.env.AI_PROVIDER || "gemini";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

/* ------------------------------ GEMINI ------------------------------ */

async function geminiCall(contents, systemInstruction) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta GEMINI_API_KEY");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const body = {
    contents,
    generationConfig: { temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Gemini: " + JSON.stringify(data).slice(0, 300));
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n").trim() || "";
}

/* ----------------------------- ANTHROPIC ----------------------------- */

async function anthropicCall(messages, system) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Falta ANTHROPIC_API_KEY");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Anthropic: " + JSON.stringify(data).slice(0, 300));
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* ------------------------------ API PÚBLICA ------------------------------ */

/** messages: [{ role: 'user'|'assistant', content: string }] */
export async function generateText({ system, messages }) {
  if (PROVIDER === "anthropic") {
    return anthropicCall(messages, system);
  }
  // Gemini: roles user/model
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  return geminiCall(contents, system);
}

/** Analiza una imagen (comprobante) y devuelve el texto crudo del modelo. */
export async function analyzeImage({ prompt, base64, mediaType }) {
  if (PROVIDER === "anthropic") {
    return anthropicCall(
      [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: prompt },
      ] }],
      undefined
    );
  }
  const contents = [{
    role: "user",
    parts: [
      { inline_data: { mime_type: mediaType, data: base64 } },
      { text: prompt },
    ],
  }];
  return geminiCall(contents, null);
}
