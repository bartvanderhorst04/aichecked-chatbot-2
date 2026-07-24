'use client';

export type ChatMessageData = { role: 'assistant' | 'user'; content: string };

export default function ChatMessage({ message }: { message: ChatMessageData }) {
  return <div className={`wvb-chatbot-message wvb-chatbot-message--${message.role}`}>{message.content}</div>;
}
