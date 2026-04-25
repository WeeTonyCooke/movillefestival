import { Link } from 'react-router-dom';
import './gettingtomoville.css';

function GettingToMoville() {
  return (
    <div className="getting-page">
      <div className="getting-bg" aria-hidden="true" />

      <div className="getting-content page-shell--narrow">
        <header className="getting-header">
          <div className="getting-header-top">
            <Link to="/programme" className="getting-back" aria-label="Back to programme">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>

            <div className="getting-header-meta">
              <h1 className="getting-title">Getting to Moville</h1>
            </div>
          </div>
        </header>

        <main className="getting-card">
          <p className="getting-intro">
            Moville sits on the Inishowen Peninsula in north Donegal, looking
            out across Lough Foyle. However you choose to travel, you will be
            very welcome.
          </p>

          <section className="getting-section">
            <h2>By Car</h2>
            <p>
              From Derry, take the A2 / R238 along the shore of Lough Foyle -
              about 30 minutes. From Letterkenny, follow the N13 and R238
              through Inishowen, roughly an hour.
            </p>
          </section>

          <section className="getting-section">
            <h2>By Bus</h2>
            <p>
              The North West Busways service runs daily from Derry / Buncrana
              into Moville, dropping you in the centre of the village just
              steps from Market Square.
            </p>
          </section>

          <section className="getting-section">
            <h2>By Air</h2>
            <p>
              The closest airports are City of Derry (about 40 minutes by car)
              and Belfast International (around 2 hours). Dublin Airport is a
              3 hour drive.
            </p>
          </section>

          <section className="getting-section">
            <h2>Parking</h2>
            <p>
              Free parking is available along the seafront and behind Market
              Square. Festival days are busy, so allow a little extra time and
              consider walking the last few minutes into the centre.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default GettingToMoville;
