import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { companyName, contactPerson, phone, email, level, donationAmount, message } =
      await request.json();

    // Validate required fields
    if (!companyName || !contactPerson || !email || !level) {
      return NextResponse.json(
        { error: "Company name, contact person, email, and sponsorship level are required." },
        { status: 400 }
      );
    }

    // {TODO: connect form to email backend}
    // Replace with your preferred email service (Resend, SendGrid, etc.)
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Tryon History Museum <noreply@tryonhistorymuseum.org>',
    //   to: 'info@tryonhistorymuseum.org',
    //   subject: `[Sponsorship Inquiry] ${level} — ${companyName}`,
    //   text: `Company: ${companyName}\nContact: ${contactPerson}\nPhone: ${phone}\nEmail: ${email}\nLevel: ${level}\nDonation Amount: ${donationAmount || 'N/A'}\nMessage: ${message || 'N/A'}`,
    // });

    console.log("Sponsorship inquiry:", {
      companyName,
      contactPerson,
      phone,
      email,
      level,
      donationAmount,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sponsorship inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit." },
      { status: 500 }
    );
  }
}
