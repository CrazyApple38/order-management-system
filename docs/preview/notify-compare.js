/* notify-compare.js — Before/After モード切替 + 統合案アコーディオン挙動 */
(function () {
    'use strict';

    /* Before / After / 履歴 / アイコン選定 / ベル並び / パネルレイアウト / 自動生成行オーバーレイ / N-2統合 / マトリクス選定 モード切替 */
    var modeTargets = {
        before: 'cmpBefore',
        after: 'cmpAfter',
        history: 'cmpHistory',
        icons: 'cmpIcons',
        'bell-order': 'cmpBellOrder',
        'panel-layout': 'cmpPanelLayout',
        'auto-overlay': 'cmpAutoOverlay',
        'n2-integration': 'cmpN2Integration',
        matrix: 'cmpMatrix'
    };
    document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.dataset.mode;
            document.querySelectorAll('.cmp-mode-btn').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });
            Object.keys(modeTargets).forEach(function (key) {
                var el = document.getElementById(modeTargets[key]);
                if (el) el.classList.toggle('cmp-hidden', key !== mode);
            });
        });
    });

    /* 履歴ツールバー: 種別チップの選択切替 (デモ動作) */
    document.addEventListener('click', function (e) {
        var chip = e.target.closest('.cn-filter-chip');
        if (!chip) return;
        var group = chip.parentElement;
        if (!group) return;
        group.querySelectorAll('.cn-filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c === chip);
        });
    });

    /* グループヘッダーのアコーディオン
       - 履歴タブ: 軸グループ (契約先/現場名 や 操作者 単位)
       - 統合案 after: 日付グループ (今日/昨日 等) */
    document.addEventListener('click', function (e) {
        var head = e.target.closest('.cn-axis-group-head, .cn-date-group-head');
        if (!head) return;
        var group = head.closest('.cn-axis-group, .cn-date-group');
        if (!group) return;
        var willCollapse = !group.classList.contains('is-collapsed');
        group.classList.toggle('is-collapsed', willCollapse);
        head.setAttribute('aria-expanded', String(!willCollapse));
        var toggle = head.querySelector('.cn-axis-group-toggle, .cn-date-group-toggle');
        if (toggle) toggle.textContent = willCollapse ? '▾' : '▴';
    });

    /* 履歴タブ 縦型タブ切替: 軸 (現場/業務 ↔ アカウント) */
    document.addEventListener('click', function (e) {
        var tab = e.target.closest('.cn-side-tab');
        if (!tab) return;
        var view = tab.dataset.view;
        var layout = tab.closest('.cn-history-layout');
        if (!layout || !view) return;
        layout.querySelectorAll('.cn-side-tab').forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
        });
        layout.querySelectorAll('.cn-history-view').forEach(function (v) {
            v.classList.toggle('is-active', v.dataset.view === view);
        });
    });

    /* 共通: ジャンプ動作デモ (アラート + 親アイテムを既読化) */
    function jumpToCell(item) {
        if (!item) return;
        var nameEl = item.querySelector('.cn-text-main');
        var name = nameEl ? nameEl.textContent.trim().replace(/\s+/g, ' ') : '';
        alert('ジャンプ動作デモ:\n「' + name + '」の対象セルへスクロール+フラッシュ表示します\n(本番では各画面のグリッド該当セルに飛びます)');
        item.classList.remove('is-unread');
    }

    /* 統合案アイテム: 行クリック
       - cn-expand を持つアイテム → アコーディオン展開（種別問わず）
       - type-add / type-delete (cn-expand 無し) → 直接ジャンプ
       - type-modify (cn-expand 無し) → アコーディオン開閉（差分なし） */
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        // ジャンプボタンクリックは別ハンドラへ
        if (e.target.closest('.cn-jump-btn')) return;
        if (e.target.closest('.cn-cross-jump-btn')) return;
        var item = row.parentElement;
        var hasExpand = !!item.querySelector(':scope > .cn-expand');

        // cn-expand 無し かつ 追加/削除 → 直接ジャンプ
        if (!hasExpand && (item.classList.contains('type-add') || item.classList.contains('type-delete'))) {
            jumpToCell(item);
            return;
        }

        // アコーディオン展開
        var willOpen = !item.classList.contains('is-expanded');
        item.classList.toggle('is-expanded', willOpen);
        if (willOpen) {
            item.classList.remove('is-unread');
            // クロス画面ヒント描画（N-2モード用）
            renderCrossHintsIn(item);
            // パネルの未読バッジを再計算
            updateBellBadgeFromPanel(item.closest('.cmp-n2-panel'));
        }
        var chev = row.querySelector('.cn-chevron');
        if (chev) chev.textContent = willOpen ? '▴' : '▾';
    });

    /* ジャンプボタン: アコーディオン内ボタン経由のジャンプ */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        jumpToCell(btn.closest('.cn-item'));
    });

    /* 「すべて既読」ボタン */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-mark-all');
        if (!btn) return;
        var panel = btn.closest('.cn-panel');
        if (!panel) return;
        panel.querySelectorAll('.cn-item.is-unread').forEach(function (item) {
            item.classList.remove('is-unread');
        });
    });

    /* パンくずを基本状態 (ベース > ステップ1ラベル) に書き戻す */
    function renderCrumbsInitial(pickView) {
        var crumbs = pickView.querySelector('.cn-pick-crumbs');
        if (!crumbs) return;
        var base = pickView.dataset.crumbBase || '';
        var step1Label = pickView.dataset.step1Label || '選択';
        crumbs.innerHTML =
            '<span>' + base + '</span>' +
            '<span class="cn-pick-crumb-sep">&gt;</span>' +
            '<span class="cn-pick-crumb-current">' + step1Label + '</span>';
    }

    /* 「一覧」ボタン: 選択画面を開く / × クリックで選択解除 */
    document.addEventListener('click', function (e) {
        // × クリック (選択解除) — ボタン本体への伝播は止める
        var clear = e.target.closest('.cn-list-pick-clear');
        if (clear) {
            e.stopPropagation();
            var btn = clear.closest('.cn-list-pick-btn');
            if (btn) {
                btn.classList.remove('is-selected');
                var label = btn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = '一覧';
            }
            return;
        }
        // ボタン本体クリック (選択画面を開く)
        var pickBtn = e.target.closest('.cn-list-pick-btn');
        if (!pickBtn) return;
        var view = pickBtn.closest('.cn-history-view');
        if (!view) return;
        var pickView = view.querySelector('.cn-pick-view');
        if (!pickView) return;
        // ステップ1にリセット
        pickView.querySelectorAll('.cn-pick-step').forEach(function (s, i) {
            s.classList.toggle('is-active', i === 0);
        });
        renderCrumbsInitial(pickView);
        view.classList.add('is-picking');
    });

    /* バッジクリック: ステップ進行 (company → site) or 選択確定 (site / account) */
    document.addEventListener('click', function (e) {
        var badge = e.target.closest('.cn-pick-badge');
        if (!badge) return;
        var step = badge.closest('.cn-pick-step');
        if (!step || !step.classList.contains('is-active')) return;
        var pickView = step.closest('.cn-pick-view');
        var view = pickView.closest('.cn-history-view');
        var stepName = step.dataset.step;
        if (stepName === 'company') {
            // ステップ2 (現場) へ進む
            var company = badge.dataset.company;
            var step2 = pickView.querySelector('.cn-pick-step[data-step="site"]');
            if (!step2) return;
            step2.querySelectorAll('.cn-pick-badges').forEach(function (g) {
                g.hidden = (g.dataset.company !== company);
            });
            step.classList.remove('is-active');
            step2.classList.add('is-active');
            // パンくず: ベース > 契約先名 > 現場を選択
            var crumbs = pickView.querySelector('.cn-pick-crumbs');
            var base = pickView.dataset.crumbBase || '';
            crumbs.innerHTML =
                '<span>' + base + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span>' + company + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span class="cn-pick-crumb-current">現場を選択</span>';
        } else {
            // 選択確定 (現場 or アカウント)
            var listBtn = view.querySelector('.cn-list-pick-btn');
            if (listBtn) {
                var prefix = listBtn.dataset.prefix || '';
                var label = listBtn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = prefix + ': ' + badge.textContent.trim();
                listBtn.classList.add('is-selected');
            }
            view.classList.remove('is-picking');
        }
    });

    /* 戻るボタン: ステップ2 → ステップ1, ステップ1 / アカウント → リストビューへ */
    document.addEventListener('click', function (e) {
        var back = e.target.closest('.cn-pick-back');
        if (!back) return;
        var pickView = back.closest('.cn-pick-view');
        var view = back.closest('.cn-history-view');
        if (!pickView || !view) return;
        var step2 = pickView.querySelector('.cn-pick-step[data-step="site"]');
        if (step2 && step2.classList.contains('is-active')) {
            step2.classList.remove('is-active');
            var step1 = pickView.querySelector('.cn-pick-step[data-step="company"]');
            if (step1) step1.classList.add('is-active');
            renderCrumbsInitial(pickView);
        } else {
            view.classList.remove('is-picking');
        }
    });

    /* ============================================================
       N-2 統合プレビュー: ベル → 専用パネル切替 + クロス画面ヒント
       ============================================================ */
    var pageLabels = {
        'order-book': 'OB（受注簿）',
        'screen-layout': 'SL（業務管理計画書）',
        'weekly-schedule': 'WS（週間予定表）',
        'leave-application': 'LA（休暇申請）',
        'master': 'マスタ管理'
    };

    /* ベルクリック → 該当パネル表示 */
    document.addEventListener('click', function (e) {
        var bellBar = document.getElementById('cmpN2BellBar');
        if (!bellBar) return;
        var bell = e.target.closest('.cmp-bell-item');
        if (!bell || !bellBar.contains(bell)) return;
        var key = bell.dataset.bell;
        if (!key) return;
        // ベル選択状態を切替
        bellBar.querySelectorAll('.cmp-bell-item').forEach(function (b) {
            b.classList.toggle('is-active', b === bell);
        });
        // パネル表示切替
        var section = bell.closest('.cmp-card-body');
        if (!section) return;
        section.querySelectorAll('.cmp-n2-panel').forEach(function (p) {
            p.classList.toggle('is-active', p.dataset.panel === key);
        });
    });

    /* タブ切替（最新 / 履歴） */
    document.addEventListener('click', function (e) {
        var tab = e.target.closest('.cn-tab');
        if (!tab) return;
        var panel = tab.closest('.cmp-n2-panel');
        if (!panel) return;
        var name = tab.dataset.tab;
        panel.querySelectorAll('.cn-tab').forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
        });
        panel.querySelectorAll('.cn-tab-view').forEach(function (v) {
            v.classList.toggle('is-active', v.dataset.tab === name);
        });
    });

    /* すべて既読 → 対応ベルのバッジを 0 化 */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-mark-all');
        if (!btn) return;
        var panel = btn.closest('.cmp-n2-panel');
        if (!panel) return;
        updateBellBadgeFromPanel(panel);
    });

    /* パネル内のN-2展開アイテム.cn-cross-hintをcurrentPage基準で再描画 */
    function renderCrossHintsIn(item) {
        if (!item) return;
        var hintEl = item.querySelector(':scope > .cn-expand > .cn-cross-hint');
        if (!hintEl) return;
        var affects = (hintEl.dataset.affects || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (affects.length === 0) {
            hintEl.innerHTML = '';
            return;
        }
        var currentSel = document.getElementById('cmpN2CurrentPage');
        var current = currentSel ? currentSel.value : '';
        var html = '';
        if (affects.indexOf(current) >= 0) {
            html += '<span class="cn-cross-hint-in-context">現在画面（' + (pageLabels[current] || current) + '）で対象セルがフラッシュされます</span>';
        } else {
            html += '<span class="cn-cross-hint-out">現在画面（' + (pageLabels[current] || current) + '）には波及しません</span>';
        }
        var others = affects.filter(function (a) { return a !== current; });
        if (others.length > 0) {
            html += '<span class="cn-cross-jumps">';
            others.forEach(function (a) {
                html += '<button type="button" class="cn-cross-jump-btn" data-target="' + a + '">' + (pageLabels[a] || a) + ' で開く ↗</button>';
            });
            html += '</span>';
        }
        hintEl.innerHTML = html;
    }

    /* 現在画面切替 → 展開中の全アイテムのヒントを再描画 */
    document.addEventListener('change', function (e) {
        if (e.target && e.target.id === 'cmpN2CurrentPage') {
            document.querySelectorAll('.cmp-n2-panel .cn-item.is-expanded').forEach(renderCrossHintsIn);
        }
    });

    /* 「他画面で開く ↗」ボタン → デモ動作（新タブ想定のアラート） */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-cross-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        var target = btn.dataset.target || '';
        alert('クロス画面ジャンプ デモ:\n' + (pageLabels[target] || target) + ' を新タブで開き、target axis でフラッシュ起動します。\n（本番ロジックは Phase N-5 で実装）');
    });

    /* ベルバッジを未読アイテム数で更新 */
    function updateBellBadgeFromPanel(panel) {
        if (!panel) return;
        var key = panel.dataset.panel;
        var unread = panel.querySelectorAll('.cn-item.is-unread').length;
        var badge = document.querySelector('.cmp-bell-badge[data-bell-badge="' + key + '"]');
        if (!badge) return;
        if (unread > 0) {
            badge.textContent = String(unread);
            badge.hidden = false;
        } else {
            badge.textContent = '0';
            badge.hidden = true;
        }
    }

    /* ============================================================
       N-2 アイコン適用: notify-icons-selected.json 相当のマッピングを
       インラインで持ち、.cn-icon 内に <img> を注入する
       ============================================================ */
    var CN_ICON_BASE = '../assets/icons/';
    var CN_ICON_MAP = {
        ob: {
            add: 'business/im-12032-shimpuru-na-shomei-keiyaku.svg',
            modify: 'business/si-45842-document-teishutsu.png',
            delete: 'sign-mark/im-11911-hosoi-batsu.svg'
        },
        sl: {
            add: 'sign-mark/im-15804-riroudo.svg',
            modify: 'sign-mark/im-15804-riroudo.svg',
            delete: 'sign-mark/im-15804-riroudo.svg',
            auto: 'sign-mark/im-15804-riroudo.svg'
        },
        ws: {
            add: 'business/si-28916-time-schedule.png',
            modify: 'business/si-28916-time-schedule.png',
            delete: 'business/si-28916-time-schedule.png',
            'leave-reflect': 'sign-mark/si-39968-heart-pen.png'
        },
        la: {
            add: 'business/si-28306-icon-questionnaire.png',
            new: 'business/si-28306-icon-questionnaire.png',
            modify: 'sign-mark/im-11453-chekku-bokkusu.svg',
            approve: 'sign-mark/im-11453-chekku-bokkusu.svg',
            reject: 'sign-mark/im-11911-hosoi-batsu.svg',
            delete: 'sign-mark/im-11911-hosoi-batsu.svg'
        },
        pending: {
            pending: 'business/si-28916-time-schedule.png',
            wait: 'business/si-28916-time-schedule.png',
            add: 'business/si-28916-time-schedule.png',
            modify: 'business/si-28916-time-schedule.png'
        },
        vehicle: {
            add: 'business/im-12032-shimpuru-na-shomei-keiyaku.svg',
            modify: 'business/si-45842-document-teishutsu.png',
            delete: 'sign-mark/im-11911-hosoi-batsu.svg'
        },
        master: {
            add: 'business/im-12032-shimpuru-na-shomei-keiyaku.svg',
            modify: 'business/si-45842-document-teishutsu.png',
            delete: 'sign-mark/im-11911-hosoi-batsu.svg'
        }
    };

    function getPanelKey(el) {
        var panel = el.closest && el.closest('.cmp-n2-panel');
        return panel ? panel.dataset.panel : null;
    }
    function getItemType(item) {
        if (item.dataset.itype) return item.dataset.itype;
        if (item.classList.contains('type-add')) return 'add';
        if (item.classList.contains('type-modify')) return 'modify';
        if (item.classList.contains('type-delete')) return 'delete';
        if (item.classList.contains('type-pending')) return 'pending';
        return 'modify';
    }
    function applyIconToCnIcon(iconEl) {
        var panelKey = getPanelKey(iconEl);
        if (!panelKey) return;
        var item = iconEl.closest('.cn-item');
        if (!item) return;
        var type = getItemType(item);
        var map = CN_ICON_MAP[panelKey] || {};
        var path = map[type] || map.modify || map.add;
        if (!path) return;
        iconEl.innerHTML = '<img class="cn-icon-img" src="' + CN_ICON_BASE + path + '" alt="">';
    }
    function applyAllIconsInN2() {
        document.querySelectorAll('.cmp-n2-panel .cn-icon').forEach(applyIconToCnIcon);
    }

    /* ============================================================
       N-2 履歴タブ拡張: 縦タブ + 軸別ピッカー を全パネルで構築
       ============================================================ */
    var CN_HISTORY_CONFIG = {
        ob: {
            businessAxis: { tab: '契約先/現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { type: 'add', main: '受注を追加', sub: '山田太郎 ・ 5/15 09:14' },
                        { type: 'modify', main: '受注日を変更', sub: '山田太郎 ・ 5/12 10:42' }
                    ]},
                    { title: '三菱地所 / 丸の内本社', items: [
                        { type: 'add', main: '受注を追加', sub: '山田太郎 ・ 5/12 14:00' }
                    ]},
                    { title: '東央警備 / 池袋現場', items: [
                        { type: 'delete', main: '受注を取消', sub: '佐藤次郎 ・ 5/14 16:08' }
                    ]}
                ],
                companies: ['東央警備', '三菱地所', 'Nikkei'],
                sites: {
                    '東央警備': ['渋谷駅前ビル', '池袋現場', '新宿三井ビル'],
                    '三菱地所': ['丸の内本社', '大手町タワー'],
                    'Nikkei': ['日本橋オフィス']
                }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { type: 'add', main: '東央警備 / 渋谷駅前ビル の受注を追加', sub: '5/15 09:14' },
                        { type: 'modify', main: '東央警備 / 渋谷駅前ビル の受注日を変更', sub: '5/12 10:42' }
                    ]},
                    { title: '佐藤次郎', items: [
                        { type: 'delete', main: '東央警備 / 池袋現場 の受注を取消', sub: '5/14 16:08' }
                    ]}
                ],
                accounts: ['山田太郎', '佐藤次郎', '鈴木花子']
            }
        },
        sl: {
            businessAxis: { tab: '現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { type: 'modify', main: '他GC社員を配置（自動受注生成）', sub: '田中一郎(Nikkei) ・ 5/15 11:30' }
                    ]},
                    { title: '東央警備 / 高田馬場ビル', items: [
                        { type: 'add', main: '佐藤太郎 を配置', sub: '5/13' }
                    ]}
                ],
                companies: ['東央警備'],
                sites: { '東央警備': ['渋谷駅前ビル', '高田馬場ビル'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { type: 'modify', main: '渋谷駅前ビル に田中一郎を配置', sub: '5/15 11:30' }
                    ]}
                ],
                accounts: ['山田太郎', '佐藤次郎']
            }
        },
        ws: {
            businessAxis: { tab: '現場', search: '現場名で検索...', prefix: '現場',
                groups: [
                    { title: '東央警備 / 渋谷駅前ビル', items: [
                        { type: 'add', main: '5/16(土) に応援予約 Aチーム4名', sub: '田中一郎 ・ 5/13' }
                    ]}
                ],
                companies: ['東央警備'], sites: { '東央警備': ['渋谷駅前ビル'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '田中一郎', items: [
                        { type: 'add', main: '渋谷駅前ビル 5/16 応援予約', sub: '5/13' }
                    ]}
                ],
                accounts: ['田中一郎']
            }
        },
        la: {
            businessAxis: { tab: '申請者', search: '申請者名で検索...', prefix: '申請者',
                groups: [
                    { title: '清水', items: [
                        { type: 'new', main: '5/22 有給休暇 を申請', sub: '5/15 14:01' }
                    ]},
                    { title: '林', items: [
                        { type: 'approve', main: '5/18 有給休暇 を承認', sub: '5/15 09:14' }
                    ]},
                    { title: '山田', items: [
                        { type: 'reject', main: '5/14 有給休暇 を却下', sub: '5/14 13:24' }
                    ]}
                ],
                companies: ['営業部', '工事部'],
                sites: { '営業部': ['清水', '山田'], '工事部': ['林'] }
            },
            accountAxis: { tab: '承認者', search: '承認者名で検索...', prefix: '承認者',
                groups: [
                    { title: '林部長', items: [
                        { type: 'approve', main: '林 の5/18申請を承認', sub: '5/15 09:14' },
                        { type: 'reject', main: '山田 の5/14申請を却下', sub: '5/14 13:24' }
                    ]}
                ],
                accounts: ['林部長']
            }
        },
        pending: {
            businessAxis: { tab: '申請者', search: '申請者名で検索...', prefix: '申請者',
                groups: [
                    { title: '清水', items: [
                        { type: 'pending', main: '5/22 有給休暇 承認待ち', sub: '5/15 14:01' }
                    ]}
                ],
                companies: ['営業部'], sites: { '営業部': ['清水'] }
            },
            accountAxis: { tab: '承認者', search: '承認者名で検索...', prefix: '承認者',
                groups: [
                    { title: '林部長', items: [
                        { type: 'pending', main: '清水 の5/22申請が承認待ち', sub: '5/15 14:01' }
                    ]}
                ],
                accounts: ['林部長']
            }
        },
        vehicle: {
            businessAxis: { tab: '車両', search: '車両名で検索...', prefix: '車両',
                groups: [
                    { title: '車両 #001 トヨタハイエース', items: [
                        { type: 'modify', main: '5/16 の運行予定を変更', sub: '5/14 山田太郎' }
                    ]}
                ],
                companies: ['東央警備'], sites: { '東央警備': ['車両 #001', '車両 #002'] }
            },
            accountAxis: { tab: 'アカウント', search: 'アカウント名で検索...', prefix: 'アカウント',
                groups: [
                    { title: '山田太郎', items: [
                        { type: 'modify', main: '車両 #001 の運行予定を変更', sub: '5/14' }
                    ]}
                ],
                accounts: ['山田太郎']
            }
        },
        master: {
            businessAxis: { tab: 'マスタ種別', search: 'マスタ種別で検索...', prefix: '種別',
                groups: [
                    { title: '現場マスタ', items: [
                        { type: 'add', main: '〇〇ビル新築工事 (東央警備) を追加', sub: '管理者 ・ 5/15' }
                    ]},
                    { title: '社員マスタ', items: [
                        { type: 'modify', main: '佐藤 太郎 さんの所属を変更（部署A → 部署B）', sub: '管理者 ・ 5/14' }
                    ]}
                ],
                companies: ['マスタ'], sites: { 'マスタ': ['現場', '社員', '車両', '契約先'] }
            },
            accountAxis: { tab: '管理者', search: '管理者名で検索...', prefix: '管理者',
                groups: [
                    { title: '管理者', items: [
                        { type: 'add', main: '現場マスタに〇〇ビルを追加', sub: '5/15' },
                        { type: 'modify', main: '社員マスタで佐藤太郎の所属を変更', sub: '5/14' }
                    ]}
                ],
                accounts: ['管理者']
            }
        }
    };

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function buildAxisGroupsHtml(axisCfg) {
        return axisCfg.groups.map(function (g) {
            var items = g.items.map(function (it) {
                var typeClass = 'type-' + (it.type === 'new' ? 'add' : (it.type === 'approve' ? 'modify' : (it.type === 'reject' ? 'delete' : (it.type === 'pending' ? 'modify' : it.type))));
                return ''
                    + '<div class="cn-item is-read ' + typeClass + '" data-itype="' + escapeHtml(it.type) + '" data-type="' + escapeHtml(it.type) + '">'
                    +   '<div class="cn-item-row">'
                    +     '<div class="cn-icon ' + typeClass + '"></div>'
                    +     '<div class="cn-text">'
                    +       '<div class="cn-text-main">' + escapeHtml(it.main) + '</div>'
                    +       '<div class="cn-text-sub">' + escapeHtml(it.sub) + '</div>'
                    +     '</div>'
                    +   '</div>'
                    + '</div>';
            }).join('');
            return ''
                + '<div class="cn-axis-group">'
                +   '<button class="cn-axis-group-head" type="button" aria-expanded="true">' + escapeHtml(g.title)
                +     '<span class="cn-axis-group-toggle" aria-hidden="true">▴</span>'
                +   '</button>'
                +   items
                + '</div>';
        }).join('');
    }

    function buildPickViewHtml(axisCfg, kind) {
        // kind: 'business' (company → site) or 'account' (single step)
        if (kind === 'account') {
            var accountBadges = (axisCfg.accounts || []).map(function (a) {
                return '<button class="cn-pick-badge">' + escapeHtml(a) + '</button>';
            }).join('');
            return ''
                + '<div class="cn-pick-view" data-crumb-base="' + escapeHtml(axisCfg.prefix) + '" data-step1-label="' + escapeHtml(axisCfg.prefix) + 'を選択">'
                +   '<div class="cn-pick-head">'
                +     '<button class="cn-pick-back" aria-label="戻る">←</button>'
                +     '<div class="cn-pick-crumbs"></div>'
                +   '</div>'
                +   '<div class="cn-pick-step is-active" data-step="account">'
                +     '<div class="cn-pick-badges">' + accountBadges + '</div>'
                +   '</div>'
                + '</div>';
        }
        // business: 契約先 → 現場
        var companyBadges = (axisCfg.companies || []).map(function (c) {
            return '<button class="cn-pick-badge" data-company="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
        }).join('');
        var siteGroups = Object.keys(axisCfg.sites || {}).map(function (c) {
            var siteBadges = (axisCfg.sites[c] || []).map(function (s) {
                return '<button class="cn-pick-badge">' + escapeHtml(s) + '</button>';
            }).join('');
            return '<div class="cn-pick-badges" data-company="' + escapeHtml(c) + '" hidden>' + siteBadges + '</div>';
        }).join('');
        return ''
            + '<div class="cn-pick-view" data-crumb-base="' + escapeHtml(axisCfg.prefix) + '" data-step1-label="契約先を選択">'
            +   '<div class="cn-pick-head">'
            +     '<button class="cn-pick-back" aria-label="戻る">←</button>'
            +     '<div class="cn-pick-crumbs"></div>'
            +   '</div>'
            +   '<div class="cn-pick-step is-active" data-step="company">'
            +     '<div class="cn-pick-badges">' + companyBadges + '</div>'
            +   '</div>'
            +   '<div class="cn-pick-step" data-step="site">'
            +     siteGroups
            +   '</div>'
            + '</div>';
    }

    function buildHistoryViewHtml(axisCfg, viewKey, kind) {
        return ''
            + '<div class="cn-history-view' + (viewKey === 'business' ? ' is-active' : '') + '" data-view="' + viewKey + '">'
            +   '<div class="cn-history-toolbar">'
            +     '<div class="cn-search-row">'
            +       '<div class="cn-search">'
            +         '<input type="text" placeholder="' + escapeHtml(axisCfg.search) + '" aria-label="' + escapeHtml(axisCfg.search) + '">'
            +       '</div>'
            +       '<button class="cn-list-pick-btn" data-prefix="' + escapeHtml(axisCfg.prefix) + '">'
            +         '<span class="cn-list-pick-label">一覧</span>'
            +         '<span class="cn-list-pick-clear" aria-label="選択解除">×</span>'
            +       '</button>'
            +     '</div>'
            +     '<div class="cn-filter-chips">'
            +       '<button class="cn-filter-chip is-active" data-filter="all">すべて</button>'
            +       '<button class="cn-filter-chip" data-filter="add">追加</button>'
            +       '<button class="cn-filter-chip" data-filter="modify">変更</button>'
            +       '<button class="cn-filter-chip" data-filter="delete">削除</button>'
            +     '</div>'
            +   '</div>'
            +   '<div class="cn-body cn-body--history">' + buildAxisGroupsHtml(axisCfg) + '</div>'
            +   buildPickViewHtml(axisCfg, kind)
            + '</div>';
    }

    function buildHistoryLayoutHtml(cfg) {
        return ''
            + '<div class="cn-history-layout">'
            +   '<div class="cn-side-tabs">'
            +     '<button class="cn-side-tab is-active" data-view="business">' + escapeHtml(cfg.businessAxis.tab) + '</button>'
            +     '<button class="cn-side-tab" data-view="account">' + escapeHtml(cfg.accountAxis.tab) + '</button>'
            +   '</div>'
            +   '<div class="cn-history-main">'
            +     buildHistoryViewHtml(cfg.businessAxis, 'business', 'business')
            +     buildHistoryViewHtml(cfg.accountAxis, 'account', 'account')
            +   '</div>'
            + '</div>';
    }

    function renderAllHistoryTabs() {
        Object.keys(CN_HISTORY_CONFIG).forEach(function (panelKey) {
            var panel = document.querySelector('.cmp-n2-panel[data-panel="' + panelKey + '"]');
            if (!panel) return;
            var historyView = panel.querySelector('.cn-tab-view[data-tab="history"]');
            if (!historyView) return;
            historyView.innerHTML = buildHistoryLayoutHtml(CN_HISTORY_CONFIG[panelKey]);
        });
    }

    /* ============================================================
       N-2 アイコン編集モード
       - 既存「アイコン選定」モードと localStorage キーを共有
         (STORAGE_KEY = 'notifyIconSelections.v1')
       - トグルON 中はベル・.cn-icon クリックで IconPicker 起動
       - 選択結果は notifyIconSelections.v1 に保存され、両モードに反映
       ============================================================ */
    var ICON_STORAGE_KEY = 'notifyIconSelections.v1';
    var ICON_BASE_PATH = '../assets/icons/';

    function readSelections() {
        try { return JSON.parse(localStorage.getItem(ICON_STORAGE_KEY) || '{}'); }
        catch (e) { return {}; }
    }
    function writeSelection(slotId, file) {
        var sel = readSelections();
        if (file) sel[slotId] = file;
        else delete sel[slotId];
        try { localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(sel)); }
        catch (e) {}
    }
    function getBellSlotKey(bellEl) {
        return 'bell-' + bellEl.dataset.bell;
    }
    function getItemSlotKey(item) {
        if (!item) return null;
        // data-slot が明示されていれば最優先（共通タイプ type-employee 等を扱う）
        if (item.dataset.slot) return item.dataset.slot;
        var panelKey = getPanelKey(item);
        if (!panelKey) return null;
        var type = getItemType(item);
        return 'type-' + panelKey + '-' + type;
    }

    /* notify-icons-selected.json (2026-05-16 確定) 相当の全スロット既定アイコン */
    var SLOT_DEFAULT = {
        // ベル7個
        'bell-ob':       'business/si-46623-personal-information.png',
        'bell-sl':       'person/si-13707-13707.png',
        'bell-ws':       'stationery/im-12555-karendaa.svg',
        'bell-la':       'sign-mark/si-8681-8681.png',
        'bell-pending':  'life/si-9922-9922.png',
        'bell-vehicle':  'transport/im-10867-jidou-sha.svg',
        'bell-master':   'sign-mark/im-00001-muryou-no-settei-haguruma.svg',
        // 共通タイプ4個
        'type-employee':    'person/im-15537-jimbutsu.svg',
        'type-vehicle':     'transport/im-10852-jouyousha.svg',
        'type-support':     'person/im-12114-sns-jimbutsu.svg',
        'type-reservation': 'person/si-13722-13722.png',
        // OB
        'type-ob-add':    'business/im-12034-keiyaku-sho.svg',
        'type-ob-modify': 'education/si-14519-14519.png',
        'type-ob-delete': 'sign-mark/im-11911-hosoi-batsu.svg',
        // SL
        'type-sl-auto':   'sign-mark/im-15851-kyouyuu.svg',
        // WS
        'type-ws-schedule-change': 'stationery/si-48956-calendar.png',
        'type-ws-leave-reflect':   'sign-mark/si-25968-mark-repeat.png',
        // LA
        'type-la-new':     'business/si-45841-document-teishutsu.png',
        'type-la-approve': 'sign-mark/im-11453-chekku-bokkusu.svg',
        'type-la-reject':  'sign-mark/im-11911-hosoi-batsu.svg',
        // 承認待ち
        'type-pending-wait': 'life/si-9922-9922.png',
        // 車両
        'type-vehicle-add':    'person/si-13878-13878.png',
        'type-vehicle-modify': 'stationery/im-10177-supana.svg',
        'type-vehicle-delete': 'sign-mark/im-11911-hosoi-batsu.svg',
        // マスタ
        'type-master-add':    'business/im-12034-keiyaku-sho.svg',
        'type-master-modify': 'education/si-14519-14519.png',
        'type-master-delete': 'sign-mark/im-11911-hosoi-batsu.svg'
    };

    /* 既存 applyIconToCnIcon を上書き: localStorage の選択を最優先 → SLOT_DEFAULT → CN_ICON_MAP */
    var _origApplyIconToCnIcon = applyIconToCnIcon;
    applyIconToCnIcon = function (iconEl) {
        var item = iconEl.closest('.cn-item');
        if (!item) return _origApplyIconToCnIcon(iconEl);
        var sel = readSelections();
        var slotKey = getItemSlotKey(item);
        var path = slotKey ? (sel[slotKey] || SLOT_DEFAULT[slotKey]) : null;
        if (path) {
            iconEl.innerHTML = '<img class="cn-icon-img" src="' + ICON_BASE_PATH + path + '" alt="">';
            return;
        }
        _origApplyIconToCnIcon(iconEl);
    };

    /* ベルアイコン: localStorage 上書き → SLOT_DEFAULT → HTML既定値の順で適用 */
    function applyAllBellIcons() {
        var sel = readSelections();
        document.querySelectorAll('#cmpN2BellBar .cmp-bell-item').forEach(function (bell) {
            var slotKey = getBellSlotKey(bell);
            var path = sel[slotKey] || SLOT_DEFAULT[slotKey];
            if (!path) return;
            var img = bell.querySelector('.cmp-bell-icon');
            if (!img) return;
            img.src = ICON_BASE_PATH + path;
        });
    }

    /* 編集モードトグル */
    function setEditingMode(on) {
        var card = document.querySelector('.cmp-card--n2');
        if (!card) return;
        card.classList.toggle('is-icon-editing', on);
        var btn = document.getElementById('cmpN2EditToggle');
        if (btn) {
            btn.setAttribute('aria-pressed', String(on));
            var label = btn.querySelector('.cmp-n2-edit-toggle-label');
            if (label) label.textContent = on ? 'アイコン編集 ON' : 'アイコン編集 OFF';
        }
    }
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('#cmpN2EditToggle');
        if (!btn) return;
        var now = btn.getAttribute('aria-pressed') === 'true';
        setEditingMode(!now);
    });

    /* 編集モード中の捕捉: ベル / .cn-icon クリックを横取りして IconPicker を開く */
    function openPickerForSlot(slotKey, titleSuffix) {
        if (!window.IconPicker) {
            alert('IconPicker が読み込まれていません。');
            return;
        }
        window.IconPicker.open({
            title: 'アイコンを選択（' + titleSuffix + '）',
            accept: ['svg', 'png'],
            basePath: ICON_BASE_PATH,
            onPick: function (file) {
                writeSelection(slotKey, file);
                applyAllBellIcons();
                applyAllIconsInN2();
            }
        });
    }
    document.addEventListener('click', function (e) {
        var card = document.querySelector('.cmp-card--n2');
        if (!card || !card.classList.contains('is-icon-editing')) return;
        // 編集モード中 → ベル or .cn-icon のクリックを IconPicker に振り替え
        var bell = e.target.closest('.cmp-bell-item');
        var icon = e.target.closest('.cmp-n2-panel .cn-icon');
        if (!bell && !icon) return;
        e.stopPropagation();
        e.preventDefault();
        if (bell) {
            openPickerForSlot(getBellSlotKey(bell), 'ベル: ' + (bell.getAttribute('aria-label') || bell.dataset.bell));
        } else if (icon) {
            var item = icon.closest('.cn-item');
            var slotKey = getItemSlotKey(item);
            if (!slotKey) return;
            openPickerForSlot(slotKey, 'アイテム: ' + slotKey);
        }
    }, true); // capture-phase: 既存ハンドラより先に発火

    /* 起動時: 全パネルのバッジを初期計算 + アイコン適用 + 履歴タブ構築 */
    document.addEventListener('DOMContentLoaded', function () {
        renderAllHistoryTabs();
        applyAllIconsInN2();
        applyAllBellIcons();
        document.querySelectorAll('.cmp-n2-panel').forEach(updateBellBadgeFromPanel);
    });

    /* ============================================================
       マトリクス選定モード (N-2.4)
       - scope × op の 2軸でアイコン合成
       - localStorage:
           notifyPrimitives.v1   = { "scope": {key: file}, "op": {key: file} }
           notifyTypeOverrides.v1 = { "{scopeKey}-{opKey}": file }
       - 既存 notifyIconSelections.v1 とは独立
       ============================================================ */

    /* 軸定義（2026-05-19 確定: cell+site → 受注(site) 統合 / op の clear 廃止）
       - OB は scope=row/site/badge × op=add/modify/delete の3軸2op に集約
       - SL は配置系の place/remove を保持（社員/車両/応援を現場に張る/外す） */
    var MTX_SCOPES = [
        { key: 'row',         label: '行',       sub: 'row (OB) シート1行' },
        { key: 'site',        label: '受注',     sub: 'site (OB) セル内の受注エントリ' },
        { key: 'badge',       label: 'バッジ',   sub: 'badge (OB)' },
        { key: 'employee',    label: '社員',     sub: 'employee (SL)' },
        { key: 'vehicle',     label: '車両',     sub: 'vehicle (SL)' },
        { key: 'support',     label: '応援',     sub: 'support (SL/WS)' },
        { key: 'reservation', label: '応援予約', sub: 'reservation (SL/WS)' },
        { key: 'schedule',    label: '週間予定', sub: 'schedule (WS)' },
        { key: 'leave-badge', label: '休バッジ', sub: 'leave-badge (WS)' },
        { key: 'application', label: '申請',     sub: 'application (LA)' }
    ];
    var MTX_OPS = [
        { key: 'add',     label: '追加',   sub: 'add' },
        { key: 'modify',  label: '編集',   sub: 'modify' },
        { key: 'delete',  label: '削除',   sub: 'delete' },
        { key: 'approve', label: '承認',   sub: 'approve (LA)' },
        { key: 'reject',  label: '却下',   sub: 'reject (LA)' },
        { key: 'place',   label: '配置',   sub: 'place (SL)' },
        { key: 'remove',  label: '解除',   sub: 'remove (SL)' }
    ];

    /* applicableMatrix: scope ごとに有効な op の集合（「—」判定に対応） */
    var MTX_APPLICABLE = {
        'row':         ['add', 'modify', 'delete'],
        'site':        ['add', 'modify', 'delete'],
        'badge':       ['add', 'delete'],
        'employee':    ['modify', 'place', 'remove'],
        'vehicle':     ['modify', 'place', 'remove'],
        'support':     ['modify', 'place', 'remove'],
        'reservation': ['add', 'modify', 'delete'],
        'schedule':    ['modify'],
        'leave-badge': ['modify'],
        'application': ['add', 'approve', 'reject']
    };

    /* プリミティブのデフォルトアイコン（notify-icons-selected.json の流用 / プロトタイプ準拠） */
    var MTX_PRIMITIVE_DEFAULT = {
        scope: {
            'row':         'business/im-12034-keiyaku-sho.svg',
            'site':        'stationery/im-12555-karendaa.svg',
            'badge':       'sign-mark/im-10058-okiniiri-osusume-ni-tsukaeru-hoshi-aikon.svg',
            'employee':    'person/im-15537-jimbutsu.svg',
            'vehicle':     'transport/im-10852-jouyousha.svg',
            'support':     'person/im-12114-sns-jimbutsu.svg',
            'reservation': 'person/si-13722-13722.png',
            'schedule':    'stationery/si-48956-calendar.png',
            'leave-badge': 'sign-mark/si-25968-mark-repeat.png',
            'application': 'business/si-45841-document-teishutsu.png'
        },
        op: {
            'add':     'sign-mark/im-00105-purasu.svg',
            'modify':  'education/si-14519-14519.png',
            'delete':  'sign-mark/im-11911-hosoi-batsu.svg',
            'approve': 'sign-mark/im-11451-chekku-maaku-no-muryou.svg',
            'reject':  'sign-mark/im-11911-hosoi-batsu.svg',
            'place':   'sign-mark/im-15851-kyouyuu.svg',
            'remove':  'sign-mark/im-11911-hosoi-batsu.svg'
        }
    };

    /* サンプル通知アイテム（マトリクスのアイコンを使って render） */
    var MTX_SAMPLE_ITEMS = [
        { scope: 'row',   op: 'add',    main: '東央警備 / 渋谷駅前ビル を行として追加', sub: '田中 太郎 ・ 5/18 09:14', unread: true },
        { scope: 'site',  op: 'add',    main: 'Nikkei / 大手町オフィス の 15日 に受注を追加 (2名)', sub: '佐藤 花子 ・ 5/18 10:30', unread: true },
        { scope: 'site',  op: 'modify', main: 'Nikkei / 大手町オフィス の 15日 の開始時間を変更', sub: '山田 次郎 ・ 5/18 11:42', unread: true },
        { scope: 'site',  op: 'delete', main: '全日本警備 / 新宿駅前 の 20日 の受注を削除', sub: '高橋 五郎 ・ 5/17 17:45', unread: false },
        { scope: 'row',   op: 'modify', main: '東央警備 / 渋谷駅前ビル の業務名を変更', sub: '伊藤 ・ 5/17 14:30', unread: false },
        { scope: 'badge', op: 'add',    main: 'セル編集で「巡回業務」バッジを追加', sub: '鈴木 ・ 5/17 13:20', unread: false }
    ];

    var MTX_PRIMITIVES_KEY = 'notifyPrimitives.v1';
    var MTX_OVERRIDES_KEY = 'notifyTypeOverrides.v1';
    var MTX_ICON_BASE = '../assets/icons/';
    var MTX_MIGRATION_KEY = 'notifyMatrix.migrated.cellToSite';

    /* 2026-05-19 マイグレーション: scope.cell → scope.site / cell-* override → site-*
       cell 削除と clear op 廃止に伴う既存選定の保護。一度だけ実行。
       op の対応関係: place→add, clear→delete, modify→modify (cell の op を site の op に変換) */
    var MTX_CELL_OP_TO_SITE_OP = { 'place': 'add', 'modify': 'modify', 'clear': 'delete' };
    function mtxMigrateCellToSite() {
        try {
            if (localStorage.getItem(MTX_MIGRATION_KEY) === '1') return;
            // primitives: scope.cell があり scope.site が未設定なら昇格 / op.clear 削除
            var rawP = JSON.parse(localStorage.getItem(MTX_PRIMITIVES_KEY) || '{}');
            var p = { scope: rawP.scope || {}, op: rawP.op || {} };
            if (p.scope.cell && !p.scope.site) p.scope.site = p.scope.cell;
            delete p.scope.cell;
            delete p.op.clear;
            localStorage.setItem(MTX_PRIMITIVES_KEY, JSON.stringify(p));
            // overrides: cell-{op} → site-{op'} (op' は MTX_CELL_OP_TO_SITE_OP 変換)
            //   既存 site-{op'} が未設定の場合のみ昇格。それ以外の不明な op は破棄
            var o = JSON.parse(localStorage.getItem(MTX_OVERRIDES_KEY) || '{}');
            Object.keys(o).slice().forEach(function (k) {
                if (k.indexOf('cell-') === 0) {
                    var oldOp = k.slice(5);
                    var newOp = MTX_CELL_OP_TO_SITE_OP[oldOp];
                    if (newOp) {
                        var siteKey = 'site-' + newOp;
                        if (!o[siteKey]) o[siteKey] = o[k];
                    }
                    delete o[k];
                }
            });
            // 残った *-clear override も削除（applicableMatrix から外れる）
            Object.keys(o).slice().forEach(function (k) {
                if (k.indexOf('-clear') === k.length - 6) delete o[k];
            });
            localStorage.setItem(MTX_OVERRIDES_KEY, JSON.stringify(o));
            localStorage.setItem(MTX_MIGRATION_KEY, '1');
        } catch (e) { /* localStorage 不可なら無視 */ }
    }
    mtxMigrateCellToSite();

    function mtxReadPrimitives() {
        try {
            var raw = JSON.parse(localStorage.getItem(MTX_PRIMITIVES_KEY) || '{}');
            return { scope: raw.scope || {}, op: raw.op || {} };
        } catch (e) { return { scope: {}, op: {} }; }
    }
    function mtxWritePrimitive(axis, key, file) {
        var p = mtxReadPrimitives();
        if (file) p[axis][key] = file;
        else delete p[axis][key];
        try { localStorage.setItem(MTX_PRIMITIVES_KEY, JSON.stringify(p)); } catch (e) {}
    }
    function mtxReadOverrides() {
        try { return JSON.parse(localStorage.getItem(MTX_OVERRIDES_KEY) || '{}'); }
        catch (e) { return {}; }
    }
    function mtxWriteOverride(typeKey, file) {
        var o = mtxReadOverrides();
        if (file) o[typeKey] = file;
        else delete o[typeKey];
        try { localStorage.setItem(MTX_OVERRIDES_KEY, JSON.stringify(o)); } catch (e) {}
    }

    function mtxGetPrimitiveIcon(axis, key) {
        var p = mtxReadPrimitives();
        return p[axis][key] || MTX_PRIMITIVE_DEFAULT[axis][key] || null;
    }
    function mtxIsPrimitiveCustom(axis, key) {
        var p = mtxReadPrimitives();
        return !!p[axis][key];
    }
    function mtxGetTypeKey(scopeKey, opKey) {
        return scopeKey + '-' + opKey;
    }
    function mtxIsApplicable(scopeKey, opKey) {
        var ops = MTX_APPLICABLE[scopeKey] || [];
        return ops.indexOf(opKey) >= 0;
    }

    /* セルの表示 HTML を生成（override 優先 → 合成 → なし）*/
    function mtxBuildCellIconHtml(scopeKey, opKey) {
        var typeKey = mtxGetTypeKey(scopeKey, opKey);
        var overrides = mtxReadOverrides();
        if (overrides[typeKey]) {
            return '<img class="cmp-mtx-single-icon" src="' + MTX_ICON_BASE + overrides[typeKey] + '" alt="">';
        }
        var base = mtxGetPrimitiveIcon('scope', scopeKey);
        var op = mtxGetPrimitiveIcon('op', opKey);
        if (!base && !op) return '';
        return '<span class="cmp-mtx-composed">'
            + (base ? '<img class="cmp-mtx-icon-base" src="' + MTX_ICON_BASE + base + '" alt="">' : '')
            + (op ? '<img class="cmp-mtx-icon-op" src="' + MTX_ICON_BASE + op + '" alt="">' : '')
            + '</span>';
    }

    function mtxRenderPrimitiveTiles(axis, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var list = axis === 'scope' ? MTX_SCOPES : MTX_OPS;
        container.innerHTML = list.map(function (item) {
            var iconPath = mtxGetPrimitiveIcon(axis, item.key);
            var customCls = mtxIsPrimitiveCustom(axis, item.key) ? ' is-custom' : '';
            return '<div class="cmp-mtx-primitive-tile' + customCls + '"'
                + ' data-axis="' + axis + '"'
                + ' data-key="' + item.key + '"'
                + ' title="' + item.label + ' (' + item.sub + ')">'
                + (iconPath ? '<img src="' + MTX_ICON_BASE + iconPath + '" alt="">' : '<span style="width:28px;height:28px;background:#EEE;display:block;border-radius:4px"></span>')
                + '<div class="cmp-mtx-tile-label">' + item.label + '</div>'
                + '<div class="cmp-mtx-tile-sub">' + item.sub + '</div>'
                + '</div>';
        }).join('');
    }

    function mtxRenderMatrix() {
        var table = document.getElementById('cmpMtxMatrix');
        if (!table) return;
        var overrides = mtxReadOverrides();
        var html = '<thead><tr><th></th>';
        MTX_OPS.forEach(function (op) { html += '<th>' + op.label + '</th>'; });
        html += '</tr></thead><tbody>';
        MTX_SCOPES.forEach(function (sc) {
            html += '<tr><th class="cmp-mtx-th-row">' + sc.label + '</th>';
            MTX_OPS.forEach(function (op) {
                if (!mtxIsApplicable(sc.key, op.key)) {
                    html += '<td class="cmp-mtx-cell is-na"></td>';
                    return;
                }
                var typeKey = mtxGetTypeKey(sc.key, op.key);
                var isOverride = !!overrides[typeKey];
                html += '<td class="cmp-mtx-cell' + (isOverride ? ' is-override' : '') + '"'
                    + ' data-scope="' + sc.key + '"'
                    + ' data-op="' + op.key + '"'
                    + ' title="' + sc.label + ' × ' + op.label + ' (' + typeKey + ')">'
                    + mtxBuildCellIconHtml(sc.key, op.key)
                    + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody>';
        table.innerHTML = html;
    }

    function mtxRenderSampleItems() {
        var container = document.getElementById('cmpMtxSampleItems');
        if (!container) return;
        container.innerHTML = MTX_SAMPLE_ITEMS.map(function (it) {
            var typeKey = mtxGetTypeKey(it.scope, it.op);
            return '<div class="cmp-mtx-sample-item' + (it.unread ? ' is-unread' : '') + '">'
                + '<div class="cmp-mtx-sample-item-icon" data-op="' + it.op + '">' + mtxBuildCellIconHtml(it.scope, it.op) + '</div>'
                + '<div class="cmp-mtx-sample-item-text">'
                +     '<div class="cmp-mtx-sample-item-main">' + escapeHtmlMtx(it.main) + '</div>'
                +     '<div class="cmp-mtx-sample-item-sub">' + escapeHtmlMtx(it.sub) + ' <span style="color:#999">(' + typeKey + ')</span></div>'
                + '</div>'
                + '</div>';
        }).join('');
    }

    function escapeHtmlMtx(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function mtxRefreshAll() {
        mtxRenderPrimitiveTiles('scope', 'cmpMtxScopeTiles');
        mtxRenderPrimitiveTiles('op', 'cmpMtxOpTiles');
        mtxRenderMatrix();
        mtxRenderSampleItems();
    }

    function mtxOpenPicker(title, onPick) {
        if (!window.IconPicker) { alert('IconPicker が読み込まれていません。'); return; }
        window.IconPicker.open({
            title: title,
            accept: ['svg', 'png'],
            basePath: MTX_ICON_BASE,
            onPick: onPick
        });
    }

    /* プリミティブタイルクリック → IconPicker */
    document.addEventListener('click', function (e) {
        var tile = e.target.closest('.cmp-mtx-primitive-tile');
        if (!tile) return;
        var axis = tile.dataset.axis;
        var key = tile.dataset.key;
        var label = tile.querySelector('.cmp-mtx-tile-label');
        var title = 'プリミティブ ' + (axis === 'scope' ? 'scope' : 'op') + ': ' + (label ? label.textContent : key);
        mtxOpenPicker(title, function (file) {
            mtxWritePrimitive(axis, key, file);
            mtxRefreshAll();
            mtxSetStatus('プリミティブ ' + axis + '.' + key + ' を更新しました');
        });
    });

    /* マトリクスセルクリック → ポップオーバー */
    function mtxClosePopover() {
        document.querySelectorAll('.cmp-mtx-override-popover').forEach(function (p) { p.remove(); });
    }
    document.addEventListener('click', function (e) {
        var cell = e.target.closest('.cmp-mtx-cell');
        if (!cell) { mtxClosePopover(); return; }
        if (cell.classList.contains('is-na')) return;
        e.stopPropagation();
        mtxClosePopover();
        var scopeKey = cell.dataset.scope;
        var opKey = cell.dataset.op;
        var typeKey = mtxGetTypeKey(scopeKey, opKey);
        var overrides = mtxReadOverrides();
        var hasOverride = !!overrides[typeKey];

        var pop = document.createElement('div');
        pop.className = 'cmp-mtx-override-popover';
        pop.innerHTML = '<div class="cmp-mtx-pop-title">' + escapeHtmlMtx(typeKey) + '</div>'
            + '<div class="cmp-mtx-pop-info">'
            +     '現状: ' + (hasOverride ? '個別 override (<code>' + escapeHtmlMtx(overrides[typeKey]) + '</code>)' : 'プリミティブ合成')
            + '</div>'
            + '<div class="cmp-mtx-pop-actions">'
            +     '<button data-act="override">個別アイコンを指定...</button>'
            +     (hasOverride ? '<button data-act="reset" class="is-danger">合成に戻す (override 削除)</button>' : '')
            +     '<button data-act="cancel">キャンセル</button>'
            + '</div>';
        document.body.appendChild(pop);
        var rect = cell.getBoundingClientRect();
        var top = rect.bottom + window.scrollY + 4;
        var left = rect.left + window.scrollX;
        if (left + 240 > window.innerWidth) left = window.innerWidth - 250;
        pop.style.top = top + 'px';
        pop.style.left = left + 'px';

        pop.addEventListener('click', function (ev) {
            var btn = ev.target.closest('button');
            if (!btn) return;
            ev.stopPropagation();
            var act = btn.dataset.act;
            if (act === 'override') {
                mtxClosePopover();
                mtxOpenPicker('個別 override: ' + typeKey, function (file) {
                    mtxWriteOverride(typeKey, file);
                    mtxRefreshAll();
                    mtxSetStatus('override ' + typeKey + ' を設定しました');
                });
            } else if (act === 'reset') {
                mtxWriteOverride(typeKey, null);
                mtxClosePopover();
                mtxRefreshAll();
                mtxSetStatus('override ' + typeKey + ' を削除しました');
            } else {
                mtxClosePopover();
            }
        });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') mtxClosePopover(); });

    /* ツールバー */
    function mtxSetStatus(msg) {
        var el = document.getElementById('cmpMtxStatus');
        if (!el) return;
        el.textContent = msg;
        clearTimeout(mtxSetStatus._t);
        mtxSetStatus._t = setTimeout(function () { el.textContent = ''; }, 3000);
    }
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('#cmpMtxExport');
        if (!btn) return;
        var data = {
            _meta: {
                exportedAt: new Date().toISOString(),
                source: 'notify-compare.html マトリクス選定モード',
                scopes: MTX_SCOPES.map(function (s) { return s.key; }),
                ops: MTX_OPS.map(function (o) { return o.key; }),
                applicable: MTX_APPLICABLE
            },
            primitives: mtxReadPrimitives(),
            typeOverrides: mtxReadOverrides()
        };
        var json = JSON.stringify(data, null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(json).then(function () {
                mtxSetStatus('JSON をクリップボードにコピーしました (' + json.length + ' 文字)');
            }).catch(function () {
                console.log(json);
                mtxSetStatus('クリップボード失敗。コンソール出力しました');
            });
        } else {
            console.log(json);
            mtxSetStatus('navigator.clipboard 非対応。コンソール出力しました');
        }
    });
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('#cmpMtxReset');
        if (!btn) return;
        if (!confirm('プリミティブ・override すべてをリセットしますか？\n(localStorage の notifyPrimitives.v1 / notifyTypeOverrides.v1 を削除)')) return;
        try {
            localStorage.removeItem(MTX_PRIMITIVES_KEY);
            localStorage.removeItem(MTX_OVERRIDES_KEY);
            localStorage.removeItem(MTX_MIGRATION_KEY);
        } catch (e2) {}
        mtxRefreshAll();
        mtxSetStatus('すべてリセットしました');
    });

    /* マトリクスモード初回表示時に描画 */
    document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn.dataset.mode === 'matrix') {
                mtxRefreshAll();
            }
        });
    });

    /* 起動時にもレンダリング（マトリクスタブが直接ロードされた場合に備える） */
    document.addEventListener('DOMContentLoaded', function () {
        mtxRefreshAll();
    });
})();
