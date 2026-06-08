import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/" className="legal-back">← Back to festival site</Link>

        <h1>Terms &amp; Conditions</h1>
        <p className="legal-updated">Last updated: June 2026</p>

        <p>These terms apply to all online registrations and purchases made through movillefestival.com. By completing a registration or purchase, you agree to these terms.</p>

        <h2>Ball Drop</h2>

        <h3>Entry</h3>
        <ul>
          <li>You must be 18 or over to purchase a Ball Drop entry.</li>
          <li>Ball Drop entries are available online at €5 per ball or 5 balls for €20.</li>
          <li>Ball numbers are allocated automatically at the time of purchase.</li>
          <li>You do not need to be present at Shore Green on the day to win.</li>
        </ul>

        <h3>Winner selection</h3>
        <ul>
          <li>The Ball Drop takes place on Sunday 12 July 2026 at Shore Green, Moville, at 5.30pm.</li>
          <li>1,200 numbered balls are released at Shore Green. The first three balls down determine the winners.</li>
          <li>First ball down wins 1st Prize (€500), second wins 2nd Prize (€300), third wins 3rd Prize (€150).</li>
          <li>Winners are identified by ball number. The festival committee will contact winners directly using the contact details provided at registration.</li>
          <li>The committee's decision on the result is final.</li>
        </ul>

        <h3>Refunds</h3>
        <p>Ball Drop entries are non-refundable once purchased, unless the event is cancelled by the organisers. If the event is cancelled, a full refund will be issued to the original payment method.</p>

        <h2>Bed Push Race</h2>

        <h3>Entry</h3>
        <ul>
          <li>Teams consist of exactly 5 participants — 4 pushers and 1 rider.</li>
          <li>All team members must be over 16. The team captain must be over 18.</li>
          <li>The entry fee is €50 per team, paid online at the time of registration.</li>
          <li>A maximum of 20 teams can enter. Registrations close when capacity is reached.</li>
        </ul>

        <h3>On the day</h3>
        <ul>
          <li>The Bed Push Race takes place on Wednesday 8 July 2026 at Festival Square and Quay Street, Moville.</li>
          <li>Scrutineering takes place at 6pm sharp at Festival Square. All beds must pass a safety inspection before the race.</li>
          <li>No helmet = no race. This rule will be enforced without exception.</li>
          <li>The race starts at 6.30pm.</li>
        </ul>

        <h3>Refunds</h3>
        <p>Entry fees are non-refundable once registered, unless the event is cancelled by the organisers. If the event is cancelled, a full refund will be issued to the original payment method.</p>

        <h2>Craft Fair</h2>

        <h3>Booking</h3>
        <ul>
          <li>Stall bookings are allocated on a first come, first served basis.</li>
          <li>Payment of €20 is required at the time of booking to secure your stall.</li>
          <li>A maximum of 15 stalls are available.</li>
          <li>You must be 18 or over to book a stall.</li>
        </ul>

        <h3>On the day</h3>
        <ul>
          <li>The Craft Fair takes place on Saturday 11 July 2026 at the Marquee, Festival Square, Moville.</li>
          <li>The fair opens at 10am and closes at 2pm.</li>
          <li>Stallholders may arrive from 9am to set up.</li>
          <li>A 6ft trestle table is provided for each stall. No electricity is available.</li>
          <li>All stallholders will be added to a WhatsApp group for updates closer to the day.</li>
        </ul>

        <h3>Refunds</h3>
        <p>Stall bookings are non-refundable once made, unless the event is cancelled by the organisers. If the event is cancelled, a full refund will be issued to the original payment method.</p>

        <h2>Payments</h2>
        <p>All payments are processed securely by Stripe. Moville Summer Festival does not store your payment card details. In the event of a payment failure, no charge is made and no registration is created.</p>

        <h2>Data</h2>
        <p>By completing a registration or purchase, you agree that Moville Summer Festival may contact you regarding your registration. Please see our <Link to="/privacy">Privacy Policy</Link> for full details of how we handle your information.</p>

        <h2>Contact</h2>
        <p>If you have any questions about these terms, please contact us at <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.</p>

        <div className="legal-footer">
          <Link to="/">Back to Moville Summer Festival</Link>
        </div>
      </div>
    </div>
  );
}
