import type { Metadata } from 'next';
import AICheckedChatbot from '@/components/AICheckedChatbot';

export const metadata: Metadata = {
  title: 'AIChecked Chatbot',
  robots: { index: false, follow: false },
};

export default function EmbedPage() {
  return (
    <>
      {/* The widget runs inside an iframe on aichecked.nl — everything except
          the widget itself must stay transparent. */}
      <style>{`
        html, body {
          background: transparent !important;
          overflow: hidden;
        }
      `}</style>
      <AICheckedChatbot />
    </>
  );
}
