export type ContactType =
  | 'WORKSHOP'
  | 'WORKSHOP_CALLBACK'
  | 'SALES'
  | 'SALES_CALLBACK'
  | 'PARTS'
  | 'PARTS_CALLBACK'
  | 'RECEPTION';

export type Flow = 'parts' | 'machine' | 'workshop' | 'occasion' | 'rental' | 'general';

const contactConfig: Record<ContactType, { environment: string; subject: string }> = {
  WORKSHOP: { environment: 'WORKSHOP_TO', subject: 'Werkplaatsvraag' },
  WORKSHOP_CALLBACK: { environment: 'WORKSHOP_TO', subject: 'Terugbelverzoek werkplaats' },
  SALES: { environment: 'SALES_TO', subject: 'Machineaanvraag' },
  SALES_CALLBACK: { environment: 'SALES_TO', subject: 'Terugbelverzoek verkoop' },
  PARTS: { environment: 'PARTS_TO', subject: 'Onderdelenvraag' },
  PARTS_CALLBACK: { environment: 'PARTS_TO', subject: 'Terugbelverzoek onderdelen' },
  RECEPTION: { environment: 'RECEPTION_TO', subject: 'Algemene contactvraag' },
};

export function getRecipient(type: ContactType): string | undefined {
  return process.env[contactConfig[type].environment];
}

export function getSubject(type: ContactType, name: string, question = ''): string {
  let base = contactConfig[type].subject;
  if (type === 'SALES') {
    if (/verhuur|huren/i.test(question)) base = 'Verhuuraanvraag';
    if (/occasion/i.test(question)) base = 'Occasionvraag';
    if (/offerte/i.test(question)) base = 'Offerteaanvraag';
  }
  if (type === 'PARTS' && /niet gevonden/i.test(question)) base = 'Onderdeel niet gevonden';
  if (type === 'WORKSHOP' && /onderhoud/i.test(question)) base = 'Onderhoudsvraag';
  if (type === 'WORKSHOP' && /reparatie/i.test(question)) base = 'Reparatieaanvraag';
  return `${base} – ${name}`;
}

export function contactTypeFor(flow: Flow, callback = false): ContactType {
  if (flow === 'parts') return callback ? 'PARTS_CALLBACK' : 'PARTS';
  if (flow === 'workshop') return callback ? 'WORKSHOP_CALLBACK' : 'WORKSHOP';
  if (flow === 'machine' || flow === 'occasion' || flow === 'rental') {
    return callback ? 'SALES_CALLBACK' : 'SALES';
  }
  return 'RECEPTION';
}
