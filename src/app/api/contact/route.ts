import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fallbackSettings } from '@/lib/customer-data';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      message?: string;
    };

    if (!body.name || !body.phone || !body.message) {
      return NextResponse.json({ message: 'Please complete all contact fields.' }, { status: 400 });
    }

    const whatsappUrl = `https://wa.me/${fallbackSettings.whatsapp}?text=${encodeURIComponent(
      `Contact request from ${body.name}\nPhone: ${body.phone}\n\n${body.message}`,
    )}`;

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.ORDER_ALERT_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Kitchen Contact <onboarding@resend.dev>';

    if (!resendApiKey || !toEmail) {
      return NextResponse.json({
        message: 'Message saved locally. Please continue on WhatsApp for the fastest response.',
        whatsappUrl,
      });
    }

    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Contact request from ${body.name}`,
      text: `Name: ${body.name}\nPhone: ${body.phone}\n\nMessage:\n${body.message}`,
    });

    return NextResponse.json({
      message: 'Message sent successfully. We will get back to you soon.',
      whatsappUrl,
    });
  } catch {
    return NextResponse.json(
      {
        message: 'We could not send the contact form right now. Please continue on WhatsApp.',
        whatsappUrl: `https://wa.me/${fallbackSettings.whatsapp}`,
      },
      { status: 200 },
    );
  }
}

