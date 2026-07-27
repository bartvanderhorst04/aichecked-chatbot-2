import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createLeadIdempotencyKey,
  validateLeadContact,
} from '../app/api/send-chat-email/lead-validation.ts';

test('accepts a name with a valid email address', () => {
  const result = validateLeadContact({
    name: 'Bart',
    email: 'bart@example.nl',
  });

  assert.equal(result.valid, true);
});

test('accepts a name with a valid phone number and no email', () => {
  const result = validateLeadContact({
    name: 'Bart',
    phone: '+31 6 12345678',
  });

  assert.equal(result.valid, true);
});

test('rejects a submission without a name', () => {
  const result = validateLeadContact({ email: 'bart@example.nl' });

  assert.equal(result.valid, false);
});

test('rejects a submission without email or phone', () => {
  const result = validateLeadContact({ name: 'Bart' });

  assert.equal(result.valid, false);
});

test('rejects invalid contact methods', () => {
  assert.equal(
    validateLeadContact({ name: 'Bart', email: 'ongeldig' }).valid,
    false
  );
  assert.equal(
    validateLeadContact({ name: 'Bart', phone: '123' }).valid,
    false
  );
});

test('generates one stable idempotency key for repeated lead requests', () => {
  const first = validateLeadContact({
    name: ' Bart ',
    email: 'BART@EXAMPLE.NL',
    need: 'AI scan',
  });
  const repeated = validateLeadContact({
    name: 'Bart',
    email: 'bart@example.nl',
    need: 'AI scan',
  });

  assert.equal(first.valid, true);
  assert.equal(repeated.valid, true);
  if (!first.valid || !repeated.valid) return;

  assert.equal(
    createLeadIdempotencyKey(first.contactDetails),
    createLeadIdempotencyKey(repeated.contactDetails)
  );
});

test('the API validates before calling Resend and supplies idempotency', async () => {
  const source = await readFile(
    new URL('../app/api/send-chat-email/route.ts', import.meta.url),
    'utf8'
  );
  const validationPosition = source.indexOf(
    'validateLeadContact(data.contactDetails)'
  );
  const resendPosition = source.indexOf(
    "fetch('https://api.resend.com/emails'"
  );

  assert.ok(validationPosition >= 0);
  assert.ok(resendPosition > validationPosition);
  assert.match(source, /'Idempotency-Key': idempotencyKey/);
});

test('only submits the React lead notification after form completion', async () => {
  const source = await readFile(
    new URL('../components/AICheckedChatbot.tsx', import.meta.url),
    'utf8'
  );
  const openFormHandler = source.match(
    /function handleKennismaking[\s\S]*?\n  }\n\n  async function handleLeadSubmit/
  )?.[0];
  const submitHandler = source.match(
    /async function handleLeadSubmit[\s\S]*?\n  }\n\n  function handleKeyDown/
  )?.[0];

  assert.ok(openFormHandler);
  assert.ok(submitHandler);
  assert.doesNotMatch(openFormHandler, /sendChatEmail/);
  assert.match(submitHandler, /await sendChatEmail\(nextMessages, data\)/);
});
