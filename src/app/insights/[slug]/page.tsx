import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/lib/articles";
import { PageShell } from "@/components/PageShell";
import { ArticleVisual } from "@/components/Insights";
import { ArticleFigure } from "@/components/ArticleFigure";
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = articles.find((a) => a.slug === slug);
  return { title: a?.title || "Article not found", description: a?.subtitle };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    index = articles.findIndex((a) => a.slug === slug),
    a = articles[index];
  if (!a) notFound();
  return (
    <PageShell
      eyebrow={`${a.category} / ${a.minutes} MIN READ`}
      title={a.title}
      intro={a.subtitle}
    >
      <article className="wrap article-layout">
        <aside>
          <span className="eyebrow">IN THIS ARTICLE</span>
          <nav aria-label="Article sections">
            {a.sections.map((s, i) => (
              <a key={s.title} href={`#part-${i}`}>
                0{i + 1} / {s.title}
              </a>
            ))}
          </nav>
          <span className="article-credit">
            Chemizen Labs
            <br />
            Updated 5 October 2026
          </span>
        </aside>
        <div className="article-body">
          <ArticleVisual index={index} credit />
          {a.sections.map((s, i) => (
            <section id={`part-${i}`} className="article-section" key={s.title}>
              <h2>{s.title}</h2>
              <p>
                {s.text}
                {"source" in s && s.source !== undefined && (
                  <a
                    className="inline-citation"
                    href={a.references[s.source].url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {" "}
                    [{s.source + 1}]
                  </a>
                )}
              </p>
              {i === 2 && <ArticleFigure index={index} />}
            </section>
          ))}
          <div className="article-takeaway">
            <span className="eyebrow">KEY POINT</span>
            <p>{a.takeaway}</p>
          </div>
          <section className="article-references">
            <h2>Sources & further reading</h2>
            <ol>
              {a.references.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.label} ↗
                  </a>
                </li>
              ))}
            </ol>
            <p>
              Educational reading. Illustrations and example data are not
              Chemizen Labs research results or clinical guidance.
            </p>
          </section>
          <div className="article-related">
            <span className="eyebrow">RELATED TRAINING & SERVICES</span>
            <Link href={`/services/${a.service}`} className="text-link">
              Explore related research support <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </article>
      <div className="wrap page-callout">
        <Link href="/insights" className="text-link">
          More learning guides <ArrowUpRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
