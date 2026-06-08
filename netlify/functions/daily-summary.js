import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  schedule: '0 20 * * *', // 8pm every day (UTC — 9pm Irish Summer Time)
};

export async function handler() {
  try {
    // Ball Drop
    const { count: ballsSold } = await supabase
      .from('ball_drop_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid');

    const { data: ballRevenue } = await supabase
      .from('ball_drop_registrations')
      .select('amount_paid')
      .eq('status', 'paid');

    const ballTotalRevenue = (ballRevenue || []).reduce((sum, r) => sum + r.amount_paid, 0);

    const { count: ballNumbers } = await supabase
      .from('ball_drop_balls')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');

    const ballsRemaining = 700 - (ballNumbers || 0);

    // Bed Push
    const { count: teamsRegistered } = await supabase
      .from('bed_push_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid');

    const { data: bedRevenue } = await supabase
      .from('bed_push_registrations')
      .select('amount_paid')
      .eq('status', 'paid');

    const bedTotalRevenue = (bedRevenue || []).reduce((sum, r) => sum + r.amount_paid, 0);

    const teamsRemaining = 20 - (teamsRegistered || 0);

    // Craft Fair
    const { count: stallsBooked } = await supabase
      .from('craft_fair_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid');

    const { data: craftRevenue } = await supabase
      .from('craft_fair_registrations')
      .select('amount_paid')
      .eq('status', 'paid');

    const craftTotalRevenue = (craftRevenue || []).reduce((sum, r) => sum + r.amount_paid, 0);

    const stallsRemaining = 15 - (stallsBooked || 0);

    // Total revenue
    const totalRevenue = ballTotalRevenue + bedTotalRevenue + craftTotalRevenue;

    const formatEuro = (cents) => `€${(cents / 100).toFixed(2)}`;
    const date = new Date().toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    await resend.emails.send({
      from: 'Moville Summer Festival <noreply@movillefestival.com>',
      to: 'movillefestival@gmail.com',
      subject: `Festival Sales Summary — ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #1F4E5F; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">Moville Summer Festival 2026</h1>
            <p style="color: #a8c8d4; margin: 6px 0 0; font-size: 14px;">Daily Sales Summary — ${date}</p>
          </div>

          <div style="padding: 32px 24px;">

            <div style="background: #F4E9D8; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.05em;">Total Revenue to Date</p>
              <p style="margin: 4px 0 0; font-size: 32px; font-weight: bold; color: #1F4E5F;">${formatEuro(totalRevenue)}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="background: #1F4E5F;">
                <th style="padding: 10px 12px; text-align: left; color: #fff; font-size: 14px;">Event</th>
                <th style="padding: 10px 12px; text-align: center; color: #fff; font-size: 14px;">Sold</th>
                <th style="padding: 10px 12px; text-align: center; color: #fff; font-size: 14px;">Remaining</th>
                <th style="padding: 10px 12px; text-align: right; color: #fff; font-size: 14px;">Revenue</th>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: bold; color: #333;">🎱 Ball Drop</td>
                <td style="padding: 12px; text-align: center; color: #333;">${ballNumbers || 0} balls</td>
                <td style="padding: 12px; text-align: center; color: ${ballsRemaining < 100 ? '#c0392b' : '#27ae60'}; font-weight: bold;">${ballsRemaining} remaining</td>
                <td style="padding: 12px; text-align: right; color: #333;">${formatEuro(ballTotalRevenue)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee; background: #fafafa;">
                <td style="padding: 12px; font-weight: bold; color: #333;">🛏️ Bed Push Race</td>
                <td style="padding: 12px; text-align: center; color: #333;">${teamsRegistered || 0} teams</td>
                <td style="padding: 12px; text-align: center; color: ${teamsRemaining < 5 ? '#c0392b' : '#27ae60'}; font-weight: bold;">${teamsRemaining} remaining</td>
                <td style="padding: 12px; text-align: right; color: #333;">${formatEuro(bedTotalRevenue)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: bold; color: #333;">🎨 Craft Fair</td>
                <td style="padding: 12px; text-align: center; color: #333;">${stallsBooked || 0} stalls</td>
                <td style="padding: 12px; text-align: center; color: ${stallsRemaining < 3 ? '#c0392b' : '#27ae60'}; font-weight: bold;">${stallsRemaining} remaining</td>
                <td style="padding: 12px; text-align: right; color: #333;">${formatEuro(craftTotalRevenue)}</td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #888; text-align: center;">This summary is sent automatically every evening at 9pm Irish time.<br>Questions? Contact Anthony at movillefestival@gmail.com</p>
          </div>

          <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
            Moville Summer Festival 2026 · movillefestival.com
          </div>
        </div>
      `,
    });

    console.log('Daily summary email sent successfully');
    return { statusCode: 200, body: 'OK' };

  } catch (err) {
    console.error('Daily summary error:', err);
    return { statusCode: 500, body: 'Error' };
  }
}
