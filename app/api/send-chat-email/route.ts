import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface ChatEmailMessage {
  role?: string;
  content?: string;
}

interface ChatEmailPayload {
  pageUrl?: string;
  timestamp?: string;
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

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
    }

    const data: ChatEmailPayload = await req.json();
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const timestamp = formatTimestamp(data.timestamp);
    const pageUrl = String(data.pageUrl || 'Niet opgegeven');
    const transcript = formatTranscript(messages);

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

Timestamp:
${timestamp}

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
