const cheerio = require('cheerio');
(async () => {
  // Test: fetch one category page and extract icons
  const resp = await fetch('https://icooon-mono.com/category/business/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await resp.text();
  const $ = cheerio.load(html);

  // Find icon links
  const icons = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/icooon-mono\.com\/(\d{5})-/);
    if (match && !icons.find(i => i.id === match[1])) {
      icons.push({ id: match[1], title: $(el).text().trim().substring(0, 50), href: href.substring(0, 80) });
    }
  });

  console.log('Icons found:', icons.length);
  console.log('First 3:', JSON.stringify(icons.slice(0, 3), null, 2));

  // Check pagination
  const next = $('a').filter((_, el) => {
    const cls = $(el).attr('class') || '';
    const text = $(el).text();
    return cls.includes('next') || text === '»' || text.includes('次');
  });
  console.log('Next links:', next.length, next.map((_, el) => $(el).attr('href')).get());

  // Test SVG download
  const testId = icons[0]?.id;
  if (testId) {
    const svgUrl = `https://icooon-mono.com/i/icon_${testId}/icon_${testId}0.svg`;
    const svgResp = await fetch(svgUrl);
    const svg = await svgResp.text();
    console.log('\nSVG test:', svgUrl);
    console.log('SVG length:', svg.length, 'starts with:', svg.substring(0, 80));
  }

  // Test silhouette-illust listing
  const siResp = await fetch('https://www.silhouette-illust.com/illust/cate/mark', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const siHtml = await siResp.text();
  const $si = cheerio.load(siHtml);

  const siIcons = [];
  $si('a[href*="/illust/"]').each((_, el) => {
    const href = $si(el).attr('href') || '';
    const match = href.match(/\/illust\/(\d+)/);
    if (match && !siIcons.find(i => i.id === match[1])) {
      const img = $si(el).find('img').first();
      siIcons.push({
        id: match[1],
        title: (img.attr('alt') || '').substring(0, 50),
        thumb: (img.attr('src') || '').substring(0, 100)
      });
    }
  });
  console.log('\nSI Icons found:', siIcons.length);
  console.log('First 3:', JSON.stringify(siIcons.slice(0, 3), null, 2));

  // SI pagination
  const siNext = $si('a').filter((_, el) => {
    return ($si(el).attr('class') || '').includes('next');
  });
  console.log('SI Next:', siNext.length, siNext.map((_, el) => $si(el).attr('href')).get());
})();
