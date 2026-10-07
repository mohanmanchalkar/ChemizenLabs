"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AdminLogin({
  available,
  isDevMode = false,
}: {
  available: boolean;
  isDevMode?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      className="admin-login"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(e.currentTarget);
        try {
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(form)),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          router.replace("/admin/enquiries");
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Unable to sign in.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {isDevMode && (
        <div
          style={{
            background: "rgba(212, 175, 55, 0.1)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: "6px",
            padding: "16px 18px",
            marginBottom: "20px",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "#d4af37", display: "block", marginBottom: "6px" }}>
            🔑 Local Dev Demo Mode Active
          </strong>
          <div>
            <strong>Email:</strong> <code>admin@chemizenlabs.com</code>
            <br />
            <strong>Password:</strong> <code>chemizen2025</code>
          </div>
          <p style={{ marginTop: "8px", fontSize: "12px", opacity: 0.85, margin: "8px 0 0" }}>
            Use these credentials to test the inbox, view mock enquiries, and update enquiry statuses.
          </p>
        </div>
      )}
      {!available && !isDevMode && (
        <p className="notice">
          Administrator sign-in is not configured yet. Complete the private
          server setup before signing in.
        </p>
      )}
      <label>
        Admin email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={256}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-ink" disabled={!available || busy}>
        {busy ? "Signing in…" : "Sign in to the dashboard"}
      </button>
      <p className="login-note">
        Access is limited to authorized Chemizen Labs administrators. There is
        no public account registration.
      </p>
    </form>
  );
}
