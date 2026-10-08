"use client";
import { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
export function ReviewHelpful({
  id,
  initialCount,
}: {
  id: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);
  useEffect(() => {
    try {
      setLiked(localStorage.getItem(`review-helpful:${id}`) === "yes");
    } catch {}
  }, [id]);
  async function toggle() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/reviews/${id}/helpful`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: !liked }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unable to save your reaction.");
      setLiked(data.liked);
      setCount(data.count);
      try {
        localStorage.setItem(`review-helpful:${id}`, data.liked ? "yes" : "no");
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  return (
    <div className="review-helpful">
      <button
        type="button"
        aria-pressed={liked}
        disabled={busy}
        onClick={toggle}
      >
        <ThumbsUp size={15} fill={liked ? "currentColor" : "none"} />
        {liked ? "Marked helpful" : "Helpful"}
        <span>{count}</span>
      </button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
