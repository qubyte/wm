import timeoutSignal from 'timeout-signal';
import fetch from 'node-fetch';
import li from 'li';
import cheerio from 'cheerio';

const cache = new Map();

export default async function main(source) {
  if (cache.has(source)) {
    return { source, endpoint: cache.get(source) };
  }

  let endpoint;

  try {
    endpoint = await getWebmentionUrl(source);
  } finally {
    cache.set(source, endpoint || null);
  }

  return { source, endpoint };
}

export function findEndpoints(html, baseUrl) {
  const $ = cheerio.load(html);

  const res = $('link, a')
    .map((_, el) => {
      const rels = (el.attribs.rel || '').split(' ').filter(Boolean);

      // We explicitly check for undefined because we want to catch empty strings, but those are falsy
      if ((rels.includes('webmention') || rels.includes('pingback')) && typeof el.attribs.href !== 'undefined') {
        return {
          url: new URL(el.attribs.href, baseUrl).href,
          type: rels.includes('webmention') ? 'webmention' : 'pingback'
        };
      }

      return null;
    })
    .get()
    .filter(Boolean);

  const webmention = res.find(_ => _.type === 'webmention');
  return webmention || res[0];
}

async function getWebmentionUrl(opts) {
  let url;

  if (typeof opts === 'string') {
    url = new URL(opts);
  } else if (opts.url) {
    url = new URL(opts.url);
  } else {
    throw new Error('Don\'t know what to do here.');
  }

  const res = await fetch(url, { signal: timeoutSignal(5000) }); // TODO handle timeout

  if (!res.ok) {
    throw new Error(`Unexpected status from ${url}: ${res.status}`);
  }

  if (res.headers['x-pingback']) {
    return { url: res.headers['x-pingback'], type: 'pingback' };
  }

  if (res.headers.link) {
    const links = li.parse(res.headers.link);
    const endpoint = links.webmention || links['http://webmention.org/'];

    if (endpoint) {
      return {
        url: new URL(endpoint, res.url).href,
        type: 'webmention'
      };
    }
  }

  // don't try to parse non-text (i.e. mp3s!)
  if (!res.headers['content-type'] || !res.headers['content-type'].startsWith('text/')) {
    return;
  }

  const text = await res.text();

  return findEndpoints(text, res.url);
}
