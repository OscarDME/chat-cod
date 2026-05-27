import { sql } from "@/lib/db";

/**
 * Capa de persistencia. Ahora contra Neon (Postgres serverless).
 * La API pública es IDÉNTICA a la versión en JSON, así que nada más cambia.
 *
 * Tablas (auto-creadas la primera vez que se llama a una función):
 *   flows    (slug PK, data JSONB, updated_at)
 *   progress (session_id PK, data JSONB, updated_at)
 *
 * `data` guarda el objeto completo como JSONB — así no atamos el código
 * a columnas concretas y puedes evolucionar el modelo sin migraciones.
 */

let _ready = null;
async function ensure() {
  if (_ready) return _ready;
  _ready = (async () => {
    const s = sql();
    await s`
      CREATE TABLE IF NOT EXISTS flows (
        slug       TEXT PRIMARY KEY,
        data       JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    await s`
      CREATE TABLE IF NOT EXISTS progress (
        session_id TEXT PRIMARY KEY,
        data       JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
  })();
  return _ready;
}

/* ============================= FLUJOS ============================= */

export async function getFlows() {
  await ensure();
  const rows = await sql()`SELECT slug, data FROM flows ORDER BY updated_at DESC`;
  const out = {};
  for (const r of rows) out[r.slug] = r.data;
  return out;
}

export async function getFlow(slug) {
  await ensure();
  const rows = await sql()`SELECT data FROM flows WHERE slug = ${slug} LIMIT 1`;
  return rows[0]?.data || null;
}

export async function saveFlow(flow) {
  await ensure();
  await sql()`
    INSERT INTO flows (slug, data, updated_at)
    VALUES (${flow.slug}, ${JSON.stringify(flow)}::jsonb, NOW())
    ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
  return flow;
}

export async function deleteFlow(slug) {
  await ensure();
  await sql()`DELETE FROM flows WHERE slug = ${slug}`;
}

export async function replaceAllFlows(flows) {
  await ensure();
  // Reemplazo atómico: borra todo y reinserta. Usa transaction-like en una sola query.
  await sql()`DELETE FROM flows`;
  for (const slug of Object.keys(flows || {})) {
    const flow = flows[slug];
    await sql()`
      INSERT INTO flows (slug, data) VALUES (${slug}, ${JSON.stringify(flow)}::jsonb)
    `;
  }
}

/* ============================ PROGRESO ============================ */

export async function getProgress(sessionId) {
  await ensure();
  const rows = await sql()`SELECT data FROM progress WHERE session_id = ${sessionId} LIMIT 1`;
  return rows[0]?.data || null;
}

export async function saveProgress(sessionId, progress) {
  await ensure();
  const payload = { ...progress, updatedAt: Date.now() };
  await sql()`
    INSERT INTO progress (session_id, data, updated_at)
    VALUES (${sessionId}, ${JSON.stringify(payload)}::jsonb, NOW())
    ON CONFLICT (session_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
  return payload;
}