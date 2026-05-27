"use client";
import { useState } from "react";
import { rid } from "@/lib/flows";

export default function FlowEditor({ flow, onSave, onCancel }) {
  const [f, setF] = useState(flow);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setStep = (i, k, v) => setF((p) => { const steps = [...p.steps]; steps[i] = { ...steps[i], [k]: v }; return { ...p, steps }; });
  const addStep = () => setF((p) => ({ ...p, steps: [...p.steps, { id: rid(), text: "", button: "" }] }));
  const rmStep = (i) => setF((p) => ({ ...p, steps: p.steps.filter((_, j) => j !== i) }));
  const move = (i, d) => setF((p) => { const steps = [...p.steps]; const j = i + d; if (j < 0 || j >= steps.length) return p; [steps[i], steps[j]] = [steps[j], steps[i]]; return { ...p, steps }; });

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <div className="section-title">{flow.slug ? "Editar flujo" : "Nuevo flujo"}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn primary" onClick={() => onSave(f)}>Guardar</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px" }}>
          <label className="label">Nombre</label>
          <input className="input" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Air Fryer — Polonia" />
        </div>
        <div style={{ flex: "1 1 150px" }}>
          <label className="label">Slug (URL del chat)</label>
          <input className="input" value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="air-fryer-pl" />
        </div>
        <div style={{ flex: "1 1 120px" }}>
          <label className="label">Idioma</label>
          <input className="input" value={f.language} onChange={(e) => set("language", e.target.value)} placeholder="polaco / húngaro / eslovaco" />
        </div>
      </div>

      <label className="label">Foto de perfil (URL de la imagen que verá el cliente — la cara de quien le habla)</label>
      <input className="input" value={f.avatarUrl || ""} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://.../ana.jpg" />

      <label className="label">Mensajes del guion (en orden). El botón es opcional: si lo pones, el usuario debe tocarlo para avanzar.</label>
      {f.steps.map((s, i) => (
        <div className="step" key={s.id}>
          <div className="grow">
            <textarea className="textarea" value={s.text} onChange={(e) => setStep(i, "text", e.target.value)} placeholder={`Mensaje #${i + 1}`} />
            <input className="input" style={{ marginTop: 6, fontSize: 13 }} value={s.button || ""} onChange={(e) => setStep(i, "button", e.target.value)} placeholder="Botón (opcional) — ej. Pokaż mi 👀" />
          </div>
          <div className="stepbtns">
            <button className="btn ghost tiny" onClick={() => move(i, -1)}>▲</button>
            <button className="btn ghost tiny" onClick={() => move(i, 1)}>▼</button>
            <button className="btn danger tiny" onClick={() => rmStep(i)}>✕</button>
          </div>
        </div>
      ))}
      <button className="btn ghost tiny" onClick={addStep}>+ Agregar mensaje</button>

      <div className="divider" />

      <label className="label">Contexto para Ana (lo usa al responder dudas al final): producto, pagos, montos sugeridos, links, IBAN.</label>
      <textarea className="textarea" style={{ minHeight: 90 }} value={f.aiContext} onChange={(e) => set("aiContext", e.target.value)} placeholder="Vendes X. Material ya entregado gratis. Aporte voluntario. Montos sugeridos 20/40/60. Stripe: ... IBAN: ..." />

      <label className="label">Mensaje del BONO (se muestra cuando el comprobante se ve real)</label>
      <textarea className="textarea" value={f.bonusMessage} onChange={(e) => set("bonusMessage", e.target.value)} placeholder="🎁 ¡Gracias! Tu bono: <link>" />

      <label className="label">Mensaje si el comprobante NO se ve válido (opcional)</label>
      <input className="input" value={f.resendMessage || ""} onChange={(e) => set("resendMessage", e.target.value)} placeholder="No pude leer bien el comprobante, ¿me lo reenvías?" />

      <div className="divider" />

      <label className="label">Tracking — Meta Pixel ID (dispara “Visitar página” al abrir el chat)</label>
      <input className="input" value={f.pixelId || ""} onChange={(e) => set("pixelId", e.target.value)} placeholder="ej. 123456789012345" />

      <label className="label">CAPI — Token de acceso (se guarda para después; eventos server-side en Fase 2)</label>
      <input className="input" value={f.capiToken || ""} onChange={(e) => set("capiToken", e.target.value)} placeholder="EAAB... (opcional por ahora)" />
    </div>
  );
}