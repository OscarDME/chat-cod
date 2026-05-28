"use client";
import { useState, useEffect, useRef } from "react";
import Linkify from "@/components/Linkify";
import { t } from "@/lib/i18n";

const rid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function fbqTrack(eventName, data) {
  if (typeof window === "undefined" || !window.fbq) return;
  try { window.fbq("track", eventName, data || {}); } catch {}
}

function getSessionId() {
  if (typeof window === "undefined") return "server";
  try {
    let id = window.localStorage.getItem("flujos_session");
    if (!id) { id = "s_" + rid() + rid(); window.localStorage.setItem("flujos_session", id); }
    return id;
  } catch {
    return "s_anon";
  }
}

export default function ChatView({ flow }) {
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState("scripted");
  const [awaiting, setAwaiting] = useState(null);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [dragging, setDragging] = useState(false);
  const playedRef = useRef(new Set());
  const leadFiredRef = useRef(false);
  const threadRef = useRef();
  const fileRef = useRef();
  const sessionId = useRef(null);

  const progressKey = () => `${sessionId.current}::${flow.slug}`;

  useEffect(() => {
    sessionId.current = getSessionId();
    (async () => {
      try {
        const r = await fetch(`/api/progress?sessionId=${encodeURIComponent(progressKey())}`);
        const { progress } = await r.json();
        if (progress) {
          setMessages(progress.messages || []);
          setCursor(progress.cursor || 0);
          setPhase(progress.phase || "scripted");
          setAwaiting(progress.awaiting || null);
          const done = new Set();
          for (let i = 0; i < (progress.cursor || 0); i++) done.add(i);
          if (progress.awaiting) done.add(progress.cursor || 0);
          playedRef.current = done;
          // Si en el progreso ya se reprodujo el paso marcado como Lead, no lo dispares de nuevo
          const leadIdx = flow.steps.findIndex((s) => s.isLeadStep);
          if (leadIdx >= 0 && done.has(leadIdx)) leadFiredRef.current = true;
        }
      } catch {}
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.slug]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: progressKey(), progress: { messages, cursor, phase, awaiting } }),
      }).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, cursor, phase, awaiting, ready]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  useEffect(() => {
    if (!ready || phase !== "scripted" || awaiting) return;
    if (cursor >= flow.steps.length) { setPhase("free"); return; }
    if (playedRef.current.has(cursor)) return;
    playedRef.current.add(cursor);
    const step = flow.steps[cursor];
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: rid(), from: "bot", text: step.text, t: now() }]);
      // Lead: cuando aparece el mensaje marcado en el editor. Una vez por sesión.
      if (step.isLeadStep && !leadFiredRef.current) {
        leadFiredRef.current = true;
        fbqTrack("Lead", { content_name: flow.name || flow.slug });
      }
      if (step.button) setAwaiting(step.button);
      else setCursor((c) => c + 1);
    }, Math.min(1600, 500 + step.text.length * 9));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, phase, awaiting, ready]);

  const tapButton = () => {
    const label = awaiting;
    setMessages((m) => [...m, { id: rid(), from: "user", text: label, t: now() }]);
    setAwaiting(null);
    setCursor((c) => c + 1);
  };

  async function anaReply(history) {
    setTyping(true); setBusy(true);
    try {
      const apiMsgs = history.filter((m) => m.text).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
      const res = await fetch("/api/ana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: flow.slug, messages: apiMsgs }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: rid(), from: "bot", text: data.reply || "…", t: now() }]);
    } catch {
      setMessages((m) => [...m, { id: rid(), from: "bot", text: "⚠️", t: now() }]);
    } finally { setTyping(false); setBusy(false); }
  }

  const send = () => {
    const t = input.trim();
    if (!t || busy || phase === "scripted") return;
    const next = [...messages, { id: rid(), from: "user", text: t, t: now() }];
    setMessages(next); setInput("");
    anaReply(next);
  };

  const processFile = (file) => {
    if (!file || busy || phase === "scripted" || phase === "done") return;
    if (!file.type || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type || "image/jpeg";
      setMessages((m) => [...m, { id: rid(), from: "user", kind: "image", img: dataUrl, t: now() }]);
      checkComprobante(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  const onFile = (e) => {
    const file = e.target.files[0]; e.target.value = "";
    processFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (phase === "scripted" || phase === "done" || busy) return;
    if (!dragging) setDragging(true);
  };
  const onDragLeave = (e) => {
    e.preventDefault();
    if (e.currentTarget === e.target) setDragging(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  // Pegar imagen desde el portapapeles (Ctrl+V / Cmd+V) en cualquier parte de la pantalla
  const processFileRef = useRef(processFile);
  useEffect(() => { processFileRef.current = processFile; });
  useEffect(() => {
    const onPaste = (e) => {
      if (phase === "scripted" || phase === "done" || busy) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFileRef.current?.(file);
            return;
          }
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [phase, busy]);

  async function checkComprobante(base64, mediaType) {
    setTyping(true); setBusy(true);
    try {
      const res = await fetch("/api/comprobante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      });
      const { looksReal } = await res.json();
      setTyping(false);
      if (looksReal) {
        setMessages((m) => [...m, { id: rid(), from: "bot", text: flow.bonusMessage || "🎁", t: now() }]);
        setPhase("done");
      } else {
        setMessages((m) => [...m, { id: rid(), from: "bot", text: flow.resendMessage || "🙏", t: now() }]);
      }
    } catch {
      setTyping(false);
      setMessages((m) => [...m, { id: rid(), from: "bot", text: "⚠️", t: now() }]);
    } finally { setBusy(false); }
  }

  const locked = phase === "scripted";
  const initial = (flow.name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="wa-screen">
      <header className="wa-header">
        <div className="wa-avatar">
          {flow.avatarUrl && !imgErr
            ? <img className="wa-avatar-img" src={flow.avatarUrl} alt="" onError={() => setImgErr(true)} />
            : initial}
        </div>
        <div className="wa-hinfo">
          <div className="wa-name">{flow.name || "Ana"}</div>
          <div className="wa-status">{typing ? t("typing", flow.language) : t("online", flow.language)}</div>
        </div>
      </header>

      <div
        className={"wa-thread" + (dragging ? " wa-thread-dragging" : "")}
        ref={threadRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {messages.map((m) => (
          <div key={m.id} className={"wa-msg " + (m.from === "user" ? "wa-out" : "wa-in")}>
            {m.kind === "image"
              ? <img className="wa-img" src={m.img} alt="" />
              : <span className="wa-text"><Linkify text={m.text} /></span>}
            <span className="wa-meta">{m.t || ""}{m.from === "user" && <b className="wa-check">✓✓</b>}</span>
          </div>
        ))}
        {typing && <div className="wa-msg wa-in wa-typing"><i /><i /><i /></div>}
        {awaiting && !typing && (
          <div className="wa-qreplies"><button className="wa-qbtn" onClick={tapButton}>{awaiting}</button></div>
        )}
        {dragging && (
          <div className="wa-dragoverlay">
            <div className="wa-dragicon">📸</div>
            <div className="wa-dragtext">{t("dropHere", flow.language)}</div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />

      {!locked && phase !== "done" && (
        <button className="wa-attachbar" onClick={() => fileRef.current.click()} disabled={busy}>
          <div className="wa-attachbar-icon">📸</div>
          <div className="wa-attachbar-text">
            {t("attachTitle", flow.language)}
            <small>
              {t("attachHintTouch", flow.language)}
              {typeof window !== "undefined" && !("ontouchstart" in window) ? t("attachHintDesktop", flow.language) : ""}
            </small>
          </div>
          <div className="wa-attachbar-arrow">→</div>
        </button>
      )}

      <div className="wa-composer">
        <div className="wa-inputwrap">
          <input
            className="wa-input"
            value={input}
            disabled={locked || busy}
            placeholder={t("inputPlaceholder", flow.language)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
        </div>
        <button className="wa-send" disabled={locked || busy || !input.trim()} onClick={send}>➤</button>
      </div>
    </div>
  );
}