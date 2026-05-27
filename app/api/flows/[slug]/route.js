import { NextResponse } from "next/server";
import { deleteFlow } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const { slug } = await params;
  await deleteFlow(slug);
  return NextResponse.json({ ok: true });
}
