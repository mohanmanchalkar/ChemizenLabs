"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AdminLogin({ available }: { available: boolean }) {
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
      {!available && (
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
