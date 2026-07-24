'use client';
import { FormEvent, useState } from 'react';
import type { ContactType, Flow } from '@/lib/contactRouting';
import type { Language } from '@/lib/translations';
import { translations } from '@/lib/translations';
import type { ChatMessageData } from './ChatMessage';

export default function ContactForm({ contactType, activeFlow, language, conversation, pageContext, onDone }: {
  contactType: ContactType; activeFlow: Flow; language: Language; conversation: ChatMessageData[];
  pageContext?: { url?: string; title?: string; referrer?: string }; onDone: () => void;
}) {
  const t = translations[language]; const [state, setState] = useState({ company: '', name: '', email: '', phone: '', question: '', website: '' });
  const [error, setError] = useState(''); const [sending, setSending] = useState(false); const [sent, setSent] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!state.name.trim()) return setError(t.requiredName);
    if (!state.email.trim() && !state.phone.trim()) return setError(t.requiredContact);
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return setError(t.invalidEmail);
    if (!state.question.trim()) return setError(t.requiredQuestion);
    setSending(true);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        ...state, contactType, activeFlow, language, conversation,
        pageUrl: pageContext?.url || window.location.href,
        pageTitle: pageContext?.title || document.title,
        referrer: pageContext?.referrer || document.referrer,
        machineContext: `${pageContext?.title || document.title} — ${safePathname(pageContext?.url || window.location.href)}`,
      }) });
      if (!response.ok) throw new Error();
      setSent(true); onDone();
    } catch { setError(t.technicalError); } finally { setSending(false); }
  }
  if (sent) return <p className="wvb-chatbot-success" role="status">{t.thanks}</p>;
  return <form className="wvb-chatbot-form" onSubmit={submit} noValidate>
    <label>{t.company}<input value={state.company} onChange={(e) => setState({ ...state, company: e.target.value })} autoComplete="organization" /></label>
    <label>{t.name}<input required value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} autoComplete="name" /></label>
    <label>{t.email}<input type="email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} autoComplete="email" /></label>
    <label>{t.phone}<input type="tel" value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} autoComplete="tel" /></label>
    <label>{t.question}<textarea required rows={4} value={state.question} onChange={(e) => setState({ ...state, question: e.target.value })} /></label>
    <div className="wvb-chatbot-honeypot" aria-hidden="true"><label>{t.honeypot}<input tabIndex={-1} value={state.website} onChange={(e) => setState({ ...state, website: e.target.value })} /></label></div>
    {error && <p className="wvb-chatbot-error" role="alert">{error}</p>}
    <button className="wvb-chatbot-submit" disabled={sending} type="submit">{sending ? t.sending : t.send}</button>
    <p className="wvb-chatbot-privacy">{t.privacy}</p>
  </form>;
}

function safePathname(url: string) {
  try { return new URL(url).pathname; } catch { return ''; }
}
