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

// isOnLeave: 休み申請を提出済みの社員（将来は休み申請スケジュール画面と連動予定）。
// workedPrevNight: 前日に夜勤をしていた社員（=明け勤務者）。
// モックでは GC ごとに 1 名ずつ isOnLeave を、3 名に workedPrevNight を付与。
const employeesData = [
    { name: '田中', company: 'touo', dept: 'touo-shisetsu' },
    { name: '佐藤', company: 'touo', dept: 'touo-shisetsu', workedPrevNight: true },
    { name: '鈴木', company: 'touo', dept: 'touo-kotsu' },
    { name: '高橋', company: 'touo', dept: 'touo-kotsu' },
    { name: '伊藤', company: 'touo', dept: 'touo-shisetsu' },
    { name: '林',   company: 'touo', dept: 'touo-shisetsu', isOnLeave: true },
    { name: '斎藤', company: 'touo', dept: 'touo-kotsu' },
    { name: '池田', company: 'touo', dept: 'touo-shisetsu' },
    { name: '橋本', company: 'touo', dept: 'touo-kotsu' },
    { name: '山本', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '中村', company: 'nikkei', dept: 'nikkei-shisetsu', workedPrevNight: true },
    { name: '小林', company: 'nikkei', dept: 'nikkei-kotsu' },
    { name: '渡辺', company: 'nikkei', dept: 'nikkei-kotsu' },
    { name: '加藤', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '清水', company: 'nikkei', dept: 'nikkei-kotsu', isOnLeave: true },
    { name: '山口', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '阿部', company: 'nikkei', dept: 'nikkei-shisetsu' },
    { name: '吉田', company: 'zennihon', dept: 'zen-kotsu1', workedPrevNight: true },
    { name: '山田', company: 'zennihon', dept: 'zen-kotsu1' },
    { name: '松本', company: 'zennihon', dept: 'zen-kotsu2' },
    { name: '井上', company: 'zennihon', dept: 'zen-kotsu2' },
    { name: '木村', company: 'zennihon', dept: 'zen-kotsu3' },
    { name: '森',   company: 'zennihon', dept: 'zen-kotsu3' },
    { name: '石川', company: 'zennihon', dept: 'zen-ehime' },
    { name: '前田', company: 'zennihon', dept: 'zen-ehime', isOnLeave: true }
];

// 拡張: id / numberPlate(フル) / nextShakenDate / nextInspectionDate を追加。
// 既存コードは plate / model / owner のみ参照しているため後方互換。
const vehiclesData = [
    // 東央警備
    { id: 'v-001', plate: 'さ 3078', numberPlate: '品川 500 さ 30-78', model: 'ハイエース',   owner: 'touo',     nextShakenDate: '2026-08-15', nextInspectionDate: '2026-06-10' },
    { id: 'v-002', plate: 'わ 2490', numberPlate: '品川 500 わ 24-90', model: 'キャラバン',   owner: 'touo',     nextShakenDate: '2026-11-20', nextInspectionDate: '2026-05-25' },
    { id: 'v-003', plate: 'あ 1234', numberPlate: '品川 500 あ 12-34', model: 'ハイエース',   owner: 'touo',     nextShakenDate: '2026-06-05', nextInspectionDate: '2026-09-01' },
    { id: 'v-004', plate: 'た 9012', numberPlate: '品川 800 た 90-12', model: 'エルフ',       owner: 'touo',     nextShakenDate: '2027-02-10', nextInspectionDate: '2026-07-20' },
    { id: 'v-005', plate: 'ふ 4501', numberPlate: '品川 300 ふ 45-01', model: 'プロボックス', owner: 'touo',     nextShakenDate: '2026-10-30', nextInspectionDate: '2026-05-18' },
    // Nikkei
    { id: 'v-006', plate: 'く 7521', numberPlate: '横浜 500 く 75-21', model: 'プロボックス', owner: 'nikkei',   nextShakenDate: '2026-09-12', nextInspectionDate: '2026-06-08' },
    { id: 'v-007', plate: 'か 5678', numberPlate: '横浜 800 か 56-78', model: 'キャンター',   owner: 'nikkei',   nextShakenDate: '2026-12-25', nextInspectionDate: '2026-05-22' },
    { id: 'v-008', plate: 'み 3344', numberPlate: '横浜 500 み 33-44', model: 'ハイエース',   owner: 'nikkei',   nextShakenDate: '2026-07-08', nextInspectionDate: '2026-08-15' },
    { id: 'v-009', plate: 'は 8899', numberPlate: '横浜 300 は 88-99', model: 'プロボックス', owner: 'nikkei',   nextShakenDate: '2027-01-15', nextInspectionDate: '2026-06-30' },
    { id: 'v-010', plate: 'の 6710', numberPlate: '横浜 800 の 67-10', model: 'エルフ',       owner: 'nikkei',   nextShakenDate: '2026-06-18', nextInspectionDate: '2026-09-10' },
    // 全日本
    { id: 'v-011', plate: 'ゆ 1122', numberPlate: '足立 500 ゆ 11-22', model: 'ハイエース',   owner: 'zennihon', nextShakenDate: '2026-08-30', nextInspectionDate: '2026-05-29' },
    { id: 'v-012', plate: 'ら 4455', numberPlate: '足立 800 ら 44-55', model: 'キャンター',   owner: 'zennihon', nextShakenDate: '2026-11-05', nextInspectionDate: '2026-06-22' },
    { id: 'v-013', plate: 'え 7788', numberPlate: '足立 300 え 77-88', model: 'プロボックス', owner: 'zennihon', nextShakenDate: '2026-05-28', nextInspectionDate: '2026-08-08' },
    { id: 'v-014', plate: 'り 2233', numberPlate: '足立 500 り 22-33', model: 'キャラバン',   owner: 'zennihon', nextShakenDate: '2026-10-12', nextInspectionDate: '2026-07-15' },
    { id: 'v-015', plate: 'お 9988', numberPlate: '足立 800 お 99-88', model: 'エルフ',       owner: 'zennihon', nextShakenDate: '2027-03-20', nextInspectionDate: '2026-06-15' },
];

// 種別定義 (車両スケジュール管理用)
const VS_KINDS = [
    { id: 'inspection', label: '点検',     color: '#1976d2' },
    { id: 'repair',     label: '修理',     color: '#d32f2f' },
    { id: 'oil',        label: 'オイル',   color: '#f57c00' },
    { id: 'shaken',     label: '車検',     color: '#7b1fa2' },
    { id: 'tire',       label: 'タイヤ',   color: '#388e3c' },
    { id: 'other',      label: 'その他',   color: '#616161' }
];

// 車両予定 (デモデータ)
const vehicleSchedulesData = [
    // 2026年5月（当月）
    { id: 'vs-001', vehicleId: 'v-001', date: '2026-05-15', startTime: '09:00', endTime: '12:00', kind: 'oil' },
    { id: 'vs-002', vehicleId: 'v-001', date: '2026-05-15', startTime: '13:00', endTime: '15:00', kind: 'tire' },
    { id: 'vs-003', vehicleId: 'v-003', date: '2026-05-18', startTime: '10:00', endTime: '17:00', kind: 'inspection' },
    { id: 'vs-004', vehicleId: 'v-007', date: '2026-05-20', startTime: '09:00', endTime: '11:00', kind: 'repair' },
    { id: 'vs-005', vehicleId: 'v-005', date: '2026-05-22', startTime: '14:00', endTime: '16:00', kind: 'oil' },
    { id: 'vs-006', vehicleId: 'v-011', date: '2026-05-25', startTime: '09:30', endTime: '12:30', kind: 'inspection' },
    { id: 'vs-007', vehicleId: 'v-008', date: '2026-05-28', startTime: '10:00', endTime: '15:00', kind: 'shaken' },
    { id: 'vs-008', vehicleId: 'v-013', date: '2026-05-28', startTime: '13:00', endTime: '17:00', kind: 'shaken' },
    { id: 'vs-009', vehicleId: 'v-002', date: '2026-05-29', startTime: '09:00', endTime: '11:00', kind: 'other', otherLabel: 'ETC再設定' },
    { id: 'vs-010', vehicleId: 'v-006', date: '2026-05-08', startTime: '10:00', endTime: '12:00', kind: 'oil' },
    // 2026年6月
    { id: 'vs-011', vehicleId: 'v-001', date: '2026-06-10', startTime: '09:00', endTime: '17:00', kind: 'inspection' },
    { id: 'vs-012', vehicleId: 'v-003', date: '2026-06-05', startTime: '10:00', endTime: '16:00', kind: 'shaken' },
    { id: 'vs-013', vehicleId: 'v-010', date: '2026-06-18', startTime: '09:00', endTime: '12:00', kind: 'shaken' },
    { id: 'vs-014', vehicleId: 'v-012', date: '2026-06-22', startTime: '13:00', endTime: '15:00', kind: 'tire' }
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
