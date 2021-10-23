import tap from 'tap';
import fs from 'fs';
import Webmention from '../lib/webmention.js';

// eslint-disable-next-line no-sync
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

tap.test('microformat', t => {
  t.plan(2);
  const wm = new Webmention();
  wm.on('endpoints', endpoints => {
    t.ok(endpoints[0].source.includes('adactio.com'));
    t.ok(endpoints[0].target.includes('remysharp.com'));
    t.end();
  });
  wm.load(read('/fixtures/adactio-link.html'));
});

tap.test('microformat missing', t => {
  t.plan(1);
  const wm = new Webmention();
  wm.on('endpoints', endpoints => {
    t.equal(endpoints.length, 2);
    t.end();
  });
  wm.load(read('/fixtures/mf-missing.html'));
});
