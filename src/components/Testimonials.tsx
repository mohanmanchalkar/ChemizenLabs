export function Testimonials() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <section className="testimonials section">
      <div className="wrap testimonial-layout">
        <div>
          <span className="eyebrow">03 / STUDENT FEEDBACK</span>
          <h2>
            Workshop
            <br />
            <em>reviews.</em>
          </h2>
          <span className="preview-label">DESIGN PREVIEW · NOT PUBLISHED</span>
        </div>
        <div className="testimonial-quote">
          <p>Student reviews will be added here.</p>
          <div className="quote-attribution">
            <span className="quote-avatar">—</span>
            <div>
              <strong>No reviews published yet</strong>
              <span>
                This section is hidden from the public site until reviews are
                available.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
