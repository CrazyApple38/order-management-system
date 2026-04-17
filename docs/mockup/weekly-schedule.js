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

    var assignments = {};
    var vehicleAssignments = {};
    var holidays = {};
    var vehicleMaintenance = {}; // vehicleId -> { dateKey: true }

    // 応援社員バッジ
    // { id: 'sup-1', label: 'A社①', company: 'touo', isActive: true, isPreset: false }
    var wsSupportWorkers = [];
    var supportAssignments = {}; // id -> { dateKey -> { shift -> [siteIds] } }
    var nextSupportId = 1;

    // プリセット「応援」バッジ初期化（各GCに1つ）
    (function initPresetSupportBadges() {
        groupCompaniesData.forEach(function (gc) {
            var id = 'sup-preset-' + gc.code;
            wsSupportWorkers.push({
                id: id, label: '\u5fdc\u63f4', company: gc.code,
                isActive: true, isPreset: true
            });
        });
    })();

    // ==========================================================
    // 状態管理
    // ==========================================================

    var today = new Date(2026, 3, 9);
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
    var dragSourceDate = null;   // セル起点D&D時の元日付（同日限定用）
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

    var holidayDates = { '2026-04-29': '\u662d\u548c\u306e\u65e5' };

    function parseDate(dk) {
        var parts = dk.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    // ==========================================================
    // デモ初期配置
    // ==========================================================

    function generateDemoAssignments() {
        assignments = {};
        vehicleAssignments = {};
        holidays = {};
        vehicleMaintenance = {};

        var dates = getVisibleDates();
        var empCount = employeesData.length;

        holidays[2] = {}; holidays[2][formatDateKey(dates[3])] = true;
        holidays[5] = {}; holidays[5][formatDateKey(dates[1])] = true;
        holidays[7] = {}; holidays[7][formatDateKey(dates[5])] = true;
        holidays[10] = {}; holidays[10][formatDateKey(dates[2])] = true;

        var samplePlacements = [
            { emp: 0, dayOffset: 0, shift: 'day', site: 's1' },
            { emp: 0, dayOffset: 1, shift: 'day', site: 's1' },
            { emp: 0, dayOffset: 2, shift: 'day', site: 's1' },
            { emp: 1, dayOffset: 0, shift: 'day', site: 's1' },
            { emp: 1, dayOffset: 0, shift: 'night', site: 's2' },
            { emp: 1, dayOffset: 1, shift: 'day', site: 's1' },
            { emp: 3, dayOffset: 0, shift: 'day', site: 's3' },
            { emp: 3, dayOffset: 1, shift: 'day', site: 's3' },
            { emp: 4, dayOffset: 0, shift: 'day', site: 's3' },
            { emp: 4, dayOffset: 2, shift: 'day', site: 's4' },
            { emp: 6, dayOffset: 0, shift: 'day', site: 's3' },
            { emp: 6, dayOffset: 0, shift: 'night', site: 's4' },
            { emp: 8, dayOffset: 1, shift: 'day', site: 's5' },
            { emp: 8, dayOffset: 2, shift: 'day', site: 's5' },
            { emp: 9, dayOffset: 0, shift: 'day', site: 's2' },
            { emp: 9, dayOffset: 1, shift: 'day', site: 's2' },
            { emp: 11, dayOffset: 0, shift: 'day', site: 's4' },
            { emp: 11, dayOffset: 1, shift: 'day', site: 's4' },
            { emp: 11, dayOffset: 1, shift: 'night', site: 's5' },
            { emp: 12, dayOffset: 0, shift: 'day', site: 's5' },
            { emp: 12, dayOffset: 1, shift: 'day', site: 's5' },
            { emp: 14, dayOffset: 2, shift: 'day', site: 's1' },
            { emp: 17, dayOffset: 0, shift: 'day', site: 's6' },
            { emp: 18, dayOffset: 0, shift: 'day', site: 's6' },
            { emp: 19, dayOffset: 0, shift: 'day', site: 's6' },
            { emp: 20, dayOffset: 0, shift: 'day', site: 's6' },
            { emp: 21, dayOffset: 0, shift: 'day', site: 's4' },
            // 休日出勤テストケース（emp5=林 は dayOffset1=4/7に休みだが出勤）
            { emp: 5, dayOffset: 1, shift: 'day', site: 's3' }
        ];

        samplePlacements.forEach(function (p) {
            if (p.emp >= empCount) return;
            var dk = formatDateKey(dates[p.dayOffset]);
            if (!assignments[p.emp]) assignments[p.emp] = {};
            if (!assignments[p.emp][dk]) assignments[p.emp][dk] = {};
            // 1セル1現場: 最初の1つだけ保持
            if (assignments[p.emp][dk][p.shift]) return;
            assignments[p.emp][dk][p.shift] = [p.site];
        });

        var dk0 = formatDateKey(dates[0]);
        var dk1 = formatDateKey(dates[1]);
        vehicleAssignments[dk0] = { day: {}, night: {} };
        vehicleAssignments[dk0].day['s1'] = 'v1';
        vehicleAssignments[dk0].day['s3'] = 'v2';
        vehicleAssignments[dk0].night['s4'] = 'v2';
        vehicleAssignments[dk1] = { day: {}, night: {} };
        vehicleAssignments[dk1].day['s5'] = 'v3';

        // 車両修理/点検デモデータ
        vehicleMaintenance['v4'] = {};
        vehicleMaintenance['v4'][formatDateKey(dates[0])] = true;
        vehicleMaintenance['v4'][formatDateKey(dates[1])] = true;
        vehicleMaintenance['v4'][formatDateKey(dates[2])] = true;
        vehicleMaintenance['v5'] = {};
        vehicleMaintenance['v5'][formatDateKey(dates[3])] = true;
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
    // 応援社員バッジ管理
    // ==========================================================

    function addSupportWorker(label, gcCode) {
        var id = 'sup-' + nextSupportId++;
        wsSupportWorkers.push({ id: id, label: label, company: gcCode, isActive: true });
        return id;
    }

    function removeSupportWorker(supId) {
        // ソフトデリート: isActive = false（配置データは保持）
        var sw = wsSupportWorkers.find(function (s) { return s.id === supId; });
        if (sw) sw.isActive = false;
    }

    function addSupportAssignment(supId, date, shift, siteId) {
        if (!supportAssignments[supId]) supportAssignments[supId] = {};
        if (!supportAssignments[supId][date]) supportAssignments[supId][date] = {};
        var sw = wsSupportWorkers.find(function (s) { return s.id === supId; });
        if (sw && sw.isPreset) {
            // プリセット: 複数セル・同一セル複数配置可能
            if (!supportAssignments[supId][date][shift]) supportAssignments[supId][date][shift] = [];
            supportAssignments[supId][date][shift].push(siteId);
        } else {
            // 通常: 1セル1現場（上書き）
            supportAssignments[supId][date][shift] = [siteId];
        }
    }

    function removeSupportAssignment(supId, date, shift, siteId) {
        if (!supportAssignments[supId] || !supportAssignments[supId][date] || !supportAssignments[supId][date][shift]) return;
        var arr = supportAssignments[supId][date][shift];
        var idx = arr.indexOf(siteId);
        if (idx >= 0) arr.splice(idx, 1);
    }

    function getAssignedSupportWorkers(siteId, dateKey, shift) {
        var result = [];
        Object.keys(supportAssignments).forEach(function (supId) {
            var sa = supportAssignments[supId];
            if (sa && sa[dateKey] && sa[dateKey][shift]) {
                var sw = wsSupportWorkers.find(function (s) { return s.id === supId; });
                if (!sw) return;
                // プリセットは同一セルに複数配置可能 → 出現回数分pushする
                sa[dateKey][shift].forEach(function (sid) {
                    if (sid === siteId) result.push(sw);
                });
            }
        });
        return result;
    }

    function getSupportAssignedSites(supId, dateKey, shift) {
        var sa = supportAssignments[supId];
        if (!sa || !sa[dateKey] || !sa[dateKey][shift]) return [];
        return sa[dateKey][shift].slice();
    }

    function isSupportBusy(supId, dateKey, shift) {
        var sw = wsSupportWorkers.find(function (s) { return s.id === supId; });
        if (sw && sw.isPreset) return false; // プリセットは常に配置可能
        return getSupportAssignedSites(supId, dateKey, shift).length > 0;
    }

    function getActiveSupportWorkers(gcCode) {
        return wsSupportWorkers.filter(function (sw) {
            return sw.company === gcCode && sw.isActive;
        });
    }

    // プリセット応援の表示ラベル: GC shortName ｜ 応援
    function getSupportDisplayLabel(sw) {
        if (!sw.isPreset) return sw.label;
        var gc = groupCompaniesData.find(function (g) { return g.code === sw.company; });
        var short = gc ? gc.shortName : '';
        return short ? short + '\uff5c' + sw.label : sw.label;
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
            var sites = wsSitesData.filter(function (s) { return s.category === cat; });
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

    function findSite(id) {
        for (var i = 0; i < wsSitesData.length; i++) {
            if (wsSitesData[i].id === id) return wsSitesData[i];
        }
        return null;
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
        if (viewMode === 'site') {
            renderSiteGrid();
        } else {
            renderEmployeeGrid();
        }
        updateMonthLabel();
        fixStickyHeaderTops();
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
        corner2.style.borderBottom = '2px solid var(--sub-secondary)';
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
                nameCell.title = site.company + ' / ' + site.name;
                nameCell.innerHTML = '<span style="flex:1;min-width:0;display:flex;flex-direction:column;"><span class="md-ws-name-client">' +
                    truncate(site.company, 14) + '</span><span class="md-ws-name-site">' +
                    truncate(site.name, 12) + '</span></span>';
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
                        var assignedSup = getAssignedSupportWorkers(site.id, dk, shift);
                        var totalAssigned = assignedEmps.length + assignedSup.length;

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
                                    activateDragMode(dk);
                                });
                                chip.addEventListener('dragend', function () {
                                    chip.classList.remove('md-ws-dragging');
                                    deactivateDragMode();
                                });
                            }
                            cell.appendChild(chip);
                        });

                        // 配置済み応援社員チップ
                        var assignedSupport = getAssignedSupportWorkers(site.id, dk, shift);
                        assignedSupport.forEach(function (sw) {
                            var chipCls = 'md-ws-emp-chip md-ws-support-chip';
                            if (sw.isPreset) chipCls += ' md-ws-support-chip-preset';
                            if (shift === 'night') chipCls += ' md-ws-night-chip';
                            var chip = el('div', chipCls);
                            chip.dataset.supportId = sw.id;
                            chip.title = sw.isPreset ? '\u30af\u30ea\u30c3\u30af\u3067\u696d\u8005\u3092\u7d10\u4ed8\u3051' : sw.label;

                            var nameSpan = document.createElement('span');
                            nameSpan.textContent = getSupportDisplayLabel(sw);
                            chip.appendChild(nameSpan);

                            if (!isPast) {
                                // プリセット: クリック→業者紐付けポップオーバー
                                if (sw.isPreset) {
                                    chip.style.cursor = 'pointer';
                                    (function (swRef, siteRef, dateKey, shiftKey, chipRef) {
                                        chipRef.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            showLinkPopover(chipRef, swRef.id, siteRef.id, dateKey, shiftKey, swRef.company);
                                        });
                                    })(sw, site, dk, shift, chip);
                                }

                                // ×ボタン
                                var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                removeBtn.addEventListener('click', function (e) {
                                    e.stopPropagation();
                                    removeSupportAssignment(sw.id, dk, shift, site.id);
                                    renderGrid();
                                    renderSidebar();
                                });
                                chip.appendChild(removeBtn);

                                // D&D対応
                                chip.draggable = true;
                                chip.addEventListener('dragstart', function (e) {
                                    e.dataTransfer.setData('text/plain', JSON.stringify({
                                        type: sw.isPreset ? 'sidebar-support' : 'move-support',
                                        supportId: sw.id,
                                        fromSiteId: site.id,
                                        fromDate: dk,
                                        fromShift: shift
                                    }));
                                    e.dataTransfer.effectAllowed = sw.isPreset ? 'copy' : 'move';
                                    chip.classList.add('md-ws-dragging');
                                    dragSourceDate = dk;
                                    activateDragMode(dk);
                                });
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
                                            activateDragMode(dkk);
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
        corner2.style.borderBottom = '2px solid var(--sub-secondary)';
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
                                    chip.appendChild(document.createTextNode(truncate(site.name, 8)));
                                    if (csInfo.hasNext) {
                                        chip.appendChild(el('span', 'md-ws-chip-arrow md-ws-chip-arrow-next', '\u25b2'));
                                    }
                                    chip.title = site.company + ' / ' + site.name;
                                    if (!isPast) {
                                        // ×ボタン（ホバーで表示）
                                        var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                        removeBtn.addEventListener('click', function (e) {
                                            e.stopPropagation();
                                            removeAssignment(emp.index, dk, shift, siteId);
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
                                            activateDragMode(dk);
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
                            chip.appendChild(document.createTextNode(truncate(site.name, 8)));
                            chip.title = site.company + ' / ' + site.name;
                            if (!isPast) {
                                var removeBtn = el('span', 'md-ws-chip-remove', '\u00d7');
                                removeBtn.addEventListener('click', function (e) {
                                    e.stopPropagation();
                                    removeVehicleAssignment(dk, shift, siteId);
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
                                    activateDragMode(dk);
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

    function activateDragMode(dateKey) {
        dragActive = true;
        dragTargetDate = dateKey;
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        grid.classList.add('md-ws-drag-active');
        grid.querySelectorAll('[data-date="' + dateKey + '"]').forEach(function (el) {
            el.classList.add('md-ws-col-highlighted');
        });
    }

    function deactivateDragMode() {
        dragActive = false;
        dragTargetDate = null;
        dragSourceDate = null;
        dragEmpIndex = null;
        hideHolidayFloat();
        var grid = document.getElementById('wsGrid');
        if (!grid) return;
        grid.classList.remove('md-ws-drag-active');
        grid.querySelectorAll('.md-ws-col-highlighted').forEach(function (el) {
            el.classList.remove('md-ws-col-highlighted');
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

        // セル起点D&Dは同日限定
        if (dragSourceDate && cellDate !== dragSourceDate) return;

        // 社員ドラッグ中：ドロップ先日付で休みなら「休み」フロート表示
        if (dragEmpIndex !== null && isEmployeeOnHoliday(dragEmpIndex, cellDate)) {
            showHolidayFloat(e.clientX, e.clientY);
        } else {
            hideHolidayFloat();
        }

        e.preventDefault();
        e.dataTransfer.dropEffect = dragSourceDate ? 'move' : 'copy';
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

    // 現場軸ビュー用ドロップ
    function onCellDropSiteView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var siteId = cell.dataset.siteId;
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (data.type === 'sidebar-emp') {
            addAssignment(data.empIndex, date, shift, siteId);
        } else if (data.type === 'move-emp') {
            removeAssignment(data.empIndex, data.fromDate, data.fromShift, data.fromSiteId);
            addAssignment(data.empIndex, date, shift, siteId);
        } else if (data.type === 'sidebar-support') {
            addSupportAssignment(data.supportId, date, shift, siteId);
        } else if (data.type === 'move-support') {
            removeSupportAssignment(data.supportId, data.fromDate, data.fromShift, data.fromSiteId);
            addSupportAssignment(data.supportId, date, shift, siteId);
        } else if (data.type === 'sidebar-vehicle') {
            addVehicleAssignment(date, shift, siteId, data.vehicleId);
        } else if (data.type === 'move-vehicle') {
            removeVehicleAssignment(data.fromDate, data.fromShift, data.fromSiteId);
            addVehicleAssignment(date, shift, siteId, data.vehicleId);
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
    }

    // 社員軸ビュー用ドロップ
    function onCellDropEmployeeView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var empIndex = parseInt(cell.dataset.empIndex);
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (data.type === 'sidebar-site') {
            addAssignment(empIndex, date, shift, data.siteId);
        } else if (data.type === 'move-chip') {
            removeAssignment(data.fromEmpIndex, data.fromDate, data.fromShift, data.siteId);
            addAssignment(empIndex, date, shift, data.siteId);
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
    }

    // 車両セル用ドロップ
    function onCellDropVehicleView(e) {
        e.preventDefault();
        var cell = e.currentTarget;
        cell.classList.remove('md-ws-drag-over');

        var raw = e.dataTransfer.getData('text/plain');
        if (!raw) return;
        var data;
        try { data = JSON.parse(raw); } catch (_) { return; }

        var vehicleId = cell.dataset.vehicleId;
        var date = cell.dataset.date;
        var shift = cell.dataset.shift;

        if (data.type === 'sidebar-site') {
            addVehicleAssignment(date, shift, data.siteId, vehicleId);
        } else if (data.type === 'move-vehicle-chip') {
            removeVehicleAssignment(data.fromDate, data.fromShift, data.siteId);
            addVehicleAssignment(date, shift, data.siteId, vehicleId);
        }

        deactivateDragMode();
        renderGrid();
        renderSidebar();
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

        var currentAssignedSupport = getAssignedSupportWorkers(sc.siteId, sc.date, sc.shift);

        if (wsEmpTab.activeTab === 'all') {
            visibleCompanies.forEach(function (gc) {
                var companyEmps = filtered.filter(function (emp) { return emp.company === gc.code; });
                if (companyEmps.length === 0 && getActiveSupportWorkers(gc.code).length === 0) return;
                var sectionLabel = el('div', 'md-ws-gc-section-label', gc.shortName);
                content.appendChild(sectionLabel);
                companyEmps.forEach(function (emp) {
                    content.appendChild(createAssignEmpBadge(emp, sc, currentAssigned));
                });
                appendSupportSection(content, gc.code, function (sw) {
                    return createAssignSupportBadge(sw, sc, currentAssignedSupport);
                });
            });
        } else {
            filtered.forEach(function (emp) {
                content.appendChild(createAssignEmpBadge(emp, sc, currentAssigned));
            });
            // フィルタ中でも、選択タブに属するGCの応援バッジを表示
            var activeGc = null;
            visibleCompanies.forEach(function (gc) {
                var units = orgUnitsData[gc.code] || [];
                var ids = wsGetDescendantIds(units, wsEmpTab.activeTab);
                if (ids.length > 0) activeGc = gc.code;
            });
            if (activeGc) {
                appendSupportSection(content, activeGc, function (sw) {
                    return createAssignSupportBadge(sw, sc, currentAssignedSupport);
                });
            }
        }

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
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.addEventListener('click', function () {
                addAssignment(emp.index, sc.date, sc.shift, sc.siteId);
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
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.title = inMaint ? '\u26a0 \u4fee\u7406/\u70b9\u691c\u4e2d\uff08\u914d\u7f6e\u53ef\uff09' : '';
            tag.addEventListener('click', function () {
                addVehicleAssignment(sc.date, sc.shift, sc.siteId, v.id);
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
                            renderGrid();
                            renderSidebar();
                        });
                    } else if (assignedCount === orders) {
                        item.classList.add('md-ws-candidate-fulfilled');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addAssignment(sc.empIndex, sc.date, sc.shift, site.id);
                            renderGrid();
                            renderSidebar();
                        });
                    } else {
                        item.classList.add('md-ws-candidate-excess');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addAssignment(sc.empIndex, sc.date, sc.shift, site.id);
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
                            renderGrid();
                            renderSidebar();
                        });
                    } else if (assignedCount === orders) {
                        item.classList.add('md-ws-candidate-fulfilled');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addVehicleAssignment(sc.date, sc.shift, site.id, sc.vehicleId);
                            renderGrid();
                            renderSidebar();
                        });
                    } else {
                        item.classList.add('md-ws-candidate-excess');
                        countChip.textContent = assignedCount + '/' + orders;
                        item.addEventListener('click', function () {
                            addVehicleAssignment(sc.date, sc.shift, site.id, sc.vehicleId);
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
                if (companyEmps.length === 0 && getActiveSupportWorkers(gc.code).length === 0) return;
                filteredCount += companyEmps.length;
                content.appendChild(el('div', 'md-ws-gc-section-label', gc.shortName));
                companyEmps.forEach(function (emp) {
                    content.appendChild(createEmpBadge(emp));
                });
                appendSupportSection(content, gc.code, function (sw) {
                    return createSupportBadge(sw);
                });
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
                if (companyEmps.length === 0 && getActiveSupportWorkers(gc.code).length === 0) return;
                var sectionLabel = el('div', 'md-ws-gc-section-label', gc.shortName);
                content.appendChild(sectionLabel);
                companyEmps.forEach(function (emp) {
                    content.appendChild(createEmpBadge(emp));
                });
                appendSupportSection(content, gc.code, function (sw) {
                    return createSupportBadge(sw);
                });
            });
        } else {
            filtered.forEach(function (emp) {
                content.appendChild(createEmpBadge(emp));
            });
            // フィルタ中でも、選択タブに属するGCの応援バッジを表示
            var activeGc = null;
            visibleCompanies.forEach(function (gc) {
                var units = orgUnitsData[gc.code] || [];
                var ids = wsGetDescendantIds(units, wsEmpTab.activeTab);
                if (ids.length > 0) activeGc = gc.code;
            });
            if (activeGc) {
                appendSupportSection(content, activeGc, function (sw) {
                    return createSupportBadge(sw);
                });
            }
        }

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
    // 応援社員バッジUI（サイドバー共通ヘルパー）
    // ==========================================================

    /** 応援社員バッジ生成（概要モード：非選択時） */
    function createSupportBadge(sw) {
        var tagCls = 'md-ws-emp-tag md-ws-support-tag' + (sw.isPreset ? ' md-ws-support-preset' : '');
        var tag = el('span', tagCls);
        var nameSpan = el('span', 'md-ws-emp-name', getSupportDisplayLabel(sw));
        tag.appendChild(nameSpan);

        // 全表示日の昼/夜配置数を集計
        var dates = getVisibleDates();
        var dayCount = 0;
        var nightCount = 0;

        dates.forEach(function (d) {
            var dk = formatDateKey(d);
            dayCount += getSupportAssignedSites(sw.id, dk, 'day').length;
            nightCount += getSupportAssignedSites(sw.id, dk, 'night').length;
        });

        // 昼/夜配置数テキスト
        if (dayCount > 0 || nightCount > 0) {
            var countWrap = el('span', 'md-ws-support-count-text');
            if (dayCount > 0) {
                countWrap.appendChild(el('span', 'md-ws-support-ct-day', '\u663c' + dayCount));
            }
            if (dayCount > 0 && nightCount > 0) {
                countWrap.appendChild(document.createTextNode(' '));
            }
            if (nightCount > 0) {
                countWrap.appendChild(el('span', 'md-ws-support-ct-night', '\u591c' + nightCount));
            }
            tag.appendChild(countWrap);
        }

        // ×削除ボタン（プリセットは非表示）
        if (!sw.isPreset) {
            var removeBtn = el('span', 'md-ws-support-remove', '\u00d7');
            removeBtn.title = '\u524a\u9664';
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeSupportWorker(sw.id);
                renderGrid();
                renderSidebar();
            });
            tag.appendChild(removeBtn);
        }

        // D&D対応（現場軸のみ）
        if (viewMode !== 'employee') {
            tag.draggable = true;
            tag.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-support',
                    supportId: sw.id
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

    /** 応援社員バッジ生成（配置モード：セル選択時） */
    function createAssignSupportBadge(sw, sc, currentAssignedSupport) {
        var tagCls = 'md-ws-emp-tag md-ws-support-tag' + (sw.isPreset ? ' md-ws-support-preset' : '');
        var tag = el('span', tagCls);
        var nameSpan = el('span', 'md-ws-emp-name', getSupportDisplayLabel(sw));
        tag.appendChild(nameSpan);

        var isAlreadyHere = currentAssignedSupport.some(function (s) { return s.id === sw.id; });
        var busy = isSupportBusy(sw.id, sc.date, sc.shift);

        if (sw.isPreset) {
            // プリセット: 常に追加配置可能（配置済みでもクリックで追加）
            if (isAlreadyHere) {
                tag.classList.add('md-ws-tag-assigned');
                // 配置数を表示
                var placedCount = currentAssignedSupport.filter(function (s) { return s.id === sw.id; }).length;
                tag.title = '\u914d\u7f6e\u6e08\u307f ' + placedCount + '\u540d\uff08\u30af\u30ea\u30c3\u30af\u3067\u8ffd\u52a0\uff09';
            }
            tag.addEventListener('click', function () {
                addSupportAssignment(sw.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        } else if (isAlreadyHere) {
            tag.classList.add('md-ws-tag-assigned');
            tag.title = '\u30af\u30ea\u30c3\u30af\u3067\u914d\u7f6e\u89e3\u9664';
            tag.addEventListener('click', function () {
                removeSupportAssignment(sw.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        } else if (busy) {
            tag.classList.add('md-ws-tag-busy');
            var busySites = getSupportAssignedSites(sw.id, sc.date, sc.shift);
            var busySiteNames = busySites.map(function (sid) {
                var s = findSite(sid);
                return s ? s.name : sid;
            });
            tag.title = '\u4ed6\u73fe\u5834: ' + busySiteNames.join(', ') + '\uff08\u30af\u30ea\u30c3\u30af\u3067\u79fb\u52d5\uff09';
            tag.addEventListener('click', function () {
                busySites.forEach(function (sid) {
                    removeSupportAssignment(sw.id, sc.date, sc.shift, sid);
                });
                addSupportAssignment(sw.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        } else {
            tag.addEventListener('click', function () {
                addSupportAssignment(sw.id, sc.date, sc.shift, sc.siteId);
                renderGrid();
                renderSidebar();
            });
        }

        // D&D対応
        tag.draggable = true;
        tag.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'sidebar-support',
                supportId: sw.id
            }));
            e.dataTransfer.effectAllowed = 'copy';
            tag.style.opacity = '0.5';
            activateDragMode(sc.date);
        });
        tag.addEventListener('dragend', function () {
            tag.style.opacity = '';
            deactivateDragMode();
        });

        // ×削除ボタン（プリセットは非表示）
        if (!sw.isPreset) {
            var delBtn = el('span', 'md-ws-support-remove', '\u00d7');
            delBtn.title = '\u524a\u9664';
            delBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeSupportWorker(sw.id);
                renderGrid();
                renderSidebar();
            });
            tag.appendChild(delBtn);
        }

        return tag;
    }

    /** ＋追加ボタン生成 */
    function createSupportAddBtn(gcCode) {
        var btn = el('button', 'md-ws-support-add-btn', '\uff0b');
        btn.title = '\u5fdc\u63f4\u793e\u54e1\u30d0\u30c3\u30b8\u3092\u8ffd\u52a0';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            showSupportAddInput(btn, gcCode);
        });
        return btn;
    }

    /** インライン入力欄を表示 */
    function showSupportAddInput(triggerBtn, gcCode) {
        // 既に入力欄がある場合は閉じる
        var existing = triggerBtn.parentElement.querySelector('.md-ws-support-input-wrap');
        if (existing) { existing.remove(); return; }

        var wrap = el('div', 'md-ws-support-input-wrap');
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'md-ws-support-input';
        input.placeholder = '\u4f8b: A\u793e\u2460';
        input.maxLength = 20;

        var addBtn = el('button', 'md-ws-support-input-ok', '\u8ffd\u52a0');
        var cancelBtn = el('button', 'md-ws-support-input-cancel', '\u00d7');

        function doAdd() {
            var label = input.value.trim();
            if (!label) return;
            addSupportWorker(label, gcCode);
            wrap.remove();
            renderGrid();
            renderSidebar();
        }

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doAdd();
            if (e.key === 'Escape') wrap.remove();
        });
        addBtn.addEventListener('click', doAdd);
        cancelBtn.addEventListener('click', function () { wrap.remove(); });

        wrap.appendChild(input);
        wrap.appendChild(addBtn);
        wrap.appendChild(cancelBtn);
        triggerBtn.parentElement.appendChild(wrap);

        setTimeout(function () { input.focus(); }, 0);
    }

    /** 会社セクションに応援バッジ群＋追加ボタンを追加する共通処理 */
    function appendSupportSection(container, gcCode, badgeCreator) {
        var supporters = getActiveSupportWorkers(gcCode);

        // 応援セクションラッパー（GCにネストされた見た目）
        var secOuter = el('div', 'md-ws-support-outer');

        // 「応援」サブセクションラベル（下線付き）
        var secLabel = el('div', 'md-ws-support-label', '\u5fdc\u63f4');
        secOuter.appendChild(secLabel);

        // バッジ群＋追加ボタン
        var secWrap = el('div', 'md-ws-support-section');
        supporters.forEach(function (sw) {
            secWrap.appendChild(badgeCreator(sw));
        });
        secWrap.appendChild(createSupportAddBtn(gcCode));
        secOuter.appendChild(secWrap);

        container.appendChild(secOuter);
    }

    // ==========================================================
    // 業者紐付けポップオーバー（プリセット「応援」→ 確定バッジに変換）
    // ==========================================================

    function showLinkPopover(chipEl, presetId, siteId, dateKey, shift, gcCode) {
        // 既存ポップオーバーがあれば閉じる
        var existing = document.querySelector('.md-ws-link-popover');
        if (existing) existing.remove();

        var popover = el('div', 'md-ws-link-popover');

        var title = el('div', 'md-ws-link-title', '\u696d\u8005\u3092\u7d10\u4ed8\u3051');
        popover.appendChild(title);

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'md-ws-link-input';
        input.placeholder = '\u4f8b: A\u793e\u2460';
        input.maxLength = 20;
        popover.appendChild(input);

        var btnRow = el('div', 'md-ws-link-btn-row');
        var confirmBtn = el('button', 'md-ws-link-confirm', '\u78ba\u5b9a');
        var cancelBtn = el('button', 'md-ws-link-cancel', '\u30ad\u30e3\u30f3\u30bb\u30eb');
        btnRow.appendChild(confirmBtn);
        btnRow.appendChild(cancelBtn);
        popover.appendChild(btnRow);

        function doLink() {
            var label = input.value.trim();
            if (!label) return;
            // 1. プリセット配置を解除
            removeSupportAssignment(presetId, dateKey, shift, siteId);
            // 2. 新バッジ作成＋配置
            var newId = addSupportWorker(label, gcCode);
            addSupportAssignment(newId, dateKey, shift, siteId);
            // 3. 閉じて再描画
            popover.remove();
            renderGrid();
            renderSidebar();
        }

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') doLink();
            if (e.key === 'Escape') popover.remove();
        });
        confirmBtn.addEventListener('click', doLink);
        cancelBtn.addEventListener('click', function () { popover.remove(); });

        // ポップオーバーをチップの近くに表示
        document.body.appendChild(popover);
        var rect = chipEl.getBoundingClientRect();
        popover.style.top = (rect.bottom + 4) + 'px';
        popover.style.left = rect.left + 'px';

        // 画面外にはみ出す場合の補正
        setTimeout(function () {
            var pr = popover.getBoundingClientRect();
            if (pr.right > window.innerWidth - 8) {
                popover.style.left = (window.innerWidth - pr.width - 8) + 'px';
            }
            if (pr.bottom > window.innerHeight - 8) {
                popover.style.top = (rect.top - pr.height - 4) + 'px';
            }
            input.focus();
        }, 0);

        // 外部クリックで閉じる
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
        viewStartDate.setDate(viewStartDate.getDate() - 7);
        renderGrid();
        renderSidebar();
    }

    function nextWeek() {
        deselectCell();
        viewStartDate.setDate(viewStartDate.getDate() + 7);
        renderGrid();
        renderSidebar();
    }

    function prevDay() {
        deselectCell();
        viewStartDate.setDate(viewStartDate.getDate() - 1);
        renderGrid();
        renderSidebar();
    }

    function nextDay() {
        deselectCell();
        viewStartDate.setDate(viewStartDate.getDate() + 1);
        renderGrid();
        renderSidebar();
    }

    function goToday() {
        deselectCell();
        viewStartDate = getWeekStart(today);
        selectedDate = formatDateKey(today);
        renderGrid();
        renderSidebar();
    }

    function updateMonthLabel() {
        var dates = getVisibleDates();
        var first = dates[0];
        var last = dates[dates.length - 1];

        // 年ラベル
        var yearLabel = document.getElementById('wsYearLabel');
        if (yearLabel) {
            var y1 = first.getFullYear();
            var y2 = last.getFullYear();
            yearLabel.textContent = y1 === y2
                ? y1 + '\u5e74'
                : y1 + '\u5e74\u301c' + y2 + '\u5e74';
        }

        // 日付範囲ラベル
        var label = document.getElementById('wsMonthLabel');
        if (label) {
            var m1 = first.getMonth() + 1;
            var d1 = first.getDate();
            var m2 = last.getMonth() + 1;
            var d2 = last.getDate();
            label.textContent = m1 + '\u6708' + d1 + '\u65e5\uff5e' + m2 + '\u6708' + d2 + '\u65e5';
        }
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

    function init() {
        restoreTheme();
        generateDemoAssignments();
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

        // Escキーで選択解除
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                deselectCell();
            }
            // Tab キーでビュー切替
            if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                var active = document.activeElement;
                // input等にフォーカスがない場合のみ
                if (!active || active === document.body || active.closest('.md-ws-container')) {
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

        toolbar.insertBefore(toggle, toolbar.firstChild);
    }

    // GCフィルタモーダル関連は共通ナビバー(co-navbar.js)に移動済み

    // DOMReady
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
