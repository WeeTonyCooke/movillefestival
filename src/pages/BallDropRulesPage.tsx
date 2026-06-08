import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function BallDropRulesPage() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/ball-drop" className="legal-back">← Back to Ball Drop</Link>

        <h1>Ball Drop Rules</h1>
        <p className="legal-updated">Moville Summer Festival 2026</p>

        <p>
          The Great Ball Drop is the centrepiece fundraiser of Moville Summer Festival.
          1,200 numbered balls are released at Shore Green on Sunday 12 July 2026.
          The first three balls down win cash prizes.
        </p>

        <h2>Event details</h2>
        <ul>
          <li><strong>Date:</strong> Sunday 12 July 2026</li>
          <li><strong>Time:</strong> 5.30pm</li>
          <li><strong>Location:</strong> Shore Green, Moville</li>
        </ul>

        <h2>Prizes</h2>
        <ul>
          <li><strong>1st Prize:</strong> €500 cash</li>
          <li><strong>2nd Prize:</strong> €300 cash</li>
          <li><strong>3rd Prize:</strong> €150 cash</li>
        </ul>

        <h2>How the winner is selected</h2>
        <ul>
          <li>1,200 numbered balls are released simultaneously at Shore Green.</li>
          <li>The first three balls down determine the winners.</li>
          <li>1st ball down wins €500, 2nd wins €300, 3rd wins €150.</li>
          <li>The festival committee records the winning ball numbers on the day.</li>
          <li>The committee's decision on the result is final.</li>
        </ul>

        <h2>Eligibility</h2>
        <ul>
          <li>You must be 18 or over to purchase a Ball Drop entry.</li>
          <li>You do not need to be present at Shore Green to win.</li>
          <li>Winners are contacted directly by the festival committee using the details provided at registration.</li>
        </ul>

        <h2>Purchasing</h2>
        <ul>
          <li>Entries are available online at €5 per ball or 5 balls for €20.</li>
          <li>Ball numbers are allocated automatically at the time of purchase.</li>
          <li>Your ball number or numbers are emailed to you immediately after payment.</li>
          <li>All payments are processed securely by Stripe.</li>
        </ul>

        <h2>Refund policy</h2>
        <p>
          Ball Drop entries are non-refundable once purchased, unless the event is cancelled
          by the organisers. If the event is cancelled, a full refund will be issued to the
          original payment method.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Contact us at{' '}
          <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.
        </p>

        <div className="legal-footer">
          <Link to="/ball-drop">Buy Ball Drop tickets</Link>
          {' · '}
          <Link to="/">Back to Moville Summer Festival</Link>
        </div>
      </div>
    </div>
  );
}
