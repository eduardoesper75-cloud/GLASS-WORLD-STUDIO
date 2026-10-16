import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isOneClick,
  parseListUnsubscribeValue,
  parseListUnsubscribeHeaders,
  parseMailto,
  resolveUnsubscribeTarget,
} from './list-unsubscribe.js';
import type { MessageHeader } from './types.js';

function message(overrides: Partial<MessageHeader> = {}): MessageHeader {
  return {
    accountKey: 'A',
    mailbox: 'INBOX',
    uid: 1,
    fromName: '',
    fromAddress: 'news@example.com',
    domain: 'example.com',
    subject: '',
    date: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('extrae y despliega las cabeceras de baja', () => {
  const raw =
    'Subject: hola\r\n' +
    'List-Unsubscribe: <mailto:unsub@example.com>,\r\n' +
    ' <https://example.com/u?token=1>\r\n' +
    'List-Unsubscribe-Post: List-Unsubscribe=One-Click\r\n';
  const parsed = parseListUnsubscribeHeaders(raw);
  assert.equal(parsed.listUnsubscribe, '<mailto:unsub@example.com>, <https://example.com/u?token=1>');
  assert.equal(parsed.listUnsubscribePost, 'List-Unsubscribe=One-Click');
});

test('separa destinos mailto y https', () => {
  const parsed = parseListUnsubscribeValue(
    '<mailto:unsub@example.com>, <https://example.com/u?token=1>',
  );
  assert.deepEqual(parsed.mailto, ['mailto:unsub@example.com']);
  assert.deepEqual(parsed.https, ['https://example.com/u?token=1']);
});

test('tolera valores sin ángulos', () => {
  const parsed = parseListUnsubscribeValue('mailto:a@b.com, https://b.com/u');
  assert.deepEqual(parsed.mailto, ['mailto:a@b.com']);
  assert.deepEqual(parsed.https, ['https://b.com/u']);
});

test('detecta la baja en un clic', () => {
  assert.equal(isOneClick('List-Unsubscribe=One-Click'), true);
  assert.equal(isOneClick('list-unsubscribe=one-click'), true);
  assert.equal(isOneClick(undefined), false);
  assert.equal(isOneClick('List-Unsubscribe=Something-Else'), false);
});

test('resuelve one-click cuando hay Post', () => {
  const target = resolveUnsubscribeTarget('example.com', 'news@example.com', [
    message({
      listUnsubscribe: '<https://example.com/u?t=1>',
      listUnsubscribePost: 'List-Unsubscribe=One-Click',
    }),
  ]);
  assert.equal(target.method, 'one-click');
  assert.equal(target.endpoint, 'https://example.com/u?t=1');
});

test('resuelve mailto cuando no hay Post', () => {
  const target = resolveUnsubscribeTarget('example.com', 'news@example.com', [
    message({ listUnsubscribe: '<mailto:unsub@example.com>' }),
  ]);
  assert.equal(target.method, 'mailto');
  assert.equal(target.endpoint, 'mailto:unsub@example.com');
});

test('resuelve manual para URL sin one-click', () => {
  const target = resolveUnsubscribeTarget('example.com', 'news@example.com', [
    message({ listUnsubscribe: '<https://example.com/u?t=1>' }),
  ]);
  assert.equal(target.method, 'manual');
  assert.equal(target.manualLink, 'https://example.com/u?t=1');
});

test('resuelve manual sin cabecera', () => {
  const target = resolveUnsubscribeTarget('example.com', 'news@example.com', [message()]);
  assert.equal(target.method, 'manual');
  assert.equal(target.endpoint, undefined);
});

test('parsea mailto con subject', () => {
  assert.deepEqual(parseMailto('mailto:unsub@example.com'), { to: 'unsub@example.com' });
  assert.deepEqual(parseMailto('mailto:unsub@example.com?subject=unsubscribe%20me'), {
    to: 'unsub@example.com',
    subject: 'unsubscribe me',
  });
});
