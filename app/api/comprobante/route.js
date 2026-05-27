import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/ai";
import { comprobantePrompt } from "@/lib/prompt";

export const dynamic = "force-dynamic";

const SUPPORTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req) {
  try {
    const { base64, mediaType } = await req.json();
    if (!base64) return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });

    const mt = SUPPORTED.includes(mediaType) ? mediaType : "image/jpeg";
    const raw = await analyzeImage({ prompt: comprobantePrompt(), base64, mediaType: mt });

    let looksReal = false;
    try {
      looksReal = JSON.parse(raw.replace(/```json|```/g, "").trim()).looksReal;
    } catch {
      looksReal = /true/i.test(raw);
    }
    return NextResponse.json({ looksReal });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message, looksReal: false }, { status: 200 });
  }
}