import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

/**
 * POST /api/auth/request-access
 * Body: { email: string }
 *
 * Sends a set-password / access link to the email on file for a member
 * who does not yet have an online account (auth_user_id is null), OR a
 * password-reset link for a member who has an account but is locked out.
 *
 * Always returns { sent: true } — never confirm whether the email is in
 * the system to a request that didn't already know the state.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const typedEmail = body?.email?.trim()?.toLowerCase();
  if (!typedEmail) {
    return NextResponse.json({ sent: true });
  }

  const supabase = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: member } = await supabase
    .from("members")
    .select("id, first_name, last_name, email, auth_user_id")
    .ilike("email", typedEmail)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ sent: true });
  }

  const emailOnFile = member.email;
  const origin = request.headers.get("origin") || "https://tryonhistorymuseum.org";
  const redirectTo = `${origin}/member/dashboard`;

  try {
    let actionLink;

    if (!member.auth_user_id) {
      // No auth account yet — generate an invite link (creates the Supabase auth user)
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "invite",
        email: emailOnFile,
        options: {
          data: { first_name: member.first_name, last_name: member.last_name },
          redirectTo,
        },
      });

      if (linkError) {
        console.error("[request-access] generateLink error:", linkError.message);
        return NextResponse.json({ sent: true });
      }

      actionLink = linkData?.properties?.action_link;

      if (linkData?.user?.id) {
        await supabase
          .from("members")
          .update({ auth_user_id: linkData.user.id })
          .eq("id", member.id);
      }
    } else {
      // Auth account exists — send a magic link (passwordless sign-in)
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: emailOnFile,
        options: { redirectTo },
      });

      if (linkError) {
        console.error("[request-access] generateLink error:", linkError.message);
        return NextResponse.json({ sent: true });
      }

      actionLink = linkData?.properties?.action_link;
    }

    if (!actionLink) {
      console.error("[request-access] No action_link returned");
      return NextResponse.json({ sent: true });
    }

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFDF9;border:1px solid rgba(123,45,38,0.08);">
        <tr>
          <td style="background:#1B2A4A;padding:28px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:18px;color:#FAF7F4;letter-spacing:0.08em;">TRYON HISTORY MUSEUM</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 20px;">
              Dear ${member.first_name},
            </p>
            <p style="font-family:Georgia,serif;font-size:16px;color:#1A1311;line-height:1.7;margin:0 0 28px;">
              Use the button below to access your member account. This link is valid for 24 hours and can only be used once.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#C4A35A;padding:14px 32px;">
                  <a href="${actionLink}" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#1A1311;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
                    Access My Account →
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.45);line-height:1.6;margin:0;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(123,45,38,0.08);text-align:center;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(26,19,17,0.4);margin:0;line-height:1.6;">
              Tryon History Museum · 26 Maple Street, Tryon NC 28782<br />
              <a href="mailto:info@tryonhistorymuseum.org" style="color:#C4A35A;text-decoration:none;">info@tryonhistorymuseum.org</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

    await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: emailOnFile,
      subject: "Access your Tryon History Museum account",
      html,
    });
  } catch (err) {
    console.error("[request-access] Error:", err.message);
  }

  return NextResponse.json({ sent: true });
}
