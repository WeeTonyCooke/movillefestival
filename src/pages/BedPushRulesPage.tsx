import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function BedPushRulesPage() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/bed-push" className="legal-back">← Back to Bed Push</Link>

        <h1>Bed Push Race — Rules & Safety</h1>
        <p className="legal-updated">Moville Summer Festival 2026</p>

        <p>
          The Great Bed Push Race is intended to be a fun community event. Please race
          safely, respect the marshals and other teams, and help make it an enjoyable
          evening for everyone.
        </p>
        <p>
          The race takes place at Festival Square and Quay Street on Wednesday 8 July
          2026. Teams push a decorated bed along the course as fast as they can.
        </p>

        <h2>Event details</h2>
        <ul>
          <li><strong>Date:</strong> Wednesday 8 July 2026</li>
          <li><strong>Scrutineering:</strong> 6.30pm sharp, Festival Square</li>
          <li><strong>Race start:</strong> 7pm</li>
          <li><strong>Location:</strong> Festival Square &amp; Quay Street, Moville</li>
        </ul>

        <h2>Eligibility</h2>
        <ul>
          <li>Each team consists of five participants: four pushers and one rider.</li>
          <li>All participants must be over 16. The team captain must be over 18.</li>
          <li>Participants under 18 must have written consent from a parent or guardian, provided by countersigning the waiver at scrutineering.</li>
          <li>A maximum of 20 teams can enter. Registrations close when capacity is reached.</li>
        </ul>

        <h2>Safety</h2>
        <ul>
          <li>All beds must pass a safety inspection ("scrutineering") at 6.30pm sharp at Festival Square before the race.</li>
          <li>Helmets are mandatory for all riders. No helmet, no race — enforced without exception.</li>
          <li>Marshals may stop a team's run at any time if they consider it unsafe.</li>
          <li>The race is physically demanding. Only take part if you are medically fit to do so.</li>
          <li>Every team member must sign the participation waiver at scrutineering before racing.</li>
        </ul>

        <h2>Conduct</h2>
        <ul>
          <li>Follow marshal instructions at all times.</li>
          <li>No pushing, blocking, or interference with other teams.</li>
          <li>Unsportsmanlike conduct may result in disqualification.</li>
        </ul>

        <h2>Insurance &amp; liability</h2>
        <p>
          The Bed Push Race takes place on public streets and involves an element of
          risk. Participants take part at their own risk. The organisers do not provide
          insurance for participants, their equipment or their property. By entering
          and signing the event waiver, participants agree to follow the instructions
          of marshals and organisers and accept responsibility for their own actions
          and those of their team, to the fullest extent permitted by law.
        </p>

        <h2>Refund policy</h2>
        <p>
          Entry fees are non-refundable once registered, unless the event is cancelled
          by the organisers. If the event is cancelled, a full refund will be issued to
          the original payment method.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Contact us at{' '}
          <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.
        </p>

        <div className="legal-footer">
          <Link to="/bed-push">Register your team</Link>
          {' · '}
          <Link to="/">Back to Moville Summer Festival</Link>
        </div>
      </div>
    </div>
  );
}
