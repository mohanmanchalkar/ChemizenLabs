"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { serviceOptions } from "@/lib/content";
import { Captcha, captchaEnabled } from "./Captcha";
export function EnquiryForm({
  initialService = "",
  available,
}: {
  initialService?: string;
  available: boolean;
}) {
  const form = useRef<HTMLFormElement>(null);
  const token = useRef<string | null>(null);
  const submitting = useRef(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState<string | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;
    if (captchaEnabled && !captchaToken) {
      setError("Please complete the verification first.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    token.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data),
          consent: data.get("consent") === "on",
          submissionToken: token.current,
          captchaToken,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409) token.current = null;
        throw new Error(body.error || "Please try again.");
      }
      setSaved(body.id);
      form.current?.reset();
      token.current = null;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We could not connect. Your details are still here; please try again.",
      );
    } finally {
      setBusy(false);
      submitting.current = false;
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    }
  }
  if (saved)
    return (
      <div className="enquiry-success" role="status">
        <span className="success-mark">
          <Check size={26} />
        </span>
        <span className="eyebrow">ENQUIRY RECEIVED</span>
        <h2>
          Thank you.
          <br />
          <em>We have your enquiry.</em>
        </h2>
        <p>
          Your details have been saved for the Chemizen Labs team. We’ll contact
          you using the information you supplied.
        </p>
        <span className="enquiry-reference">REFERENCE / {saved}</span>
        <button className="button button-ink" onClick={() => setSaved(null)}>
          Send another enquiry <ArrowUpRight size={16} />
        </button>
      </div>
    );
  return (
    <form ref={form} onSubmit={submit} className="enquiry-form">
      {!available && (
        <p className="notice" role="status">
          The enquiry form is not available yet. Please email{" "}
          <a href="mailto:chemizenlabs@gmail.com">chemizenlabs@gmail.com</a> or
          call +91 63610 09705.
        </p>
      )}
      <div className="form-grid">
        <label>
          Full name <span>*</span>
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Your name"
          />
        </label>
        <label>
          Email address <span>*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@institution.edu"
          />
        </label>
        <label>
          Phone <small>Optional</small>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder="Include country code"
          />
        </label>
        <label>
          Institution <small>Optional</small>
          <input
            name="institution"
            autoComplete="organization"
            maxLength={180}
            placeholder="College, company or laboratory"
          />
        </label>
      </div>
      <label>
        I’m interested in <span>*</span>
        <select
          name="service"
          required
          defaultValue={
            serviceOptions.includes(initialService) ? initialService : ""
          }
        >
          <option value="" disabled>
            Select a service or topic
          </option>
          {serviceOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Tell us about your question <span>*</span>
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={5}
          placeholder="Which workshop are you interested in? Ask about the batch dates, syllabus or software requirements…"
        />
        <small className="field-help">
          20–5,000 characters. Please leave out confidential or patient
          information.
        </small>
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent-label">
        <input type="checkbox" name="consent" required />
        <span>
          I agree that Chemizen Labs may use these details to respond to my
          enquiry. <Link href="/privacy">Read about privacy.</Link>
        </span>
      </label>
      <Captcha
        action="enquiry"
        active={available}
        resetKey={captchaReset}
        onToken={setCaptchaToken}
      />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-submit">
        <button
          className="button button-ink"
          disabled={busy || !available || (captchaEnabled && !captchaToken)}
        >
          {busy
            ? "Sending your enquiry…"
            : available
              ? "Send enquiry"
              : "Online submissions coming soon"}
          {!busy && <ArrowUpRight size={17} />}
        </button>
        <span>Your enquiry goes directly to our team.</span>
      </div>
    </form>
  );
}
