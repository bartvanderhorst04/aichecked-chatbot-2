import {
  createLeadIdempotencyKey,
  isValidSubmissionId,
  type LeadContactDetails,
  type ValidLeadContactDetails,
  validateLeadContact,
} from './lead-validation.ts';

export interface ChatEmailMessage {
  role?: string;
  content?: string;
}

export interface LeadSubmissionPayload {
  submissionId?: string;
  pageUrl?: string;
  timestamp?: string;
  conversationStartedAt?: string;
  contactDetails?: LeadContactDetails;
  messages?: ChatEmailMessage[];
}

export interface ValidLeadSubmission
  extends Omit<LeadSubmissionPayload, 'submissionId' | 'contactDetails'> {
  submissionId: string;
  contactDetails: ValidLeadContactDetails;
}

export type LeadEmailProvider = (
  submission: ValidLeadSubmission,
  idempotencyKey: string
) => Promise<void>;

export type LeadSubmissionResult =
  | { success: true }
  | { success: false; status: 400; error: string };

const processedSubmissions = new Map<
  string,
  Promise<LeadSubmissionResult>
>();
const MAX_CACHED_SUBMISSIONS = 1000;

function cacheSubmission(
  submissionId: string,
  result: Promise<LeadSubmissionResult>
) {
  if (processedSubmissions.size >= MAX_CACHED_SUBMISSIONS) {
    const oldestSubmissionId = processedSubmissions.keys().next().value;
    if (oldestSubmissionId) processedSubmissions.delete(oldestSubmissionId);
  }

  processedSubmissions.set(submissionId, result);
}

export function processLeadSubmission(
  payload: LeadSubmissionPayload,
  sendEmail: LeadEmailProvider
): Promise<LeadSubmissionResult> {
  const submissionId = String(payload.submissionId || '').trim();

  if (!isValidSubmissionId(submissionId)) {
    return Promise.resolve({
      success: false,
      status: 400,
      error: 'Een geldig submission-ID is verplicht.',
    });
  }

  const validation = validateLeadContact(payload.contactDetails);
  if (!validation.valid) {
    return Promise.resolve({
      success: false,
      status: 400,
      error: validation.error,
    });
  }

  const existingSubmission = processedSubmissions.get(submissionId);
  if (existingSubmission) return existingSubmission;

  const submission: ValidLeadSubmission = {
    ...payload,
    submissionId,
    contactDetails: validation.contactDetails,
  };
  const result = sendEmail(
    submission,
    createLeadIdempotencyKey(submissionId)
  )
    .then<LeadSubmissionResult>(() => ({ success: true }))
    .catch((error) => {
      processedSubmissions.delete(submissionId);
      throw error;
    });

  cacheSubmission(submissionId, result);
  return result;
}

export function clearProcessedLeadSubmissionsForTests() {
  processedSubmissions.clear();
}
