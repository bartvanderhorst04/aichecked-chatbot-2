'use client';
import type { Language } from '@/lib/translations';

export default function LanguageSwitcher({ language, onChange, label }: { language: Language; onChange: (language: Language) => void; label: string }) {
  return <div className="wvb-chatbot-languages" aria-label={label}>
    {(['nl', 'en', 'de'] as Language[]).map((code) => (
      <button type="button" key={code} onClick={() => onChange(code)} aria-pressed={language === code} className={language === code ? 'wvb-chatbot-language--active' : ''}>
        {code.toUpperCase()}
      </button>
    ))}
  </div>;
}
