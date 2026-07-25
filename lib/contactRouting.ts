export type ContactType =
  | 'WORKSHOP'
  | 'WORKSHOP_CALLBACK'
  | 'SALES'
  | 'SALES_CALLBACK'
  | 'PARTS'
  | 'PARTS_CALLBACK'
  | 'RECEPTION';

export type Flow = 'parts' | 'machine' | 'workshop' | 'occasion' | 'rental' | 'general';

const contactConfig: Record<ContactType, { environments: string[]; fallback: string; subject: string }> = {
  WORKSHOP: { environments: ['SERVICE_EMAIL', 'WORKSHOP_TO'], fallback: 'werkplaats@wimvanbreda.nl', subject: 'Werkplaatsvraag' },
  WORKSHOP_CALLBACK: { environments: ['SERVICE_EMAIL', 'WORKSHOP_TO'], fallback: 'werkplaats@wimvanbreda.nl', subject: 'Terugbelverzoek werkplaats' },
  SALES: { environments: ['SALES_EMAIL', 'SALES_TO'], fallback: 'wimvanbreda@wimvanbreda.nl', subject: 'Machineaanvraag' },
  SALES_CALLBACK: { environments: ['SALES_EMAIL', 'SALES_TO'], fallback: 'wimvanbreda@wimvanbreda.nl', subject: 'Terugbelverzoek verkoop' },
  PARTS: { environments: ['PARTS_EMAIL', 'PARTS_TO'], fallback: 'magazijn@wimvanbreda.nl', subject: 'Onderdelenvraag' },
  PARTS_CALLBACK: { environments: ['PARTS_EMAIL', 'PARTS_TO'], fallback: 'magazijn@wimvanbreda.nl', subject: 'Terugbelverzoek onderdelen' },
  RECEPTION: { environments: ['GENERAL_CONTACT_EMAIL', 'RECEPTION_TO'], fallback: 'receptie@wimvanbreda.nl', subject: 'Algemene contactvraag' },
};

export function getRecipient(type: ContactType): string {
  const config = contactConfig[type];
  return config.environments.map((environment) => process.env[environment]).find(Boolean) || config.fallback;
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
