/* ============================================================
   weekly-schedule.js — 週間予定表モックアップ
   - 現場軸ビュー（メイン）+ 社員軸ビュー（サブ）
   - B案: クリック→サイドパネル選択配置
   - D&D: カラムハイライト+グレーアウト
   ============================================================ */

(function () {
    'use strict';

    // ==========================================================
    // デモデータ
    // ==========================================================

    var CATEGORIES = {
        facility: '施設',
        traffic:  '交通',
        highway:  '高速',
        event:    'イベント'
    };
    var CATEGORY_ORDER = ['facility', 'traffic', 'highway', 'event'];

    var wsSitesData = [
        { id: 's1', name: '\u3007\u3007\u30d3\u30eb', category: 'facility', company: '\u3007\u3007\u682a\u5f0f\u4f1a\u793e', gc: 'touo',
          orders: { day: 3, night: 2 } },
        { id: 's2', name: '\u25b3\u25b3\u30de\u30f3\u30b7\u30e7\u30f3', category: 'facility', company: '\u25b3\u25b3\u5efa\u8a2d', gc: 'nikkei',
          orders: { day: 2, night: 1 } },
        { id: 's3', name: '\u56fd\u90531\u53f7\u7dda \u8217\u88c5\u5de5\u4e8b', category: 'traffic', company: '\u25c7\u25c7\u5de5\u696d', gc: 'touo',
          orders: { day: 4, night: 0 } },
        { id: 's4', name: '\u770c\u905315\u53f7 \u6a4b\u6881\u5de5\u4e8b', category: 'traffic', company: '\u25b3\u25b3\u5efa\u8a2d', gc: 'nikkei',
          orders: { day: 3, night: 2 } },
        { id: 's5', name: '\u9ad8\u901fSA\u88dc\u4fee 24-1234', category: 'highway', company: '\u897f\u65e5\u672c\u9ad8\u901f\u9053\u8def', gc: 'zennihon',
          orders: { day: 5, night: 3 } },
        { id: 's6', name: '\u3007\u3007\u30a2\u30ea\u30fc\u30ca \u30b3\u30f3\u30b5\u30fc\u30c8', category: 'event', company: '\u25a1\u25a1\u30a4\u30d9\u30f3\u30c8', gc: 'zennihon',
          orders: { day: 6, night: 0 } }
    ];

    var wsVehiclesData = [
        { id: 'v1', plate: '\u3055 3078', model: '\u30cf\u30a4\u30a8\u30fc\u30b9', owner: 'touo' },
        { id: 'v2', plate: '\u308f 2490', model: '\u30ad\u30e3\u30e9\u30d0\u30f3', owner: 'touo' },
        { id: 'v3', plate: '\u304f 7521', model: '\u30d7\u30ed\u30dc\u30c3\u30af\u30b9', owner: 'nikkei' },
        { id: 'v4', plate: '\u3042 1234', model: '\u30cf\u30a4\u30a8\u30fc\u30b9', owner: 'touo' },
        { id: 'v5', plate: '\u304b 5678', model: '\u30ad\u30e3\u30f3\u30bf\u30fc', owner: 'nikkei' }
    ];

    var WS_DEFAULT_DATE_KEY = (window.OmsMockStore && window.OmsMockStore.defaultDate) || '2026-05-01';
    var wsStateRestoring = false;

    function wsDemoTodayDate() {
        var key = (window.OmsMockStore && window.OmsMockStore.getDemoToday && window.OmsMockStore.getDemoToday()) || WS_DEFAULT_DATE_KEY;
        return parseDate(key);
    }

    function wsCurrentStoreDate() {
        var key = (window.OmsMockStore && window.OmsMockStore.getCurrentDate && window.OmsMockStore.getCurrentDate()) || WS_DEFAULT_DATE_KEY;
        return parseDate(key);
    }

    var assignments = {};
    var vehicleAssignments = {};
    var holidays = {};
    var vehicleMaintenance = {}; // vehicleId -> { dateKey: true }

    // ==========================================================
    // 協力業者モデル（support_partners / reservations / assignments）
    // ==========================================================
    // supportPartners: 協力業者マスタ
    //   { id, gcCode, shortName, formalName, postalCode, address,
    //     representativeTitle, representativeName, phone, email,
    //     isMasterComplete, isActive }
    var supportPartners = [];
    var nextPartnerId = 1;

    // supportReservations: 協力業者予約（partnerId -> dateKey -> { day, night, flex })
    var supportReservations = {};

    // supportAssignments: 協力業者配置
    //   partnerId -> dateKey -> shift('day'|'night') -> [{ siteId, sourceShift('day'|'night'|'flex') }]
    var supportAssignments = {};

    // プリセット「応援」バッジ（統合・GC無所属）— サイドバー1個・クリックで全GC予約から紐付け
    (function initPresetSupportBadges_legacyRemoved() {
        // \u5171\u901a\u30bd\u30fc\u30b9 (mock-assignments-data.js) \u306b\u79fb\u690d\u6e08\u307f\u3002
        // preset + 5\u793e + \u4e88\u7d04\u306f seedSupportDemoDataFromCommon() \u5074\u3067 seed \u3055\u308c\u308b\u3002
    })();

    // デモデータ投入
    (function seedSupportDemoDataFromCommon() {
        var src = window.OmsMockAssignmentsData;
        if (!src) {
            supportPartners.push({
                id: 'preset-unified', gcCode: null, shortName: '応援',
                formalName: null, postalCode: null, address: null,
                representativeTitle: null, representativeName: null,
                phone: null, email: null,
                isPreset: true, isMasterComplete: false, isActive: true
            });
            return;
        }
        src.createSupportPartners().forEach(function (p) { supportPartners.push(p); });
        nextPartnerId = 6;
        supportReservations = src.createSupportReservations();
    })();

    // 後方互換: 既存コードから wsSupportWorkers/isPresetを参照している箇所のために空配列として残す
    var wsSupportWorkers = [];

    // ==========================================================
    // 状態管理
    // ==========================================================

    var today = wsDemoTodayDate();
    var viewStartDate = getWeekStart(today);
    var visibleWeeks = 1;
    var selectedDate = formatDateKey(today);
    var collapsedGroups = {};

    // ビューモード: 'site' = 現場軸, 'employee' = 社員軸
    var viewMode = 'site';

    // 選択中セル（B案）
    // site view:     { date, shift, siteId }
    // employee view: { date, shift, empIndex }
    var selectedCell = null;

    // D&Dアクティブ状態
    var dragActive = false;
    var dragTargetDate = null;
    var dragSourceDate = null;   // セル起点D&D時の元日付
    var dragSourceShift = null;  // セル起点D&D時の元シフト（'day' | 'night' | null）
    var dragSourceType = null;   // ドラッグ種別 'move-emp'|'move-partner'|'move-chip'|'move-vehicle'|'move-vehicle-chip'|'reservation-partner'|'sidebar-*'
    var dragSourcePartnerGc = null; // 応援予約バッジD&D時の元GC（行間D&D判定用）
    var dragEmpIndex = null;     // ドラッグ中の社員インデックス（休みチェック用）

    // サイドバー社員タブ状態
    var wsEmpTab = {
        activeTab: 'all',
        expandedCompanies: new Set()
    };

    // サイドバー現場候補アコーディオン状態（GC > カテゴリ）
    // キー: 'gc-{gcCode}' または 'gc-{gcCode}-{category}'、値: true=折りたたみ
    var siteAccordionCollapsed = {};

    // サイドバーメインタブ: 'employee' | 'vehicle' | 'site'
    var wsSidebarMainTab = 'employee';

    // 現場タブ用GC縦タブ: 'all' | gcCode
    var wsSiteTab = { activeGc: 'all' };

    // 表示グループ会社フィルタ（共通ナビバーのヘルパー関数を使用）
    // wsGcIsCompanyVisible: 後方互換ラッパー
    function wsGcIsVisible(gcCode) {
        return window.mdNavGcIsCompanyVisible ? window.mdNavGcIsCompanyVisible(gcCode) : true;
    }

    // ==========================================================
    // 日付ユーティリティ
    // ==========================================================

    function getWeekStart(d) {
        var date = new Date(d);
        var day = date.getDay();
        var diff = day === 0 ? -6 : 1 - day;
        date.setDate(date.getDate() + diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function formatDateKey(d) {
        var m = d.getMonth() + 1;
        var dd = d.getDate();
        return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (dd < 10 ? '0' + dd : dd);
    }

    function getDaysOfWeek() { return ['\u65e5', '\u6708', '\u706b', '\u6c34', '\u6728', '\u91d1', '\u571f']; }

    function getVisibleDates() {
        var dates = [];
        var totalDays = visibleWeeks * 7;
        for (var i = 0; i < totalDays; i++) {
            var d = new Date(viewStartDate);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    }

    var holidayDates = {
        '2026-04-29': '\u662d\u548c\u306e\u65e5',
        '2026-05-03': '\u61b2\u6cd5\u8a18\u5ff5\u65e5',
        '2026-05-04': '\u307f\u3069\u308a\u306e\u65e5',
        '2026-05-05': '\u3053\u3069\u3082\u306e\u65e5',
        '2026-05-06': '\u4f11\u65e5'
    };

    function parseDate(dk) {
        var parts = dk.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    // ==========================================================
    // デモ初期配置
    // ==========================================================

    // 配置・車両・整備データは mock-assignments-data.js を単一情報源とする。
    // holidays は wsApplyLeaveApplications() が LA seed (OmsMockStore) から投入する。
    function generateDemoAssignments() {
        var src = window.OmsMockAssignmentsData;
        if (src) {
            assignments = src.createEmployeeAssignments();
            vehicleAssignments = src.createVehicleAssignments();
            vehicleMaintenance = src.createVehicleMaintenance();
        } else {
            assignments = {};
            vehicleAssignments = {};
            vehicleMaintenance = {};
        }
        holidays = {};
    }

    function wsEmpIdToIndex(employeeId) {
        var m = String(employeeId || '').match(/^emp-(\d+)$/);
        if (!m) return -1;
        var idx = parseInt(m[1], 10) - 1;
        return idx >= 0 && idx < employeesData.length ? idx : -1;
    }

    function wsApplyLeaveApplications() {
        if (!window.OmsMockStore || typeof window.OmsMockStore.getLeaveApplications !== 'function') return;
        var leaves = window.OmsMockStore.getLeaveApplications();
        if (!Array.isArray(leaves)) return;
        Object.keys(holidays).forEach(function(empIdx) {
            Object.keys(holidays[empIdx] || {}).forEach(function(dateKey) {
                if (holidays[empIdx][dateKey] === 'la') delete holidays[empIdx][dateKey];
            });
            if (Object.keys(holidays[empIdx] || {}).length === 0) delete holidays[empIdx];
        });
        leaves.forEach(function(lv) {
            if (!lv || lv.status === 'rejected') return;
            if (lv.partition && lv.partition !== 'full') return;
            var idx = wsEmpIdToIndex(lv.employeeId);
            if (idx < 0 || !lv.date) return;
            if (!holidays[idx]) holidays[idx] = {};
            holidays[idx][lv.date] = 'la';
        });
    }

    function wsBuildWeekState() {
        return {
            version: 1,
            weekKey: formatDateKey(getWeekStart(viewStartDate)),
            selectedDate: selectedDate,
            viewMode: viewMode,
            assignments: JSON.parse(JSON.stringify(assignments)),
            vehicleAssignments: JSON.parse(JSON.stringify(vehicleAssignments)),
            holidays: JSON.parse(JSON.stringify(holidays)),
            vehicleMaintenance: JSON.parse(JSON.stringify(vehicleMaintenance)),
            supportPartners: JSON.parse(JSON.stringify(supportPartners)),
            nextPartnerId: nextPartnerId,
            supportReservations: JSON.parse(JSON.stringify(supportReservations)),
            supportAssignments: JSON.parse(JSON.stringify(supportAssignments))
        };
    }

    function wsRestoreWeekState(saved) {
        if (!saved || saved.version !== 1) return false;
        assignments = JSON.parse(JSON.stringify(saved.assignments || {}));
        vehicleAssignments = JSON.parse(JSON.stringify(saved.vehicleAssignments || {}));
        holidays = JSON.parse(JSON.stringify(saved.holidays || {}));
        vehicleMaintenance = JSON.parse(JSON.stringify(saved.vehicleMaintenance || {}));
        supportPartners.length = 0;
        (saved.supportPartners || []).forEach(function(p) { supportPartners.push(JSON.parse(JSON.stringify(p))); });
        nextPartnerId = saved.nextPartnerId || nextPartnerId;
        supportReservations = JSON.parse(JSON.stringify(saved.supportReservations || {}));
        supportAssignments = JSON.parse(JSON.stringify(saved.supportAssignments || {}));
        selectedDate = saved.selectedDate || selectedDate;
        viewMode = saved.viewMode || viewMode;
        wsApplyLeaveApplications();
        return true;
    }

    function wsSaveWeekToStore() {
        if (wsStateRestoring || !window.OmsMockStore) return;
        window.OmsMockStore.setWsWeek(formatDateKey(viewStartDate), wsBuildWeekState());
    }

    function wsLoadWeekFromStore() {
        if (!window.OmsMockStore) {
            generateDemoAssignments();
            return;
        }
        var needsSave = false;
        wsStateRestoring = true;
        try {
            var saved = window.OmsMockStore.getWsWeek(formatDateKey(viewStartDate));
            if (!wsRestoreWeekState(saved)) {
                generateDemoAssignments();
                wsApplyLeaveApplications();
                needsSave = true;
            }
        } finally {
            wsStateRestoring = false;
        }
        if (needsSave) wsSaveWeekToStore();
    }

    function wsSyncCurrentDateToStore(dateKey) {
        if (window.OmsMockStore) window.OmsMockStore.setCurrentDate(dateKey);
    }

    // ==========================================================
    // 配置操作
    // ==========================================================

    function addAssignment(empIndex, date, shift, siteId) {
        if (!assignments[empIndex]) assignments[empIndex] = {};
        if (!assignments[empIndex][date]) assignments[empIndex][date] = {};
        // 1セル1現場: 既存を上書き
        assignments[empIndex][date][shift] = [siteId];
    }

    function removeAssignment(empIndex, date, shift, siteId) {
        if (!assignments[empIndex] || !assignments[empIndex][date] || !assignments[empIndex][date][shift]) return;
        var arr = assignments[empIndex][date][shift];
        var idx = arr.indexOf(siteId);
        if (idx >= 0) arr.splice(idx, 1);
    }

    function addVehicleAssignment(dateKey, shift, siteId, vehicleId) {
        if (!vehicleAssignments[dateKey]) vehicleAssignments[dateKey] = { day: {}, night: {} };
        if (!vehicleAssignments[dateKey][shift]) vehicleAssignments[dateKey][shift] = {};
        vehicleAssignments[dateKey][shift][siteId] = vehicleId;
    }

    function removeVehicleAssignment(dateKey, shift, siteId) {
        if (!vehicleAssignments[dateKey] || !vehicleAssignments[dateKey][shift]) return;
        delete vehicleAssignments[dateKey][shift][siteId];
    }

    function getAssignedEmployees(siteId, dateKey, shift) {
        var result = [];
        Object.keys(assignments).forEach(function (empIdx) {
            var ea = assignments[empIdx];
            if (ea && ea[dateKey] && ea[dateKey][shift]) {
                if (ea[dateKey][shift].indexOf(siteId) >= 0) {
                    result.push(parseInt(empIdx));
                }
            }
        });
        return result;
    }

    function getAssignedSites(empIndex, dateKey, shift) {
        var ea = assignments[empIndex];
        if (!ea || !ea[dateKey] || !ea[dateKey][shift]) return [];
        return ea[dateKey][shift].slice();
    }

    function isEmployeeOnHoliday(empIndex, dateKey) {
        return holidays[empIndex] && holidays[empIndex][dateKey];
    }

    function isEmployeeBusy(empIndex, dateKey, shift) {
        var sites = getAssignedSites(empIndex, dateKey, shift);
        return sites.length > 0;
    }

    // ==========================================================
    // 協力業者ユーティリティ
    // ==========================================================

    function findPartner(partnerId) {
        return supportPartners.find(function (p) { return p.id === partnerId; });
    }

    function wsCnGetGcLabel(gcCode) {
        var gc = groupCompaniesData.filter(function (g) { return g.code === gcCode; })[0];
        return gc ? gc.shortName : (gcCode || '');
    }

    function getActivePartners(gcCode, opts) {
        var includePreset = opts && opts.includePreset;
        return supportPartners.filter(function (p) {
            return p.gcCode === gcCode && p.isActive && (includePreset || !p.isPreset);
        });
    }

    // 協力業者追加（サイドバー ＋ボタンから、または 紐付けポップオーバーから）
    function addPartner(shortName, gcCode, opts) {
        opts = opts || {};
        var id = 'partner-' + (nextPartnerId++);
        supportPartners.push({
            id: id, gcCode: gcCode, shortName: shortName,
            formalName: null, postalCode: null, address: null,
            representativeTitle: null, representativeName: null,
            phone: null, email: null,
            isPreset: false,
            isMasterComplete: false,
            isActive: true
        });
        if (!opts.silent) {
            wsCnSelfNotify('reservation', 'add', {
                kind: 'partner',
                partnerName: shortName,
                details: [{ field: '所属GC', value: wsCnGetGcLabel(gcCode) }]
            });
        }
        return id;
    }

    function deactivatePartner(partnerId, opts) {
        opts = opts || {};
        var p = findPartner(partnerId);
        if (p && !p.isPreset) {
            p.isActive = false;
            if (!opts.silent) {
                wsCnSelfNotify('reservation', 'delete', {
                    kind: 'partner',
                    partnerName: p.shortName,
                    details: [{ field: '所属GC', value: wsCnGetGcLabel(p.gcCode) }]
                });
            }
        }
    }

    // 日別の予約人数を取得（フレックスのみ。未定義は0）
    function getReservedCount(partnerId, dateKey) {
        var r = supportReservations[partnerId];
        if (!r || !r[dateKey]) return 0;
        return r[dateKey].flex || 0;
    }

    function setReservedCount(partnerId, dateKey, count) {
        if (!supportReservations[partnerId]) supportReservations[partnerId] = {};
        if (!supportReservations[partnerId][dateKey]) supportReservations[partnerId][dateKey] = { flex: 0 };
        supportReservations[partnerId][dateKey].flex = Math.max(0, count | 0);
    }

    // 当該 partner/date の配置済み総数を取得
    function getAssignedCountForDate(partnerId, dateKey) {
        var sa = supportAssignments[partnerId];
        if (!sa || !sa[dateKey]) return 0;
        var cnt = 0;
        ['day', 'night'].forEach(function (sh) {
            var arr = sa[dateKey][sh];
            if (arr) cnt += arr.length;
        });
        return cnt;
    }

    // 残数 = 予約 − 配置消費
    function getRemainingCount(partnerId, dateKey) {
        return getReservedCount(partnerId, dateKey) - getAssignedCountForDate(partnerId, dateKey);
    }

    function addSupportAssignment(partnerId, dateKey, placementShift, siteId) {
        if (!supportAssignments[partnerId]) supportAssignments[partnerId] = {};
        if (!supportAssignments[partnerId][dateKey]) supportAssignments[partnerId][dateKey] = {};
        if (!supportAssignments[partnerId][dateKey][placementShift]) supportAssignments[partnerId][dateKey][placementShift] = [];
        supportAssignments[partnerId][dateKey][placementShift].push({ siteId: siteId });
    }

    function removeSupportAssignment(partnerId, dateKey, placementShift, siteId) {
        var sa = supportAssignments[partnerId];
        if (!sa || !sa[dateKey] || !sa[dateKey][placementShift]) return null;
        var arr = sa[dateKey][placementShift];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].siteId === siteId) {
                return arr.splice(i, 1)[0];
            }
        }
        return null;
    }

    // 現場セルに配置中の協力業者配置のリストを返す
    // 返り値: [{ partner }]
    function getAssignedPartnersForCell(siteId, dateKey, placementShift) {
        var result = [];
        Object.keys(supportAssignments).forEach(function (partnerId) {
            var sa = supportAssignments[partnerId];
            if (!sa || !sa[dateKey] || !sa[dateKey][placementShift]) return;
            var partner = findPartner(partnerId);
            if (!partner) return;
            sa[dateKey][placementShift].forEach(function (a) {
                if (a.siteId === siteId) result.push({ partner: partner });
            });
        });
        return result;
    }

    // 予約行用: 日付ごとの有効予約スロット一覧
    // 返り値: [{ partner, reserved, remaining }]  ※予約>0 の業者のみ
    function getReservationSlotsForDate(gcCode, dateKey) {
        var partners = getActivePartners(gcCode);
        var slots = [];
        partners.forEach(function (p) {
            var reserved = getReservedCount(p.id, dateKey);
            if (reserved > 0) {
                slots.push({ partner: p, reserved: reserved, remaining: getRemainingCount(p.id, dateKey) });
            }
        });
        return slots;
    }

    // 配置済みバッジの表示ラベル: 略称のみ（Q49-a）。統合プリセット応援は GC無所属のため '応援'。
    function getPartnerPlacedLabel(partner) {
        // \u7d71\u5408\u30d7\u30ea\u30bb\u30c3\u30c8\u5fdc\u63f4: GC\u7121\u6240\u5c5e\u306e\u305f\u3081\u30e9\u30d9\u30eb\u306f '\u5fdc\u63f4' \u306e\u307f\u3002
        // \u975e\u30d7\u30ea\u30bb\u30c3\u30c8\u306f\u7565\u79f0\uff08A\u793e\u2460\u7b49\uff09\u306e\u307f\u3002
        return partner.shortName;
    }

    // 警告アイコン（icooon-mono im-11908: 注意マークのフリーアイコン、fill:currentColor）
    var WARN_ICON_SVG = '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="width:1em;height:1em;display:block;fill:currentColor"><path d="M505.095,407.125L300.77,53.208c-9.206-15.944-26.361-25.849-44.774-25.849c-18.412,0-35.552,9.905-44.751,25.849L6.905,407.109c-9.206,15.944-9.206,35.746,0,51.69c9.206,15.944,26.354,25.842,44.758,25.842h408.674c18.405,0,35.568-9.897,44.759-25.842C514.302,442.855,514.302,423.053,505.095,407.125z M256.004,426.437c-17.668,0-32.013-14.33-32.013-32.004c0-17.668,14.345-31.997,32.013-31.997c17.667,0,31.997,14.329,31.997,31.997C288.001,412.108,273.671,426.437,256.004,426.437z M275.72,324.011c0,10.89-8.834,19.709-19.716,19.709c-10.898,0-19.717-8.818-19.717-19.709l-12.296-144.724c0-17.676,14.345-32.005,32.013-32.005c17.667,0,31.997,14.33,31.997,32.005L275.72,324.011z"/></svg>';

    // 予約バッジ生成（予約行の結合セル内、フレックス統一）
    // slot: { partner, reserved, remaining }
    function createReservationBadge(slot, dateKey, isPast) {
        var partner = slot.partner;
        var cls = 'md-ws-reserve-badge';
        if (slot.remaining <= 0) cls += ' md-ws-reserve-empty';

        var badge = el('div', cls);
        badge.dataset.partnerId = partner.id;
        badge.dataset.date = dateKey;

        var label = partner.shortName + ' \u6b8b' + slot.remaining;
        var nameSpan = el('span', 'md-ws-reserve-label', label);
        badge.appendChild(nameSpan);

        // マスタ未完備: 警告アイコン（docs/assets/icons/sign-mark/im-11908 を採用）
        if (!partner.isMasterComplete) {
            var warn = el('span', 'md-ws-reserve-warn');
            warn.innerHTML = WARN_ICON_SVG;
            warn.title = '\u30de\u30b9\u30bf\u672a\u5b8c\u5099\u00a0\u2014\u00a0\u6ce8\u6587\u66f8\u767a\u884c\u4e0d\u53ef';
            badge.appendChild(warn);
        }

        // D&D: 予約行→現場セル（残>0時）または 予約行→別GC予約行（残数を問わない）
        if (!isPast) {
            badge.draggable = true;
            (function (pid, pGc) {
                badge.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        type: 'reservation-partner',
                        partnerId: pid
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                    badge.classList.add('md-ws-dragging');
                    dragSourceDate = dateKey;
                    dragSourcePartnerGc = pGc;
                    activateDragMode(dateKey, { type: 'reservation-partner', shift: null });
                });
            })(partner.id, partner.gcCode);
            badge.addEventListener('dragend', function () {
                badge.classList.remove('md-ws-dragging');
                deactivateDragMode();
            });
        }

        // ×ボタン: 予約行バッジごと削除（当日の予約＋配置を一括キャンセル）
        if (!isPast) {
            var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
            removeBtn.title = '\u3053\u306e\u65e5\u306e\u4e88\u7d04\u3092\u524a\u9664';
            (function (pid, dk) {
                removeBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    cancelReservationForDate(pid, dk);
                });
                removeBtn.addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                });
            })(partner.id, dateKey);
            badge.appendChild(removeBtn);
        }

        return badge;
    }

    // 当日の予約を削除（配置があれば確認の上で配置もまとめて解除）
    function cancelReservationForDate(partnerId, dateKey) {
        var partner = findPartner(partnerId);
        if (!partner) return;
        var assigned = getAssignedCountForDate(partnerId, dateKey);
        if (assigned > 0) {
            var ok = confirm(partner.shortName + ' の ' + dateKey + ' に配置済み ' + assigned + '件があります。配置も併せて削除します。よろしいですか？');
            if (!ok) return;
            var sa = supportAssignments[partnerId];
            if (sa && sa[dateKey]) delete sa[dateKey];
        }
        var prevCount = 0;
        if (supportReservations[partnerId] && supportReservations[partnerId][dateKey]) {
            prevCount = supportReservations[partnerId][dateKey].flex || 0;
            delete supportReservations[partnerId][dateKey];
        }
        wsCnSelfNotify('reservation', 'delete', {
            partnerName: partner.shortName,
            day: wsCnGetDayLabel(dateKey),
            count: prevCount
        });
        renderGrid();
        renderSidebar();
    }

    /**
     * 連続シフト判定
     * 同日昼→夜、夜→翌日昼 を連続とみなす
     * @returns {{ hasPrev: boolean, hasNext: boolean }}
     */
    function getConsecutiveShiftInfo(empIndex, dateKey, shift) {
        var d = new Date(dateKey + 'T00:00:00');
        var prevDay = new Date(d); prevDay.setDate(prevDay.getDate() - 1);
        var nextDay = new Date(d); nextDay.setDate(nextDay.getDate() + 1);
        var prevDayKey = formatDateKey(prevDay);
        var nextDayKey = formatDateKey(nextDay);

        var hasPrev = false;
        var hasNext = false;

        if (shift === 'day') {
            // 昼シフト: 前=前日夜、次=同日夜
            hasPrev = getAssignedSites(empIndex, prevDayKey, 'night').length > 0;
            hasNext = getAssignedSites(empIndex, dateKey, 'night').length > 0;
        } else {
            // 夜シフト: 前=同日昼、次=翌日昼
            hasPrev = getAssignedSites(empIndex, dateKey, 'day').length > 0;
            hasNext = getAssignedSites(empIndex, nextDayKey, 'day').length > 0;
        }

        return { hasPrev: hasPrev, hasNext: hasNext };
    }

    function getHolidayEmployees(dateKey) {
        var result = [];
        Object.keys(holidays).forEach(function (empIdx) {
            if (holidays[empIdx][dateKey]) {
                result.push(parseInt(empIdx));
            }
        });
        return result;
    }

    function isVehicleInMaintenance(vehicleId, dateKey) {
        return vehicleMaintenance[vehicleId] && vehicleMaintenance[vehicleId][dateKey];
    }

    function getMaintenanceVehicles(dateKey) {
        var result = [];
        Object.keys(vehicleMaintenance).forEach(function (vid) {
            if (vehicleMaintenance[vid][dateKey]) {
                result.push(vid);
            }
        });
        return result;
    }

    // 車両の配置先現場を取得（日付×シフト → siteId[]）
    function getVehicleAssignedSites(vehicleId, dateKey, shift) {
        var result = [];
        var va = vehicleAssignments[dateKey];
        if (va && va[shift]) {
            Object.keys(va[shift]).forEach(function (sid) {
                if (va[shift][sid] === vehicleId) result.push(sid);
            });
        }
        return result;
    }

    // 車両グループ構築（会社別）
    function buildVehicleGroups() {
        var groups = [];
        var gcOrder = ['touo', 'nikkei', 'zennihon'];
        var gcNames = { touo: '\u6771\u592e\u8b66\u5099', nikkei: 'Nikkei', zennihon: 'AJE' };

        gcOrder.forEach(function (gc) {
            if (!wsGcIsVisible(gc)) return;
            var vehicles = wsVehiclesData.filter(function (v) { return v.owner === gc; });
            if (vehicles.length === 0) return;
            groups.push({
                id: 'vg-' + gc,
                gcCode: gc,
                gcName: gcNames[gc],
                vehicles: vehicles
            });
        });
        return groups;
    }

    // ==========================================================
    // グループ構築
    // ==========================================================

    function buildEmployeeGroups() {
        var groups = [];
        var gcOrder = ['touo', 'nikkei', 'zennihon'];
        var gcNames = { touo: '\u6771\u592e\u8b66\u5099', nikkei: 'Nikkei', zennihon: 'AJE' };

        gcOrder.forEach(function (gc) {
            if (!wsGcIsVisible(gc)) return;
            var deptMap = {};
            employeesData.forEach(function (emp, idx) {
                if (emp.company !== gc) return;
                if (!deptMap[emp.dept]) deptMap[emp.dept] = [];
                deptMap[emp.dept].push({ index: idx, name: emp.name, dept: emp.dept, company: gc });
            });

            Object.keys(deptMap).forEach(function (deptId) {
                var deptName = deptId;
                if (departmentsData && departmentsData[gc]) {
                    departmentsData[gc].forEach(function (d) {
                        if (d.id === deptId) deptName = d.name;
                    });
                }
                groups.push({
                    id: deptId,
                    gcCode: gc,
                    gcName: gcNames[gc],
                    deptName: deptName,
                    employees: deptMap[deptId]
                });
            });
        });
        return groups;
    }

    function buildSiteGroups() {
        var groups = [];
        CATEGORY_ORDER.forEach(function (cat) {
            var sites = wsSitesData.filter(function (s) {
                return s.category === cat && wsGcIsVisible(s.gc);
            });
            if (sites.length > 0) {
                groups.push({
                    id: 'cat-' + cat,
                    category: cat,
                    categoryName: CATEGORIES[cat],
                    sites: sites
                });
            }
        });
        return groups;
    }

    // ==========================================================
    // ユーティリティ
    // ==========================================================

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text) e.textContent = text;
        return e;
    }

    function truncate(str, max) {
        return str.length > max ? str.substring(0, max) + '\u2026' : str;
    }

    // \u6cd5\u4eba\u7a2e\u5225\u306e\u7565\u8a18\uff08\u30d0\u30c3\u30b8\u8868\u793a\u7528\uff09\u3002\u63a5\u982d\u30fb\u63a5\u5c3e\u3069\u3061\u3089\u3067\u3082\u4e00\u7b87\u6240\u306e\u307f\u7f6e\u63db\u3002
    // Why: \u9650\u3089\u308c\u305f\u30c1\u30c3\u30d7\u5e45\u3067\u4f1a\u793e\u540d\u3092\u8b58\u5225\u3057\u3084\u3059\u304f\u3059\u308b\u305f\u3081\u3002
    var COMPANY_ABBREV_RULES = [
        ['\u7279\u5b9a\u975e\u55b6\u5229\u6d3b\u52d5\u6cd5\u4eba', '(\u7279\u975e)'],
        ['\u4e00\u822c\u793e\u56e3\u6cd5\u4eba',                 '(\u4e00\u793e)'],
        ['\u4e00\u822c\u8ca1\u56e3\u6cd5\u4eba',                 '(\u4e00\u8ca1)'],
        ['\u516c\u76ca\u793e\u56e3\u6cd5\u4eba',                 '(\u516c\u793e)'],
        ['\u516c\u76ca\u8ca1\u56e3\u6cd5\u4eba',                 '(\u516c\u8ca1)'],
        ['\u682a\u5f0f\u4f1a\u793e',                              '(\u682a)'],
        ['\u6709\u9650\u4f1a\u793e',                              '(\u6709)'],
        ['\u5408\u540c\u4f1a\u793e',                              '(\u5408)'],
        ['\u5408\u8cc7\u4f1a\u793e',                              '(\u8cc7)'],
        ['\u5408\u540d\u4f1a\u793e',                              '(\u540d)']
    ];

    function abbreviateCompany(name) {
        if (!name) return name;
        for (var i = 0; i < COMPANY_ABBREV_RULES.length; i++) {
            var full = COMPANY_ABBREV_RULES[i][0];
            if (name.indexOf(full) >= 0) {
                return name.replace(full, COMPANY_ABBREV_RULES[i][1]);
            }
        }
        return name;
    }

    function findSite(id) {
        for (var i = 0; i < wsSitesData.length; i++) {
            if (wsSitesData[i].id === id) return wsSitesData[i];
        }
        return null;
    }

    function findGroupCompany(code) {
        if (typeof groupCompaniesData === 'undefined') return null;
        for (var i = 0; i < groupCompaniesData.length; i++) {
            if (groupCompaniesData[i].code === code) return groupCompaniesData[i];
        }
        return null;
    }

    // GC名の吹き出しツールチップ（hover中のみ表示、document.body 直下に fixed 配置）
    function attachGcTooltip(elem, gcCode) {
        if (!gcCode) return;
        var gc = findGroupCompany(gcCode);
        if (!gc) return;

        var tip = null;
        function show() {
            hide();
            tip = document.createElement('div');
            tip.className = 'md-ws-tooltip md-ws-gc-tooltip';
            tip.textContent = gc.name;
            document.body.appendChild(tip);
            position();
        }
        function position() {
            if (!tip) return;
            var r = elem.getBoundingClientRect();
            var t = tip.getBoundingClientRect();
            var preferAbove = r.top - t.height - 8 >= 4;
            var top, isBelow = false;
            if (preferAbove) {
                top = r.top - t.height - 8;
            } else {
                top = r.bottom + 8;
                isBelow = true;
            }
            var left = r.left + (r.width - t.width) / 2;
            left = Math.max(4, Math.min(window.innerWidth - t.width - 4, left));
            tip.style.top = top + 'px';
            tip.style.left = left + 'px';
            tip.classList.toggle('md-ws-tooltip-below', isBelow);
        }
        function hide() {
            if (tip) { tip.remove(); tip = null; }
        }
        elem.addEventListener('mouseenter', show);
        elem.addEventListener('mouseleave', hide);
    }

    // グリッド再描画時に取り残されたツールチップを掃除
    function clearGcTooltips() {
        var leftovers = document.querySelectorAll('.md-ws-gc-tooltip');
        for (var i = 0; i < leftovers.length; i++) leftovers[i].remove();
    }

    function findVehicle(id) {
        for (var i = 0; i < wsVehiclesData.length; i++) {
            if (wsVehiclesData[i].id === id) return wsVehiclesData[i];
        }
        return null;
    }

    // ==========================================================
    // グリッド描画（ディスパッチ）
    // ==========================================================

    function renderGrid() {
        clearGcTooltips();
        if (viewMode === 'site') {
            renderSiteGrid();
        } else {
            renderEmployeeGrid();
        }
        updateMonthLabel();
        wsRenderStatStrip();
        fixStickyHeaderTops();
        wsSaveWeekToStore();
    }

    function fixStickyHeaderTops() {
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        var dateHeader = grid.querySelector('.md-ws-date-header');
        if (!dateHeader) return;
        var headerHeight = dateHeader.offsetHeight;
        grid.querySelectorAll('.md-ws-shift-header').forEach(function (sh) {
            sh.style.top = headerHeight + 'px';
        });
        var corner2 = grid.querySelector('.md-ws-corner-row2');
        if (corner2) corner2.style.top = headerHeight + 'px';
    }

    // ==========================================================
    // 現場軸グリッド描画
    // ==========================================================

    function renderSiteGrid() {
        var grid = document.getElementById('wsGrid');
        if (!grid) return;

        var dates = getVisibleDates();
        var dayCount = dates.length;

        grid.style.gridTemplateColumns = '160px repeat(' + (dayCount * 2) + ', 1fr)';
        grid.innerHTML = '';
        grid.classList.remove('md-ws-selection-active', 'md-ws-drag-active');

        // --- ヘッダー行1: 日付 ---
        var corner1 = el('div', 'md-ws-corner md-ws-corner-row1', '\u73fe\u5834\u540d');
        corner1.style.gridRow = '1';
        grid.appendChild(corner1);

        dates.forEach(function (d, i) {
            var dk = formatDateKey(d);
            var dow = getDaysOfWeek()[d.getDay()];
            var mm = d.getMonth() + 1;
            var dd = d.getDate();
            var isPastDate = d < today;
            var cls = 'md-ws-date-header';
            if (d.getDay() === 6) cls += ' md-ws-sat';
            if (d.getDay() === 0) cls += ' md-ws-sun';
            if (holidayDates[dk]) cls += ' md-ws-holiday';
            if (dk === formatDateKey(today)) cls += ' md-ws-today';
            if (isPastDate) cls += ' md-ws-past';
            var header = el('div', cls, mm + '/' + dd + '(' + dow + ')');
            header.style.gridColumn = 'span 2';
            header.dataset.date = dk;
            header.addEventListener('click', function () { onDateHeaderClick(dk); });
            header.style.cursor = 'pointer';
            grid.appendChild(header);
        });

        // --- ヘッダー行2: 昼/夜 ---
        var corner2 = el('div', 'md-ws-corner md-ws-corner-row2', '');
        corner2.style.gridRow = '2';
        corner2.style.fontSize = '10px';
        corner2.style.borderBottom = '2px solid var(--divider)';
        grid.appendChild(corner2);

        dates.forEach(function (d, i) {
            var dk = formatDateKey(d);
            var isPastDate = d < today;
            var dayCls = 'md-ws-shift-header' + (isPastDate ? ' md-ws-past' : '');
            var nightCls = 'md-ws-shift-header md-ws-shift-night' + (isPastDate ? ' md-ws-past' : '');
            if (d.getDay() === 6) { dayCls += ' md-ws-shift-sat'; nightCls += ' md-ws-shift-sat'; }
            if (d.getDay() === 0) { dayCls += ' md-ws-shift-sun'; nightCls += ' md-ws-shift-sun'; }
            if (holidayDates[dk]) { dayCls += ' md-ws-shift-holiday'; nightCls += ' md-ws-shift-holiday'; }
            if (dk === formatDateKey(today)) {
                dayCls += ' md-ws-today-shift-border md-ws-today-shift';
                nightCls += ' md-ws-today-shift';
            }
            var dayH = el('div', dayCls, '\u663c');
            dayH.dataset.date = dk;
            dayH.dataset.shift = 'day';
            var nightH = el('div', nightCls, '\u591c');
            nightH.dataset.date = dk;
            nightH.dataset.shift = 'night';
            grid.appendChild(dayH);
            grid.appendChild(nightH);
        });

        // --- データ行 ---
        var siteGroups = buildSiteGroups();
        var currentRow = 3;

        // --- 休み行（最上部） ---
        var holidayGroupId = 'ws-holiday';
        var isHolidayCollapsed = !!collapsedGroups[holidayGroupId];

        // 全表示期間の休み社員数を集計
        var allHolidayEmpSet = {};
        dates.forEach(function (d) {
            getHolidayEmployees(formatDateKey(d)).forEach(function (idx) {
                allHolidayEmpSet[idx] = true;
            });
        });
        var holidayTotal = Object.keys(allHolidayEmpSet).length;

        {
            // グループヘッダー（名前列 + 日付列）
            var hGroupName = el('div', 'md-ws-group-name md-ws-holiday-group-header' + (isHolidayCollapsed ? ' md-ws-collapsed' : ''));
            hGroupName.style.gridRow = currentRow;
            hGroupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span class="md-ws-holiday-badge">\u4f11</span>' +
                '<span>\u4f11\u307f' + (holidayTotal > 0 ? ' ' + holidayTotal + '\u540d' : '') + '</span>';
            hGroupName.dataset.groupId = holidayGroupId;
            hGroupName.addEventListener('click', function () { toggleGroup(holidayGroupId); });
            grid.appendChild(hGroupName);
            var hGroupDates = el('div', 'md-ws-group-dates');
            hGroupDates.style.gridRow = currentRow;
            hGroupDates.addEventListener('click', function () { toggleGroup(holidayGroupId); });
            grid.appendChild(hGroupDates);
            currentRow++;

            // 名前セル
            var hNameCell = el('div', 'md-ws-name-cell md-ws-holiday-name');
            hNameCell.dataset.groupId = holidayGroupId;
            if (isHolidayCollapsed) hNameCell.classList.add('md-ws-row-hidden');
            hNameCell.style.gridRow = currentRow;
            hNameCell.style.gridColumn = '1';
            hNameCell.textContent = '\u4f11\u307f';
            grid.appendChild(hNameCell);

            // 各日付×シフトセル（バッジは昼セルのみ、夜セルは空）
            dates.forEach(function (d, di) {
                var dk = formatDateKey(d);
                var holidayEmps = getHolidayEmployees(dk);
                var isPast = d < today;

                ['day', 'night'].forEach(function (shift, si) {
                    var colIdx = 2 + di * 2 + si;
                    var cellCls = 'md-ws-cell md-ws-holiday-row-cell';
                    if (si === 0) cellCls += ' md-ws-day-col';
                    if (si === 1) cellCls += ' md-ws-night-col';
                    if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                    if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                    if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                    if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';
                    if (isPast) cellCls += ' md-ws-past-col';

                    var cell = el('div', cellCls);
                    cell.dataset.date = dk;
                    cell.dataset.shift = shift;
                    cell.dataset.groupId = holidayGroupId;
                    if (isHolidayCollapsed) cell.classList.add('md-ws-row-hidden');
                    cell.style.gridRow = currentRow;
                    cell.style.gridColumn = colIdx;

                    // 昼セルのみにバッジ表示
                    if (shift === 'day') {
                        holidayEmps.forEach(function (empIdx) {
                            var emp = employeesData[empIdx];
                            if (!emp) return;
                            var chip = el('div', 'md-ws-holiday-emp-chip md-ws-holiday-cursor');
                            chip.dataset.empIndex = empIdx;

                            var nameSpan = el('span', '', emp.name);
                            chip.appendChild(nameSpan);

                            // 配置済みチェック（昼夜両方の配置先を表示）
                            var daySites = getAssignedSites(empIdx, dk, 'day');
                            var nightSites = getAssignedSites(empIdx, dk, 'night');
                            var allSites = daySites.concat(nightSites);
                            if (allSites.length > 0) {
                                chip.classList.add('md-ws-holiday-assigned');
                                var siteNames = [];
                                var seen = {};
                                allSites.forEach(function (sid) {
                                    if (seen[sid]) return;
                                    seen[sid] = true;
                                    var s = findSite(sid);
                                    if (s) siteNames.push(truncate(s.name, 6));
                                });
                                var assignInfo = el('span', 'md-ws-holiday-assign-info', '\u2192 ' + siteNames.join(', '));
                                chip.appendChild(assignInfo);
                            }

                            // カスタムD&D（笑い男カーソル対応・mouseベース）
                            if (!isPast) {
                                chip.style.cursor = 'grab';
                                (function (idx, dateKey, chipRef) {
                                    chipRef.addEventListener('mousedown', function (e) {
                                        if (e.button !== 0) return;
                                        lmStartCustomDrag(e, chipRef, idx, dateKey);
                                    });
                                })(empIdx, dk, chip);
                            }

                            cell.appendChild(chip);
                        });
                    }

                    grid.appendChild(cell);
                });
            });
            currentRow++;
        }

        // --- 修理/点検行（休み行の下、常に表示） ---
        var maintGroupId = 'ws-maintenance';
        var isMaintCollapsed = !!collapsedGroups[maintGroupId];

        var allMaintVehicleSet = {};
        dates.forEach(function (d) {
            getMaintenanceVehicles(formatDateKey(d)).forEach(function (vid) {
                allMaintVehicleSet[vid] = true;
            });
        });
        var maintTotal = Object.keys(allMaintVehicleSet).length;

        {
            var mGroupName = el('div', 'md-ws-group-name md-ws-maint-group-header' + (isMaintCollapsed ? ' md-ws-collapsed' : ''));
            mGroupName.style.gridRow = currentRow;
            mGroupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span class="md-ws-maint-badge">\u4fee</span>' +
                '<span>\u4fee\u7406/\u70b9\u691c' + (maintTotal > 0 ? ' ' + maintTotal + '\u53f0' : '') + '</span>';
            mGroupName.dataset.groupId = maintGroupId;
            mGroupName.addEventListener('click', function () { toggleGroup(maintGroupId); });
            grid.appendChild(mGroupName);
            var mGroupDates = el('div', 'md-ws-group-dates');
            mGroupDates.style.gridRow = currentRow;
            mGroupDates.addEventListener('click', function () { toggleGroup(maintGroupId); });
            grid.appendChild(mGroupDates);
            currentRow++;

            var mNameCell = el('div', 'md-ws-name-cell md-ws-maint-name');
            mNameCell.dataset.groupId = maintGroupId;
            if (isMaintCollapsed) mNameCell.classList.add('md-ws-row-hidden');
            mNameCell.style.gridRow = currentRow;
            mNameCell.style.gridColumn = '1';
            mNameCell.textContent = '\u4fee\u7406/\u70b9\u691c';
            grid.appendChild(mNameCell);

            dates.forEach(function (d, di) {
                var dk = formatDateKey(d);
                var maintVehicles = getMaintenanceVehicles(dk);
                var isPast = d < today;

                ['day', 'night'].forEach(function (shift, si) {
                    var colIdx = 2 + di * 2 + si;
                    var cellCls = 'md-ws-cell md-ws-maint-row-cell';
                    if (si === 0) cellCls += ' md-ws-day-col';
                    if (si === 1) cellCls += ' md-ws-night-col';
                    if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                    if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                    if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                    if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';
                    if (isPast) cellCls += ' md-ws-past-col';

                    var cell = el('div', cellCls);
                    cell.dataset.date = dk;
                    cell.dataset.shift = shift;
                    cell.dataset.groupId = maintGroupId;
                    if (isMaintCollapsed) cell.classList.add('md-ws-row-hidden');
                    cell.style.gridRow = currentRow;
                    cell.style.gridColumn = colIdx;

                    // 昼セルのみにバッジ表示
                    if (shift === 'day') {
                        maintVehicles.forEach(function (vid) {
                            var vehicle = findVehicle(vid);
                            if (!vehicle) return;
                            var chip = el('div', 'md-ws-maint-vehicle-chip');
                            chip.textContent = vehicle.plate;
                            chip.title = vehicle.plate + ' ' + vehicle.model;

                            // 配置済みチェック
                            var assignedSites = [];
                            ['day', 'night'].forEach(function (sh) {
                                var va = vehicleAssignments[dk];
                                if (va && va[sh]) {
                                    Object.keys(va[sh]).forEach(function (sid) {
                                        if (va[sh][sid] === vid) {
                                            var s = findSite(sid);
                                            if (s) assignedSites.push(truncate(s.name, 6));
                                        }
                                    });
                                }
                            });
                            if (assignedSites.length > 0) {
                                chip.classList.add('md-ws-maint-assigned');
                                var assignInfo = el('span', 'md-ws-maint-assign-info', '\u2192 ' + assignedSites.join(', '));
                                chip.appendChild(assignInfo);
                            }

                            cell.appendChild(chip);
                        });
                    }

                    grid.appendChild(cell);
                });
            });
            currentRow++;
        }

        // --- 応援予約行（GCごとに1行、修理/点検行の下） ---
        var visibleGcForReservation = groupCompaniesData.filter(function (gc) {
            return wsGcIsVisible(gc.code);
        });
        var reservationGroupId = 'ws-support-reservation';
        var isReservationGroupCollapsed = !!collapsedGroups[reservationGroupId];
        {
            // グループヘッダー
            var rGroupName = el('div', 'md-ws-group-name md-ws-reservation-group-header' + (isReservationGroupCollapsed ? ' md-ws-collapsed' : ''));
            rGroupName.style.gridRow = currentRow;
            var totalReservedPartners = supportPartners.filter(function (p) { return p.isActive; }).length;
            rGroupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span class="md-ws-reservation-badge">\u5fdc</span>' +
                '<span>\u5fdc\u63f4\u4e88\u7d04' + (totalReservedPartners > 0 ? ' ' + totalReservedPartners + '\u793e' : '') + '</span>';
            rGroupName.dataset.groupId = reservationGroupId;
            rGroupName.addEventListener('click', function () { toggleGroup(reservationGroupId); });
            grid.appendChild(rGroupName);
            var rGroupDates = el('div', 'md-ws-group-dates');
            rGroupDates.style.gridRow = currentRow;
            rGroupDates.addEventListener('click', function () { toggleGroup(reservationGroupId); });
            grid.appendChild(rGroupDates);
            currentRow++;

            visibleGcForReservation.forEach(function (gc) {
                // 名前セル（GCラベル + ＋ボタン）
                var rNameCell = el('div', 'md-ws-name-cell md-ws-reservation-name');
                rNameCell.dataset.groupId = reservationGroupId;
                if (isReservationGroupCollapsed) rNameCell.classList.add('md-ws-row-hidden');
                rNameCell.style.gridRow = currentRow;
                rNameCell.style.gridColumn = '1';

                var nameLabel = el('span', 'md-ws-reservation-name-label', gc.shortName + ' \u5fdc\u63f4\u4e88\u7d04');
                rNameCell.appendChild(nameLabel);
                var addBtn = el('button', 'md-ws-reservation-add-btn', '\uff0b');
                addBtn.title = '\u9031\u5168\u4f53\u306e\u4e88\u7d04\u3092\u4e00\u89a7\u30fb\u7de8\u96c6';
                (function (gcCode) {
                    addBtn.addEventListener('click', function () {
                        openReservationWeekModal(gcCode);
                    });
                })(gc.code);
                rNameCell.appendChild(addBtn);
                grid.appendChild(rNameCell);

                // 日付セル（昼/夜を結合、1日=1セル×2列幅）
                dates.forEach(function (d, di) {
                    var dk = formatDateKey(d);
                    var isPast = d < today;
                    var slots = getReservationSlotsForDate(gc.code, dk);
                    var colStart = 2 + di * 2;

                    var cellCls = 'md-ws-cell md-ws-reservation-row-cell md-ws-reservation-merged';
                    if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                    if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                    if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                    if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';
                    if (isPast) cellCls += ' md-ws-past-col';

                    var cell = el('div', cellCls);
                    cell.dataset.date = dk;
                    cell.dataset.groupId = reservationGroupId;
                    cell.dataset.partnerGc = gc.code;
                    if (isReservationGroupCollapsed) cell.classList.add('md-ws-row-hidden');
                    cell.style.gridRow = currentRow;
                    cell.style.gridColumn = colStart + ' / span 2';

                    slots.forEach(function (slot) {
                        var badge = createReservationBadge(slot, dk, isPast);
                        cell.appendChild(badge);
                    });

                    // 応援予約行間D&D の受け口（同日・別GC のときに業者の gcCode を書き換え）
                    if (!isPast) {
                        cell.addEventListener('dragover', onReservationCellDragOver);
                        cell.addEventListener('dragleave', onCellDragLeave);
                        cell.addEventListener('drop', onReservationCellDrop);
                    }

                    // 日付セル内の新規予約追加ボタン（非過去日のみ）
                    if (!isPast) {
                        var cellAddBtn = el('button', 'md-ws-reserve-cell-add', '\uff0b');
                        cellAddBtn.title = '\u3053\u306e\u65e5\u306e\u4e88\u7d04\u3092\u8ffd\u52a0';
                        (function (gcCode, dateKey) {
                            cellAddBtn.addEventListener('click', function (e) {
                                e.stopPropagation();
                                openReservationQuickModal(gcCode, dateKey);
                            });
                        })(gc.code, dk);
                        cell.appendChild(cellAddBtn);
                    }

                    grid.appendChild(cell);
                });
                currentRow++;
            });
        }

        siteGroups.forEach(function (group) {
            var groupId = group.id;
            var isCollapsed = !!collapsedGroups[groupId];

            // カテゴリグループヘッダー（名前列 + 日付列）
            var groupName = el('div', 'md-ws-group-name' + (isCollapsed ? ' md-ws-collapsed' : ''));
            groupName.style.gridRow = currentRow;
            groupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span class="md-ws-category-badge md-ws-cat-' + group.category + '">' + group.categoryName + '</span>' +
                '<span>' + group.sites.length + '\u4ef6</span>';
            groupName.dataset.groupId = groupId;
            groupName.addEventListener('click', function () { toggleGroup(groupId); });
            grid.appendChild(groupName);
            var groupDates = el('div', 'md-ws-group-dates');
            groupDates.style.gridRow = currentRow;
            groupDates.addEventListener('click', function () { toggleGroup(groupId); });
            grid.appendChild(groupDates);
            currentRow++;

            // 各現場行
            group.sites.forEach(function (site) {
                // 現場名セル
                var nameCell = el('div', 'md-ws-name-cell');
                nameCell.dataset.siteId = site.id;
                nameCell.dataset.groupId = groupId;
                if (isCollapsed) nameCell.classList.add('md-ws-row-hidden');
                nameCell.style.gridRow = currentRow;
                nameCell.style.gridColumn = '1';
                nameCell.innerHTML = '<span style="flex:1;min-width:0;display:flex;flex-direction:column;"><span class="md-ws-name-client">' +
                    truncate(site.company, 14) + '</span><span class="md-ws-name-site">' +
                    truncate(site.name, 12) + '</span></span>';
                attachGcTooltip(nameCell, site.gc);
                grid.appendChild(nameCell);

                // 各日付×シフトセル
                dates.forEach(function (d, di) {
                    var dk = formatDateKey(d);
                    var isPast = d < today;

                    ['day', 'night'].forEach(function (shift, si) {
                        var colIdx = 2 + di * 2 + si;
                        var cellCls = 'md-ws-cell md-ws-clickable';
                        if (si === 0) cellCls += ' md-ws-day-col';
                        if (si === 1) cellCls += ' md-ws-night-col';
                        if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                        if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                        if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                        if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';
                        if (isPast) cellCls += ' md-ws-past-col';

                        var cell = el('div', cellCls);
                        cell.dataset.siteId = site.id;
                        cell.dataset.date = dk;
                        cell.dataset.shift = shift;
                        cell.dataset.groupId = groupId;
                        if (isCollapsed) cell.classList.add('md-ws-row-hidden');
                        cell.style.gridRow = currentRow;
                        cell.style.gridColumn = colIdx;

                        // 受注人数がないシフトはスキップ表示
                        var orders = site.orders[shift] || 0;
                        var assignedEmps = getAssignedEmployees(site.id, dk, shift);
                        var assignedSupCell = getAssignedPartnersForCell(site.id, dk, shift);
                        var totalAssigned = assignedEmps.length + assignedSupCell.length;

                        // 人数インジケーター（セル上部に表示）
                        if (orders > 0) {
                            var indicator = el('div', 'md-ws-staff-indicator');
                            if (totalAssigned < orders) {
                                indicator.classList.add('md-ws-staff-short');
                            } else if (totalAssigned > orders) {
                                indicator.classList.add('md-ws-staff-over');
                            } else {
                                indicator.classList.add('md-ws-staff-ok');
                            }
                            indicator.textContent = totalAssigned + '/' + orders;
                            cell.appendChild(indicator);
                        }

                        // 配置済み社員チップ
                        assignedEmps.forEach(function (empIdx) {
                            var emp = employeesData[empIdx];
                            if (!emp) return;
                            var chipCls = 'md-ws-emp-chip';
                            if (shift === 'night') chipCls += ' md-ws-night-chip';
                            var chip = el('div', chipCls);
                            chip.dataset.empIndex = empIdx;
                            chip.title = emp.name;

                            // 連続シフト矢印
                            var csInfo = getConsecutiveShiftInfo(empIdx, dk, shift);
                            if (csInfo.hasPrev) {
                                var arrowDown = el('span', 'md-ws-chip-arrow md-ws-chip-arrow-prev', '\u25bc');
                                chip.appendChild(arrowDown);
                            }

                            var nameSpan = document.createElement('span');
                            nameSpan.textContent = emp.name;
                            chip.appendChild(nameSpan);

                            if (csInfo.hasNext) {
                                var arrowUp = el('span', 'md-ws-chip-arrow md-ws-chip-arrow-next', '\u25b2');
                                chip.appendChild(arrowUp);
                            }

                            // 休日出勤マーク
                            if (isEmployeeOnHoliday(empIdx, dk)) {
                                chip.classList.add('md-ws-emp-holiday', 'md-ws-holiday-cursor');
                                var holidaySub = el('span', 'md-ws-holiday-sub', '\u4f11');
                                chip.appendChild(holidaySub);
                            }

                            // ×ボタン（ホバーで表示）
                            if (!isPast) {
                                var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                removeBtn.addEventListener('click', function (e) {
                                    e.stopPropagation();
                                    removeAssignment(empIdx, dk, shift, site.id);
                                    wsCnSelfNotify('schedule', 'delete', { empName: emp.name, siteName: site.name, siteId: site.id, dateKey: dk, shift: shift });
                                    renderGrid();
                                    renderSidebar();
                                });
                                chip.appendChild(removeBtn);

                                // D&D対応（社員チップを同日の別セルへ移動）
                                chip.draggable = true;
                                chip.addEventListener('dragstart', function (e) {
                                    e.dataTransfer.setData('text/plain', JSON.stringify({
                                        type: 'move-emp',
                                        empIndex: empIdx,
                                        fromSiteId: site.id,
                                        fromDate: dk,
                                        fromShift: shift
                                    }));
                                    e.dataTransfer.effectAllowed = 'move';
                                    chip.classList.add('md-ws-dragging');
                                    dragSourceDate = dk;
                                    dragEmpIndex = empIdx;
                                    activateDragMode(dk, { type: 'move-emp', shift: shift });
                                });
                                chip.addEventListener('dragend', function () {
                                    chip.classList.remove('md-ws-dragging');
                                    deactivateDragMode();
                                });
                            }
                            cell.appendChild(chip);
                        });

                        // 配置済み協力業者チップ
                        var assignedPartners = getAssignedPartnersForCell(site.id, dk, shift);
                        assignedPartners.forEach(function (a) {
                            var partner = a.partner;
                            var chipCls = 'md-ws-emp-chip md-ws-support-chip';
                            if (partner.isPreset) chipCls += ' md-ws-support-chip-preset';
                            if (shift === 'night') chipCls += ' md-ws-night-chip';
                            var chip = el('div', chipCls);
                            chip.dataset.partnerId = partner.id;
                            chip.title = partner.isPreset
                                ? '\u30af\u30ea\u30c3\u30af\u3067\u696d\u8005\u3092\u7d10\u4ed8\u3051'
                                : '\u30af\u30ea\u30c3\u30af\u3067\u5fdc\u63f4\u30d0\u30c3\u30b8\u306b\u623b\u3059 or \u524a\u9664';

                            var nameSpan = document.createElement('span');
                            nameSpan.textContent = getPartnerPlacedLabel(partner);
                            chip.appendChild(nameSpan);

                            if (!isPast) {
                                chip.style.cursor = 'pointer';
                                if (partner.isPreset) {
                                    // 統合プリセット応援: クリック→紐付けポップオーバー（全GC予約から選択）
                                    (function (pidCap, sidCap, dkCap, shCap, chipRef) {
                                        chipRef.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            showLinkPopover(chipRef, pidCap, sidCap, dkCap, shCap);
                                        });
                                    })(partner.id, site.id, dk, shift, chip);
                                } else {
                                    // 実在パートナー: クリック→アクション選択ポップオーバー
                                    (function (pidCap, sidCap, dkCap, shCap, chipRef) {
                                        chipRef.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            showPartnerChipActionPopover(chipRef, pidCap, sidCap, dkCap, shCap);
                                        });
                                    })(partner.id, site.id, dk, shift, chip);
                                }

                                // ×ボタン
                                var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                (function (pid, dkCap, shCap, sidCap) {
                                    removeBtn.addEventListener('click', function (e) {
                                        e.stopPropagation();
                                        removeSupportAssignment(pid, dkCap, shCap, sidCap);
                                        renderGrid();
                                        renderSidebar();
                                    });
                                })(partner.id, dk, shift, site.id);
                                chip.appendChild(removeBtn);

                                // D&D: 現場セル→別セル移動
                                chip.draggable = true;
                                (function (pid, sidCap, dkCap, shCap) {
                                    chip.addEventListener('dragstart', function (e) {
                                        e.dataTransfer.setData('text/plain', JSON.stringify({
                                            type: 'move-partner',
                                            partnerId: pid,
                                            fromSiteId: sidCap,
                                            fromDate: dkCap,
                                            fromShift: shCap
                                        }));
                                        e.dataTransfer.effectAllowed = partner.isPreset ? 'copy' : 'move';
                                        chip.classList.add('md-ws-dragging');
                                        dragSourceDate = dkCap;
                                        activateDragMode(dkCap, { type: 'move-partner', shift: shCap });
                                    });
                                })(partner.id, site.id, dk, shift);
                                chip.addEventListener('dragend', function () {
                                    chip.classList.remove('md-ws-dragging');
                                    deactivateDragMode();
                                });
                            }
                            cell.appendChild(chip);
                        });

                        // 車両配置ゾーン（セル下部）
                        var vZone = el('div', 'md-ws-vehicle-zone');
                        var va = vehicleAssignments[dk];
                        if (va && va[shift] && va[shift][site.id]) {
                            var vehicleId = va[shift][site.id];
                            var vehicle = findVehicle(vehicleId);
                            if (vehicle) {
                                var vChip = el('div', 'md-ws-vehicle-chip', truncate(vehicle.plate, 8));
                                vChip.title = vehicle.plate + ' ' + vehicle.model;
                                if (!isPast) {
                                    vChip.style.cursor = 'pointer';
                                    (function (vid, sid, dkk, sh) {
                                        vChip.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            removeVehicleAssignment(dkk, sh, sid);
                                            wsCnSelfNotify('schedule', 'delete', { vehicleName: wsCnGetVehicleName(vid), siteName: (findSite(sid) || {}).name, siteId: sid, dateKey: dkk, shift: sh });
                                            renderGrid();
                                            renderSidebar();
                                        });
                                    })(vehicleId, site.id, dk, shift);
                                    // 車両チップD&D（同日の別セルへ移動）
                                    vChip.draggable = true;
                                    (function (vid, sid, dkk, sh) {
                                        vChip.addEventListener('dragstart', function (e) {
                                            e.stopPropagation();
                                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                                type: 'move-vehicle',
                                                vehicleId: vid,
                                                fromSiteId: sid,
                                                fromDate: dkk,
                                                fromShift: sh
                                            }));
                                            e.dataTransfer.effectAllowed = 'move';
                                            vChip.classList.add('md-ws-dragging');
                                            dragSourceDate = dkk;
                                            activateDragMode(dkk, { type: 'move-vehicle', shift: sh });
                                        });
                                        vChip.addEventListener('dragend', function () {
                                            vChip.classList.remove('md-ws-dragging');
                                            deactivateDragMode();
                                        });
                                    })(vehicleId, site.id, dk, shift);
                                }
                                vZone.appendChild(vChip);
                            }
                        } else {
                            vZone.classList.add('md-ws-vz-empty');
                            vZone.textContent = '';
                        }
                        cell.appendChild(vZone);

                        // セルクリック（B案）
                        if (!isPast) {
                            cell.addEventListener('click', function (e) {
                                if (e.target.closest('.md-ws-emp-chip') || e.target.closest('.md-ws-vehicle-chip')) return;
                                selectCellSiteView(site.id, dk, shift);
                            });
                        }

                        // D&Dドロップ対象
                        if (!isPast) {
                            cell.addEventListener('dragover', onCellDragOver);
                            cell.addEventListener('dragleave', onCellDragLeave);
                            cell.addEventListener('drop', onCellDropSiteView);
                        }

                        grid.appendChild(cell);
                    });
                });
                currentRow++;
            });
        });

        // 選択状態の復元
        if (selectedCell) {
            applySelectionHighlight();
        }
    }

    // ==========================================================
    // 社員軸グリッド描画
    // ==========================================================

    function renderEmployeeGrid() {
        var grid = document.getElementById('wsGrid');
        if (!grid) return;

        var dates = getVisibleDates();
        var dayCount = dates.length;

        grid.style.gridTemplateColumns = '140px repeat(' + (dayCount * 2) + ', 1fr)';
        grid.innerHTML = '';
        grid.classList.remove('md-ws-selection-active', 'md-ws-drag-active');

        // --- ヘッダー行1: 日付 ---
        var corner1 = el('div', 'md-ws-corner md-ws-corner-row1', '\u793e\u54e1\u540d');
        corner1.style.gridRow = '1';
        grid.appendChild(corner1);

        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            var dow = getDaysOfWeek()[d.getDay()];
            var mm = d.getMonth() + 1;
            var dd = d.getDate();
            var isPastDate = d < today;
            var cls = 'md-ws-date-header';
            if (isPastDate) cls += ' md-ws-past';
            if (d.getDay() === 6) cls += ' md-ws-sat';
            if (d.getDay() === 0) cls += ' md-ws-sun';
            if (holidayDates[dk]) cls += ' md-ws-holiday';
            if (dk === formatDateKey(today)) cls += ' md-ws-today';
            var header = el('div', cls, mm + '/' + dd + '(' + dow + ')');
            header.style.gridColumn = 'span 2';
            header.dataset.date = dk;
            header.addEventListener('click', function () { onDateHeaderClick(dk); });
            header.style.cursor = 'pointer';
            grid.appendChild(header);
        });

        // --- ヘッダー行2: 昼/夜 ---
        var corner2 = el('div', 'md-ws-corner md-ws-corner-row2', '');
        corner2.style.gridRow = '2';
        corner2.style.fontSize = '10px';
        corner2.style.borderBottom = '2px solid var(--divider)';
        grid.appendChild(corner2);

        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            var isPastDate = d < today;
            var dayH = el('div', 'md-ws-shift-header' + (isPastDate ? ' md-ws-past' : ''), '\u663c');
            dayH.dataset.date = dk;
            dayH.dataset.shift = 'day';
            var nightH = el('div', 'md-ws-shift-header md-ws-shift-night' + (isPastDate ? ' md-ws-past' : ''), '\u591c');
            nightH.dataset.date = dk;
            nightH.dataset.shift = 'night';
            grid.appendChild(dayH);
            grid.appendChild(nightH);
        });

        // --- データ行 ---
        var groups = buildEmployeeGroups();
        var currentRow = 3;

        groups.forEach(function (group) {
            var groupId = group.id;
            var isCollapsed = !!collapsedGroups[groupId];

            var groupName = el('div', 'md-ws-group-name' + (isCollapsed ? ' md-ws-collapsed' : ''));
            groupName.style.gridRow = currentRow;
            groupName.setAttribute('title', group.gcName);
            groupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span>' + group.deptName + '</span>' +
                '<span style="font-size:10px;color:var(--text-tertiary);font-weight:400;">(' + group.employees.length + '\u540d)</span>';
            groupName.dataset.groupId = groupId;
            groupName.addEventListener('click', function () { toggleGroup(groupId); });
            grid.appendChild(groupName);
            var groupDates = el('div', 'md-ws-group-dates');
            groupDates.style.gridRow = currentRow;
            groupDates.addEventListener('click', function () { toggleGroup(groupId); });
            grid.appendChild(groupDates);
            currentRow++;

            group.employees.forEach(function (emp) {
                var gcClass = ' md-ws-gc-' + emp.company;
                var nameCell = el('div', 'md-ws-name-cell' + gcClass, emp.name);
                nameCell.dataset.empIndex = emp.index;
                nameCell.dataset.groupId = groupId;
                if (isCollapsed) nameCell.classList.add('md-ws-row-hidden');
                nameCell.style.gridRow = currentRow;
                nameCell.style.gridColumn = '1';
                grid.appendChild(nameCell);

                dates.forEach(function (d, di) {
                    var dk = formatDateKey(d);
                    var isPast = d < today;
                    var isHoliday = isEmployeeOnHoliday(emp.index, dk);

                    ['day', 'night'].forEach(function (shift, si) {
                        var colIdx = 2 + di * 2 + si;
                        var cellCls = 'md-ws-cell md-ws-clickable';
                        if (si === 0) cellCls += ' md-ws-day-col';
                        if (si === 1) cellCls += ' md-ws-night-col';
                        if (isPast) cellCls += ' md-ws-past-col md-ws-emp-past';
                        if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                        if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                        if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                        if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';

                        var cell = el('div', cellCls);
                        cell.dataset.empIndex = emp.index;
                        cell.dataset.date = dk;
                        cell.dataset.shift = shift;
                        cell.dataset.groupId = groupId;
                        if (isCollapsed) cell.classList.add('md-ws-row-hidden');
                        cell.style.gridRow = currentRow;
                        cell.style.gridColumn = colIdx;

                        if (isHoliday) {
                            var mark = el('div', 'md-ws-holiday-mark', '\u4f11');
                            cell.appendChild(mark);
                            cell.classList.add('md-ws-holiday-cell');
                        } else {
                            var empAssign = assignments[emp.index];
                            if (empAssign && empAssign[dk] && empAssign[dk][shift]) {
                                empAssign[dk][shift].forEach(function (siteId) {
                                    var site = findSite(siteId);
                                    if (!site) return;
                                    if (!wsGcIsVisible(site.gc)) return; // GCフィルタ連動
                                    var chipCls = 'md-ws-site-chip';
                                    if (shift === 'night') chipCls += ' md-ws-night-chip';
                                    if (isPast) chipCls += ' md-ws-readonly';
                                    var chip = el('div', chipCls);
                                    chip.dataset.siteId = siteId;

                                    // 連続シフト矢印
                                    var csInfo = getConsecutiveShiftInfo(emp.index, dk, shift);
                                    if (csInfo.hasPrev) {
                                        chip.appendChild(el('span', 'md-ws-chip-arrow md-ws-chip-arrow-prev', '\u25bc'));
                                    }
                                    var chipText = el('span', 'md-ws-site-chip-text');
                                    chipText.appendChild(el('span', 'md-ws-site-chip-company', truncate(abbreviateCompany(site.company), 6)));
                                    chipText.appendChild(el('span', 'md-ws-site-chip-name', truncate(site.name, 5)));
                                    chip.appendChild(chipText);
                                    if (csInfo.hasNext) {
                                        chip.appendChild(el('span', 'md-ws-chip-arrow md-ws-chip-arrow-next', '\u25b2'));
                                    }
                                    attachGcTooltip(chip, site.gc);
                                    if (!isPast) {
                                        // ×ボタン（ホバーで表示）
                                        var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                        removeBtn.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            removeAssignment(emp.index, dk, shift, siteId);
                                            wsCnSelfNotify('schedule', 'delete', { empName: emp.name, siteName: site.name, siteId: siteId, dateKey: dk, shift: shift });
                                            renderGrid();
                                            renderSidebar();
                                        });
                                        chip.appendChild(removeBtn);
                                        chip.draggable = true;
                                        chip.addEventListener('dragstart', function (e) {
                                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                                type: 'move-chip',
                                                siteId: siteId,
                                                fromEmpIndex: emp.index,
                                                fromDate: dk,
                                                fromShift: shift
                                            }));
                                            e.dataTransfer.effectAllowed = 'move';
                                            chip.classList.add('md-ws-dragging');
                                            dragSourceDate = dk;
                                            activateDragMode(dk, { type: 'move-chip', shift: shift });
                                        });
                                        chip.addEventListener('dragend', function () {
                                            chip.classList.remove('md-ws-dragging');
                                            deactivateDragMode();
                                        });
                                    }
                                    cell.appendChild(chip);
                                });
                            }
                        }

                        // セルクリック（B案）
                        if (!isPast && !isHoliday) {
                            cell.addEventListener('click', function (e) {
                                if (e.target.closest('.md-ws-site-chip')) return;
                                selectCellEmployeeView(emp.index, dk, shift);
                            });
                        }

                        // D&Dドロップ対象
                        if (!isPast && !isHoliday) {
                            cell.addEventListener('dragover', onCellDragOver);
                            cell.addEventListener('dragleave', onCellDragLeave);
                            cell.addEventListener('drop', onCellDropEmployeeView);
                        }

                        grid.appendChild(cell);
                    });
                });
                currentRow++;
            });

        });

        // --- 車両行（会社別グループ） ---
        var vehicleGroups = buildVehicleGroups();

        vehicleGroups.forEach(function (vg) {
            var vgId = vg.id;
            var isCollapsed = !!collapsedGroups[vgId];

            var vGroupName = el('div', 'md-ws-group-name md-ws-vehicle-group-header' + (isCollapsed ? ' md-ws-collapsed' : ''));
            vGroupName.style.gridRow = currentRow;
            vGroupName.setAttribute('title', vg.gcName);
            vGroupName.innerHTML =
                '<span class="md-ws-group-chevron">\u25bc</span>' +
                '<span>\u8eca\u4e21 ' + vg.vehicles.length + '\u53f0</span>';
            vGroupName.dataset.groupId = vgId;
            vGroupName.addEventListener('click', function () { toggleGroup(vgId); });
            grid.appendChild(vGroupName);
            var vGroupDates = el('div', 'md-ws-group-dates');
            vGroupDates.style.gridRow = currentRow;
            vGroupDates.addEventListener('click', function () { toggleGroup(vgId); });
            grid.appendChild(vGroupDates);
            currentRow++;

            vg.vehicles.forEach(function (vehicle) {
                var gcClass = ' md-ws-gc-' + vg.gcCode;
                var nameCell = el('div', 'md-ws-name-cell md-ws-vehicle-name-cell' + gcClass);
                nameCell.dataset.vehicleId = vehicle.id;
                nameCell.dataset.groupId = vgId;
                if (isCollapsed) nameCell.classList.add('md-ws-row-hidden');
                nameCell.style.gridRow = currentRow;
                nameCell.style.gridColumn = '1';
                nameCell.innerHTML = '<span class="md-ws-vehicle-plate">' + vehicle.plate + '</span>' +
                    '<span class="md-ws-vehicle-model-sub">' + vehicle.model + '</span>';
                grid.appendChild(nameCell);

                dates.forEach(function (d, di) {
                    var dk = formatDateKey(d);
                    var isPast = d < today;
                    var isMaint = isVehicleInMaintenance(vehicle.id, dk);

                    ['day', 'night'].forEach(function (shift, si) {
                        var colIdx = 2 + di * 2 + si;
                        var cellCls = 'md-ws-cell md-ws-vehicle-row-cell md-ws-clickable';
                        if (si === 0) cellCls += ' md-ws-day-col';
                        if (si === 1) cellCls += ' md-ws-night-col';
                        if (isPast) cellCls += ' md-ws-past-col md-ws-emp-past';
                        if (d.getDay() === 6) cellCls += ' md-ws-sat-col';
                        if (d.getDay() === 0) cellCls += ' md-ws-sun-col';
                        if (holidayDates[dk]) cellCls += ' md-ws-holiday-col';
                        if (dk === formatDateKey(today)) cellCls += ' md-ws-today-col';

                        var cell = el('div', cellCls);
                        cell.dataset.vehicleId = vehicle.id;
                        cell.dataset.date = dk;
                        cell.dataset.shift = shift;
                        cell.dataset.groupId = vgId;
                        if (isCollapsed) cell.classList.add('md-ws-row-hidden');
                        cell.style.gridRow = currentRow;
                        cell.style.gridColumn = colIdx;

                        // 修理/点検表示
                        if (isMaint && shift === 'day') {
                            var maintLabel = el('div', 'md-ws-vehicle-maint-mark', '\u4fee\u7406');
                            cell.appendChild(maintLabel);
                        }

                        // 配置先現場チップ
                        var assignedSites = getVehicleAssignedSites(vehicle.id, dk, shift);
                        assignedSites.forEach(function (siteId) {
                            var site = findSite(siteId);
                            if (!site) return;
                            var chipCls = 'md-ws-site-chip';
                            if (shift === 'night') chipCls += ' md-ws-night-chip';
                            if (isPast) chipCls += ' md-ws-readonly';
                            var chip = el('div', chipCls);
                            chip.dataset.siteId = siteId;
                            var chipText = el('span', 'md-ws-site-chip-text');
                            chipText.appendChild(el('span', 'md-ws-site-chip-company', truncate(abbreviateCompany(site.company), 6)));
                            chipText.appendChild(el('span', 'md-ws-site-chip-name', truncate(site.name, 5)));
                            chip.appendChild(chipText);
                            chip.title = site.company + ' / ' + site.name;
                            if (!isPast) {
                                var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                removeBtn.addEventListener('click', function (e) {
                                    e.stopPropagation();
                                    removeVehicleAssignment(dk, shift, siteId);
                                    wsCnSelfNotify('schedule', 'delete', { vehicleName: vehicle.plate, siteName: site.name, siteId: siteId, dateKey: dk, shift: shift });
                                    renderGrid();
                                    renderSidebar();
                                });
                                chip.appendChild(removeBtn);
                                chip.draggable = true;
                                chip.addEventListener('dragstart', function (e) {
                                    e.dataTransfer.setData('text/plain', JSON.stringify({
                                        type: 'move-vehicle-chip',
                                        siteId: siteId,
                                        fromVehicleId: vehicle.id,
                                        fromDate: dk,
                                        fromShift: shift
                                    }));
                                    e.dataTransfer.effectAllowed = 'move';
                                    chip.classList.add('md-ws-dragging');
                                    dragSourceDate = dk;
                                    activateDragMode(dk, { type: 'move-vehicle-chip', shift: shift });
                                });
                                chip.addEventListener('dragend', function () {
                                    chip.classList.remove('md-ws-dragging');
                                    deactivateDragMode();
                                });
                            }
                            cell.appendChild(chip);
                        });

                        // セルクリック
                        if (!isPast) {
                            cell.addEventListener('click', function (e) {
                                if (e.target.closest('.md-ws-site-chip')) return;
                                selectCellVehicleView(vehicle.id, dk, shift);
                            });
                        }

                        // D&Dドロップ対象
                        if (!isPast) {
                            cell.addEventListener('dragover', onCellDragOver);
                            cell.addEventListener('dragleave', onCellDragLeave);
                            cell.addEventListener('drop', onCellDropVehicleView);
                        }

                        grid.appendChild(cell);
                    });
                });
                currentRow++;
            });
        });

        if (selectedCell) {
            applySelectionHighlight();
        }
    }

    // ==========================================================
    // B案: セル選択 → サイドパネルで配置
    // ==========================================================

    function selectCellSiteView(siteId, date, shift, keepTab) {
        // 同じセルの再クリックで解除
        if (selectedCell && selectedCell.siteId === siteId &&
            selectedCell.date === date && selectedCell.shift === shift) {
            deselectCell();
            return;
        }
        selectedCell = { siteId: siteId, date: date, shift: shift };
        selectedDate = date;
        if (!keepTab) wsSidebarMainTab = 'employee';
        applySelectionHighlight();
        renderSidebar();
    }

    function selectCellEmployeeView(empIndex, date, shift, keepTab) {
        if (selectedCell && selectedCell.empIndex === empIndex &&
            selectedCell.date === date && selectedCell.shift === shift) {
            deselectCell();
            return;
        }
        // 配置モード開始時: アコーディオンをすべて展開
        siteAccordionCollapsed = {};
        selectedCell = { empIndex: empIndex, date: date, shift: shift };
        selectedDate = date;
        if (!keepTab) wsSidebarMainTab = 'employee';
        applySelectionHighlight();
        renderSidebar();
    }

    function selectCellVehicleView(vehicleId, date, shift, keepTab) {
        if (selectedCell && selectedCell.vehicleId === vehicleId &&
            selectedCell.date === date && selectedCell.shift === shift) {
            deselectCell();
            return;
        }
        siteAccordionCollapsed = {};
        selectedCell = { vehicleId: vehicleId, date: date, shift: shift };
        selectedDate = date;
        if (!keepTab) wsSidebarMainTab = 'site';
        applySelectionHighlight();
        renderSidebar();
    }

    function deselectCell() {
        selectedCell = null;
        wsSidebarMainTab = 'employee';
        removeSelectionHighlight();
        renderSidebar();
    }

    function applySelectionHighlight() {
        var grid = document.getElementById('wsGrid');
        if (!grid || !selectedCell) return;

        grid.classList.add('md-ws-selection-active');

        // 全セルからハイライトクラス除去
        grid.querySelectorAll('.md-ws-col-highlighted, .md-ws-cell-selected, .md-ws-name-selected').forEach(function (el) {
            el.classList.remove('md-ws-col-highlighted', 'md-ws-cell-selected', 'md-ws-name-selected');
        });

        var targetDate = selectedCell.date;

        // 該当日の全セル・ヘッダーをハイライト
        grid.querySelectorAll('[data-date="' + targetDate + '"]').forEach(function (el) {
            el.classList.add('md-ws-col-highlighted');
        });

        // 選択セルの強調
        var selector;
        if (viewMode === 'site') {
            selector = '.md-ws-cell[data-site-id="' + selectedCell.siteId +
                '"][data-date="' + targetDate +
                '"][data-shift="' + selectedCell.shift + '"]';
        } else if (selectedCell.vehicleId) {
            selector = '.md-ws-cell[data-vehicle-id="' + selectedCell.vehicleId +
                '"][data-date="' + targetDate +
                '"][data-shift="' + selectedCell.shift + '"]';
        } else {
            selector = '.md-ws-cell[data-emp-index="' + selectedCell.empIndex +
                '"][data-date="' + targetDate +
                '"][data-shift="' + selectedCell.shift + '"]';
        }
        var targetCell = grid.querySelector(selector);
        if (targetCell) {
            targetCell.classList.add('md-ws-cell-selected');
        }

        // 選択行のヘッダーセル（名前セル）をハイライト
        var nameSelector;
        if (viewMode === 'site') {
            nameSelector = '.md-ws-name-cell[data-site-id="' + selectedCell.siteId + '"]';
        } else if (selectedCell.vehicleId) {
            nameSelector = '.md-ws-vehicle-name-cell[data-vehicle-id="' + selectedCell.vehicleId + '"]';
        } else {
            nameSelector = '.md-ws-name-cell[data-emp-index="' + selectedCell.empIndex + '"]';
        }
        var nameCell = grid.querySelector(nameSelector);
        if (nameCell) {
            nameCell.classList.add('md-ws-name-selected');
        }
    }

    function removeSelectionHighlight() {
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        grid.classList.remove('md-ws-selection-active');
        grid.querySelectorAll('.md-ws-col-highlighted, .md-ws-cell-selected, .md-ws-name-selected').forEach(function (el) {
            el.classList.remove('md-ws-col-highlighted', 'md-ws-cell-selected', 'md-ws-name-selected');
        });
    }

    // ==========================================================
    // D&D: カラムハイライト+グレーアウト
    // ==========================================================

    function activateDragMode(dateKey, opts) {
        dragActive = true;
        dragTargetDate = dateKey;
        if (opts) {
            dragSourceShift = opts.shift || null;
            dragSourceType = opts.type || null;
        }
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        grid.classList.add('md-ws-drag-active');
        grid.querySelectorAll('[data-date="' + dateKey + '"]').forEach(function (el) {
            el.classList.add('md-ws-col-highlighted');
        });
        // 移動D&D（別日は同シフトのみ）: 違反対象セルを事前に無効化表示
        if (dragSourceType && dragSourceType.indexOf('move-') === 0 && dragSourceShift) {
            grid.querySelectorAll('.md-ws-cell[data-site-id][data-shift]').forEach(function (cell) {
                var cellDate = cell.dataset.date;
                var cellShift = cell.dataset.shift;
                if (cellDate !== dateKey && cellShift !== dragSourceShift) {
                    cell.classList.add('md-ws-drag-invalid');
                }
            });
        }
    }

    function deactivateDragMode() {
        dragActive = false;
        dragTargetDate = null;
        dragSourceDate = null;
        dragSourceShift = null;
        dragSourceType = null;
        dragSourcePartnerGc = null;
        dragEmpIndex = null;
        hideHolidayFloat();
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        grid.classList.remove('md-ws-drag-active');
        grid.querySelectorAll('.md-ws-col-highlighted, .md-ws-drag-invalid, .md-ws-drag-over').forEach(function (el) {
            el.classList.remove('md-ws-col-highlighted', 'md-ws-drag-invalid', 'md-ws-drag-over');
        });
    }

    // --- ドラッグ中「休み」フロート ---
    var holidayFloat = null;

    function showHolidayFloat(x, y) {
        if (!holidayFloat) {
            holidayFloat = document.createElement('div');
            holidayFloat.className = 'md-ws-holiday-drag-float';
            holidayFloat.textContent = '\u4f11\u307f';
            document.body.appendChild(holidayFloat);
        }
        holidayFloat.style.left = (x + 14) + 'px';
        holidayFloat.style.top = (y + 14) + 'px';
        holidayFloat.style.display = '';
    }

    function hideHolidayFloat() {
        if (holidayFloat) {
            holidayFloat.style.display = 'none';
        }
    }

    // ==========================================================
    // 笑い男カスタムドラッグ（休みチップ専用・mouseベース）
    // ネイティブD&Dではブラウザがカーソルを制御するため、
    // mouse イベントで独自実装しカーソルを完全制御する
    // ==========================================================
    var lmTimer = null;
    var lmFloat = null;
    var lmActive = false;
    var lmDragData = null;

    function lmStartCustomDrag(e, chipEl, empIndex, dateKey) {
        e.preventDefault();
        lmEndDrag();

        lmDragData = { empIndex: empIndex, dateKey: dateKey, chipEl: chipEl };
        chipEl.style.opacity = '0.5';

        // チップクローンのフローティング要素
        lmFloat = document.createElement('div');
        lmFloat.className = 'md-ws-drag-float';
        var clone = chipEl.cloneNode(true);
        clone.style.opacity = '1';
        clone.classList.remove('md-ws-holiday-assigned');
        lmFloat.appendChild(clone);
        document.body.appendChild(lmFloat);
        lmUpdatePos(e.clientX, e.clientY);

        // カラムハイライト
        activateDragMode(dateKey);

        // 1秒後に笑い男に変身
        lmTimer = setTimeout(function () {
            if (!lmFloat) return;
            lmFloat.innerHTML = '';
            lmFloat.classList.add('md-ws-drag-float-lm');
            var img = document.createElement('img');
            img.src = 'image/laughing_man.svg';
            img.style.cssText = 'width:64px;height:64px;display:block;';
            lmFloat.appendChild(img);
            lmActive = true;
            // カーソル非表示（mouseベースなので確実に効く）
            document.documentElement.classList.add('md-ws-lm-active');
        }, 2000);

        document.addEventListener('mousemove', lmOnMouseMove);
        document.addEventListener('mouseup', lmOnMouseUp);
    }

    function lmOnMouseMove(e) {
        lmUpdatePos(e.clientX, e.clientY);

        // ドロップ先ハイライト
        document.querySelectorAll('.md-ws-cell.md-ws-drag-over').forEach(function (c) {
            c.classList.remove('md-ws-drag-over');
        });
        var target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
            var cell = target.closest('.md-ws-cell[data-site-id]');
            if (cell && !cell.classList.contains('md-ws-past-col')) {
                // 休みチェック：禁止カーソル切替
                var cellDateLm = cell.dataset.date;
                if (lmDragData && cellDateLm && isEmployeeOnHoliday(lmDragData.empIndex, cellDateLm)) {
                    if (lmFloat) lmFloat.classList.add('md-ws-holiday-cursor');
                    showHolidayFloat(e.clientX, e.clientY);
                } else {
                    cell.classList.add('md-ws-drag-over');
                    if (lmFloat) lmFloat.classList.remove('md-ws-holiday-cursor');
                    hideHolidayFloat();
                }
                // カラムハイライト追従
                if (cellDateLm && cellDateLm !== dragTargetDate) {
                    var grid = document.getElementById('wsGrid');
                    if (grid) {
                        grid.querySelectorAll('.md-ws-col-highlighted').forEach(function (el) {
                            el.classList.remove('md-ws-col-highlighted');
                        });
                        grid.querySelectorAll('[data-date="' + cellDateLm + '"]').forEach(function (el) {
                            el.classList.add('md-ws-col-highlighted');
                        });
                        dragTargetDate = cellDateLm;
                    }
                }
            }
        }
    }

    function lmOnMouseUp(e) {
        document.removeEventListener('mousemove', lmOnMouseMove);
        document.removeEventListener('mouseup', lmOnMouseUp);

        // ドロップ先を判定（lmFloatはpointer-events:noneなので透過）
        var target = document.elementFromPoint(e.clientX, e.clientY);
        var dropped = false;
        if (target && lmDragData) {
            var cell = target.closest('.md-ws-cell[data-site-id]');
            if (cell && !cell.classList.contains('md-ws-past-col')) {
                var siteId = cell.dataset.siteId;
                var date = cell.dataset.date;
                var shift = cell.dataset.shift;
                if (siteId && date && shift) {
                    addAssignment(lmDragData.empIndex, date, shift, siteId);
                    wsCnSelfNotify('schedule', 'add', { empName: wsCnGetEmpName(lmDragData.empIndex), siteName: (findSite(siteId) || {}).name, shift: shift, siteId: siteId, dateKey: date });
                    dropped = true;
                }
            }
        }

        // ハイライト除去
        document.querySelectorAll('.md-ws-cell.md-ws-drag-over').forEach(function (c) {
            c.classList.remove('md-ws-drag-over');
        });

        lmEndDrag();
        deactivateDragMode();
        if (dropped) {
            renderGrid();
            renderSidebar();
        }
    }

    function lmEndDrag() {
        if (lmTimer) { clearTimeout(lmTimer); lmTimer = null; }
        if (lmFloat) { lmFloat.remove(); lmFloat = null; }
        if (lmDragData && lmDragData.chipEl) {
            lmDragData.chipEl.style.opacity = '';
        }
        lmActive = false;
        lmDragData = null;
        document.documentElement.classList.remove('md-ws-lm-active');
    }

    function lmUpdatePos(x, y) {
        if (!lmFloat) return;
        if (lmActive) {
            lmFloat.style.left = (x - 32) + 'px';
            lmFloat.style.top = (y - 32) + 'px';
        } else {
            lmFloat.style.left = (x + 12) + 'px';
            lmFloat.style.top = (y - 8) + 'px';
        }
    }

    function onCellDragOver(e) {
        var cellDate = e.currentTarget.dataset.date;
        var cellShift = e.currentTarget.dataset.shift;

        // 予約→セル: 同日限定（予約は日付固定）
        if (dragSourceType === 'reservation-partner' && dragSourceDate && cellDate !== dragSourceDate) return;

        // 移動D&D: 同日内は自由、別日は同シフトのみ
        var isMove = dragSourceType && dragSourceType.indexOf('move-') === 0;
        var crossDayShiftViolation = isMove && dragSourceDate && dragSourceShift
            && cellDate !== dragSourceDate && cellShift !== dragSourceShift;

        // 社員ドラッグ中：ドロップ先日付で休みなら「休み」フロート表示
        if (dragEmpIndex !== null && isEmployeeOnHoliday(dragEmpIndex, cellDate)) {
            showHolidayFloat(e.clientX, e.clientY);
        } else {
            hideHolidayFloat();
        }

        e.preventDefault();

        if (crossDayShiftViolation) {
            e.dataTransfer.dropEffect = 'none';
            e.currentTarget.classList.add('md-ws-drag-invalid');
            return;
        }

        e.dataTransfer.dropEffect = (dragSourceType && dragSourceType.indexOf('move-') === 0) ? 'move' : 'copy';
        e.currentTarget.classList.add('md-ws-drag-over');

        // ドラッグ先の日付カラムをハイライト更新（サイドバー起点のみ）
        if (!dragSourceDate && cellDate && cellDate !== dragTargetDate) {
            var grid = document.getElementById('wsGrid');
            if (grid) {
                grid.querySelectorAll('.md-ws-col-highlighted').forEach(function (el) {
                    el.classList.remove('md-ws-col-highlighted');
                });
                grid.querySelectorAll('[data-date="' + cellDate + '"]').forEach(function (el) {
                    el.classList.add('md-ws-col-highlighted');
                });
                dragTargetDate = cellDate;
            }
        }
    }

    function onCellDragLeave(e) {
        e.currentTarget.classList.remove('md-ws-drag-over');
        hideHolidayFloat();
    }

    /** 移動D&Dの同シフト制限を検証し、違反ならトースト表示 */
    function validateMoveShift(data, date, shift) {
        if (!data || typeof data.type !== 'string' || data.type.indexOf('move-') !== 0) return true;
        if (!data.fromDate || !data.fromShift) return true;
        if (data.fromDate === date) return true; // 同日は自由
        if (data.fromShift === shift) return true; // 別日＋同シフトOK
        showToast('\u5225\u65e5\u306f\u540c\u30b7\u30d5\u30c8\u306e\u307f\u79fb\u52d5\u53ef\u80fd\u3067\u3059');
        return false;
    }

    // 現場軸ビュー用ドロップ
    function onCellDropSiteView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over', 'md-ws-drag-invalid');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var siteId = cell.dataset.siteId;
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (!validateMoveShift(data, date, shift)) {
            deactivateDragMode();
            return;
        }

        var siteName = wsCnGetSiteLabel(siteId);
        var dayStr = wsCnGetDayLabel(date);

        if (data.type === 'sidebar-emp') {
            addAssignment(data.empIndex, date, shift, siteId);
            wsCnSelfNotify('schedule', 'add', {
                empName: wsCnGetEmpName(data.empIndex),
                siteName: siteName, day: dayStr, shift: shift,
                siteId: siteId, dateKey: date
            });
        } else if (data.type === 'move-emp') {
            removeAssignment(data.empIndex, data.fromDate, data.fromShift, data.fromSiteId);
            addAssignment(data.empIndex, date, shift, siteId);
            wsCnSelfNotify('schedule', 'modify', {
                empName: wsCnGetEmpName(data.empIndex),
                srcSite: wsCnGetSiteLabel(data.fromSiteId),
                srcDay: wsCnGetDayLabel(data.fromDate), srcShift: data.fromShift,
                dstSite: siteName, dstDay: dayStr, dstShift: shift,
                siteId: siteId, dateKey: date
            });
        } else if (data.type === 'reservation-partner') {
            // 予約行 → 現場セル（配置）。残0時は超過配置を防ぐためトーストで拒否
            if (getRemainingCount(data.partnerId, date) <= 0) {
                showToast('予約残が0のため配置できません');
            } else {
                addSupportAssignment(data.partnerId, date, shift, siteId);
                wsCnSelfNotify('schedule', 'add', {
                    empName: wsCnGetPartnerName(data.partnerId) + '（応援）',
                    siteName: siteName, day: dayStr, shift: shift,
                    siteId: siteId, dateKey: date
                });
            }
        } else if (data.type === 'sidebar-support') {
            // サイドバー（プリセット応援 or 実在パートナー） → 現場セル
            addSupportAssignment(data.partnerId, date, shift, siteId);
            wsCnSelfNotify('schedule', 'add', {
                empName: wsCnGetPartnerName(data.partnerId) + '（応援）',
                siteName: siteName, day: dayStr, shift: shift,
                siteId: siteId, dateKey: date
            });
        } else if (data.type === 'move-partner') {
            // 現場セル → 現場セル（移動）
            removeSupportAssignment(data.partnerId, data.fromDate, data.fromShift, data.fromSiteId);
            addSupportAssignment(data.partnerId, date, shift, siteId);
            wsCnSelfNotify('schedule', 'modify', {
                empName: wsCnGetPartnerName(data.partnerId) + '（応援）',
                srcSite: wsCnGetSiteLabel(data.fromSiteId),
                srcDay: wsCnGetDayLabel(data.fromDate), srcShift: data.fromShift,
                dstSite: siteName, dstDay: dayStr, dstShift: shift,
                siteId: siteId, dateKey: date
            });
        } else if (data.type === 'sidebar-vehicle') {
            addVehicleAssignment(date, shift, siteId, data.vehicleId);
            wsCnSelfNotify('schedule', 'add', {
                vehicleName: wsCnGetVehicleName(data.vehicleId),
                siteName: siteName, day: dayStr, shift: shift,
                siteId: siteId, dateKey: date
            });
        } else if (data.type === 'move-vehicle') {
            removeVehicleAssignment(data.fromDate, data.fromShift, data.fromSiteId);
            addVehicleAssignment(date, shift, siteId, data.vehicleId);
            wsCnSelfNotify('schedule', 'modify', {
                vehicleName: wsCnGetVehicleName(data.vehicleId),
                srcSite: wsCnGetSiteLabel(data.fromSiteId),
                srcDay: wsCnGetDayLabel(data.fromDate), srcShift: data.fromShift,
                dstSite: siteName, dstDay: dayStr, dstShift: shift,
                siteId: siteId, dateKey: date
            });
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
    }

    // 社員軸ビュー用ドロップ
    function onCellDropEmployeeView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over', 'md-ws-drag-invalid');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var empIndex = parseInt(cell.dataset.empIndex);
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (!validateMoveShift(data, date, shift)) {
            deactivateDragMode();
            return;
        }

        var dayStr = wsCnGetDayLabel(date);

        if (data.type === 'sidebar-site') {
            addAssignment(empIndex, date, shift, data.siteId);
            wsCnSelfNotify('schedule', 'add', {
                empName: wsCnGetEmpName(empIndex),
                siteName: wsCnGetSiteLabel(data.siteId),
                day: dayStr, shift: shift,
                siteId: data.siteId, dateKey: date
            });
        } else if (data.type === 'move-chip') {
            removeAssignment(data.fromEmpIndex, data.fromDate, data.fromShift, data.siteId);
            addAssignment(empIndex, date, shift, data.siteId);
            wsCnSelfNotify('schedule', 'modify', {
                empName: wsCnGetEmpName(empIndex),
                srcSite: wsCnGetSiteLabel(data.siteId),
                srcDay: wsCnGetDayLabel(data.fromDate), srcShift: data.fromShift,
                dstSite: wsCnGetSiteLabel(data.siteId),
                dstDay: dayStr, dstShift: shift,
                siteId: data.siteId, dateKey: date
            });
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
    }

    // 車両セル用ドロップ
    function onCellDropVehicleView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over', 'md-ws-drag-invalid');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var vehicleId = cell.dataset.vehicleId;
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (!validateMoveShift(data, date, shift)) {
            deactivateDragMode();
            return;
        }

        var dayStr = wsCnGetDayLabel(date);

        if (data.type === 'sidebar-site') {
            addVehicleAssignment(date, shift, data.siteId, vehicleId);
            wsCnSelfNotify('schedule', 'add', {
                vehicleName: wsCnGetVehicleName(vehicleId),
                siteName: wsCnGetSiteLabel(data.siteId),
                day: dayStr, shift: shift,
                siteId: data.siteId, dateKey: date
            });
        } else if (data.type === 'move-vehicle-chip') {
            removeVehicleAssignment(data.fromDate, data.fromShift, data.siteId);
            addVehicleAssignment(date, shift, data.siteId, vehicleId);
            wsCnSelfNotify('schedule', 'modify', {
                vehicleName: wsCnGetVehicleName(vehicleId),
                srcSite: wsCnGetSiteLabel(data.siteId),
                srcDay: wsCnGetDayLabel(data.fromDate), srcShift: data.fromShift,
                dstSite: wsCnGetSiteLabel(data.siteId),
                dstDay: dayStr, dstShift: shift,
                siteId: data.siteId, dateKey: date
            });
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
    }

    // ----- 応援予約行間D&D -----
    // 予約行→予約行（同日・別GC）: 業者の gcCode を書き換える
    function onReservationCellDragOver(e) {
        if (dragSourceType !== 'reservation-partner') return;
        var cell = e.currentTarget;
        var cellDate = cell.dataset.date;
        // 同日のみ受け入れ
        if (dragSourceDate && cellDate !== dragSourceDate) return;
        // 同GCドロップは無効
        var targetGc = cell.dataset.partnerGc;
        if (targetGc === dragSourcePartnerGc) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        cell.classList.add('md-ws-drag-over');
    }

    function onReservationCellDrop(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over', 'md-ws-drag-invalid');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) { deactivateDragMode(); return; }
        var data;
        try { data = JSON.parse(raw); } catch (_) { deactivateDragMode(); return; }
        if (data.type !== 'reservation-partner') { deactivateDragMode(); return; }

        var cellDate = cell.dataset.date;
        var newGcCode = cell.dataset.partnerGc;
        if (dragSourceDate && cellDate !== dragSourceDate) { deactivateDragMode(); return; }

        var partner = findPartner(data.partnerId);
        if (partner && !partner.isPreset && partner.gcCode !== newGcCode) {
            var oldGc = partner.gcCode;
            partner.gcCode = newGcCode;
            wsCnSelfNotify('reservation', 'modify', {
                partnerName: partner.shortName,
                day: wsCnGetDayLabel(cellDate),
                diffs: [{ field: '所属GC', oldVal: oldGc, newVal: newGcCode }]
            });
            renderGrid();
            renderSidebar();
        }
        deactivateDragMode();
    }

    // トースト表示（簡易・自動消失）
    function showToast(message, opts) {
        opts = opts || {};
        var duration = opts.duration || 2400;
        var wrap = document.getElementById('wsToastWrap');
        if (!wrap) {
            wrap = el('div', 'md-ws-toast-wrap');
            wrap.id = 'wsToastWrap';
            document.body.appendChild(wrap);
        }
        var toast = el('div', 'md-ws-toast', message);
        wrap.appendChild(toast);
        setTimeout(function () { toast.classList.add('md-ws-toast-show'); }, 10);
        setTimeout(function () {
            toast.classList.remove('md-ws-toast-show');
            setTimeout(function () { toast.remove(); }, 260);
        }, duration);
    }

    // ==========================================================
    // サイドバー描画
    // ==========================================================

    function renderSidebar() {
        if (viewMode === 'site') {
            renderSidebarSiteMode();
        } else {
            if (selectedCell) {
                if (selectedCell.vehicleId) {
                    renderSidebarAssignSiteForVehicle();
                } else {
                    renderSidebarAssignSite();
                }
            } else {
                renderSidebarEmployeeMode();
            }
        }
    }

    // --- 社員軸ビュー統合サイドバー（メインタブ対応） ---
    function renderSidebarEmployeeMode() {
        var sidebar = document.querySelector('.md-ws-sidebar');
        if (!sidebar) return;
        sidebar.innerHTML = '';

        var header = el('div', 'md-ws-sidebar-header');
        header.innerHTML = '<span class="md-ws-employee-count" id="wsEmpCount"></span>';
        sidebar.appendChild(header);

        // メインタブ（社員/車両/現場）
        var mainTabs = el('div', 'md-ws-main-tabs');
        var empTab = el('div', 'md-ws-main-tab' + (wsSidebarMainTab === 'employee' ? ' active' : ''));
        empTab.textContent = '\u793e\u54e1';
        empTab.dataset.mainTab = 'employee';
        empTab.addEventListener('click', function () { wsSwitchMainTab('employee'); });
        var vehTab = el('div', 'md-ws-main-tab' + (wsSidebarMainTab === 'vehicle' ? ' active' : ''));
        vehTab.textContent = '\u8eca\u4e21';
        vehTab.dataset.mainTab = 'vehicle';
        vehTab.addEventListener('click', function () { wsSwitchMainTab('vehicle'); });
        mainTabs.appendChild(empTab);
        mainTabs.appendChild(vehTab);
        var siteTab = el('div', 'md-ws-main-tab' + (wsSidebarMainTab === 'site' ? ' active' : ''));
        siteTab.textContent = '\u73fe\u5834';
        siteTab.dataset.mainTab = 'site';
        siteTab.addEventListener('click', function () { wsSwitchMainTab('site'); });
        mainTabs.appendChild(siteTab);
        sidebar.appendChild(mainTabs);

        // タブ別コンテンツ
        if (wsSidebarMainTab === 'site') {
            renderSiteOverviewContent(sidebar);
        } else if (wsSidebarMainTab === 'employee') {
            renderEmployeeOverviewContent(sidebar);
        } else {
            renderVehicleOverviewContentEmpView(sidebar);
        }
    }

    // --- 現場軸ビュー統合サイドバー（メインタブ対応） ---
    function renderSidebarSiteMode() {
        var sidebar = document.querySelector('.md-ws-sidebar');
        if (!sidebar) return;
        sidebar.innerHTML = '';

        // ヘッダー（選択状態で分岐）
        if (selectedCell) {
            var sc = selectedCell;
            var site = findSite(sc.siteId);
            var d = parseDate(sc.date);
            var mm = d.getMonth() + 1;
            var dd = d.getDate();
            var dow = getDaysOfWeek()[d.getDay()];
            var shiftLabel = sc.shift === 'day' ? '\u663c' : '\u591c';

            var header = el('div', 'md-ws-sidebar-assign-header');
            header.innerHTML = '\u914d\u7f6e\u30e2\u30fc\u30c9';
            var closeBtn = el('button', 'md-ws-assign-close', '\u00d7');
            closeBtn.addEventListener('click', function () { deselectCell(); });
            header.appendChild(closeBtn);
            sidebar.appendChild(header);

            var info = el('div', 'md-ws-sidebar-assign-info');

            var navRow = el('div', 'md-ws-assign-nav');

            var prevBtn = el('button', 'md-ws-assign-nav-btn', '\u25c0');
            prevBtn.title = '\u524d\u65e5\u3078';
            prevBtn.addEventListener('click', function () {
                var prev = parseDate(sc.date);
                prev.setDate(prev.getDate() - 1);
                var prevKey = formatDateKey(prev);
                if (viewMode === 'site') {
                    selectCellSiteView(sc.siteId, prevKey, sc.shift, true);
                } else {
                    selectCellEmployeeView(sc.empIndex, prevKey, sc.shift, true);
                }
            });

            var centerBlock = el('div', 'md-ws-assign-nav-center');
            var siteLine = el('div', 'md-ws-assign-nav-site');
            siteLine.innerHTML = '<strong>' + (site ? site.company + ' / ' + site.name : '') + '</strong>';
            var dateLine = el('div', 'md-ws-assign-nav-date');
            dateLine.textContent = mm + '/' + dd + '(' + dow + ') ' + shiftLabel +
                (site ? ' \u2014 \u53d7\u6ce8: ' + (site.orders[sc.shift] || 0) + '\u540d' : '');
            centerBlock.appendChild(siteLine);
            centerBlock.appendChild(dateLine);

            var nextBtn = el('button', 'md-ws-assign-nav-btn', '\u25b6');
            nextBtn.title = '\u7fcc\u65e5\u3078';
            nextBtn.addEventListener('click', function () {
                var next = parseDate(sc.date);
                next.setDate(next.getDate() + 1);
                var nextKey = formatDateKey(next);
                if (viewMode === 'site') {
                    selectCellSiteView(sc.siteId, nextKey, sc.shift, true);
                } else {
                    selectCellEmployeeView(sc.empIndex, nextKey, sc.shift, true);
                }
            });

            navRow.appendChild(prevBtn);
            navRow.appendChild(nextBtn);
            navRow.appendChild(centerBlock);

            info.appendChild(navRow);
            sidebar.appendChild(info);
        } else {
            var header2 = el('div', 'md-ws-sidebar-header');
            header2.innerHTML =
                '<span class="md-ws-employee-count" id="wsEmpCount"></span>';
            sidebar.appendChild(header2);
        }

        // 現場軸では現場タブなし → siteならemployeeにフォールバック
        if (wsSidebarMainTab === 'site') wsSidebarMainTab = 'employee';

        // メインタブ（社員/車両）
        var mainTabs = el('div', 'md-ws-main-tabs');
        var empTab = el('div', 'md-ws-main-tab' + (wsSidebarMainTab === 'employee' ? ' active' : ''));
        empTab.innerHTML = '\u793e\u54e1';
        empTab.dataset.mainTab = 'employee';
        empTab.addEventListener('click', function () { wsSwitchMainTab('employee'); });
        var vehTab = el('div', 'md-ws-main-tab' + (wsSidebarMainTab === 'vehicle' ? ' active' : ''));
        vehTab.innerHTML = '\u8eca\u4e21';
        vehTab.dataset.mainTab = 'vehicle';
        vehTab.addEventListener('click', function () { wsSwitchMainTab('vehicle'); });
        mainTabs.appendChild(empTab);
        mainTabs.appendChild(vehTab);
        sidebar.appendChild(mainTabs);

        // タブ別コンテンツ
        if (wsSidebarMainTab === 'employee') {
            if (selectedCell) {
                renderAssignEmployeeContent(sidebar);
            } else {
                renderEmployeeOverviewContent(sidebar);
            }
        } else {
            if (selectedCell) {
                renderVehicleCandidatesContent(sidebar);
            } else {
                renderVehicleOverviewContent(sidebar);
            }
        }
    }

    function wsSwitchMainTab(tab) {
        wsSidebarMainTab = tab;
        renderSidebar();
    }

    // --- 社員候補リスト（配置モード・コンテンツのみ） ---
    function renderAssignEmployeeContent(sidebar) {
        var sc = selectedCell;
        var currentAssigned = getAssignedEmployees(sc.siteId, sc.date, sc.shift);

        // パネル（縦タブ + バッジコンテンツ）— 通常モードと同じ構成
        var panel = el('div', 'md-ws-sidebar-panel');

        // --- 縦タブ列 ---
        var vtabs = el('div', 'md-ws-vtabs');

        // GCフィルタ連動：非表示会社のタブが選択中なら「すべて」にフォールバック
        var visibleCompanies = groupCompaniesData.filter(function (gc) {
            return wsGcIsVisible(gc.code);
        });
        if (wsEmpTab.activeTab !== 'all') {
            var tabInVisible = false;
            visibleCompanies.forEach(function (gc) {
                var units = orgUnitsData[gc.code] || [];
                var ids = wsGetDescendantIds(units, wsEmpTab.activeTab);
                if (ids.length > 0) tabInVisible = true;
            });
            if (!tabInVisible) wsEmpTab.activeTab = 'all';
        }

        var allTab = el('div', 'md-ws-vtab' + (wsEmpTab.activeTab === 'all' ? ' active' : ''), '\u3059\u3079\u3066');
        allTab.setAttribute('data-ws-tab', 'all');
        allTab.addEventListener('click', function () { wsSelectTab('all'); });
        vtabs.appendChild(allTab);

        visibleCompanies.forEach(function (gc) {
            var units = orgUnitsData[gc.code] || [];
            var isExpanded = wsEmpTab.expandedCompanies.has(gc.code);

            var gcHeader = el('div', 'md-ws-gc-header' + (isExpanded ? ' expanded' : ''));
            gcHeader.setAttribute('data-ws-gc', gc.code);
            gcHeader.setAttribute('title', gc.shortName);
            gcHeader.addEventListener('click', function () { wsToggleCompany(gc.code); });
            vtabs.appendChild(gcHeader);

            var deptGroup = el('div', 'md-ws-dept-group' + (isExpanded ? ' expanded' : ''));
            deptGroup.setAttribute('data-ws-gc-group', gc.code);

            function renderOrgTabs(nodes, indent) {
                nodes.forEach(function (node) {
                    var label = (indent > 0 ? '\u3000'.repeat(indent) : '') + node.name;
                    var hasChildren = node.children && node.children.length > 0;
                    var cssClass = 'md-ws-vtab' + (wsEmpTab.activeTab === node.id ? ' active' : '')
                        + (hasChildren ? ' md-ws-org-parent' : '');
                    var tab = el('div', cssClass, label);
                    tab.setAttribute('data-ws-tab', node.id);
                    tab.setAttribute('data-org-depth', String(node.depth));
                    tab.addEventListener('click', function () { wsSelectTab(node.id); });
                    deptGroup.appendChild(tab);
                    if (hasChildren) renderOrgTabs(node.children, indent + 1);
                });
            }
            renderOrgTabs(units, 0);
            vtabs.appendChild(deptGroup);
        });

        panel.appendChild(vtabs);

        // --- バッジコンテンツエリア（配置モード：flex-wrap） ---
        var content = el('div', 'md-ws-badge-content md-ws-badge-assign');

        // フィルタリング
        var allEmps = employeesData.map(function (emp, idx) {
            return { index: idx, name: emp.name, company: emp.company, dept: emp.dept };
        });

        var filtered = allEmps;
        if (wsEmpTab.activeTab !== 'all') {
            var matchIds = [];
            Object.keys(orgUnitsData).forEach(function (gc) {
                matchIds = matchIds.concat(wsGetDescendantIds(orgUnitsData[gc], wsEmpTab.activeTab));
            });
            filtered = filtered.filter(function (emp) {
                return matchIds.indexOf(emp.dept) >= 0;
            });
        }

        var currentAssignedCell = getAssignedPartnersForCell(sc.siteId, sc.date, sc.shift);

        if (wsEmpTab.activeTab === 'all') {
            visibleCompanies.forEach(function (gc) {
                var companyEmps = filtered.filter(function (emp) { return emp.company === gc.code; });
                var supportCount = getActivePartners(gc.code).length;
                if (companyEmps.length === 0 && supportCount === 0) return;
                var sectionLabel = el('div', 'md-ws-gc-section-label', gc.shortName);
                content.appendChild(sectionLabel);
                companyEmps.forEach(function (emp) {
                    content.appendChild(createAssignEmpBadge(emp, sc, currentAssigned));
                });
            });
        } else {
            filtered.forEach(function (emp) {
                content.appendChild(createAssignEmpBadge(emp, sc, currentAssigned));
            });
        }

        // 統合「応援」セクション（GC問わず1個・全モード共通で末尾に表示）
        appendUnifiedSupportSection(content, function (p) {
            return createAssignSupportBadge(p, sc, currentAssignedCell);
        });

        panel.appendChild(content);
        sidebar.appendChild(panel);

        // カウント更新
        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            var total = employeesData.length;
            countEl.textContent = wsEmpTab.activeTab === 'all'
                ? '\u5168' + total + '\u540d'
                : filtered.length + '/' + total + '\u540d';
        }
    }

    // 配置モード用社員バッジ生成
    function createAssignEmpBadge(emp, sc, currentAssigned) {
        var tag = el('span', 'md-ws-emp-tag');
        var nameSpan = el('span', 'md-ws-emp-name', emp.name);
        tag.appendChild(nameSpan);

        var isOnHoliday = isEmployeeOnHoliday(emp.index, sc.date);
        var isBusy = isEmployeeBusy(emp.index, sc.date, sc.shift);
        var isAlreadyHere = currentAssigned.indexOf(emp.index) >= 0;

        if (isAlreadyHere) {
            tag.classList.add('md-ws-tag-assigned');
            tag.title = '\u30af\u30ea\u30c3\u30af\u3067\u914d\u7f6e\u89e3\u9664';
            tag.addEventListener('click', function () {
                removeAssignment(emp.index, sc.date, sc.shift, sc.siteId);
                wsCnSelfNotify('schedule', 'delete', { empName: emp.name, siteName: (findSite(sc.siteId) || {}).name, siteId: sc.siteId, dateKey: sc.date, shift: sc.shift });
                renderGrid();
                renderSidebar();
            });
        } else if (isOnHoliday) {
            tag.classList.add('md-ws-tag-holiday');
        } else if (isBusy) {
            tag.classList.add('md-ws-tag-busy');
            var busySites = getAssignedSites(emp.index, sc.date, sc.shift);
            var busySiteNames = busySites.map(function (sid) {
                var s = findSite(sid);
                return s ? s.name : sid;
            });
            tag.title = '\u4ed6\u73fe\u5834: ' + busySiteNames.join(', ') + '\uff08\u30af\u30ea\u30c3\u30af\u3067\u79fb\u52d5\uff09';
            tag.addEventListener('click', function () {
                busySites.forEach(function (sid) {
                    removeAssignment(emp.index, sc.date, sc.shift, sid);
                });
                addAssignment(emp.index, sc.date, sc.shift, sc.siteId);
                wsCnSelfNotify('schedule', 'modify', { empName: emp.name, siteName: (findSite(sc.siteId) || {}).name, shift: sc.shift, siteId: sc.siteId, dateKey: sc.date, srcSite: busySites.length ? ((findSite(busySites[0]) || {}).name || '') : '', dstSite: (findSite(sc.siteId) || {}).name || '' });
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.addEventListener('click', function () {
                addAssignment(emp.index, sc.date, sc.shift, sc.siteId);
                wsCnSelfNotify('schedule', 'add', { empName: emp.name, siteName: (findSite(sc.siteId) || {}).name, shift: sc.shift, siteId: sc.siteId, dateKey: sc.date });
                renderGrid();
                renderSidebar();
            });
        }

        // D&D対応（サイドバーからグリッドへ）
        if (!isOnHoliday && !isAlreadyHere) {
            tag.draggable = true;
            tag.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-emp',
                    empIndex: emp.index
                }));
                e.dataTransfer.effectAllowed = 'copy';
                tag.style.opacity = '0.5';
                dragEmpIndex = emp.index;
                activateDragMode(sc.date);
            });
            tag.addEventListener('dragend', function () {
                tag.style.opacity = '';
                deactivateDragMode();
            });
        }

        return tag;
    }

    // --- 車両候補リスト（配置モード・車両タブ） ---
    function renderVehicleCandidatesContent(sidebar) {
        var sc = selectedCell;
        var currentVa = vehicleAssignments[sc.date];
        var currentVehicleId = (currentVa && currentVa[sc.shift]) ? currentVa[sc.shift][sc.siteId] : null;

        var content = el('div', 'md-ws-vehicle-overview md-ws-badge-assign');

        var gcNames = { touo: '\u6771\u592e\u8b66\u5099', nikkei: 'Nikkei', zennihon: 'AJE' };
        var gcOrder = ['touo', 'nikkei', 'zennihon'];

        gcOrder.forEach(function (gc) {
            if (!wsGcIsVisible(gc)) return; // GCフィルタ連動
            var companyVehicles = wsVehiclesData.filter(function (v) { return v.owner === gc; });
            if (companyVehicles.length === 0) return;

            var sectionLabel = el('div', 'md-ws-gc-section-label', gcNames[gc] || gc);
            content.appendChild(sectionLabel);

            companyVehicles.forEach(function (v) {
                content.appendChild(createAssignVehicleBadge(v, sc, currentVa, currentVehicleId));
            });
        });

        // 車両数カウント
        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            countEl.textContent = '\u5168' + wsVehiclesData.length + '\u53f0';
        }

        sidebar.appendChild(content);
    }

    // 配置モード用車両バッジ生成
    function createAssignVehicleBadge(v, sc, currentVa, currentVehicleId) {
        var tag = el('span', 'md-ws-vehicle-tag');
        var infoRow = el('span', 'md-ws-vehicle-info');
        infoRow.appendChild(document.createTextNode(v.plate + ' '));
        infoRow.appendChild(el('span', 'md-ws-vt-model', v.model));
        tag.appendChild(infoRow);

        var isAssignedHere = currentVehicleId === v.id;
        var inMaint = isVehicleInMaintenance(v.id, sc.date);

        var busySiteId = null;
        if (currentVa && currentVa[sc.shift]) {
            Object.keys(currentVa[sc.shift]).forEach(function (sid) {
                if (currentVa[sc.shift][sid] === v.id && sid !== sc.siteId) {
                    busySiteId = sid;
                }
            });
        }

        // 修理/点検中は警告スタイル（配置は可能）
        if (inMaint) {
            tag.classList.add('md-ws-tag-maintenance');
        }

        if (isAssignedHere) {
            tag.classList.add('md-ws-tag-assigned');
            tag.title = (inMaint ? '\u26a0 \u4fee\u7406/\u70b9\u691c\u4e2d \u2014 ' : '') + '\u30af\u30ea\u30c3\u30af\u3067\u89e3\u9664';
            tag.addEventListener('click', function () {
                removeVehicleAssignment(sc.date, sc.shift, sc.siteId);
                wsCnSelfNotify('schedule', 'delete', { vehicleName: v.plate, siteName: (findSite(sc.siteId) || {}).name, siteId: sc.siteId, dateKey: sc.date, shift: sc.shift });
                renderGrid();
                renderSidebar();
            });
        } else if (busySiteId) {
            tag.classList.add('md-ws-tag-busy');
            var busySite = findSite(busySiteId);
            tag.title = (inMaint ? '\u26a0 \u4fee\u7406/\u70b9\u691c\u4e2d \u2014 ' : '') +
                '\u4ed6\u73fe\u5834: ' + (busySite ? busySite.name : '\u4f7f\u7528\u4e2d') + '\uff08\u30af\u30ea\u30c3\u30af\u3067\u79fb\u52d5\uff09';
            tag.addEventListener('click', function () {
                removeVehicleAssignment(sc.date, sc.shift, busySiteId);
                addVehicleAssignment(sc.date, sc.shift, sc.siteId, v.id);
                wsCnSelfNotify('schedule', 'modify', { vehicleName: v.plate, siteName: (findSite(sc.siteId) || {}).name, shift: sc.shift, siteId: sc.siteId, dateKey: sc.date, srcSite: (findSite(busySiteId) || {}).name || '', dstSite: (findSite(sc.siteId) || {}).name || '' });
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.title = inMaint ? '\u26a0 \u4fee\u7406/\u70b9\u691c\u4e2d\uff08\u914d\u7f6e\u53ef\uff09' : '';
            tag.addEventListener('click', function () {
                addVehicleAssignment(sc.date, sc.shift, sc.siteId, v.id);
                wsCnSelfNotify('schedule', 'add', { vehicleName: v.plate, siteName: (findSite(sc.siteId) || {}).name, shift: sc.shift, siteId: sc.siteId, dateKey: sc.date });
                renderGrid();
                renderSidebar();
            });
        }

        // D&D対応
        if (!isAssignedHere) {
            tag.draggable = true;
            tag.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-vehicle',
                    vehicleId: v.id
                }));
                e.dataTransfer.effectAllowed = 'copy';
                tag.style.opacity = '0.5';
                activateDragMode(sc.date);
            });
            tag.addEventListener('dragend', function () {
                tag.style.opacity = '';
                deactivateDragMode();
            });
        }

        return tag;
    }

    // --- 社員軸ビュー + セル選択 → 現場候補表示 ---
    function renderSidebarAssignSite() {
        var sidebar = document.querySelector('.md-ws-sidebar');
        if (!sidebar) return;

        var sc = selectedCell;
        var emp = employeesData[sc.empIndex];
        var d = parseDate(sc.date);
        var isPast = d < today;
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        var dow = getDaysOfWeek()[d.getDay()];
        var shiftLabel = sc.shift === 'day' ? '\u663c' : '\u591c';

        sidebar.innerHTML = '';

        // --- ヘッダー ---
        var header = el('div', 'md-ws-sidebar-assign-header');
        header.innerHTML = '\u914d\u7f6e\u30e2\u30fc\u30c9';
        var closeBtn = el('button', 'md-ws-assign-close', '\u00d7');
        closeBtn.addEventListener('click', function () { deselectCell(); });
        header.appendChild(closeBtn);
        sidebar.appendChild(header);

        // --- infoエリア ---
        var info = el('div', 'md-ws-sidebar-assign-info');
        var navRow = el('div', 'md-ws-assign-nav');

        var visibleDateKeys = getVisibleDates().map(function (d) { return formatDateKey(d); });
        var curDatePos = visibleDateKeys.indexOf(sc.date);

        var prevBtn = el('button', 'md-ws-assign-nav-btn', '\u25c0');
        prevBtn.title = '\u524d\u65e5\u3078';
        if (curDatePos <= 0) prevBtn.disabled = true;
        prevBtn.addEventListener('click', function () {
            if (curDatePos > 0) {
                selectedCell = { empIndex: sc.empIndex, date: visibleDateKeys[curDatePos - 1], shift: sc.shift };
                renderGrid(); renderSidebar(); applySelectionHighlight();
            }
        });

        var nextBtn = el('button', 'md-ws-assign-nav-btn', '\u25b6');
        nextBtn.title = '\u7fcc\u65e5\u3078';
        if (curDatePos < 0 || curDatePos >= visibleDateKeys.length - 1) nextBtn.disabled = true;
        nextBtn.addEventListener('click', function () {
            if (curDatePos < visibleDateKeys.length - 1) {
                selectedCell = { empIndex: sc.empIndex, date: visibleDateKeys[curDatePos + 1], shift: sc.shift };
                renderGrid(); renderSidebar(); applySelectionHighlight();
            }
        });

        var centerBlock = el('div', 'md-ws-assign-nav-center');
        var empLine = el('div', 'md-ws-assign-nav-site');
        empLine.innerHTML = '<strong>' + (emp ? emp.name : '') + '</strong>';
        var dateLine = el('div', 'md-ws-assign-nav-date');
        dateLine.textContent = mm + '/' + dd + '(' + dow + ') ' + shiftLabel;
        centerBlock.appendChild(empLine);
        centerBlock.appendChild(dateLine);

        navRow.appendChild(prevBtn);
        navRow.appendChild(nextBtn);
        navRow.appendChild(centerBlock);

        info.appendChild(navRow);
        sidebar.appendChild(info);

        var currentSites = getAssignedSites(sc.empIndex, sc.date, sc.shift);

        // パネル（縦タブ + コンテンツ）
        var panel = el('div', 'md-ws-sidebar-panel');

        // --- 縦タブ列（GC別） ---
        var vtabs = el('div', 'md-ws-site-vtabs');
        var gcOrder = (typeof groupCompaniesData !== 'undefined')
            ? groupCompaniesData.filter(function (gc) { return wsGcIsVisible(gc.code); })
            : [];

        // GCフィルタ連動
        if (wsSiteTab.activeGc !== 'all') {
            var found = gcOrder.some(function (gc) { return gc.code === wsSiteTab.activeGc; });
            if (!found) wsSiteTab.activeGc = 'all';
        }

        var allTab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === 'all' ? ' active' : ''), 'すべて');
        allTab.addEventListener('click', function () { wsSiteTab.activeGc = 'all'; renderSidebar(); });
        vtabs.appendChild(allTab);

        gcOrder.forEach(function (gc) {
            var tab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === gc.code ? ' active' : ''), gc.shortName);
            tab.addEventListener('click', function () { wsSiteTab.activeGc = gc.code; renderSidebar(); });
            vtabs.appendChild(tab);
        });

        panel.appendChild(vtabs);

        // --- コンテンツエリア ---
        var content = el('div', 'md-ws-site-tab-content');

        var filteredGcs = wsSiteTab.activeGc === 'all'
            ? gcOrder
            : gcOrder.filter(function (gc) { return gc.code === wsSiteTab.activeGc; });

        filteredGcs.forEach(function (gc) {
            var gcSites = wsSitesData.filter(function (s) {
                return s.gc === gc.code && (s.orders[sc.shift] || 0) > 0;
            });
            if (gcSites.length === 0) return;

            // GCセクションラベル（「すべて」タブ時のみ）
            if (wsSiteTab.activeGc === 'all') {
                content.appendChild(el('div', 'md-ws-gc-section-label', gc.shortName));
            }

            // カテゴリ別アコーディオン
            CATEGORY_ORDER.forEach(function (cat) {
                var catSites = gcSites.filter(function (s) { return s.category === cat; });
                if (catSites.length === 0) return;

                var catKey = 'gc-' + gc.code + '-' + cat;
                var catCollapsed = !!siteAccordionCollapsed[catKey];

                var catHeader = el('div', 'md-ws-site-accordion-header md-ws-site-accordion-cat');
                if (catCollapsed) catHeader.classList.add('md-ws-collapsed');
                catHeader.innerHTML = '<span class="md-ws-site-accordion-chevron">▼</span>' +
                    '<span class="md-ws-category-badge md-ws-cat-' + cat + '">' + CATEGORIES[cat] + '</span>' +
                    '<span class="md-ws-site-accordion-count">(' + catSites.length + ')</span>';
                catHeader.addEventListener('click', function () {
                    siteAccordionCollapsed[catKey] = !siteAccordionCollapsed[catKey];
                    renderSidebar();
                });
                content.appendChild(catHeader);

                if (catCollapsed) return;

                // --- 現場アイテム ---
                catSites.forEach(function (site) {
                    var orders = site.orders[sc.shift] || 0;
                    var item = el('div', 'md-ws-candidate-item md-ws-candidate-indented');
                    var nameSpan = el('span', 'md-ws-candidate-name');
                    var companyLine = el('span', 'md-ws-candidate-company', site.company);
                    var siteLine = el('span', '', site.name);
                    nameSpan.appendChild(companyLine);
                    nameSpan.appendChild(siteLine);
                    var countChip = el('span', 'md-ws-candidate-count');

                    var assignedEmpIdxs = getAssignedEmployees(site.id, sc.date, sc.shift);
                    var assignedCount = assignedEmpIdxs.length;
                    var isAlreadyAssigned = currentSites.indexOf(site.id) >= 0;

                    if (isPast) {
                        item.classList.add('md-ws-candidate-disabled');
                        countChip.textContent = assignedCount + '/' + orders;
                    } else if (isAlreadyAssigned) {
                        item.classList.add('md-ws-candidate-assigned');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            removeAssignment(sc.empIndex, sc.date, sc.shift, site.id);
                            wsCnSelfNotify('schedule', 'delete', { empName: wsCnGetEmpName(sc.empIndex), siteName: site.name, siteId: site.id, dateKey: sc.date, shift: sc.shift });
                            renderGrid();
                            renderSidebar();
                        });
                        item.style.cursor = 'pointer';
                        item.title = '\u30af\u30ea\u30c3\u30af\u3067\u914d\u7f6e\u89e3\u9664';
                    } else if (assignedCount < orders) {
                        item.classList.add('md-ws-candidate-shortage');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addAssignment(sc.empIndex, sc.date, sc.shift, site.id);
                            wsCnSelfNotify('schedule', 'add', { empName: wsCnGetEmpName(sc.empIndex), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    } else if (assignedCount === orders) {
                        item.classList.add('md-ws-candidate-fulfilled');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addAssignment(sc.empIndex, sc.date, sc.shift, site.id);
                            wsCnSelfNotify('schedule', 'add', { empName: wsCnGetEmpName(sc.empIndex), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    } else {
                        item.classList.add('md-ws-candidate-excess');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addAssignment(sc.empIndex, sc.date, sc.shift, site.id);
                            wsCnSelfNotify('schedule', 'add', { empName: wsCnGetEmpName(sc.empIndex), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    }

                    // D&D対応（過去日は無効）
                    if (!isPast && !isAlreadyAssigned) {
                        item.draggable = true;
                        item.addEventListener('dragstart', function (e) {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                type: 'sidebar-site',
                                siteId: site.id
                            }));
                            e.dataTransfer.effectAllowed = 'copy';
                            item.style.opacity = '0.5';
                            activateDragMode(sc.date);
                        });
                        item.addEventListener('dragend', function () {
                            item.style.opacity = '';
                            deactivateDragMode();
                        });
                    }

                    item.appendChild(nameSpan);
                    item.appendChild(countChip);
                    content.appendChild(item);

                    // 配置済み社員バッジ
                    if (assignedEmpIdxs.length > 0) {
                        var badgeRow = el('div', 'md-ws-site-emp-badges');
                        assignedEmpIdxs.forEach(function (idx) {
                            var empData = employeesData[idx];
                            if (!empData) return;
                            var badge = el('span', 'md-ws-site-emp-badge', empData.name);
                            badge.addEventListener('click', function (e) {
                                e.stopPropagation();
                                scrollToRowAndFlash('[data-emp-index="' + idx + '"].md-ws-name-cell');
                            });
                            badgeRow.appendChild(badge);
                        });
                        content.appendChild(badgeRow);
                    }
                });
            });
        });

        panel.appendChild(content);
        sidebar.appendChild(panel);
    }

    // --- 社員軸ビュー + 車両セル選択 → 現場候補表示 ---
    function renderSidebarAssignSiteForVehicle() {
        var sidebar = document.querySelector('.md-ws-sidebar');
        if (!sidebar) return;

        var sc = selectedCell;
        var vehicle = findVehicle(sc.vehicleId);
        var d = parseDate(sc.date);
        var isPast = d < today;
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        var dow = getDaysOfWeek()[d.getDay()];
        var shiftLabel = sc.shift === 'day' ? '\u663c' : '\u591c';

        sidebar.innerHTML = '';

        // --- ヘッダー ---
        var header = el('div', 'md-ws-sidebar-assign-header');
        header.innerHTML = '\u914d\u7f6e\u30e2\u30fc\u30c9';
        var closeBtn = el('button', 'md-ws-assign-close', '\u00d7');
        closeBtn.addEventListener('click', function () { deselectCell(); });
        header.appendChild(closeBtn);
        sidebar.appendChild(header);

        // --- infoエリア ---
        var info = el('div', 'md-ws-sidebar-assign-info');
        var navRow = el('div', 'md-ws-assign-nav');

        var visibleDateKeys = getVisibleDates().map(function (d) { return formatDateKey(d); });
        var curDatePos = visibleDateKeys.indexOf(sc.date);

        var prevBtn = el('button', 'md-ws-assign-nav-btn', '\u25c0');
        prevBtn.title = '\u524d\u65e5\u3078';
        if (curDatePos <= 0) prevBtn.disabled = true;
        prevBtn.addEventListener('click', function () {
            if (curDatePos > 0) {
                selectedCell = { vehicleId: sc.vehicleId, date: visibleDateKeys[curDatePos - 1], shift: sc.shift };
                renderGrid(); renderSidebar(); applySelectionHighlight();
            }
        });

        var nextBtn = el('button', 'md-ws-assign-nav-btn', '\u25b6');
        nextBtn.title = '\u7fcc\u65e5\u3078';
        if (curDatePos < 0 || curDatePos >= visibleDateKeys.length - 1) nextBtn.disabled = true;
        nextBtn.addEventListener('click', function () {
            if (curDatePos < visibleDateKeys.length - 1) {
                selectedCell = { vehicleId: sc.vehicleId, date: visibleDateKeys[curDatePos + 1], shift: sc.shift };
                renderGrid(); renderSidebar(); applySelectionHighlight();
            }
        });

        var centerBlock = el('div', 'md-ws-assign-nav-center');
        var vehLine = el('div', 'md-ws-assign-nav-site');
        vehLine.innerHTML = '<strong>' + (vehicle ? vehicle.plate + ' ' + vehicle.model : '') + '</strong>';
        var dateLine = el('div', 'md-ws-assign-nav-date');
        dateLine.textContent = mm + '/' + dd + '(' + dow + ') ' + shiftLabel;
        centerBlock.appendChild(vehLine);
        centerBlock.appendChild(dateLine);

        navRow.appendChild(prevBtn);
        navRow.appendChild(nextBtn);
        navRow.appendChild(centerBlock);

        info.appendChild(navRow);
        sidebar.appendChild(info);

        var currentSites = getVehicleAssignedSites(sc.vehicleId, sc.date, sc.shift);

        // パネル（縦タブ + コンテンツ）
        var panel = el('div', 'md-ws-sidebar-panel');

        // --- 縦タブ列（GC別） ---
        var vtabs = el('div', 'md-ws-site-vtabs');
        var gcOrder = (typeof groupCompaniesData !== 'undefined')
            ? groupCompaniesData.filter(function (gc) { return wsGcIsVisible(gc.code); })
            : [];

        if (wsSiteTab.activeGc !== 'all') {
            var found = gcOrder.some(function (gc) { return gc.code === wsSiteTab.activeGc; });
            if (!found) wsSiteTab.activeGc = 'all';
        }

        var allTab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === 'all' ? ' active' : ''), '\u3059\u3079\u3066');
        allTab.addEventListener('click', function () { wsSiteTab.activeGc = 'all'; renderSidebar(); });
        vtabs.appendChild(allTab);

        gcOrder.forEach(function (gc) {
            var tab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === gc.code ? ' active' : ''), gc.shortName);
            tab.addEventListener('click', function () { wsSiteTab.activeGc = gc.code; renderSidebar(); });
            vtabs.appendChild(tab);
        });

        panel.appendChild(vtabs);

        // --- コンテンツエリア ---
        var content = el('div', 'md-ws-site-tab-content');

        var filteredGcs = wsSiteTab.activeGc === 'all'
            ? gcOrder
            : gcOrder.filter(function (gc) { return gc.code === wsSiteTab.activeGc; });

        filteredGcs.forEach(function (gc) {
            var gcSites = wsSitesData.filter(function (s) {
                return s.gc === gc.code && (s.orders[sc.shift] || 0) > 0;
            });
            if (gcSites.length === 0) return;

            if (wsSiteTab.activeGc === 'all') {
                content.appendChild(el('div', 'md-ws-gc-section-label', gc.shortName));
            }

            CATEGORY_ORDER.forEach(function (cat) {
                var catSites = gcSites.filter(function (s) { return s.category === cat; });
                if (catSites.length === 0) return;

                var catKey = 'gc-' + gc.code + '-' + cat;
                var catCollapsed = !!siteAccordionCollapsed[catKey];

                var catHeader = el('div', 'md-ws-site-accordion-header md-ws-site-accordion-cat');
                if (catCollapsed) catHeader.classList.add('md-ws-collapsed');
                catHeader.innerHTML = '<span class="md-ws-site-accordion-chevron">\u25bc</span>' +
                    '<span class="md-ws-category-badge md-ws-cat-' + cat + '">' + CATEGORIES[cat] + '</span>' +
                    '<span class="md-ws-site-accordion-count">(' + catSites.length + ')</span>';
                catHeader.addEventListener('click', function () {
                    siteAccordionCollapsed[catKey] = !siteAccordionCollapsed[catKey];
                    renderSidebar();
                });
                content.appendChild(catHeader);

                if (catCollapsed) return;

                catSites.forEach(function (site) {
                    var orders = site.orders[sc.shift] || 0;
                    var item = el('div', 'md-ws-candidate-item md-ws-candidate-indented');
                    var nameSpan = el('span', 'md-ws-candidate-name');
                    var companyLine = el('span', 'md-ws-candidate-company', site.company);
                    var siteLine = el('span', '', site.name);
                    nameSpan.appendChild(companyLine);
                    nameSpan.appendChild(siteLine);
                    var countChip = el('span', 'md-ws-candidate-count');

                    var assignedEmpIdxs = getAssignedEmployees(site.id, sc.date, sc.shift);
                    var assignedCount = assignedEmpIdxs.length;
                    var isAlreadyAssigned = currentSites.indexOf(site.id) >= 0;

                    if (isPast) {
                        item.classList.add('md-ws-candidate-disabled');
                        countChip.textContent = assignedCount + '/' + orders;
                    } else if (isAlreadyAssigned) {
                        item.classList.add('md-ws-candidate-assigned');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            removeVehicleAssignment(sc.date, sc.shift, site.id);
                            wsCnSelfNotify('schedule', 'delete', { vehicleName: wsCnGetVehicleName(sc.vehicleId), siteName: site.name, siteId: site.id, dateKey: sc.date, shift: sc.shift });
                            renderGrid();
                            renderSidebar();
                        });
                        item.style.cursor = 'pointer';
                        item.title = '\u30af\u30ea\u30c3\u30af\u3067\u914d\u7f6e\u89e3\u9664';
                    } else if (assignedCount < orders) {
                        item.classList.add('md-ws-candidate-shortage');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addVehicleAssignment(sc.date, sc.shift, site.id, sc.vehicleId);
                            wsCnSelfNotify('schedule', 'add', { vehicleName: wsCnGetVehicleName(sc.vehicleId), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    } else if (assignedCount === orders) {
                        item.classList.add('md-ws-candidate-fulfilled');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addVehicleAssignment(sc.date, sc.shift, site.id, sc.vehicleId);
                            wsCnSelfNotify('schedule', 'add', { vehicleName: wsCnGetVehicleName(sc.vehicleId), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    } else {
                        item.classList.add('md-ws-candidate-excess');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addVehicleAssignment(sc.date, sc.shift, site.id, sc.vehicleId);
                            wsCnSelfNotify('schedule', 'add', { vehicleName: wsCnGetVehicleName(sc.vehicleId), siteName: site.name, shift: sc.shift, siteId: site.id, dateKey: sc.date });
                            renderGrid();
                            renderSidebar();
                        });
                    }

                    // D&D対応（過去日は無効）
                    if (!isPast && !isAlreadyAssigned) {
                        item.draggable = true;
                        item.addEventListener('dragstart', function (e) {
                            e.dataTransfer.setData('text/plain', JSON.stringify({
                                type: 'sidebar-site',
                                siteId: site.id
                            }));
                            e.dataTransfer.effectAllowed = 'copy';
                            item.style.opacity = '0.5';
                            activateDragMode(sc.date);
                        });
                        item.addEventListener('dragend', function () {
                            item.style.opacity = '';
                            deactivateDragMode();
                        });
                    }

                    item.appendChild(nameSpan);
                    item.appendChild(countChip);
                    content.appendChild(item);

                    // 配置済み社員バッジ
                    if (assignedEmpIdxs.length > 0) {
                        var badgeRow = el('div', 'md-ws-site-emp-badges');
                        assignedEmpIdxs.forEach(function (idx) {
                            var empData = employeesData[idx];
                            if (!empData) return;
                            var badge = el('span', 'md-ws-site-emp-badge', empData.name);
                            badge.addEventListener('click', function (e) {
                                e.stopPropagation();
                                scrollToRowAndFlash('[data-emp-index="' + idx + '"].md-ws-name-cell');
                            });
                            badgeRow.appendChild(badge);
                        });
                        content.appendChild(badgeRow);
                    }
                });
            });
        });

        panel.appendChild(content);
        sidebar.appendChild(panel);
    }

    // --- 現場軸ビュー + 非選択 → 社員概要 ---
    // 組織ツリーの子孫IDを取得
    function wsGetDescendantIds(nodes, targetId) {
        var ids = [targetId];
        function walk(list) {
            list.forEach(function (n) {
                if (n.parentId === targetId || ids.indexOf(n.parentId) >= 0) {
                    ids.push(n.id);
                }
                if (n.children) walk(n.children);
            });
        }
        walk(nodes);
        return ids;
    }

    // --- 社員概要コンテンツ（縦タブ+バッジ） ---
    function renderEmployeeOverviewContent(sidebar) {
        // 社員軸: 縦タブなし、バッジコンテンツのみ
        if (viewMode === 'employee') {
            var content = el('div', 'md-ws-badge-content');
            var visibleCompanies = groupCompaniesData.filter(function (gc) {
                return wsGcIsVisible(gc.code);
            });
            var filteredCount = 0;
            visibleCompanies.forEach(function (gc) {
                var companyEmps = employeesData.map(function (emp, idx) {
                    return { index: idx, name: emp.name, company: emp.company, dept: emp.dept };
                }).filter(function (emp) { return emp.company === gc.code; });
                var supportCount = getActivePartners(gc.code).length;
                if (companyEmps.length === 0 && supportCount === 0) return;
                filteredCount += companyEmps.length;
                content.appendChild(el('div', 'md-ws-gc-section-label', gc.shortName));
                companyEmps.forEach(function (emp) {
                    content.appendChild(createEmpBadge(emp));
                });
            });
            appendUnifiedSupportSection(content, function (p) {
                return createSupportBadge(p);
            });
            sidebar.appendChild(content);

            var countEl = sidebar.querySelector('.md-ws-employee-count');
            if (countEl) countEl.textContent = filteredCount + '/' + employeesData.length + '\u540d';
            return;
        }

        // 現場軸: パネル（縦タブ + バッジコンテンツ）
        var panel = el('div', 'md-ws-sidebar-panel');

        // --- 縦タブ列 ---
        var vtabs = el('div', 'md-ws-vtabs');

        // GCフィルタ連動：非表示会社のタブが選択中なら「すべて」にフォールバック
        var visibleCompanies = groupCompaniesData.filter(function (gc) {
            return wsGcIsVisible(gc.code);
        });
        if (wsEmpTab.activeTab !== 'all') {
            var tabInVisible = false;
            visibleCompanies.forEach(function (gc) {
                var units = orgUnitsData[gc.code] || [];
                var ids = wsGetDescendantIds(units, wsEmpTab.activeTab);
                if (ids.length > 0) tabInVisible = true;
            });
            if (!tabInVisible) wsEmpTab.activeTab = 'all';
        }

        // 「すべて」タブ
        var allTab = el('div', 'md-ws-vtab' + (wsEmpTab.activeTab === 'all' ? ' active' : ''), '\u3059\u3079\u3066');
        allTab.setAttribute('data-ws-tab', 'all');
        allTab.addEventListener('click', function () { wsSelectTab('all'); });
        vtabs.appendChild(allTab);
        visibleCompanies.forEach(function (gc) {
            var units = orgUnitsData[gc.code] || [];
            var isExpanded = wsEmpTab.expandedCompanies.has(gc.code);

            var gcHeader = el('div', 'md-ws-gc-header' + (isExpanded ? ' expanded' : ''));
            gcHeader.setAttribute('data-ws-gc', gc.code);
            gcHeader.setAttribute('title', gc.shortName);
            gcHeader.addEventListener('click', function () { wsToggleCompany(gc.code); });
            vtabs.appendChild(gcHeader);

            var deptGroup = el('div', 'md-ws-dept-group' + (isExpanded ? ' expanded' : ''));
            deptGroup.setAttribute('data-ws-gc-group', gc.code);

            // 組織ツリー再帰レンダリング
            function renderOrgTabs(nodes, indent) {
                nodes.forEach(function (node) {
                    var label = (indent > 0 ? '\u3000'.repeat(indent) : '') + node.name;
                    var hasChildren = node.children && node.children.length > 0;
                    var cssClass = 'md-ws-vtab' + (wsEmpTab.activeTab === node.id ? ' active' : '')
                        + (hasChildren ? ' md-ws-org-parent' : '');
                    var tab = el('div', cssClass, label);
                    tab.setAttribute('data-ws-tab', node.id);
                    tab.setAttribute('data-org-depth', String(node.depth));
                    tab.addEventListener('click', function () { wsSelectTab(node.id); });
                    deptGroup.appendChild(tab);
                    if (hasChildren) renderOrgTabs(node.children, indent + 1);
                });
            }
            renderOrgTabs(units, 0);
            vtabs.appendChild(deptGroup);
        });

        panel.appendChild(vtabs);

        // --- バッジコンテンツエリア ---
        var content = el('div', 'md-ws-badge-content');

        // フィルタリング
        var allEmps = employeesData.map(function (emp, idx) {
            return { index: idx, name: emp.name, company: emp.company, dept: emp.dept };
        });

        var filtered = allEmps;
        if (wsEmpTab.activeTab !== 'all') {
            var matchIds = [];
            Object.keys(orgUnitsData).forEach(function (gc) {
                matchIds = matchIds.concat(wsGetDescendantIds(orgUnitsData[gc], wsEmpTab.activeTab));
            });
            filtered = filtered.filter(function (emp) {
                return matchIds.indexOf(emp.dept) >= 0;
            });
        }

        if (wsEmpTab.activeTab === 'all') {
            visibleCompanies.forEach(function (gc) {
                var companyEmps = filtered.filter(function (emp) { return emp.company === gc.code; });
                var supportCount = getActivePartners(gc.code).length;
                if (companyEmps.length === 0 && supportCount === 0) return;
                var sectionLabel = el('div', 'md-ws-gc-section-label', gc.shortName);
                content.appendChild(sectionLabel);
                companyEmps.forEach(function (emp) {
                    content.appendChild(createEmpBadge(emp));
                });
            });
        } else {
            filtered.forEach(function (emp) {
                content.appendChild(createEmpBadge(emp));
            });
        }

        // 統合「応援」セクション（GC問わず1個・全タブ共通で末尾に表示）
        appendUnifiedSupportSection(content, function (p) {
            return createSupportBadge(p);
        });

        panel.appendChild(content);
        sidebar.appendChild(panel);

        // カウント更新
        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            var total = employeesData.length;
            countEl.textContent = wsEmpTab.activeTab === 'all'
                ? '\u5168' + total + '\u540d'
                : filtered.length + '/' + total + '\u540d';
        }
    }

    // --- 車両概要コンテンツ（非選択・車両タブ） ---
    function renderVehicleOverviewContent(sidebar) {
        var overview = el('div', 'md-ws-vehicle-overview');

        // 全表示日の配置状況を車両ごとに収集
        var dates = getVisibleDates();
        var dowLabels = getDaysOfWeek();
        var vehicleAssignedDows = {}; // vehicleId -> [曜日]

        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            var dow = dowLabels[d.getDay()];
            var va = vehicleAssignments[dk];
            if (va) {
                ['day', 'night'].forEach(function (sh) {
                    if (va[sh]) {
                        Object.keys(va[sh]).forEach(function (sid) {
                            var vid = va[sh][sid];
                            if (!vehicleAssignedDows[vid]) vehicleAssignedDows[vid] = [];
                            if (vehicleAssignedDows[vid].indexOf(dow) < 0) {
                                vehicleAssignedDows[vid].push(dow);
                            }
                        });
                    }
                });
            }
        });

        // 会社別グループ表示
        var gcNames = { touo: '\u6771\u592e\u8b66\u5099', nikkei: 'Nikkei', zennihon: 'AJE' };
        var gcOrder = ['touo', 'nikkei', 'zennihon'];

        gcOrder.forEach(function (gc) {
            if (!wsGcIsVisible(gc)) return; // GCフィルタ連動
            var companyVehicles = wsVehiclesData.filter(function (v) { return v.owner === gc; });
            if (companyVehicles.length === 0) return;

            var sectionLabel = el('div', 'md-ws-gc-section-label', gcNames[gc] || gc);
            overview.appendChild(sectionLabel);

            companyVehicles.forEach(function (v) {
                var tag = el('span', 'md-ws-vehicle-tag');
                var infoRow = el('span', 'md-ws-vehicle-info');
                var plateSpan = document.createTextNode(v.plate + ' ');
                infoRow.appendChild(plateSpan);
                var modelSpan = el('span', 'md-ws-vt-model', v.model);
                infoRow.appendChild(modelSpan);
                tag.appendChild(infoRow);

                // 曜日ミニバッジ
                var dows = vehicleAssignedDows[v.id] || [];
                if (dows.length > 0) {
                    var dowRow = el('span', 'md-ws-dow-badges');
                    dows.forEach(function (dow) {
                        var badge = el('span', 'md-ws-dow-badge', dow);
                        dowRow.appendChild(badge);
                    });
                    tag.appendChild(dowRow);
                }

                // D&D対応
                tag.draggable = true;
                tag.addEventListener('dragstart', function (e) {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        type: 'sidebar-vehicle',
                        vehicleId: v.id
                    }));
                    e.dataTransfer.effectAllowed = 'copy';
                    tag.style.opacity = '0.5';
                    activateDragMode(null);
                });
                tag.addEventListener('dragend', function () {
                    tag.style.opacity = '';
                    deactivateDragMode();
                });

                overview.appendChild(tag);
            });
        });

        // 車両数カウント
        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            countEl.textContent = '\u5168' + wsVehiclesData.length + '\u53f0';
        }

        sidebar.appendChild(overview);
    }

    // --- 車両概要コンテンツ（社員軸ビュー用） ---
    function renderVehicleOverviewContentEmpView(sidebar) {
        var overview = el('div', 'md-ws-vehicle-overview');

        var gcNames = { touo: '\u6771\u592e\u8b66\u5099', nikkei: 'Nikkei', zennihon: 'AJE' };
        var gcOrder = ['touo', 'nikkei', 'zennihon'];

        gcOrder.forEach(function (gc) {
            if (!wsGcIsVisible(gc)) return;
            var companyVehicles = wsVehiclesData.filter(function (v) { return v.owner === gc; });
            if (companyVehicles.length === 0) return;

            var sectionLabel = el('div', 'md-ws-gc-section-label', gcNames[gc] || gc);
            overview.appendChild(sectionLabel);

            companyVehicles.forEach(function (v) {
                var tag = el('span', 'md-ws-vehicle-tag md-ws-clickable-badge');
                tag.dataset.vehicleId = v.id;
                var infoRow = el('span', 'md-ws-vehicle-info');
                infoRow.appendChild(document.createTextNode(v.plate + ' '));
                infoRow.appendChild(el('span', 'md-ws-vt-model', v.model));
                tag.appendChild(infoRow);

                // クリック → 行スクロール＋フラッシュ
                tag.addEventListener('click', function () {
                    scrollToRowAndFlash('[data-vehicle-id="' + v.id + '"].md-ws-name-cell');
                });

                overview.appendChild(tag);
            });
        });

        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            countEl.textContent = '\u5168' + wsVehiclesData.length + '\u53f0';
        }

        sidebar.appendChild(overview);
    }

    // --- 現場タブコンテンツ（現場軸ビュー・非選択時） ---
    function renderSiteOverviewContent(sidebar) {
        var panel = el('div', 'md-ws-sidebar-panel');

        // --- 縦タブ列（GC別） ---
        var vtabs = el('div', 'md-ws-site-vtabs');
        var visibleCompanies = groupCompaniesData.filter(function (gc) {
            return wsGcIsVisible(gc.code);
        });

        // GCフィルタ連動：非表示GCが選択中なら「すべて」にフォールバック
        if (wsSiteTab.activeGc !== 'all') {
            var found = visibleCompanies.some(function (gc) { return gc.code === wsSiteTab.activeGc; });
            if (!found) wsSiteTab.activeGc = 'all';
        }

        var allTab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === 'all' ? ' active' : ''), 'すべて');
        allTab.addEventListener('click', function () { wsSiteTab.activeGc = 'all'; renderSidebar(); });
        vtabs.appendChild(allTab);

        visibleCompanies.forEach(function (gc) {
            var tab = el('div', 'md-ws-site-vtab' + (wsSiteTab.activeGc === gc.code ? ' active' : ''), gc.shortName);
            tab.addEventListener('click', function () { wsSiteTab.activeGc = gc.code; renderSidebar(); });
            vtabs.appendChild(tab);
        });

        panel.appendChild(vtabs);

        // --- コンテンツエリア ---
        var content = el('div', 'md-ws-site-tab-content');

        // 表示期間の全配置情報を収集: siteId -> [empIndex]（週全体で重複なし）
        var dates = getVisibleDates();
        var siteEmpMap = {}; // siteId -> Set of empIndex
        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            Object.keys(assignments).forEach(function (empIdx) {
                var ea = assignments[empIdx];
                if (!ea || !ea[dk]) return;
                ['day', 'night'].forEach(function (sh) {
                    if (ea[dk][sh]) {
                        ea[dk][sh].forEach(function (sid) {
                            if (!siteEmpMap[sid]) siteEmpMap[sid] = {};
                            siteEmpMap[sid][empIdx] = true;
                        });
                    }
                });
            });
        });

        // GCフィルタ適用
        var filteredGcs = wsSiteTab.activeGc === 'all'
            ? visibleCompanies
            : visibleCompanies.filter(function (gc) { return gc.code === wsSiteTab.activeGc; });

        filteredGcs.forEach(function (gc) {
            var gcSites = wsSitesData.filter(function (s) { return s.gc === gc.code; });
            if (gcSites.length === 0) return;

            // GCセクションラベル（「すべて」タブ時のみ）
            if (wsSiteTab.activeGc === 'all') {
                content.appendChild(el('div', 'md-ws-gc-section-label', gc.shortName));
            }

            // カテゴリ別アコーディオン
            CATEGORY_ORDER.forEach(function (cat) {
                var catSites = gcSites.filter(function (s) { return s.category === cat; });
                if (catSites.length === 0) return;

                var catKey = 'site-tab-' + gc.code + '-' + cat;
                var catCollapsed = !!siteAccordionCollapsed[catKey];

                var catHeader = el('div', 'md-ws-site-accordion-header md-ws-site-accordion-cat');
                if (catCollapsed) catHeader.classList.add('md-ws-collapsed');
                catHeader.innerHTML = '<span class="md-ws-site-accordion-chevron">▼</span>' +
                    '<span class="md-ws-category-badge md-ws-cat-' + cat + '">' + CATEGORIES[cat] + '</span>' +
                    '<span class="md-ws-site-accordion-count">(' + catSites.length + ')</span>';
                catHeader.addEventListener('click', function () {
                    siteAccordionCollapsed[catKey] = !siteAccordionCollapsed[catKey];
                    renderSidebar();
                });
                content.appendChild(catHeader);

                if (catCollapsed) return;

                // 現場アイテム + 社員バッジ
                catSites.forEach(function (site) {
                    var itemDiv = el('div', 'md-ws-site-tab-item');
                    var nameLine = el('div', 'md-ws-site-tab-item-name');
                    nameLine.appendChild(el('span', '', site.name));
                    nameLine.appendChild(el('span', 'md-ws-site-tab-item-company', site.company));
                    itemDiv.appendChild(nameLine);
                    content.appendChild(itemDiv);

                    // 社員バッジ
                    var empIdxs = siteEmpMap[site.id] ? Object.keys(siteEmpMap[site.id]) : [];
                    if (empIdxs.length > 0) {
                        var badgeRow = el('div', 'md-ws-site-emp-badges');
                        empIdxs.forEach(function (idx) {
                            var emp = employeesData[parseInt(idx)];
                            if (!emp) return;
                            var badge = el('span', 'md-ws-site-emp-badge', emp.name);
                            badge.addEventListener('click', function () {
                                scrollToRowAndFlash('[data-emp-index="' + idx + '"].md-ws-name-cell');
                            });
                            badgeRow.appendChild(badge);
                        });
                        content.appendChild(badgeRow);
                    }
                });
            });
        });

        panel.appendChild(content);
        sidebar.appendChild(panel);

        // カウント更新
        var countEl = sidebar.querySelector('.md-ws-employee-count');
        if (countEl) {
            var siteCount = wsSiteTab.activeGc === 'all'
                ? wsSitesData.filter(function (s) { return wsGcIsVisible(s.gc); }).length
                : wsSitesData.filter(function (s) { return s.gc === wsSiteTab.activeGc; }).length;
            countEl.textContent = '現場 ' + siteCount + '件';
        }
    }

    // 社員バッジ要素を生成
    function createEmpBadge(emp) {
        var tag = el('span', 'md-ws-emp-tag');
        var nameSpan = el('span', 'md-ws-emp-name', emp.name);
        tag.appendChild(nameSpan);

        // 全表示日の配置・休み状況を収集
        var dates = getVisibleDates();
        var dowLabels = getDaysOfWeek();
        var assignedDows = [];
        var holidayDows = [];
        var allHoliday = true;

        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            var dow = dowLabels[d.getDay()];
            if (isEmployeeOnHoliday(emp.index, dk)) {
                holidayDows.push(dow);
            } else {
                allHoliday = false;
                var daySites = getAssignedSites(emp.index, dk, 'day');
                var nightSites = getAssignedSites(emp.index, dk, 'night');
                if (daySites.length > 0 || nightSites.length > 0) {
                    assignedDows.push(dow);
                }
            }
        });

        // 全日休みなら休みスタイル
        if (allHoliday && holidayDows.length > 0) {
            tag.classList.add('md-ws-tag-holiday');
        }

        // 曜日ミニバッジを表示（現場軸のみ）
        if (viewMode !== 'employee' && (assignedDows.length > 0 || holidayDows.length > 0)) {
            var dowRow = el('span', 'md-ws-dow-badges');
            assignedDows.forEach(function (dow) {
                var badge = el('span', 'md-ws-dow-badge', dow);
                dowRow.appendChild(badge);
            });
            holidayDows.forEach(function (dow) {
                var badge = el('span', 'md-ws-dow-badge md-ws-dow-holiday', dow);
                dowRow.appendChild(badge);
            });
            tag.appendChild(dowRow);
        }

        // 社員軸: クリック→行スクロール＋フラッシュ / 現場軸: D&D
        if (viewMode === 'employee') {
            tag.classList.add('md-ws-clickable-badge');
            tag.addEventListener('click', function () {
                scrollToRowAndFlash('[data-emp-index="' + emp.index + '"].md-ws-name-cell');
            });
        } else if (!allHoliday) {
            tag.draggable = true;
            tag.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-emp',
                    empIndex: emp.index
                }));
                e.dataTransfer.effectAllowed = 'copy';
                tag.style.opacity = '0.5';
                dragEmpIndex = emp.index;
                activateDragMode(null);
            });
            tag.addEventListener('dragend', function () {
                tag.style.opacity = '';
                deactivateDragMode();
            });
        }

        return tag;
    }

    // ==========================================================
    // サイドバー協力業者バッジUI（プリセット応援＋実在パートナー）
    // ==========================================================

    /** 概要モード（非選択時）バッジ */
    function createSupportBadge(partner) {
        var tagCls = 'md-ws-emp-tag md-ws-support-tag' + (partner.isPreset ? ' md-ws-support-preset' : '');
        var tag = el('span', tagCls);
        var nameSpan = el('span', 'md-ws-emp-name', getPartnerPlacedLabel(partner));
        tag.appendChild(nameSpan);

        // 全表示日の配置数を曜日別に集計（昼夜合算・可視GCの現場のみ）
        var dates = getVisibleDates();
        var dowLabels = getDaysOfWeek();
        var perDowParts = [];
        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            var sa = supportAssignments[partner.id];
            var c = 0;
            if (sa && sa[dk]) {
                ['day', 'night'].forEach(function (sh) {
                    if (!sa[dk][sh]) return;
                    sa[dk][sh].forEach(function (a) {
                        var site = findSite(a.siteId);
                        if (site && wsGcIsVisible(site.gc)) c++;
                    });
                });
            }
            if (c > 0) {
                perDowParts.push({ dow: dowLabels[d.getDay()], count: c });
            }
        });
        if (perDowParts.length > 0) {
            var countWrap = el('span', 'md-ws-support-count-text');
            perDowParts.forEach(function (p) {
                var mini = el('span', 'md-ws-dow-badge md-ws-dow-badge--pair');
                mini.appendChild(el('span', 'md-ws-dow-badge-label', p.dow));
                mini.appendChild(el('span', 'md-ws-dow-badge-count', String(p.count)));
                countWrap.appendChild(mini);
            });
            tag.appendChild(countWrap);
        }

        // 非プリセット：×削除ボタン
        if (!partner.isPreset) {
            var removeBtn = el('span', 'md-ws-support-remove', '\u00d7');
            removeBtn.title = '\u524a\u9664';
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                deactivatePartner(partner.id);
                renderGrid();
                renderSidebar();
            });
            tag.appendChild(removeBtn);
        }

        // D&D（現場軸のみ）
        if (viewMode !== 'employee') {
            tag.draggable = true;
            tag.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-support',
                    partnerId: partner.id
                }));
                e.dataTransfer.effectAllowed = 'copy';
                tag.style.opacity = '0.5';
                activateDragMode(null);
            });
            tag.addEventListener('dragend', function () {
                tag.style.opacity = '';
                deactivateDragMode();
            });
        }

        return tag;
    }

    /** 配置モード（セル選択時）バッジ */
    function createAssignSupportBadge(partner, sc, currentAssignedCell) {
        var tagCls = 'md-ws-emp-tag md-ws-support-tag' + (partner.isPreset ? ' md-ws-support-preset' : '');
        var tag = el('span', tagCls);
        var nameSpan = el('span', 'md-ws-emp-name', getPartnerPlacedLabel(partner));
        tag.appendChild(nameSpan);

        var placedHere = currentAssignedCell.filter(function (a) { return a.partner.id === partner.id; });
        var isAlreadyHere = placedHere.length > 0;

        if (partner.isPreset) {
            if (isAlreadyHere) {
                tag.classList.add('md-ws-tag-assigned');
                tag.title = '\u914d\u7f6e\u6e08\u307f ' + placedHere.length + '\u540d\uff08\u30af\u30ea\u30c3\u30af\u3067\u8ffd\u52a0\uff09';
            }
            tag.addEventListener('click', function () {
                addSupportAssignment(partner.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        } else if (isAlreadyHere) {
            tag.classList.add('md-ws-tag-assigned');
            tag.title = '\u30af\u30ea\u30c3\u30af\u3067\u914d\u7f6e\u89e3\u9664';
            tag.addEventListener('click', function () {
                removeSupportAssignment(partner.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.addEventListener('click', function () {
                addSupportAssignment(partner.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        }

        // D&D
        tag.draggable = true;
        tag.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'sidebar-support',
                partnerId: partner.id
            }));
            e.dataTransfer.effectAllowed = 'copy';
            tag.style.opacity = '0.5';
            activateDragMode(sc.date);
        });
        tag.addEventListener('dragend', function () {
            tag.style.opacity = '';
            deactivateDragMode();
        });

        if (!partner.isPreset) {
            var delBtn = el('span', 'md-ws-support-remove', '\u00d7');
            delBtn.title = '\u524a\u9664';
            delBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                deactivatePartner(partner.id);
                renderGrid();
                renderSidebar();
            });
            tag.appendChild(delBtn);
        }
        return tag;
    }

    /** 新規協力業者追加ボタン（サイドバー） */
    function createSupportAddBtn(gcCode) {
        var btn = el('button', 'md-ws-support-add-btn', '\uff0b');
        btn.title = '\u5354\u529b\u696d\u8005\u3092\u65b0\u898f\u8ffd\u52a0';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            showSupportAddInput(btn, gcCode);
        });
        return btn;
    }

    function showSupportAddInput(triggerBtn, gcCode) {
        var existing = triggerBtn.parentElement.querySelector('.md-ws-support-input-wrap');
        if (existing) { existing.remove(); return; }

        var wrap = el('div', 'md-ws-support-input-wrap');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'md-ws-support-input';
        input.placeholder = '\u4f8b: A\u793e\u2460';
        input.maxLength = 20;

        var okBtn = el('button', 'md-ws-support-input-ok', '\u8ffd\u52a0');
        var cancelBtn = el('button', 'md-ws-support-input-cancel', '\u00d7');

        function doAdd() {
            var v = input.value.trim();
            if (!v) return;
            addPartner(v, gcCode);
            wrap.remove();
            renderGrid();
            renderSidebar();
        }
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doAdd();
            if (e.key === 'Escape') wrap.remove();
        });
        okBtn.addEventListener('click', doAdd);
        cancelBtn.addEventListener('click', function () { wrap.remove(); });

        wrap.appendChild(input);
        wrap.appendChild(okBtn);
        wrap.appendChild(cancelBtn);
        triggerBtn.parentElement.appendChild(wrap);
        setTimeout(function () { input.focus(); }, 0);
    }

    /** 統合「応援」セクション（プリセット応援バッジ1個・GCを問わない） */
    function appendUnifiedSupportSection(container, badgeCreator) {
        var preset = findPartner('preset-unified');
        if (!preset || !preset.isActive) return;

        var secOuter = el('div', 'md-ws-support-outer md-ws-support-outer-unified');
        var secLabel = el('div', 'md-ws-support-label', '\u5fdc\u63f4');
        secOuter.appendChild(secLabel);

        var secWrap = el('div', 'md-ws-support-section');
        secWrap.appendChild(badgeCreator(preset));
        secOuter.appendChild(secWrap);
        container.appendChild(secOuter);
    }

    // ==========================================================
    // 業者紐付けポップオーバー（プリセット応援→実在パートナー確定）
    // 既存の協力業者リスト＋新規入力を併設
    // ==========================================================

    function showLinkPopover(chipEl, presetPartnerId, siteId, dateKey, shift) {
        var existing = document.querySelector('.md-ws-link-popover');
        if (existing) existing.remove();

        var popover = el('div', 'md-ws-link-popover');
        var title = el('div', 'md-ws-link-title', '\u696d\u8005\u3092\u7d10\u4ed8\u3051');
        popover.appendChild(title);

        // 全GCの「当日予約あり」業者をGCごとセクションに分けて列挙。
        // 残0は disabled。「予約なし」業者は非表示。
        var anyShown = false;
        groupCompaniesData.forEach(function (gc) {
            if (!wsGcIsVisible(gc.code)) return;
            var partners = getActivePartners(gc.code).filter(function (p) {
                return getReservedCount(p.id, dateKey) > 0;
            });
            if (partners.length === 0) return;
            anyShown = true;

            var secTitle = el('div', 'md-ws-link-section-title', gc.shortName);
            popover.appendChild(secTitle);

            var list = el('div', 'md-ws-link-partner-list');
            partners.forEach(function (p) {
                var reserved = getReservedCount(p.id, dateKey);
                var remaining = getRemainingCount(p.id, dateKey);
                var canSelect = remaining > 0;

                var btn = el('button', 'md-ws-link-partner-btn');
                var labelText = p.shortName + ' 残' + remaining + '/' + reserved;
                var nameSpan = el('span', 'md-ws-link-partner-name', labelText);
                btn.appendChild(nameSpan);

                if (!p.isMasterComplete) {
                    var warn = el('span', 'md-ws-link-partner-warn');
                    warn.innerHTML = WARN_ICON_SVG;
                    warn.title = 'マスタ未完備';
                    btn.appendChild(warn);
                }

                if (!canSelect) {
                    btn.classList.add('md-ws-link-partner-disabled');
                    btn.disabled = true;
                    btn.title = '予約残が0のため選択不可';
                } else {
                    btn.addEventListener('click', function () {
                        applyLinkSelection(presetPartnerId, p.id, siteId, dateKey, shift, popover);
                    });
                }
                list.appendChild(btn);
            });
            popover.appendChild(list);
        });

        if (!anyShown) {
            var emptyMsg = el('div', 'md-ws-link-empty', 'この日に予約が入っている業者はありません');
            popover.appendChild(emptyMsg);
        }

        document.body.appendChild(popover);
        var rect = chipEl.getBoundingClientRect();
        popover.style.top = (rect.bottom + 4) + 'px';
        popover.style.left = rect.left + 'px';
        setTimeout(function () {
            var pr = popover.getBoundingClientRect();
            if (pr.right > window.innerWidth - 8) popover.style.left = (window.innerWidth - pr.width - 8) + 'px';
            if (pr.bottom > window.innerHeight - 8) popover.style.top = (rect.top - pr.height - 4) + 'px';
        }, 0);
        setTimeout(function () {
            function onOutside(e) {
                if (!popover.contains(e.target)) {
                    popover.remove();
                    document.removeEventListener('mousedown', onOutside);
                }
            }
            document.addEventListener('mousedown', onOutside);
        }, 10);
    }

    function applyLinkSelection(presetPartnerId, targetPartnerId, siteId, dateKey, shift, popover) {
        removeSupportAssignment(presetPartnerId, dateKey, shift, siteId);
        addSupportAssignment(targetPartnerId, dateKey, shift, siteId);
        popover.remove();
        renderGrid();
        renderSidebar();
    }

    // 配置済み協力業者チップクリック時のアクション選択ポップオーバー
    function showPartnerChipActionPopover(chipEl, partnerId, siteId, dateKey, shift) {
        var existing = document.querySelector('.md-ws-link-popover');
        if (existing) existing.remove();

        var partner = findPartner(partnerId);
        if (!partner) return;

        var popover = el('div', 'md-ws-link-popover md-ws-chip-action-popover');
        var title = el('div', 'md-ws-link-title', partner.shortName);
        popover.appendChild(title);

        var btnWrap = el('div', 'md-ws-chip-action-buttons');

        var revertBtn = el('button', 'md-ws-chip-action-btn md-ws-chip-action-revert', '\u5fdc\u63f4\u30d0\u30c3\u30b8\u306b\u623b\u3059');
        revertBtn.title = '\u5f53\u8a72\u914d\u7f6e\u3092\u524a\u9664\u3057\u3001\u30d7\u30ea\u30bb\u30c3\u30c8\u300c\u5fdc\u63f4\u300d\u3092\u518d\u914d\u7f6e';
        revertBtn.addEventListener('click', function () {
            removeSupportAssignment(partnerId, dateKey, shift, siteId);
            addSupportAssignment('preset-unified', dateKey, shift, siteId);
            popover.remove();
            renderGrid();
            renderSidebar();
        });
        btnWrap.appendChild(revertBtn);

        var deleteBtn = el('button', 'md-ws-chip-action-btn md-ws-chip-action-delete', '\u524a\u9664');
        deleteBtn.title = '\u5f53\u8a72\u914d\u7f6e\u3092\u524a\u9664\uff08\u4e88\u7d04\u6b8b\u306f\u623b\u308b\uff09';
        deleteBtn.addEventListener('click', function () {
            removeSupportAssignment(partnerId, dateKey, shift, siteId);
            popover.remove();
            renderGrid();
            renderSidebar();
        });
        btnWrap.appendChild(deleteBtn);

        var cancelBtn = el('button', 'md-ws-chip-action-btn md-ws-chip-action-cancel', '\u30ad\u30e3\u30f3\u30bb\u30eb');
        cancelBtn.addEventListener('click', function () { popover.remove(); });
        btnWrap.appendChild(cancelBtn);

        popover.appendChild(btnWrap);

        document.body.appendChild(popover);
        var rect = chipEl.getBoundingClientRect();
        popover.style.top = (rect.bottom + 4) + 'px';
        popover.style.left = rect.left + 'px';
        setTimeout(function () {
            var pr = popover.getBoundingClientRect();
            if (pr.right > window.innerWidth - 8) popover.style.left = (window.innerWidth - pr.width - 8) + 'px';
            if (pr.bottom > window.innerHeight - 8) popover.style.top = (rect.top - pr.height - 4) + 'px';
        }, 0);
        setTimeout(function () {
            function onOutside(e) {
                if (!popover.contains(e.target)) {
                    popover.remove();
                    document.removeEventListener('mousedown', onOutside);
                }
            }
            document.addEventListener('mousedown', onOutside);
        }, 10);
    }

    // ==========================================================
    // 応援予約モーダル（A5）
    // ==========================================================

    /**
     * 汎用モーダル骨格を生成
     * @param {string} title
     * @param {HTMLElement} bodyNode
     * @param {Array<{label: string, variant?: string, onClick: function}>} actions
     * @returns {{ overlay: HTMLElement, close: function }}
     */
    function openReservationModal(title, bodyNode, actions) {
        // 既存モーダル閉じる（多重起動防止）
        var existing = document.querySelector('.md-ws-modal-overlay');
        if (existing) existing.remove();

        var overlay = el('div', 'md-ws-modal-overlay');
        var content = el('div', 'md-ws-modal-content');

        var header = el('div', 'md-ws-modal-header');
        var titleEl = el('span', 'md-ws-modal-title', title);
        var closeBtn = el('button', 'md-ws-modal-close', '\u2715');
        closeBtn.addEventListener('click', function () { overlay.remove(); });
        header.appendChild(titleEl);
        header.appendChild(closeBtn);

        var body = el('div', 'md-ws-modal-body');
        body.appendChild(bodyNode);

        var footer = el('div', 'md-ws-modal-footer');
        (actions || []).forEach(function (a) {
            var btn = el('button', 'md-ws-modal-btn' + (a.variant ? ' md-ws-modal-btn-' + a.variant : ''), a.label);
            btn.addEventListener('click', function () { a.onClick({ close: function () { overlay.remove(); } }); });
            footer.appendChild(btn);
        });

        content.appendChild(header);
        content.appendChild(body);
        if (actions && actions.length) content.appendChild(footer);
        overlay.appendChild(content);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', onEsc);
            }
        });

        document.body.appendChild(overlay);
        return { overlay: overlay, close: function () { overlay.remove(); } };
    }

    /**
     * 人数ステッパー（−/＋ ボタン付き）
     */
    function createStepper(initialValue, onChange, opts) {
        opts = opts || {};
        var min = typeof opts.min === 'number' ? opts.min : 0;
        var wrap = el('div', 'md-ws-stepper');
        var dec = el('button', 'md-ws-stepper-btn', '\u2212');
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'md-ws-stepper-input';
        inp.min = String(min);
        inp.value = String(initialValue | 0);
        var inc = el('button', 'md-ws-stepper-btn', '\uff0b');

        function commit(v) {
            v = Math.max(min, v | 0);
            inp.value = String(v);
            if (onChange) onChange(v);
        }
        dec.addEventListener('click', function () { commit((parseInt(inp.value, 10) || 0) - 1); });
        inc.addEventListener('click', function () { commit((parseInt(inp.value, 10) || 0) + 1); });
        inp.addEventListener('change', function () { commit(parseInt(inp.value, 10) || 0); });

        wrap.appendChild(dec);
        wrap.appendChild(inp);
        wrap.appendChild(inc);

        wrap.getValue = function () { return parseInt(inp.value, 10) || 0; };
        wrap.setValue = function (v) { commit(v); };
        return wrap;
    }

    /**
     * 協力業者オートコンプリート
     * - 現GCの既存パートナー候補
     * - マッチしない文字列は「+ 新規登録」候補
     */
    function createPartnerAutocomplete(gcCode, opts) {
        opts = opts || {};
        var wrap = el('div', 'md-ws-pac');
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.className = 'md-ws-pac-input';
        inp.placeholder = '\u5354\u529b\u696d\u8005\u7565\u79f0\u3092\u5165\u529b\u2026';
        var list = el('div', 'md-ws-pac-list');
        list.style.display = 'none';

        var selected = null; // { id, shortName } または null（新規）

        function render() {
            var q = inp.value.trim();
            list.innerHTML = '';
            var partners = getActivePartners(gcCode);
            var excludeIds = opts.excludeIds || [];
            partners = partners.filter(function (p) { return excludeIds.indexOf(p.id) < 0; });
            var matches = q ? partners.filter(function (p) {
                return p.shortName.toLowerCase().indexOf(q.toLowerCase()) >= 0;
            }) : partners;

            matches.forEach(function (p) {
                var item = el('div', 'md-ws-pac-item', p.shortName);
                item.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    selected = { id: p.id, shortName: p.shortName, isNew: false };
                    inp.value = p.shortName;
                    list.style.display = 'none';
                    if (opts.onSelect) opts.onSelect(selected);
                });
                list.appendChild(item);
            });

            // 新規候補（マッチする既存がない or 完全一致しない）
            var exact = partners.some(function (p) { return p.shortName === q; });
            if (q && !exact) {
                var newItem = el('div', 'md-ws-pac-item md-ws-pac-item-new', '\uff0b \u65b0\u898f\u767b\u9332: ' + q);
                newItem.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    selected = { id: null, shortName: q, isNew: true };
                    inp.value = q;
                    list.style.display = 'none';
                    if (opts.onSelect) opts.onSelect(selected);
                });
                list.appendChild(newItem);
            }

            list.style.display = list.children.length ? 'block' : 'none';
        }

        inp.addEventListener('focus', render);
        inp.addEventListener('input', function () {
            selected = null;
            if (opts.onSelect) opts.onSelect(null);
            render();
        });
        inp.addEventListener('blur', function () {
            setTimeout(function () { list.style.display = 'none'; }, 120);
        });

        wrap.appendChild(inp);
        wrap.appendChild(list);
        wrap.getSelected = function () { return selected; };
        wrap.getQuery = function () { return inp.value.trim(); };
        wrap.focus = function () { inp.focus(); };
        return wrap;
    }

    /**
     * 単日モーダル: その日の応援予約を追加
     */
    function openReservationQuickModal(gcCode, dateKey) {
        var body = el('div', 'md-ws-res-quick-body');

        var dateLine = el('div', 'md-ws-res-quick-date');
        var d = new Date(dateKey + 'T00:00:00');
        var dow = ['\u65e5','\u6708','\u706b','\u6c34','\u6728','\u91d1','\u571f'][d.getDay()];
        dateLine.textContent = (d.getMonth() + 1) + '/' + d.getDate() + '(' + dow + ')';
        body.appendChild(dateLine);

        var gcLabel = groupCompaniesData.filter(function (g) { return g.code === gcCode; })[0];
        var gcLine = el('div', 'md-ws-res-quick-gc', '\u4f9d\u983c\u5143\uff1a' + (gcLabel ? gcLabel.shortName : gcCode));
        body.appendChild(gcLine);

        // 業者入力（入力欄＋候補バッジ一覧）
        var partnerField = el('div', 'md-ws-res-quick-field');
        partnerField.appendChild(el('label', 'md-ws-res-quick-label', '\u5354\u529b\u696d\u8005'));

        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'md-ws-res-quick-input';
        nameInput.placeholder = '\u7565\u79f0\u3092\u5165\u529b or \u4e0b\u306e\u30d0\u30c3\u30b8\u304b\u3089\u9078\u629e';
        partnerField.appendChild(nameInput);

        var hintLine = el('div', 'md-ws-res-quick-hint');
        partnerField.appendChild(hintLine);

        var badgeListLabel = el('div', 'md-ws-res-quick-badges-label', '\u5019\u88dc\u696d\u8005');
        partnerField.appendChild(badgeListLabel);
        var badgeList = el('div', 'md-ws-res-quick-badges');
        partnerField.appendChild(badgeList);

        body.appendChild(partnerField);

        // 人数ステッパー
        var countField = el('div', 'md-ws-res-quick-field');
        countField.appendChild(el('label', 'md-ws-res-quick-label', '\u4eba\u6570'));
        var stepper = createStepper(0, null, { min: 0 });
        countField.appendChild(stepper);
        body.appendChild(countField);

        var selectedPartnerId = null;

        function applyName(name) {
            var existing = getActivePartners(gcCode).filter(function (p) { return p.shortName === name; })[0];
            if (existing) {
                selectedPartnerId = existing.id;
                var current = getReservedCount(existing.id, dateKey);
                hintLine.textContent = current > 0
                    ? '\u73fe\u5728 ' + current + '\u540d\uff08\u5909\u66f4\u5f8c\u306e\u4eba\u6570\u3067\u4e0a\u66f8\u304d\u3055\u308c\u307e\u3059\uff09'
                    : '\u672a\u4e88\u7d04';
                stepper.setValue(current);
            } else if (name) {
                selectedPartnerId = null;
                hintLine.textContent = '\u65b0\u898f\u767b\u9332\uff08\u30de\u30b9\u30bf\u672a\u5b8c\u5099\u3068\u3057\u3066\u8b66\u544a\u30a2\u30a4\u30b3\u30f3\u4ed8\u4e0e\uff09';
                stepper.setValue(0);
            } else {
                selectedPartnerId = null;
                hintLine.textContent = '';
                stepper.setValue(0);
            }
            // バッジ選択状態を更新
            Array.from(badgeList.children).forEach(function (b) {
                b.classList.toggle('md-ws-res-quick-badge-selected', b.dataset.partnerName === name);
            });
        }

        function renderBadges() {
            badgeList.innerHTML = '';
            var partners = getActivePartners(gcCode);
            if (partners.length === 0) {
                var empty = el('div', 'md-ws-res-quick-badges-empty', '\u767b\u9332\u6e08\u307f\u306e\u5354\u529b\u696d\u8005\u306f\u3042\u308a\u307e\u305b\u3093');
                badgeList.appendChild(empty);
                return;
            }
            partners.forEach(function (p) {
                var badge = el('button', 'md-ws-res-quick-badge');
                badge.type = 'button';
                badge.dataset.partnerId = p.id;
                badge.dataset.partnerName = p.shortName;
                badge.appendChild(el('span', 'md-ws-res-quick-badge-name', p.shortName));
                var reserved = getReservedCount(p.id, dateKey);
                if (reserved > 0) {
                    badge.appendChild(el('span', 'md-ws-res-quick-badge-count', '\u4e88' + reserved));
                }
                badge.addEventListener('click', function () {
                    nameInput.value = p.shortName;
                    applyName(p.shortName);
                });
                badgeList.appendChild(badge);
            });
        }
        renderBadges();

        nameInput.addEventListener('input', function () {
            applyName(nameInput.value.trim());
        });

        openReservationModal((gcLabel ? gcLabel.shortName : gcCode) + ' \u5fdc\u63f4\u4e88\u7d04\u8ffd\u52a0', body, [
            { label: '\u30ad\u30e3\u30f3\u30bb\u30eb', variant: 'secondary', onClick: function (ctx) { ctx.close(); } },
            { label: '\u4fdd\u5b58', variant: 'primary', onClick: function (ctx) {
                var name = nameInput.value.trim();
                if (!name) {
                    alert('\u5354\u529b\u696d\u8005\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044');
                    return;
                }
                var count = stepper.getValue();
                var partnerId = selectedPartnerId;
                var oldCount = 0;
                if (!partnerId) {
                    // 入力文字列で新規登録（既存が無ければ）
                    var existing = getActivePartners(gcCode).filter(function (p) { return p.shortName === name; })[0];
                    partnerId = existing ? existing.id : addPartner(name, gcCode, { silent: true });
                } else {
                    oldCount = getReservedCount(partnerId, dateKey);
                }
                setReservedCount(partnerId, dateKey, count);
                var newOp = (oldCount === 0) ? 'add' : 'modify';
                wsCnSelfNotify('reservation', newOp, {
                    partnerName: wsCnGetPartnerName(partnerId),
                    day: wsCnGetDayLabel(dateKey),
                    count: count, oldCount: oldCount, newCount: count
                });
                ctx.close();
                renderGrid();
                renderSidebar();
            } }
        ]);

        setTimeout(function () { nameInput.focus(); }, 50);
    }

    /**
     * 週全体モーダル: 業者×日付マトリクス
     */
    function openReservationWeekModal(gcCode) {
        var dates = getVisibleDates();
        var body = el('div', 'md-ws-res-week-body');

        var gcLabel = groupCompaniesData.filter(function (g) { return g.code === gcCode; })[0];
        var intro = el('div', 'md-ws-res-week-intro', (gcLabel ? gcLabel.shortName : gcCode) + ' \u9031\u5168\u4f53\u306e\u4e88\u7d04\u4eba\u6570\u3092\u7de8\u96c6\u3002\u5909\u66f4\u306f\u5373\u6642\u53cd\u6620\u3055\u308c\u307e\u3059\u3002');
        body.appendChild(intro);

        var tableWrap = el('div', 'md-ws-res-week-tablewrap');
        var table = el('table', 'md-ws-res-week-table');
        var thead = el('thead');
        var headRow = el('tr');
        headRow.appendChild(el('th', 'md-ws-res-week-th-partner', '\u5354\u529b\u696d\u8005'));
        dates.forEach(function (d) {
            var dow = ['\u65e5','\u6708','\u706b','\u6c34','\u6728','\u91d1','\u571f'][d.getDay()];
            var th = el('th', 'md-ws-res-week-th-date', (d.getMonth() + 1) + '/' + d.getDate() + '\n(' + dow + ')');
            headRow.appendChild(th);
        });
        headRow.appendChild(el('th', 'md-ws-res-week-th-menu', ''));
        thead.appendChild(headRow);
        table.appendChild(thead);
        var tbody = el('tbody');
        table.appendChild(tbody);

        function renderBody() {
            tbody.innerHTML = '';
            var partners = getActivePartners(gcCode);
            partners.forEach(function (p) {
                var tr = el('tr');
                tr.dataset.partnerId = p.id;

                var nameTd = el('td', 'md-ws-res-week-td-partner');
                var nameSpan = el('span', 'md-ws-res-week-partner-name', p.shortName);
                nameTd.appendChild(nameSpan);
                if (!p.isMasterComplete) {
                    var warn = el('span', 'md-ws-res-week-partner-warn');
                    warn.innerHTML = WARN_ICON_SVG;
                    warn.title = '\u30de\u30b9\u30bf\u672a\u5b8c\u5099';
                    nameTd.appendChild(warn);
                }
                tr.appendChild(nameTd);

                dates.forEach(function (d) {
                    var dk = formatDateKey(d);
                    var td = el('td', 'md-ws-res-week-td-count');
                    var reserved = getReservedCount(p.id, dk);
                    var assigned = getAssignedCountForDate(p.id, dk);
                    var stepper = createStepper(reserved, function (v) {
                        // 配置済みより下には設定不可（整合性）
                        if (v < assigned) {
                            stepper.setValue(assigned);
                            return;
                        }
                        var oldVal = getReservedCount(p.id, dk);
                        setReservedCount(p.id, dk, v);
                        var stepOp = (oldVal === 0 && v > 0) ? 'add' : ((v === 0 && oldVal > 0) ? 'delete' : 'modify');
                        wsCnSelfNotify('reservation', stepOp, {
                            partnerName: p.shortName,
                            day: wsCnGetDayLabel(dk),
                            count: v, oldCount: oldVal, newCount: v
                        });
                        renderGrid();
                        renderSidebar();
                    }, { min: 0 });
                    if (assigned > 0) {
                        var asHint = el('span', 'md-ws-res-week-assigned-hint', '\u914d' + assigned);
                        asHint.title = '\u914d\u7f6e\u6e08\u307f';
                        td.appendChild(asHint);
                    }
                    td.appendChild(stepper);
                    tr.appendChild(td);
                });

                // ⋮ メニュー
                var menuTd = el('td', 'md-ws-res-week-td-menu');
                var menuBtn = el('button', 'md-ws-res-week-menu-btn', '\u22ee');
                menuBtn.title = '\u30e1\u30cb\u30e5\u30fc';
                (function (partner) {
                    menuBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        showPartnerRowMenu(menuBtn, partner, gcCode, renderBody);
                    });
                })(p);
                menuTd.appendChild(menuBtn);
                tr.appendChild(menuTd);

                tbody.appendChild(tr);
            });
        }
        renderBody();

        tableWrap.appendChild(table);
        body.appendChild(tableWrap);

        // ＋業者追加
        var addRow = el('div', 'md-ws-res-week-add-row');
        var addToggleBtn = el('button', 'md-ws-res-week-add-btn', '\uff0b \u696d\u8005\u8ffd\u52a0');
        var addPanel = el('div', 'md-ws-res-week-add-panel');
        addPanel.style.display = 'none';
        var addAc = createPartnerAutocomplete(gcCode, {
            excludeIds: getActivePartners(gcCode).map(function (p) { return p.id; })
        });
        var addConfirm = el('button', 'md-ws-modal-btn md-ws-modal-btn-primary', '\u767b\u9332');
        var addCancel = el('button', 'md-ws-modal-btn md-ws-modal-btn-secondary', '\u30ad\u30e3\u30f3\u30bb\u30eb');
        addPanel.appendChild(addAc);
        addPanel.appendChild(addConfirm);
        addPanel.appendChild(addCancel);

        addToggleBtn.addEventListener('click', function () {
            addPanel.style.display = addPanel.style.display === 'none' ? 'flex' : 'none';
            if (addPanel.style.display === 'flex') setTimeout(function () { addAc.focus(); }, 30);
        });
        addCancel.addEventListener('click', function () {
            addPanel.style.display = 'none';
        });
        addConfirm.addEventListener('click', function () {
            var sel = addAc.getSelected();
            var q = addAc.getQuery();
            if (!sel && !q) { alert('\u5354\u529b\u696d\u8005\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044'); return; }
            var name = sel ? sel.shortName : q;
            addPartner(name, gcCode);
            addPanel.style.display = 'none';
            renderBody();
            renderGrid();
            renderSidebar();
        });

        addRow.appendChild(addToggleBtn);
        addRow.appendChild(addPanel);
        body.appendChild(addRow);

        openReservationModal((gcLabel ? gcLabel.shortName : gcCode.toUpperCase()) + ' \u5fdc\u63f4\u4e88\u7d04 \u9031\u5168\u4f53\u7de8\u96c6', body, [
            { label: '\u9589\u3058\u308b', variant: 'primary', onClick: function (ctx) { ctx.close(); } }
        ]);
    }

    /**
     * 週全体モーダルの⋮メニュー
     */
    function showPartnerRowMenu(btnEl, partner, gcCode, onChange) {
        var existing = document.querySelector('.md-ws-res-week-row-menu');
        if (existing) existing.remove();

        var menu = el('div', 'md-ws-res-week-row-menu');
        var clearBtn = el('button', 'md-ws-res-week-row-menu-item', '\u3053\u306e\u9031\u306e\u4e88\u7d04\u3092\u30af\u30ea\u30a2');
        clearBtn.addEventListener('click', function () {
            getVisibleDates().forEach(function (d) {
                var dk = formatDateKey(d);
                var assigned = getAssignedCountForDate(partner.id, dk);
                setReservedCount(partner.id, dk, assigned); // 配置済みは残す
            });
            menu.remove();
            onChange();
            renderGrid();
            renderSidebar();
        });
        var deleteBtn = el('button', 'md-ws-res-week-row-menu-item md-ws-res-week-row-menu-danger', '\u30de\u30b9\u30bf\u304b\u3089\u524a\u9664');
        deleteBtn.addEventListener('click', function () {
            if (!confirm(partner.shortName + ' \u3092\u30de\u30b9\u30bf\u304b\u3089\u524a\u9664\u3057\u307e\u3059\u3002\u3088\u308d\u3057\u3044\u3067\u3059\u304b\uff1f')) return;
            deactivatePartner(partner.id);
            menu.remove();
            onChange();
            renderGrid();
            renderSidebar();
        });
        menu.appendChild(clearBtn);
        menu.appendChild(deleteBtn);

        document.body.appendChild(menu);
        var rect = btnEl.getBoundingClientRect();
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = (rect.right - 160) + 'px';
        setTimeout(function () {
            function onOutside(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('mousedown', onOutside);
                }
            }
            document.addEventListener('mousedown', onOutside);
        }, 10);
    }

    // サイドバータブ切替
    function wsSelectTab(tabId) {
        wsEmpTab.activeTab = tabId;
        renderSidebar();
    }

    function wsToggleCompany(gcCode) {
        if (wsEmpTab.expandedCompanies.has(gcCode)) {
            wsEmpTab.expandedCompanies.delete(gcCode);
        } else {
            wsEmpTab.expandedCompanies.add(gcCode);
        }
        // アクティブタブが閉じた会社のノードだった場合リセット
        if (wsEmpTab.activeTab !== 'all') {
            var units = orgUnitsData[gcCode] || [];
            var flatIds = [];
            function collectIds(nodes) {
                nodes.forEach(function (n) {
                    flatIds.push(n.id);
                    if (n.children) collectIds(n.children);
                });
            }
            collectIds(units);
            if (flatIds.indexOf(wsEmpTab.activeTab) >= 0 && !wsEmpTab.expandedCompanies.has(gcCode)) {
                wsEmpTab.activeTab = 'all';
            }
        }
        renderSidebar();
    }

    // 行スクロール＋フラッシュ（3秒間ゆっくり点滅）
    function scrollToRowAndFlash(selector) {
        var target = document.querySelector(selector);
        if (!target) return;

        // 折り畳まれている場合はグループを展開
        var groupId = target.dataset.groupId;
        if (groupId && collapsedGroups[groupId]) {
            delete collapsedGroups[groupId];
            renderGrid();
            renderSidebar();
            target = document.querySelector(selector);
            if (!target) return;
        }

        // グリッド行を取得してその行の全セルにフラッシュ適用
        var row = target.style.gridRow;
        var grid = document.getElementById('wsGrid');
        if (!grid) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 同じ行の全セルを取得（gridRowプロパティで比較）
        var allCells = grid.children;
        var flashTargets = [];
        for (var i = 0; i < allCells.length; i++) {
            if (allCells[i].style.gridRow === row || allCells[i].style.gridRow === String(row)) {
                flashTargets.push(allCells[i]);
            }
        }

        flashTargets.forEach(function (cell) {
            cell.classList.remove('md-ws-row-flash');
            // reflow
            void cell.offsetWidth;
            cell.classList.add('md-ws-row-flash');
        });

        // 3秒後にクラスを除去
        setTimeout(function () {
            flashTargets.forEach(function (cell) {
                cell.classList.remove('md-ws-row-flash');
            });
        }, 3000);
    }

    // --- 社員軸ビュー + 非選択 → 現場概要（既存相当） ---
    function renderSidebarSiteOverview() {
        var sidebar = document.querySelector('.md-ws-sidebar');
        if (!sidebar) return;

        var d = parseDate(selectedDate);
        var mm = d.getMonth() + 1;
        var dd = d.getDate();
        var dow = getDaysOfWeek()[d.getDay()];

        sidebar.innerHTML = '';

        var header = el('div', 'md-ws-sidebar-header');
        header.innerHTML =
            '<span class="md-ws-sidebar-date">' + mm + '\u6708' + dd + '\u65e5</span>' +
            '<span class="md-ws-sidebar-dow">(' + dow + ')</span>' +
            '<span style="flex:1;"></span>' +
            '<span style="font-size:10px;opacity:0.7;">\u73fe\u5834\u4e00\u89a7</span>';
        sidebar.appendChild(header);

        var body = el('div', 'md-ws-sidebar-body');
        var hasSites = false;

        wsSitesData.forEach(function (site) {
            var dayAssigned = getAssignedEmployees(site.id, selectedDate, 'day');
            var nightAssigned = getAssignedEmployees(site.id, selectedDate, 'night');
            var dayOrders = site.orders.day;
            var nightOrders = site.orders.night;

            if (dayOrders === 0 && nightOrders === 0) return;
            hasSites = true;

            var card = document.createElement('div');
            card.className = 'md-ws-site-card';
            card.dataset.siteId = site.id;

            var cardHeader = document.createElement('div');
            cardHeader.className = 'md-ws-site-card-header';

            var dragHandle = el('span', 'md-ws-drag-handle', '\u2807');
            cardHeader.appendChild(dragHandle);

            var name = el('div', 'md-ws-site-card-name', site.name);
            cardHeader.appendChild(name);

            if (dayOrders > 0) {
                cardHeader.appendChild(createStaffBadge(dayAssigned.length, dayOrders, 'day'));
            }
            if (nightOrders > 0) {
                cardHeader.appendChild(createStaffBadge(nightAssigned.length, nightOrders, 'night'));
            }

            var chevron = el('span', 'md-ws-site-card-chevron', '\u25b6');
            cardHeader.appendChild(chevron);

            cardHeader.addEventListener('click', function (e) {
                if (e.target.closest('.md-ws-drag-handle')) return;
                card.classList.toggle('md-ws-expanded');
            });

            card.appendChild(cardHeader);

            // ボディ（展開時）
            var cardBody = document.createElement('div');
            cardBody.className = 'md-ws-site-card-body';

            if (dayOrders > 0) {
                var daySection = document.createElement('div');
                daySection.className = 'md-ws-assigned-list';
                var dayLabel = el('div', 'md-ws-assigned-label');
                dayLabel.innerHTML = '<span class="md-ws-shift-badge md-ws-shift-day-badge">\u663c</span> \u914d\u7f6e ' + dayAssigned.length + '/' + dayOrders + '\u540d';
                daySection.appendChild(dayLabel);
                dayAssigned.forEach(function (empIdx) {
                    var emp = employeesData[empIdx];
                    if (!emp) return;
                    var row = el('div', 'md-ws-assigned-employee');
                    row.innerHTML = '<span class="md-ws-assigned-dot"></span>' + emp.name;
                    daySection.appendChild(row);
                });
                if (dayAssigned.length === 0) {
                    var empty = el('div', 'md-ws-assigned-employee');
                    empty.style.color = 'var(--text-disabled)';
                    empty.textContent = '\u672a\u914d\u7f6e';
                    daySection.appendChild(empty);
                }
                cardBody.appendChild(daySection);
            }

            if (nightOrders > 0) {
                var nightSection = document.createElement('div');
                nightSection.className = 'md-ws-assigned-list';
                var nightLabel = el('div', 'md-ws-assigned-label');
                nightLabel.innerHTML = '<span class="md-ws-shift-badge md-ws-shift-night-badge">\u591c</span> \u914d\u7f6e ' + nightAssigned.length + '/' + nightOrders + '\u540d';
                nightSection.appendChild(nightLabel);
                nightAssigned.forEach(function (empIdx) {
                    var emp = employeesData[empIdx];
                    if (!emp) return;
                    var row = el('div', 'md-ws-assigned-employee');
                    row.innerHTML = '<span class="md-ws-assigned-dot"></span>' + emp.name;
                    nightSection.appendChild(row);
                });
                if (nightAssigned.length === 0) {
                    var emptyN = el('div', 'md-ws-assigned-employee');
                    emptyN.style.color = 'var(--text-disabled)';
                    emptyN.textContent = '\u672a\u914d\u7f6e';
                    nightSection.appendChild(emptyN);
                }
                cardBody.appendChild(nightSection);
            }

            card.appendChild(cardBody);

            // D&D対応
            card.draggable = true;
            card.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-site',
                    siteId: site.id
                }));
                e.dataTransfer.effectAllowed = 'copy';
                card.style.opacity = '0.5';
                activateDragMode(selectedDate);
            });
            card.addEventListener('dragend', function () {
                card.style.opacity = '';
                deactivateDragMode();
            });

            body.appendChild(card);
        });

        if (!hasSites) {
            body.innerHTML = '<div class="md-ws-sidebar-empty">\u3053\u306e\u65e5\u306e\u73fe\u5834\u30c7\u30fc\u30bf\u306f\u3042\u308a\u307e\u305b\u3093</div>';
        }

        sidebar.appendChild(body);
    }

    function createStaffBadge(assigned, required, shift) {
        var badge = document.createElement('span');
        badge.className = 'md-ws-staff-indicator';
        if (assigned < required) {
            badge.classList.add('md-ws-staff-short');
        } else if (assigned > required) {
            badge.classList.add('md-ws-staff-over');
        } else {
            badge.classList.add('md-ws-staff-ok');
        }
        var shiftMark = shift === 'night' ? '\u591c' : '\u663c';
        badge.textContent = shiftMark + ' ' + assigned + '/' + required;
        return badge;
    }

    // ==========================================================
    // ナビゲーション
    // ==========================================================

    function onDateHeaderClick(dk) {
        deselectCell();
        selectedDate = dk;
        wsSyncCurrentDateToStore(dk);
        renderSidebar();
        // 日付ヘッダーハイライト
        document.querySelectorAll('.md-ws-date-header').forEach(function (h) {
            if (h.dataset.date === dk) {
                h.classList.add('md-ws-date-selected');
            } else {
                h.classList.remove('md-ws-date-selected');
            }
        });
    }

    function prevWeek() {
        deselectCell();
        wsSaveWeekToStore();
        viewStartDate.setDate(viewStartDate.getDate() - 7);
        selectedDate = formatDateKey(viewStartDate);
        wsSyncCurrentDateToStore(selectedDate);
        wsLoadWeekFromStore();
        renderGrid();
        renderSidebar();
    }

    function nextWeek() {
        deselectCell();
        wsSaveWeekToStore();
        viewStartDate.setDate(viewStartDate.getDate() + 7);
        selectedDate = formatDateKey(viewStartDate);
        wsSyncCurrentDateToStore(selectedDate);
        wsLoadWeekFromStore();
        renderGrid();
        renderSidebar();
    }

    function prevDay() {
        deselectCell();
        wsSaveWeekToStore();
        viewStartDate.setDate(viewStartDate.getDate() - 1);
        selectedDate = formatDateKey(viewStartDate);
        wsSyncCurrentDateToStore(selectedDate);
        wsLoadWeekFromStore();
        renderGrid();
        renderSidebar();
    }

    function nextDay() {
        deselectCell();
        wsSaveWeekToStore();
        viewStartDate.setDate(viewStartDate.getDate() + 1);
        selectedDate = formatDateKey(viewStartDate);
        wsSyncCurrentDateToStore(selectedDate);
        wsLoadWeekFromStore();
        renderGrid();
        renderSidebar();
    }

    function goToday() {
        deselectCell();
        viewStartDate = getWeekStart(today);
        selectedDate = formatDateKey(today);
        wsSyncCurrentDateToStore(selectedDate);
        wsLoadWeekFromStore();
        renderGrid();
        renderSidebar();
    }

    function updateMonthLabel() {
        var dates = getVisibleDates();
        var first = dates[0];
        var last = dates[dates.length - 1];

        var label = document.getElementById('wsMonthLabel');
        if (!label) return;

        var y1 = first.getFullYear();
        var y2 = last.getFullYear();
        var m1 = first.getMonth() + 1;
        var d1 = first.getDate();
        var m2 = last.getMonth() + 1;
        var d2 = last.getDate();

        // 年同一なら先頭に1回、月同一なら ～d2日、月を跨ぐと ～m2月d2日
        var text;
        if (y1 === y2) {
            text = (m1 === m2)
                ? y1 + '\u5e74 ' + m1 + '\u6708' + d1 + '\u65e5\uff5e' + d2 + '\u65e5'
                : y1 + '\u5e74 ' + m1 + '\u6708' + d1 + '\u65e5\uff5e' + m2 + '\u6708' + d2 + '\u65e5';
        } else {
            text = y1 + '\u5e74' + m1 + '\u6708' + d1 + '\u65e5\uff5e'
                 + y2 + '\u5e74' + m2 + '\u6708' + d2 + '\u65e5';
        }
        label.textContent = text;
    }

    // ツールバー右端の件数サマリ（stat-strip）
    function wsRenderStatStrip() {
        var strip = document.getElementById('wsStatStrip');
        if (!strip) return;
        var todayKey = formatDateKey(today);
        var offCount = getHolidayEmployees(todayKey).length;
        var maintCount = getMaintenanceVehicles(todayKey).length;
        strip.innerHTML =
            '<div class="stat"><span class="stat-label">休み(本日)</span><span class="stat-num">' + offCount + '人</span></div>' +
            '<div class="stat"><span class="stat-label">整備(本日)</span><span class="stat-num">' + maintCount + '台</span></div>';
    }

    function toggleGroup(groupId) {
        collapsedGroups[groupId] = !collapsedGroups[groupId];
        var isCollapsed = collapsedGroups[groupId];

        var groupName = document.querySelector('.md-ws-group-name[data-group-id="' + groupId + '"]');
        if (groupName) {
            groupName.classList.toggle('md-ws-collapsed', isCollapsed);
        }

        document.querySelectorAll('[data-group-id="' + groupId + '"]').forEach(function (el) {
            if (el.classList.contains('md-ws-group-name')) return;
            el.classList.toggle('md-ws-row-hidden', isCollapsed);
        });
    }

    // ==========================================================
    // ビュー切替
    // ==========================================================

    function switchView(mode) {
        if (viewMode === mode) return;
        viewMode = mode;
        wsSidebarMainTab = 'employee';
        deselectCell();
        collapsedGroups = {};

        // トグルボタン更新
        document.querySelectorAll('.md-ws-view-btn').forEach(function (btn) {
            btn.classList.toggle('md-ws-view-active', btn.dataset.view === mode);
        });

        // タイトル更新
        var title = document.querySelector('.md-ws-header-title');
        if (title) {
            title.textContent = mode === 'site' ? '\u73fe\u5834\u914d\u7f6e\u8868' : '\u793e\u54e1\u9031\u9593\u4e88\u5b9a\u8868';
        }

        renderGrid();
        renderSidebar();
    }

    // ==========================================================
    // テーマ
    // ==========================================================

    window.toggleTheme = function () {
        var htmlEl = document.documentElement;
        var isDark = htmlEl.getAttribute('data-theme') === 'dark';
        htmlEl.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme_v2', isDark ? 'light' : 'dark');
    };

    function restoreTheme() {
        var saved = localStorage.getItem('theme_v2');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // ==========================================================
    // 初期化
    // ==========================================================

    // 休みカスタムカーソル（SVG data URI を JS で生成）
    function initHolidayCursor() {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="22">' +
            '<rect width="40" height="22" rx="4" fill="#DB577B" opacity="0.92"/>' +
            '<text x="20" y="15.5" text-anchor="middle" fill="white" ' +
            'font-size="12" font-weight="700" font-family="system-ui,sans-serif">' +
            '\u4f11\u307f</text></svg>';
        var encoded = encodeURIComponent(svg);
        var style = document.createElement('style');
        style.textContent =
            '.md-ws-holiday-cursor{cursor:url("data:image/svg+xml,' +
            encoded + '") 0 0,pointer!important}';
        document.head.appendChild(style);
    }

    // ==========================================================
    // 変更通知（N-2.3 / N-2.4.5 自領域発信）
    // 旧 wsCn* ベル/パネル/サンプルデータは N-2.3 で撤去。
    // 共通ベルは co-notify-panel.js (window.coNotifyPanel) が管理。
    // ==========================================================

    function wsCnTodayLabel() {
        var d = wsDemoTodayDate();
        return '今日 (' + (d.getMonth() + 1) + '/' + d.getDate() + ')';
    }

    function wsCnTimeNow() {
        var d = new Date();
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function wsCnShiftLabel(shift) {
        if (shift === 'day')   return '昼';
        if (shift === 'night') return '夜';
        return '';
    }

    // ----- 名称取得ヘルパー（フック用） -----
    function wsCnGetSiteLabel(siteId) {
        if (!siteId) return '';
        for (var i = 0; i < wsSitesData.length; i++) {
            if (wsSitesData[i].id === siteId) {
                return wsSitesData[i].company + ' / ' + wsSitesData[i].name;
            }
        }
        return siteId;
    }

    function wsCnGetDayLabel(dateKey) {
        if (!dateKey) return '';
        var d = parseDate(dateKey);
        if (!d) return dateKey;
        return (d.getMonth() + 1) + '/' + d.getDate() + '日';
    }

    function wsCnGetEmpName(empIndex) {
        if (empIndex == null) return '';
        if (typeof employeesData === 'undefined') return '';
        var e = employeesData[empIndex];
        return e ? e.name : '';
    }

    function wsCnGetVehicleName(vehicleId) {
        if (!vehicleId) return '';
        if (typeof findVehicle !== 'function') return vehicleId;
        var v = findVehicle(vehicleId);
        return v ? (v.plate || v.model || vehicleId) : vehicleId;
    }

    function wsCnGetPartnerName(partnerId) {
        if (!partnerId) return '';
        var p = findPartner(partnerId);
        return p ? p.shortName : partnerId;
    }

    // 自領域発信: addItem('ws', ...) ラッパー (scope×op 形式 / N-2.4.5)
    // scope: 'schedule' (社員/車両配置) / 'reservation' (応援予約・協力業者)
    // op:    'add' / 'modify' / 'delete'
    // opts: { kind, empName, vehicleName, partnerName, siteName, day, shift,
    //         srcSite, srcDay, srcShift, dstSite, dstDay, dstShift,
    //         count, oldCount, newCount, siteId, dateKey, diffs, details, user }
    //   kind: 'partner' で協力業者 CRUD、それ以外は通常の予約 / 配置
    function wsCnSelfNotify(scope, op, opts) {
        if (!opts) opts = {};
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.addItem !== 'function') return;

        var opLabel = { add: '追加', modify: '編集', delete: '削除' }[op] || op;
        var mainText = '';

        // N-3.4.2: main 文言テンプレートは notify-compare.html 通知一覧 (N-3.4) 表が SSOT。
        //   schedule × add:    '{siteName}({day}) に {empOrVehicleName} を配置'
        //   schedule × modify: '{srcSite}({srcDay}) → {dstSite}({dstDay}) に {empOrVehicleName} を移動'
        //   schedule × delete: '{siteName}({day}) から {empOrVehicleName} を削除'
        if (scope === 'schedule') {
            var subject = opts.empName || opts.vehicleName || opts.subject || '';
            var siteStr = opts.siteName || '';
            var shiftStr = opts.shift ? ' [' + wsCnShiftLabel(opts.shift) + ']' : '';
            if (op === 'modify' && (opts.srcSite || opts.srcDay)) {
                // セル間移動
                var src = (opts.srcSite || siteStr) +
                          (opts.srcDay ? '(' + opts.srcDay + ')' : '') +
                          (opts.srcShift ? ' [' + wsCnShiftLabel(opts.srcShift) + ']' : '');
                var dst = (opts.dstSite || siteStr) +
                          (opts.dstDay ? '(' + opts.dstDay + ')' : '') +
                          (opts.dstShift ? ' [' + wsCnShiftLabel(opts.dstShift) + ']' : '');
                mainText = src + ' → ' + dst + ' に ' + subject + ' を移動';
            } else if (op === 'add') {
                mainText = siteStr + shiftStr + ' に ' + subject + ' を配置';
            } else if (op === 'delete') {
                mainText = siteStr + shiftStr + ' から ' + subject + ' を削除';
            } else {
                mainText = siteStr + shiftStr + ' の ' + subject + ' を編集';
            }
        } else if (scope === 'reservation') {
            if (opts.kind === 'partner') {
                mainText = '協力業者 ' + (opts.partnerName || '') + ' を' + opLabel;
            } else {
                var cnt = '';
                if (op === 'modify' && opts.oldCount != null && opts.newCount != null) {
                    cnt = '(' + opts.oldCount + '名 → ' + opts.newCount + '名)';
                } else if (opts.count != null) {
                    cnt = '(' + opts.count + '名)';
                }
                mainText = (opts.partnerName || '') +
                           (opts.day ? ' の ' + opts.day + ' 予約' : ' の予約') +
                           'を' + opLabel + cnt;
            }
        } else {
            mainText = scope + ' × ' + op;
        }

        var subText = (opts.user || '自分') + ' ・ ' + wsCnTimeNow();

        var expandText = '';
        if (opts.diffs && opts.diffs.length > 0) {
            expandText = opts.diffs.map(function (d) {
                return d.field + ': ' + d.oldVal + ' → ' + d.newVal;
            }).join(' / ');
        } else if (opts.details && opts.details.length > 0) {
            expandText = opts.details.map(function (d) {
                return d.field + ': ' + (d.value != null ? d.value : '');
            }).join(' / ');
        }

        var target = null;
        if (opts.siteId && opts.dateKey) {
            target = {
                'weekly-schedule': {
                    axis: 'wsCell',
                    value: opts.siteId,
                    date: opts.dateKey,
                    shift: opts.shift || opts.dstShift || '',
                    op: op
                }
            };
            var slSiteName = opts.siteName || opts.dstSite || opts.srcSite || '';
            if (slSiteName) {
                target['screen-layout'] = {
                    axis: 'siteName',
                    value: slSiteName,
                    date: opts.dateKey,
                    op: op
                };
            }
        }

        // R-2: 配置サブタグ (自社/応援/協力業者/車両・ETC) を実値から明示。
        //   パネル導出は domain=person-assignment を一律「自社」・support-reservation を一律「協力業者」と
        //   判定するため、車両配置(vehicleName)と応援予約(kind!=='partner')を取りこぼす。明示付与で補正する。
        var wsSubTag = '';
        if (scope === 'schedule') {
            wsSubTag = opts.vehicleName ? 'vehicle' : 'own';
        } else if (scope === 'reservation') {
            wsSubTag = opts.kind === 'partner' ? 'partner' : 'support';
        }
        // R-2: 対象日は変更されたセルの日付 (dateKey = 'YYYY-MM-DD')。単日配置変更なので単日で明示。
        var wsTargetDate = opts.dateKey || null;

        window.coNotifyPanel.addItem('ws', {
            scope: scope,
            op: op,
            domain: scope === 'reservation' ? 'support-reservation' : 'person-assignment',
            primaryPage: scope === 'reservation' ? 'weekly-schedule' : 'screen-layout',
            main: mainText,
            sub: subText,
            date: wsCnTodayLabel(),
            targetDate: wsTargetDate,
            subTag: wsSubTag || undefined,
            expand: expandText,
            diffs: opts.diffs || null,
            affects: scope === 'reservation'
                ? ['weekly-schedule', 'screen-layout']
                : ['weekly-schedule', 'screen-layout', 'leave-application'],
            target: target
        });
    }

    // 初期デモ通知（起動時投入。モック用 / N-2.4.5 確定の代表 3 件）
    function wsCnSeedInitialDemo() {
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.setItems !== 'function') return;
        var today = wsCnTodayLabel();
        var items = [];
        var assignmentHits = [];
        Object.keys(assignments || {}).forEach(function (empIdx) {
            Object.keys(assignments[empIdx] || {}).forEach(function (dateKey) {
                Object.keys(assignments[empIdx][dateKey] || {}).forEach(function (shift) {
                    (assignments[empIdx][dateKey][shift] || []).forEach(function (siteId) {
                        if (assignmentHits.length < 2) {
                            assignmentHits.push({ empIdx: +empIdx, dateKey: dateKey, shift: shift, siteId: siteId });
                        }
                    });
                });
            });
        });
        assignmentHits.forEach(function (hit, idx) {
            var emp = employeesData[hit.empIdx] || {};
            var site = findSite(hit.siteId) || {};
            items.push({
                scope: 'schedule',
                op: idx === 0 ? 'add' : 'modify',
                main: (site.name || hit.siteId) + '(' + wsCnGetDayLabel(hit.dateKey) + ') [' + wsCnShiftLabel(hit.shift) + '] に ' + (emp.name || '社員') + (idx === 0 ? ' を配置' : ' を移動'),
                sub: '共通週間予定データ ・ ' + today,
                date: today,
                expand: '社員: ' + (emp.name || '') + ' / 所属: ' + (emp.company || '') + ' / 現場: ' + (site.company || ''),
                affects: ['weekly-schedule', 'screen-layout'],
                target: { axis: 'wsCell', value: hit.siteId, date: hit.dateKey, shift: hit.shift, op: idx === 0 ? 'add' : 'modify' }
            });
        });

        var reservationItem = null;
        Object.keys(supportReservations || {}).some(function (partnerId) {
            var partner = supportPartners.find(function (p) { return p.id === partnerId; });
            return Object.keys(supportReservations[partnerId] || {}).some(function (dateKey) {
                var count = getReservedCount(partnerId, dateKey);
                if (count <= 0) return false;
                reservationItem = {
                    scope: 'reservation',
                    op: 'add',
                    main: (partner ? partner.shortName : partnerId) + ' の ' + wsCnGetDayLabel(dateKey) + ' 予約を追加(' + count + '名)',
                    sub: '共通応援予約データ ・ ' + today,
                    date: today,
                    expand: '協力業者: ' + (partner ? (partner.formalName || partner.shortName) : partnerId) + ' / フレックス ' + count + '名',
                    affects: ['weekly-schedule', 'screen-layout']
                };
                return true;
            });
        });
        if (reservationItem) items.push(reservationItem);
        window.coNotifyPanel.setItems('ws', items);
    }

    function wsCnShowFocus(targets, candidateSelector) {
        if (window.coNotifyFocusOverlay && typeof window.coNotifyFocusOverlay.show === 'function') {
            window.coNotifyFocusOverlay.show(targets, {
                candidateSelector: candidateSelector
            });
        }
    }

    // 通知ジャンプ着地用: 対象セルを残し、周辺セルだけ薄暗くして2秒で消す
    function wsCnHighlightCell(siteId, dateKey, shift, type) {
        var sel = '.md-ws-cell[data-site-id="' + siteId + '"][data-date="' + dateKey + '"]';
        if (shift) sel += '[data-shift="' + shift + '"]';
        var targets = document.querySelectorAll(sel);
        if (targets.length === 0) return;
        targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        wsCnShowFocus(targets, '.md-ws-cell');
    }

    function wsCnHighlightHolidayDate(dateKey, type) {
        var target = document.querySelector('.md-ws-holiday-row-cell[data-date="' + dateKey + '"][data-shift="day"]') ||
                     document.querySelector('.md-ws-holiday-row-cell[data-date="' + dateKey + '"]');
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        wsCnShowFocus(target, '.md-ws-holiday-row-cell');
    }

    function wsCnFindSiteByLabel(label) {
        var value = String(label || '');
        if (!value) return null;
        return wsSitesData.find(function (s) {
            var full = (s.company || '') + ' / ' + (s.name || '');
            return s.id === value || s.name === value || full === value ||
                (!!s.name && value.indexOf(s.name) >= 0) || full.indexOf(value) >= 0;
        }) || null;
    }

    function wsCnSiteIdFromOrderId(orderId) {
        if (!window.OmsMockStore || !window.OmsMockStore.getObMonth) return '';
        var key = window.OmsMockStore.getCurrentDate ? window.OmsMockStore.getCurrentDate() : WS_DEFAULT_DATE_KEY;
        var parts = window.OmsMockStore.dateToParts ? window.OmsMockStore.dateToParts(key) : null;
        if (!parts) return '';
        var monthState = window.OmsMockStore.getObMonth(parts.year, parts.month);
        if (!monthState || !Array.isArray(monthState.sampleRows)) return '';
        var row = monthState.sampleRows.find(function (r) { return r && String(r._rowId) === String(orderId); });
        var site = row ? wsCnFindSiteByLabel(row.task) : null;
        return site ? site.id : '';
    }

    // cn:jump イベント (新システム / §6.5 仕様準拠) — WS ベル発信通知のクリックで該当セルに着地
    document.addEventListener('cn:jump', function (e) {
        var d = e.detail || {};
        if (d.inContext !== true) return;
        var target = d.target;
        if (!target) return;
        if (target.axis === 'leaveId') {
            var leaves = window.OmsMockStore && window.OmsMockStore.getLeaveApplications
                ? window.OmsMockStore.getLeaveApplications()
                : [];
            var lv = (leaves || []).find(function (x) { return String(x.id) === String(target.value); });
            if (!lv || !lv.date) return;
            var leaveDate = parseDate(lv.date);
            var leaveNeedsRender = false;
            if (viewMode !== 'site') {
                switchView('site');
                leaveNeedsRender = true;
            }
            if (leaveDate < viewStartDate || leaveDate >= new Date(viewStartDate.getTime() + visibleWeeks * 7 * 86400000)) {
                viewStartDate = getWeekStart(leaveDate);
                renderGrid();
                renderSidebar();
                leaveNeedsRender = true;
            }
            setTimeout(function () { wsCnHighlightHolidayDate(lv.date, d.op || d.type || 'modify'); }, leaveNeedsRender ? 100 : 0);
            return;
        }
        var siteId = '';
        if (target.axis === 'wsCell') siteId = target.value;
        else if (target.axis === 'siteName') {
            var site = wsCnFindSiteByLabel(target.value);
            siteId = site ? site.id : '';
        } else if (target.axis === 'orderId') {
            siteId = wsCnSiteIdFromOrderId(target.value);
        }
        if (!siteId) return;
        var dateKey = target.date || selectedDate || formatDateKey(wsCurrentStoreDate());
        var shift = target.shift || '';
        var op = target.op || d.op || d.type || 'modify';
        var needsRender = false;
        if (viewMode !== 'site') {
            switchView('site');
            needsRender = true;
        }
        var dd = parseDate(dateKey);
        if (dd < viewStartDate || dd >= new Date(viewStartDate.getTime() + visibleWeeks * 7 * 86400000)) {
            viewStartDate = getWeekStart(dd);
            renderGrid();
            renderSidebar();
            needsRender = true;
        }
        setTimeout(function () { wsCnHighlightCell(siteId, dateKey, shift, op); }, needsRender ? 100 : 0);
    });

    function init() {
        restoreTheme();
        today = wsDemoTodayDate();
        var current = wsCurrentStoreDate();
        viewStartDate = getWeekStart(current);
        selectedDate = formatDateKey(current);
        wsLoadWeekFromStore();
        initHolidayCursor();

        // ツールバーにビュー切替ボタンを注入
        injectViewToggle();

        // ナビゲーションボタン
        var prevWeekBtn = document.getElementById('wsPrevWeek');
        var nextWeekBtn = document.getElementById('wsNextWeek');
        var prevDayBtn = document.getElementById('wsPrevDay');
        var nextDayBtn = document.getElementById('wsNextDay');
        var todayBtn = document.getElementById('wsTodayBtn');
        if (prevWeekBtn) prevWeekBtn.addEventListener('click', prevWeek);
        if (nextWeekBtn) nextWeekBtn.addEventListener('click', nextWeek);
        if (prevDayBtn) prevDayBtn.addEventListener('click', prevDay);
        if (nextDayBtn) nextDayBtn.addEventListener('click', nextDay);
        if (todayBtn) todayBtn.addEventListener('click', goToday);

        // 共通GCフィルタ変更イベントを受けて画面を更新
        document.addEventListener('gcFilterChanged', function () {
            deselectCell();
            renderGrid();
            renderSidebar();
        });

        window.addEventListener('storage', function(e) {
            if (!window.OmsMockStore || e.key !== window.OmsMockStore.key) return;
            var parts = window.OmsMockStore.dateToParts(window.OmsMockStore.getCurrentDate());
            var currentKey = parts.year + '-' + String(parts.month).padStart(2, '0') + '-' + String(parts.day).padStart(2, '0');
            today = wsDemoTodayDate();
            selectedDate = currentKey;
            var currentDateObj = parseDate(currentKey);
            if (currentDateObj < viewStartDate || currentDateObj >= new Date(viewStartDate.getTime() + visibleWeeks * 7 * 86400000)) {
                wsSaveWeekToStore();
                viewStartDate = getWeekStart(currentDateObj);
                wsLoadWeekFromStore();
            } else {
                wsApplyLeaveApplications();
            }
            renderGrid();
            renderSidebar();
        });

        // Escキーで選択解除
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                deselectCell();
            }
            // Tab キーでビュー切替
            if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                var active = document.activeElement;
                // input等にフォーカスがない場合のみ
                if (!active || active === document.body || active.closest('.ws-app')) {
                    e.preventDefault();
                    switchView(viewMode === 'site' ? 'employee' : 'site');
                }
            }
        });

        // グリッド外クリックで選択解除
        document.addEventListener('click', function (e) {
            // DOM再構築でターゲットが切断済みの場合は無視（タブ切替等）
            if (!e.target.isConnected) return;
            if (selectedCell && !e.target.closest('.md-ws-cell') &&
                !e.target.closest('.md-ws-sidebar') &&
                !e.target.closest('.md-ws-candidate-item')) {
                deselectCell();
            }
        });

        // タイトル初期設定
        var title = document.querySelector('.md-ws-header-title');
        if (title) {
            title.textContent = '\u73fe\u5834\u914d\u7f6e\u8868';
        }

        renderGrid();
        renderSidebar();
        onDateHeaderClick(selectedDate);

        // 変更通知デモ初期投入（共通ベル co-notify-panel が管理）
        wsCnSeedInitialDemo();
    }

    function injectViewToggle() {
        var toolbar = document.querySelector('.md-ws-toolbar');
        if (!toolbar) return;

        // ビュー切替トグル（ツールバーの一番左に挿入）
        var toggle = el('div', 'md-ws-view-toggle');

        var siteBtn = el('button', 'md-ws-view-btn md-ws-view-active', '\u73fe\u5834\u8ef8');
        siteBtn.dataset.view = 'site';
        siteBtn.addEventListener('click', function () { switchView('site'); });

        var empBtn = el('button', 'md-ws-view-btn', '\u793e\u54e1\u8ef8');
        empBtn.dataset.view = 'employee';
        empBtn.addEventListener('click', function () { switchView('employee'); });

        toggle.appendChild(siteBtn);
        toggle.appendChild(empBtn);

        // タイトル直後・期間ナビ群の直前に挿入
        var navGroup = toolbar.querySelector('.md-ws-nav-group');
        if (navGroup) {
            toolbar.insertBefore(toggle, navGroup);
        } else {
            toolbar.insertBefore(toggle, toolbar.firstChild);
        }
    }

    // GCフィルタモーダル関連は共通ナビバー(co-navbar.js)に移動済み

    // DOMReady
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
