'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { contactTypeFor, type ContactType, type Flow } from '@/lib/contactRouting';
import { languageOptions, translations, type Language } from '@/lib/translations';
import ChatMessage, { type ChatMessageData } from './ChatMessage';
import ContactForm from './ContactForm';
import QuickMenu, { type QuickAction } from './QuickMenu';

type Props = { phoneNumber?: string; parentOrigin?: string; pageContext?: { url?: string; title?: string; referrer?: string } };

export default function ChatWidget({ phoneNumber, parentOrigin, pageContext }: Props) {
  const [open, setOpen] = useState(false);
  const [autoOpenReady, setAutoOpenReady] = useState(false); const [pageScrolled, setPageScrolled] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [language, setLanguage] = useState<Language | null>(null); const [flow, setFlow] = useState<Flow>('general');
  const [contactType, setContactType] = useState<ContactType>('RECEPTION'); const [showForm, setShowForm] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>([]); const [actions, setActions] = useState<QuickAction[]>([]);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false); const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null); const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language || 'nl'];
  useEffect(() => {
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    if (sessionStorage.getItem('wvb_chatbot_auto_opened') || sessionStorage.getItem('wvb_chatbot_user_closed')) return;
    const timeout = window.setTimeout(() => setAutoOpenReady(true), 10_000);
    const onScroll = () => setPageScrolled(true);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.clearTimeout(timeout); window.removeEventListener('scroll', onScroll); };
  }, []);
  useEffect(() => {
    if (!parentOrigin) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin === parentOrigin && event.data?.type === 'wvb-chatbot:page-scrolled') setPageScrolled(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [parentOrigin]);
  useEffect(() => {
    if (!autoOpenReady || !pageScrolled || open) return;
    if (sessionStorage.getItem('wvb_chatbot_auto_opened') || sessionStorage.getItem('wvb_chatbot_user_closed')) return;
    sessionStorage.setItem('wvb_chatbot_auto_opened', 'true');
    setOpen(true);
  }, [autoOpenReady, pageScrolled, open]);
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem('wvb-chatbot-language');
    if (savedLanguage === 'nl' || savedLanguage === 'en' || savedLanguage === 'de') {
      setLanguage(savedLanguage);
      setMessages([{ role: 'assistant', content: translations[savedLanguage].opening }]);
      setActions(translations[savedLanguage].menu);
    }
  }, []);
  useEffect(() => {
    if (window.parent === window) return;
    try {
      const origin = new URL(parentOrigin || document.referrer).origin;
      window.parent.postMessage({ type: 'wvb-chatbot:widget', open }, origin);
    } catch {
      // The widget still works without dynamic iframe resizing when referrer
      // information is intentionally suppressed by the embedding page.
    }
  }, [open, parentOrigin]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const body = chatBodyRef.current;
      const end = messagesEndRef.current;
      if (body && end) body.scrollTo({ top: end.offsetTop, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, loading, showForm, actions]);
  function add(content: string) { setMessages((items) => [...items, { role: 'assistant', content }]); }
  function selectLanguage(nextLanguage: Language) {
    window.localStorage.setItem('wvb-chatbot-language', nextLanguage);
    setLanguage(nextLanguage); setMessages([{ role: 'assistant', content: translations[nextLanguage].opening }]); setActions(translations[nextLanguage].menu); setShowForm(false); setInput('');
  }
  function changeLanguage() {
    window.localStorage.removeItem('wvb-chatbot-language');
    setLanguage(null); setMessages([]); setActions([]); setShowForm(false); setInput('');
  }
  function openForm(type = contactType, activeFlow = flow) {
    setContactType(type); setFlow(activeFlow); add(t.formIntro[activeFlow]); setShowForm(true); setActions([]);
  }
  function start(id: string) {
    setShowForm(false);
    if (id === 'ask') { setFlow('general'); setContactType('RECEPTION'); add(t.flow.ask); setActions([]); inputRef.current?.focus(); return; }
    if (id === 'general') { setFlow('general'); setContactType('RECEPTION'); openForm('RECEPTION', 'general'); return; }
    const active = id as Flow; setFlow(active); setContactType(contactTypeFor(active)); add(t.flow[id as keyof typeof t.flow]);
    setActions(t.choices[id as keyof typeof t.choices] || []);
  }
  function action(action: QuickAction) {
    if (action.id === 'call') { if (phoneNumber) window.location.href = `tel:${phoneNumber}`; return; }
    if (action.id === 'machine-options') { add(t.machineSelectionTitle); setActions(t.choices.machineOptions); return; }
    if (action.id === 'back-topics') { setActions(t.menu); setShowForm(false); return; }
    if (action.id === 'callback') return openForm(contactTypeFor(flow, true));
    if (action.id === 'form' || action.id === 'parts-form') return openForm(contactTypeFor(flow));
    if (action.id === 'ask') return start('ask');
    if (action.id === 'new') { setFlow('machine'); add(t.followUp.new); return setActions(t.choices.machineNew); }
    if (action.id === 'existing') { add(t.followUp.existing); return setActions(t.choices.machineExisting); }
    if (action.id === 'unknown') { add(t.followUp.unknown); setActions([]); return; }
    if (action.id === 'documentation') return openForm('WORKSHOP', 'workshop');
    if (action.id === 'specifications' || action.id === 'application') return start('ask');
    if (action.id === 'rental' || action.id === 'occasion' || action.id === 'parts' || action.id === 'workshop') start(action.id);
  }
  async function submitQuestion(event: FormEvent) {
    event.preventDefault(); const question = input.trim(); if (!question || loading) return;
    const nextLanguage = language || 'nl';
    setInput(''); setLoading(true);
    const nextMessages = [...messages, { role: 'user' as const, content: question }]; setMessages(nextMessages);
    if (isRentalIntent(question)) {
      setFlow('rental'); setContactType('SALES'); setShowForm(false);
      add(t.rentalReply);
      setActions([{ id: 'rental-link', label: t.rentalCta, href: 'https://wimvanbreda.nl/verhuur/' }]);
      setLoading(false);
      return;
    }
    if (isContactIntent(question)) {
      const salesRequest = /\b(offerte|quote|quotation|angebot)\b/i.test(question);
      const activeFlow: Flow = salesRequest ? 'machine' : 'general';
      setFlow(activeFlow); setContactType(salesRequest ? 'SALES' : 'RECEPTION');
      add(t.contactIntro);
      openForm(salesRequest ? 'SALES' : 'RECEPTION', activeFlow);
      setLoading(false);
      return;
    }
    try {
      const currentUrl = pageContext?.url || window.location.href;
      const currentTitle = pageContext?.title || document.title;
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages, language: nextLanguage, pageContext: `${currentTitle} — ${currentUrl}` }) });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('Invalid chat response');
      add(data.reply); if (data.contactType) setContactType(data.contactType); setShowForm(Boolean(data.showForm)); setActions([{ id: 'ask', label: translations[nextLanguage].moreQuestion }, { id: 'form', label: translations[nextLanguage].contact }]);
    } catch { add(translations[nextLanguage].fallback); setShowForm(true); } finally { setLoading(false); }
  }
  function close() {
    setOpen(false);
    sessionStorage.setItem('wvb_chatbot_user_closed', 'true');
  }
  return <div className="wvb-chatbot-root">
    {!open && <button className="wvb-chatbot-launcher" type="button" onClick={() => { sessionStorage.setItem('wvb_chatbot_auto_opened', 'true'); setOpen(true); }}>
      <img src="/wim-ai-assistant-icon.png" alt="" aria-hidden="true" />
      <span>{t.pill}</span><b aria-hidden>⌄</b>
    </button>}
    {open && <section className="wvb-chatbot-panel" aria-label={t.assistant}>
      {!language ? <div className="wvb-chatbot-language-screen">
        <img className="wvb-chatbot-language-logo" src="/wim-van-breda-logo.png" alt="Wim van Breda" />
        <h2>{translations.nl.chooseLanguage}</h2>
        <p className="wvb-chatbot-language-prompt">{translations.nl.languagePrompt}</p>
        <div className="wvb-chatbot-language-cards">
          {languageOptions.map((option) => <button type="button" key={option.code} onClick={() => selectLanguage(option.code)}>{option.label}<span aria-hidden>→</span></button>)}
        </div>
        <button className="wvb-chatbot-close wvb-chatbot-language-close" type="button" aria-label={translations.nl.close} onClick={close}>×</button>
      </div> : <>
        <div className="wvb-chatbot-info-bar">💬 {t.infoBar}</div>
        <header><img className="wvb-chatbot-header-logo" src="/wim-van-breda-logo.png" alt="Wim van Breda" /><div className="wvb-chatbot-header-copy"><strong>{t.assistant}</strong></div><button className="wvb-chatbot-info-button" type="button" aria-label={t.disclaimerInfo} title={t.disclaimerInfo} onClick={() => setShowDisclaimer(true)}>i</button><button className="wvb-chatbot-close" type="button" aria-label={t.close} onClick={close}>×</button></header>
        <div className="wvb-chatbot-body" ref={chatBodyRef}><button className="wvb-chatbot-menu" type="button" onClick={() => { setActions(t.menu); setShowForm(false); }}>{t.chooseTopic}</button>{messages.map((message, index) => <ChatMessage key={index} message={message} />)}{loading && <div className="wvb-chatbot-message wvb-chatbot-message--assistant">…</div>}{showForm && <ContactForm contactType={contactType} activeFlow={flow} language={language} conversation={messages} pageContext={pageContext} onDone={() => {}} />}{actions.length > 0 && <QuickMenu actions={actions} onAction={action} label={t.actionLabel} />}{!showForm && isMainMenu(actions, t.menu) && <button className="wvb-chatbot-language-change" type="button" onClick={changeLanguage}>{t.changeLanguage}</button>}<div ref={messagesEndRef} aria-hidden="true" /></div>
        <form className="wvb-chatbot-input" onSubmit={submitQuestion}><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t.inputPlaceholder} aria-label={t.inputLabel} /><button type="submit" disabled={loading} aria-label={t.send}>➜</button></form>
        {showDisclaimer && <div className="wvb-chatbot-disclaimer-backdrop" role="presentation" onClick={() => setShowDisclaimer(false)}>
          <section className="wvb-chatbot-disclaimer" role="dialog" aria-modal="true" aria-label={t.disclaimerLabel} onClick={(event) => event.stopPropagation()}>
            <div className="wvb-chatbot-disclaimer-header"><strong>{t.disclaimerLabel}</strong><button className="wvb-chatbot-close" type="button" aria-label={t.close} onClick={() => setShowDisclaimer(false)}>×</button></div>
            <p>{t.disclaimer}</p><p>{t.privacyNotice}</p>
          </section>
        </div>}
      </>}
    </section>}
  </div>;
}

function isRentalIntent(value: string) {
  return /\b(machine huren|machinehuur|verhuur|huurmachines?|rental|rent a machine|machine mieten|vermietung)\b/i.test(value);
}

function isContactIntent(value: string) {
  return /\b(contactformulier|formulier invullen|ik wil contact|neem contact( met mij)? op|contact opnemen|kunnen jullie mij bellen|offerte aanvragen|gegevens achterlaten|contact form|contact me|call me|quote|kontaktformular|kontakt aufnehmen|rückruf|angebot)\b/i.test(value);
}

function isMainMenu(actions: QuickAction[], menu: QuickAction[]) {
  return actions.length === menu.length && actions.every((action, index) => action.id === menu[index]?.id);
}
