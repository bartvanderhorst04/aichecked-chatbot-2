import { NextRequest, NextResponse } from 'next/server';
import { cleanText } from '@/lib/guardrails';
import { sendContactMail } from '@/lib/mail';
import { contactTypeFor, type ContactType, type Flow } from '@/lib/contactRouting';

const requests = new Map<string, { count: number; reset: number }>();
function allowed(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || entry.reset < now) { requests.set(key, { count: 1, reset: now + 60_000 }); return true; }
  entry.count += 1;
  return entry.count <= 5;
}
const isType = (value: string): value is ContactType => ['WORKSHOP', 'WORKSHOP_CALLBACK', 'SALES', 'SALES_CALLBACK', 'PARTS', 'PARTS_CALLBACK', 'RECEPTION'].includes(value);
const isFlow = (value: string): value is Flow => ['parts', 'machine', 'workshop', 'occasion', 'rental', 'general'].includes(value);

export async function POST(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: 'Te veel verzoeken. Probeer het later opnieuw.' }, { status: 429 });
  try {
    const input = await request.json();
    if (cleanText(input.website, 100)) return NextResponse.json({ success: true });
    const name = cleanText(input.name, 120);
    const email = cleanText(input.email, 200);
    const phone = cleanText(input.phone, 50);
    const question = cleanText(input.question, 3000);
    if (!name || !question || (!email && !phone)) return NextResponse.json({ error: 'Vul naam, vraag en minimaal één contactmogelijkheid in.' }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Vul een geldig e-mailadres in.' }, { status: 400 });
    const flow = isFlow(input.activeFlow) ? input.activeFlow : 'general';
    // Resolve the department on the server; client input may only request
    // the callback variant belonging to the already active flow.
    const requestedType = isType(input.contactType) ? input.contactType : undefined;
    const callbackType = contactTypeFor(flow, true);
    const contactType = requestedType === callbackType
      ? callbackType
      : contactTypeFor(flow);
    await sendContactMail({
      contactType, activeFlow: flow, name, email, phone, question,
      company: cleanText(input.company, 160), pageUrl: cleanText(input.pageUrl, 1000),
      pageTitle: cleanText(input.pageTitle, 300), language: cleanText(input.language, 5) || 'nl',
      referrer: cleanText(input.referrer, 1000),
      machineContext: cleanText(input.machineContext, 500), timestamp: new Date().toISOString(),
      conversation: Array.isArray(input.conversation) ? input.conversation.slice(-8).map((item: unknown) => {
        const message = item as { role?: unknown; content?: unknown };
        return { role: cleanText(message.role, 12), content: cleanText(message.content, 800) };
      }).filter((item: { role: string; content: string }) => item.content) : [],
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Verzenden is niet gelukt. Probeer het later opnieuw.' }, { status: 500 });
  }
}
