import { NextResponse } from "next/server";

/**
 * Auth simple (HTTP Basic) para proteger el dashboard y sus APIs.
 * Configura DASHBOARD_PASSWORD en .env y en Vercel → Settings → Environment Variables.
 *
 * El chat público (/chat/[slug]) y sus endpoints (/api/ana, /api/comprobante,
 * /api/progress) NO se protegen — los necesitan los clientes reales.
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/api/flows",
  "/api/conversations",
  "/api/stats",
];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!needsAuth) return NextResponse.next();

  const expected = process.env.DASHBOARD_PASSWORD;

  // Si no hay password configurado, dejamos pasar pero avisamos en logs.
  // (Evita que te trabes si olvidaste setear la env var; pero AGRÉGALA en Vercel.)
  if (!expected) {
    console.warn("[middleware] DASHBOARD_PASSWORD no configurado — dashboard expuesto");
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const colonIdx = decoded.indexOf(":");
      const password = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;
      if (password === expected) return NextResponse.next();
    } catch {}
  }

  return new NextResponse(
    "Acceso restringido — pon cualquier usuario y la contraseña configurada.",
    {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Flujos Dashboard", charset="UTF-8"',
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/api/flows",
    "/api/flows/:path*",
    "/api/conversations",
    "/api/conversations/:path*",
    "/api/stats",
    "/api/stats/:path*",
  ],
};