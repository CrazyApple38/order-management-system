/* ============================================================
   co-navbar.js — 共通ナビゲーションバー
   各画面の <body> 先頭に自動挿入
   ============================================================ */

(function () {
    'use strict';

    // --- 現在のページ判定 ---
    var path = location.pathname;
    var currentPage = 'other';
    if (path.indexOf('screen-layout') !== -1) currentPage = 'screen-layout';
    else if (path.indexOf('order-book') !== -1) currentPage = 'order-book';
    else if (path.indexOf('weekly-schedule') !== -1) currentPage = 'weekly-schedule';
    else if (path.indexOf('leave-application') !== -1) currentPage = 'leave-application';
    else if (path.indexOf('quick-access') !== -1) currentPage = 'quick-access';
    else if (path.indexOf('admin-notify') !== -1) currentPage = 'admin-notify';

    // --- 変更通知ベル定義（Phase N-1 確定 / 2026-05-15）
    //     業務頻度順（OB→SL→WS→LA │ 承認待ち→車両→マスタ）
    //     アイコンは notify-icons-selected.json (2026-05-16) 由来 ---
    var coNotifyBells = [
        { id: 'ob',      title: 'OBの変更通知',   tooltip: 'OB — 受注簿',         group: 'screen' },
        { id: 'sl',      title: 'SLの変更通知',   tooltip: 'SL — 業務管理計画書', group: 'screen' },
        { id: 'ws',      title: 'WSの変更通知',   tooltip: 'WS — 週間予定表',     group: 'screen' },
        { id: 'la',      title: 'LAの変更通知',   tooltip: 'LA — 休暇申請管理',   group: 'screen' },
        { id: 'pending', title: '休暇申請承認待ち', tooltip: '休暇申請 承認待ち',   group: 'cross'  },
        { id: 'vehicle', title: '車両スケジュール', tooltip: '車両スケジュール',   group: 'cross'  },
        { id: 'master',  title: 'マスタ更新',     tooltip: 'マスタ更新',           group: 'cross'  }
    ];
    window.coNotifyBells = coNotifyBells;

    // --- マスタ管理メニュー項目 ---
    var masterItems = [
        { id: 'employee',       label: '社員',               icon: 'person.svg' },
        { id: 'site',           label: '現場',               icon: 'chart.svg' },
        { id: 'company',        label: '契約先',             icon: 'tag.svg' },
        { divider: true },
        { id: 'site-category',  label: '区分 / 区分バッジ',  icon: 'palette.svg' },
        { id: 'vehicle',        label: '車両 / ETCカード',   icon: 'gear.svg' },
        { id: 'license-type',   label: '資格種別',           icon: 'tag.svg' },
        { divider: true },
        { id: 'group-company',  label: 'グループ会社',       icon: 'chart.svg' },
        { id: 'org-unit',       label: '組織階層',           icon: 'chart.svg' },
        { id: 'penalty-code',   label: 'ペナルティコード',   icon: 'pencil.svg' },
        { id: 'holiday',        label: '祝日',               icon: 'calendar.svg' },
        { divider: true },
        { id: 'admin-notify',   label: '変更通知設定',       icon: 'gear.svg' }
    ];

    // --- スケジュールメニュー項目 ---
    var scheduleItems = [
        { id: 'weekly-schedule',   label: '週間予定表',     icon: 'calendar.svg' },
        { id: 'leave-application', label: '休暇申請管理',   icon: 'clock.svg' }
    ];

    // --- HTML構築 ---
    function icon(name) {
        return '<img src="mockup/icons/' + name + '" class="md-nav-tab-icon" alt="">';
    }
    function menuItemIcon(name) {
        return '<img src="mockup/icons/' + name + '" class="md-nav-menu-item-icon" alt="">';
    }

    function buildMenuItems(items) {
        return items.map(function (item) {
            if (item.divider) return '<div class="md-nav-menu-divider"></div>';
            return '<button class="md-nav-menu-item" data-master="' + item.id + '">'
                + menuItemIcon(item.icon)
                + item.label
                + '</button>';
        }).join('');
    }

    // 変更通知ベル群（7ベル + 縦仕切り）
    function buildBellsHtml() {
        var s = '<div class="md-nav-cn-bells" id="mdNavCnBells">';
        var lastGroup = null;
        coNotifyBells.forEach(function (bell) {
            if (lastGroup !== null && bell.group !== lastGroup) {
                s += '<span class="md-nav-cn-bells-divider" aria-hidden="true"></span>';
            }
            lastGroup = bell.group;
            s += ''
                + '<div class="cn-anchor md-nav-cn-bell" data-bell="' + bell.id + '" id="mdNavCnBell-' + bell.id + '">'
                +   '<button type="button" class="cn-trigger md-nav-action-btn" title="' + bell.tooltip + '" aria-label="' + bell.tooltip + '">'
                +     '<img class="cn-bell-icon md-nav-cn-bell-icon" data-bell-icon="' + bell.id + '" src="" alt="">'
                +     '<span class="cn-trigger-badge" hidden>0</span>'
                +   '</button>'
                +   '<div class="cn-panel">'
                +     '<div class="cn-head">'
                +       '<span class="cn-title">' + bell.title + '</span>'
                +       '<button type="button" class="cn-mark-all">すべて既読</button>'
                +     '</div>'
                +     '<div class="cn-tabs">'
                +       '<button type="button" class="cn-tab is-active" data-tab="latest">最新</button>'
                +       '<button type="button" class="cn-tab" data-tab="history">履歴</button>'
                +     '</div>'
                +     '<div class="cn-tab-view is-active" data-tab="latest">'
                +       '<div class="cn-body cn-body--latest" data-bell-body="' + bell.id + '">'
                +         '<div class="cn-empty">新しい通知はありません</div>'
                +       '</div>'
                +     '</div>'
                +     '<div class="cn-tab-view" data-tab="history">'
                +       '<div class="cn-body cn-body--history">'
                +         '<div class="cn-empty">履歴はありません</div>'
                +       '</div>'
                +     '</div>'
                +   '</div>'
                + '</div>';
        });
        s += '</div>';
        return s;
    }

    var html = ''
        + '<nav class="md-nav-bar">'
        +   '<div class="md-nav-logo">受注管理</div>'
        // --- ページタブ ---
        +   '<a href="screen-layout.html" class="md-nav-tab' + (currentPage === 'screen-layout' ? ' md-nav-active' : '') + '">'
        +     icon('calendar.svg') + '業務管理計画書'
        +   '</a>'
        +   '<a href="order-book.html" class="md-nav-tab' + (currentPage === 'order-book' ? ' md-nav-active' : '') + '">'
        +     icon('chart.svg') + '受注簿'
        +   '</a>'
        // --- スケジュールドロップダウン ---
        +   '<div class="md-nav-dropdown" id="mdNavScheduleDD">'
        +     '<button class="md-nav-dropdown-btn' + ((currentPage === 'weekly-schedule' || currentPage === 'leave-application') ? ' md-nav-active' : '') + '" onclick="mdNavToggleDD(\'mdNavScheduleDD\')">'
        +       'スケジュール <span class="md-nav-dropdown-arrow">▼</span>'
        +     '</button>'
        +     '<div class="md-nav-dropdown-panel">'
        +       buildMenuItems(scheduleItems)
        +     '</div>'
        +   '</div>'
        +   '<div class="md-nav-sep"></div>'
        // --- マスタ管理ドロップダウン ---
        +   '<div class="md-nav-dropdown" id="mdNavMasterDD">'
        +     '<button class="md-nav-dropdown-btn" onclick="mdNavToggleDD(\'mdNavMasterDD\')">'
        +       'マスタ管理 <span class="md-nav-dropdown-arrow">▼</span>'
        +     '</button>'
        +     '<div class="md-nav-dropdown-panel">'
        +       buildMenuItems(masterItems)
        +     '</div>'
        +   '</div>'
        // --- GCフィルタボタン ---
        +   '<div class="md-nav-sep"></div>'
        +   '<button class="md-nav-gcf-btn" id="mdNavGcfBtn">'
        +     '<span id="mdNavGcfLabel">すべて</span>'
        +     '<span class="md-nav-gcf-arrow">▼</span>'
        +   '</button>'
        // --- スペーサー ---
        +   '<div class="md-nav-spacer"></div>'
        // --- モバイルタブ ---
        +   '<a href="quick-access.html" target="_blank" rel="noopener" class="md-nav-tab' + (currentPage === 'quick-access' ? ' md-nav-active' : '') + '">'
        +     icon('smartphone.svg') + 'モバイル'
        +   '</a>'
        // --- 右端アクション ---
        +   '<div class="md-nav-actions">'
        +     buildBellsHtml()
        +     '<button class="md-nav-action-btn" id="mdNavThemeBtn" title="テーマ切替">'
        +       '<img src="mockup/icons/moon.svg" class="md-nav-theme-icon-light" alt="Dark">'
        +       '<img src="mockup/icons/brush.svg" class="md-nav-theme-icon-dark" alt="Light">'
        +     '</button>'
        +   '</div>'
        + '</nav>';

    // --- モーダルオーバーレイ ---
    html += ''
        + '<div class="md-nav-modal-overlay" id="mdNavMasterModal">'
        +   '<div class="md-nav-modal">'
        +     '<div class="md-nav-modal-header">'
        +       '<span class="md-nav-modal-title" id="mdNavModalTitle">マスタ</span>'
        +       '<button class="md-nav-modal-close" onclick="mdNavCloseModal()">&times;</button>'
        +     '</div>'
        +     '<div class="md-nav-modal-body" id="mdNavModalBody">'
        +       '<div class="md-nav-modal-placeholder">'
        +         '<div class="md-nav-modal-placeholder-icon">&#128221;</div>'
        +         'マスタデータ編集画面（実装予定）'
        +       '</div>'
        +     '</div>'
        +   '</div>'
        + '</div>';

    // --- ベル単位デモ通知データ（Phase N-2.2 移行版）---
    //     ・旧 mdNavCnItems の3件を bell-master / bell-pending へ振り分け
    //     ・将来は各画面JS（OB/SL/WS/LA）が自領域発信ロジックで coNotifyPanel.setItems() を呼ぶ
    //     ・本フェーズではモック視認用にハードコード初期投入
    //     ・modify/auto/pending は expand + affects 付与でアコーディオン展開可
    var mdNavCnBellItems = {
        ob: [
            { scope: 'site', op: 'add',    main: '東央警備 / 渋谷駅前ビル の受注を追加', sub: '山田太郎 ・ 09:14', date: '今日 (5/15)',
              expand: '2026-05-18（月） / 警備員8名 / 単価¥18,000', affects: ['order-book', 'screen-layout', 'weekly-schedule'] },
            { scope: 'site', op: 'modify', main: '新宿三井ビル の受注日を変更',       sub: '山田太郎 ・ 10:42', date: '今日 (5/15)',
              expand: '受注日: 5/20 → 5/22', affects: ['order-book', 'screen-layout'] },
            { scope: 'site', op: 'delete', main: '池袋現場 の受注を取消',             sub: '佐藤次郎 ・ 16:08', date: '昨日 (5/14)',
              expand: '取消理由: 契約先キャンセル', affects: ['order-book', 'screen-layout'] }
        ],
        sl: [
            { scope: 'employee', op: 'place', main: '渋谷駅前ビル に他GC社員を配置（自動受注生成）',
              sub: '田中一郎(Nikkei) ・ 11:30', date: '今日 (5/15)',
              expand: 'グループ間応援を検出 → OB側に自動受注行を生成（編集ロック行）',
              affects: ['screen-layout', 'order-book'] },
            { scope: 'employee', op: 'place', main: '高田馬場ビル に社員 を新規配置',
              sub: '配置: 佐藤太郎 ・ 10:05', date: '今日 (5/15)', affects: ['screen-layout'] },
            { scope: 'vehicle', op: 'modify', main: '渋谷駅前ビル の車両配置を更新',
              sub: '車両 #002 ・ 13:22', date: '今日 (5/15)',
              expand: '配置車両を #001 → #002 へ変更', affects: ['screen-layout'] }
        ],
        ws: [
            { scope: 'schedule', op: 'modify', main: '5/16 (土) の予定を変更',
              sub: '田中一郎 ・ 09:42', date: '今日 (5/15)',
              expand: '時間帯: 9:00-17:00 → 10:00-18:00', affects: ['weekly-schedule'] }
        ],
        la: [
            { scope: 'application', op: 'add',     main: '清水 から新規申請', sub: '5/22 / 有給休暇 ・ 14:01', date: '今日 (5/15)',
              affects: ['leave-application', 'screen-layout'] },
            { scope: 'application', op: 'approve', main: '林 の休暇を承認',   sub: '5/18 / 有給 ・ 09:14',     date: '今日 (5/15)',
              expand: 'ステータス: 承認待ち → 承認済', affects: ['leave-application'] }
        ],
        pending: [
            { scope: 'application', op: 'add', main: 'DCP承認待ち: 1件',
              sub: '鈴木 一郎 / 2026-04-24 (金) 有給休暇 ・ 32分前',
              date: '今日 (5/15)', expand: '承認画面で処理してください', affects: ['leave-application'] }
        ],
        vehicle: [],
        master: [
            { type: 'modify', slot: 'type-master-modify', main: '社員マスタが更新されました',
              sub: '佐藤 太郎 さんの所属が変更 (部署A → 部署B) ・ 10分前', date: '今日 (5/15)',
              expand: '所属: 部署A → 部署B', affects: ['order-book', 'screen-layout'] },
            { type: 'add', slot: 'type-master-add', main: '現場マスタに新規現場が追加されました',
              sub: '〇〇ビル新築工事 (東央警備) ・ 2時間前', date: '今日 (5/15)',
              affects: ['order-book', 'screen-layout', 'weekly-schedule'] }
        ]
    };

    // 履歴タブ用デモ設定（軸別ピッカー込み）
    var mdNavCnBellHistory = {
        ob: {
            businessAxis: { tab: '契約先/現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { scope: 'site', op: 'add', main: '受注を追加', sub: '山田太郎 ・ 5/15 09:14',
                          affects: ['order-book', 'screen-layout', 'weekly-schedule'] },
                        { scope: 'site', op: 'modify', main: '受注日を変更', sub: '山田太郎 ・ 5/12 10:42',
                          expand: '受注日: 5/10 → 5/12', affects: ['order-book', 'screen-layout'] }
                    ]},
                    { title: '三菱地所 / 丸の内本社', items: [
                        { scope: 'site', op: 'add', main: '受注を追加', sub: '山田太郎 ・ 5/12 14:00',
                          affects: ['order-book', 'screen-layout'] }
                    ]},
                    { title: '東央警備 / 池袋現場', items: [
                        { scope: 'site', op: 'delete', main: '受注を取消', sub: '佐藤次郎 ・ 5/14 16:08',
                          affects: ['order-book', 'screen-layout'] }
                    ]}
                ],
                companies: ['東央警備', '三菱地所', 'Nikkei'],
                sites: { '東央警備': ['渋谷駅前ビル', '池袋現場', '新宿三井ビル'],
                         '三菱地所': ['丸の内本社', '大手町タワー'],
                         'Nikkei':   ['日本橋オフィス'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { scope: 'site', op: 'add', main: '東央警備 / 渋谷駅前ビル の受注を追加', sub: '5/15 09:14',
                          affects: ['order-book', 'screen-layout', 'weekly-schedule'] },
                        { scope: 'site', op: 'modify', main: '東央警備 / 渋谷駅前ビル の受注日を変更', sub: '5/12 10:42',
                          expand: '受注日: 5/10 → 5/12', affects: ['order-book', 'screen-layout'] }
                    ]},
                    { title: '佐藤次郎', items: [
                        { scope: 'site', op: 'delete', main: '東央警備 / 池袋現場 の受注を取消', sub: '5/14 16:08',
                          affects: ['order-book', 'screen-layout'] }
                    ]}
                ],
                accounts: ['山田太郎', '佐藤次郎', '鈴木花子']
            }
        },
        sl: {
            businessAxis: { tab: '現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { scope: 'employee', op: 'place', main: '他GC社員を配置（自動受注生成）',
                          sub: '田中一郎(Nikkei) ・ 5/15 11:30',
                          expand: 'グループ間応援を検出 → OB側に自動受注行を生成',
                          affects: ['screen-layout', 'order-book'] }
                    ]},
                    { title: '東央警備 / 高田馬場ビル', items: [
                        { scope: 'employee', op: 'place', main: '佐藤太郎 を配置', sub: '5/13',
                          affects: ['screen-layout'] }
                    ]}
                ],
                companies: ['東央警備'], sites: { '東央警備': ['渋谷駅前ビル', '高田馬場ビル'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { scope: 'employee', op: 'place', main: '渋谷駅前ビル に田中一郎を配置',
                          sub: '5/15 11:30',
                          expand: 'グループ間応援を検出 → OB側に自動受注行を生成',
                          affects: ['screen-layout', 'order-book'] }
                    ]}
                ],
                accounts: ['山田太郎', '佐藤次郎']
            }
        },
        ws: {
            businessAxis: { tab: '現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { scope: 'reservation', op: 'add', main: '5/16(土) に応援予約 Aチーム4名', sub: '田中一郎 ・ 5/13' }
                    ]}
                ],
                companies: ['東央警備'], sites: { '東央警備': ['渋谷駅前ビル'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '田中一郎', items: [
                        { scope: 'reservation', op: 'add', main: '渋谷駅前ビル 5/16 応援予約', sub: '5/13' }
                    ]}
                ],
                accounts: ['田中一郎']
            }
        },
        la: {
            businessAxis: { tab: '申請者', search: '申請者名で検索...', prefix: '申請者',
                groups: [
                    { title: '清水', items: [
                        { scope: 'application', op: 'add', main: '5/22 有給休暇 を申請', sub: '5/15 14:01',
                          affects: ['leave-application', 'screen-layout'] }
                    ]},
                    { title: '林', items: [
                        { scope: 'application', op: 'approve', main: '5/18 有給休暇 を承認', sub: '5/15 09:14',
                          expand: 'ステータス: 承認待ち → 承認済',
                          affects: ['leave-application', 'weekly-schedule'] }
                    ]},
                    { title: '山田', items: [
                        { scope: 'application', op: 'reject', main: '5/14 有給休暇 を却下', sub: '5/14 13:24',
                          affects: ['leave-application'] }
                    ]}
                ],
                companies: ['営業部', '工事部'],
                sites: { '営業部': ['清水', '山田'], '工事部': ['林'] }
            },
            accountAxis: { tab: '承認者', search: '承認者名で検索...', prefix: '承認者',
                groups: [
                    { title: '林部長', items: [
                        { scope: 'application', op: 'approve', main: '林 の5/18申請を承認', sub: '5/15 09:14',
                          expand: 'ステータス: 承認待ち → 承認済',
                          affects: ['leave-application', 'weekly-schedule'] },
                        { scope: 'application', op: 'reject',  main: '山田 の5/14申請を却下', sub: '5/14 13:24',
                          affects: ['leave-application'] }
                    ]}
                ],
                accounts: ['林部長']
            }
        },
        pending: {
            businessAxis: { tab: '申請者', search: '申請者名で検索...', prefix: '申請者',
                groups: [
                    { title: '清水', items: [
                        { scope: 'application', op: 'add', main: '5/22 有給休暇 承認待ち', sub: '5/15 14:01',
                          expand: '承認画面で処理してください',
                          affects: ['leave-application'] }
                    ]}
                ],
                companies: ['営業部'], sites: { '営業部': ['清水'] }
            },
            accountAxis: { tab: '承認者', search: '承認者名で検索...', prefix: '承認者',
                groups: [
                    { title: '林部長', items: [
                        { scope: 'application', op: 'add', main: '清水 の5/22申請が承認待ち', sub: '5/15 14:01',
                          expand: '承認画面で処理してください',
                          affects: ['leave-application'] }
                    ]}
                ],
                accounts: ['林部長']
            }
        },
        vehicle: {
            businessAxis: { tab: '車両', search: '車両名で検索...', prefix: '車両',
                groups: [
                    { title: '車両 #001 トヨタハイエース', items: [
                        { scope: 'vehicle', op: 'modify', main: '5/16 の運行予定を変更', sub: '5/14 山田太郎',
                          expand: '出発時刻: 9:00 → 10:30',
                          affects: ['screen-layout', 'weekly-schedule'] }
                    ]}
                ],
                companies: ['東央警備'], sites: { '東央警備': ['車両 #001', '車両 #002'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { scope: 'vehicle', op: 'modify', main: '車両 #001 の運行予定を変更', sub: '5/14',
                          expand: '出発時刻: 9:00 → 10:30',
                          affects: ['screen-layout', 'weekly-schedule'] }
                    ]}
                ],
                accounts: ['山田太郎']
            }
        },
        master: {
            businessAxis: { tab: 'マスタ種別', search: 'マスタ種別で検索...', prefix: '種別',
                groups: [
                    { title: '現場マスタ', items: [
                        { type: 'add', slot: 'type-master-add', main: '〇〇ビル新築工事 (東央警備) を追加', sub: '管理者 ・ 5/15',
                          affects: ['order-book', 'screen-layout', 'weekly-schedule'] }
                    ]},
                    { title: '社員マスタ', items: [
                        { type: 'modify', slot: 'type-master-modify', main: '佐藤 太郎 さんの所属を変更（部署A → 部署B）',
                          sub: '管理者 ・ 5/14',
                          expand: '所属: 部署A → 部署B',
                          affects: ['order-book', 'screen-layout'] }
                    ]}
                ],
                companies: ['マスタ'], sites: { 'マスタ': ['現場', '社員', '車両', '契約先'] }
            },
            accountAxis: { tab: '管理者', search: '管理者名で検索...', prefix: '管理者',
                groups: [
                    { title: '管理者', items: [
                        { type: 'add', slot: 'type-master-add', main: '現場マスタに〇〇ビルを追加', sub: '5/15',
                          affects: ['order-book', 'screen-layout', 'weekly-schedule'] },
                        { type: 'modify', slot: 'type-master-modify', main: '社員マスタで佐藤太郎の所属を変更', sub: '5/14',
                          expand: '所属: 部署A → 部署B',
                          affects: ['order-book', 'screen-layout'] }
                    ]}
                ],
                accounts: ['管理者']
            }
        }
    };

    // --- GCフィルタモーダル ---
    html += ''
        + '<div class="md-nav-gcf-overlay" id="mdNavGcfModal">'
        +   '<div class="md-nav-gcf-modal">'
        +     '<div class="md-nav-gcf-header">'
        +       '<h3>表示グループ会社</h3>'
        +       '<button class="md-nav-gcf-close" id="mdNavGcfClose">&times;</button>'
        +     '</div>'
        +     '<div class="md-nav-gcf-body">'
        +       '<p class="md-nav-gcf-hint">チェックを入れた会社のデータが表示されます</p>'
        +       '<div class="md-nav-gcf-checks" id="mdNavGcfChecks"></div>'
        +     '</div>'
        +     '<div class="md-nav-gcf-footer">'
        +       '<button class="md-nav-gcf-btn-cancel" id="mdNavGcfCancel">キャンセル</button>'
        +       '<button class="md-nav-gcf-btn-apply" id="mdNavGcfApply">適用</button>'
        +     '</div>'
        +   '</div>'
        + '</div>';

    // --- DOM挿入 ---
    var container = document.createElement('div');
    container.innerHTML = html;
    while (container.firstChild) {
        document.body.insertBefore(container.firstChild, document.body.firstChild);
    }

    // --- ドロップダウン開閉 ---
    window.mdNavToggleDD = function (id) {
        var el = document.getElementById(id);
        var isOpen = el.classList.contains('md-nav-open');
        // 全て閉じる
        document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
            d.classList.remove('md-nav-open');
        });
        if (!isOpen) el.classList.add('md-nav-open');
    };

    // 外部クリックで閉じる
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.md-nav-dropdown')) {
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
        }
    });

    // --- マスタメニュー項目クリック → モーダル表示 ---
    var masterLabels = {};
    masterItems.concat(scheduleItems).forEach(function (item) {
        if (!item.divider) masterLabels[item.id] = item.label;
    });

    // ページ遷移するメニュー項目
    var pageLinks = {
        'weekly-schedule':   'weekly-schedule.html',
        'leave-application': 'leave-application.html',
        'admin-notify':      'admin-notify.html'
    };

    document.querySelectorAll('.md-nav-menu-item[data-master]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = this.getAttribute('data-master');
            // ドロップダウンを閉じる
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
            // ページ遷移 or モーダル
            if (pageLinks[id]) {
                location.href = pageLinks[id];
            } else {
                mdNavOpenModal(id, masterLabels[id] || 'マスタ');
            }
        });
    });

    // --- モーダル ---
    window.mdNavOpenModal = function (id, title) {
        var overlay = document.getElementById('mdNavMasterModal');
        document.getElementById('mdNavModalTitle').textContent = title;
        document.getElementById('mdNavModalBody').innerHTML =
            '<div class="md-nav-modal-placeholder">'
            + '<div class="md-nav-modal-placeholder-icon">&#128221;</div>'
            + title + ' 編集画面（実装予定）'
            + '</div>';
        overlay.classList.add('md-nav-modal-open');
    };

    window.mdNavCloseModal = function () {
        document.getElementById('mdNavMasterModal').classList.remove('md-nav-modal-open');
    };

    // オーバーレイクリックで閉じる
    document.getElementById('mdNavMasterModal').addEventListener('click', function (e) {
        if (e.target === this) mdNavCloseModal();
    });

    // ESCで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            mdNavCloseModal();
            mdNavCnCloseModal();
            gcfCloseModal();
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
        }
    });

    // --- ベル群の初期化 (アイコン適用 / デモ通知投入 / 履歴タブ構築 / バッジ更新) ---
    //     開閉・タブ切替等のパネル挙動は co-notify-panel.js が処理する。
    (function initNotifyBells() {
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.setItems !== 'function') return;
        coNotifyBells.forEach(function (bell) {
            window.coNotifyPanel.applyBellIcon(bell.id);
            window.coNotifyPanel.setItems(bell.id, mdNavCnBellItems[bell.id] || []);
            if (typeof window.coNotifyPanel.setHistory === 'function') {
                window.coNotifyPanel.setHistory(bell.id, mdNavCnBellHistory[bell.id] || null);
            }
        });
    })();

    // window.mdNavCnCloseModal: ESC ハンドラから呼ばれる後方互換シム
    window.mdNavCnCloseModal = function () {
        if (window.coNotifyPanel) window.coNotifyPanel.close();
    };

    // --- GCフィルタ共通ロジック ---
    // groupCompaniesData / orgUnitsData は demo-data.js で定義（co-navbar.jsより先に読み込まれる前提）
    var gcfAllCodes = (typeof groupCompaniesData !== 'undefined')
        ? groupCompaniesData.map(function (gc) { return gc.code; })
        : ['touo', 'nikkei', 'zennihon'];
    var gcfAllData = (typeof groupCompaniesData !== 'undefined')
        ? groupCompaniesData
        : [
            { code: 'touo', name: '東央警備', shortName: '東央' },
            { code: 'nikkei', name: 'Nikkeiホールディングス', shortName: 'Nikkei' },
            { code: 'zennihon', name: '全日本エンタープライズ', shortName: 'AJE' }
        ];
    var gcfOrgUnits = (typeof orgUnitsData !== 'undefined') ? orgUnitsData : {};

    // --- ツリーユーティリティ ---
    // 会社配下の全ノードIDを収集
    function gcfCollectAllIds(gcCode) {
        var ids = [];
        function walk(nodes) {
            if (!nodes) return;
            nodes.forEach(function (n) { ids.push(n.id); if (n.children) walk(n.children); });
        }
        walk(gcfOrgUnits[gcCode] || []);
        return ids;
    }
    // ノードIDからどの会社に属するか判定
    function gcfFindCompany(unitId) {
        for (var i = 0; i < gcfAllCodes.length; i++) {
            if (gcfCollectAllIds(gcfAllCodes[i]).indexOf(unitId) >= 0) return gcfAllCodes[i];
        }
        return null;
    }

    // --- localStorage から復元 ---
    // フィルタ配列: 会社コード（全選択）+ 組織ノードID（部分選択）の混在
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem('gcFilter')); } catch (e) {}
    if (!Array.isArray(stored) || stored.length === 0) {
        // デフォルト: 全社全ノード選択
        stored = gcfAllCodes.slice();
    }
    // 不正値除去（有効な会社コード or 組織ノードIDのみ）
    var allValidIds = gcfAllCodes.slice();
    gcfAllCodes.forEach(function (gc) { allValidIds = allValidIds.concat(gcfCollectAllIds(gc)); });
    stored = stored.filter(function (id) { return allValidIds.indexOf(id) >= 0; });
    if (stored.length === 0) stored = gcfAllCodes.slice();

    // グローバルに公開
    window.mdNavGcFilter = stored;

    // --- 後方互換ヘルパー: 会社が1つでも選択されているか ---
    window.mdNavGcIsCompanyVisible = function (gcCode) {
        if (window.mdNavGcFilter.indexOf(gcCode) >= 0) return true;
        var unitIds = gcfCollectAllIds(gcCode);
        for (var i = 0; i < unitIds.length; i++) {
            if (window.mdNavGcFilter.indexOf(unitIds[i]) >= 0) return true;
        }
        return false;
    };

    // --- 組織ノードが選択されているか（祖先チェック含む） ---
    window.mdNavGcIsUnitVisible = function (unitId) {
        if (!unitId) return true; // 未指定は常に表示
        // 直接選択されている
        if (window.mdNavGcFilter.indexOf(unitId) >= 0) return true;
        // 所属会社が全選択されている
        var gcCode = gcfFindCompany(unitId);
        if (gcCode && window.mdNavGcFilter.indexOf(gcCode) >= 0) return true;
        // 祖先ノードが選択されている
        function findAncestors(nodes, targetId, path) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === targetId) return path;
                if (nodes[i].children) {
                    var r = findAncestors(nodes[i].children, targetId, path.concat([nodes[i].id]));
                    if (r) return r;
                }
            }
            return null;
        }
        if (gcCode) {
            var ancestors = findAncestors(gcfOrgUnits[gcCode] || [], unitId, []);
            if (ancestors) {
                for (var i = 0; i < ancestors.length; i++) {
                    if (window.mdNavGcFilter.indexOf(ancestors[i]) >= 0) return true;
                }
            }
        }
        return false;
    };

    // --- ラベル生成 ---
    function gcfGetLabel() {
        // 全社全選択チェック
        var allSelected = gcfAllCodes.every(function (gc) {
            return window.mdNavGcFilter.indexOf(gc) >= 0;
        });
        if (allSelected) return 'すべて';

        var parts = [];
        gcfAllData.forEach(function (gc) {
            if (window.mdNavGcFilter.indexOf(gc.code) >= 0) {
                parts.push(gc.shortName);
            } else if (window.mdNavGcIsCompanyVisible(gc.code)) {
                parts.push(gc.shortName + '(一部)');
            }
        });
        return parts.length > 0 ? parts.join(' + ') : 'なし';
    }

    function gcfUpdateLabel() {
        var label = document.getElementById('mdNavGcfLabel');
        if (label) label.textContent = gcfGetLabel();
    }

    // --- ツリーチェックボックスUI生成 ---
    function gcfBuildTree(container, nodes, gcCode, indent) {
        nodes.forEach(function (node) {
            var hasChildren = node.children && node.children.length > 0;
            var row = document.createElement('div');
            row.className = 'md-nav-gcf-tree-row';
            row.style.paddingLeft = (indent * 20) + 'px';

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = node.id;
            cb.dataset.gc = gcCode;
            cb.dataset.gcfNode = '1';
            cb.addEventListener('change', function () { gcfSyncTree(gcCode); });
            row.appendChild(cb);

            var lbl = document.createElement('span');
            lbl.className = 'md-nav-gcf-tree-label';
            lbl.textContent = node.name;
            row.appendChild(lbl);

            container.appendChild(row);
            if (hasChildren) gcfBuildTree(container, node.children, gcCode, indent + 1);
        });
    }

    // ツリーチェック状態を復元
    function gcfRestoreChecks() {
        var filter = window.mdNavGcFilter;
        gcfAllData.forEach(function (gc) {
            var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gc.code + '"]');
            if (!companyCb) return;
            var isAll = filter.indexOf(gc.code) >= 0;
            var unitIds = gcfCollectAllIds(gc.code);
            if (isAll) {
                companyCb.checked = true;
                companyCb.indeterminate = false;
                // 子もすべてON
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb) cb.checked = true;
                });
            } else {
                // 部分選択チェック
                var checkedCount = 0;
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb) {
                        // 自身が選択 or 祖先が選択されているかチェック
                        cb.checked = filter.indexOf(uid) >= 0;
                        if (cb.checked) checkedCount++;
                    }
                });
                // 祖先選択 → 子孫も全ON
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (!cb || cb.checked) return;
                    // 祖先がフィルタに含まれるかチェック
                    var ggc = gc.code;
                    function findAncInFilter(nodes, targetId, path) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].id === targetId) {
                                for (var j = 0; j < path.length; j++) {
                                    if (filter.indexOf(path[j]) >= 0) return true;
                                }
                                return false;
                            }
                            if (nodes[i].children) {
                                var r = findAncInFilter(nodes[i].children, targetId, path.concat([nodes[i].id]));
                                if (r !== undefined) return r;
                            }
                        }
                    }
                    if (findAncInFilter(gcfOrgUnits[ggc] || [], uid, [])) {
                        cb.checked = true;
                        checkedCount++;
                    }
                });
                companyCb.checked = checkedCount > 0 && checkedCount === unitIds.length;
                companyCb.indeterminate = checkedCount > 0 && checkedCount < unitIds.length;
            }
        });
    }

    // 会社チェック変更 → 子すべてON/OFF
    function gcfToggleCompany(gcCode, checked) {
        var unitIds = gcfCollectAllIds(gcCode);
        unitIds.forEach(function (uid) {
            var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
            if (cb) cb.checked = checked;
        });
    }

    // 子ノード変更 → 親のindeterminate/checked同期
    function gcfSyncTree(gcCode) {
        var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gcCode + '"]');
        if (!companyCb) return;
        var unitIds = gcfCollectAllIds(gcCode);
        var total = unitIds.length;
        var checkedCount = 0;
        unitIds.forEach(function (uid) {
            var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
            if (cb && cb.checked) checkedCount++;
        });
        // 中間ノードの同期（子が全チェック → 親もチェック）
        function syncNode(nodes) {
            nodes.forEach(function (n) {
                if (n.children && n.children.length > 0) {
                    syncNode(n.children);
                    var nodeCb = document.querySelector('#mdNavGcfChecks input[value="' + n.id + '"]');
                    if (!nodeCb) return;
                    var childTotal = 0, childChecked = 0;
                    n.children.forEach(function (c) {
                        childTotal++;
                        var ccb = document.querySelector('#mdNavGcfChecks input[value="' + c.id + '"]');
                        if (ccb && ccb.checked) childChecked++;
                    });
                    // 子がすべてチェック → 親もチェック、一部 → indeterminate
                    if (childChecked === childTotal) {
                        nodeCb.checked = true; nodeCb.indeterminate = false;
                    } else if (childChecked > 0) {
                        nodeCb.checked = false; nodeCb.indeterminate = true;
                    }
                }
            });
        }
        syncNode(gcfOrgUnits[gcCode] || []);
        companyCb.checked = checkedCount === total;
        companyCb.indeterminate = checkedCount > 0 && checkedCount < total;
    }

    function gcfOpenModal() {
        var checksEl = document.getElementById('mdNavGcfChecks');
        checksEl.innerHTML = '';
        gcfAllData.forEach(function (gc) {
            // 会社ヘッダ行
            var companyRow = document.createElement('div');
            companyRow.className = 'md-nav-gcf-company-row';
            var companyCb = document.createElement('input');
            companyCb.type = 'checkbox';
            companyCb.value = gc.code;
            companyCb.dataset.gcfCompany = '1';
            companyCb.addEventListener('change', function () {
                gcfToggleCompany(gc.code, this.checked);
                if (!this.checked) this.indeterminate = false;
            });
            companyRow.appendChild(companyCb);
            var swatch = document.createElement('span');
            swatch.className = 'md-nav-gcf-swatch';
            swatch.style.background = 'var(--md-gc-bg-' + gc.code + ')';
            companyRow.appendChild(swatch);
            var nameSpan = document.createElement('span');
            nameSpan.className = 'md-nav-gcf-company-name';
            nameSpan.textContent = gc.name;
            companyRow.appendChild(nameSpan);
            checksEl.appendChild(companyRow);

            // 組織ツリー
            var units = gcfOrgUnits[gc.code] || [];
            if (units.length > 0) {
                var treeWrap = document.createElement('div');
                treeWrap.className = 'md-nav-gcf-tree';
                gcfBuildTree(treeWrap, units, gc.code, 1);
                checksEl.appendChild(treeWrap);
            }
        });
        gcfRestoreChecks();
        document.getElementById('mdNavGcfModal').classList.add('active');
    }

    function gcfCloseModal() {
        document.getElementById('mdNavGcfModal').classList.remove('active');
    }

    function gcfApply() {
        // チェック状態からフィルタ配列を構築
        var selected = [];
        gcfAllData.forEach(function (gc) {
            var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gc.code + '"]');
            if (!companyCb) return;
            if (companyCb.checked && !companyCb.indeterminate) {
                // 全選択 → 会社コードのみ
                selected.push(gc.code);
            } else {
                // 部分選択 → 個別ノードID
                var unitIds = gcfCollectAllIds(gc.code);
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb && cb.checked) selected.push(uid);
                });
            }
        });
        if (selected.length === 0) {
            alert('少なくとも1つの会社または組織を選択してください。');
            return;
        }
        window.mdNavGcFilter = selected;
        localStorage.setItem('gcFilter', JSON.stringify(selected));
        gcfUpdateLabel();
        gcfCloseModal();
        document.dispatchEvent(new CustomEvent('gcFilterChanged', { detail: { selected: selected } }));
    }

    // グローバル公開
    window.mdNavGcFilterOpen = gcfOpenModal;

    // イベントバインド
    document.getElementById('mdNavGcfBtn').addEventListener('click', gcfOpenModal);
    document.getElementById('mdNavGcfClose').addEventListener('click', gcfCloseModal);
    document.getElementById('mdNavGcfCancel').addEventListener('click', gcfCloseModal);
    document.getElementById('mdNavGcfApply').addEventListener('click', gcfApply);
    document.getElementById('mdNavGcfModal').addEventListener('click', function (e) {
        if (e.target === this) gcfCloseModal();
    });

    // 初期ラベル設定
    gcfUpdateLabel();

    // --- テーマ切替ボタン ---
    document.getElementById('mdNavThemeBtn').addEventListener('click', function () {
        if (typeof toggleTheme === 'function') {
            toggleTheme();
        } else {
            // order-book用フォールバック（別方式の場合）
            var htmlEl = document.documentElement;
            var isDark = htmlEl.getAttribute('data-theme') === 'dark';
            var newTheme = isDark ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_v2', newTheme);
        }
    });

})();
