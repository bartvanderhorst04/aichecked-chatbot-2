'use client';

export type QuickAction = { label: string; id: string; href?: string };

export default function QuickMenu({ actions, onAction, label }: { actions: QuickAction[]; onAction: (action: QuickAction) => void; label: string }) {
  return (
    <div className="wvb-chatbot-actions" aria-label={label}>
      {actions.map((action, index) => action.href ? (
        <a className="wvb-chatbot-action" key={`${action.id}-${index}`} href={action.href} target="_blank" rel="noreferrer"><OptionIcon id={action.id} /><span>{action.label}</span><i aria-hidden>›</i></a>
      ) : (
        <button className="wvb-chatbot-action" type="button" key={`${action.id}-${index}`} onClick={() => onAction(action)}><OptionIcon id={action.id} /><span>{action.label}</span><i aria-hidden>›</i></button>
      ))}
    </div>
  );
}

function OptionIcon({ id }: { id: string }) {
  const icon = iconFor(id);
  return <em className="wvb-chatbot-option-icon" aria-hidden>{icon.src ? <img src={icon.src} alt="" /> : icon.symbol}</em>;
}

function iconFor(id: string): { src?: string; symbol: string } {
  if (id === 'parts') return { src: '/icon-parts.png', symbol: '' };
  if (id === 'workshop') return { src: '/icon-service.png', symbol: '' };
  if (id === 'occasion') return { src: '/icon-occasions.png', symbol: '' };
  if (id === 'rental') return { src: '/icon-rental.png', symbol: '' };
  if (id === 'general') return { src: '/icon-contact.png', symbol: '' };
  if (id.includes('parts') || id === 'webshop') return { symbol: '⌕' };
  if (id === 'machine' || id === 'new' || id === 'existing') return { symbol: '⚙' };
  if (id === 'documentation') return { symbol: '⚒' };
  if (id.includes('occasion')) return { symbol: '◇' };
  if (id.includes('rental')) return { symbol: '▣' };
  if (id === 'call') return { symbol: '☎' };
  if (id === 'callback') return { symbol: '↗' };
  return { symbol: '✦' };
}
