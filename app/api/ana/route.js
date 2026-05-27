import { NextResponse } from "next/server";
import { getFlow } from "@/lib/store";
import { generateText } from "@/lib/ai";
import { buildAnaSystem } from "@/lib/prompt";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { slug, messages } = await req.json();
    const flow = await getFlow(slug);
    if (!flow) return NextResponse.json({ error: "Flujo no existe" }, { status: 404 });

    const system = buildAnaSystem(flow);
    // messages esperado: [{ role: 'user'|'assistant', content }]
    const reply = await generateText({ system, messages });
    return NextResponse.json({ reply: reply || "…" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message, reply: "⚠️ (error de conexión con la IA)" }, { status: 200 });
  }
}
