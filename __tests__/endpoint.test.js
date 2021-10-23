import tap from 'tap';
import fs from 'fs';

// eslint-disable-next-line no-sync
const read = f => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const { findEndpoints } = require('../lib/endpoint');

tap.test('atom', t => {
  const source = read('/fixtures/pingback-first.html');

  const endpoint = findEndpoints(source, 'https://www.w3.org/TR/websub/');
  t.equal(endpoint.type, 'webmention');
  t.end();
});
