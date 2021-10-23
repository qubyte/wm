import fetch from 'node-fetch';
import timeoutSignal from 'timeout-signal';

// by default timeout at 5 seconds
export default async function main(url, timeout = 5000) {
  const res = await fetch(url, { signal: timeoutSignal(timeout) });

  if (!res.ok) {
    throw new Error(`Unexpected response status from ${url}: ${res.status}`);
  }

  const content = await res.text();

  return { content, url: res.url };
}
