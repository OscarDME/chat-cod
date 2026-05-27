import { promises as fs } from "fs";
import path from "path";

/**
 * Capa de persistencia. POR AHORA usa archivos JSON en /data.
 * Cuando escales a Neon, solo reimplementa estas 6 funciones
 * (getFlows/saveFlows/getProgress/saveProgress/...) y nada más cambia.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const FLOWS_FILE = path.join(DATA_DIR, "flows.json");
const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await ensureDir();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/* ----------------------------- FLUJOS ----------------------------- */

export async function getFlows() {
  return readJson(FLOWS_FILE, {});
}

export async function getFlow(slug) {
  const flows = await getFlows();
  return flows[slug] || null;
}

export async function saveFlow(flow) {
  const flows = await getFlows();
  flows[flow.slug] = flow;
  await writeJson(FLOWS_FILE, flows);
  return flow;
}

export async function deleteFlow(slug) {
  const flows = await getFlows();
  delete flows[slug];
  await writeJson(FLOWS_FILE, flows);
}

export async function replaceAllFlows(flows) {
  await writeJson(FLOWS_FILE, flows);
}

/* ---------------------------- PROGRESO ----------------------------
 * Progreso de cada conversación, identificado por sessionId.
 * (En producción multiusuario, esto vive en Neon por sessionId/contacto.)
 * ------------------------------------------------------------------ */

export async function getProgress(sessionId) {
  const all = await readJson(PROGRESS_FILE, {});
  return all[sessionId] || null;
}

export async function saveProgress(sessionId, progress) {
  const all = await readJson(PROGRESS_FILE, {});
  all[sessionId] = { ...progress, updatedAt: Date.now() };
  await writeJson(PROGRESS_FILE, all);
  return all[sessionId];
}
