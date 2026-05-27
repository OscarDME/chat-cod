import { NextResponse } from "next/server";
import { getFlows, saveFlow, replaceAllFlows } from "@/lib/store";
import { normalizeFlow } from "@/lib/flows";

export const dynamic = "force-dynamic";

export async function GET() {
  const flows = await getFlows();
  return NextResponse.json({ flows });
}

export async function POST(req) {
  try {
    const body = await req.json();
    // Importar todo de golpe: { import: { slug: flow, ... } }
    if (body.import && typeof body.import === "object") {
      await replaceAllFlows(body.import);
      return NextResponse.json({ ok: true });
    }
    const flow = normalizeFlow(body.flow || body);
    // Si cambió el slug al editar, borramos el viejo
    if (body.prevSlug && body.prevSlug !== flow.slug) {
      const flows = await getFlows();
      delete flows[body.prevSlug];
      flows[flow.slug] = flow;
      await replaceAllFlows(flows);
    } else {
      await saveFlow(flow);
    }
    return NextResponse.json({ ok: true, flow });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
