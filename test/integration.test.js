'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

test('manifest.json je platny MV3 manifest s potrebnymi pravami', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.manifest_version, 3);
  assert.strictEqual(manifest.action.default_popup, 'popup.html');
  for (const perm of ['tabs', 'tabGroups', 'storage']) {
    assert.ok(manifest.permissions.includes(perm), `chyba pravo ${perm}`);
  }
});

test('popup.html naciatava jadro pred popup.js', () => {
  const html = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
  const coreIndex = html.indexOf('src/tab-mover-core.js');
  const popupIndex = html.indexOf('popup.js');
  assert.ok(coreIndex !== -1, 'chyba referencia na src/tab-mover-core.js');
  assert.ok(popupIndex !== -1, 'chyba referencia na popup.js');
  assert.ok(coreIndex < popupIndex, 'tab-mover-core.js sa musi nacitat pred popup.js');
});
