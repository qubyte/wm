import tap from 'tap';
import request from '../lib/request.js';

tap.test('request a duff domain', t => {
  t.plan(1);
  const timeout = 2000;
  const now = Date.now();
  request('http://www.communitymx.com', timeout)
    .then(() => {
      t.fail('should not resolve');
    })
    .catch(() => {
      t.ok(Date.now() - now < timeout + 1000);
    });
});
