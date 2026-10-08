"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Star, X } from "lucide-react";
import { Captcha, captchaEnabled } from "./Captcha";
export function ReviewForm({ available }: { available: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [opened, setOpened] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const submitting = useRef(false);
  const token = useRef("");
  function open() {
    if (!token.current) token.current = crypto.randomUUID();
    setOpened(true);
    dialog.current?.showModal();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (captchaEnabled && !captchaToken) {
      setError("Please complete the verification first.");
      return;
    }
    submitting.current = true;
    const values = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          rating,
          text: values.get("text"),
          website: values.get("website"),
          submissionToken: token.current,
          captchaToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) token.current = crypto.randomUUID();
        throw new Error(data.error || "Unable to submit your review.");
      }
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to submit your review. Your text is still here; please try again.",
      );
    } finally {
      setBusy(false);
      submitting.current = false;
      setCaptchaToken("");
      setCaptchaReset((n) => n + 1);
    }
  }
  return (
    <>
      <button type="button" className="button button-ink" onClick={open}>
        Write a review <ArrowUpRight size={17} />
      </button>
      <dialog
        ref={dialog}
        className="review-dialog"
        aria-labelledby="review-dialog-title"
        onClick={(e) => {
          if (e.target === dialog.current && !busy) dialog.current?.close();
        }}
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        onClose={() => {
          setOpened(false);
          setCaptchaToken("");
          if (sent) {
            setSent(false);
            setRating(0);
            token.current = "";
          }
        }}
      >
        <button
          type="button"
          className="review-dialog-close icon-button"
          aria-label="Close review form"
          disabled={busy}
          onClick={() => dialog.current?.close()}
        >
          <X size={20} />
        </button>
        {sent ? (
          <div className="review-success" role="status">
            <Check size={32} />
            <span className="eyebrow">REVIEW RECEIVED</span>
            <h2 id="review-dialog-title">
              Thank you for
              <br />
              <em>sharing your experience.</em>
            </h2>
            <p>
              We’ve received your review. Thank you for taking the time to write
              it.
            </p>
            <button
              type="button"
              className="button button-ink"
              onClick={() => dialog.current?.close()}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <span className="eyebrow">YOUR EXPERIENCE MATTERS</span>
            <h2 id="review-dialog-title">
              How was your
              <br />
              <em>workshop?</em>
            </h2>
            {!available ? (
              <p className="notice">
                Review submissions are currently unavailable. Please check back
                later or email chemizenlabs@gmail.com.
              </p>
            ) : (
              <form className="review-form" onSubmit={submit}>
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    placeholder="Name to display with your review"
                  />
                </label>
                <fieldset className="review-rating">
                  <legend>Your rating</legend>
                  <div>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label
                        key={value}
                        className={value <= rating ? "is-selected" : ""}
                      >
                        <input
                          type="radio"
                          name="rating"
                          value={value}
                          required
                          checked={rating === value}
                          onChange={() => setRating(value)}
                        />
                        <Star size={31} aria-hidden="true" />
                        <span className="sr-only">
                          {value} {value === 1 ? "star" : "stars"}
                        </span>
                      </label>
                    ))}
                    <span aria-hidden="true">
                      {rating ? `${rating} / 5` : "Choose a rating"}
                    </span>
                  </div>
                </fieldset>
                <label>
                  Your review
                  <textarea
                    name="text"
                    required
                    minLength={20}
                    maxLength={2000}
                    rows={5}
                    placeholder="What did you learn? What worked well, and what could be better?"
                  />
                  <small>20–2,000 characters.</small>
                </label>
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <p className="review-public-note">
                  Your name, rating and review may appear on our website. Please
                  leave out private contact or patient details.
                </p>
                <Captcha
                  action="review"
                  active={opened && !sent}
                  resetKey={captchaReset}
                  onToken={setCaptchaToken}
                />
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="button button-ink"
                  disabled={busy || (captchaEnabled && !captchaToken)}
                >
                  {busy ? "Submitting…" : "Submit"}
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
