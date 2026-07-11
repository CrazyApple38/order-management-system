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

    // --- 変更通知ベル定義（R-2 統合ベル1個 / 2026-07-03）
    //     4分類ベル横並びを廃止し、統合ベル + 単一 cn-card に集約。
    //     カテゴリ（受注/配置/申請・承認/マスタ）はエンティティ (domain) から
    //     co-notify-panel.js が導出し、カード内バッジ+フィルタチップで示す。
    var coNotifyBells = [
        { id: 'all', title: '変更通知', tooltip: '変更通知', group: 'main' }
    ];
    // 旧ベルID → 旧4分類（互換吸収用。co-notify-panel.js のカテゴリ導出フォールバックが参照）
    var coNotifyBellAliases = {
        ob: 'order',
        sl: 'assignment',
        ws: 'assignment',
        vehicle: 'assignment',
        la: 'approval',
        pending: 'approval',
        master: 'master'
    };
    window.coNotifyBells = coNotifyBells;
    window.coNotifyBellAliases = coNotifyBellAliases;

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

    // 変更通知ベル（R-2: 統合ベル1個 + cn-card。レールが無い画面はベル位置アンカー）
    function buildBellsHtml() {
        var bell = coNotifyBells[0];
        return ''
            + '<div class="md-nav-cn-bells" id="mdNavCnBells">'
            +   '<div class="cn-anchor md-nav-cn-bell" data-bell="' + bell.id + '" id="mdNavCnBell-' + bell.id + '">'
            +     '<button type="button" class="cn-trigger md-nav-action-btn" title="' + bell.tooltip + '" aria-label="' + bell.tooltip + '">'
            +       '<img class="cn-bell-icon md-nav-cn-bell-icon" data-bell-icon="' + bell.id + '" src="" alt="">'
            +       '<span class="cn-trigger-badge" hidden>0</span>'
            +     '</button>'
            +     '<div class="cn-card" role="dialog" aria-label="' + bell.title + '">'
            +       '<div class="cn-head">'
            +         '<strong class="cn-title">' + bell.title + '</strong>'
            +         '<span class="cn-count"></span>'
            +         '<button type="button" class="cn-mark-all">すべて既読</button>'
            +         '<button type="button" class="cn-close" title="閉じる" aria-label="閉じる">&times;</button>'
            +       '</div>'
            +       '<div class="cn-filter-chips" role="group" aria-label="カテゴリで絞り込み">'
            +         '<button type="button" class="cn-filter-chip is-active" data-filter="all">すべて</button>'
            +         '<button type="button" class="cn-filter-chip" data-filter="order">受注</button>'
            +         '<button type="button" class="cn-filter-chip" data-filter="assignment">配置</button>'
            +         '<button type="button" class="cn-filter-chip" data-filter="approval">申請・承認</button>'
            +         '<button type="button" class="cn-filter-chip" data-filter="master">マスタ</button>'
            +       '</div>'
            +       '<div class="cn-body cn-body--latest" data-bell-body="' + bell.id + '">'
            +         '<div class="cn-empty">新しい通知はありません</div>'
            +       '</div>'
            +       '<div class="cn-foot">'
            +         '<button type="button" class="cn-center-link">変更通知センターで開く →</button>'
            +       '</div>'
            +     '</div>'
            +   '</div>'
            + '</div>';
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

    // --- ベル単位デモ通知データ（共通モックデータ同期版）---
    // 固定文言ではなく demo-data.js / mock-orders-data.js / co-mock-store.js の実値から組み立てる。
    function mdNavPad2(n) { return String(n).padStart(2, '0'); }
    function mdNavCurrentDateKey() {
        return (window.OmsMockStore && window.OmsMockStore.getCurrentDate && window.OmsMockStore.getCurrentDate()) ||
            (window.OmsMockStore && window.OmsMockStore.defaultDate) || '2026-05-01';
    }
    function mdNavDemoTodayLabel() {
        var parts = String((window.OmsMockStore && window.OmsMockStore.getDemoToday && window.OmsMockStore.getDemoToday()) || mdNavCurrentDateKey()).split('-');
        return '今日 (' + (+parts[1]) + '/' + (+parts[2]) + ')';
    }
    function mdNavDayLabel(dateKey) {
        var parts = String(dateKey || mdNavCurrentDateKey()).split('-');
        return (+parts[1]) + '/' + (+parts[2]);
    }
    // 現在表示月の「day 日」を dateKey (YYYY-MM-DD) に変換（OB セル通知の対象日導出用）
    function mdNavDateKeyForDay(day) {
        var d = parseInt(day, 10);
        if (!Number.isFinite(d)) return '';
        var parts = String(mdNavCurrentDateKey()).split('-');
        return parts[0] + '-' + parts[1] + '-' + mdNavPad2(d);
    }
    function mdNavGetEmployees() {
        return (typeof employeesData !== 'undefined' && Array.isArray(employeesData)) ? employeesData : [];
    }
    function mdNavGetVehicles() {
        return (typeof vehiclesData !== 'undefined' && Array.isArray(vehiclesData)) ? vehiclesData : [];
    }
    function mdNavGetObMonthState() {
        var key = mdNavCurrentDateKey();
        var p = window.OmsMockStore && window.OmsMockStore.dateToParts
            ? window.OmsMockStore.dateToParts(key)
            : { year: +key.slice(0, 4), month: +key.slice(5, 7), day: +key.slice(8, 10) };
        var saved = window.OmsMockStore && window.OmsMockStore.getObMonth
            ? window.OmsMockStore.getObMonth(p.year, p.month)
            : null;
        if (saved && Array.isArray(saved.sampleRows) && saved.cellData) return { state: saved, day: p.day };
        if (window.OmsMockOrdersData && window.OmsMockOrdersData.buildMonthState) {
            return {
                state: window.OmsMockOrdersData.buildMonthState(
                    p.year,
                    p.month,
                    (window.OmsMockStore && window.OmsMockStore.getDemoToday && window.OmsMockStore.getDemoToday()) || key
                ),
                day: p.day
            };
        }
        return { state: null, day: p.day };
    }
    function mdNavNormalizeEntries(value) {
        if (!value) return [];
        return Array.isArray(value) ? value.filter(Boolean) : [value];
    }
    function mdNavFindObDemoEntries(limit) {
        var data = mdNavGetObMonthState();
        var state = data.state;
        var out = [];
        if (!state || !Array.isArray(state.sampleRows) || !state.cellData) return out;
        function pushForDay(day) {
            state.sampleRows.forEach(function (row, ri) {
                if (!row || row.hidden || out.length >= limit) return;
                mdNavNormalizeEntries(state.cellData[ri] && state.cellData[ri][day]).forEach(function (entry, si) {
                    if (out.length >= limit) return;
                    out.push({ row: row, rowIndex: ri, day: day, entry: entry, subIndex: si });
                });
            });
        }
        pushForDay(data.day);
        if (out.length < limit) {
            Object.keys(state.cellData || {}).forEach(function (ri) {
                Object.keys(state.cellData[ri] || {}).forEach(function (day) {
                    if (out.length >= limit) return;
                    mdNavNormalizeEntries(state.cellData[ri][day]).forEach(function (entry, si) {
                        if (out.length >= limit) return;
                        out.push({ row: state.sampleRows[ri], rowIndex: +ri, day: +day, entry: entry, subIndex: si });
                    });
                });
            });
        }
        return out;
    }
    function mdNavGetLeaveApplications() {
        var leaves = window.OmsMockStore && window.OmsMockStore.getLeaveApplications
            ? window.OmsMockStore.getLeaveApplications()
            : null;
        return Array.isArray(leaves) ? leaves : [];
    }
    function mdNavFindLeaveByStatus(leaves, status, preferredDate) {
        var filtered = (leaves || []).filter(function (lv) { return lv && lv.status === status; });
        return filtered.find(function (lv) { return String(lv.date || '') === String(preferredDate || ''); }) || filtered[0] || null;
    }
    function mdNavEmployeeNameById(id) {
        var m = String(id || '').match(/^emp-(\d+)$/);
        var employees = mdNavGetEmployees();
        var idx = m ? parseInt(m[1], 10) - 1 : -1;
        return employees[idx] ? employees[idx].name : (id || '');
    }
    function mdNavBuildBellItems() {
        var today = mdNavDemoTodayLabel();
        var obEntries = mdNavFindObDemoEntries(3);
        var employees = mdNavGetEmployees();
        var vehicles = mdNavGetVehicles();
        var leaves = mdNavGetLeaveApplications();
        var currentDateKey = mdNavCurrentDateKey();
        var pendingLeaves = leaves.filter(function (lv) { return lv && lv.status === 'pending'; });
        var approvedLeave = mdNavFindLeaveByStatus(leaves, 'approved', currentDateKey);
        var rejectedLeave = mdNavFindLeaveByStatus(leaves, 'rejected', currentDateKey);
        var firstOb = obEntries[0];
        var secondOb = obEntries[1] || firstOb;
        var siteLabel = firstOb && firstOb.row ? ((firstOb.row.company || '') + ' / ' + (firstOb.entry.dailyTaskName || firstOb.row.task || '')).replace(/^ \/ /, '') : '';
        var employee = employees[0] || { name: '社員', company: '' };
        var vehicle = vehicles[0] || {};
        var masterSite = firstOb && firstOb.row ? (firstOb.entry.dailyTaskName || firstOb.row.task || '') : '';
        var items = { ob: [], sl: [], ws: [], la: [], pending: [], vehicle: [], master: [] };

        obEntries.forEach(function (hit, idx) {
            var row = hit.row || {};
            var entry = hit.entry || {};
            var op = idx === 0 ? 'add' : (idx === 1 ? 'modify' : 'delete');
            var actionText = op === 'add'
                ? '受注を追加'
                : (op === 'delete' ? '受注を削除' : '人数を変更');
            var expandText = '人数: ' + (entry.count || 0) + '名 / シフト: ' + (row.shift || '');
            items.ob.push({
                scope: 'site',
                op: op,
                domain: 'order',
                primaryPage: 'order-book',
                main: (row.company || '契約先') + ' / ' + (entry.dailyTaskName || row.task || '受注') + '｜' + actionText,
                sub: '共通モックデータ ・ ' + (idx === 2 ? '昨日 17:00' : '10:00'),
                date: idx === 2 ? '昨日' : today,
                targetDate: mdNavDateKeyForDay(hit.day),
                expand: expandText,
                diffs: op === 'modify' ? [{ field: '人数', oldVal: '変更前', newVal: (entry.count || 0) + '名' }] : null,
                affects: ['order-book', 'screen-layout', 'weekly-schedule'],
                target: row._rowId != null ? { 'order-book': { axis: 'orderId', value: row._rowId, day: hit.day, subIndex: hit.subIndex } } : null
            });
        });

        // 行レベル通知のバリエーション（セル単位=日付バッジあり との対比用。scope:'row' は日付バッジなし）
        // ① 行を追加 — 既存行（rowId 3 △△建設(株)/中央道補修）へフラッシュ
        items.ob.push({
            scope: 'row', op: 'add',
            domain: 'order', primaryPage: 'order-book',
            main: '△△建設(株) / 中央道補修｜行を追加',
            sub: '共通モックデータ ・ 09:30',
            date: today,
            expand: '新規契約先・現場を追加',
            affects: ['order-book', 'screen-layout', 'weekly-schedule'],
            target: { 'order-book': { axis: 'orderId', value: 3 } }
        });
        // ② 現場名の変更 — 既存行（rowId 4 (株)丸山建設/〇〇ビル巡回）
        items.ob.push({
            scope: 'row', op: 'modify',
            domain: 'order', primaryPage: 'order-book',
            main: '(株)丸山建設 / 〇〇ビル巡回｜現場名 〇〇ビル巡回 → 〇〇ビル北館巡回',
            sub: '共通モックデータ ・ 09:40',
            date: today,
            expand: '現場名: 〇〇ビル巡回 → 〇〇ビル北館巡回',
            diffs: [{ field: '現場名', oldVal: '〇〇ビル巡回', newVal: '〇〇ビル北館巡回' }],
            affects: ['order-book', 'screen-layout', 'weekly-schedule'],
            target: { 'order-book': { axis: 'orderId', value: 4 } }
        });
        // ③ 行の削除 + 復旧トグル — 専用の削除済みダミー行（西日本高速道路(株)/PJNo.26-5225）
        //    flag(localStorage) を単一の真実源とし、削除状態↔復旧状態で表示を切替える。
        var demoDelRow = window.OMS_DEMO_DELETED_ROW || { _rowId: 'demo-deleted-1', company: '西日本高速道路(株)', task: 'PJNo.26-5225' };
        var demoDelMain = (demoDelRow.company || '') + ' / ' + (demoDelRow.task || '');
        var demoRecovered = !!(window.OmsDemoRecover && window.OmsDemoRecover.isRecovered());
        if (demoRecovered) {
            // 復旧済み: 削除通知はロック（取り消し線・展開不可）→ 復旧ボタンを再押下できず重複挿入を防ぐ
            items.ob.push({
                scope: 'row', op: 'delete',
                domain: 'order', primaryPage: 'order-book',
                main: demoDelMain + '｜行を削除',
                sub: '共通モックデータ ・ 09:50',
                date: today,
                locked: true,
                affects: ['order-book'],
                target: null
            });
            // 復旧通知（新規）— 展開すると「復旧をキャンセル」ボタン
            items.ob.push({
                scope: 'row', op: 'add',
                domain: 'order', primaryPage: 'order-book',
                main: demoDelMain + '｜行を復旧',
                sub: '共通モックデータ ・ 09:55',
                date: today,
                expand: '削除した受注行を元に戻しました',
                actions: [{ label: '復旧をキャンセル', action: 'cancel-recover-order' }],
                affects: ['order-book'],
                target: null
            });
        } else {
            // 未復旧（削除済み）: 展開すると「データを復旧する」ボタン。行は無いためフラッシュしない。
            items.ob.push({
                scope: 'row', op: 'delete',
                domain: 'order', primaryPage: 'order-book',
                main: demoDelMain + '｜行を削除',
                sub: '共通モックデータ ・ 09:50',
                date: today,
                expand: 'この受注行は削除済みです',
                actions: [{ label: 'データを復旧する', action: 'recover-order' }],
                affects: ['order-book'],
                target: null
            });
        }

        if (firstOb) {
            // OB→SL: 受注追加。SL は OB と同サイト名で解決可。WS はモックサイト名が一致しないためジャンプ対象外。
            items.sl.push({
                scope: 'site', op: 'add',
                domain: 'order',
                primaryPage: 'order-book',
                main: siteLabel + '｜受注を追加',
                sub: '共通モックデータ ・ 10:00',
                date: today,
                targetDate: currentDateKey,
                expand: 'OB共通データからSL行へ反映',
                affects: ['screen-layout', 'order-book'],
                target: {
                    'screen-layout': { axis: 'siteName', value: firstOb.entry.dailyTaskName || firstOb.row.task || '', date: currentDateKey }
                }
            });
            // SL での配置。SL のみフラッシュ対象（WS はサイト名不一致のため対象外、LA は配置直接対象でない）。
            items.sl.push({
                scope: 'employee', op: 'place', color: 'secondary',
                domain: 'person-assignment',
                primaryPage: 'screen-layout',
                subTag: 'own',
                main: (firstOb.entry.dailyTaskName || firstOb.row.task || '現場') + '｜' + employee.name + ' を配置',
                sub: employee.company + ' ・ 10:15',
                date: today,
                targetDate: currentDateKey,
                affects: ['screen-layout', 'leave-application'],
                target: {
                    'screen-layout': { axis: 'siteName', value: firstOb.entry.dailyTaskName || firstOb.row.task || '', date: currentDateKey }
                }
            });
            // WS発信の配置通知 — WS のサンプルサイト（s1: 〇〇株式会社 / 〇〇ビル）を直接指す（axis:'wsCell'）。
            // OB/SL とサイト名が共有されないモック都合により、WS固有サイトでカード文言と着地先の意味を一致させる。
            items.ws.push({
                scope: 'schedule', op: 'add',
                domain: 'person-assignment',
                primaryPage: 'weekly-schedule',
                subTag: 'own',
                main: '〇〇株式会社 / 〇〇ビル｜' + employee.name + ' を配置',
                sub: '共通モックデータ ・ 10:20',
                date: today,
                targetDate: currentDateKey,
                expand: 'WS の配置を更新',
                affects: ['weekly-schedule'],
                target: {
                    'weekly-schedule': { axis: 'wsCell', value: 's1', date: currentDateKey }
                }
            });
        }
        if (secondOb && vehicles.length > 0) {
            items.sl.push({
                scope: 'vehicle', op: 'place',
                domain: 'vehicle-assignment',
                primaryPage: 'screen-layout',
                subTag: 'vehicle',
                main: (secondOb.entry.dailyTaskName || secondOb.row.task || '現場') + '｜' + (vehicle.plate || vehicle.model || '車両') + ' を配置',
                sub: (vehicle.model || '車両') + ' ・ 10:25',
                date: today,
                targetDate: currentDateKey,
                affects: ['screen-layout', 'leave-application'],
                target: {
                    'screen-layout': { axis: 'siteName', value: secondOb.entry.dailyTaskName || secondOb.row.task || '', date: mdNavCurrentDateKey() }
                }
            });
            items.vehicle.push({
                scope: 'vehicle', op: 'modify',
                domain: 'vehicle-assignment',
                primaryPage: 'screen-layout',
                subTag: 'vehicle',
                main: (vehicle.plate || vehicle.model || '車両') + ' の車両予定を更新',
                sub: (vehicle.model || '共通車両データ') + ' ・ 10:30',
                date: today,
                targetDate: currentDateKey,
                expand: '車両マスタ: ' + (vehicle.owner || '') + ' / ' + (vehicle.model || ''),
                affects: ['screen-layout', 'leave-application']
            });
        }

        [pendingLeaves[0], approvedLeave, rejectedLeave].filter(Boolean).forEach(function (lv) {
            var op = lv.status === 'approved' ? 'approve' : (lv.status === 'rejected' ? 'reject' : 'add');
            var action = op === 'add' ? '休暇申請を追加' : (op === 'approve' ? '申請を承認' : '申請を却下');
            var laEmpName = mdNavEmployeeNameById(lv.employeeId);
            items.la.push({
                scope: 'application',
                op: op,
                domain: 'leave',
                primaryPage: 'leave-application',
                main: laEmpName + '｜' + action,
                sub: '共通休暇データ ・ ' + (op === 'add' ? '09:30' : op === 'approve' ? '10:30' : '17:00'),
                date: today,
                targetDate: lv.date,
                expand: lv.reason ? '理由: ' + lv.reason : '',
                affects: ['leave-application', 'weekly-schedule', 'screen-layout'],
                target: {
                    'leave-application': { axis: 'leaveId', value: String(lv.id) },
                    'weekly-schedule': { axis: 'leaveId', value: String(lv.id) },
                    'screen-layout': { axis: 'empName', value: laEmpName, date: lv.date }
                }
            });
        });
        if (pendingLeaves.length > 0) {
            items.pending.push({
                scope: 'application',
                op: 'add',
                domain: 'leave',
                primaryPage: 'leave-application',
                main: 'DCP承認待ち: ' + pendingLeaves.length + '件',
                sub: mdNavEmployeeNameById(pendingLeaves[0].employeeId) + ' ・ 09:30',
                date: today,
                targetDate: pendingLeaves[0].date,
                expand: '共通休暇申請データの pending 件数',
                affects: ['leave-application'],
                target: { axis: 'leaveId', value: String(pendingLeaves[0].id) }
            });
        }

        if (masterSite) {
            items.master.push({
                type: 'add',
                slot: 'type-master-add',
                domain: 'master',
                primaryPage: 'order-book',
                main: '現場マスタに ' + masterSite + ' を追加',
                sub: '共通受注データ ・ 09:00',
                date: today,
                affects: ['order-book', 'screen-layout', 'weekly-schedule']
            });
        }
        if (employees.length > 0) {
            items.master.push({
                type: 'modify',
                slot: 'type-master-modify',
                domain: 'master',
                primaryPage: 'screen-layout',
                main: '社員マスタで ' + employee.name + ' の所属を確認',
                sub: (employee.company || '所属未設定') + ' ・ ' + today,
                date: today,
                expand: '社員データ: ' + (employee.dept || '') + ' / ' + (employee.role || ''),
                affects: ['screen-layout', 'weekly-schedule', 'leave-application']
            });
        }
        return items;
    }
    // R-2: 旧画面IDバケツを単一配列へフラット化（sourceBell はジャンプ解決用メタデータとして保持）。
    // ベルへの振り分けは co-notify-panel.js がエンティティ (domain) から導出するため、ここでは行わない。
    function mdNavFlattenBellItems(rawItems) {
        var flat = [];
        Object.keys(rawItems || {}).forEach(function (sourceBell) {
            (rawItems[sourceBell] || []).forEach(function (item) {
                flat.push(Object.assign({ sourceBell: sourceBell, _commonSeed: true }, item));
            });
        });
        return flat;
    }
    var mdNavCnRawBellItems = mdNavBuildBellItems();
    var mdNavCnBellItems = mdNavFlattenBellItems(mdNavCnRawBellItems);

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

    // --- ベル初期化 (アイコン適用 / デモ通知投入 / バッジ更新) ---
    //     開閉・フィルタ等のカード挙動は co-notify-panel.js が処理する。
    function mdNavApplyBells() {
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.setItems !== 'function') return;
        window.coNotifyPanel.applyBellIcon('all');
        // 'all' 直指定 = seed 全置換（実操作の addItem 通知は co-notify-panel 側で保持される）
        window.coNotifyPanel.setItems('all', mdNavCnBellItems);
    }
    // 通知シードを再構築して再適用（デモ復旧トグル等で状態が変わったとき）
    window.mdNavRefreshBells = function () {
        mdNavCnRawBellItems = mdNavBuildBellItems();
        mdNavCnBellItems = mdNavFlattenBellItems(mdNavCnRawBellItems);
        mdNavApplyBells();
    };
    mdNavApplyBells();

    // デモ復旧トグル: フラグ(localStorage)を更新してベルを再描画。
    // グリッドの実挿入/再削除は order-book.js 側が同じ cn:action を受けて行う。
    document.addEventListener('cn:action', function (e) {
        var action = e.detail && e.detail.action;
        if (!window.OmsDemoRecover) return;
        if (action === 'recover-order') {
            window.OmsDemoRecover.setRecovered(true);
            window.mdNavRefreshBells();
        } else if (action === 'cancel-recover-order') {
            window.OmsDemoRecover.setRecovered(false);
            window.mdNavRefreshBells();
        }
    });

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

})();
