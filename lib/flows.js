import { normalizeLangCode } from "@/lib/i18n";

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
    language: "pl",
    avatarUrl: "",
    steps: [{ id: rid(), text: "", button: "", isLeadStep: false }],
    aiContext: "",
    bonusMessage: "",
    resendMessage: "",
    pixelId: "",
  };
}

export function rid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Normaliza un flujo antes de guardar. Lanza Error si es inválido. */
export function normalizeFlow(raw) {
  const slug = slugify(raw.slug || raw.name);
  if (!slug) throw new Error("Pon un nombre o slug.");
  const stepsRaw = (raw.steps || [])
    .filter((s) => (s.text || "").trim())
    .map((s) => ({
      id: s.id || rid(),
      text: s.text.trim(),
      button: (s.button || "").trim() || null,
      isLeadStep: !!s.isLeadStep,
    }));
  if (stepsRaw.length === 0) throw new Error("Agrega al menos un mensaje.");
  let leadSeen = false;
  const steps = stepsRaw.map((s) => {
    if (s.isLeadStep && !leadSeen) { leadSeen = true; return s; }
    return { ...s, isLeadStep: false };
  });
  return {
    slug,
    name: (raw.name || slug).trim(),
    language: normalizeLangCode(raw.language),
    avatarUrl: (raw.avatarUrl || "").trim(),
    steps,
    aiContext: (raw.aiContext || "").trim(),
    bonusMessage: (raw.bonusMessage || "").trim(),
    resendMessage: (raw.resendMessage || "").trim(),
    pixelId: (raw.pixelId || "").trim(),
  };
}