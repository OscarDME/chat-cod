import { NextResponse } from "next/server";
import { getProgress, saveProgress } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  const progress = await getProgress(sessionId);
  return NextResponse.json({ progress });
}

export async function POST(req) {
  const { sessionId, progress } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  const saved = await saveProgress(sessionId, progress);
  return NextResponse.json({ ok: true, progress: saved });
}
