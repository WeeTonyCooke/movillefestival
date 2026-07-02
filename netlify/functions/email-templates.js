export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function ballDropEmail(registration) {
  const name = escapeHtml(registration.full_name);
  const numbers = registration.ball_numbers || [];
  const numbersList = numbers.map(n =>
    `<span style="display:inline-block; background:#1F4E5F; color:#fff; font-weight:bold; font-size:22px; padding:10px 16px; border-radius:6px; margin:4px;">${n}</span>`
  ).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Ball Drop &middot; Sunday 12 July &middot; Shore Green</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">You're in the Ball Drop!</h2>
        <p>Hi ${name},</p>
        <p>Payment confirmed. Here are your ball number${numbers.length > 1 ? 's' : ''}:</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 24px 20px; margin: 24px 0; text-align: center;">
          <div style="margin-bottom: 12px;">${numbersList}</div>
          <p style="margin: 12px 0 0; font-size: 13px; color: #666;">Keep these safe — the committee will contact winners directly after the draw.</p>
        </div>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Entry</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${numbers.length} ball${numbers.length > 1 ? 's' : ''}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€${(registration.amount_paid / 100).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Event</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Shore Green &middot; Sunday 12 July</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Time</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">5.30pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Prizes</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">1st €500 &middot; 2nd €300 &middot; 3rd €150</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>You don't need to be present to win</strong>
          <p style="margin: 4px 0 0;">If your ball is a winner, the festival committee will contact you directly using the details you provided.</p>
        </div>
        <p>Good luck on 12 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

export function craftFairEmail(registration) {
  const name = escapeHtml(registration.full_name);
  const business = escapeHtml(registration.business_name);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Craft Fair &middot; Saturday 11 July &middot; Festival Square</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">Your stall is booked!</h2>
        <p>Hi ${name},</p>
        <p>Payment confirmed. Your stall at the Moville Summer Festival Craft Fair is secured.</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your booking</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Stallholder</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${name}</td></tr>
            ${business ? `<tr><td style="padding: 6px 0; color: #666;">Business</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${business}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€20.00</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Saturday 11 July 2026</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Fair opens</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">10am – 2pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Setup from</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">9am</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Venue</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Marquee, Festival Square</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>WhatsApp group</strong>
          <p style="margin: 4px 0 0;">You'll be added to a WhatsApp group with all stallholders for event updates closer to the day.</p>
        </div>
        <div style="border-left: 4px solid #6BAFA7; padding: 12px 16px; margin: 16px 0; background: #f5fafa;">
          <strong>What to know on the day</strong>
          <p style="margin: 4px 0 0;">A 6ft trestle table will be provided. Please note that electricity is not available at this event.</p>
        </div>
        <p>We look forward to seeing you on 11 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

export function bedPushEmail(registration) {
  const captain = escapeHtml(registration.captain_name);
  const team = escapeHtml(registration.team_name);
  const org = escapeHtml(registration.organisation);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0 0 6px; font-size: 24px;">Moville Summer Festival 2026</h1>
        <p style="color: rgba(255,255,255,0.75); margin: 0; font-size: 13px;">Bed Push Race &middot; Wednesday 8 July &middot; Quay Street</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1F4E5F;">You're registered!</h2>
        <p>Hi ${captain},</p>
        <p>Payment confirmed. Your spot in the Great Bed Push Race is secured.</p>
        <div style="background: #F4E9D8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 16px; color: #1F4E5F;">Your entry</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #666;">Team</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${team}</td></tr>
            ${org ? `<tr><td style="padding: 6px 0; color: #666;">Organisation</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${org}</td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #666;">Captain</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">${captain}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Amount paid</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">€50.00</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Wednesday 8 July 2026</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Start time</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">6pm for 6.30pm</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Venue</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">Festival Square &amp; Quay Street</td></tr>
          </table>
        </div>
        <div style="border-left: 4px solid #F26A4B; padding: 12px 16px; margin: 16px 0; background: #fff8f6;">
          <strong>Arrive from 6pm. Scrutineering starts at 6.30pm sharp — Festival Square</strong>
          <p style="margin: 4px 0 0;">All beds must pass inspection by Paddy and Paddy before the race. No helmet = no race. Don't be late.</p>
        </div>
        <p>Please make sure your whole team has read the <a href="https://movillefestival.com/bed-push-rules">Bed Push race rules and safety information</a> before the day.</p>
        <p>See you on Quay Street on 8 July. Questions? <a href="mailto:movillefestival@gmail.com">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}

export function sponsorshipEmail(s) {
  const amount = `€${(s.amount_paid / 100).toFixed(0)}`;
  const business = escapeHtml(s.business_name);
  const contact = escapeHtml(s.contact_name);
  const receiptRef = s.stripe_session_id ? s.stripe_session_id.slice(-8).toUpperCase() : 'N/A';
  const date = new Date(s.created_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #1F4E5F; padding: 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Moville Summer Festival 2026</h1>
        <p style="color: #6BAFA7; margin: 6px 0 0;">8–12 July · Moville, Co. Donegal</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #1F4E5F; margin-top: 0;">Sponsorship Receipt</h2>
        <p>Hi ${contact}, thank you so much for sponsoring Moville Summer Festival 2026. This email is your receipt — we really appreciate your support and it means a lot to the community.</p>
        <div style="background: #f9f6f2; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #F26A4B;">
          <p style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Receipt details</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Receipt ref</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${receiptRef}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Date</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${date}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Sponsor</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${business}</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Description</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">Sponsorship — Moville Summer Festival 2026</td></tr>
            <tr><td style="padding: 7px 0; color: #666; border-bottom: 1px solid #eee;">Payment method</td><td style="padding: 7px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">Card</td></tr>
            <tr><td style="padding: 7px 0; color: #666; font-weight: bold; font-size: 15px;">Amount paid</td><td style="padding: 7px 0; font-weight: bold; text-align: right; font-size: 15px; color: #1F4E5F;">${amount}</td></tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #666;">Foyle Festival Committee · movillefestival.com</p>
        <p style="font-size: 13px;">Questions? <a href="mailto:movillefestival@gmail.com" style="color: #1F4E5F;">movillefestival@gmail.com</a></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        Moville Summer Festival 2026 &middot; movillefestival.com &middot; movillefestival@gmail.com
      </div>
    </div>
  `;
}
