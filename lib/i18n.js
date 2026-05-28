/**
 * Idiomas soportados + traducciones de los strings fijos de la UI del chat.
 * Sin librerías: solo un objeto + una función t().
 *
 * Cada idioma tiene:
 *   - displayName: cómo se llama EN SU IDIOMA (lo que el usuario vería)
 *   - anaName: cómo se le dice EN ESPAÑOL (lo que Ana usa en su system prompt)
 */

export const LANGUAGES = {
  es: { displayName: "Español",       anaName: "español" },
  pl: { displayName: "Polski",        anaName: "polaco" },
  hu: { displayName: "Magyar",        anaName: "húngaro" },
  sk: { displayName: "Slovenčina",    anaName: "eslovaco" },
  cs: { displayName: "Čeština",       anaName: "checo" },
  ro: { displayName: "Română",        anaName: "rumano" },
  bg: { displayName: "Български",     anaName: "búlgaro" },
  hr: { displayName: "Hrvatski",      anaName: "croata" },
  sl: { displayName: "Slovenščina",   anaName: "esloveno" },
  et: { displayName: "Eesti",         anaName: "estonio" },
  lt: { displayName: "Lietuvių",      anaName: "lituano" },
};

const STRINGS = {
  online: {
    es: "en línea",   pl: "online",       hu: "online",      sk: "online",
    cs: "online",     ro: "online",       bg: "онлайн",      hr: "online",
    sl: "na zvezi",   et: "võrgus",       lt: "prisijungęs",
  },
  typing: {
    es: "escribiendo…", pl: "pisze…",     hu: "ír…",         sk: "píše…",
    cs: "píše…",        ro: "scrie…",     bg: "пише…",       hr: "piše…",
    sl: "piše…",        et: "kirjutab…",  lt: "rašo…",
  },
  inputPlaceholder: {
    es: "Mensaje",      pl: "Wiadomość",  hu: "Üzenet",      sk: "Správa",
    cs: "Zpráva",       ro: "Mesaj",      bg: "Съобщение",   hr: "Poruka",
    sl: "Sporočilo",    et: "Sõnum",      lt: "Žinutė",
  },
  lockNote: {
    es: "💬 Sigue el flujo tocando el botón. El chat se abre al terminar el guion.",
    pl: "💬 Kontynuuj, dotykając przycisku. Czat otworzy się po zakończeniu.",
    hu: "💬 Folytasd a gomb megérintésével. A chat a végén nyílik meg.",
    sk: "💬 Pokračuj klepnutím na tlačidlo. Chat sa otvorí na konci.",
    cs: "💬 Pokračuj klepnutím na tlačítko. Chat se otevře po skončení.",
    ro: "💬 Continuă atingând butonul. Chatul se deschide la final.",
    bg: "💬 Продължи, докосвайки бутона. Чатът ще се отвори накрая.",
    hr: "💬 Nastavi dodirom na gumb. Chat se otvara na kraju.",
    sl: "💬 Nadaljuj z dotikom gumba. Klepet se odpre na koncu.",
    et: "💬 Jätka nuppu vajutades. Vestlus avaneb lõpus.",
    lt: "💬 Tęsk paliesdamas mygtuką. Pokalbis atsidarys pabaigoje.",
  },
  attachTitle: {
    es: "Enviar comprobante de pago",
    pl: "Wyślij potwierdzenie płatności",
    hu: "Küldd el a fizetési igazolást",
    sk: "Pošli potvrdenie o platbe",
    cs: "Pošli potvrzení o platbě",
    ro: "Trimite dovada plății",
    bg: "Изпрати потвърждение за плащане",
    hr: "Pošalji potvrdu o plaćanju",
    sl: "Pošlji potrdilo o plačilu",
    et: "Saada makse kinnitus",
    lt: "Atsiųsk mokėjimo patvirtinimą",
  },
  attachHintTouch: {
    es: "Toca aquí para subir una imagen",
    pl: "Dotknij tutaj, aby przesłać obraz",
    hu: "Érintsd meg ide a kép feltöltéséhez",
    sk: "Klepni sem na nahranie obrázka",
    cs: "Klepni sem pro nahrání obrázku",
    ro: "Atinge aici pentru a încărca o imagine",
    bg: "Натисни тук, за да качиш изображение",
    hr: "Dodirni ovdje za prijenos slike",
    sl: "Tapni tukaj za nalaganje slike",
    et: "Puuduta siia pildi üleslaadimiseks",
    lt: "Palieskite čia, kad įkeltumėte vaizdą",
  },
  attachHintDesktop: {
    es: " o arrástrala al chat · Ctrl+V",
    pl: " lub przeciągnij ją do czatu · Ctrl+V",
    hu: " vagy húzd a beszélgetésbe · Ctrl+V",
    sk: " alebo ho potiahni do chatu · Ctrl+V",
    cs: " nebo ho přetáhni do chatu · Ctrl+V",
    ro: " sau trage-o în chat · Ctrl+V",
    bg: " или я провлачи в чата · Ctrl+V",
    hr: " ili je povuci u chat · Ctrl+V",
    sl: " ali jo povleci v klepet · Ctrl+V",
    et: " või lohista see vestlusse · Ctrl+V",
    lt: " arba vilkite į pokalbį · Ctrl+V",
  },
  dropHere: {
    es: "Suelta aquí tu comprobante",
    pl: "Upuść tutaj potwierdzenie",
    hu: "Húzd ide az igazolást",
    sk: "Pusti sem potvrdenie",
    cs: "Pusť sem potvrzení",
    ro: "Plasează aici dovada",
    bg: "Пусни тук потвърждението",
    hr: "Ispusti ovdje potvrdu",
    sl: "Spusti tukaj potrdilo",
    et: "Lohista kinnitus siia",
    lt: "Mesk patvirtinimą čia",
  },
};

const LEGACY_MAP = {
  "español": "es", "espanol": "es", "spanish": "es",
  "polaco": "pl", "polski": "pl", "polish": "pl",
  "húngaro": "hu", "hungaro": "hu", "magyar": "hu", "hungarian": "hu",
  "eslovaco": "sk", "slovenčina": "sk", "slovencina": "sk", "slovak": "sk",
  "checo": "cs", "čeština": "cs", "cestina": "cs", "czech": "cs",
  "rumano": "ro", "română": "ro", "romana": "ro", "romanian": "ro",
  "búlgaro": "bg", "bulgaro": "bg", "български": "bg", "bulgarian": "bg",
  "croata": "hr", "hrvatski": "hr", "croatian": "hr",
  "esloveno": "sl", "slovenščina": "sl", "slovenscina": "sl", "slovenian": "sl",
  "estonio": "et", "eesti": "et", "estonian": "et",
  "lituano": "lt", "lietuvių": "lt", "lietuviu": "lt", "lithuanian": "lt",
};

/** Normaliza cualquier valor de "language" a un código válido (es/pl/hu/…). */
export function normalizeLangCode(value) {
  if (!value) return "es";
  const v = String(value).toLowerCase().trim();
  if (LANGUAGES[v]) return v;
  if (LEGACY_MAP[v]) return LEGACY_MAP[v];
  return "es";
}

/** Lookup de un string traducido. Cae a "es" si el código no existe. */
export function t(key, langCode) {
  const code = normalizeLangCode(langCode);
  const entry = STRINGS[key];
  if (!entry) return "";
  return entry[code] || entry.es || "";
}

/** Array de opciones para llenar el <select> del editor. */
export function languageOptions() {
  return Object.entries(LANGUAGES).map(([code, info]) => ({ code, ...info }));
}