/**
 * Welcome Email — sent to new members after their first Stripe payment.
 */
export function welcomeEmail({ firstName, expirationDate, amount }) {
  const amountFormatted = amount != null
    ? `$${Number(amount).toFixed(2)}`
    : "$50.00";
  return {
    subject: "Welcome to the Tryon History Museum",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFDF9;border:1px solid rgba(123,45,38,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1B2A4A;padding:28px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:18px;color:#FAF7F4;letter-spacing:0.08em;">
              TRYON HISTORY MUSEUM
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">
              Dear ${firstName},
            </p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">
              Welcome — and thank you for becoming a member of the Tryon History Museum. Your membership is now active through <strong>${expirationDate}</strong>.
            </p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 28px;">
              Your support helps us preserve and share the stories of this community. We're glad you're part of it.
            </p>
            <!-- Receipt block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#F5F2EE;border:1px solid rgba(26,19,17,0.1);padding:24px 28px;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#1A1311;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 16px;">Membership Receipt</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Organization</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;text-align:right;padding:3px 0;">Tryon History Museum</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Federal Tax ID</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;text-align:right;padding:3px 0;">47-1736984</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Description</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;text-align:right;padding:3px 0;">Annual Membership — Tryon History Museum</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Amount paid</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1A1311;text-align:right;padding:3px 0;">${amountFormatted}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Membership valid through</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;text-align:right;padding:3px 0;">${expirationDate}</td>
                    </tr>
                  </table>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.5);line-height:1.6;margin:16px 0 0;">The Tryon History Museum is a 501(c)(3) nonprofit organization. In exchange for your ${amountFormatted} membership contribution, you received the following benefits: free admission, museum newsletter, 10% gift shop discount, and members-only events. Please consult your tax advisor regarding the deductible portion of your contribution.</p>
                </td>
              </tr>
            </table>
            <!-- Button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#C4A35A;padding:14px 32px;">
                  <a href="https://tryonhistorymuseum.org/membership" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1A1311;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                    Learn About Your Benefits
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-family:Georgia,serif;font-size:15px;color:#1A1311;line-height:1.7;margin:28px 0 0;">
              Warmly,<br />The Tryon History Museum Team
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(123,45,38,0.08);text-align:center;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.4);margin:0;line-height:1.6;">
              Tryon History Museum · 26 Maple Street, Tryon NC 28782<br />
              <a href="mailto:info@tryonhistorymuseum.org" style="color:#C4A35A;text-decoration:none;">info@tryonhistorymuseum.org</a>
              · <a href="https://tryonhistorymuseum.org" style="color:#C4A35A;text-decoration:none;">tryonhistorymuseum.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  };
}
