export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function emptyFlow() {
  return {
    slug: "",
    name: "",
    language: "polaco",
    avatarUrl: "",
    steps: [{ id: rid(), text: "", button: "" }],
    aiContext: "",
    bonusMessage: "",
    resendMessage: "",
    pixelId: "",
    capiToken: "",
  };
}

export function rid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Normaliza un flujo antes de guardar. Lanza Error si es inválido. */
export function normalizeFlow(raw) {
  const slug = slugify(raw.slug || raw.name);
  if (!slug) throw new Error("Pon un nombre o slug.");
  const steps = (raw.steps || [])
    .filter((s) => (s.text || "").trim())
    .map((s) => ({ id: s.id || rid(), text: s.text.trim(), button: (s.button || "").trim() || null }));
  if (steps.length === 0) throw new Error("Agrega al menos un mensaje.");
  return {
    slug,
    name: (raw.name || slug).trim(),
    language: (raw.language || "polaco").trim(),
    avatarUrl: (raw.avatarUrl || "").trim(),
    steps,
    aiContext: (raw.aiContext || "").trim(),
    bonusMessage: (raw.bonusMessage || "").trim(),
    resendMessage: (raw.resendMessage || "").trim(),
    pixelId: (raw.pixelId || "").trim(),
    capiToken: (raw.capiToken || "").trim(),
  };
}