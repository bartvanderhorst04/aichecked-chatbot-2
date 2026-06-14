'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  isTyping?: boolean;
}

interface LeadForm {
  website: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  need: string;
}

type ChatState = 'chat' | 'lead-form' | 'lead-success';

// ─── Constants ───────────────────────────────────────────────────────────────

interface FollowUpQuestion {
  question: string;
  /** Answer options; omitted = open text answer */
  options?: string[];
}

interface PainPoint {
  id: string;
  label: string;
  questions: FollowUpQuestion[];
}

const PAIN_POINTS: PainPoint[] = [
  {
    id: 'meer-uit-ai',
    label: '🤖 Ik wil meer uit AI halen',
    questions: [
      {
        question: 'Hoe bekend ben je al met AI binnen jouw bedrijf?',
        options: [
          'We gebruiken nog geen AI',
          'We experimenteren ermee',
          'We gebruiken ChatGPT',
          'We gebruiken meerdere AI-tools',
          'Geen idee',
        ],
      },
      {
        question: 'Wat wil je het liefst verbeteren?',
        options: [
          'Meer omzet',
          'Minder handmatig werk',
          'Meer leads',
          'Betere klantenservice',
          'Ik weet het nog niet',
        ],
      },
    ],
  },
  {
    id: 'klantvragen',
    label: '💬 Ik krijg veel klantvragen',
    questions: [
      {
        question: 'Hoe komen de meeste klantvragen binnen?',
        options: ['E-mail', 'Website', 'WhatsApp', 'Telefoon', 'Mix van meerdere'],
      },
    ],
  },
  {
    id: 'leads',
    label: '🎯 Leads worden niet opgevolgd',
    questions: [
      {
        question: 'Hoe volg je nieuwe leads momenteel op?',
        options: ['Handmatig', 'E-mail', 'CRM', 'Eigen systeem', 'Nauwelijks'],
      },
    ],
  },
  {
    id: 'marketing',
    label: '📈 Ik kan meer uit mijn website/social media halen',
    questions: [
      {
        question: 'Wat is op dit moment je grootste uitdaging?',
        options: ['Meer leads', 'Meer bezoekers', 'Meer omzet', 'Meer afspraken', 'Geen idee'],
      },
    ],
  },
  {
    id: 'herhaalaankopen',
    label: '🔄 Ik krijg geen herhaalaankopen',
    questions: [
      {
        question: 'Hoe vaak hoor je opnieuw iets van bestaande klanten?',
        options: ['Bijna nooit', 'Soms', 'Regelmatig', 'We meten dit niet'],
      },
    ],
  },
  {
    id: 'mogelijkheden',
    label: '🤔 Ik wil weten wat mogelijk is',
    questions: [{ question: 'In welke branche zit je?' }],
  },
];

const OPPORTUNITY_SUMMARY = `Op basis van jouw antwoord zie ik mogelijk kansen voor:

✓ Leadopvolging
✓ Klantcommunicatie
✓ Automatisering
✓ Marketing
✓ Herhaalaankopen

Vraag hieronder jouw persoonlijke AI Scan aan.`;

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '👋 Ik help bedrijven ontdekken waar AI tijd en kosten kan besparen.\n\nWat kost jouw bedrijf momenteel de meeste tijd?',
};

const CONTACT_INFO = {
  website: 'https://www.aichecked.nl',
  phone: '+31 6 19678372',
  email: 'info@aichecked.nl',
  instagram: 'aichecked.nl',
  facebook: 'aichecked.nl',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#2EF2C0',
            opacity: 0.7,
            animation: `aic-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: '82%',
          padding: '10px 13px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(46,242,192,0.18), rgba(46,242,192,0.10))'
            : '#161616',
          border: isUser
            ? '1px solid rgba(46,242,192,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          color: '#ffffff',
          fontSize: 13,
          lineHeight: 1.55,
          wordBreak: 'break-word',
          whiteSpace: 'pre-line',
        }}
      >
        {msg.isTyping ? <TypingDots /> : msg.content}
      </div>
    </div>
  );
}

function QuickReplyButtons({
  items,
  onSelect,
}: {
  items: string[];
  onSelect: (reply: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
      {items.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(46,242,192,0.25)',
            borderRadius: 20,
            padding: '5px 12px',
            color: 'rgba(46,242,192,0.85)',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(46,242,192,0.10)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(46,242,192,0.5)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'rgba(46,242,192,0.25)';
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

function CTASection({ onLead }: { onLead: (label: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <button
          onClick={() => onLead('Ontvang mijn AI Scan')}
        style={{
          width: '100%',
          padding: '11px',
          background: 'linear-gradient(135deg, #2EF2C0, #1ac8a0)',
          border: 'none',
          borderRadius: 10,
          color: '#050505',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          fontFamily: 'inherit',
          marginBottom: 8,
          boxShadow: '0 0 20px rgba(46,242,192,0.25)',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.opacity = '0.9')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
        }
      >
        🚀 Ontvang mijn AI Scan
      </button>
      <button
        onClick={() => onLead('Plan een kennismaking')}
        style={{
          width: '100%',
          padding: '10px',
          background: 'transparent',
          border: '1px solid rgba(46,242,192,0.3)',
          borderRadius: 10,
          color: 'rgba(46,242,192,0.9)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '0.01em',
          fontFamily: 'inherit',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(46,242,192,0.10)';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'rgba(46,242,192,0.5)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'rgba(46,242,192,0.3)';
        }}
      >
        📅 Plan een kennismaking
      </button>
    </div>
  );
}

// ─── Lead Form ───────────────────────────────────────────────────────────────

function LeadFormView({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: LeadForm) => Promise<void>;
  onBack: () => void;
}) {
  const [form, setForm] = useState<LeadForm>({
    website: '',
    name: '',
    company: '',
    email: '',
    phone: '',
    need: '',
  });
  const [errors, setErrors] = useState<Partial<LeadForm>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<LeadForm> = {};
    if (!form.website.trim()) e.website = 'Website is verplicht';
    else if (!/^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(form.website.trim()))
      e.website = 'Ongeldige website (bijv. https://www.jouwbedrijf.nl)';
    if (!form.name.trim()) e.name = 'Naam is verplicht';
    if (!form.company.trim()) e.company = 'Bedrijfsnaam is verplicht';
    if (!form.email.trim()) e.email = 'E-mail is verplicht';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Ongeldig e-mailadres';
    if (!form.need.trim()) e.need = 'Beschrijf kort waarmee je geholpen wilt worden';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  }

  const field = (
    key: keyof LeadForm,
    label: string,
    type = 'text',
    placeholder = '',
    optional = false,
    helper = ''
  ) => (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          color: '#A1A1AA',
          marginBottom: 4,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
        {optional && (
          <span style={{ color: '#71717A', marginLeft: 4 }}>(optioneel)</span>
        )}
      </label>
      {key === 'need' ? (
        <textarea
          value={form[key]}
          onChange={(e) =>
            setForm((f) => ({ ...f, [key]: e.target.value }))
          }
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%',
            background: '#0B0B0B',
            border: errors[key]
              ? '1px solid rgba(239,68,68,0.6)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 10px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => {
            if (!errors[key])
              e.currentTarget.style.borderColor = 'rgba(46,242,192,0.4)';
          }}
          onBlur={(e) => {
            if (!errors[key])
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) =>
            setForm((f) => ({ ...f, [key]: e.target.value }))
          }
          placeholder={placeholder}
          style={{
            width: '100%',
            background: '#0B0B0B',
            border: errors[key]
              ? '1px solid rgba(239,68,68,0.6)'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 10px',
            color: '#fff',
            fontSize: 13,
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
          onFocus={(e) => {
            if (!errors[key])
              e.currentTarget.style.borderColor = 'rgba(46,242,192,0.4)';
          }}
          onBlur={(e) => {
            if (!errors[key])
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        />
      )}
      {helper && !errors[key] && (
        <p style={{ margin: '3px 0 0', fontSize: 11, color: '#71717A' }}>
          {helper}
        </p>
      )}
      {errors[key] && (
        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgba(239,68,68,0.9)' }}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#A1A1AA',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 6,
            fontSize: 16,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ←
        </button>
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 13,
              color: '#fff',
            }}
          >
            Plan een kennismaking
          </p>
          <p style={{ margin: 0, fontSize: 11, color: '#71717A' }}>
            Bart neemt binnen 24 uur contact op
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ flex: 1, overflowY: 'auto', paddingRight: 2 }}
      >
        {field(
          'website',
          'Website',
          'text',
          'https://www.jouwbedrijf.nl',
          false,
          'Vul je website in zodat we jouw bedrijf kunnen analyseren.'
        )}
        {field('name', 'Naam', 'text', 'Jan de Vries')}
        {field('company', 'Bedrijf', 'text', 'Bedrijfsnaam BV')}
        {field('email', 'E-mail', 'email', 'jan@bedrijf.nl')}
        {field('phone', 'Telefoon', 'tel', '+31 6 12345678', true)}
        {field('need', 'Waarmee kan ik je helpen?', 'text', 'Beschrijf kort je vraag of project...')}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px',
            background: loading
              ? 'rgba(46,242,192,0.4)'
              : 'linear-gradient(135deg, #2EF2C0, #1ac8a0)',
            border: 'none',
            borderRadius: 10,
            color: '#050505',
            fontWeight: 700,
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            marginTop: 4,
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Versturen...' : 'Verstuur aanvraag →'}
        </button>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AICheckedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>('chat');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [onboarding, setOnboarding] = useState<
    'intro' | 'followup' | 'done' | 'free'
  >('intro');
  const [activePainPoint, setActivePainPoint] = useState<PainPoint | null>(null);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const latestMessagesRef = useRef<Message[]>([WELCOME_MESSAGE]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hadInputFocusRef = useRef(false);
  const hasUserToggledRef = useRef(false);
  const conversationStartedAtRef = useRef(new Date().toISOString());
  const conversationPageUrlRef = useRef(
    typeof window === 'undefined' ? '' : document.referrer || window.location.href
  );
  const chatEmailSentRef = useRef(false);

  // When embedded in an iframe (chat.aichecked.nl/embed on the static site),
  // tell the parent loader script to resize the iframe on open/close.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top) {
      window.parent.postMessage({ type: 'aichecked:widget', open: isOpen }, '*');
    }
  }, [isOpen]);

  // Auto-open once, 10s after page load — never override a manual open/close
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasUserToggledRef.current) {
        setIsOpen((open) => (open ? open : true));
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const isDesktopViewport = useCallback(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  }, []);

  const focusChatInput = useCallback(
    (options?: { onOpen?: boolean }) => {
      if (!inputRef.current || isLoading) return;

      const shouldFocus =
        options?.onOpen || isDesktopViewport() || hadInputFocusRef.current;

      if (shouldFocus) {
        inputRef.current.focus({ preventScroll: true });
      }
    },
    [isLoading, isDesktopViewport]
  );

  const sendChatEmail = useCallback((nextMessages: Message[], contactDetails?: LeadForm) => {
    if (typeof window === 'undefined') return;
    if (chatEmailSentRef.current) return;

    chatEmailSentRef.current = true;
    const pageUrl = conversationPageUrlRef.current || document.referrer || window.location.href;
    const messagesForEmail = nextMessages
      .filter((message) => !message.isTyping)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    void fetch('/api/send-chat-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        pageUrl,
        timestamp: new Date().toISOString(),
        conversationStartedAt: conversationStartedAtRef.current,
        contactDetails: contactDetails
          ? {
              name: contactDetails.name,
              email: contactDetails.email,
              phone: contactDetails.phone,
            }
          : undefined,
        messages: messagesForEmail,
      }),
    }).catch(() => {
      // Email delivery should never block the chatbot experience.
    });
  }, []);

  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const sendBeforeExit = () => {
      const latestMessages = latestMessagesRef.current;

      if (latestMessages.some((message) => message.role === 'user')) {
        sendChatEmail(latestMessages);
      }
    };

    window.addEventListener('pagehide', sendBeforeExit);
    return () => window.removeEventListener('pagehide', sendBeforeExit);
  }, [sendChatEmail]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatState]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && chatState === 'chat' && !isLoading) {
      const t = setTimeout(() => focusChatInput({ onOpen: true }), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, chatState, isLoading, focusChatInput]);

  // Restore focus after AI response (desktop always; mobile only if user was typing)
  useEffect(() => {
    if (!isLoading && isOpen && chatState === 'chat') {
      const t = setTimeout(() => focusChatInput(), 0);
      return () => clearTimeout(t);
    }
  }, [isLoading, isOpen, chatState, focusChatInput]);

  // Send message to AI API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = { id: uid(), role: 'user', content: text };
      const typingMsg: Message = {
        id: 'typing',
        role: 'assistant',
        content: '',
        isTyping: true,
      };

      hadInputFocusRef.current =
        document.activeElement === inputRef.current;

      setMessages([...messages.filter((m) => !m.isTyping), userMsg, typingMsg]);
      setInput('');
      setShowQuickReplies(false);
      setIsLoading(true);

      // Check if lead form should be triggered
      const lowerText = text.toLowerCase();
      const leadTriggers = [
        'prijs', 'kosten', 'offerte', 'contact', 'bellen', 'afspraak',
        'kennismaking', 'planning', 'timeline', 'wanneer', 'samenwerken',
        'meer informatie', 'interesse', 'budget',
      ];
      const shouldShowLead = leadTriggers.some((t) => lowerText.includes(t));

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              ...messages
                .filter((m) => !m.isTyping)
                .map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: text },
            ],
          }),
        });

        const data = await res.json();
        const reply = data.reply || 'Sorry, ik kon je bericht niet verwerken. Probeer het opnieuw.';

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'typing'),
          { id: uid(), role: 'assistant', content: reply },
        ]);

        if (shouldShowLead) {
          setTimeout(() => setChatState('lead-form'), 800);
        }
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'typing'),
          {
            id: uid(),
            role: 'assistant',
            content:
              'Er is iets misgegaan. Je kunt ons ook bereiken via info@aichecked.nl of +31 6 19678372.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  // ── Onboarding flow: pain point → follow-up question → opportunity summary ──

  function handlePainPointSelect(label: string) {
    const painPoint = PAIN_POINTS.find((p) => p.label === label);
    if (!painPoint || isLoading) return;

    setActivePainPoint(painPoint);
    setFollowUpIndex(0);
    setOnboarding('followup');
    setShowQuickReplies(false);
    const nextMessages = [
      ...messages,
      { id: uid(), role: 'user' as const, content: painPoint.label },
      { id: uid(), role: 'assistant' as const, content: painPoint.questions[0].question },
    ];

    setMessages(nextMessages);
  }

  function handleFollowUpAnswer(answer: string) {
    if (!answer.trim()) return;

    const nextIndex = followUpIndex + 1;

    // More follow-up questions remaining for this pain point
    if (activePainPoint && nextIndex < activePainPoint.questions.length) {
      setFollowUpIndex(nextIndex);
      const nextMessages = [
        ...messages,
        { id: uid(), role: 'user' as const, content: answer.trim() },
        {
          id: uid(),
          role: 'assistant' as const,
          content: activePainPoint.questions[nextIndex].question,
        },
      ];

      setMessages(nextMessages);
      return;
    }

    setActivePainPoint(null);
    setFollowUpIndex(0);
    setOnboarding('done');
    const nextMessages = [
      ...messages,
      { id: uid(), role: 'user' as const, content: answer.trim() },
      { id: uid(), role: 'assistant' as const, content: OPPORTUNITY_SUMMARY },
    ];

    setMessages(nextMessages);
  }

  // Routes typed input: onboarding answers stay local, everything else goes to AI
  function handleUserText(text: string) {
    if (!text.trim() || isLoading) return;

    if (onboarding === 'followup') {
      setInput('');
      handleFollowUpAnswer(text);
      return;
    }
    if (onboarding === 'intro') {
      setOnboarding('free');
    }
    sendMessage(text);
  }

  function handleKennismaking(label = 'Kennismaking aangevraagd') {
    setMessages([
      ...messages,
      { id: uid(), role: 'user', content: label },
    ]);
    setChatState('lead-form');
  }

  async function handleLeadSubmit(data: LeadForm) {
    const nextMessages = [
      ...messages,
      {
        id: uid(),
        role: 'user',
        content: [
          'Leadformulier verzonden',
          `Naam: ${data.name}`,
          `E-mail: ${data.email}`,
          `Telefoon: ${data.phone || 'Niet opgegeven'}`,
          `Website: ${data.website}`,
          `Bedrijf: ${data.company}`,
          `Hulpvraag: ${data.need}`,
        ].join('\n'),
      },
    ];

    sendChatEmail(nextMessages, data);
    setMessages(nextMessages);
    setChatState('lead-success');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserText(input);
    }
  }

  // ── Responsive sizing ────────────────────────────────────────────────────
  // We use CSS variables set in a style tag because we're in a client component
  // without access to a global CSS file per the spec.

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes aic-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes aic-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(46,242,192,0.6); }
          50% { box-shadow: 0 0 0 5px rgba(46,242,192,0); }
        }
        @keyframes aic-panel-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Scrollbar styling */
        .aic-scroll::-webkit-scrollbar { width: 4px; }
        .aic-scroll::-webkit-scrollbar-track { background: transparent; }
        .aic-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        /* Responsive launcher — 25% larger */
        .aic-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 275px;
          height: 70px;
          z-index: 9999;
        }
        .aic-panel {
          position: fixed;
          bottom: 103px;
          right: 24px;
          width: 408px;
          height: 624px;
          z-index: 9998;
          border-radius: 24px;
        }
        .aic-label-mobile { display: none; }
        @media (max-width: 1023px) and (min-width: 768px) {
          .aic-launcher { bottom: 20px; right: 20px; width: 263px; height: 68px; }
          .aic-panel { bottom: 100px; right: 20px; width: 408px; height: 600px; border-radius: 24px; }
        }
        @media (max-width: 767px) {
          .aic-launcher { bottom: 12px; right: 12px; width: 238px; height: 65px; }
          .aic-panel {
            bottom: 89px; right: 12px; left: 12px;
            width: auto !important;
            height: 70vh;
            max-height: 560px;
            border-radius: 20px;
          }
          .aic-label-desktop { display: none; }
          .aic-label-mobile { display: inline; }
        }
      `}</style>

      {/* ── Panel ── */}
      {isOpen && (
        <div
          className="aic-panel"
          style={{
            background: '#0B0B0B',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(46,242,192,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'aic-panel-in 0.22s cubic-bezier(0.34,1.2,0.64,1) both',
          }}
        >
          {/* Panel Header */}
          <div
            style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0B0B0B',
              flexShrink: 0,
            }}
          >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#2EF2C0',
                  boxShadow: '0 0 8px rgba(46,242,192,0.8)',
                  animation: 'aic-pulse 2.5s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                }}
              >
                AIChecked.nl
              </span>
            </div>

            {/* Status + controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(46,242,192,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#2EF2C0',
                    display: 'inline-block',
                  }}
                />
                AI-assistent online
              </span>
              <button
                onClick={() => {
                  hasUserToggledRef.current = true;
                  setIsOpen(false);
                }}
                title="Sluiten"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#71717A',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: 16,
                  lineHeight: 1,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = '#fff')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = '#71717A')
                }
              >
                ✕
              </button>
            </div>
          </div>

          {/* Panel Body */}
          <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* ── Chat state ── */}
            {chatState === 'chat' && (
              <>
                {/* Messages */}
                <div
                  className="aic-scroll"
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '14px 14px 4px',
                  }}
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}

                  {/* Pain point quick replies — onboarding start */}
                  {showQuickReplies &&
                    onboarding === 'intro' &&
                    messages.length === 1 && (
                      <QuickReplyButtons
                        items={PAIN_POINTS.map((p) => p.label)}
                        onSelect={handlePainPointSelect}
                      />
                    )}

                  {/* Follow-up answer options */}
                  {onboarding === 'followup' &&
                    activePainPoint?.questions[followUpIndex]?.options && (
                      <QuickReplyButtons
                        items={activePainPoint.questions[followUpIndex].options!}
                        onSelect={handleFollowUpAnswer}
                      />
                    )}

                  {/* CTA — at start and after the opportunity summary */}
                  {(messages.length === 1 || onboarding === 'done') && (
                    <div style={{ margin: '2px 0 10px' }}>
                      <CTASection onLead={handleKennismaking} />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    background: '#0B0B0B',
                    flexShrink: 0,
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Typ een bericht..."
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: '#161616',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 10,
                      padding: '9px 12px',
                      color: '#fff',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = 'rgba(46,242,192,0.35)')
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')
                    }
                  />
                  <button
                    onClick={() => handleUserText(input)}
                    disabled={!input.trim() || isLoading}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background:
                        input.trim() && !isLoading
                          ? 'linear-gradient(135deg, #2EF2C0, #1ac8a0)'
                          : 'rgba(46,242,192,0.15)',
                      border: 'none',
                      cursor:
                        input.trim() && !isLoading ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.15s',
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={input.trim() && !isLoading ? '#050505' : 'rgba(46,242,192,0.5)'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* ── Lead form state ── */}
            {chatState === 'lead-form' && (
              <div
                className="aic-scroll"
                style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}
              >
                <LeadFormView
                  onSubmit={handleLeadSubmit}
                  onBack={() => setChatState('chat')}
                />
              </div>
            )}

            {/* ── Success state ── */}
            {chatState === 'lead-success' && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'rgba(46,242,192,0.12)',
                    border: '1px solid rgba(46,242,192,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 16,
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontWeight: 600,
                    fontSize: 15,
                    color: '#fff',
                  }}
                >
                  Bedankt!
                </p>
                <p
                  style={{
                    margin: '0 0 20px',
                    fontSize: 13,
                    color: '#A1A1AA',
                    lineHeight: 1.6,
                    maxWidth: 240,
                  }}
                >
                  We hebben je gegevens ontvangen. Bart neemt binnen 24 uur
                  contact met je op.
                </p>

                {/* Contact info */}
                <div
                  style={{
                    width: '100%',
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    textAlign: 'left',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: 11,
                      color: '#71717A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Directe contactgegevens
                  </p>
                  {[
                    {
                      icon: '🌐',
                      label: 'Website',
                      value: CONTACT_INFO.website,
                      href: CONTACT_INFO.website,
                    },
                    {
                      icon: '📞',
                      label: 'Telefoon',
                      value: CONTACT_INFO.phone,
                      href: `tel:${CONTACT_INFO.phone}`,
                    },
                    {
                      icon: '✉️',
                      label: 'E-mail',
                      value: CONTACT_INFO.email,
                      href: `mailto:${CONTACT_INFO.email}`,
                    },
                  ].map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                        textDecoration: 'none',
                        color: '#A1A1AA',
                        fontSize: 12,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = '#2EF2C0')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = '#A1A1AA')
                      }
                    >
                      <span>{c.icon}</span>
                      <span>{c.value}</span>
                    </a>
                  ))}
                </div>

                <button
                  onClick={() => setChatState('chat')}
                  style={{
                    marginTop: 16,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '8px 20px',
                    color: '#A1A1AA',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A1A1AA';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                >
                  Terug naar chat
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '7px 14px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, color: '#71717A', letterSpacing: '0.02em' }}>
              Powered by{' '}
              <a
                href="https://www.aichecked.nl"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(46,242,192,0.55)', textDecoration: 'none' }}
              >
                AIChecked.nl
              </a>
            </span>
          </div>
        </div>
      )}

      {/* ── Launcher button ── */}
      <button
        className="aic-launcher"
        onClick={() => {
          hasUserToggledRef.current = true;
          setIsOpen((v) => !v);
        }}
        aria-label={isOpen ? 'Chatbot sluiten' : 'Chatbot openen'}
        style={{
          background: isOpen
            ? '#161616'
            : 'linear-gradient(135deg, #0d1a14, #111f17)',
          border: isOpen
            ? '1px solid rgba(46,242,192,0.25)'
            : '1px solid rgba(46,242,192,0.3)',
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 20px',
          cursor: 'pointer',
          boxShadow: isOpen
            ? '0 0 20px rgba(46,242,192,0.15)'
            : '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,242,192,0.10), 0 0 30px rgba(46,242,192,0.13), 0 16px 38px -12px rgba(46,242,192,0.16)',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(46,242,192,0.12), 0 0 38px rgba(46,242,192,0.17), 0 18px 44px -12px rgba(46,242,192,0.19)';
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            'rgba(46,242,192,0.4)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = isOpen
            ? '0 0 20px rgba(46,242,192,0.15)'
            : '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(46,242,192,0.10), 0 0 30px rgba(46,242,192,0.13), 0 16px 38px -12px rgba(46,242,192,0.16)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = isOpen
            ? 'rgba(46,242,192,0.25)'
            : 'rgba(46,242,192,0.3)';
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#2EF2C0',
            boxShadow: '0 0 8px rgba(46,242,192,0.9)',
            flexShrink: 0,
            animation: isOpen ? 'none' : 'aic-pulse 2.5s ease-in-out infinite',
          }}
        />
        {/* Label */}
        <span
          className="aic-label-desktop"
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          AI Assistent van AIChecked
        </span>
        <span
          className="aic-label-mobile"
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          AI Assistent
        </span>
      </button>
    </>
  );
}
