export function googleFormUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return null;
    if (u.hostname === "forms.gle" && u.pathname.length > 1) return u.href;
    if (u.hostname === "docs.google.com" && u.pathname.startsWith("/forms/"))
      return u.href;
    return null;
  } catch {
    return null;
  }
}
