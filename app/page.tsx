import AICheckedChatbot from '@/components/AICheckedChatbot';

export default function TestPage() {
  return (
    <>
      {/* ── Test background — mimics AIChecked.nl dark aesthetic ── */}
      <main
        style={{
          minHeight: '100vh',
          background: '#050505',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: '40px 24px',
        }}
      >
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#2EF2C0',
              boxShadow: '0 0 10px rgba(46,242,192,0.9)',
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            AIChecked.nl
          </span>
        </div>

        {/* Test label */}
        <div
          style={{
            background: '#0B0B0B',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '28px 36px',
            textAlign: 'center',
            maxWidth: 420,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: 'rgba(46,242,192,0.7)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Chatbot test omgeving
          </p>
          <p
            style={{
              fontSize: 15,
              color: '#ffffff',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            De AIChecked chatbot widget staat rechtsonder.
          </p>
          <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6 }}>
            Klik op de knop om het gesprek te starten.
            Zorg dat{' '}
            <code
              style={{
                background: '#161616',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12,
                color: '#A1A1AA',
              }}
            >
              OPENAI_API_KEY
            </code>{' '}
            is ingesteld in{' '}
            <code
              style={{
                background: '#161616',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: 12,
                color: '#A1A1AA',
              }}
            >
              .env.local
            </code>
            .
          </p>
        </div>

        {/* Subtle grid texture — purely decorative */}
        <div
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </main>

      {/* ── Chatbot widget — unchanged component ── */}
      <AICheckedChatbot />
    </>
  );
}
