import ChatWidget from '@/components/ChatWidget';

export default function TestPage() {
  return <main style={{ minHeight: '100vh', padding: '48px', background: '#f5f5f5' }}>
    <h1>Wim van Breda chatbot</h1>
    <p>Lokale testomgeving. De widget staat rechtsonder.</p>
    <ChatWidget phoneNumber={process.env.WVB_PHONE_NUMBER} />
  </main>;
}
