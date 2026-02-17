import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { firstName, lastName, email, isMember, event } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 }
      );
    }

    // {TODO: connect to email service}
    // Replace this block with your preferred email/newsletter service
    // (e.g., Resend, Mailchimp, ConvertKit, SendGrid).
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Tryon History Museum <noreply@tryonhistorymuseum.org>',
    //   to: 'info@tryonhistorymuseum.org',
    //   subject: `[Interest List] ${event} — ${firstName} ${lastName}`,
    //   text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nMember: ${isMember ? "Yes" : "No"}\nEvent: ${event}`,
    // });

    console.log("Interest list submission:", {
      firstName,
      lastName,
      email,
      isMember,
      event,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Interest list error:", error);
    return NextResponse.json(
      { error: "Failed to submit." },
      { status: 500 }
    );
  }
}
