"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type Turnstile = {
  render: (node: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export const captchaEnabled = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
);

export function Captcha({
  action,
  active = true,
  resetKey,
  onToken,
}: {
  action: "review" | "enquiry";
  active?: boolean;
  resetKey: number;
  onToken: (token: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const api = window.turnstile;
    if (!captchaEnabled || !ready || !active || !container.current || !api)
      return;
    let live = true;
    setError("");
    callback.current("");
    try {
      widget.current = api.render(container.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        action,
        theme: "light",
        size: container.current.clientWidth < 300 ? "compact" : "flexible",
        "response-field": false,
        callback: (token: string) => {
          if (live) {
            callback.current(token);
            setError("");
          }
        },
        "expired-callback": () => {
          if (live) callback.current("");
        },
        "error-callback": () => {
          if (live) {
            callback.current("");
            setError("Verification couldn’t finish. Please try again.");
          }
          return true;
        },
      });
    } catch {
      setError(
        "Verification couldn’t load. Please refresh the page and try again.",
      );
    }
    return () => {
      live = false;
      if (widget.current !== null) {
        api.remove(widget.current);
        widget.current = null;
      }
    };
  }, [active, ready, resetKey, action]);
  if (!captchaEnabled || !active) return null;
  return (
    <div className="captcha-field">
      <Script
        id="chemizen-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() =>
          setError(
            "Verification couldn’t load. Check your connection and refresh the page.",
          )
        }
      />
      <div ref={container} aria-label="Security verification" />
      {!ready && !error && <p role="status">Loading verification…</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          {ready && (
            <button
              type="button"
              className="text-link"
              onClick={() => {
                if (widget.current !== null) {
                  setError("");
                  callback.current("");
                  window.turnstile?.reset(widget.current);
                }
              }}
            >
              Try verification again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
