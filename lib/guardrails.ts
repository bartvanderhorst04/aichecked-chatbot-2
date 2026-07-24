import type { ContactType } from './contactRouting.ts';

const secretRequest = /\b(api.?key|secret|wachtwoord|password|system prompt|systeeminstruct|developer message|interne (regels|configuratie)|ignore (previous|all) instructions)\b/i;
const priceRequest = /\b(prijs|prijzen|kost|kosten|cost|price|preis|angebot)\b/i;

export type GuardrailResult =
  | { kind: 'blocked'; reply: string }
  | { kind: 'price'; reply: string; showForm: true }
  | { kind: 'allow' };

export function applyGuardrails(input: string): GuardrailResult {
  if (secretRequest.test(input)) {
    return {
      kind: 'blocked',
      reply: 'Ik kan geen interne informatie delen. Waarmee kan ik u helpen met weg-, berm- of slootonderhoud?',
    };
  }
  if (priceRequest.test(input)) {
    return {
      kind: 'price',
      reply: 'De prijs is op afspraak. Laat gerust uw gegevens achter, dan nemen wij contact met u op.',
      showForm: true,
    };
  }
  return { kind: 'allow' };
}

export function classifyQuestion(input: string): ContactType {
  if (/\b(onderdeel|oem|artikelnummer|webshop|part|teile)\b/i.test(input)) return 'PARTS';
  if (/\b(onderhoud|reparatie|technisch|werkplaats|maintenance|repair|wartung|reparatur)\b/i.test(input)) return 'WORKSHOP';
  if (/\b(machine|offerte|verhuur|huren|occasion|sales|rental|mieten)\b/i.test(input)) return 'SALES';
  return 'RECEPTION';
}

export function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength) : '';
}
