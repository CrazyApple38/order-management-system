const Kuroshiro = require('kuroshiro').default || require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

(async () => {
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer());

  const tests = [
    '虫眼鏡のフリーアイコン',
    'バットのアイコン素材',
    '手帳のアイコン素材',
    'キュートながま口財布アイコン',
    '三角型のドル袋のフリーアイコン',
    '桃のアイコン素材',
    '女の人のアイコン',
    '温泉宿の暖簾アイコン'
  ];

  for (const t of tests) {
    const romaji = await kuroshiro.convert(t, { to: 'romaji', mode: 'spaced' });
    console.log(`${t} → ${romaji}`);
  }
})();
