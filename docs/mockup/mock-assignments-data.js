/* ============================================================
   mock-assignments-data.js - SL / WS / LA 共通の配置・応援・休み・車両配置データ

   設計:
   - 「デモ今日」を OmsMockStore.getDemoToday() から取得し、その週の月曜 (viewStartDate)
     を基準とした dayOffset で配置データを生成する。WS の従来 hardcode と互換。
   - 社員 index は mock-employees-data.js の配列順 (0〜24)、site id は WS の wsSitesData
     の s1〜s6、車両 id は WS の wsVehiclesData の v1〜v5 を使う。
   - 応援パートナー (preset + 5社) と応援予約は WS の従来 seed をそのまま権威化。
   - SL/WS/LA からは window.OmsMockAssignmentsData の create* を呼び、複製を受け取る。
   ============================================================ */
(function () {
    'use strict';

    function clone(v) {
        return v == null ? v : JSON.parse(JSON.stringify(v));
    }

    function getDemoTodayDate() {
        var key = (window.OmsMockStore && window.OmsMockStore.getDemoToday
                   && window.OmsMockStore.getDemoToday()) || '2026-05-01';
        var parts = key.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }

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

    function offsetDateKey(baseDate, offset) {
        var d = new Date(baseDate);
        d.setDate(d.getDate() + offset);
        return formatDateKey(d);
    }

    // ============================================================
    // WS 現場マスター (s1〜s6)
    //   WS の wsSitesData と内容を一致させる。LA はここから現場名を引く。
    // ============================================================
    function createSites() {
        return [
            { id: 's1', name: '○○ビル',                   category: 'facility', company: '○○株式会社',         gc: 'touo' },
            { id: 's2', name: '△△マンション',             category: 'facility', company: '△△建設',             gc: 'nikkei' },
            { id: 's3', name: '国道1号線 舗装工事',         category: 'traffic',  company: '◇◇工業',             gc: 'touo' },
            { id: 's4', name: '県道15号 橋梁工事',          category: 'traffic',  company: '△△建設',             gc: 'nikkei' },
            { id: 's5', name: '高速SA補修 24-1234',         category: 'highway',  company: '西日本高速道路',      gc: 'zennihon' },
            { id: 's6', name: '○○アリーナ コンサート',     category: 'event',    company: '□□イベント',         gc: 'zennihon' }
        ];
    }

    // ============================================================
    // 応援パートナー (preset + 5 社)
    // ============================================================
    function createSupportPartners() {
        var partners = [
            { id: 'preset-unified', gcCode: null, shortName: '応援',
              formalName: null, postalCode: null, address: null,
              representativeTitle: null, representativeName: null, phone: null, email: null,
              isPreset: true, isMasterComplete: false, isActive: true },
            { id: 'partner-1', gcCode: 'touo', shortName: 'A社①',
              formalName: '株式Aコーポレーション', postalCode: null,
              address: '高知県高知市…',
              representativeTitle: '代表取締役', representativeName: '山田 太郎',
              phone: '088-000-0001', email: null,
              isPreset: false, isMasterComplete: true, isActive: true },
            { id: 'partner-2', gcCode: 'touo', shortName: 'B社②',
              formalName: null, postalCode: null, address: null,
              representativeTitle: null, representativeName: null, phone: null, email: null,
              isPreset: false, isMasterComplete: false, isActive: true },
            { id: 'partner-3', gcCode: 'nikkei', shortName: 'C社③',
              formalName: '株式Cエンタープライズ', postalCode: null,
              address: null,
              representativeTitle: '代表取締役', representativeName: '佐藤 一郎',
              phone: null, email: null,
              isPreset: false, isMasterComplete: true, isActive: true },
            { id: 'partner-4', gcCode: 'nikkei', shortName: 'D社④',
              formalName: null, postalCode: null, address: null,
              representativeTitle: null, representativeName: null, phone: null, email: null,
              isPreset: false, isMasterComplete: false, isActive: true },
            { id: 'partner-5', gcCode: 'zennihon', shortName: 'E社⑤',
              formalName: '株式E商事', postalCode: null, address: null,
              representativeTitle: '代表取締役', representativeName: '鈴木 三郎',
              phone: null, email: null,
              isPreset: false, isMasterComplete: true, isActive: true }
        ];
        return partners;
    }

    // ============================================================
    // 応援予約: partnerId -> dateKey -> { flex: count }
    //   base = デモ今日 (SL は当日参照のため、当日に予約が来るように)
    // ============================================================
    function createSupportReservations() {
        var base = getDemoTodayDate();
        var reservations = {};
        function set(partnerId, offset, flex) {
            var dk = offsetDateKey(base, offset);
            if (!reservations[partnerId]) reservations[partnerId] = {};
            reservations[partnerId][dk] = { flex: flex };
        }
        set('partner-1', 0, 3);
        set('partner-1', 1, 2);
        set('partner-2', 0, 2);
        set('partner-3', 0, 3);
        set('partner-3', 2, 3);
        set('partner-4', 1, 1);
        set('partner-5', 0, 2);
        return reservations;
    }

    // ============================================================
    // 社員配置: empIndex -> dateKey -> shift -> [siteId]
    // ============================================================
    function createEmployeeAssignments() {
        var base = getWeekStart(getDemoTodayDate());
        var assignments = {};
        var samplePlacements = [
            { emp: 0,  dayOffset: 0, shift: 'day',   site: 's1' },
            { emp: 0,  dayOffset: 1, shift: 'day',   site: 's1' },
            { emp: 0,  dayOffset: 2, shift: 'day',   site: 's1' },
            { emp: 1,  dayOffset: 0, shift: 'day',   site: 's1' },
            { emp: 1,  dayOffset: 0, shift: 'night', site: 's2' },
            { emp: 1,  dayOffset: 1, shift: 'day',   site: 's1' },
            { emp: 3,  dayOffset: 0, shift: 'day',   site: 's3' },
            { emp: 3,  dayOffset: 1, shift: 'day',   site: 's3' },
            { emp: 4,  dayOffset: 0, shift: 'day',   site: 's3' },
            { emp: 4,  dayOffset: 2, shift: 'day',   site: 's4' },
            { emp: 6,  dayOffset: 0, shift: 'day',   site: 's3' },
            { emp: 6,  dayOffset: 0, shift: 'night', site: 's4' },
            { emp: 8,  dayOffset: 1, shift: 'day',   site: 's5' },
            { emp: 8,  dayOffset: 2, shift: 'day',   site: 's5' },
            { emp: 9,  dayOffset: 0, shift: 'day',   site: 's2' },
            { emp: 9,  dayOffset: 1, shift: 'day',   site: 's2' },
            { emp: 11, dayOffset: 0, shift: 'day',   site: 's4' },
            { emp: 11, dayOffset: 1, shift: 'day',   site: 's4' },
            { emp: 11, dayOffset: 1, shift: 'night', site: 's5' },
            { emp: 12, dayOffset: 0, shift: 'day',   site: 's5' },
            { emp: 12, dayOffset: 1, shift: 'day',   site: 's5' },
            { emp: 14, dayOffset: 2, shift: 'day',   site: 's1' },
            { emp: 17, dayOffset: 0, shift: 'day',   site: 's6' },
            { emp: 18, dayOffset: 0, shift: 'day',   site: 's6' },
            { emp: 19, dayOffset: 0, shift: 'day',   site: 's6' },
            { emp: 20, dayOffset: 0, shift: 'day',   site: 's6' },
            { emp: 21, dayOffset: 0, shift: 'day',   site: 's4' },
            // 休日出勤テストケース（emp5=林 は元々 isOnLeave だが当該日に出勤）
            { emp: 5,  dayOffset: 1, shift: 'day',   site: 's3' },
            // --- デモ今日 (週金曜 = dayOffset 4) の配置 ---
            //   SL は単日表示のため、デモ今日に配置が無いと画面に何も出ない。
            //   各 site の shift は createSiteOrderMap の対応 OB 行の shift に合わせる
            //   (s1/s2/s5/s6=昼、s3/s4=夜)。休暇中3名 (5/14/24) は除外。
            { emp: 0,  dayOffset: 4, shift: 'day',   site: 's1' },
            { emp: 1,  dayOffset: 4, shift: 'day',   site: 's1' },
            { emp: 9,  dayOffset: 4, shift: 'day',   site: 's2' },
            { emp: 8,  dayOffset: 4, shift: 'day',   site: 's5' },
            { emp: 12, dayOffset: 4, shift: 'day',   site: 's5' },
            { emp: 17, dayOffset: 4, shift: 'day',   site: 's6' },
            { emp: 18, dayOffset: 4, shift: 'day',   site: 's6' },
            { emp: 19, dayOffset: 4, shift: 'day',   site: 's6' },
            { emp: 3,  dayOffset: 4, shift: 'night', site: 's3' },
            { emp: 6,  dayOffset: 4, shift: 'night', site: 's3' },
            { emp: 11, dayOffset: 4, shift: 'night', site: 's4' },
            { emp: 21, dayOffset: 4, shift: 'night', site: 's4' }
        ];
        samplePlacements.forEach(function (p) {
            var dk = offsetDateKey(base, p.dayOffset);
            if (!assignments[p.emp]) assignments[p.emp] = {};
            if (!assignments[p.emp][dk]) assignments[p.emp][dk] = {};
            if (assignments[p.emp][dk][p.shift]) return;
            assignments[p.emp][dk][p.shift] = [p.site];
        });
        return assignments;
    }

    // ============================================================
    // 車両配置: dateKey -> { day: { siteId: vehicleId }, night: {...} }
    // ============================================================
    function createVehicleAssignments() {
        var base = getWeekStart(getDemoTodayDate());
        var dk0 = offsetDateKey(base, 0);
        var dk1 = offsetDateKey(base, 1);
        var va = {};
        va[dk0] = { day: { 's1': 'v1', 's3': 'v2' }, night: { 's4': 'v2' } };
        va[dk1] = { day: { 's5': 'v3' }, night: {} };
        return va;
    }

    // ============================================================
    // 車両整備 (画面表示用、 vehicle.id -> dateKey -> true)
    // ============================================================
    function createVehicleMaintenance() {
        var base = getWeekStart(getDemoTodayDate());
        var vm = {};
        vm['v4'] = {};
        vm['v4'][offsetDateKey(base, 0)] = true;
        vm['v4'][offsetDateKey(base, 1)] = true;
        vm['v4'][offsetDateKey(base, 2)] = true;
        vm['v5'] = {};
        vm['v5'][offsetDateKey(base, 3)] = true;
        return vm;
    }

    // ============================================================
    // 現場 (siteId) ⇄ OB受注行 (会社 + 業務) 対応表
    //   SL の行は OB 受注由来 (会社/業務/区分) で識別され siteId を持たないため、
    //   共通ソースの配置 (siteId 基準) を SL 行へ橋渡しする対応表をここに定義する。
    //   company / task は mock-orders-data.js の DEFAULT_ORDER_ROWS と一致させること。
    //   (shift は対応行の区分メモ: s1/s2/s5/s6=昼, s3/s4=夜 を含む)
    // ============================================================
    function createSiteOrderMap() {
        return {
            s1: { company: '(株)丸山建設',          task: '〇〇ビル巡回' },
            s2: { company: '(株)丸山建設',          task: '△△マンション' },
            s3: { company: '□□警備(株)',           task: '国道1号線' },
            s4: { company: '□□警備(株)',           task: '県道12号線' },
            s5: { company: '(株)〇〇高速',          task: '東名SA巡回' },
            s6: { company: '全日本エンタープライズ', task: '商業施設A' }
        };
    }

    // ============================================================
    // LA 用: 配置データから「emp-id|YYYY-MM-DD -> { siteName, shift }」を派生
    //   引数なしで呼べる。社員 id は 'emp-' + (empIdx + 1)、現場名は createSites() から。
    // ============================================================
    function createLaWsAssignments() {
        var assignments = createEmployeeAssignments();
        var sites = createSites();
        var sitesById = {};
        sites.forEach(function (s) { sitesById[s.id] = s; });
        var SHIFT_LABEL = { 'day': '昼', 'night': '夜' };
        var out = {};
        Object.keys(assignments).forEach(function (empIdxStr) {
            var empIdx = parseInt(empIdxStr, 10);
            var empId = 'emp-' + (empIdx + 1);
            var byDate = assignments[empIdxStr];
            Object.keys(byDate).forEach(function (dateKey) {
                var byShift = byDate[dateKey];
                Object.keys(byShift).forEach(function (shift) {
                    var siteIds = byShift[shift] || [];
                    if (!siteIds.length) return;
                    var site = sitesById[siteIds[0]];
                    if (!site) return;
                    var key = empId + '|' + dateKey;
                    if (out[key]) return;
                    out[key] = { siteName: site.name, shift: SHIFT_LABEL[shift] || shift };
                });
            });
        });
        return out;
    }

    window.OmsMockAssignmentsData = {
        createSites: function () { return clone(createSites()); },
        createSupportPartners: function () { return clone(createSupportPartners()); },
        createSupportReservations: function () { return clone(createSupportReservations()); },
        createEmployeeAssignments: function () { return clone(createEmployeeAssignments()); },
        createVehicleAssignments: function () { return clone(createVehicleAssignments()); },
        createVehicleMaintenance: function () { return clone(createVehicleMaintenance()); },
        createLaWsAssignments: function () { return clone(createLaWsAssignments()); },
        createSiteOrderMap: function () { return clone(createSiteOrderMap()); }
    };
})();
