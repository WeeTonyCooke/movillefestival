import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <Link to="/" className="legal-back">← Back to festival site</Link>

        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 2026</p>

        <p>Moville Summer Festival is a community festival run by a voluntary committee in Moville, Co. Donegal. We take your privacy seriously and aim to be clear and straightforward about how we handle your information.</p>

        <h2>What information we collect</h2>
        <p>When you register for a festival event or purchase a Ball Drop entry online, we collect:</p>
        <ul>
          <li>Your full name</li>
          <li>Your email address</li>
          <li>Your phone number</li>
          <li>Your town or country (Ball Drop only, optional)</li>
          <li>Your business or trading name (Craft Fair only, optional)</li>
        </ul>
        <p>We do not collect or store your payment card details. All payments are processed securely by Stripe. You can read Stripe's privacy policy at <a href="https://stripe.com/ie/privacy" target="_blank" rel="noopener noreferrer">stripe.com/ie/privacy</a>.</p>

        <h2>Why we collect it</h2>
        <p>We collect this information to:</p>
        <ul>
          <li>Process your registration or purchase</li>
          <li>Send you a confirmation email with your booking details</li>
          <li>Contact you if you win a prize in the Ball Drop</li>
          <li>Contact you if there are any changes to an event you have registered for</li>
          <li>Add you to the Craft Fair stallholder WhatsApp group (Craft Fair only)</li>
        </ul>
        <p>We will not use your information for marketing or share it with third parties outside of what is necessary to run the festival.</p>

        <h2>How long we keep it</h2>
        <p>We keep your registration and contact information for 18 months after the end of the festival. This allows us to reference it during planning for the following year's festival. After 18 months, all personal data is permanently deleted.</p>

        <h2>Your rights</h2>
        <p>You have the right to ask us to:</p>
        <ul>
          <li>Tell you what information we hold about you</li>
          <li>Correct any information that is wrong</li>
          <li>Delete your information before the 18-month period ends</li>
        </ul>
        <p>To make any of these requests, email us at <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a> and we will respond within 30 days.</p>

        <h2>Cookies</h2>
        <p>This website does not use tracking cookies or analytics. We do not track your behaviour on the site or share data with advertising networks.</p>

        <h2>Contact</h2>
        <p>If you have any questions about this privacy policy, please contact us at <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a>.</p>

        <div className="legal-footer">
          <Link to="/">Back to Moville Summer Festival</Link>
        </div>
      </div>
    </div>
  );
}
