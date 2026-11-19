/**
 * Event Ticket Confirmation Email — sent after a verified Stripe payment
 * for a ticketed event order (payment_type: "event_ticket").
 */
export function eventTicketConfirmationEmail({
  firstName,
  eventTitle,
  eventDateLabel,
  eventTime,
  venueName,
  venueAddress,
  attendeeCount,
  attendeeNames,
  ticketSummary,
  amountFormatted,
  orderReference,
  calendarUrl,
  refundPolicy,
  contactEmail = "info@tryonhistorymuseum.org",
  contactPhone = "(828) 440-1116",
}) {
  const attendeeRows = (attendeeNames || [])
    .map(
      (n) => `
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${n}</td>
                    </tr>`
    )
    .join("");

  const refundBlock = refundPolicy
    ? `
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.55);line-height:1.6;margin:0 0 20px;">
              <strong>Refund policy:</strong> ${refundPolicy}
            </p>`
    : "";

  return {
    subject: `Your tickets — ${eventTitle}`,
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
          <td style="background:#7B2D26;padding:28px 40px;text-align:center;">
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
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 24px;">
              Thank you — your tickets for <strong>${eventTitle}</strong> are confirmed. We look forward to seeing you.
            </p>
            <!-- Event block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#F5F0EB;border:1px solid rgba(123,45,38,0.12);padding:24px 28px;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#7B2D26;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 14px;">Event Details</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;width:130px;">Event</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${eventTitle}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Date</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${eventDateLabel}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Time</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${eventTime}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Venue</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${venueName}<br/>${venueAddress}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Tickets</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${ticketSummary}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Attendees</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;padding:3px 0;">${attendeeCount} guest${attendeeCount === 1 ? "" : "s"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Amount paid</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;font-weight:bold;padding:3px 0;">${amountFormatted}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.55);padding:3px 0;">Reference</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1311;font-family:monospace;padding:3px 0;">${orderReference}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            ${attendeeRows ? `
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:rgba(26,19,17,0.5);letter-spacing:0.14em;text-transform:uppercase;margin:0 0 8px;">Guest List</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${attendeeRows}
            </table>` : ""}
            <p style="margin:0 0 24px;">
              <a href="${calendarUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#FFFDF9;background:#7B2D26;padding:14px 28px;text-decoration:none;">Add to Calendar</a>
            </p>
            <p style="font-family:Georgia,serif;font-size:15px;color:#1A1311;line-height:1.7;margin:0 0 20px;">
              Please note: this tasting is for guests 21 and older. Valid photo identification is required at the door.
            </p>
            ${refundBlock}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(26,19,17,0.6);line-height:1.7;margin:0;">
              Questions? Contact us at
              <a href="mailto:${contactEmail}" style="color:#7B2D26;">${contactEmail}</a>
              or ${contactPhone}.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(26,19,17,0.08);">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(26,19,17,0.4);margin:0;text-align:center;">
              Tryon History Museum &amp; Visitor Center · 26 Maple Street, Tryon, NC 28782
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  };
}
