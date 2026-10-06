"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        className="button button-outline"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/admin/logout", { method: "POST" });
            if (!r.ok) throw new Error();
            router.replace("/admin/login");
            router.refresh();
          } catch {
            setError("Unable to sign out. Try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function AdminActions({
  id,
  status,
  emailStatus,
}: {
  id: string;
  status: string;
  emailStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function action(path: string, method: string, body?: unknown) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMessage("Saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-actions">
      <label>
        Handling status
        <select
          value={status}
          disabled={busy}
          onChange={(e) =>
            action(`/api/admin/enquiries/${id}`, "PATCH", {
              status: e.target.value,
            })
          }
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </label>
      {emailStatus !== "sent" && (
        <button
          className="button button-outline"
          disabled={busy}
          onClick={() => action(`/api/admin/enquiries/${id}/retry`, "POST")}
        >
          Retry email notification
        </button>
      )}
      <p role="status">{busy ? "Updating…" : message}</p>
    </div>
  );
}
