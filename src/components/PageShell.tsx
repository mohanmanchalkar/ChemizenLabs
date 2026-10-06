import { Footer } from "./Footer";
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <main id="main" className="page-main">
        <div className="wrap page-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        {children}
      </main>
      <Footer />
    </>
  );
}
