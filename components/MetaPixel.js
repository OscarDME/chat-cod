"use client";
import { useEffect } from "react";

/**
 * Inyecta el Meta Pixel del flujo y dispara PageView ("visitar página")
 * al abrir el chat. El token de CAPI se guarda en el flujo para la Fase 2
 * (eventos server-side); por ahora solo el pixel client-side
 */
export default function MetaPixel({ pixelId }) {
  useEffect(() => {
    if (!pixelId) return;
    /* eslint-disable */
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    }
    /* eslint-enable */
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }, [pixelId]);

  return null;
}
