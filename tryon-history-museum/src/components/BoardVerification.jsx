"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

export default function BoardVerification({ onToken, attempt }) {
  const container = useRef(null);
  const widgetId = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!ready || !siteKey || !container.current) return;
    setError("");
    onToken("");
    const widget = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action: "board_application",
      callback: (token) => { setError(""); onToken(token); },
      "expired-callback": () => onToken(""),
      "error-callback": () => {
        onToken("");
        setError("Verification could not load. Please retry or refresh the page. Your answers remain here while you retry.");
      },
    });
    widgetId.current = widget;
    return () => { window.turnstile.remove(widget); widgetId.current = null; };
  }, [ready, siteKey, onToken, attempt]);

  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (retry && window.turnstile && widgetId.current !== null) {
      setError("");
      onToken("");
      window.turnstile.reset(widgetId.current);
    }
  }, [retry, onToken]);

  return (
    <div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
        onError={() => setError("Verification could not load. Please refresh the page or contact info@tryonhistorymuseum.org.")} />
      <div ref={container} />
      {!siteKey && <p role="alert">Verification is temporarily unavailable. Please contact info@tryonhistorymuseum.org.</p>}
      {error && <p role="alert">{error} <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry verification</button></p>}
    </div>
  );
}
