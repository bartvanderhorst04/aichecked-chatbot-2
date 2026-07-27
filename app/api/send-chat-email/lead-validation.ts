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
const SUBMISSION_ID_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/;

export function isValidEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

export function isValidPhone(value: string) {
  if (value.length > 30 || !PHONE_PATTERN.test(value)) return false;

  const digitCount = value.replace(/\D/g, '').length;
  return digitCount >= 7 && digitCount <= 15;
}

export function isValidSubmissionId(value: string) {
  return SUBMISSION_ID_PATTERN.test(value);
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

  if (!contactDetails.email && !contactDetails.phone) {
    return {
      valid: false,
      error: 'Een geldig e-mailadres of telefoonnummer is verplicht.',
    };
  }

  const hasValidEmail = isValidEmail(contactDetails.email);
  const hasValidPhone = isValidPhone(contactDetails.phone);

  if (!hasValidEmail && !hasValidPhone) {
    return {
      valid: false,
      error: contactDetails.email
        ? 'Het e-mailadres is ongeldig.'
        : 'Het telefoonnummer is ongeldig.',
    };
  }

  if (!hasValidEmail) contactDetails.email = '';
  if (!hasValidPhone) contactDetails.phone = '';

  return { valid: true, contactDetails };
}

export function createLeadIdempotencyKey(submissionId: string) {
  if (!isValidSubmissionId(submissionId)) {
    throw new Error('Invalid lead submission ID.');
  }

  return `aichecked-lead-${submissionId}`;
}
