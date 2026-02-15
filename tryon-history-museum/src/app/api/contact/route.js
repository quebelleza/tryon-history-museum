import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Send email via a service. For now, we log and return success.
    // Replace this block with your preferred email service (e.g., Resend, SendGrid, Nodemailer).
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Tryon History Museum <noreply@tryonhistorymuseum.org>',
    //   to: 'info@tryonhistorymuseum.org',
    //   replyTo: email,
    //   subject: `[Website Contact] ${subject}`,
    //   text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    // });

    console.log("Contact form submission:", { name, email, subject, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
