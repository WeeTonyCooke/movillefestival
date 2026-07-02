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
          The Great Bed Push Race takes place at Festival Square and Quay Street on
          Wednesday 8 July 2026. Teams push a decorated bed along the course as fast
          as they can. Please read these rules carefully before registering — every
          team member should understand and agree to them.
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
          <li>Teams consist of exactly 5 participants — 4 pushers and 1 rider.</li>
          <li>All team members must be 16 or over. The team captain must be 18 or over.</li>
          <li>Anyone under 18 taking part must have the written consent of a parent or guardian, provided by countersigning the participation waiver at scrutineering.</li>
          <li>A maximum of 20 teams can enter. Registrations close when capacity is reached.</li>
        </ul>

        <h2>Safety</h2>
        <ul>
          <li>All beds must pass a safety inspection ("scrutineering") at 6.30pm sharp at Festival Square before the race.</li>
          <li>Helmets are mandatory for all riders. No helmet, no race — this is enforced without exception.</li>
          <li>Marshals and organisers may stop a team's run at any time if they consider it unsafe.</li>
          <li>The Bed Push Race is a physical event and involves an inherent risk of injury. Participants take part at their own risk.</li>
          <li>Participants should make sure they are medically fit to take part before entering.</li>
          <li>Every team member must sign the participation waiver at scrutineering before racing. A parent or guardian must countersign for anyone under 18. No signed waiver, no race.</li>
        </ul>

        <h2>Conduct</h2>
        <ul>
          <li>Follow marshal instructions at all times.</li>
          <li>No pushing, blocking, or interference with other teams.</li>
          <li>Unsportsmanlike conduct may result in disqualification.</li>
        </ul>

        <h2>Insurance &amp; liability</h2>
        <p>
          The Bed Push Race is a physical event run on public streets and involves an
          inherent risk of injury. The Bed Push Race is not covered by the festival&rsquo;s
          insurance, and no insurance cover is provided by the organisers for
          participants, their equipment, or their property. Participants take part
          entirely at their own risk.
        </p>
        <p>
          By registering, and by signing the participation waiver on the day, each team
          member: confirms they are medically fit to take part; agrees to follow all
          marshal and organiser instructions; accepts responsibility for injury, loss,
          or damage caused by their team&rsquo;s bed or conduct; and, to the fullest extent
          permitted by law, releases Moville Summer Festival, its committee, organisers,
          sponsors, and volunteers from all liability for injury, loss, or damage
          arising from participation in the Bed Push Race.
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
