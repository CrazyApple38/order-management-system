const cheerio = require('cheerio');
(async () => {
  const resp = await fetch('https://icooon-mono.com/category/business/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await resp.text();
  const $ = cheerio.load(html);

  // Find all pagination-related elements
  const paginationAreas = [];

  // Check for common pagination patterns
  $('*').each((_, el) => {
    const cls = $(el).attr('class') || '';
    const id = $(el).attr('id') || '';
    if (cls.match(/pag|navi|page/i) || id.match(/pag|navi|page/i)) {
      paginationAreas.push({
        tag: el.tagName,
        class: cls.substring(0, 80),
        id: id,
        text: $(el).text().trim().substring(0, 100)
      });
    }
  });

  console.log('Pagination areas found:', paginationAreas.length);
  paginationAreas.slice(0, 10).forEach(p => console.log(p));

  // Look for "Page X of Y" text
  const pageText = $('body').text().match(/Page\s+\d+\s+of\s+\d+/i);
  console.log('\nPage text:', pageText?.[0]);

  // Find all links with /page/ in URL
  const pageLinks = [];
  $('a[href*="/page/"]').each((_, el) => {
    pageLinks.push({ href: $(el).attr('href'), text: $(el).text().trim() });
  });
  console.log('\nPage links:', pageLinks.length);
  pageLinks.slice(0, 5).forEach(l => console.log(l));
})();
