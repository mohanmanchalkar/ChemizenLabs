"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReviewStatus } from "@/lib/review-schema";
export function AdminReviewActions({
  id,
  status,
}: {
  id: string;
  status: ReviewStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function update(next: ReviewStatus) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Unable to update review.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update review.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="moderation-actions">
      {status !== "approved" && (
        <button
          className="button button-ink"
          disabled={busy}
          onClick={() => update("approved")}
        >
          {busy ? "Updating…" : "Approve & publish"}
        </button>
      )}
      {status !== "rejected" && (
        <button
          className="button button-outline"
          disabled={busy}
          onClick={() => update("rejected")}
        >
          Reject
        </button>
      )}
      {status !== "pending" && (
        <button
          className="text-link"
          disabled={busy}
          onClick={() => update("pending")}
        >
          Move to pending
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
