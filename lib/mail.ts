import { getRecipient, getSubject, type ContactType, type Flow } from './contactRouting';

export type ContactMail = {
  contactType: ContactType; activeFlow: Flow; company: string; name: string; email: string;
  phone: string; question: string; pageUrl: string; pageTitle: string; referrer?: string; language: string;
  timestamp: string; machineContext?: string; conversation?: Array<{ role: string; content: string }>;
};

const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character));

export async function sendContactMail(data: ContactMail) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = getRecipient(data.contactType);
  const from = process.env.MAIL_FROM;
  if (!apiKey || !to || !from) throw new Error('Mail is not configured');
  const rows = [
    ['Contacttype', data.contactType], ['Actieve flow', data.activeFlow], ['Bedrijfsnaam', data.company || 'Niet opgegeven'],
    ['Naam', data.name], ['E-mailadres', data.email || 'Niet opgegeven'], ['Telefoonnummer', data.phone || 'Niet opgegeven'],
    ['Vraag', data.question], ['Huidige pagina', data.pageUrl], ['Paginatitel', data.pageTitle], ['Verwijzende pagina', data.referrer || 'Niet beschikbaar'],
    ['Taal', data.language], ['Datum en tijd', data.timestamp], ['Machine/productcontext', data.machineContext || 'Niet beschikbaar'],
  ].map(([label, value]) => `<tr><th>${escape(label)}</th><td>${escape(value)}</td></tr>`).join('');
  const conversation = (data.conversation || []).slice(-8)
    .map((message) => `<li><strong>${message.role === 'user' ? 'Bezoeker' : 'Chatbot'}:</strong> ${escape(message.content)}</li>`).join('');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [to], reply_to: data.email || undefined, subject: getSubject(data.contactType, data.name, data.question),
      html: `<main><h1>Nieuwe chatbotaanvraag</h1><table>${rows}</table>${conversation ? `<h2>Relevant gesprek</h2><ul>${conversation}</ul>` : ''}</main>`,
      text: `Nieuwe chatbotaanvraag\nContacttype: ${data.contactType}\nNaam: ${data.name}\nVraag: ${data.question}\nPagina: ${data.pageUrl}`,
    }),
  });
  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
}
