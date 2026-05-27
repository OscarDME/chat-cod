# Flujos · Chat

Sistema modular en **Next.js 15 (App Router)** para armar flujos de venta tipo mensajería:
dashboard para crear los flujos, chat estilo mensajería real con Ana (IA) para resolver dudas,
validación de comprobante por visión, y progreso persistente.

## Arrancar

```bash
npm install
cp .env.example .env       # pon tu GEMINI_API_KEY
npm run dev                # http://localhost:3000
```

## Variables de entorno (.env)

```
GEMINI_API_KEY=...               # por defecto usa Gemini (barato)
GEMINI_MODEL=gemini-2.5-flash-lite
AI_PROVIDER=gemini               # o "anthropic" + ANTHROPIC_API_KEY
```

## Cómo funciona

- **Dashboard** (`/dashboard`): creas/editas flujos. Cada flujo = `{ slug, name, language, steps[], aiContext, bonusMessage, resendMessage }`. Se guardan en `data/flows.json`.
- **Chat** (`/chat/<slug>`): esta URL es la que pones de destino en tus anuncios.
  - Reproduce el guion (mensajes con botón opcional tipo quick reply).
  - El input está **bloqueado** durante el guion y **se desbloquea al final**: ahí Ana responde dudas libremente en el idioma del flujo.
  - 📎 acepta imagen en cualquier formato → valida que el comprobante "se vea real" → muestra el bono.
  - El **progreso se guarda** por sesión (`data/progress.json`), así que el usuario retoma donde quedó.

## Arquitectura (modular)

```
app/
  api/
    flows/        CRUD de flujos        (GET/POST, [slug] DELETE)
    progress/     progreso por sesión   (GET/POST)
    ana/          respuestas de Ana (IA)
    comprobante/  validación de imagen
  dashboard/      UI del dashboard (cliente)
  chat/[slug]/    UI del chat (server + ChatView cliente)
components/
  TopBar, FlowEditor, ChatView, Linkify, Toast
lib/
  store.js    persistencia (JSON ahora -> Neon después; SOLO cambias este archivo)
  ai.js       IA aislada (Gemini / Anthropic). Texto + visión.
  prompt.js   personalidad de Ana + prompt del comprobante
  flows.js    slugify / validación / flujo vacío
data/
  flows.json, progress.json
```

## Escalar a producción

1. **Base de datos**: reimplementa las funciones de `lib/store.js` contra Neon (Postgres). Nada más cambia.
2. **Tu Gemini**: ya está cableado; solo pon `GEMINI_API_KEY`. Si quieres tu endpoint propio, cambia `lib/ai.js`.
3. **Multiusuario**: el `sessionId` del chat (en `ChatView.js`) hoy es por navegador; cámbialo por el contacto real.
4. **EU AI Act**: en Europa Ana debe declararse como IA en algún punto. Tenlo en cuenta en el copy.
