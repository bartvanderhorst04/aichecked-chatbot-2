import { NextRequest, NextResponse } from 'next/server';
import {
  createLeadIdempotencyKey,
  type LeadContactDetails,
  validateLeadContact,
} from './lead-validation';

interface ChatEmailMessage {
  role?: string;
  content?: string;
}

interface ChatEmailPayload {
  pageUrl?: string;
  timestamp?: string;
  conversationStartedAt?: string;
  contactDetails?: LeadContactDetails;
  messages?: ChatEmailMessage[];
}

function formatTimestamp(value?: string) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return safeDate.toLocaleString('nl-NL', {
    timeZone: 'Europe/Amsterdam',
    dateStyle: 'full',
    timeStyle: 'medium',
  });
}

function formatTranscript(messages: ChatEmailMessage[] = []) {
  if (!messages.length) {
    return 'Geen gesprek beschikbaar.';
  }

  return messages
    .map((message, index) => {
      const role = message.role === 'user' ? 'Gebruiker' : 'Chatbot';
      const content = String(message.content || '').trim() || '[Leeg bericht]';

      return `${index + 1}. ${role}: ${content}`;
    })
    .join('\n\n');
}

function formatContactDetails(contactDetails: LeadContactDetails) {
  return [
    `Naam: ${contactDetails.name}`,
    `E-mail: ${contactDetails.email || 'Niet opgegeven'}`,
    `Telefoon: ${contactDetails.phone || 'Niet opgegeven'}`,
    `Website: ${contactDetails.website || 'Niet opgegeven'}`,
    `Bedrijf: ${contactDetails.company || 'Niet opgegeven'}`,
    `Hulpvraag: ${contactDetails.need || 'Niet opgegeven'}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }

    const data: ChatEmailPayload = await req.json();
    const validation = validateLeadContact(data.contactDetails);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const messages = Array.isArray(data.messages) ? data.messages : [];
    const timestamp = formatTimestamp(data.timestamp);
    const conversationStartedAt = formatTimestamp(data.conversationStartedAt || data.timestamp);
    const pageUrl = String(data.pageUrl || 'Niet opgegeven');
    const transcript = formatTranscript(messages);
    const contactDetails = formatContactDetails(validation.contactDetails);
    const idempotencyKey = createLeadIdempotencyKey(validation.contactDetails);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: 'AIChecked Chatbot <chatbot@aichecked.nl>',
        to: ['info@aichecked.nl'],
        subject: 'Nieuwe chatbot aanvraag - AIChecked.nl',
        text: `
Nieuwe chatbot aanvraag - AIChecked.nl
=====================================

Pagina URL:
${pageUrl}

Datum en tijd gesprek:
${conversationStartedAt}

E-mail verzonden op:
${timestamp}

Contactgegevens:
${contactDetails}

Volledig gesprek:
${transcript}
      `.trim(),
      }),
    });

    if (!resendResponse.ok) {
      console.error('Resend error:', resendResponse.status, await resendResponse.text());
      return NextResponse.json({ error: 'Failed to send lead notification' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send chat email API error:', error);
    return NextResponse.json({ error: 'Failed to send chat email' }, { status: 500 });
  }
}
