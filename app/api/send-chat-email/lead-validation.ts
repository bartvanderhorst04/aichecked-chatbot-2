import { createHash } from 'node:crypto';

export interface LeadContactDetails {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  company?: string;
  need?: string;
}

export interface ValidLeadContactDetails {
  name: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  need: string;
}

type LeadValidationResult =
  | { valid: true; contactDetails: ValidLeadContactDetails }
  | { valid: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]+$/;

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string) {
  if (value.length > 30 || !PHONE_PATTERN.test(value)) return false;

  const digitCount = value.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15;
}

export function validateLeadContact(
  input?: LeadContactDetails
): LeadValidationResult {
  const contactDetails: ValidLeadContactDetails = {
    name: String(input?.name || '').trim(),
    email: String(input?.email || '').trim().toLowerCase(),
    phone: String(input?.phone || '').trim(),
    website: String(input?.website || '').trim(),
    company: String(input?.company || '').trim(),
    need: String(input?.need || '').trim(),
  };

  if (!contactDetails.name || contactDetails.name.length > 100) {
    return { valid: false, error: 'Een geldige naam is verplicht.' };
  }

  if (contactDetails.email && !isValidEmail(contactDetails.email)) {
    return { valid: false, error: 'Het e-mailadres is ongeldig.' };
  }

  if (contactDetails.phone && !isValidPhone(contactDetails.phone)) {
    return { valid: false, error: 'Het telefoonnummer is ongeldig.' };
  }

  if (!contactDetails.email && !contactDetails.phone) {
    return {
      valid: false,
      error: 'Een geldig e-mailadres of telefoonnummer is verplicht.',
    };
  }

  return { valid: true, contactDetails };
}

export function createLeadIdempotencyKey(
  contactDetails: ValidLeadContactDetails
) {
  const fingerprint = JSON.stringify([
    contactDetails.name.toLowerCase(),
    contactDetails.email,
    contactDetails.phone.replace(/\D/g, ''),
    contactDetails.website.toLowerCase(),
    contactDetails.company.toLowerCase(),
    contactDetails.need.toLowerCase(),
  ]);

  return `aichecked-lead-${createHash('sha256')
    .update(fingerprint)
    .digest('hex')}`;
}
