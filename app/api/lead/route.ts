import { NextRequest, NextResponse } from 'next/server';

interface LeadData {
  website?: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  need: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: LeadData = await req.json();

    // Basic validation
    if (!data.name || !data.email || !data.company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString('nl-NL', {
      timeZone: 'Europe/Amsterdam',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const emailBody = `
Nieuwe lead via AIChecked.nl chatbot
=====================================
Ontvangen op: ${timestamp}

Website:    ${data.website || 'Niet opgegeven'}
Naam:       ${data.name}
Bedrijf:    ${data.company}
E-mail:     ${data.email}
Telefoon:   ${data.phone || 'Niet opgegeven'}

Hulpvraag:
${data.need}

=====================================
Dit bericht is automatisch gegenereerd door de AIChecked.nl chatbot.
    `.trim();

    // Use Resend if available, otherwise fall back to a basic nodemailer-style request
    // or just log it. In production, configure your preferred email provider.
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'chatbot@aichecked.nl',
          to: ['info@aichecked.nl'],
          subject: `🤖 Nieuwe chatbot lead: ${data.name} (${data.company})`,
          text: emailBody,
        }),
      });

      if (!res.ok) {
        console.error('Resend error:', await res.text());
      }
    } else {
      // Fallback: log to console (replace with your email provider in production)
      console.log('=== NEW LEAD ===');
      console.log(emailBody);
      console.log('===============');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead API error:', error);
    return NextResponse.json({ error: 'Failed to process lead' }, { status: 500 });
  }
}
