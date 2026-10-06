export function ArticleFigure({ index }: { index: number }) {
  if (index === 1)
    return (
      <figure className="article-figure">
        <span className="eyebrow">
          A READING EXERCISE / ILLUSTRATIVE DATA ONLY
        </span>
        <h3>Three profiles. Different questions.</h3>
        <div className="figure-table">
          <table>
            <caption>
              Fictional values for comparison practice — not experimental
              results or a drug-likeness score.
            </caption>
            <thead>
              <tr>
                <th>Compound</th>
                <th>Molecular weight (g/mol)</th>
                <th>Example logP</th>
                <th>H-bond donors</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A", 280, 2.1, 2],
                ["B", 410, 3.8, 1],
                ["C", 330, 1.4, 4],
              ].map(([name, mw, logp, hbd]) => (
                <tr key={name}>
                  <th>{name}</th>
                  <td>
                    <span
                      className="data-bar"
                      style={{ width: `${Number(mw) / 5}px` }}
                    />
                    {mw}
                  </td>
                  <td>{logp}</td>
                  <td>{hbd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <figcaption>
          These invented descriptors illustrate why one number cannot describe
          an entire molecular profile.
        </figcaption>
      </figure>
    );
  const steps =
    index === 0
      ? ["Question", "Prepare", "Dock", "Inspect", "Follow up"]
      : [
          "Source inputs",
          "Record settings",
          "Run analysis",
          "Trace outputs",
          "Share methods",
        ];
  return (
    <figure className="article-figure">
      <span className="eyebrow">
        {index === 0
          ? "FROM QUESTION TO FOLLOW-UP"
          : "A TRACEABLE RESEARCH PATH"}
      </span>
      <div className="process-figure">
        {steps.map((s, i) => (
          <div key={s}>
            <span>0{i + 1}</span>
            <strong>{s}</strong>
            {i < steps.length - 1 && <b aria-hidden="true">→</b>}
          </div>
        ))}
      </div>
      <figcaption>
        {index === 0
          ? "Conceptual workflow: each output should lead to a question you can examine."
          : "Suggested project structure. Preserve the connection between each step and the next."}
      </figcaption>
    </figure>
  );
}
