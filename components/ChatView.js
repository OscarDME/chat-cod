"use client";
import { useState, useEffect, useRef } from "react";
import Linkify from "@/components/Linkify";

const rid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
  const playedRef = useRef(new Set());
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

  const onFile = (e) => {
    const file = e.target.files[0]; e.target.value = "";
    if (!file || busy || phase === "scripted") return;
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
        setMessages((m) => [...m, { id: rid(), from: "bot", text: flow.resendMessage || "¿me reenvías el comprobante? 🙏", t: now() }]);
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
          <div className="wa-status">{typing ? "escribiendo…" : "en línea"}</div>
        </div>
      </header>

      <div className="wa-thread" ref={threadRef}>
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
      </div>

      <div className="wa-composer">
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        <div className="wa-inputwrap">
          <button className="wa-clip" disabled={locked || busy} title="Adjuntar" onClick={() => fileRef.current.click()}>📎</button>
          <input
            className="wa-input"
            value={input}
            disabled={locked || busy}
            placeholder="Mensaje"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
        </div>
        <button className="wa-send" disabled={locked || busy || !input.trim()} onClick={send}>➤</button>
      </div>
    </div>
  );
}