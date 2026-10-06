import Link from "next/link";
import { PageShell } from "@/components/PageShell";
export default function NotFound() {
  return (
    <PageShell
      eyebrow="404 / PAGE NOT FOUND"
      title={
        <>
          This page
          <br />
          <em>isn’t available.</em>
        </>
      }
      intro="That page could not be found."
    >
      <div className="wrap page-callout">
        <Link href="/" className="button button-ink">
          Return home
        </Link>
      </div>
    </PageShell>
  );
}
