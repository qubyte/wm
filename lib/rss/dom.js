import Parser from 'rss-parser';
import cheerio from 'cheerio';

export default async function main(rawXml, limit = 10) {
  const xml = rawXml.toString();
  const rss = await new Parser({
    customFields: {
      item: ['summary']
    }
  }).parseString(xml);
  const dollar = cheerio.load(xml);

  const url = rss.link;

  let items = rss.items;
  if (limit) {
    items = items.slice(0, limit);
  }

  const base = {
    map(callback) {
      const res = items.map((item, i) => {
        return callback(i, item);
      });

      return {
        get() {
          return res;
        }
      };
    }
  };

  const $ = element => {
    if (typeof element === 'string') {
      return {
        attr() {
          return null;
        }
      };
    }

    if (element.content && element.content.$ && element.content.$.type === 'html') {
      return dollar(element.content);
    }

    if (element.content) {
      // try encoded content first
      return dollar(
        element['content:encoded'] || `<div>${element.content}</div>`
      );
    }

    if (element.summary) {
      if (element.summary.$ && element.summary.$.type === 'text') {
        return dollar(`<p>${element.summary._}</p>`);
      }
    }

    return dollar(element);
  };

  return { base, $, url, rss: { items } };
}
