"use client";
import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState("");
  const ping = useCallback((m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  }, []);
  const node = toast ? <div className="toast">{toast}</div> : null;
  return { ping, node };
}
