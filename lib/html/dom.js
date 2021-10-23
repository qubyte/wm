import cheerio from 'cheerio';

export default function main(html) {
  const $ = cheerio.load(html.toString());

  let base = $('.h-entry, .hentry');

  if (base.length === 0) {
    base = $('html');
  }

  return { base, $ };
}
