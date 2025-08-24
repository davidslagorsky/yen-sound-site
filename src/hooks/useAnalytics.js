// src/hooks/useAnalytics.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ANALYTICS_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

// simple uuid
function uuidv4() {
  const u = crypto.getRandomValues(new Uint8Array(16));
  u[6] = (u[6] & 0x0f) | 0x40;
  u[8] = (u[8] & 0x3f) | 0x80;
  const h = [...u].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}

function getAnonId() {
  try {
    const k = "ys_anon_id";
    let v = localStorage.getItem(k);
    if (!v) { v = uuidv4(); localStorage.setItem(k, v); }
    return v;
  } catch {
    return uuidv4();
  }
}

export function useAnalytics() {
  const location = useLocation();
  const sessionIdRef = useRef(uuidv4());
  const anonIdRef = useRef(getAnonId());

  // Fire page_view on every route change
  useEffect(() => {
    const payload = {
      event_type: "page_view",
      path: location.pathname + location.search,
      referrer: document.referrer || "",
      user_agent: navigator.userAgent,
      anon_id: anonIdRef.current,
      session_id: sessionIdRef.current,
      metadata: {}
    };
    fetch(ANALYTICS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  }, [location]);

  // Capture link + button clicks (event delegation)
  useEffect(() => {
    const onClick = (e) => {
      let el = e.target;
      while (el && el !== document.body && el.tagName !== "A" && el.tagName !== "BUTTON") {
        el = el.parentElement;
      }
      if (!el || el === document.body) return;

      const tag = el.tagName;
      const href = tag === "A" ? el.href : undefined;
      const text = (el.textContent || "").trim().slice(0, 120);

      const payload = {
        event_type: tag === "A" ? "link_click" : "button_click",
        path: location.pathname + location.search,
        href,
        element: tag,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent,
        anon_id: anonIdRef.current,
        session_id: sessionIdRef.current,
        metadata: { text }
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(ANALYTICS_URL, new Blob([JSON.stringify(payload)], { type: "application/json" }));
      } else {
        fetch(ANALYTICS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {});
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [location]);
}
