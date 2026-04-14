// ============================================================
// demo-data.js — デモデータ定義（固定 + ランダム生成）
// screen-layout.html から読み込まれる
// ============================================================

// --------------------------------------------------
// 固定マスターデータ（グループ会社・組織階層・社員・車両・ETC・連絡先）
// --------------------------------------------------

const groupCompaniesData = [
    { id: 1, code: 'touo', name: '東央警備', shortName: '東央', rowClass: 'md-gc-row-touo' },
    { id: 2, code: 'nikkei', name: 'Nikkeiホールディングス', shortName: 'Nikkei', rowClass: 'md-gc-row-nikkei' },
    { id: 3, code: 'zennihon', name: '全日本エンタープライズ', shortName: 'AJE', rowClass: 'md-gc-row-zennihon' }
];

// 組織階層種別定義（グループ会社ごとの階層名）
const orgLevelTypesData = {
    touo:     [{ depth: 1, name: '課' }],
    nikkei:   [{ depth: 1, name: '課' }],
    zennihon: [{ depth: 1, name: '拠点' }, { depth: 2, name: '課' }]
};

// 組織ノード（自己参照ツリー）
const orgUnitsData = {
    touo: [
        { id: 'touo-shisetsu', name: '施設課', depth: 1, parentId: null },
        { id: 'touo-kotsu', name: '交通課', depth: 1, parentId: null }
    ],
    nikkei: [
        { id: 'nikkei-shisetsu', name: '施設課', depth: 1, parentId: null },
        { id: 'nikkei-kotsu', name: '交通課', depth: 1, parentId: null }
    ],
    zennihon: [
        { id: 'zen-honsha', name: '本社', depth: 1, parentId: null, children: [
            { id: 'zen-kotsu1', name: '交通一課', depth: 2, parentId: 'zen-honsha' },
            { id: 'zen-kotsu2', name: '交通二課', depth: 2, parentId: 'zen-honsha' },
            { id: 'zen-kotsu3', name: '交通三課', depth: 2, parentId: 'zen-honsha' }
        ]},
        { id: 'zen-ehime', name: '愛媛営業所', depth: 1, parentId: null }
    ]
};

// 後方互換: フラット化した組織ノード一覧（dept参照用）
var departmentsData = (function() {
    var result = {};
    Object.keys(orgUnitsData).forEach(function(gc) {
        var flat = [];
        function walk(nodes) {
            nodes.forEach(function(n) {
                flat.push({ id: n.id, name: n.name, depth: n.depth, parentId: n.parentId });
                if (n.children) walk(n.children);
            });
        }
        walk(orgUnitsData[gc]);
        result[gc] = flat;
    });
    return result;
})();

const employeesData = [
    { name: '田中', company: 'touo', dept: 'touo-shisetsu' },
    { name: '佐藤', company: 'touo', dept: 'touo-shisetsu' },
    { name: '鈴木', company: 'touo', dept: 'touo-kotsu' },
    { name: '高橋', company: 'touo', dept: 'touo-kotsu' },
    { name: '伊藤', company: 'touo', dept: 'touo-shisetsu' },
    { name: '林',   company: 'touo', dept: 'touo-shisetsu' },
    { name: '斎藤', company: 'touo', dept: 'touo-kotsu' },
    { name: '池田', company: 'touo', dept: 'touo-shisetsu' },
    { name: '橋本', company: 'touo', dept: 'touo-kotsu' },
    { name: '山本', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '中村', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '小林', company: 'nikkei', dept: 'nikkei-kotsu' },
    { name: '渡辺', company: 'nikkei', dept: 'nikkei-kotsu' },
    { name: '加藤', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '清水', company: 'nikkei', dept: 'nikkei-kotsu' },
    { name: '山口', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '阿部', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '吉田', company: 'zennihon', dept: 'zen-kotsu1' },
    { name: '山田', company: 'zennihon', dept: 'zen-kotsu1' },
    { name: '松本', company: 'zennihon', dept: 'zen-kotsu2' },
    { name: '井上', company: 'zennihon', dept: 'zen-kotsu2' },
    { name: '木村', company: 'zennihon', dept: 'zen-kotsu3' },
    { name: '森',   company: 'zennihon', dept: 'zen-kotsu3' },
    { name: '石川', company: 'zennihon', dept: 'zen-ehime' },
    { name: '前田', company: 'zennihon', dept: 'zen-ehime' }
];

const vehiclesData = [
    { plate: 'さ 3078', model: 'ハイエース', owner: 'touo' },
    { plate: 'わ 2490', model: 'キャラバン', owner: 'touo' },
    { plate: 'く 7521', model: 'プロボックス', owner: 'nikkei' },
    { plate: 'あ 1234', model: 'ハイエース', owner: 'touo' },
    { plate: 'か 5678', model: 'キャンター', owner: 'nikkei' },
    { plate: 'た 9012', model: 'エルフ', owner: 'touo' },
];

const etcCardsData = [
    { label: 'ETC-A', owner: 'touo' },
    { label: 'ETC-B', owner: 'touo' },
    { label: 'ETC-C', owner: 'touo' },
    { label: 'ETC-D', owner: 'touo' },
    { label: 'ETC-E', owner: 'touo' },
    { label: 'ETC-F', owner: 'touo' },
    { label: 'ETC く7521', owner: 'nikkei' },
    { label: 'ETC わ2490', owner: 'nikkei' },
    { label: 'ETC か5678', owner: 'nikkei' },
];

const contactsData = [
    { id: 1, name: '会社' },
    { id: 2, name: '直' },
    { id: 3, name: 'LINE' }
];

// --------------------------------------------------
// 固定デフォルトデータ（契約先 / 現場）
// --------------------------------------------------

const defaultCompaniesData = [
    { id: 1, name: '〇〇株式会社' },
    { id: 2, name: '△△建設' },
    { id: 3, name: '□□イベント' },
    { id: 4, name: '西日本高速道路' },
    { id: 5, name: '◇◇工業' },
    { id: 6, name: 'ABC警備' },
    { id: 7, name: '東央警備' },
    { id: 8, name: '西日本高速道路エンジニアリング四国' }
];

const defaultSitesData = {
    1: [
        { id: 101, name: '〇〇ビル', hierarchyDepth: 2, subItems: [
            { id: 1001, name: '巡回警備', subItems: [] },
            { id: 1002, name: '夜間警備', subItems: [] }
        ]},
        { id: 103, name: '本社', hierarchyDepth: 2, subItems: [
            { id: 1003, name: '受付警備', subItems: [] }
        ]}
    ],
    2: [
        { id: 201, name: '国道〇号線', hierarchyDepth: 2, subItems: [
            { id: 2001, name: '舗装工事', subItems: [] }
        ]},
        { id: 202, name: '県道△号', hierarchyDepth: 2, subItems: [
            { id: 2002, name: '橋梁工事', subItems: [] }
        ]}
    ],
    3: [
        { id: 301, name: '〇〇会館 展示会', hierarchyDepth: 1, subItems: [] },
        { id: 302, name: '〇〇アリーナ コンサート', hierarchyDepth: 1, subItems: [] }
    ],
    4: [
        { id: 401, name: '24-1234', hierarchyDepth: 3, subItems: [
            { id: 4001, name: '〇〇橋補修工事', subItems: [
                { id: 40001, name: '点検作業' },
                { id: 40002, name: '清掃作業' }
            ]}
        ]},
        { id: 402, name: '24-5678', hierarchyDepth: 3, subItems: [
            { id: 4002, name: 'トンネル清掃', subItems: [
                { id: 40003, name: '日常清掃' }
            ]}
        ]}
    ],
    5: [
        { id: 501, name: '県道〇号', hierarchyDepth: 2, subItems: [
            { id: 5001, name: '夜間規制', subItems: [] }
        ]},
        { id: 502, name: '工場前', hierarchyDepth: 2, subItems: [
            { id: 5002, name: '交通整理', subItems: [] }
        ]}
    ],
    6: [],
    7: [],
    8: []
};

// --------------------------------------------------
// ランダム生成ユーティリティ
// --------------------------------------------------

const DemoDataGenerator = (() => {
    // 会社名パーツ
    const companyPrefixes = [
        '東日本', '西日本', '北海道', '九州', '中部', '関西', '東北', '四国',
        '首都圏', '南海', '太平洋', '日本海', '瀬戸内', '北陸'
    ];
    const companySuffixes = [
        '建設', '工業', '不動産', '開発', '設備', 'エンジニアリング',
        'サービス', '電気', '通信', '商事', '物産', '運輸', '警備保障'
    ];
    const companyForms = ['株式会社', '有限会社', '合同会社'];

    // 現場名パーツ
    const siteBuildings = [
        'センタービル', '第一ビル', '中央タワー', '駅前ビル', 'パークビル',
        'グランドタワー', 'スクエアビル', 'プラザビル', 'シティタワー', 'ガーデンビル'
    ];
    const siteRoads = [
        '国道1号線', '国道2号線', '県道15号', '県道42号', '市道東3号線',
        '高速道路SA付近', '環状線', '産業道路', '臨港道路', '都市計画道路'
    ];
    const siteEvents = [
        '市民会館 展示会', '総合体育館 大会', '文化ホール コンサート',
        '国際会議場 カンファレンス', '運動公園 マラソン大会', 'アリーナ ライブ',
        '市民広場 祭り', '駅前広場 イベント'
    ];
    const siteInfra = [
        '橋梁補修工事', 'トンネル点検', '舗装復旧工事', '法面工事',
        '排水設備工事', '照明設備更新', '防護柵設置', 'ガードレール更新'
    ];

    // 警備・作業名パーツ
    const guardTasks = [
        '巡回警備', '常駐警備', '夜間警備', '受付警備', '出入管理',
        '監視業務', '施錠管理', '防災センター業務'
    ];
    const roadTasks = [
        '交通誘導', '片側交互通行', '夜間規制', '車線規制',
        '歩行者誘導', '搬入誘導', '大型車誘導'
    ];
    const maintenanceTasks = [
        '日常清掃', '定期清掃', '点検作業', '補修作業', '塗装作業',
        '除草作業', '排水清掃'
    ];

    let nextId = 10000;
    function genId() { return nextId++; }

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function pickN(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(n, shuffled.length));
    }
    function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

    // 会社名生成
    function generateCompanyName() {
        const r = Math.random();
        if (r < 0.6) {
            return pick(companyForms) + pick(companyPrefixes) + pick(companySuffixes);
        } else if (r < 0.85) {
            return pick(companyPrefixes) + pick(companySuffixes);
        } else {
            const code = String(randInt(10, 99)) + '-' + String(randInt(1000, 9999));
            return pick(companyPrefixes) + pick(companySuffixes) + '（' + code + '）';
        }
    }

    // 現場生成（hierarchyDepth=1: フラット, 2: 1階層, 3: 2階層）
    function generateSites(companyIndex) {
        const siteCount = randInt(0, 3);
        if (siteCount === 0) return [];

        const sites = [];
        for (let i = 0; i < siteCount; i++) {
            const depth = pick([1, 1, 2, 2, 2, 3]);
            const siteType = pick(['building', 'road', 'event', 'infra']);
            let siteName;
            switch (siteType) {
                case 'building': siteName = pick(siteBuildings); break;
                case 'road':     siteName = pick(siteRoads); break;
                case 'event':    siteName = pick(siteEvents); break;
                case 'infra': {
                    const code = String(randInt(20, 26)) + '-' + String(randInt(1000, 9999));
                    siteName = code;
                    break;
                }
            }

            const site = { id: genId(), name: siteName, hierarchyDepth: depth, subItems: [] };

            if (depth >= 2) {
                const sub1Count = randInt(1, 3);
                for (let j = 0; j < sub1Count; j++) {
                    const taskPool = siteType === 'building' ? guardTasks
                                   : siteType === 'road' ? roadTasks
                                   : siteType === 'infra' ? siteInfra
                                   : guardTasks;
                    const sub1 = { id: genId(), name: pick(taskPool), subItems: [] };

                    if (depth >= 3) {
                        const sub2Count = randInt(1, 2);
                        for (let k = 0; k < sub2Count; k++) {
                            sub1.subItems.push({ id: genId(), name: pick(maintenanceTasks) });
                        }
                    }
                    site.subItems.push(sub1);
                }
            }
            sites.push(site);
        }
        return sites;
    }

    // メイン生成関数
    function generate() {
        nextId = 10000;
        const companyCount = randInt(5, 10);
        const companies = [];
        const sites = {};
        const usedNames = new Set();

        for (let i = 0; i < companyCount; i++) {
            let name;
            do { name = generateCompanyName(); } while (usedNames.has(name));
            usedNames.add(name);

            const id = i + 1;
            companies.push({ id, name });
            sites[id] = generateSites(i);
        }

        return { companies, sites };
    }

    return { generate };
})();

// --------------------------------------------------
// アクティブデータ（mutable — 画面から操作される）
// --------------------------------------------------

const companiesData = [...defaultCompaniesData];
const sitesData = JSON.parse(JSON.stringify(defaultSitesData));

// --------------------------------------------------
// データ切替 API
// --------------------------------------------------

function resetDemoData(mode) {
    let newCompanies, newSites;

    if (mode === 'random') {
        const generated = DemoDataGenerator.generate();
        newCompanies = generated.companies;
        newSites = generated.sites;
    } else {
        newCompanies = JSON.parse(JSON.stringify(defaultCompaniesData));
        newSites = JSON.parse(JSON.stringify(defaultSitesData));
    }

    // companiesData を入れ替え
    companiesData.length = 0;
    newCompanies.forEach(c => companiesData.push(c));

    // sitesData を入れ替え
    Object.keys(sitesData).forEach(k => delete sitesData[k]);
    Object.assign(sitesData, newSites);

    // コンボボックスを再初期化
    if (typeof companyCombobox !== 'undefined' && companyCombobox) {
        companyCombobox.setItems(companiesData);
        companyCombobox.clearSelection();
    }
    if (typeof siteNameCombobox !== 'undefined' && siteNameCombobox) {
        siteNameCombobox.setItems([]);
        siteNameCombobox.clearSelection();
    }
}
