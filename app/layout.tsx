import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wim van Breda chatbot',
  description: 'Embedbare chatbot-widget voor Wim van Breda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
