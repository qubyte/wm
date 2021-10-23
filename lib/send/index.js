import webmention from './webmention.js';
import pingback from './pingback.js';

export default function main({ source, target, endpoint }) {
  if (endpoint.type === 'webmention') {
    return webmention({ source, target, endpoint: endpoint.url });
  }

  if (endpoint.type === 'pingback') {
    return pingback({ source, target, endpoint: endpoint.url });
  }
}
