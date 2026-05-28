import { NextResponse } from "next/server";
import { listConversations, getConversation } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const slug = req.nextUrl.searchParams.get("slug");
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  // GET /api/conversations?sessionId=xxx -> una conversación completa
  if (sessionId) {
    const conversation = await getConversation(sessionId);
    if (!conversation) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    return NextResponse.json({ conversation });
  }

  // GET /api/conversations?slug=xxx -> lista
  if (slug) {
    const conversations = await listConversations(slug);
    return NextResponse.json({ conversations });
  }

  return NextResponse.json({ error: "Falta slug o sessionId" }, { status: 400 });
}