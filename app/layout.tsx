import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIChecked Chatbot — Test',
  description: 'Local test environment for the AIChecked.nl chatbot widget.',
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
