"use client";
import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";

export default function InboxPage() {
  const [flows, setFlows] = useState([]);
  const [slug, setSlug] = useState("");
  const [stats, setStats] = useState(null);
  const [convs, setConvs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/flows")
      .then((r) => r.json())
      .then((d) => {
        const list = Object.values(d.flows || {});
        setFlows(list);
        if (list.length) setSlug(list[0].slug);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!slug) return;
    setOpenId(null); setOpen(null);
    fetch(`/api/conversations?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((d) => setConvs(d.conversations || []));
    fetch(`/api/stats?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then(setStats);
  }, [slug]);

  useEffect(() => {
    if (!openId) { setOpen(null); return; }
    fetch(`/api/conversations?sessionId=${encodeURIComponent(openId)}`).then((r) => r.json()).then((d) => setOpen(d.conversation || null));
  }, [openId]);

  const refresh = () => {
    if (!slug) return;
    fetch(`/api/conversations?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then((d) => setConvs(d.conversations || []));
    fetch(`/api/stats?slug=${encodeURIComponent(slug)}`).then((r) => r.json()).then(setStats);
  };

  if (loading) return (<div className="app"><div className="wrap"><TopBar active="inbox" /><div className="muted">Cargando…</div></div></div>);

  return (
    <div className="app">
      <div className="wrap" style={{ maxWidth: 1200 }}>
        <TopBar active="inbox" />

        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label className="label" style={{ margin: 0 }}>Flujo</label>
            <select className="select" style={{ width: "auto", flex: "1 1 200px", maxWidth: 400 }} value={slug} onChange={(e) => setSlug(e.target.value)}>
              {flows.map((f) => <option key={f.slug} value={f.slug}>{f.name} (/{f.slug})</option>)}
            </select>
            <button className="btn ghost tiny" onClick={refresh}>↻ Actualizar</button>
          </div>
        </div>

        {/* Funnel */}
        {stats && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Funnel del flujo</div>
            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
              <Stat label="Sesiones" value={stats.totalSessions} />
              <Stat label="Completaron guion" value={stats.completedScript} pct={pct(stats.completedScript, stats.totalSessions)} />
              <Stat label="Aporte confirmado" value={stats.converted} pct={pct(stats.converted, stats.totalSessions)} />
            </div>
            <div>
              {stats.funnel.map((s) => (
                <FunnelBar key={s.index} {...s} max={stats.totalSessions} />
              ))}
            </div>
          </div>
        )}

        {/* Inbox + visor */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="card" style={{ flex: "1 1 300px", maxWidth: 360, padding: 0, maxHeight: 600, overflowY: "auto" }}>
            <div style={{ padding: 14, borderBottom: "1px solid var(--line)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div style={{ fontWeight: 700 }}>Conversaciones ({convs.length})</div>
            </div>
            {convs.length === 0 && <div className="empty">Sin conversaciones todavía</div>}
            {convs.map((c) => (
              <ConvRow key={c.sessionId} c={c} active={c.sessionId === openId} onClick={() => setOpenId(c.sessionId)} />
            ))}
          </div>

          <div className="card" style={{ flex: "2 1 400px", minHeight: 200 }}>
            {!open ? (
              <div className="empty">Selecciona una conversación a la izquierda</div>
            ) : (
              <ConvView c={open} />
            )}
          </div>
        </div>

        <div className="hint" style={{ marginTop: 14 }}>
          ⚠️ Esta vista todavía no tiene contraseña — cualquiera con la URL <code>/dashboard/inbox</code> puede leer las conversaciones. Pon un login antes de gastar en tráfico real con clientes.
        </div>
      </div>
    </div>
  );
}

function pct(part, total) { return total > 0 ? Math.round((part / total) * 100) : 0; }

function Stat({ label, value, pct }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Fraunces', serif", lineHeight: 1.1, marginTop: 4 }}>
        {value}
        {pct != null && <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8, fontWeight: 500, fontFamily: "inherit" }}>{pct}%</span>}
      </div>
    </div>
  );
}

function FunnelBar({ index, text, isLeadStep, reached, max }) {
  const p = max > 0 ? (reached / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", fontSize: 13, marginBottom: 5 }}>
        <span style={{ fontWeight: 700 }}>Mensaje {index + 1}{isLeadStep && <span style={{ marginLeft: 6, color: "var(--ok)" }}>📊 Lead</span>}</span>
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{reached} · {Math.round(p)}%</span>
      </div>
      <div style={{ height: 8, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${p}%`, background: isLeadStep ? "var(--ok)" : "var(--accent)", transition: "width .3s" }} />
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
}

function ConvRow({ c, active, onClick }) {
  const phaseColor = c.phase === "done" ? "var(--ok)" : c.phase === "free" ? "var(--accent-2)" : "var(--muted)";
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left", padding: "12px 14px",
        border: "0", borderBottom: "1px solid var(--line)", borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
        background: active ? "var(--bg)" : "transparent", cursor: "pointer", font: "inherit",
      }}
    >
      <div style={{ display: "flex", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
        <span style={{ fontFamily: "monospace" }}>{c.sessionId.slice(0, 14)}…</span>
        <span style={{ marginLeft: "auto" }}>{relTime(c.updatedAt)}</span>
      </div>
      <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
        <span style={{ color: "var(--muted)" }}>{c.lastFrom === "user" ? "→ " : c.lastFrom === "bot" ? "← " : ""}</span>
        {c.lastPreview || "(sin mensajes)"}
      </div>
      <div style={{ fontSize: 11 }}>
        <span style={{ fontWeight: 600, color: phaseColor, textTransform: "uppercase", letterSpacing: ".04em" }}>{c.phase}</span>
        <span style={{ color: "var(--muted)" }}> · {c.messageCount} msg</span>
      </div>
    </button>
  );
}

function ConvView({ c }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div className="section-title">Conversación</div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
          <div style={{ fontFamily: "monospace" }}>{c.sessionId}</div>
          <div>Actualizado: {new Date(c.updatedAt).toLocaleString()} · estado: <b>{c.phase}</b></div>
        </div>
      </div>
      <div style={{ maxHeight: 540, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, padding: 4 }}>
        {(c.messages || []).length === 0 && <div className="empty">Sin mensajes</div>}
        {(c.messages || []).map((m) => (
          <div key={m.id} style={{
            alignSelf: m.from === "user" ? "flex-end" : "flex-start",
            maxWidth: "78%", background: m.from === "user" ? "var(--user)" : "var(--bot)",
            color: m.from === "user" ? "#fff" : "var(--ink)",
            border: m.from === "user" ? "0" : "1px solid var(--line)",
            padding: "9px 13px", borderRadius: 14, fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {m.kind === "image"
              ? <img src={m.img} alt="" style={{ maxWidth: 200, borderRadius: 8, display: "block" }} />
              : m.text}
            {m.t && <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.t}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

function relTime(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
}