"use client";
import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
const WEBSITE_URL = "https://chemizenlabs.com/";
export function FooterShare() {
  const url = WEBSITE_URL;
  const [qr, setQr] = useState("");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const site = WEBSITE_URL;
    let live = true;
    import("qrcode")
      .then((module) =>
        module.toDataURL(site, {
          width: 240,
          margin: 4,
          errorCorrectionLevel: "M",
          color: { dark: "#101a20", light: "#ffffff" },
        }),
      )
      .then((data) => {
        if (live) setQr(data);
      })
      .catch(() => {
        if (live) setMessage("Use the share button to send our website link.");
      });
    return () => {
      live = false;
    };
  }, []);
  async function share() {
    const site = WEBSITE_URL;
    setMessage("");
    setBusy(true);
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Chemizen Labs",
            text: "Explore hands-on training in molecular docking and network pharmacology.",
            url: site,
          });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
      await navigator.clipboard.writeText(site);
      setMessage("Website link copied.");
    } catch {
      setManual(true);
      setMessage("Copy the website link below.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="footer-sharing">
      <div className="footer-sharing-row">
        <button
          type="button"
          className="glass-share"
          disabled={busy}
          onClick={share}
        >
          <Share2 size={17} />
          <span>{busy ? "Opening…" : "Share Chemizen"}</span>
        </button>
        {qr && (
          <a
            className="footer-qr"
            href={url}
            aria-label="Website QR code — open Chemizen Labs"
          >
            <img
              src={qr}
              width={80}
              height={80}
              alt="QR code linking to chemizenlabs.com"
            />
            <span>Scan to visit</span>
          </a>
        )}
      </div>
      <p role="status" className="share-feedback">
        {message}
      </p>
      {manual && (
        <input
          className="share-url"
          aria-label="Website link to copy"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
