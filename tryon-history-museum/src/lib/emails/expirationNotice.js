/**
 * Expiration Notice Email — sent on the day membership expires.
 */
export function expirationNoticeEmail({ firstName }) {
  return {
    subject: "Your Tryon History Museum membership has expired",
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
              Your membership at the Tryon History Museum expired today.
            </p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 28px;">
              We'd love to have you back — renew now to restore your benefits and continue supporting Tryon's story.
            </p>
            <!-- Button -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#C4A35A;padding:14px 32px;">
                  <a href="https://tryonhistorymuseum.org/member/renew" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1A1311;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                    Renew Now
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-family:Georgia,serif;font-size:15px;color:rgba(26,19,17,0.6);line-height:1.7;margin:28px 0 0;">
              Even as a past member, you're always welcome at the museum. We hope to see you again soon.
            </p>
            <p style="font-family:Georgia,serif;font-size:15px;color:#1A1311;line-height:1.7;margin:20px 0 0;">
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
