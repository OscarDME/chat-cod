import Link from "next/link";
import TopBar from "@/components/TopBar";

export default function Home() {
  return (
    <div className="app">
      <div className="wrap">
        <TopBar active="" />
        <div className="card">
          <div className="section-title">Tu sistema de flujos + chat</div>
          <p className="hint" style={{ fontSize: 14 }}>
            Arma los flujos de mensajes en el <b>Dashboard</b> (slug, idioma, guion). Pruébalos en el <b>Chat</b>:
            mensajería real, input bloqueado hasta el final, Ana resuelve dudas, validación de comprobante y progreso
            que no se pierde. La IA y el almacenamiento están aislados en <code>lib/</code> para que escales a tu
            Gemini + Neon sin tocar lo demás.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Link href="/dashboard" className="btn primary">Ir al Dashboard</Link>
            <Link href="/chat" className="btn ghost">Probar el Chat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
