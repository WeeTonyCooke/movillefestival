import './HoldingPage.css';

export default function HoldingPage() {
  return (
    <main className="holding-page">
      <section className="holding-hero" aria-labelledby="holding-title">
        <picture className="holding-picture">
          <source media="(min-width: 760px)" srcSet="/moville-light-dawn-desktop.jpeg" />
          <img src="/mobile_lighthouse_dawn.webp" alt="Moville lighthouse on Lough Foyle at dawn" fetchPriority="high" />
        </picture>
        <div className="holding-shade" aria-hidden="true" />
        <header className="holding-heading">
          <p className="holding-eyebrow">Inishowen · Since 1958</p>
          <h1 id="holding-title">Moville Festival <span>2027</span></h1>
        </header>
        <div className="holding-announcement">
          <p className="holding-return">See you by the water.</p>
          <div className="holding-rule" aria-hidden="true" />
          <h2>Dates &amp; programme coming soon</h2>
          <p>Our next chapter is on the horizon.<br />Check back here for news of Moville Festival 2027.</p>
        </div>
        <p className="holding-place">Moville · Inishowen · Donegal</p>
      </section>
      <footer className="holding-footer">
        <span>Bringing our community together since 1958.</span>
        <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
        <a className="holding-credit" href="mailto:hello@quietobjects.ie?subject=Collaboration" aria-label="Website by MCA — email about collaboration"><img src="/mca-logo-dark.svg" alt="MCA" width="34" height="12" /><span>Website by MCA</span></a>
      </footer>
    </main>
  );
}
