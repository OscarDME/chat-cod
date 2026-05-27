import Link from "next/link";
import TopBar from "@/components/TopBar";
import { getFlows } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ChatIndex() {
  const flows = await getFlows();
  const list = Object.values(flows);

  return (
    <div className="app">
      <div className="wrap">
        <TopBar active="chat" />
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Elige un flujo para probar</div>
          {list.length === 0 && <div className="empty">Crea un flujo en el Dashboard primero.</div>}
          {list.map((f) => (
            <div className="flowrow" key={f.slug}>
              <div className="meta">
                <div className="nm">{f.name}</div>
                <div className="sl">/chat/{f.slug}</div>
              </div>
              <span className="pill">{f.language}</span>
              <Link className="btn primary tiny" href={`/chat/${f.slug}`}>Abrir chat →</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
