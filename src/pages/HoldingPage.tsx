import React from 'react';
import './HoldingPage.css';

const HoldingPage: React.FC = () => {
  return (
    <main className="holding-page">
      <section className="content-section">
        <div className="section-container">
          <h2 className="section-heading">Programme</h2>

          <p>
            We’re currently preparing the next edition of Moville Festival.
            Music, food, pop-ups and more details will be announced soon.
          </p>

          <p>
            In the meantime, follow our updates and start planning your visit
            to Moville on the beautiful Inishowen Peninsula.
          </p>
        </div>
      </section>
    </main>
  );
};

export default HoldingPage;