import { NextRequest, NextResponse } from 'next/server';
import { askOpenAI } from '@/lib/openai';
import { applyGuardrails, cleanText, classifyQuestion } from '@/lib/guardrails';
import { translations, type Language } from '@/lib/translations';

type IncomingMessage = { role?: unknown; content?: unknown };

const hits = new Map<string, { count: number; reset: number }>();
function allowed(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) { hits.set(key, { count: 1, reset: now + 60_000 }); return true; }
  entry.count += 1;
  return entry.count <= 15;
}

export async function POST(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: 'Te veel verzoeken.' }, { status: 429 });
  let fallback = translations.nl.fallback;
  try {
    const body = await request.json();
    if (cleanText(body.website, 100)) return NextResponse.json({ ok: true });
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8).map((message: IncomingMessage) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: cleanText(message?.content, 800),
    })).filter((message: { role: 'user' | 'assistant'; content: string }) => message.content) : [];
    const last = messages.at(-1)?.content;
    if (!last) return NextResponse.json({ error: 'Ongeldige vraag.' }, { status: 400 });
    const language = (cleanText(body.language, 5) || 'nl') as Language;
    fallback = translations[language]?.fallback || translations.nl.fallback;
    const guarded = applyGuardrails(last);
    if (guarded.kind !== 'allow') {
      return NextResponse.json({
        reply: guarded.kind === 'price' ? guarded.reply : fallback,
        showForm: guarded.kind === 'price',
        contactType: classifyQuestion(last),
      });
    }
    const pageContext = cleanText(body.pageContext, 500);
    const reply = await askOpenAI(messages, language, pageContext);
    const outputGuard = applyGuardrails(reply);
    if (outputGuard.kind === 'price') {
      return NextResponse.json({ reply: outputGuard.reply, showForm: true, contactType: classifyQuestion(last) });
    }
    if (outputGuard.kind === 'blocked' || !reply) {
      return NextResponse.json({
        reply: fallback,
        showForm: true,
        contactType: classifyQuestion(last),
      });
    }
    return NextResponse.json({ reply, contactType: classifyQuestion(last) });
  } catch {
    return NextResponse.json({ reply: fallback, showForm: true, contactType: 'RECEPTION' });
  }
}
