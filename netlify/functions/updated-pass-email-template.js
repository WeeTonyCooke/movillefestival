// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the emailHtml variable in stripe-webhook-pass-addition.js with this.
// The email no longer tries to embed a QR — instead it links to /passes/view
// which shows the full gate-ready pass on the buyer's phone.
// ─────────────────────────────────────────────────────────────────────────────

const siteUrl = process.env.URL || 'https://movillefestival.com';
const passViewUrl = `${siteUrl}/passes/view?ref=${encodeURIComponent(passRef)}`;

const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4E9D8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4E9D8;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1F4E5F;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
          <p style="margin:0;font-size:26px;color:#fff;font-weight:700;">
            Moville Summer Festival 2026
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:2px;text-transform:uppercase;">
            Your Pass Is Confirmed
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:40px;">

          <p style="margin:0 0 8px;font-size:16px;color:#333;">Hi ${fullName},</p>
          <p style="margin:0 0 32px;font-size:16px;color:#333;line-height:1.6;">
            Your <strong>${passLabel}</strong> is confirmed and ready to use.
          </p>

          <!-- Pass summary card -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border-radius:12px;overflow:hidden;margin-bottom:32px;border:1px solid #eee;">
            <tr>
              <td style="background:${stubColour};padding:20px 24px;">
                <p style="margin:0 0 2px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                  ${passLabel}
                </p>
                <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">${fullName}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9f9f9;padding:16px 24px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td>
                      <p style="margin:0 0 2px;font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Date</p>
                      <p style="margin:0;font-size:15px;font-weight:600;color:#1F4E5F;">${passDate}</p>
                    </td>
                    <td style="text-align:right;">
                      <p style="margin:0 0 2px;font-size:11px;color:#aaa;letter-spacing:1px;text-transform:uppercase;">Pass Ref</p>
                      <p style="margin:0;font-size:18px;font-weight:800;color:#1F4E5F;letter-spacing:1.5px;">${passRef}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- PRIMARY CTA — the big button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td align="center">
                <a href="${passViewUrl}"
                   style="display:inline-block;padding:18px 40px;background:#1F4E5F;color:#fff;
                          text-decoration:none;font-size:17px;font-weight:700;border-radius:10px;
                          letter-spacing:0.5px;">
                  View Your Pass →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 6px;font-size:13px;color:#888;text-align:center;line-height:1.6;">
            Open this on your phone at the festival gate.<br>
            Your QR code and pass reference will be displayed.
          </p>

          <hr style="border:none;border-top:1px solid #eee;margin:28px 0;">

          <!-- Fine print -->
          <p style="margin:0 0 8px;font-size:13px;color:#777;line-height:1.6;">
            <strong>Each pass admits one person.</strong> If others are coming, each person needs their own pass purchased separately.
          </p>
          <p style="margin:0 0 20px;font-size:13px;color:#777;line-height:1.6;">
            Passes are non-refundable unless the event is cancelled by the organisers.
          </p>

          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#F4E9D8;border-radius:8px;padding:12px 20px;">
                <p style="margin:0;font-size:13px;color:#555;">
                  Amount paid: <strong>${amountStr}</strong>
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#1F4E5F;padding:24px 40px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);">
            Moville Summer Festival 2026 · movillefestival.com
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.4);">
            Problems with your pass? Email movillefestival@gmail.com
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
