import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEntry } from '../data/factory.js';

test('request entries use direct polite variants instead of adding ช่วย to negative preferences', () => {
  const entry = makeEntry('coffee', 'test', '不甜', 'ไม่หวาน', 'mâi wǎan', 'request');
  assert.deepEqual(entry.examples.map(x => x.th), ['ไม่หวานค่ะ', 'ไม่หวานนะคะ']);
});

test('place entries make location and direction phrases', () => {
  const entry = makeEntry('directions', 'test', '左边', 'ซ้าย', 'sáai', 'place');
  assert.deepEqual(entry.collocations.map(x => x.th), ['อยู่ซ้าย', 'ไปทางซ้าย']);
  assert.deepEqual(entry.examples.map(x => x.th), ['อยู่ซ้ายค่ะ', 'ไปทางซ้ายค่ะ']);
});
