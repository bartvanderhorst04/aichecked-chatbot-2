import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  clearProcessedLeadSubmissionsForTests,
  processLeadSubmission,
} from '../app/api/send-chat-email/lead-notification.ts';

const componentSource = await readFile(
  new URL('../components/AICheckedChatbot.tsx', import.meta.url),
  'utf8'
);
const legacyEmbedSource = await readFile(
  new URL('../public/chatbot-embed.js', import.meta.url),
  'utf8'
);

function sourceBetween(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  assert.ok(startIndex >= 0, `Missing source marker: ${start}`);
  assert.ok(endIndex > startIndex, `Missing source marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

function assertNoNotificationCall(source) {
  assert.doesNotMatch(
    source,
    /sendChatEmail\s*\(|fetch\(['"]\/api\/send-chat-email/
  );
}

function createProviderMock() {
  const calls = [];
  return {
    calls,
    send: async (submission, idempotencyKey) => {
      calls.push({ submission, idempotencyKey });
    },
  };
}

test.beforeEach(() => {
  clearProcessedLeadSubmissionsForTests();
});

test('1. opening the chatbot sends no notification', () => {
  const launcher = sourceBetween(
    componentSource,
    'className="aic-launcher"',
    'aria-label={isOpen'
  );

  assertNoNotificationCall(launcher);
});

test('2. clicking quick replies sends no notification', () => {
  const quickReplyFlow = sourceBetween(
    componentSource,
    'function handlePainPointSelect',
    'function handleFollowUpAnswer'
  );

  assertNoNotificationCall(quickReplyFlow);
});

test('3. starting the AI Scan sends no notification', () => {
  const openContactForm = sourceBetween(
    componentSource,
    'function handleKennismaking',
    'async function handleLeadSubmit'
  );

  assertNoNotificationCall(openContactForm);
});

test('4. completing the questionnaire sends no notification', () => {
  const questionnaireCompletion = sourceBetween(
    componentSource,
    'function handleFollowUpAnswer',
    '// Routes typed input'
  );

  assertNoNotificationCall(questionnaireCompletion);
});

test('5. displaying the contact form sends no notification', () => {
  const contactFormView = sourceBetween(
    componentSource,
    "{chatState === 'lead-form'",
    "{/* ── Success state"
  );

  assertNoNotificationCall(contactFormView);
});

test('6. submitting without contact details sends no notification', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    { submissionId: 'empty-contact-0001' },
    provider.send
  );

  assert.equal(result.success, false);
  assert.equal(provider.calls.length, 0);
});

test('7. submitting only a name sends no notification', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    {
      submissionId: 'name-only-lead-0001',
      contactDetails: { name: 'Bart' },
    },
    provider.send
  );

  assert.equal(result.success, false);
  assert.equal(provider.calls.length, 0);
});

test('8. submitting an invalid email sends no notification', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    {
      submissionId: 'invalid-email-0001',
      contactDetails: { name: 'Bart', email: 'geen-geldig-adres' },
    },
    provider.send
  );

  assert.equal(result.success, false);
  assert.equal(provider.calls.length, 0);
});

test('9. valid name plus email sends exactly one notification', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    {
      submissionId: 'valid-email-lead-0001',
      contactDetails: { name: 'Bart', email: 'bart@example.nl' },
    },
    provider.send
  );

  assert.equal(result.success, true);
  assert.equal(provider.calls.length, 1);
});

test('10. valid name plus phone sends exactly one notification', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    {
      submissionId: 'valid-phone-lead-0001',
      contactDetails: { name: 'Bart', phone: '+31 6 12345678' },
    },
    provider.send
  );

  assert.equal(result.success, true);
  assert.equal(provider.calls.length, 1);
});

test('11. repeating the same submission ID sends no duplicate', async () => {
  const provider = createProviderMock();
  const payload = {
    submissionId: 'repeated-lead-0001',
    contactDetails: { name: 'Bart', email: 'bart@example.nl' },
  };

  const [first, repeated] = await Promise.all([
    processLeadSubmission(payload, provider.send),
    processLeadSubmission(payload, provider.send),
  ]);
  const sequentialRepeat = await processLeadSubmission(payload, provider.send);

  assert.equal(first.success, true);
  assert.equal(repeated.success, true);
  assert.equal(sequentialRepeat.success, true);
  assert.equal(provider.calls.length, 1);
  assert.equal(
    provider.calls[0].idempotencyKey,
    'aichecked-lead-repeated-lead-0001'
  );
});

test('a provider failure is not treated as a successful submission', async () => {
  let calls = 0;
  const failingProvider = async () => {
    calls += 1;
    throw new Error('Provider unavailable');
  };
  const payload = {
    submissionId: 'failed-provider-0001',
    contactDetails: { name: 'Bart', email: 'bart@example.nl' },
  };

  await assert.rejects(processLeadSubmission(payload, failingProvider));
  await assert.rejects(processLeadSubmission(payload, failingProvider));
  assert.equal(calls, 2);
});

test('one valid contact method is sufficient', async () => {
  const provider = createProviderMock();
  const result = await processLeadSubmission(
    {
      submissionId: 'valid-phone-fallback-0001',
      contactDetails: {
        name: 'Bart',
        email: 'ongeldig',
        phone: '+31 6 12345678',
      },
    },
    provider.send
  );

  assert.equal(result.success, true);
  assert.equal(provider.calls.length, 1);
  assert.equal(provider.calls[0].submission.contactDetails.email, '');
});

test('the endpoint exists only in the explicit React submit path', () => {
  const endpointCalls =
    componentSource.match(/fetch\('\/api\/send-chat-email'/g) || [];
  const leadSubmit = sourceBetween(
    componentSource,
    'async function handleLeadSubmit',
    'function handleKeyDown'
  );

  assert.equal(endpointCalls.length, 1);
  assert.match(leadSubmit, /fetch\('\/api\/send-chat-email'/);
  assert.ok(
    leadSubmit.indexOf('await request') <
      leadSubmit.indexOf("setChatState('lead-success')")
  );
});

test('the legacy embed only notifies from its explicit form submit handler', () => {
  const endpointCalls =
    legacyEmbedSource.match(/aicPost\("\/api\/send-chat-email"/g) || [];
  const formSubmit = sourceBetween(
    legacyEmbedSource,
    'aicLead.addEventListener("submit"',
    'window.setTimeout(function ()'
  );

  assert.equal(endpointCalls.length, 1);
  assert.match(formSubmit, /aicPost\("\/api\/send-chat-email"/);
  assert.match(formSubmit, /aicLeadSubmitting/);
  assert.match(formSubmit, /submissionId: aicSubmissionId/);
});
