import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface ChatEmailMessage {
  role?: string;
  content?: string;
}

interface ChatEmailPayload {
  pageUrl?: string;
  timestamp?: string;
  conversationStartedAt?: string;
  contactDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
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

function formatContactDetails(contactDetails?: ChatEmailPayload['contactDetails']) {
  if (!contactDetails) {
    return 'Niet opgegeven.';
  }

  const name = String(contactDetails.name || '').trim() || 'Niet opgegeven';
  const email = String(contactDetails.email || '').trim() || 'Niet opgegeven';
  const phone = String(contactDetails.phone || '').trim() || 'Niet opgegeven';

  return [
    `Naam: ${name}`,
    `E-mail: ${email}`,
    `Telefoon: ${phone}`,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }

    const data: ChatEmailPayload = await req.json();
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const timestamp = formatTimestamp(data.timestamp);
    const conversationStartedAt = formatTimestamp(data.conversationStartedAt || data.timestamp);
    const pageUrl = String(data.pageUrl || 'Niet opgegeven');
    const transcript = formatTranscript(messages);
    const contactDetails = formatContactDetails(data.contactDetails);

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send chat email API error:', error);
    return NextResponse.json({ error: 'Failed to send chat email' }, { status: 500 });
  }
}
