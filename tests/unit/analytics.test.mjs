import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync('src/lib/analytics.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

function load(consent, { blocked = false, gtag } = {}) {
  const window = {
    localStorage: { getItem() { if (blocked) throw Error('blocked'); return consent; } },
    location: { pathname: '/kontakt' },
    gtag,
  };
  const context = { exports: {}, window };
  vm.runInNewContext(source, context);
  return { api: context.exports, window };
}

test('no events are queued before consent, after rejection or when storage fails', () => {
  for (const consent of [null, 'false']) {
    const { api, window } = load(consent);
    api.trackLead('kontaktni-formular');
    assert.equal(window.dataLayer, undefined);
  }
  const { api, window } = load('true', { blocked: true });
  api.trackPhoneClick();
  assert.equal(window.dataLayer, undefined);
});

test('lead and contact events include context without contact details', () => {
  const calls = [];
  const { api } = load('true', { gtag: (...args) => calls.push(args) });
  api.trackLead('kalkulacka', { value: 10000, currency: 'CZK' });
  api.trackPhoneClick('+420123456789');
  api.trackEmailClick('customer@example.com');
  assert.equal(calls[0][1], 'generate_lead');
  assert.equal(calls[0][2].form_source, 'kalkulacka');
  assert.equal(calls[0][2].page_path, '/kontakt');
  assert.equal(calls[0][2].value, 10000);
  assert.equal(calls[1][1], 'click_to_call');
  assert.equal(calls[2][1], 'click_to_email');
  assert.equal(JSON.stringify(calls).includes('123456789'), false);
  assert.equal(JSON.stringify(calls).includes('customer@'), false);
});

test('consented events before tag load use the gtag arguments queue format', () => {
  const { api, window } = load('true');
  api.trackPhoneClick();
  const command = window.dataLayer[0];
  assert.equal(Object.prototype.toString.call(command), '[object Arguments]');
  assert.equal(command[0], 'event');
  assert.equal(command[1], 'click_to_call');
  window.localStorage.getItem = () => 'false';
  api.trackEmailClick();
  assert.equal(window.dataLayer.length, 1);
});

test('server rendering does not access browser globals', () => {
  const context = { exports: {} };
  vm.runInNewContext(source, context);
  assert.equal(context.exports.hasAnalyticsConsent(), false);
  context.exports.trackPhoneClick();
});
