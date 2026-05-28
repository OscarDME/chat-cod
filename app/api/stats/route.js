import { NextResponse } from "next/server";
import { getFlow, getFlowStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug requerido" }, { status: 400 });

  const flow = await getFlow(slug);
  if (!flow) return NextResponse.json({ error: "Flujo no existe" }, { status: 404 });

  const { totalSessions, cursors, phases } = await getFlowStats(slug);

  // Funnel por mensaje: cuántas sesiones llegaron al paso i (cursor >= i)
  const funnel = flow.steps.map((step, i) => ({
    index: i,
    text: step.text.slice(0, 80),
    isLeadStep: !!step.isLeadStep,
    reached: cursors.filter((c) => c >= i).length,
  }));

  const completedScript = (phases.free || 0) + (phases.done || 0);
  const converted = phases.done || 0;

  return NextResponse.json({
    totalSessions,
    completedScript,
    converted,
    funnel,
  });
}