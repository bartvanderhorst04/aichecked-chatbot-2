import type { Metadata } from 'next';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = { title: 'Wim van Breda chatbot', robots: { index: false, follow: false } };

export default function WidgetPage({ searchParams }: { searchParams: { pageUrl?: string; pageTitle?: string; referrer?: string; parentOrigin?: string } }) {
  return <><style>{`html, body { background: transparent !important; overflow: hidden; }`}</style><ChatWidget phoneNumber={process.env.WVB_PHONE_NUMBER} parentOrigin={searchParams.parentOrigin} pageContext={{ url: searchParams.pageUrl, title: searchParams.pageTitle, referrer: searchParams.referrer }} /></>;
}
