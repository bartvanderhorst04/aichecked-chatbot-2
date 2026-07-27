import { NextRequest, NextResponse } from 'next/server';
import {
  processLeadSubmission,
  type ChatEmailMessage,
  type LeadSubmissionPayload,
  type ValidLeadSubmission,
} from './lead-notification';
import type { ValidLeadContactDetails } from './lead-validation';

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

function formatContactDetails(contactDetails: ValidLeadContactDetails) {
  return [
    `Naam: ${contactDetails.name}`,
    `E-mail: ${contactDetails.email || 'Niet opgegeven'}`,
    `Telefoon: ${contactDetails.phone || 'Niet opgegeven'}`,
    `Website: ${contactDetails.website || 'Niet opgegeven'}`,
    `Bedrijf: ${contactDetails.company || 'Niet opgegeven'}`,
    `Hulpvraag: ${contactDetails.need || 'Niet opgegeven'}`,
  ].join('\n');
}

async function sendLeadEmailWithResend(
  submission: ValidLeadSubmission,
  idempotencyKey: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const messages = Array.isArray(submission.messages) ? submission.messages : [];
  const timestamp = formatTimestamp(submission.timestamp);
  const conversationStartedAt = formatTimestamp(
    submission.conversationStartedAt || submission.timestamp
  );
  const pageUrl = String(submission.pageUrl || 'Niet opgegeven');
  const transcript = formatTranscript(messages);
  const contactDetails = formatContactDetails(submission.contactDetails);

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
    throw new Error('Failed to send lead notification');
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as LeadSubmissionPayload;
    const result = await processLeadSubmission(data, sendLeadEmailWithResend);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Send chat email API error:', error);
    return NextResponse.json({ error: 'Failed to send chat email' }, { status: 500 });
  }
}
