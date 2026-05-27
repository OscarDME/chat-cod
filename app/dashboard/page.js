"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import FlowEditor from "@/components/FlowEditor";
import { useToast } from "@/components/Toast";
import { emptyFlow, normalizeFlow } from "@/lib/flows";

export default function DashboardPage() {
  const [flows, setFlows] = useState(null);
  const [editing, setEditing] = useState(null);
  const [prevSlug, setPrevSlug] = useState(null);
  const { ping, node } = useToast();
  const fileRef = useRef();

  const load = async () => {
    const r = await fetch("/api/flows");
    const { flows } = await r.json();
    setFlows(flows || {});
  };
  useEffect(() => { load(); }, []);

  const save = async (raw) => {
    let flow;
    try { flow = normalizeFlow(raw); }
    catch (e) { return alert(e.message); }
    const res = await fetch("/api/flows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow, prevSlug }),
    });
    if (!res.ok) { const { error } = await res.json(); return alert(error || "Error al guardar"); }
    setEditing(null); setPrevSlug(null); await load(); ping("Flujo guardado ✓");
  };

  const del = async (slug) => {
    if (!confirm("¿Eliminar este flujo?")) return;
    await fetch(`/api/flows/${slug}`, { method: "DELETE" });
    await load(); ping("Flujo eliminado");
  };

  const exportJson = () => {
    navigator.clipboard?.writeText(JSON.stringify(flows, null, 2));
    ping("JSON copiado ✓");
  };

  const importJson = async (text) => {
    try {
      const obj = JSON.parse(text);
      await fetch("/api/flows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ import: obj }) });
      await load(); ping("Flujos importados ✓");
    } catch { ping("JSON inválido ✗"); }
  };

  if (flows === null) return (<div className="app"><div className="wrap"><TopBar active="dashboard" /><div className="muted">Cargando…</div></div></div>);

  const list = Object.values(flows);

  return (
    <div className="app">
      <div className="wrap">
        <TopBar active="dashboard" />
        {node}
        {editing ? (
          <FlowEditor flow={editing} onSave={save} onCancel={() => { setEditing(null); setPrevSlug(null); }} />
        ) : (
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="section-title">Tus flujos</div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="btn ghost tiny" onClick={exportJson}>Exportar JSON</button>
                <button className="btn ghost tiny" onClick={() => fileRef.current.click()}>Importar</button>
                <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }}
                  onChange={(e) => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => importJson(rd.result); rd.readAsText(f); e.target.value = ""; }} />
                <button className="btn primary tiny" onClick={() => { setEditing(emptyFlow()); setPrevSlug(null); }}>+ Nuevo flujo</button>
              </div>
            </div>

            {list.length === 0 && <div className="empty">No hay flujos todavía. Crea el primero con “+ Nuevo flujo”.</div>}

            {list.map((f) => (
              <div className="flowrow" key={f.slug}>
                <div className="meta">
                  <div className="nm">{f.name || "(sin nombre)"}</div>
                  <div className="sl">/{f.slug} · {f.steps.length} mensajes</div>
                </div>
                <span className="pill">{f.language}</span>
                <div className="row-actions">
                  <Link className="btn ghost tiny" href={`/chat/${f.slug}`}>Probar</Link>
                  <button className="btn ghost tiny" onClick={() => { setEditing(JSON.parse(JSON.stringify(f))); setPrevSlug(f.slug); }}>Editar</button>
                  <button className="btn danger tiny" onClick={() => del(f.slug)}>✕</button>
                </div>
              </div>
            ))}

            <div className="hint">
              Los flujos se guardan como JSON en <code>/data/flows.json</code> (cámbialo a Neon en <code>lib/store.js</code> cuando escales).
              El link del chat de cada flujo es <code>/chat/&lt;slug&gt;</code> — ese es el que pones de destino en tus anuncios.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
