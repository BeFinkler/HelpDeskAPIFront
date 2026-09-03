import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passwordError, formatDate, initials } from '../../src/utils/format.js';

test('senha respeita limite em bytes também para caracteres Unicode', () => {
  assert.ok(passwordError('curta'));
  assert.equal(passwordError('uma senha longa e válida'), '');
  assert.ok(passwordError('á'.repeat(37)));
});
test('datas ausentes ou inválidas têm apresentação previsível', () => {
  assert.equal(formatDate(null), '—');
  assert.equal(formatDate('data-invalida'), '—');
  assert.ok(formatDate('2026-09-03T12:00:00.000Z').includes('2026'));
});
test('nomes são apresentados sem depender de uma foto de perfil', () => {
  assert.equal(initials('  Maria da Silva '), 'MD');
  assert.equal(initials(''), '?');
});
