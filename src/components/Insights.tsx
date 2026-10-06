import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { articles } from "@/lib/articles";
export function ArticleVisual({
  index,
  credit = false,
}: {
  index: number;
  credit?: boolean;
}) {
  const article = articles[index];
  return (
    <figure className="article-photo">
      <div className={`article-visual article-visual-${index}`}>
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 760px) 90vw, (max-width: 1200px) 45vw, 800px"
        />
      </div>
      {credit && (
        <figcaption>
          Photo:{" "}
          <a href={article.photoUrl} target="_blank" rel="noreferrer">
            {article.photographer} / Unsplash
          </a>
          . {article.photoContext}
        </figcaption>
      )}
    </figure>
  );
}
export function Insights({ listing = false }: { listing?: boolean }) {
  return (
    <section className={listing ? "insights-listing" : "section insights"}>
      <div className="wrap">
        {!listing && (
          <div className="section-top">
            <div>
              <span className="eyebrow">04 / LEARNING RESOURCES</span>
              <h2>
                Read about docking,
                <br />
                <em>ADMET and CADD.</em>
              </h2>
            </div>
            <Link href="/insights" className="text-link">
              Read all guides <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
        <div className="insight-grid">
          {articles.map((a, i) => (
            <Link
              href={`/insights/${a.slug}`}
              className="insight-card"
              key={a.slug}
            >
              <ArticleVisual index={i} />
              <div className="article-meta">
                <span>{a.category}</span>
                <span>{a.minutes} MIN READ</span>
              </div>
              <h3>
                {a.title}
                <ArrowUpRight size={22} />
              </h3>
              <p>{a.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
