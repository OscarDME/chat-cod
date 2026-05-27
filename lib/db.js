import { neon } from "@neondatabase/serverless";

/**
 * Cliente de Neon (serverless HTTP).
 * Usa DATABASE_URL del .env. Una sola instancia por proceso.
 */
let _sql = null;

export function sql() {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL en .env");
  _sql = neon(url);
  return _sql;
}