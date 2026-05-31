/* ============================================================
   leave-application.js — 休暇申請管理モックアップ
   Phase E1: 月間ビュー + D&D 配置 + サイドパネル + 折畳
   ============================================================ */

(function () {
    'use strict';

    // ==========================================================
    // 定数・ユーティリティ
    // ==========================================================

    var KIND = { paid: '有給', absent: '休暇', other: 'その他' };
    // 区分: 「全休」→「休み」に改名 (ユーザー指示)
    var PART = { full: '休み', am: '午前休', pm: '午後休' };
    var STATUS = { pending: '申請中', approved: '承認済', rejected: '却下' };
    // バッジ内チップ表示用: 半休は「昼/夜 ✖」で時間帯不可を示す。
    // 休み (全休) は枠全体で「休み」を表現するため別チップ表示なし。
    var PART_CHIP = { full: null, am: '昼✖', pm: '夜✖' };
    var KIND_CHIP = { paid: '有', absent: '休', other: '他' };
    var STATUS_CHIP = { pending: '申請', approved: '承認', rejected: '却下' };

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function fmtDate(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function parseDate(key) {
        var p = key.split('-');
        return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    function sameDay(a, b) {
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    }

    // ==========================================================
    // 祝日 (holidays-jp API + localStorage キャッシュ + フォールバック)
    // データソース: https://holidays-jp.github.io/api/v1/date.json
    //   - 毎年1月に翌年分が追加更新される
    //   - GitHub Pages ホストで CORS 対応済み
    //   - 24h キャッシュ。失敗時は同梱フォールバック表 (2025〜2027) を使用
    // ==========================================================
    var HOLIDAY_API_URL = 'https://holidays-jp.github.io/api/v1/date.json';
    var HOLIDAY_CACHE_KEY = 'la_holidays_cache_v1';
    var HOLIDAY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    var FALLBACK_HOLIDAYS = {
        '2025-01-01': '元日', '2025-01-13': '成人の日', '2025-02-11': '建国記念の日',
        '2025-02-23': '天皇誕生日', '2025-02-24': '休日', '2025-03-20': '春分の日',
        '2025-04-29': '昭和の日', '2025-05-03': '憲法記念日', '2025-05-04': 'みどりの日',
        '2025-05-05': 'こどもの日', '2025-05-06': '休日', '2025-07-21': '海の日',
        '2025-08-11': '山の日', '2025-09-15': '敬老の日', '2025-09-23': '秋分の日',
        '2025-10-13': 'スポーツの日', '2025-11-03': '文化の日', '2025-11-23': '勤労感謝の日',
        '2025-11-24': '休日',
        '2026-01-01': '元日', '2026-01-12': '成人の日', '2026-02-11': '建国記念の日',
        '2026-02-23': '天皇誕生日', '2026-03-20': '春分の日', '2026-04-29': '昭和の日',
        '2026-05-03': '憲法記念日', '2026-05-04': 'みどりの日', '2026-05-05': 'こどもの日',
        '2026-05-06': '休日', '2026-07-20': '海の日', '2026-08-11': '山の日',
        '2026-09-21': '敬老の日', '2026-09-22': '国民の休日', '2026-09-23': '秋分の日',
        '2026-10-12': 'スポーツの日', '2026-11-03': '文化の日', '2026-11-23': '勤労感謝の日',
        '2027-01-01': '元日', '2027-01-11': '成人の日', '2027-02-11': '建国記念の日',
        '2027-02-23': '天皇誕生日', '2027-03-21': '春分の日', '2027-03-22': '休日',
        '2027-04-29': '昭和の日', '2027-05-03': '憲法記念日', '2027-05-04': 'みどりの日',
        '2027-05-05': 'こどもの日', '2027-07-19': '海の日', '2027-08-11': '山の日',
        '2027-09-20': '敬老の日', '2027-09-23': '秋分の日', '2027-10-11': 'スポーツの日',
        '2027-11-03': '文化の日', '2027-11-23': '勤労感謝の日'
    };

    var holidayMap = FALLBACK_HOLIDAYS;

    function getHoliday(dateKey) {
        return (holidayMap && holidayMap[dateKey]) || null;
    }

    function loadHolidaysFromCache() {
        try {
            var raw = localStorage.getItem(HOLIDAY_CACHE_KEY);
            if (!raw) return null;
            var cached = JSON.parse(raw);
            if (!cached || !cached.ts || !cached.data) return null;
            if (Date.now() - cached.ts > HOLIDAY_CACHE_TTL_MS) return null;
            return cached.data;
        } catch (e) { return null; }
    }

    function saveHolidaysToCache(data) {
        try {
            localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
        } catch (e) { /* quota / private mode 無視 */ }
    }

    function ensureHolidays(onUpdated) {
        var cached = loadHolidaysFromCache();
        if (cached) {
            holidayMap = cached;
            return; // キャッシュ有効。再描画不要
        }
        if (typeof fetch !== 'function') return;
        fetch(HOLIDAY_API_URL, { cache: 'no-cache' })
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (data) {
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    holidayMap = data;
                    saveHolidaysToCache(data);
                    if (typeof onUpdated === 'function') onUpdated();
                }
            })
            .catch(function () { /* フォールバック維持 */ });
    }

    // ==========================================================
    // 状態
    // ==========================================================

    // 社員: demo-data.js の employeesData を拡張
    // { id, name, company, dept, role, paidLeaveRemaining, paidLeaveUsedThisMonth }
    var laEmployees = [];

    // 休暇レコード: { id, employeeId, date(YYYY-MM-DD), partition, kind, status, reason, memo }
    var laLeaves = [];
    var nextLeaveId = 1;

    // WS 配置モック: employeeId + date → 現場名
    // 本来は WS 画面側のデータソースから参照するが、モックなのでここで固定
    var laWsAssignments = {}; // 'emp-id|YYYY-MM-DD' → { siteName, shift }

    // ビュー状態
    var LA_DEFAULT_DATE_KEY = (window.OmsMockStore && window.OmsMockStore.defaultDate) || '2026-05-01';
    var laStateRestoring = false;
    var currentDate = laStoreCurrentDate();
    var currentView = 'month'; // 'month' | 'week' | 'year' (E5 以降で拡張)
    var currentWeekAnchor = new Date(currentDate);
    var sidebarMode = 'emp'; // 'emp' | 'alerts' — 縦タブで切替
    var sidebarCollapsed = false;
    var sidebarActiveTab = 'all'; // 'all' | 'touo' | 'nikkei' | 'zennihon' | 'dueSoon'
    var gcFilter = { touo: true, nikkei: true, zennihon: true };
    var compactMode = false;
    var searchQuery = '';

    // 画面モード: 'leave' (休暇申請) | 'vehicle' (車両スケジュール)
    var currentMode = 'leave';

    // 車両スケジュール用 状態 (in-memory)
    var vsVehicles = (typeof vehiclesData !== 'undefined') ? JSON.parse(JSON.stringify(vehiclesData)) : [];
    var vsSchedules = (typeof vehicleSchedulesData !== 'undefined') ? JSON.parse(JSON.stringify(vehicleSchedulesData)) : [];
    var vsNextSchedId = 100;
    var vsNextVehicleId = 100;
    var VS_KIND_LIST = (typeof VS_KINDS !== 'undefined') ? VS_KINDS : [];
    var VS_DUE_SOON_DAYS = 30;

    // D&D 状態
    var dragState = null; // { sourceType: 'employee'|'badge'|'vehicle'|'vsBadge', ... }

    // E6: ロール・通知
    var currentRole = 'dcp'; // 'self' | 'dcp' | 'admin'
    var currentUserId = null; // self ロール時に対象となる自分の社員ID (デモ用、buildEmployees で1人選定)
    var currentUserGc = null;
    // 旧 notifications / nextNotifId は N-2.3 で撤去。共通ベル (window.coNotifyPanel) が管理。

    function laDemoTodayDate() {
        var key = (window.OmsMockStore && window.OmsMockStore.getDemoToday && window.OmsMockStore.getDemoToday()) || LA_DEFAULT_DATE_KEY;
        return parseDate(key);
    }

    function laStoreCurrentDate() {
        var key = (window.OmsMockStore && window.OmsMockStore.getCurrentDate && window.OmsMockStore.getCurrentDate()) || LA_DEFAULT_DATE_KEY;
        var d = parseDate(key);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    // ==========================================================
    // 初期化: 社員データ構築 + デモ休暇レコード
    // ==========================================================

    function buildEmployees() {
        // demo-data.js の employeesData を読み込んで拡張
        laEmployees = employeesData.map(function (e, idx) {
            return {
                id: 'emp-' + (idx + 1),
                name: e.name,
                company: e.company,
                dept: e.dept,
                role: (idx % 9 === 0) ? 'dcp' : (idx % 5 === 0 ? 'chief' : 'staff'),
                paidLeaveRemaining: 5 + (idx * 3) % 15,    // 5〜19
                paidLeaveUsedThisMonth: (idx * 7) % 5      // 0〜4
            };
        });
        // self ロール用の自分 = 先頭の一般社員 (東央の佐藤: idx=1)
        currentUserId = 'emp-2';
        currentUserGc = 'touo';
    }

    function seedWsAssignments() {
        // 共通ソース (mock-assignments-data.js) から WS 配置を派生
        var src = window.OmsMockAssignmentsData;
        if (src) {
            laWsAssignments = src.createLaWsAssignments();
        } else {
            laWsAssignments = {};
        }
    }

    // E6: 権限ロジック
    // 編集可否: self=自分の未来日のみ + 申請中のみ、dcp=自GCの全員、admin=全員
    function canEditLeave(lv) {
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        if (!emp) return false;
        if (lv.status === 'rejected') return currentRole === 'admin';
        if (currentRole === 'admin') return true;
        if (currentRole === 'dcp') {
            // 所属GCのDCPのみ承認可
            if (emp.company !== currentUserGc) return false;
            return true;
        }
        // self
        if (lv.employeeId !== currentUserId) return false;
        if (lv.status === 'approved') return false; // 承認済は本人編集不可
        return !isPastDate(lv.date);
    }
    // 承認可否: dcp (自GC) or admin のみ
    function canApproveLeave(lv) {
        if (currentRole === 'admin') return true;
        if (currentRole !== 'dcp') return false;
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        return emp && emp.company === currentUserGc;
    }
    // 過去日? (今日より前)
    function isPastDate(dateKey) {
        var d = parseDate(dateKey);
        var today = laDemoTodayDate();
        today.setHours(0, 0, 0, 0);
        return d < today;
    }

    function hasWsConflict(employeeId, dateKey) {
        return !!laWsAssignments[employeeId + '|' + dateKey];
    }

    function getWsAssignment(employeeId, dateKey) {
        return laWsAssignments[employeeId + '|' + dateKey] || null;
    }

    function seedDemoLeaves() {
        if (window.OmsMockAssignmentsData && typeof window.OmsMockAssignmentsData.createLeaveApplications === 'function') {
            laLeaves = window.OmsMockAssignmentsData.createLeaveApplications(fmtDate(currentDate), fmtDate(laDemoTodayDate()));
            nextLeaveId = laLeaves.reduce(function(maxId, lv) {
                var m = String(lv.id || '').match(/(\d+)$/);
                return m ? Math.max(maxId, parseInt(m[1], 10) + 1) : maxId;
            }, 1);
            return;
        }
        // 表示月のダミー申請を何件か
        var ym = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1) + '-';
        // empIdx は mock-employees-data.js の配列順 (0〜24)。
        // デモ今日 (day = demoTodayDay) に isOnLeave=true の3名 (林=5 / 清水=14 / 前田=24)
        // を approved にして、社員マスターの isOnLeave フラグと整合させる。
        var demoTodayDay = laDemoTodayDate().getDate();
        var seeds = [
            { empIdx: 5,  day: 3,  partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 5,  day: 4,  partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 14, day: 8,  partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 14, day: 9,  partition: 'am',   kind: 'paid',   status: 'pending'  },
            { empIdx: 24, day: 10, partition: 'full', kind: 'absent', status: 'approved' },
            { empIdx: 2,  day: 15, partition: 'pm',   kind: 'paid',   status: 'approved' },
            { empIdx: 9,  day: 15, partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 18, day: 15, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 21, day: 15, partition: 'full', kind: 'other',  status: 'approved' },
            { empIdx: 5,  day: 20, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 5,  day: 21, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 5,  day: 22, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 23, day: 24, partition: 'full', kind: 'paid',   status: 'rejected' },
            { empIdx: 11, day: 27, partition: 'am',   kind: 'paid',   status: 'approved' },
            // デモ今日 (demoTodayDay) に isOnLeave 3名を approved
            { empIdx: 5,  day: demoTodayDay, partition: 'full', kind: 'paid', status: 'approved' },
            { empIdx: 14, day: demoTodayDay, partition: 'full', kind: 'paid', status: 'approved' },
            { empIdx: 24, day: demoTodayDay, partition: 'full', kind: 'paid', status: 'approved' }
        ];
        seeds.forEach(function (s) {
            if (!laEmployees[s.empIdx]) return;
            laLeaves.push({
                id: 'lv-' + (nextLeaveId++),
                employeeId: laEmployees[s.empIdx].id,
                date: ym + pad(s.day),
                partition: s.partition,
                kind: s.kind,
                status: s.status,
                reason: '',
                memo: ''
            });
        });
    }

    // ==========================================================
    // カレンダー描画
    // ==========================================================

    function getMonthCells(year, month) {
        // month: 0-based
        var first = new Date(year, month, 1);
        var firstDow = first.getDay(); // 0=Sun
        // 月曜始まりにする: Mon=0, ..., Sun=6
        var offsetFromMon = (firstDow + 6) % 7;
        var start = new Date(year, month, 1 - offsetFromMon);
        var cells = [];
        for (var i = 0; i < 42; i++) {
            var d = new Date(start);
            d.setDate(start.getDate() + i);
            cells.push(d);
        }
        return cells;
    }

    function leavesByDate() {
        var map = {};
        laLeaves.forEach(function (lv) {
            if (!passesGcFilter(lv.employeeId)) return;
            if (!map[lv.date]) map[lv.date] = [];
            map[lv.date].push(lv);
        });
        return map;
    }

    function passesGcFilter(employeeId) {
        var emp = laEmployees.find(function (e) { return e.id === employeeId; });
        if (!emp) return false;
        return gcFilter[emp.company] === true;
    }

    function laLoadApplicationsFromStore() {
        if (!window.OmsMockStore || typeof window.OmsMockStore.getLeaveApplications !== 'function') return false;
        var saved = window.OmsMockStore.getLeaveApplications();
        if (!Array.isArray(saved)) return false;
        laLeaves = JSON.parse(JSON.stringify(saved));
        var maxId = 0;
        laLeaves.forEach(function(lv) {
            var m = String(lv.id || '').match(/(\d+)$/);
            if (m) maxId = Math.max(maxId, parseInt(m[1], 10));
        });
        nextLeaveId = Math.max(nextLeaveId, maxId + 1);
        return true;
    }

    function laSaveApplicationsToStore() {
        if (laStateRestoring || !window.OmsMockStore) return;
        window.OmsMockStore.setCurrentDate(currentView === 'week' ? fmtDate(currentWeekAnchor) : fmtDate(currentDate));
        window.OmsMockStore.setLeaveApplications(laLeaves, { nextLeaveId: nextLeaveId });
    }

    function render() {
        renderLabel();
        updateViewVisibility();
        if (currentView === 'month') renderCalendar();
        if (currentView === 'week')  renderWeek();
        if (currentView === 'year')  {
            if (currentMode === 'vehicle') vsRenderYear();
            else renderYear();
        }
        renderSidebar();
        renderMiniCal();
        laSaveApplicationsToStore();
    }

    // ==========================================================
    // ミニカレンダー (左サイドバー / Google カレンダー風)
    // ==========================================================

    var miniCalDate = null; // 表示中の月 (currentDate と独立に進められる)

    function getMiniCalDate() {
        if (!miniCalDate) miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return miniCalDate;
    }

    function renderMiniCal() {
        var grid = document.getElementById('laMiniCalGrid');
        var label = document.getElementById('laMiniMonthLabel');
        if (!grid || !label) return;
        var d = getMiniCalDate();
        label.textContent = d.getFullYear() + '年' + (d.getMonth() + 1) + '月';

        // 曜日ヘッダー
        var dows = ['月','火','水','木','金','土','日'];
        var html = dows.map(function (n, i) {
            var cls = 'md-la-mini-dow' + (i === 5 ? ' is-sat' : (i === 6 ? ' is-sun' : ''));
            return '<div class="' + cls + '">' + n + '</div>';
        }).join('');

        // 月初〜月末を含む 6週間グリッド
        var first = new Date(d.getFullYear(), d.getMonth(), 1);
        var firstDow = (first.getDay() + 6) % 7; // 月=0, 日=6
        var start = new Date(first);
        start.setDate(start.getDate() - firstDow);
        var todayKey = fmtDate(laDemoTodayDate());
        var selectedKey = fmtDate(currentDate);
        var leaveDays = {};
        laLeaves.forEach(function (lv) { leaveDays[lv.date] = true; });

        for (var i = 0; i < 42; i++) {
            var dt = new Date(start);
            dt.setDate(start.getDate() + i);
            var key = fmtDate(dt);
            var isOther = (dt.getMonth() !== d.getMonth());
            var dow = (dt.getDay() + 6) % 7;
            var isHoliday = (typeof getHoliday === 'function') ? !!getHoliday(key) : false;
            var classes = ['md-la-mini-day'];
            if (isOther) classes.push('is-other-month');
            if (dow === 5) classes.push('is-sat');
            if (dow === 6) classes.push('is-sun');
            if (isHoliday) classes.push('is-holiday');
            if (key === todayKey) classes.push('is-today');
            if (key === selectedKey && !isOther) classes.push('is-selected');
            if (leaveDays[key]) classes.push('has-leave');
            html += '<div class="' + classes.join(' ') + '" data-date="' + key + '">' + dt.getDate() + '</div>';
        }
        grid.innerHTML = html;
    }

    function bindMiniCal() {
        var grid = document.getElementById('laMiniCalGrid');
        var prevBtn = document.getElementById('laMiniPrev');
        var nextBtn = document.getElementById('laMiniNext');
        if (grid) {
            grid.addEventListener('click', function (e) {
                var cell = e.target.closest('.md-la-mini-day');
                if (!cell) return;
                var dateStr = cell.dataset.date;
                if (!dateStr) return;
                // 該当月へジャンプ + 月間ビューへ (currentDate に日付を保持して選択ハイライト)
                var d = parseDate(dateStr);
                currentDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                miniCalDate = new Date(d.getFullYear(), d.getMonth(), 1);
                currentView = 'month';
                document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                    t.classList.toggle('is-active', t.dataset.view === 'month');
                });
                render();
            });
        }
        // ミニカレンダーの月移動はメインカレンダーと連動
        if (prevBtn) prevBtn.addEventListener('click', function () {
            var d = getMiniCalDate();
            var nd = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            miniCalDate = nd;
            currentDate = new Date(nd);
            render();
        });
        if (nextBtn) nextBtn.addEventListener('click', function () {
            var d = getMiniCalDate();
            var nd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            miniCalDate = nd;
            currentDate = new Date(nd);
            render();
        });
    }

    // ==========================================================
    // マウスホイール: メインカレンダー上で月移動
    // 感度抑制 — 累積 deltaY が閾値超え + クールダウン経過時のみ 1 ヶ月移動
    // ==========================================================
    function bindCalendarWheel() {
        var wrapper = document.querySelector('.md-la-calendar-wrapper');
        if (!wrapper) return;
        var WHEEL_THRESHOLD = 80;   // 1 ヶ月分の deltaY (典型的な 1 クリック = 100)
        var WHEEL_COOLDOWN  = 450;  // 連続移動の最小間隔 (ms)
        var wheelAccum = 0;
        var lastNavTs = 0;
        var resetTimer = null;
        wrapper.addEventListener('wheel', function (e) {
            if (currentView !== 'month') return;
            if (document.getElementById('laPopover') || document.querySelector('.md-la-modal-backdrop')) return;
            e.preventDefault();

            // 方向が変わったら累積をリセット
            if ((wheelAccum > 0 && e.deltaY < 0) || (wheelAccum < 0 && e.deltaY > 0)) wheelAccum = 0;
            wheelAccum += e.deltaY;

            // 一定時間ホイール停止で累積をリセット
            if (resetTimer) clearTimeout(resetTimer);
            resetTimer = setTimeout(function () { wheelAccum = 0; }, 300);

            if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;

            var now = performance.now();
            if (now - lastNavTs < WHEEL_COOLDOWN) return;

            var dir = wheelAccum > 0 ? 1 : -1;
            wheelAccum = 0;
            lastNavTs = now;
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1);
            miniCalDate = new Date(currentDate);
            render();
        }, { passive: false });
    }

    function updateViewVisibility() {
        var cal = document.getElementById('laCalendar');
        var week = document.getElementById('laWeek');
        var year = document.getElementById('laYear');
        if (cal)  cal.classList.toggle('md-la-hidden', currentView !== 'month');
        if (week) week.classList.toggle('md-la-hidden', currentView !== 'week');
        if (year) year.classList.toggle('md-la-hidden', currentView !== 'year');
    }

    function renderLabel() {
        var el = document.getElementById('laMonthLabel');
        if (!el) return;
        if (currentView === 'week') {
            var start = weekAnchorMonday(currentWeekAnchor);
            var end = new Date(start);
            end.setDate(end.getDate() + 6);
            el.textContent =
                start.getFullYear() + '年' +
                (start.getMonth() + 1) + '/' + start.getDate() +
                ' 〜 ' +
                (end.getMonth() + 1) + '/' + end.getDate();
        } else if (currentView === 'year') {
            el.textContent = currentDate.getFullYear() + '年（年間）';
        } else {
            el.textContent = currentDate.getFullYear() + '年' + (currentDate.getMonth() + 1) + '月';
        }
    }

    function weekAnchorMonday(d) {
        var dow = d.getDay();
        var offset = (dow + 6) % 7;
        var mon = new Date(d);
        mon.setDate(mon.getDate() - offset);
        mon.setHours(0, 0, 0, 0);
        return mon;
    }

    function renderCalendar() {
        var cal = document.getElementById('laCalendar');
        if (!cal) return;
        cal.innerHTML = '';
        cal.classList.toggle('is-compact', compactMode);

        // 曜日ヘッダー (月〜日)
        var dows = ['月', '火', '水', '木', '金', '土', '日'];
        dows.forEach(function (n, i) {
            var h = document.createElement('div');
            h.className = 'md-la-dow-header';
            if (i === 5) h.classList.add('is-sat');
            if (i === 6) h.classList.add('is-sun');
            h.textContent = n;
            cal.appendChild(h);
        });

        var cells = getMonthCells(currentDate.getFullYear(), currentDate.getMonth());
        var byDate = leavesByDate();
        var today = laDemoTodayDate();
        var countsByDate = {};

        cells.forEach(function (d) {
            var key = fmtDate(d);
            var isOtherMonth = d.getMonth() !== currentDate.getMonth();
            var isPast = d < today && !sameDay(d, today);
            var dow = d.getDay();

            var holidayName = getHoliday(key);

            var cell = document.createElement('div');
            cell.className = 'md-la-cell';
            cell.dataset.date = key;
            if (isOtherMonth) cell.classList.add('is-other-month');
            if (dow === 6) cell.classList.add('is-sat');
            if (dow === 0) cell.classList.add('is-sun');
            if (holidayName) cell.classList.add('is-holiday');
            if (sameDay(d, today)) cell.classList.add('is-today');
            if (isPast) cell.classList.add('is-past');

            var head = document.createElement('div');
            head.className = 'md-la-cell-head';
            var day = document.createElement('span');
            day.className = 'md-la-cell-day';
            day.textContent = d.getDate();
            head.appendChild(day);

            if (holidayName) {
                var hol = document.createElement('span');
                hol.className = 'md-la-cell-holiday';
                hol.textContent = holidayName;
                hol.title = holidayName;
                head.appendChild(hol);
            }

            // N 人集中警告 (4 人以上)
            var dayLeaves = (byDate[key] || []).filter(function (lv) { return lv.status !== 'rejected'; });
            countsByDate[key] = dayLeaves.length;
            if (dayLeaves.length >= 4) {
                var warn = document.createElement('span');
                warn.className = 'md-la-cell-warn';
                warn.title = dayLeaves.length + '人が休暇申請中 (4人以上集中)';
                warn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-caution"/></svg>';
                head.appendChild(warn);
            }
            cell.appendChild(head);

            // バッジ表示
            var body = document.createElement('div');
            body.className = 'md-la-cell-body';

            if (currentMode === 'vehicle') {
                // 車両モード: 当日の車両スケジュールを車両ごとにグルーピングして表示
                vsBuildCellContent(body, key);
            } else {
                // 全件表示 (省略なし)。セル高は grid-auto-rows: auto で自動拡張
                dayLeaves.forEach(function (lv) { body.appendChild(buildBadge(lv)); });
            }
            cell.appendChild(body);

            // D&D 受け入れ
            cell.addEventListener('dragover', onCellDragOver);
            cell.addEventListener('dragleave', onCellDragLeave);
            cell.addEventListener('drop', onCellDrop);

            cal.appendChild(cell);
        });
    }

    // ==========================================================
    // 週間ビュー描画 (E4)
    // ==========================================================

    function renderWeek() {
        var grid = document.getElementById('laWeekGrid');
        if (!grid) return;
        grid.innerHTML = '';
        var monday = weekAnchorMonday(currentWeekAnchor);
        var today = laDemoTodayDate();
        today.setHours(0, 0, 0, 0);

        // ヘッダー行: 左コーナー + 7日
        var corner = document.createElement('div');
        corner.className = 'md-la-week-corner';
        corner.textContent = '社員 ＼ 日付';
        grid.appendChild(corner);

        var days = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
            var head = document.createElement('div');
            head.className = 'md-la-week-day-head';
            var dow = d.getDay();
            if (dow === 6) head.classList.add('is-sat');
            if (dow === 0) head.classList.add('is-sun');
            if (sameDay(d, today)) head.classList.add('is-today');
            var dowNames = ['日', '月', '火', '水', '木', '金', '土'];
            head.innerHTML = '<div>' + (d.getMonth() + 1) + '/' + d.getDate() + '</div>'
                + '<div style="font-weight:500;font-size:10px;opacity:0.7;">(' + dowNames[dow] + ')</div>';
            grid.appendChild(head);
        }

        // 社員行 (フィルタ適用)
        var employees = laEmployees.filter(function (e) { return gcFilter[e.company] === true; });
        employees.forEach(function (emp) {
            var empCell = document.createElement('div');
            empCell.className = 'md-la-week-emp gc-' + emp.company;
            var n = document.createElement('span');
            n.className = 'md-la-week-emp-name';
            n.textContent = emp.name;
            empCell.appendChild(n);
            var role = document.createElement('span');
            role.className = 'md-la-week-emp-role';
            role.textContent = emp.role === 'dcp' ? 'DCP' : (emp.role === 'chief' ? '責' : '');
            if (role.textContent) empCell.appendChild(role);
            grid.appendChild(empCell);

            days.forEach(function (d) {
                var key = fmtDate(d);
                var cell = document.createElement('div');
                cell.className = 'md-la-week-cell';
                cell.dataset.date = key;
                cell.dataset.employeeId = emp.id;
                var dow = d.getDay();
                if (dow === 6) cell.classList.add('is-sat');
                if (dow === 0) cell.classList.add('is-sun');
                if (sameDay(d, today)) cell.classList.add('is-today');
                if (d < today) cell.classList.add('is-past');

                // WS配置済み (休暇がなくてもマーカー表示)
                var ws = getWsAssignment(emp.id, key);
                if (ws) {
                    cell.classList.add('is-ws-assigned');
                    cell.title = 'WS配置済み: ' + ws.siteName + '（' + ws.shift + '）';
                }

                // この社員・日の休暇レコード
                var lvs = laLeaves.filter(function (lv) {
                    return lv.employeeId === emp.id && lv.date === key;
                });
                lvs.forEach(function (lv) {
                    cell.appendChild(buildBadge(lv));
                });

                // D&D ドロップ受け入れ (社員行にドロップ = 指定社員の休暇を作成)
                cell.addEventListener('dragover', onWeekCellDragOver);
                cell.addEventListener('dragleave', onWeekCellDragLeave);
                cell.addEventListener('drop', onWeekCellDrop);

                grid.appendChild(cell);
            });
        });

        // grid-template-columns を動的に更新 (CSS で固定しているので不要)
    }

    function onWeekCellDragOver(e) {
        if (!dragState) return;
        e.preventDefault();
        var isCopySource = dragState.sourceType === 'employee' || dragState.sourceType === 'vehicle';
        e.dataTransfer.dropEffect = isCopySource ? 'copy' : 'move';
        this.classList.add('is-drop-target');
    }
    function onWeekCellDragLeave() {
        this.classList.remove('is-drop-target');
    }
    function onWeekCellDrop(e) {
        e.preventDefault();
        this.classList.remove('is-drop-target');
        if (!dragState) return;
        var targetDate = this.dataset.date;
        var rowEmpId = this.dataset.employeeId;
        if (!targetDate || !rowEmpId) return;

        if (dragState.sourceType === 'employee') {
            // サイドパネルから他人の行へドロップされた場合、行の社員IDを優先（直感に合う）
            var empId = rowEmpId;
            var dup = laLeaves.find(function (lv) {
                return lv.employeeId === empId && lv.date === targetDate && lv.status !== 'rejected';
            });
            if (dup) return;
            laLeaves.push({
                id: 'lv-' + (nextLeaveId++),
                employeeId: empId,
                date: targetDate,
                partition: 'full',
                kind: 'paid',
                status: 'pending',
                reason: '',
                memo: ''
            });
        } else if (dragState.sourceType === 'badge') {
            var lv = laLeaves.find(function (x) { return x.id === dragState.leaveId; });
            if (!lv) return;
            // 同社員行の場合は日付変更、別社員行の場合は社員と日付変更
            lv.date = targetDate;
            lv.employeeId = rowEmpId;
        }
        renderWeek();
        renderSidebar();
        laSaveApplicationsToStore();
    }

    // ==========================================================
    // 年間ビュー (E5: 12ヶ月サムネイル + ヒートマップ)
    // ==========================================================

    function renderYear() {
        var root = document.getElementById('laYear');
        if (!root) return;
        root.innerHTML = '';
        root.classList.remove('is-mode-vehicle');

        // 凡例
        var legend = document.createElement('div');
        legend.className = 'md-la-year-legend';
        legend.innerHTML =
            '日毎の休暇人数（少 ' +
            '<span class="md-la-year-legend-scale">' +
            '<span class="md-la-year-legend-chip md-la-year-cell lv-1"></span>' +
            '<span class="md-la-year-legend-chip md-la-year-cell lv-2"></span>' +
            '<span class="md-la-year-legend-chip md-la-year-cell lv-3"></span>' +
            '<span class="md-la-year-legend-chip md-la-year-cell lv-4"></span>' +
            '<span class="md-la-year-legend-chip md-la-year-cell lv-5"></span>' +
            '</span> 多）';
        legend.style.gridColumn = '1 / -1';
        root.appendChild(legend);

        var year = currentDate.getFullYear();
        var today = laDemoTodayDate(); today.setHours(0, 0, 0, 0);
        var byDate = leavesByDate();

        for (var m = 0; m < 12; m++) {
            root.appendChild(buildYearMonthCard(year, m, byDate, today));
        }
    }

    function buildYearMonthCard(year, month, byDate, today) {
        var card = document.createElement('div');
        card.className = 'md-la-year-month';
        card.addEventListener('click', function () {
            // 月間ビューへ遷移
            currentDate = new Date(year, month, 1);
            currentView = 'month';
            document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.view === 'month');
            });
            render();
        });

        // ヘッダー
        var header = document.createElement('div');
        header.className = 'md-la-year-month-header';
        var title = document.createElement('span');
        title.className = 'md-la-year-month-title';
        title.textContent = (month + 1) + '月';
        header.appendChild(title);
        var summary = document.createElement('span');
        summary.className = 'md-la-year-month-summary';
        var monthTotal = countLeavesInMonth(year, month, byDate);
        summary.textContent = '延 ' + monthTotal.days + '日 / ' + monthTotal.people + '人';
        header.appendChild(summary);
        card.appendChild(header);

        // ミニカレンダー
        var grid = document.createElement('div');
        grid.className = 'md-la-year-month-grid';

        // 曜日
        ['月', '火', '水', '木', '金', '土', '日'].forEach(function (n, i) {
            var d = document.createElement('div');
            d.className = 'md-la-year-dow';
            if (i === 5) d.classList.add('is-sat');
            if (i === 6) d.classList.add('is-sun');
            d.textContent = n;
            grid.appendChild(d);
        });

        // 日付セル
        var first = new Date(year, month, 1);
        var offsetFromMon = (first.getDay() + 6) % 7;
        var start = new Date(year, month, 1 - offsetFromMon);
        for (var i = 0; i < 42; i++) {
            var d = new Date(start);
            d.setDate(start.getDate() + i);
            var key = fmtDate(d);
            var cell = document.createElement('div');
            cell.className = 'md-la-year-cell';
            var isCurrentMonth = (d.getMonth() === month);
            if (!isCurrentMonth) cell.classList.add('is-other-month');
            var dow = d.getDay();
            var holidayName = getHoliday(key);
            if (dow === 6) cell.classList.add('is-sat');
            if (dow === 0) cell.classList.add('is-sun');
            if (holidayName) cell.classList.add('is-holiday');
            if (sameDay(d, today)) cell.classList.add('is-today');

            var count = isCurrentMonth ? (byDate[key] || []).length : 0;

            // ヒートマップレベル
            if (isCurrentMonth) {
                var level = 0;
                if (count === 1) level = 1;
                else if (count === 2) level = 2;
                else if (count === 3) level = 3;
                else if (count === 4) level = 4;
                else if (count >= 5)  level = 5;
                if (level > 0) cell.classList.add('lv-' + level);

                // 吹き出しデータ (日付ヘッダ + 行配列)
                if (level > 0 || holidayName) {
                    var lines = [];
                    if (holidayName) lines.push({ label: '祝日', value: holidayName });
                    if (level > 0) {
                        var names = (byDate[key] || []).map(function (lv) {
                            var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
                            return emp ? emp.name : lv.employeeId;
                        });
                        lines.push({ label: '休暇', value: count + '人 (' + names.join(', ') + ')' });
                    }
                    cell.dataset.tipHead = laYearFmtHead(d);
                    cell.dataset.tipLines = JSON.stringify(lines);
                }
            }

            var inner = '<span class="md-la-year-cell-date">' + d.getDate() + '</span>';
            if (isCurrentMonth && count > 0) {
                inner += '<span class="md-la-year-cell-count">' + count + '</span>';
            }
            cell.innerHTML = inner;
            grid.appendChild(cell);
        }
        card.appendChild(grid);
        return card;
    }

    function countLeavesInMonth(year, month, byDate) {
        var days = 0, peopleSet = {};
        Object.keys(byDate).forEach(function (key) {
            var d = parseDate(key);
            if (d.getFullYear() !== year || d.getMonth() !== month) return;
            var lvs = byDate[key];
            lvs.forEach(function (lv) {
                if (lv.status === 'rejected') return;
                days += lv.partition === 'full' ? 1 : 0.5;
                peopleSet[lv.employeeId] = true;
            });
        });
        return { days: days, people: Object.keys(peopleSet).length };
    }

    // ==========================================================
    // 年間ビュー (車両モード) — 車検/点検期限カレンダー
    // ==========================================================

    function vsBuildDueDateMap() {
        // 期限日 (YYYY-MM-DD) → { shaken: [vehicle], inspection: [vehicle] }
        var map = {};
        vsVehicles.forEach(function (v) {
            if (!gcFilter[v.owner]) return;
            if (v.nextShakenDate) {
                if (!map[v.nextShakenDate]) map[v.nextShakenDate] = { shaken: [], inspection: [] };
                map[v.nextShakenDate].shaken.push(v);
            }
            if (v.nextInspectionDate) {
                if (!map[v.nextInspectionDate]) map[v.nextInspectionDate] = { shaken: [], inspection: [] };
                map[v.nextInspectionDate].inspection.push(v);
            }
        });
        return map;
    }

    function vsRenderYear() {
        var root = document.getElementById('laYear');
        if (!root) return;
        root.innerHTML = '';
        root.classList.add('is-mode-vehicle');

        // 凡例 (車検 / 点検)
        var legend = document.createElement('div');
        legend.className = 'md-la-year-legend';
        legend.innerHTML =
            '<span class="md-la-year-legend-item"><span class="md-la-year-legend-dot vs-kind-shaken"></span>車検期限</span>' +
            '<span class="md-la-year-legend-item"><span class="md-la-year-legend-dot vs-kind-inspection"></span>点検期限</span>';
        legend.style.gridColumn = '1 / -1';
        root.appendChild(legend);

        var year = currentDate.getFullYear();
        var today = laDemoTodayDate(); today.setHours(0, 0, 0, 0);
        var byDate = vsBuildDueDateMap();

        for (var m = 0; m < 12; m++) {
            root.appendChild(vsBuildYearMonthCard(year, m, byDate, today));
        }
    }

    function vsBuildYearMonthCard(year, month, byDate, today) {
        var card = document.createElement('div');
        card.className = 'md-la-year-month';
        card.addEventListener('click', function () {
            currentDate = new Date(year, month, 1);
            currentView = 'month';
            document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.view === 'month');
            });
            render();
        });

        // ヘッダー (月名 + 件数サマリ: 車検X / 点検Y)
        var header = document.createElement('div');
        header.className = 'md-la-year-month-header';
        var title = document.createElement('span');
        title.className = 'md-la-year-month-title';
        title.textContent = (month + 1) + '月';
        header.appendChild(title);
        var summary = document.createElement('span');
        summary.className = 'md-la-year-month-summary';
        var counts = vsCountDuesInMonth(year, month, byDate);
        summary.textContent = '車検 ' + counts.shaken + ' / 点検 ' + counts.inspection;
        header.appendChild(summary);
        card.appendChild(header);

        // ミニカレンダー
        var grid = document.createElement('div');
        grid.className = 'md-la-year-month-grid';

        // 曜日ヘッダー
        ['月', '火', '水', '木', '金', '土', '日'].forEach(function (n, i) {
            var d = document.createElement('div');
            d.className = 'md-la-year-dow';
            if (i === 5) d.classList.add('is-sat');
            if (i === 6) d.classList.add('is-sun');
            d.textContent = n;
            grid.appendChild(d);
        });

        // 日付セル
        var first = new Date(year, month, 1);
        var offsetFromMon = (first.getDay() + 6) % 7;
        var start = new Date(year, month, 1 - offsetFromMon);
        for (var i = 0; i < 42; i++) {
            var d = new Date(start);
            d.setDate(start.getDate() + i);
            var key = fmtDate(d);
            var cell = document.createElement('div');
            cell.className = 'md-la-year-cell';
            var isCurrentMonth = (d.getMonth() === month);
            if (!isCurrentMonth) cell.classList.add('is-other-month');
            var dow = d.getDay();
            var holidayName = getHoliday(key);
            if (dow === 6) cell.classList.add('is-sat');
            if (dow === 0) cell.classList.add('is-sun');
            if (holidayName) cell.classList.add('is-holiday');
            if (sameDay(d, today)) cell.classList.add('is-today');

            var inner = '<span class="md-la-year-cell-date">' + d.getDate() + '</span>';
            if (isCurrentMonth && byDate[key]) {
                var entry = byDate[key];
                var dots = '';
                var lines = [];
                if (entry.shaken.length > 0) {
                    dots += '<span class="md-la-year-cell-dot vs-kind-shaken"></span>';
                    lines.push({ label: '車検', value: entry.shaken.map(function (v) { return v.plate; }).join(', ') });
                }
                if (entry.inspection.length > 0) {
                    dots += '<span class="md-la-year-cell-dot vs-kind-inspection"></span>';
                    lines.push({ label: '点検', value: entry.inspection.map(function (v) { return v.plate; }).join(', ') });
                }
                if (dots) {
                    inner += '<span class="md-la-year-cell-dots">' + dots + '</span>';
                    cell.classList.add('has-due');
                    cell.dataset.tipHead = laYearFmtHead(d);
                    cell.dataset.tipLines = JSON.stringify(lines);
                }
            }
            cell.innerHTML = inner;
            grid.appendChild(cell);
        }
        card.appendChild(grid);
        return card;
    }

    function vsCountDuesInMonth(year, month, byDate) {
        var shaken = 0, inspection = 0;
        Object.keys(byDate).forEach(function (key) {
            var d = parseDate(key);
            if (d.getFullYear() !== year || d.getMonth() !== month) return;
            shaken     += byDate[key].shaken.length;
            inspection += byDate[key].inspection.length;
        });
        return { shaken: shaken, inspection: inspection };
    }

    // --- 年間ビュー 吹き出しツールチップ (休暇/車両共通) ---
    var LA_YEAR_DOWS = ['日', '月', '火', '水', '木', '金', '土'];
    function laYearFmtHead(d) {
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' (' + LA_YEAR_DOWS[d.getDay()] + ')';
    }

    function laYearTooltipInit() {
        var root = document.getElementById('laYear');
        var tip  = document.getElementById('laYearTooltip');
        if (!root || !tip || root.dataset.tipBound === '1') return;
        root.dataset.tipBound = '1';

        function showTip(cell) {
            var head = cell.dataset.tipHead;
            var rawLines = cell.dataset.tipLines;
            if (!head || !rawLines) return;
            var lines;
            try { lines = JSON.parse(rawLines); } catch (e) { return; }

            var isVehicle = root.classList.contains('is-mode-vehicle');
            var html = '<div class="md-la-year-tooltip-head">' + head + '</div>';
            lines.forEach(function (ln) {
                var kindCls = '';
                if (ln.label === '車検') kindCls = ' vs-kind-shaken';
                else if (ln.label === '点検') kindCls = ' vs-kind-inspection';
                html += '<div class="md-la-year-tooltip-row">' +
                    (kindCls ? '<span class="md-la-year-tooltip-dot' + kindCls + '"></span>' : '') +
                    '<span class="md-la-year-tooltip-label">' + ln.label + '</span>' +
                    '<span class="md-la-year-tooltip-value">' + ln.value + '</span>' +
                    '</div>';
            });
            tip.innerHTML = html;
            tip.classList.toggle('is-vehicle', isVehicle);

            // 行数や文字数に応じてサイズ調整
            var totalLen = lines.reduce(function (s, l) { return s + l.value.length; }, 0);
            tip.classList.toggle('is-dense', totalLen > 40);

            tip.hidden = false;
            // 位置計算: セル上中央 (viewport基準 / position:fixed)
            var rect = cell.getBoundingClientRect();
            var tipRect = tip.getBoundingClientRect();
            var top  = rect.top - tipRect.height - 10;
            var left = rect.left + rect.width / 2 - tipRect.width / 2;
            var isBelow = false;
            // 上に出すスペースが無ければ下に
            if (top < 8) {
                top = rect.bottom + 10;
                isBelow = true;
            }
            // 画面端ガード (左右)
            var minLeft = 8, maxLeft = window.innerWidth - tipRect.width - 8;
            if (left < minLeft) left = minLeft;
            if (left > maxLeft) left = maxLeft;
            // pointer 位置の調整 (吹き出し左端からセル中央までのオフセット)
            var pointerLeft = (rect.left + rect.width / 2) - left;
            tip.style.setProperty('--la-tip-pointer-left', pointerLeft + 'px');
            tip.style.top  = top + 'px';
            tip.style.left = left + 'px';
            tip.classList.toggle('is-below', isBelow);
        }
        function hideTip() {
            tip.hidden = true;
            tip.classList.remove('is-below', 'is-dense', 'is-vehicle');
        }
        root.addEventListener('mouseover', function (ev) {
            var cell = ev.target.closest('.md-la-year-cell');
            if (!cell || !cell.dataset.tipHead) { hideTip(); return; }
            showTip(cell);
        });
        root.addEventListener('mouseleave', hideTip);
        window.addEventListener('scroll', hideTip, true);
    }

    // ==========================================================
    // 月次集計モーダル (E5)
    // ==========================================================

    var reportState = { year: 2026, month: 3 };

    function openReportModal() {
        reportState = { year: currentDate.getFullYear(), month: currentDate.getMonth() };
        buildReportModal();
    }

    function buildReportModal() {
        closeReportModal();
        var overlay = document.createElement('div');
        overlay.className = 'md-la-modal-backdrop';
        overlay.id = 'laReportModal';
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeReportModal();
        });

        var modal = document.createElement('div');
        modal.className = 'md-la-modal';

        // ヘッダー
        var header = document.createElement('div');
        header.className = 'md-la-modal-header';
        var title = document.createElement('span');
        title.className = 'md-la-modal-title';
        title.textContent = '月次集計 — ' + reportState.year + '年' + (reportState.month + 1) + '月';
        header.appendChild(title);

        var nav = document.createElement('div');
        nav.className = 'md-la-modal-nav';
        var prev = document.createElement('button');
        prev.textContent = '◀ 前月';
        prev.addEventListener('click', function () {
            var d = new Date(reportState.year, reportState.month - 1, 1);
            reportState.year = d.getFullYear();
            reportState.month = d.getMonth();
            buildReportModal();
        });
        var next = document.createElement('button');
        next.textContent = '翌月 ▶';
        next.addEventListener('click', function () {
            var d = new Date(reportState.year, reportState.month + 1, 1);
            reportState.year = d.getFullYear();
            reportState.month = d.getMonth();
            buildReportModal();
        });
        nav.appendChild(prev);
        nav.appendChild(next);
        header.appendChild(nav);

        var close = document.createElement('button');
        close.className = 'md-la-modal-close';
        close.title = '閉じる';
        close.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg>';
        close.addEventListener('click', closeReportModal);
        header.appendChild(close);
        modal.appendChild(header);

        // ボディ
        var body = document.createElement('div');
        body.className = 'md-la-modal-body';

        // 集計
        var report = buildMonthlyReport(reportState.year, reportState.month);

        // サマリカード
        var sg = document.createElement('div');
        sg.className = 'md-la-summary-grid';
        sg.appendChild(summaryCard('延べ休暇日数', report.totalDays.toFixed(1), '日'));
        sg.appendChild(summaryCard('休暇社員数', report.totalPeople, '名 / ' + laEmployees.length + '名'));
        sg.appendChild(summaryCard('有給消化', report.kindDays.paid.toFixed(1), '日'));
        sg.appendChild(summaryCard('休暇', report.kindDays.absent.toFixed(1), '日'));
        sg.appendChild(summaryCard('未承認', report.pendingCount, '件'));
        sg.appendChild(summaryCard('却下', report.rejectedCount, '件'));
        body.appendChild(sg);

        // テーブル
        var table = document.createElement('table');
        table.className = 'md-la-report-table';
        table.innerHTML =
            '<thead><tr>' +
              '<th>社員</th>' +
              '<th>GC</th>' +
              '<th class="num">有給</th>' +
              '<th class="num">休暇</th>' +
              '<th class="num">その他</th>' +
              '<th class="num">合計</th>' +
              '<th class="num">有給残</th>' +
              '<th>消化率</th>' +
            '</tr></thead>';
        var tbody = document.createElement('tbody');
        report.byEmployee.forEach(function (r) {
            var tr = document.createElement('tr');
            var totalLeave = r.paid + r.absent + r.other;
            var remaining = r.paidLeaveRemaining;
            var rate = (remaining + r.paid) > 0 ? (r.paid / (remaining + r.paid) * 100) : 0;
            var fillCls = rate >= 80 ? 'danger' : (rate >= 50 ? 'warn' : '');
            var gcShort = (groupCompaniesData.find(function (g) { return g.code === r.company; }) || {}).shortName || r.company;
            tr.innerHTML =
                '<td>' + r.name + '</td>' +
                '<td><span class="gc-pill gc-' + r.company + '">' + gcShort + '</span></td>' +
                '<td class="num">' + r.paid.toFixed(1) + '</td>' +
                '<td class="num">' + r.absent.toFixed(1) + '</td>' +
                '<td class="num">' + r.other.toFixed(1) + '</td>' +
                '<td class="num">' + totalLeave.toFixed(1) + '</td>' +
                '<td class="num">' + remaining + '</td>' +
                '<td>' +
                  '<span class="md-la-progress">' +
                    '<span class="md-la-progress-fill ' + fillCls + '" style="width:' + Math.min(100, rate) + '%;"></span>' +
                  '</span>' + rate.toFixed(0) + '%' +
                '</td>';
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        body.appendChild(table);

        modal.appendChild(body);

        // フッター
        var footer = document.createElement('div');
        footer.className = 'md-la-modal-footer';
        var btnClose = document.createElement('button');
        btnClose.className = 'md-la-btn';
        btnClose.textContent = '閉じる';
        btnClose.addEventListener('click', closeReportModal);
        footer.appendChild(btnClose);
        var btnCsv = document.createElement('button');
        btnCsv.className = 'md-la-btn is-primary';
        btnCsv.textContent = 'CSV 出力';
        btnCsv.addEventListener('click', function () { exportReportCsv(report); });
        footer.appendChild(btnCsv);
        modal.appendChild(footer);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.addEventListener('keydown', onReportKeydown);
    }

    function summaryCard(label, value, unit) {
        var card = document.createElement('div');
        card.className = 'md-la-summary-card';
        card.innerHTML =
            '<div class="md-la-summary-label">' + label + '</div>' +
            '<div class="md-la-summary-value">' + value +
              (unit ? '<small>' + unit + '</small>' : '') +
            '</div>';
        return card;
    }

    function buildMonthlyReport(year, month) {
        var byEmp = {};
        laEmployees.forEach(function (e) {
            byEmp[e.id] = {
                id: e.id,
                name: e.name,
                company: e.company,
                paidLeaveRemaining: e.paidLeaveRemaining,
                paid: 0, absent: 0, other: 0
            };
        });
        var totalDays = 0, peopleSet = {};
        var kindDays = { paid: 0, absent: 0, other: 0 };
        var pendingCount = 0, rejectedCount = 0;
        laLeaves.forEach(function (lv) {
            var d = parseDate(lv.date);
            if (d.getFullYear() !== year || d.getMonth() !== month) return;
            if (lv.status === 'rejected') { rejectedCount++; return; }
            if (lv.status === 'pending') pendingCount++;
            var amt = lv.partition === 'full' ? 1 : 0.5;
            totalDays += amt;
            peopleSet[lv.employeeId] = true;
            if (byEmp[lv.employeeId]) byEmp[lv.employeeId][lv.kind] += amt;
            kindDays[lv.kind] += amt;
        });
        // 使った社員を先に、消化日数多い順
        var list = Object.keys(byEmp).map(function (k) { return byEmp[k]; })
            .filter(function (e) { return (e.paid + e.absent + e.other) > 0; })
            .sort(function (a, b) {
                return (b.paid + b.absent + b.other) - (a.paid + a.absent + a.other);
            });
        return {
            year: year, month: month,
            totalDays: totalDays, totalPeople: Object.keys(peopleSet).length,
            kindDays: kindDays,
            pendingCount: pendingCount, rejectedCount: rejectedCount,
            byEmployee: list
        };
    }

    function onReportKeydown(e) {
        if (e.key === 'Escape') closeReportModal();
    }

    function closeReportModal() {
        var el = document.getElementById('laReportModal');
        if (el && el.parentNode) el.parentNode.removeChild(el);
        document.removeEventListener('keydown', onReportKeydown);
    }

    // ==========================================================
    // 通知センター (E6) — N-2.3 / N-2.4.5 自領域発信化（新システム）
    // 旧 notifications/pushNotification/buildNotifyPanel 等は撤去。
    // 共通ベルは co-notify-panel.js (window.coNotifyPanel) が管理。
    // ==========================================================

    function laCnTodayLabel() {
        var d = laDemoTodayDate();
        return '今日 (' + (d.getMonth() + 1) + '/' + d.getDate() + ')';
    }

    function laCnTimeNow() {
        var d = new Date();
        var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
        return pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function laCnDayLabel(dateKey) {
        if (!dateKey) return '';
        var d = parseDate(dateKey);
        if (!d) return dateKey;
        return (d.getMonth() + 1) + '/' + d.getDate();
    }

    function laCnRecurrenceLabel(recurrence) {
        if (!recurrence || !recurrence.rule) return 'なし';
        if (recurrence.rule === 'weekly') {
            return '毎週（' + laCnDayLabel(recurrence.until) + 'まで）';
        }
        return recurrence.rule;
    }

    // 自領域発信: addItem('la', ...) ラッパー (scope='application', op=add/modify/delete/approve/reject)
    // opts: { leaveId, employeeName, day, kind, partition, operator, fieldLabel, diffs }
    function laCnSelfNotify(op, opts) {
        if (!opts) opts = {};
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.addItem !== 'function') return;

        var empName = opts.employeeName || '';
        var dayStr = opts.day || '';
        var kindStr = opts.kind || '';
        var partStr = opts.partition || '';
        var leaveRecord = opts.leaveId ? laLeaves.find(function (x) { return String(x.id) === String(opts.leaveId); }) : null;
        var targetDate = opts.date || (leaveRecord ? leaveRecord.date : '');

        // N-3.4.2: main 文言テンプレートは notify-compare.html 通知一覧 (N-3.4) 表が SSOT。
        //   add:     '{empName} が {day} {kind}({partition}) に休暇申請'
        //   modify:  '{empName} の {day} {fieldLabel} 申請を変更'
        //   delete:  '{empName} の {day} {kind} 申請を削除'
        //   approve: '{empName} の {day} 申請を承認'
        //   reject:  '{empName} の {day} 申請を却下'
        var mainText;
        if (op === 'add') {
            mainText = empName + '｜' + kindStr +
                       (partStr ? '（' + partStr + '）' : '') + ' を申請';
        } else if (op === 'modify') {
            mainText = opts.fieldLabel
                ? empName + '｜' + opts.fieldLabel + 'を変更'
                : empName + '｜申請内容を変更';
        } else if (op === 'delete') {
            mainText = empName + '｜' + kindStr + ' 申請を削除';
        } else if (op === 'approve') {
            mainText = empName + '｜申請を承認';
        } else if (op === 'reject') {
            mainText = empName + '｜申請を却下';
        } else {
            mainText = empName + ' / application × ' + op;
        }

        var operator = opts.operator || '自分';
        var subText = operator + ' ・ ' + laCnTimeNow();

        var expandText = '';
        if (opts.diffs && opts.diffs.length > 0) {
            expandText = opts.diffs.map(function (d) {
                return d.field + ': ' + d.oldVal + ' → ' + d.newVal;
            }).join(' / ');
        }

        var target = null;
        if (opts.leaveId) {
            target = {
                'leave-application': { axis: 'leaveId', value: String(opts.leaveId) },
                'weekly-schedule': { axis: 'leaveId', value: String(opts.leaveId) }
            };
            // SL は leaveId を直接解決できないため、休み社員名で着地できるよう empName 軸を渡す（§17.4-C / N-6）
            if (empName) target['screen-layout'] = { axis: 'empName', value: empName, date: targetDate };
        }

        window.coNotifyPanel.addItem('la', {
            scope: 'application',
            op: op,
            domain: 'leave',
            primaryPage: 'leave-application',
            main: mainText,
            sub: subText,
            date: laCnTodayLabel(),
            targetDate: targetDate,
            expand: expandText,
            diffs: opts.diffs || null,
            affects: ['leave-application', 'weekly-schedule', 'screen-layout'],
            target: target
        });
    }

    // 初期デモ通知 (N-2.4.5 確定の代表 3件: add / approve / reject)
    function laCnSeedInitialDemo() {
        if (!window.coNotifyPanel || typeof window.coNotifyPanel.setItems !== 'function') return;
        var today = laCnTodayLabel();
        // laLeaves から代表3件 (pending / approved / rejected) を抽出してデモ化
        var pending  = laLeaves.find(function (x) { return x.status === 'pending'; });
        var approved = laLeaves.find(function (x) { return x.status === 'approved'; });
        var rejected = laLeaves.find(function (x) { return x.status === 'rejected'; });

        function findEmp(lv) {
            return lv ? laEmployees.find(function (e) { return e.id === lv.employeeId; }) : null;
        }
        var items = [];
        if (pending) {
            var emp1 = findEmp(pending);
            if (emp1) items.push({
                scope: 'application', op: 'add',
                main: emp1.name + ' が ' + laCnDayLabel(pending.date) + ' ' + KIND[pending.kind] +
                      '（' + PART[pending.partition] + '） に休暇申請',
                sub: emp1.name + '（本人） ・ 09:15',
                date: today,
                expand: '理由: ' + (pending.reason || '私用'),
                affects: ['leave-application', 'weekly-schedule'],
                target: { axis: 'leaveId', value: String(pending.id) }
            });
        }
        if (approved) {
            var emp2 = findEmp(approved);
            if (emp2) items.push({
                scope: 'application', op: 'approve',
                main: emp2.name + ' の ' + laCnDayLabel(approved.date) + ' 申請を承認',
                sub: 'DCP-田中 ・ 10:30',
                date: today,
                expand: '承認日時: ' + (approved.approvedAt || today),
                affects: ['leave-application', 'weekly-schedule'],
                target: { axis: 'leaveId', value: String(approved.id) }
            });
        }
        if (rejected) {
            var emp3 = findEmp(rejected);
            if (emp3) items.push({
                scope: 'application', op: 'reject',
                main: emp3.name + ' の ' + laCnDayLabel(rejected.date) + ' 申請を却下',
                sub: 'DCP-田中 ・ 昨日 17:00',
                date: '昨日',
                expand: '却下理由: 当日他申請と重複',
                affects: ['leave-application', 'weekly-schedule'],
                target: { axis: 'leaveId', value: String(rejected.id) }
            });
        }
        window.coNotifyPanel.setItems('la', items);
    }

    // cn:jump → 該当休暇バッジを残して周辺を薄暗くする + ポップオーバー (新システム / §6.5 仕様準拠)
    document.addEventListener('cn:jump', function (e) {
        var d = e.detail || {};
        if (d.inContext !== true) return;
        var target = d.target;
        if (!target || target.axis !== 'leaveId') return;
        var leaveId = target.value;
        var lv = laLeaves.find(function (x) { return String(x.id) === String(leaveId); });
        if (!lv) return;
        // 月間ビュー切替 + 月遷移
        var dd = parseDate(lv.date);
        var needsRender = (
            currentView !== 'month' ||
            dd.getFullYear() !== currentDate.getFullYear() ||
            dd.getMonth() !== currentDate.getMonth()
        );
        if (needsRender) {
            currentView = 'month';
            currentDate = new Date(dd.getFullYear(), dd.getMonth(), 1);
            document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.view === 'month');
            });
            render();
        }
        setTimeout(function () {
            var badge = document.querySelector('.md-la-badge[data-leave-id="' + lv.id + '"]');
            if (!badge) return;
            badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (window.coNotifyFocusOverlay && typeof window.coNotifyFocusOverlay.show === 'function') {
                window.coNotifyFocusOverlay.show(badge, {
                    candidateSelector: '.md-la-badge'
                });
            }
            if (typeof laShowBadgeInfo === 'function') laShowBadgeInfo(lv, badge);
        }, needsRender ? 100 : 0);
    });

    // ----- 旧 pushNotification / seedNotifications / buildNotifyPanel / laRevertNotification 等は
    //       N-2.3 で全撤去（laCnSelfNotify / laCnSeedInitialDemo / 新 cn:jump ハンドラ に置換済み）。

    // ==========================================================
    // CSV 出力 (E5)
    // ==========================================================

    function exportReportCsv(report) {
        var lines = [];
        lines.push(['社員', 'GC', '有給', '休暇', 'その他', '合計', '有給残'].join(','));
        report.byEmployee.forEach(function (r) {
            var total = r.paid + r.absent + r.other;
            var gcShort = (groupCompaniesData.find(function (g) { return g.code === r.company; }) || {}).shortName || r.company;
            lines.push([r.name, gcShort, r.paid, r.absent, r.other, total, r.paidLeaveRemaining].join(','));
        });
        // Excel 互換のため UTF-8 BOM 付き
        var csv = '﻿' + lines.join('\r\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var fname = '休暇集計_' + report.year + '年' + (report.month + 1) + '月.csv';
        var a = document.createElement('a');
        a.href = url;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 200);
    }

    function buildBadge(lv, opts) {
        opts = opts || {};
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        if (!emp) return document.createElement('span');

        // 表示モード: 月間/年間=イニシャル, 週間=氏名フル。opts.mode で明示指定可
        var mode = opts.mode || (currentView === 'week' ? 'full' : 'initial');

        var b = document.createElement('div');
        b.className = 'md-la-badge kind-' + lv.kind + ' is-' + lv.status
            + ' gc-' + emp.company + ' md-la-mode-' + mode;
        b.dataset.leaveId = lv.id;
        b.draggable = true;
        var conflict = getWsAssignment(lv.employeeId, lv.date);
        if (conflict) b.classList.add('is-ws-conflict');
        if (!canEditLeave(lv)) b.classList.add('is-readonly');
        // ネイティブ tooltip はアクセシビリティ/スクリーンリーダー用の最小テキストに留める
        b.setAttribute('aria-label',
            emp.name + ' — ' + KIND[lv.kind] + ' (' + PART[lv.partition] + ') / ' + STATUS[lv.status]);
        // リッチ tooltip をホバーで表示 (カスタム)
        b.addEventListener('mouseenter', function (e) { scheduleTooltip(lv, b, e); });
        b.addEventListener('mouseleave', cancelTooltip);

        // 上部オーバーレイ行: 種別 (有/欠/他) チップ + 半休時の昼✖/夜✖ チップ
        // - 種別チップは常に表示
        // - 区分が半休 (am/pm) のときのみ昼✖/夜✖を右側に並べる
        var overlayRow = document.createElement('span');
        overlayRow.className = 'md-la-badge-overlay-row';
        b.classList.add('has-overlay-row');
        var kindOverlay = document.createElement('span');
        kindOverlay.className = 'md-la-badge-kind-overlay kind-' + lv.kind;
        kindOverlay.textContent = KIND_CHIP[lv.kind];
        overlayRow.appendChild(kindOverlay);
        if (PART_CHIP[lv.partition]) {
            b.classList.add('has-part-overlay');
            var partOverlay = document.createElement('span');
            partOverlay.className = 'md-la-badge-part-overlay part-' + lv.partition;
            partOverlay.textContent = PART_CHIP[lv.partition];
            overlayRow.appendChild(partOverlay);
        }
        b.appendChild(overlayRow);

        // 上段: 氏名 (surname 略称)
        var nameRow = document.createElement('span');
        nameRow.className = 'md-la-badge-name-row';
        nameRow.textContent = emp.name;
        b.appendChild(nameRow);

        // 下段: ステータスチップ (種別はオーバーレイ行へ移動済)
        var chips = document.createElement('span');
        chips.className = 'md-la-badge-chips';
        var statusChip = document.createElement('span');
        statusChip.className = 'md-la-badge-chip status-' + lv.status;
        statusChip.textContent = STATUS_CHIP[lv.status];
        chips.appendChild(statusChip);
        b.appendChild(chips);

        // 端ドラッグハンドル (E3: 連続日延長)
        var eL = document.createElement('span');
        eL.className = 'md-la-badge-edge left';
        eL.addEventListener('mousedown', function (e) { startRangeDrag(e, lv, 'left'); });
        b.appendChild(eL);
        var eR = document.createElement('span');
        eR.className = 'md-la-badge-edge right';
        eR.addEventListener('mousedown', function (e) { startRangeDrag(e, lv, 'right'); });
        b.appendChild(eR);

        // バッジクリック → 詳細編集ポップオーバー (E2)
        b.addEventListener('click', function (e) {
            e.stopPropagation();
            laShowBadgeInfo(lv, b);
        });

        // バッジ D&D: 他日へ移動
        b.addEventListener('dragstart', function (e) {
            // 端ドラッグ中は HTML5 DnD を抑止
            if (rangeDragState) { e.preventDefault(); return; }
            dragState = { sourceType: 'badge', leaveId: lv.id };
            b.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', lv.id); } catch (err) {}
            laShowGhost(e, emp.name + ' (' + PART[lv.partition] + ')');
        });
        b.addEventListener('dragend', function () {
            b.classList.remove('is-dragging');
            laHideGhost();
            dragState = null;
            clearDropHighlights();
        });
        b.addEventListener('drag', laMoveGhost);

        return b;
    }

    // ==========================================================
    // サイドパネル
    // ==========================================================

    function renderSidebar() {
        var body = document.getElementById('laSidebarBody');
        var title = document.getElementById('laSidebarTitle');
        var count = document.getElementById('laSidebarCount');
        var search = document.querySelector('.md-la-sidebar-search');
        if (!body) return;
        body.innerHTML = '';
        body.classList.toggle('mode-emp',    sidebarMode === 'emp' && currentMode === 'leave');
        body.classList.toggle('mode-alerts', sidebarMode === 'alerts');
        body.classList.toggle('mode-vehicle', currentMode === 'vehicle');

        if (currentMode === 'vehicle') {
            if (title) title.textContent = '車両';
            if (search) {
                search.classList.remove('md-la-hidden');
                var si = document.getElementById('laSidebarSearch');
                if (si) si.placeholder = 'ナンバー・車種で検索...';
            }
            vsRenderVehicleList(body, count);
        } else if (sidebarMode === 'alerts') {
            if (title) title.textContent = '要対応';
            if (search) search.classList.add('md-la-hidden');
            renderAlertList(body, count);
        } else {
            if (title) title.textContent = '社員';
            if (search) {
                search.classList.remove('md-la-hidden');
                var si2 = document.getElementById('laSidebarSearch');
                if (si2) si2.placeholder = '氏名で検索...';
            }
            renderEmployeeList(body, count);
        }

        renderAlertTabBadge();
        vsRenderDueSoonBadge();
    }

    function renderEmployeeList(body, count) {
        var filtered = laEmployees.filter(function (e) {
            if (sidebarActiveTab !== 'all' && e.company !== sidebarActiveTab) return false;
            if (searchQuery && e.name.indexOf(searchQuery) === -1) return false;
            return true;
        });

        if (count) count.textContent = filtered.length + '名';

        // GC グループ化 (all タブ時のみヘッダー挿入)
        var currentGc = null;
        filtered.forEach(function (emp) {
            if (sidebarActiveTab === 'all' && emp.company !== currentGc) {
                currentGc = emp.company;
                var h = document.createElement('div');
                h.className = 'md-la-emp-group';
                var gcLabel = groupCompaniesData.find(function (g) { return g.code === emp.company; });
                h.textContent = gcLabel ? gcLabel.shortName : emp.company;
                body.appendChild(h);
            }
            body.appendChild(buildEmpCard(emp));
        });

        if (filtered.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'md-la-placeholder-hint';
            empty.textContent = '該当する社員はいません';
            body.appendChild(empty);
        }
    }

    function buildEmpCard(emp) {
        var c = document.createElement('div');
        c.className = 'md-la-emp gc-' + emp.company;
        c.draggable = true;
        c.dataset.employeeId = emp.id;
        c.title = emp.name + '（' + (emp.role === 'dcp' ? 'DCP' : emp.role === 'chief' ? '現場責任' : '一般')
            + '）\n有給残 ' + emp.paidLeaveRemaining + '日 / 今月 ' + emp.paidLeaveUsedThisMonth + '日';

        // 役職ドット (DCP/現場責任時のみ)
        if (emp.role === 'dcp' || emp.role === 'chief') {
            var dot = document.createElement('span');
            dot.className = 'md-la-emp-role-dot is-' + emp.role;
            c.appendChild(dot);
        }

        var name = document.createElement('span');
        name.className = 'md-la-emp-name';
        name.textContent = emp.name;
        c.appendChild(name);

        var leave = document.createElement('span');
        leave.className = 'md-la-emp-leave';
        leave.textContent = emp.paidLeaveRemaining + '日';
        c.appendChild(leave);

        // 未承認申請数のドット (右上)
        var pendingCount = laLeaves.filter(function (lv) {
            return lv.employeeId === emp.id && lv.status === 'pending';
        }).length;
        if (pendingCount > 0) {
            var ad = document.createElement('span');
            ad.className = 'md-la-emp-alert-dot';
            ad.textContent = pendingCount;
            c.appendChild(ad);
        }

        // D&D 起点
        c.addEventListener('dragstart', function (e) {
            dragState = { sourceType: 'employee', employeeId: emp.id };
            c.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'copy';
            try { e.dataTransfer.setData('text/plain', emp.id); } catch (err) {}
            laShowGhost(e, emp.name);
        });
        c.addEventListener('dragend', function () {
            c.classList.remove('is-dragging');
            laHideGhost();
            dragState = null;
            clearDropHighlights();
        });
        c.addEventListener('drag', laMoveGhost);

        return c;
    }

    // ==========================================================
    // 要対応タブ: アラートリスト描画
    // ==========================================================

    function collectAlerts() {
        var pending = [];
        var conflicts = [];
        laLeaves.forEach(function (lv) {
            if (lv.status === 'rejected') return;
            if (lv.status === 'pending') pending.push(lv);
            if (getWsAssignment(lv.employeeId, lv.date)) conflicts.push(lv);
        });
        // 日付順 (降順: 最新から — 未承認は早く気付くべき)
        var cmp = function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; };
        pending.sort(cmp);
        conflicts.sort(cmp);
        return { pending: pending, conflicts: conflicts };
    }

    function renderAlertList(body, count) {
        var alerts = collectAlerts();
        var total = alerts.pending.length + alerts.conflicts.length;
        if (count) count.textContent = total + '件';

        // 未承認セクション
        body.appendChild(buildAlertSection('pending', '未承認の申請', alerts.pending));
        // 衝突セクション
        body.appendChild(buildAlertSection('conflict', 'WS配置との衝突', alerts.conflicts));

        if (total === 0) {
            var empty = document.createElement('div');
            empty.className = 'md-la-alert-empty';
            empty.textContent = '対応が必要な項目はありません ✓';
            body.appendChild(empty);
        }
    }

    function buildAlertSection(type, title, items) {
        var sec = document.createElement('div');
        sec.className = 'md-la-alert-section is-' + type;
        var head = document.createElement('div');
        head.className = 'md-la-alert-section-title';
        head.innerHTML = title + '<span class="md-la-alert-count">' + items.length + '</span>';
        sec.appendChild(head);
        items.forEach(function (lv) { sec.appendChild(buildAlertItem(type, lv)); });
        if (items.length === 0) {
            var none = document.createElement('div');
            none.className = 'md-la-alert-empty';
            none.style.padding = '6px 4px';
            none.textContent = '（該当なし）';
            sec.appendChild(none);
        }
        return sec;
    }

    function buildAlertItem(type, lv) {
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        var d = parseDate(lv.date);
        var item = document.createElement('div');
        item.className = 'md-la-alert-item is-' + type;
        item.dataset.leaveId = lv.id;

        // 日付ブロック
        var dateEl = document.createElement('div');
        dateEl.className = 'md-la-alert-date';
        dateEl.innerHTML = (d.getMonth() + 1) + '月<strong>' + d.getDate() + '日</strong>';
        item.appendChild(dateEl);

        // 本体
        var body = document.createElement('div');
        body.className = 'md-la-alert-body';
        var name = document.createElement('div');
        name.className = 'md-la-alert-name';
        name.textContent = (emp ? emp.name : '(不明)') + ' — ' + KIND[lv.kind] + '(' + PART[lv.partition] + ')';
        var detail = document.createElement('div');
        detail.className = 'md-la-alert-detail';
        if (type === 'pending') {
            detail.textContent = '申請中 · 承認待ち';
        } else {
            var ws = getWsAssignment(lv.employeeId, lv.date);
            detail.textContent = 'WS: ' + (ws ? ws.siteName + '(' + ws.shift + ')' : '配置済み');
        }
        body.appendChild(name);
        body.appendChild(detail);
        item.appendChild(body);

        // アイコン
        var icon = document.createElement('div');
        icon.className = 'md-la-alert-icon';
        icon.textContent = type === 'pending' ? '!' : '⚠';
        item.appendChild(icon);

        // クリック → 該当日へジャンプ + ポップオーバーオープン
        item.addEventListener('click', function () { jumpToLeave(lv); });

        return item;
    }

    function renderAlertTabBadge() {
        var badge = document.getElementById('laAlertTabBadge');
        if (!badge) return;
        var alerts = collectAlerts();
        var total = alerts.pending.length + alerts.conflicts.length;
        if (total === 0) {
            badge.classList.add('md-la-hidden');
        } else {
            badge.classList.remove('md-la-hidden');
            badge.textContent = total > 99 ? '99+' : total;
        }
    }

    function jumpToLeave(lv) {
        var d = parseDate(lv.date);
        // ビューに応じて表示範囲を合わせる
        if (currentView === 'year') {
            currentView = 'month';
            currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
            document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.view === 'month');
            });
        } else if (currentView === 'week') {
            currentWeekAnchor = new Date(d);
        } else {
            // month
            if (currentDate.getFullYear() !== d.getFullYear()
                || currentDate.getMonth() !== d.getMonth()) {
                currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
            }
        }
        render();
        setTimeout(function () {
            var badge = document.querySelector('.md-la-badge[data-leave-id="' + lv.id + '"]');
            if (!badge) return;
            // スクロール + ハイライトアニメ + ポップオーバー
            badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
            badge.classList.add('is-jump-highlight');
            setTimeout(function () { badge.classList.remove('is-jump-highlight'); }, 2000);
            laShowBadgeInfo(lv, badge);
        }, 60);
    }

    // ==========================================================
    // D&D: セル ドロップ受け入れ
    // ==========================================================

    function onCellDragOver(e) {
        if (!dragState) return;
        e.preventDefault();
        // 新規ソース (employee / vehicle) は copy、配置済みバッジ移動は move
        var isCopySource = dragState.sourceType === 'employee' || dragState.sourceType === 'vehicle';
        e.dataTransfer.dropEffect = isCopySource ? 'copy' : 'move';
        this.classList.add('is-drop-target');
    }
    function onCellDragLeave() {
        this.classList.remove('is-drop-target');
    }
    function onCellDrop(e) {
        e.preventDefault();
        this.classList.remove('is-drop-target');
        if (!dragState) return;
        var targetDate = this.dataset.date;
        if (!targetDate) return;

        if (dragState.sourceType === 'employee') {
            // 新規作成: 全休・申請中
            var empId = dragState.employeeId;
            // 同日同社員が既にある場合はスキップ
            var dup = laLeaves.find(function (lv) {
                return lv.employeeId === empId && lv.date === targetDate && lv.status !== 'rejected';
            });
            if (dup) {
                laFlashCell(this, '既に同日の申請があります');
            } else {
                var newLv = {
                    id: 'lv-' + (nextLeaveId++),
                    employeeId: empId,
                    date: targetDate,
                    partition: 'full',
                    kind: 'paid',
                    status: 'pending',
                    reason: '',
                    memo: ''
                };
                laLeaves.push(newLv);
                var newEmp = laEmployees.find(function (e) { return e.id === empId; });
                laCnSelfNotify('add', {
                    leaveId: newLv.id,
                    employeeName: newEmp ? newEmp.name : '',
                    day: laCnDayLabel(targetDate),
                    kind: KIND[newLv.kind],
                    partition: PART[newLv.partition],
                    operator: currentRoleLabel()
                });
            }
        } else if (dragState.sourceType === 'badge') {
            var lv = laLeaves.find(function (x) { return x.id === dragState.leaveId; });
            if (lv) {
                var oldDay = lv.date;
                lv.date = targetDate;
                var movedEmp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
                laCnSelfNotify('modify', {
                    leaveId: lv.id,
                    employeeName: movedEmp ? movedEmp.name : '',
                    day: laCnDayLabel(targetDate),
                    fieldLabel: '日付',
                    operator: currentRoleLabel(),
                    diffs: [{ field: '日付', oldVal: laCnDayLabel(oldDay), newVal: laCnDayLabel(targetDate) }]
                });
            }
        } else if (dragState.sourceType === 'vehicle') {
            // 車両モード: 車両を日付セルへドロップ → 種別選択ポップオーバー
            vsHandleVehicleDrop(dragState.vehicleId, targetDate, this);
        } else if (dragState.sourceType === 'vsBadge') {
            // 車両モード: 既配置の車両バッジ自体を別日へ移動 (関連するすべてのスケジュールを移動)
            vsMoveVehicleSchedules(dragState.vehicleId, dragState.fromDate, targetDate);
        }
        render();
    }

    function clearDropHighlights() {
        document.querySelectorAll('.md-la-cell.is-drop-target, .md-la-cell.is-drop-preview')
            .forEach(function (c) {
                c.classList.remove('is-drop-target');
                c.classList.remove('is-drop-preview');
            });
    }

    function laFlashCell(cell, msg) {
        // シンプルなトースト (CSS アニメ未実装、タイトルで代用)
        cell.title = msg;
        cell.style.boxShadow = '0 0 0 2px var(--semantic-error) inset';
        setTimeout(function () { cell.style.boxShadow = ''; }, 800);
    }

    // ==========================================================
    // バッジ ホバー ツールチップ (リッチ版)
    // ==========================================================

    var tooltipEl = null;
    var tooltipTimer = null;
    var TOOLTIP_DELAY = 280;

    function scheduleTooltip(lv, anchor, mouseEvt) {
        cancelTooltip();
        // ドラッグ中・ポップオーバー表示中は抑止
        if (dragState || rangeDragState || popoverState) return;
        tooltipTimer = setTimeout(function () {
            showTooltip(lv, anchor);
        }, TOOLTIP_DELAY);
    }

    function cancelTooltip() {
        if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
        hideTooltip();
    }

    function hideTooltip() {
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
        tooltipEl = null;
    }

    function showTooltip(lv, anchor) {
        hideTooltip();
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        if (!emp) return;
        var conflict = getWsAssignment(lv.employeeId, lv.date);
        tooltipEl = buildTooltipEl(lv, emp, conflict);
        document.body.appendChild(tooltipEl);
        positionTooltip(tooltipEl, anchor);
    }

    function buildTooltipEl(lv, emp, conflict) {
        var tip = document.createElement('div');
        tip.className = 'md-la-tooltip';

        // 1段目: 氏名 + 日付 + ステータスピル
        var title = document.createElement('div');
        title.className = 'md-la-tooltip-title';
        var name = document.createElement('span');
        name.className = 'md-la-tooltip-name';
        name.textContent = emp.name + '  ' + formatJpDateShort(lv.date);
        title.appendChild(name);
        var status = document.createElement('span');
        status.className = 'md-la-tooltip-status status-' + lv.status;
        status.textContent = STATUS[lv.status];
        title.appendChild(status);
        tip.appendChild(title);

        // 2段目: 区分 ・ 種別 (中黒区切りで端的に)
        var summary = document.createElement('div');
        summary.className = 'md-la-tooltip-summary';
        summary.textContent = PART[lv.partition] + ' ・ ' + KIND[lv.kind];
        tip.appendChild(summary);

        // 衝突がある場合のみ簡潔に警告
        if (conflict) {
            var warn = document.createElement('div');
            warn.className = 'md-la-tooltip-warn-mini';
            warn.textContent = '⚠ WS配置衝突: ' + conflict.siteName;
            tip.appendChild(warn);
        }

        return tip;
    }

    function formatJpDateShort(key) {
        var d = parseDate(key);
        var dow = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
        return (d.getMonth() + 1) + '/' + d.getDate() + '(' + dow + ')';
    }

    function positionTooltip(tip, anchor) {
        var ar = anchor.getBoundingClientRect();
        var margin = 8;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        // まずは非表示のまま配置して寸法を測る
        tip.style.visibility = 'hidden';
        tip.style.left = '0px';
        tip.style.top = '0px';
        var tw = tip.offsetWidth;
        var th = tip.offsetHeight;
        // 既定: バッジの下に中央寄せ
        var left = ar.left + (ar.width / 2) - (tw / 2);
        var top  = ar.bottom + margin;
        // 下に入らなければ上へフリップ
        if (top + th + margin > vh) top = ar.top - th - margin;
        // 左右調整
        if (left + tw + margin > vw) left = vw - tw - margin;
        if (left < margin) left = margin;
        if (top < margin) top = margin;
        tip.style.left = Math.round(left) + 'px';
        tip.style.top  = Math.round(top)  + 'px';
        tip.style.visibility = '';
    }

    // スクロール時は追従させずに閉じる (軽量化)
    window.addEventListener('scroll', cancelTooltip, true);

    // ==========================================================
    // D&D ゴースト
    // ==========================================================

    var ghostEl = null;
    function laShowGhost(e, text) {
        ghostEl = document.createElement('div');
        ghostEl.className = 'md-la-drag-ghost';
        ghostEl.textContent = text;
        document.body.appendChild(ghostEl);
        laMoveGhost(e);
        // HTML5 DnD の標準ゴーストを透明化
        try {
            var empty = document.createElement('canvas');
            empty.width = empty.height = 1;
            e.dataTransfer.setDragImage(empty, 0, 0);
        } catch (err) {}
    }
    function laMoveGhost(e) {
        if (!ghostEl) return;
        if (!e.clientX && !e.clientY) return; // ドラッグ終了時は 0,0
        ghostEl.style.left = (e.clientX + 12) + 'px';
        ghostEl.style.top = (e.clientY + 12) + 'px';
    }
    function laHideGhost() {
        if (ghostEl && ghostEl.parentNode) ghostEl.parentNode.removeChild(ghostEl);
        ghostEl = null;
    }

    // ==========================================================
    // 連続日延長 (E3: バッジ端ドラッグ)
    // ==========================================================

    var rangeDragState = null; // { leaveId, side, originDate, currentDate, ghostEl }

    function startRangeDrag(e, lv, side) {
        e.preventDefault();
        e.stopPropagation();
        // ポップオーバー抑止 & 通常ドラッグ抑止
        rangeDragState = {
            leaveId: lv.id,
            side: side,
            originDate: lv.date,
            currentDate: lv.date,
            employeeId: lv.employeeId,
            kind: lv.kind,
            partition: lv.partition,
            status: lv.status
        };

        var ghost = document.createElement('div');
        ghost.className = 'md-la-range-ghost';
        ghost.textContent = '1日間';
        document.body.appendChild(ghost);
        rangeDragState.ghostEl = ghost;
        moveRangeGhost(e);

        document.body.classList.add('is-range-dragging');
        document.addEventListener('mousemove', onRangeMouseMove);
        document.addEventListener('mouseup', onRangeMouseUp, { once: true });
    }

    function moveRangeGhost(e) {
        if (!rangeDragState || !rangeDragState.ghostEl) return;
        rangeDragState.ghostEl.style.left = (e.clientX + 14) + 'px';
        rangeDragState.ghostEl.style.top = (e.clientY + 14) + 'px';
    }

    function onRangeMouseMove(e) {
        if (!rangeDragState) return;
        moveRangeGhost(e);
        // マウス直下のセルを探す
        var el = document.elementFromPoint(e.clientX, e.clientY);
        var cell = el && el.closest ? el.closest('.md-la-cell') : null;
        if (!cell || !cell.dataset.date) return;
        rangeDragState.currentDate = cell.dataset.date;
        updateRangePreview();
    }

    function updateRangePreview() {
        // 既存プレビュークリア
        document.querySelectorAll('.md-la-cell.is-range-preview, .md-la-cell.is-range-conflict')
            .forEach(function (c) {
                c.classList.remove('is-range-preview');
                c.classList.remove('is-range-conflict');
            });

        if (!rangeDragState) return;
        var s = rangeDragState;
        var origin = parseDate(s.originDate);
        var current = parseDate(s.currentDate);
        // side に応じて有効な延長方向のみ採用
        var rangeStart, rangeEnd;
        if (s.side === 'right') {
            rangeStart = origin;
            rangeEnd = current >= origin ? current : origin;
        } else {
            rangeStart = current <= origin ? current : origin;
            rangeEnd = origin;
        }

        var days = 0, conflictCount = 0;
        for (var d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
            var key = fmtDate(d);
            var cell = document.querySelector('.md-la-cell[data-date="' + key + '"]');
            if (!cell) continue;
            // 起点日 (すでに確定済みバッジがある日) は通常プレビュー
            days++;
            var hasConflict = laLeaves.some(function (lv) {
                return lv.employeeId === s.employeeId
                    && lv.date === key
                    && lv.id !== s.leaveId
                    && lv.status !== 'rejected';
            });
            if (hasConflict) {
                cell.classList.add('is-range-conflict');
                conflictCount++;
            } else {
                cell.classList.add('is-range-preview');
            }
        }
        // ゴースト更新
        if (s.ghostEl) {
            if (conflictCount > 0) {
                s.ghostEl.textContent = days + '日間（' + conflictCount + '日重複）';
                s.ghostEl.classList.add('is-conflict');
            } else {
                s.ghostEl.textContent = days + '日間';
                s.ghostEl.classList.remove('is-conflict');
            }
        }
    }

    function onRangeMouseUp() {
        document.removeEventListener('mousemove', onRangeMouseMove);
        document.body.classList.remove('is-range-dragging');

        if (!rangeDragState) return cleanupRangeDrag();
        var s = rangeDragState;

        // 範囲決定
        var origin = parseDate(s.originDate);
        var current = parseDate(s.currentDate);
        var rangeStart, rangeEnd;
        if (s.side === 'right') {
            rangeStart = origin;
            rangeEnd = current >= origin ? current : origin;
        } else {
            rangeStart = current <= origin ? current : origin;
            rangeEnd = origin;
        }

        // 起点と同じ日なら何もしない
        if (sameDay(rangeStart, rangeEnd)) return cleanupRangeDrag();

        // 範囲内の各日にレコードを作成 (既に同社員・同日のレコードがある日はスキップ)
        for (var d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
            var key = fmtDate(d);
            if (key === s.originDate) continue;
            var exists = laLeaves.some(function (lv) {
                return lv.employeeId === s.employeeId
                    && lv.date === key
                    && lv.status !== 'rejected';
            });
            if (exists) continue;
            laLeaves.push({
                id: 'lv-' + (nextLeaveId++),
                employeeId: s.employeeId,
                date: key,
                partition: s.partition,
                kind: s.kind,
                status: s.status,
                reason: '',
                memo: ''
            });
        }

        cleanupRangeDrag();
        render();
    }

    function cleanupRangeDrag() {
        if (rangeDragState && rangeDragState.ghostEl && rangeDragState.ghostEl.parentNode) {
            rangeDragState.ghostEl.parentNode.removeChild(rangeDragState.ghostEl);
        }
        document.querySelectorAll('.md-la-cell.is-range-preview, .md-la-cell.is-range-conflict')
            .forEach(function (c) {
                c.classList.remove('is-range-preview');
                c.classList.remove('is-range-conflict');
            });
        rangeDragState = null;
    }

    // ==========================================================
    // 詳細編集ポップオーバー (E2)
    // ==========================================================

    var popoverState = null; // { leaveId, anchorEl, draft: {...} }

    function laShowBadgeInfo(lv, anchorEl) {
        // 既存の popover があれば閉じる
        laClosePopover();
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        if (!emp) return;

        // ドラフト (キャンセル時にロールバックできるようコピー)
        popoverState = {
            leaveId: lv.id,
            anchorEl: anchorEl,
            draft: {
                partition: lv.partition,
                kind: lv.kind,
                status: lv.status,
                reason: lv.reason || '',
                memo: lv.memo || '',
                recurrence: lv.recurrence ? Object.assign({}, lv.recurrence) : null
            },
            employee: emp,
            date: lv.date
        };
        var popover = buildPopoverEl();
        document.body.appendChild(popover);
        positionPopover(popover, anchorEl);

        // 外部クリック・ESC で閉じる (次のティックから有効化して自身のクリックで閉じないように)
        setTimeout(function () {
            document.addEventListener('mousedown', onOutsideMousedown);
            document.addEventListener('keydown', onPopoverKeydown);
        }, 0);
    }

    function buildPopoverEl() {
        var s = popoverState;
        var lv = laLeaves.find(function (x) { return x.id === s.leaveId; });
        var editable = lv ? canEditLeave(lv) : false;
        var approvable = lv ? canApproveLeave(lv) : false;
        var isPast = isPastDate(s.date);

        var pop = document.createElement('div');
        pop.className = 'md-la-popover';
        pop.id = 'laPopover';

        // ヘッダー
        var header = document.createElement('div');
        header.className = 'md-la-popover-header';
        var gc = document.createElement('span');
        gc.className = 'md-la-popover-gc gc-' + s.employee.company;
        header.appendChild(gc);
        var titleWrap = document.createElement('div');
        titleWrap.style.cssText = 'display:flex;flex-direction:column;flex:1;min-width:0;';
        var title = document.createElement('span');
        title.className = 'md-la-popover-title';
        title.textContent = s.employee.name;
        var date = document.createElement('span');
        date.className = 'md-la-popover-date';
        date.textContent = formatJpDate(s.date);
        titleWrap.appendChild(title);
        titleWrap.appendChild(date);
        header.appendChild(titleWrap);
        var close = document.createElement('button');
        close.className = 'md-la-popover-close';
        close.title = '閉じる';
        close.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg>';
        close.addEventListener('click', laClosePopover);
        header.appendChild(close);
        pop.appendChild(header);

        // 読み取り専用 / 過去日バナー (E6/E7)
        if (!editable) {
            var banner = document.createElement('div');
            banner.className = 'md-la-popover-status-banner is-readonly';
            var reason = isPast && currentRole !== 'admin' && currentRole !== 'dcp'
                ? '過去日は管理者のみ編集可'
                : (lv && lv.status === 'rejected' ? '却下された申請は編集不可'
                : 'このアカウントではこの申請を編集できません');
            banner.textContent = '読み取り専用 — ' + reason;
            pop.appendChild(banner);
        } else if (isPast) {
            var banner2 = document.createElement('div');
            banner2.className = 'md-la-popover-status-banner';
            banner2.textContent = '過去日 — 管理者/DCP権限で編集中';
            pop.appendChild(banner2);
        }

        // body
        var body = document.createElement('div');
        body.className = 'md-la-popover-body';

        // 区分 (全休→休み にリネーム)
        body.appendChild(buildSegmentField('区分', 'partition',
            [['full', '休み'], ['am', '午前休'], ['pm', '午後休']], false, false, !editable));
        // 種別
        body.appendChild(buildSegmentField('種別', 'kind',
            [['paid', '有給'], ['absent', '休暇'], ['other', 'その他']], true, false, !editable));
        // ステータス (承認権限が無い場合はdisable)
        body.appendChild(buildSegmentField('ステータス', 'status',
            [['pending', '申請中'], ['approved', '承認済'], ['rejected', '却下']],
            false, true, !approvable));
        // 理由
        var reasonField = document.createElement('div');
        reasonField.className = 'md-la-field';
        var reasonLabel = document.createElement('span');
        reasonLabel.className = 'md-la-field-label';
        reasonLabel.textContent = '理由';
        var reasonInput = document.createElement('input');
        reasonInput.type = 'text';
        reasonInput.className = 'md-la-input';
        reasonInput.placeholder = '私用・通院 など';
        reasonInput.value = s.draft.reason;
        if (!editable) reasonInput.disabled = true;
        reasonInput.addEventListener('input', function () { s.draft.reason = this.value; });
        reasonField.appendChild(reasonLabel);
        reasonField.appendChild(reasonInput);
        body.appendChild(reasonField);
        // メモ
        var memoField = document.createElement('div');
        memoField.className = 'md-la-field';
        var memoLabel = document.createElement('span');
        memoLabel.className = 'md-la-field-label';
        memoLabel.textContent = 'メモ（時間帯制限等）';
        var memoInput = document.createElement('textarea');
        memoInput.className = 'md-la-textarea';
        memoInput.placeholder = '例: 14時以降出社不可';
        memoInput.value = s.draft.memo;
        if (!editable) memoInput.disabled = true;
        memoInput.addEventListener('input', function () { s.draft.memo = this.value; });
        memoField.appendChild(memoLabel);
        memoField.appendChild(memoInput);
        body.appendChild(memoField);

        // 繰り返し (E7)
        if (editable) {
            var recField = document.createElement('div');
            recField.className = 'md-la-field';
            var recLabel = document.createElement('span');
            recLabel.className = 'md-la-field-label';
            recLabel.textContent = '繰り返し';
            recField.appendChild(recLabel);
            var recRow = document.createElement('div');
            recRow.className = 'md-la-field-inline';
            var chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.id = 'laRecChk';
            chk.checked = !!s.draft.recurrence;
            var lbl = document.createElement('label');
            lbl.htmlFor = 'laRecChk';
            var dow = parseDate(s.date).getDay();
            var dowName = ['日', '月', '火', '水', '木', '金', '土'][dow];
            lbl.textContent = '毎週' + dowName + '曜 ';
            recRow.appendChild(chk);
            recRow.appendChild(lbl);
            var untilInput = document.createElement('input');
            untilInput.type = 'date';
            untilInput.title = '繰り返し終了日';
            // デフォルト: 2か月後の当該曜日
            var defaultUntil = parseDate(s.date);
            defaultUntil.setMonth(defaultUntil.getMonth() + 2);
            untilInput.value = (s.draft.recurrence && s.draft.recurrence.until) || fmtDate(defaultUntil);
            untilInput.disabled = !chk.checked;
            chk.addEventListener('change', function () {
                untilInput.disabled = !chk.checked;
                if (chk.checked) {
                    s.draft.recurrence = { rule: 'weekly', dayOfWeek: dow, until: untilInput.value };
                } else {
                    s.draft.recurrence = null;
                }
            });
            untilInput.addEventListener('change', function () {
                if (s.draft.recurrence) s.draft.recurrence.until = untilInput.value;
            });
            recRow.appendChild(untilInput);
            recField.appendChild(recRow);
            body.appendChild(recField);
        }

        pop.appendChild(body);

        // DCP 承認アクションバー (E6) — pending かつ承認権限あり時のみ
        if (approvable && lv && lv.status === 'pending') {
            var actionsRow = document.createElement('div');
            actionsRow.className = 'md-la-popover-body';
            actionsRow.style.paddingTop = '0';
            var row = document.createElement('div');
            row.className = 'md-la-popover-actions-row';
            var approveBtn = document.createElement('button');
            approveBtn.className = 'md-la-btn is-success';
            approveBtn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-check"/></svg> 承認';
            approveBtn.addEventListener('click', function () { onApproveReject('approved'); });
            var rejectBtn = document.createElement('button');
            rejectBtn.className = 'md-la-btn is-warning';
            rejectBtn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg> 却下';
            rejectBtn.addEventListener('click', function () { onApproveReject('rejected'); });
            row.appendChild(approveBtn);
            row.appendChild(rejectBtn);
            actionsRow.appendChild(row);
            pop.appendChild(actionsRow);
        }

        // 監査情報 (簡易): 承認者 / 承認日時
        if (lv && (lv.approvedBy || lv.rejectedBy)) {
            var audit = document.createElement('div');
            audit.className = 'md-la-popover-audit';
            if (lv.status === 'approved' && lv.approvedBy) {
                audit.textContent = '✓ 承認者: ' + lv.approvedBy + ' / ' + (lv.approvedAt || '');
            } else if (lv.status === 'rejected' && lv.rejectedBy) {
                audit.textContent = '✗ 却下者: ' + lv.rejectedBy + ' / ' + (lv.rejectedAt || '');
            }
            pop.appendChild(audit);
        }

        // フッター
        var footer = document.createElement('div');
        footer.className = 'md-la-popover-footer';
        var delBtn = document.createElement('button');
        delBtn.className = 'md-la-btn is-danger';
        delBtn.textContent = '削除';
        if (!editable) delBtn.disabled = true;
        delBtn.addEventListener('click', onDeleteLeave);
        footer.appendChild(delBtn);
        var spacer = document.createElement('div');
        spacer.className = 'md-la-footer-spacer';
        footer.appendChild(spacer);
        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'md-la-btn';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.addEventListener('click', laClosePopover);
        footer.appendChild(cancelBtn);
        var saveBtn = document.createElement('button');
        saveBtn.className = 'md-la-btn is-primary';
        saveBtn.textContent = '保存';
        if (!editable && !approvable) saveBtn.disabled = true;
        saveBtn.addEventListener('click', onSaveLeave);
        footer.appendChild(saveBtn);
        pop.appendChild(footer);

        // 矢印
        var arrow = document.createElement('div');
        arrow.className = 'md-la-popover-arrow';
        pop.appendChild(arrow);

        return pop;
    }

    function buildSegmentField(labelText, key, options, useKindColor, useStatusColor, disabled) {
        var field = document.createElement('div');
        field.className = 'md-la-field';
        var label = document.createElement('span');
        label.className = 'md-la-field-label';
        label.textContent = labelText;
        field.appendChild(label);
        var seg = document.createElement('div');
        seg.className = 'md-la-seg';
        options.forEach(function (opt) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'md-la-seg-btn';
            btn.textContent = opt[1];
            btn.dataset.value = opt[0];
            if (useKindColor)   btn.classList.add('kind-' + opt[0]);
            if (useStatusColor) btn.classList.add('status-' + opt[0]);
            if (popoverState.draft[key] === opt[0]) btn.classList.add('is-active');
            if (disabled) btn.disabled = true;
            btn.addEventListener('click', function () {
                if (disabled) return;
                popoverState.draft[key] = opt[0];
                seg.querySelectorAll('.md-la-seg-btn').forEach(function (b) {
                    b.classList.toggle('is-active', b.dataset.value === opt[0]);
                });
            });
            seg.appendChild(btn);
        });
        field.appendChild(seg);
        return field;
    }

    function positionPopover(pop, anchor) {
        var ar = anchor.getBoundingClientRect();
        var pw = 280;
        var margin = 8;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        // 既定: セル右側に配置
        var left = ar.right + margin;
        var anchorSide = 'right';
        if (left + pw + margin > vw) {
            // 右に入らなければ左
            left = ar.left - pw - margin;
            anchorSide = 'left';
        }
        if (left < margin) {
            // それでも入らなければセル直下に被せる
            left = Math.max(margin, Math.min(vw - pw - margin, ar.left));
        }
        pop.classList.add('is-anchor-' + anchorSide);
        // 仮表示して高さ取得 → 縦方向調整
        pop.style.visibility = 'hidden';
        pop.style.left = left + 'px';
        pop.style.top = (ar.top) + 'px';
        var ph = pop.offsetHeight;
        var top = ar.top;
        if (top + ph + margin > vh) top = Math.max(margin, vh - ph - margin);
        pop.style.top = top + 'px';
        pop.style.visibility = '';
    }

    function onOutsideMousedown(e) {
        var pop = document.getElementById('laPopover');
        if (!pop) return;
        if (pop.contains(e.target)) return;
        // バッジクリックは別経路で新規オープン (既存 close は badge click 側で処理)
        if (e.target.closest && e.target.closest('.md-la-badge')) return;
        laClosePopover();
    }

    function onPopoverKeydown(e) {
        if (e.key === 'Escape') laClosePopover();
    }

    function laClosePopover() {
        var pop = document.getElementById('laPopover');
        if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
        document.removeEventListener('mousedown', onOutsideMousedown);
        document.removeEventListener('keydown', onPopoverKeydown);
        popoverState = null;
    }

    function onSaveLeave() {
        if (!popoverState) return;
        var lv = laLeaves.find(function (x) { return x.id === popoverState.leaveId; });
        if (!lv) { laClosePopover(); return; }

        var statusChanged = lv.status !== popoverState.draft.status;
        var oldMeta = {
            partition: lv.partition,
            kind: lv.kind,
            reason: lv.reason || '',
            memo: lv.memo || '',
            recurrenceLabel: laCnRecurrenceLabel(lv.recurrence)
        };

        lv.partition = popoverState.draft.partition;
        lv.kind      = popoverState.draft.kind;
        lv.status    = popoverState.draft.status;
        lv.reason    = popoverState.draft.reason;
        lv.memo      = popoverState.draft.memo;
        lv.recurrence = popoverState.draft.recurrence;

        var metaDiffs = [];
        if (oldMeta.partition !== lv.partition) {
            metaDiffs.push({ field: '区分', oldVal: PART[oldMeta.partition] || oldMeta.partition, newVal: PART[lv.partition] || lv.partition });
        }
        if (oldMeta.kind !== lv.kind) {
            metaDiffs.push({ field: '種別', oldVal: KIND[oldMeta.kind] || oldMeta.kind, newVal: KIND[lv.kind] || lv.kind });
        }
        if (oldMeta.reason !== (lv.reason || '')) {
            metaDiffs.push({ field: '理由', oldVal: oldMeta.reason || '(空)', newVal: lv.reason || '(空)' });
        }
        if (oldMeta.memo !== (lv.memo || '')) {
            metaDiffs.push({ field: 'メモ', oldVal: oldMeta.memo || '(空)', newVal: lv.memo || '(空)' });
        }
        var newRecurrenceLabel = laCnRecurrenceLabel(lv.recurrence);
        if (oldMeta.recurrenceLabel !== newRecurrenceLabel) {
            metaDiffs.push({ field: '繰り返し', oldVal: oldMeta.recurrenceLabel, newVal: newRecurrenceLabel });
        }

        // ステータス変更 → 監査情報+通知
        if (statusChanged) {
            if (lv.status === 'approved') {
                lv.approvedBy = currentRoleLabel();
                lv.approvedAt = nowTs();
                laCnSelfNotify('approve', {
                    leaveId: lv.id,
                    employeeName: popoverState.employee.name,
                    day: laCnDayLabel(lv.date),
                    kind: KIND[lv.kind],
                    partition: PART[lv.partition],
                    operator: currentRoleLabel()
                });
            } else if (lv.status === 'rejected') {
                lv.rejectedBy = currentRoleLabel();
                lv.rejectedAt = nowTs();
                laCnSelfNotify('reject', {
                    leaveId: lv.id,
                    employeeName: popoverState.employee.name,
                    day: laCnDayLabel(lv.date),
                    kind: KIND[lv.kind],
                    partition: PART[lv.partition],
                    operator: currentRoleLabel()
                });
            }
        }

        if (metaDiffs.length > 0) {
            laCnSelfNotify('modify', {
                leaveId: lv.id,
                employeeName: popoverState.employee.name,
                day: laCnDayLabel(lv.date),
                kind: KIND[lv.kind],
                partition: PART[lv.partition],
                operator: currentRoleLabel(),
                fieldLabel: metaDiffs.map(function (d) { return d.field; }).join('・'),
                diffs: metaDiffs
            });
        }

        // 繰り返し: 有効時は以降の同曜日に自動展開
        if (lv.recurrence && lv.recurrence.rule === 'weekly') {
            expandRecurrence(lv);
        }

        laClosePopover();
        render();
    }

    function onApproveReject(newStatus) {
        if (!popoverState) return;
        popoverState.draft.status = newStatus;
        onSaveLeave();
    }

    function expandRecurrence(lv) {
        var d = parseDate(lv.date);
        var until = parseDate(lv.recurrence.until);
        var created = 0;
        var cursor = new Date(d);
        cursor.setDate(cursor.getDate() + 7);
        while (cursor <= until && created < 52) {
            var key = fmtDate(cursor);
            var dup = laLeaves.some(function (x) {
                return x.employeeId === lv.employeeId && x.date === key && x.status !== 'rejected';
            });
            if (!dup) {
                var newLv = {
                    id: 'lv-' + (nextLeaveId++),
                    employeeId: lv.employeeId,
                    date: key,
                    partition: lv.partition,
                    kind: lv.kind,
                    status: 'pending', // 繰り返し作成分は初期 pending
                    reason: lv.reason,
                    memo: lv.memo,
                    recurrence: null   // 生成されたレコード側は自己参照しない
                };
                laLeaves.push(newLv);
                var emp = laEmployees.find(function (e) { return e.id === newLv.employeeId; });
                laCnSelfNotify('add', {
                    leaveId: newLv.id,
                    employeeName: emp ? emp.name : '',
                    day: laCnDayLabel(newLv.date),
                    kind: KIND[newLv.kind],
                    partition: PART[newLv.partition],
                    operator: currentRoleLabel()
                });
                created++;
            }
            cursor.setDate(cursor.getDate() + 7);
        }
    }

    function onDeleteLeave() {
        if (!popoverState) return;
        if (!confirm('この申請を削除します。よろしいですか？')) return;
        var delLv = laLeaves.find(function (x) { return x.id === popoverState.leaveId; });
        var delEmp = delLv ? laEmployees.find(function (e) { return e.id === delLv.employeeId; }) : null;
        laLeaves = laLeaves.filter(function (x) { return x.id !== popoverState.leaveId; });
        if (delLv) {
            laCnSelfNotify('delete', {
                leaveId: delLv.id,
                employeeName: delEmp ? delEmp.name : '',
                day: laCnDayLabel(delLv.date),
                kind: KIND[delLv.kind],
                partition: PART[delLv.partition],
                operator: currentRoleLabel()
            });
        }
        laClosePopover();
        render();
    }

    function currentRoleLabel() {
        return currentRole === 'admin' ? '管理者'
             : currentRole === 'dcp'   ? 'DCP (自GC)'
             :                           '本人';
    }
    function nowTs() {
        var d = new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
            + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function formatJpDate(key) {
        var d = parseDate(key);
        var dow = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
        return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '（' + dow + '）';
    }

    // ==========================================================
    // ナビゲーション・トグル
    // ==========================================================

    function navigatePrev() {
        if (currentView === 'week') {
            currentWeekAnchor = new Date(currentWeekAnchor);
            currentWeekAnchor.setDate(currentWeekAnchor.getDate() - 7);
        } else if (currentView === 'year') {
            currentDate = new Date(currentDate.getFullYear() - 1, 0, 1);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        }
        miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        render();
    }
    function navigateNext() {
        if (currentView === 'week') {
            currentWeekAnchor = new Date(currentWeekAnchor);
            currentWeekAnchor.setDate(currentWeekAnchor.getDate() + 7);
        } else if (currentView === 'year') {
            currentDate = new Date(currentDate.getFullYear() + 1, 0, 1);
        } else {
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }
        miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        render();
    }
    function navigateToday() {
        var t = laDemoTodayDate();
        if (currentView === 'week') {
            currentWeekAnchor = new Date(t);
        } else {
            currentDate = new Date(t.getFullYear(), t.getMonth(), 1);
        }
        miniCalDate = new Date(t.getFullYear(), t.getMonth(), 1);
        render();
    }

    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        var sb = document.getElementById('laSidebar');
        if (sb) sb.classList.toggle('is-collapsed', sidebarCollapsed);
    }

    function selectSidebarTab(tab) {
        if (tab === 'alerts') {
            // 休暇モード専用
            sidebarMode = 'alerts';
            sidebarActiveTab = 'alerts';
        } else if (tab === 'dueSoon') {
            // 車両モード専用 (期限近い)
            sidebarMode = 'emp';
            sidebarActiveTab = 'dueSoon';
        } else {
            sidebarMode = 'emp';
            sidebarActiveTab = tab;
        }
        // UI 更新
        document.querySelectorAll('.md-la-sidebar-vtab[data-tab]').forEach(function (el) {
            el.classList.toggle('is-active', el.dataset.tab === tab);
        });
        // 折り畳みから復帰
        if (sidebarCollapsed) toggleSidebar();
        renderSidebar();
        // 車両モード時はカレンダーのフィルタも変わる
        if (currentMode === 'vehicle' && currentView === 'month') renderCalendar();
    }

    function toggleCompactMode() {
        compactMode = !compactMode;
        var btn = document.getElementById('laCompactBtn');
        if (btn) btn.classList.toggle('is-active', compactMode);
        renderCalendar();
    }

    // ==========================================================
    // GC フィルタ連携 (co-navbar の GC モーダルから)
    // ==========================================================

    function syncGcFilter() {
        // co-navbar が window.mdNavGcFilter を持っている場合同期
        if (window.mdNavGcFilter) {
            gcFilter.touo     = !!window.mdNavGcFilter.touo;
            gcFilter.nikkei   = !!window.mdNavGcFilter.nikkei;
            gcFilter.zennihon = !!window.mdNavGcFilter.zennihon;
        }
    }

    // ==========================================================
    // 車両スケジュール管理モジュール (vs-*)
    // ==========================================================

    function vsSwitchMode(mode) {
        if (mode !== 'leave' && mode !== 'vehicle') return;
        if (currentMode === mode) return;
        currentMode = mode;
        var container = document.getElementById('laContainer');
        if (container) {
            container.classList.toggle('is-mode-leave',   mode === 'leave');
            container.classList.toggle('is-mode-vehicle', mode === 'vehicle');
        }
        // 年間ビュー表示中にモード切替したら月間に戻す
        if (currentView === 'year') {
            currentView = 'month';
            document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.view === 'month');
                t.setAttribute('aria-selected', t.dataset.view === 'month' ? 'true' : 'false');
            });
        }
        // モード切替時に縦タブをリセット (要対応/期限近いは別タブIDのため)
        if (sidebarActiveTab === 'alerts' || sidebarActiveTab === 'dueSoon') {
            sidebarActiveTab = 'all';
            sidebarMode = 'emp';
            document.querySelectorAll('.md-la-sidebar-vtab').forEach(function (t) {
                t.classList.toggle('is-active', t.dataset.tab === 'all');
            });
        }
        // 段組ボタンのアクティブ表示同期
        document.querySelectorAll('.md-la-mode-seg-btn').forEach(function (b) {
            var isActive = b.dataset.mode === mode;
            b.classList.toggle('is-active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        render();
    }

    // 当日の車両スケジュールを車両IDごとにグルーピング
    function vsGroupSchedulesByDate(dateKey) {
        var grouped = {};
        vsSchedules.forEach(function (s) {
            if (s.date !== dateKey) return;
            if (!grouped[s.vehicleId]) grouped[s.vehicleId] = [];
            grouped[s.vehicleId].push(s);
        });
        return grouped;
    }

    // GCフィルタ適用判定
    function vsVehicleVisible(vehicle) {
        if (sidebarActiveTab === 'all' || sidebarActiveTab === 'dueSoon') {
            return !!gcFilter[vehicle.owner];
        }
        if (vehicle.owner !== sidebarActiveTab) return false;
        return !!gcFilter[vehicle.owner];
    }

    // セル本体に車両バッジを構築
    function vsBuildCellContent(body, dateKey) {
        var grouped = vsGroupSchedulesByDate(dateKey);
        Object.keys(grouped).forEach(function (vehicleId) {
            var vehicle = vsVehicles.find(function (v) { return v.id === vehicleId; });
            if (!vehicle) return;
            if (!vsVehicleVisible(vehicle)) return;
            body.appendChild(vsBuildVehicleCellBadge(vehicle, dateKey, grouped[vehicleId]));
        });
    }

    function vsBuildVehicleCellBadge(vehicle, dateKey, schedules) {
        var wrap = document.createElement('div');
        wrap.className = 'md-vs-cell-badge gc-' + vehicle.owner;
        wrap.draggable = true;
        wrap.dataset.vehicleId = vehicle.id;
        wrap.dataset.date = dateKey;
        wrap.title = vehicle.numberPlate + '\n' + vehicle.vehicleName || vehicle.model;

        // 親バッジ: ナンバー下4桁 + 削除
        var head = document.createElement('div');
        head.className = 'md-vs-cell-badge-num';
        var num = document.createElement('span');
        num.className = 'md-vs-cell-badge-num-text';
        num.textContent = vsGetLast4(vehicle);
        head.appendChild(num);
        var rm = document.createElement('button');
        rm.type = 'button';
        rm.className = 'md-vs-cell-badge-remove';
        rm.title = 'この車両の予定を当日からすべて削除';
        rm.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg>';
        rm.addEventListener('click', function (ev) {
            ev.stopPropagation();
            vsSchedules = vsSchedules.filter(function (s) {
                return !(s.vehicleId === vehicle.id && s.date === dateKey);
            });
            render();
        });
        head.appendChild(rm);
        wrap.appendChild(head);

        // 子バッジ群
        var kindsWrap = document.createElement('div');
        kindsWrap.className = 'md-vs-cell-badge-kinds';
        schedules.forEach(function (sch) {
            kindsWrap.appendChild(vsBuildKindChip(sch));
        });
        // 追加ボタン (+)
        var addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'md-vs-kind-chip-add';
        addBtn.textContent = '+ 種別';
        addBtn.title = 'この車両に種別を追加';
        addBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            vsShowKindPopover(addBtn, { mode: 'add', vehicleId: vehicle.id, date: dateKey });
        });
        kindsWrap.appendChild(addBtn);
        wrap.appendChild(kindsWrap);

        // バッジ D&D 起点 (別日へ移動)
        wrap.addEventListener('dragstart', function (e) {
            dragState = { sourceType: 'vsBadge', vehicleId: vehicle.id, fromDate: dateKey };
            wrap.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            try { e.dataTransfer.setData('text/plain', vehicle.id); } catch (err) {}
            laShowGhost(e, vsGetLast4(vehicle));
        });
        wrap.addEventListener('dragend', function () {
            wrap.classList.remove('is-dragging');
            laHideGhost();
            dragState = null;
            clearDropHighlights();
        });
        wrap.addEventListener('drag', laMoveGhost);

        return wrap;
    }

    function vsBuildKindChip(schedule) {
        var kind = VS_KIND_LIST.find(function (k) { return k.id === schedule.kind; }) || VS_KIND_LIST[0];
        var label = (schedule.kind === 'other' && schedule.otherLabel) ? schedule.otherLabel : kind.label;
        var chip = document.createElement('span');
        chip.className = 'md-vs-kind-chip kind-' + schedule.kind;
        chip.dataset.scheduleId = schedule.id;
        chip.textContent = label;
        var timeNote = (schedule.startTime ? schedule.startTime : '') + (schedule.endTime ? '〜' + schedule.endTime : '');
        chip.title = kind.label + (timeNote ? ' (' + timeNote + ')' : '');
        chip.addEventListener('click', function (ev) {
            ev.stopPropagation();
            vsShowKindPopover(chip, { mode: 'edit', scheduleId: schedule.id });
        });
        return chip;
    }

    function vsGetLast4(vehicle) {
        if (vehicle.numberLast4) return vehicle.numberLast4;
        var m = (vehicle.plate || '').match(/(\d{2,4})/);
        if (m) return m[1].replace(/(\d{2})(\d{2})/, '$1-$2');
        return vehicle.plate || '????';
    }

    // 車両ドロップ → デフォルト種別(点検)で即座にバッジ配置 → ポップオーバーで変更可
    function vsHandleVehicleDrop(vehicleId, dateKey, cellEl) {
        var newSched = {
            id: 'vs-new-' + (vsNextSchedId++),
            vehicleId: vehicleId,
            date: dateKey,
            startTime: '',
            endTime: '',
            kind: 'inspection',
            otherLabel: ''
        };
        vsSchedules.push(newSched);
        // onCellDrop 側の render() 完了後に、新規チップを基点としてポップオーバー表示
        setTimeout(function () {
            var chip = document.querySelector('.md-vs-kind-chip[data-schedule-id="' + newSched.id + '"]');
            vsShowKindPopover(chip || cellEl, { mode: 'edit', scheduleId: newSched.id });
        }, 0);
    }

    function vsMoveVehicleSchedules(vehicleId, fromDate, toDate) {
        if (fromDate === toDate) return;
        // 移動先に既存があれば統合 (重複allow)、無ければ単純移動
        vsSchedules.forEach(function (s) {
            if (s.vehicleId === vehicleId && s.date === fromDate) {
                s.date = toDate;
            }
        });
    }

    // ==========================================================
    // 種別選択ポップオーバー
    // ==========================================================
    var vsPopoverEl = null;
    var vsPopoverCtx = null;

    function vsCloseKindPopover() {
        if (vsPopoverEl && vsPopoverEl.parentNode) {
            vsPopoverEl.parentNode.removeChild(vsPopoverEl);
        }
        vsPopoverEl = null;
        vsPopoverCtx = null;
        document.removeEventListener('mousedown', vsPopoverOutsideClick, true);
    }

    function vsPopoverOutsideClick(e) {
        if (!vsPopoverEl) return;
        if (vsPopoverEl.contains(e.target)) return;
        vsCloseKindPopover();
    }

    function vsShowKindPopover(anchor, ctx) {
        vsCloseKindPopover();
        vsPopoverCtx = ctx;
        var pop = document.createElement('div');
        pop.className = 'md-vs-kind-popover';

        var title = document.createElement('div');
        title.className = 'md-vs-kind-popover-title';
        title.textContent = ctx.mode === 'edit' ? '種別を変更' : '種別を選択';
        pop.appendChild(title);

        var grid = document.createElement('div');
        grid.className = 'md-vs-kind-popover-grid';
        VS_KIND_LIST.forEach(function (k) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'md-vs-kind-popover-btn';
            b.dataset.kindId = k.id;
            var dot = document.createElement('span');
            dot.className = 'md-vs-kind-popover-dot';
            dot.style.background = k.color;
            b.appendChild(dot);
            b.appendChild(document.createTextNode(k.label));
            b.addEventListener('click', function () {
                if (k.id === 'other') {
                    otherWrap.classList.add('is-visible');
                    otherInput.focus();
                } else {
                    vsApplyKindSelection(k.id, '');
                }
            });
            grid.appendChild(b);
        });
        pop.appendChild(grid);

        // 「その他」自由入力欄
        var otherWrap = document.createElement('div');
        otherWrap.className = 'md-vs-kind-popover-other-input';
        var otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.placeholder = '内容を入力 (例: ETC設定)';
        var otherBtn = document.createElement('button');
        otherBtn.type = 'button';
        otherBtn.textContent = '決定';
        otherBtn.addEventListener('click', function () {
            var text = otherInput.value.trim();
            if (!text) { otherInput.focus(); return; }
            vsApplyKindSelection('other', text);
        });
        otherInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') otherBtn.click();
        });
        otherWrap.appendChild(otherInput);
        otherWrap.appendChild(otherBtn);
        pop.appendChild(otherWrap);

        // 編集モード時: 削除ボタン
        if (ctx.mode === 'edit') {
            var actions = document.createElement('div');
            actions.className = 'md-vs-kind-popover-actions';
            var del = document.createElement('button');
            del.type = 'button';
            del.className = 'is-danger';
            del.textContent = 'この予定を削除';
            del.addEventListener('click', function () {
                vsSchedules = vsSchedules.filter(function (s) { return s.id !== ctx.scheduleId; });
                vsCloseKindPopover();
                render();
            });
            actions.appendChild(del);
            pop.appendChild(actions);
        }

        document.body.appendChild(pop);
        vsPopoverEl = pop;
        vsPositionPopover(pop, anchor, ctx.anchorRect);
        // 外側クリック検出
        setTimeout(function () {
            document.addEventListener('mousedown', vsPopoverOutsideClick, true);
        }, 0);
    }

    function vsPositionPopover(pop, anchor, anchorRect) {
        var rect = anchorRect || (anchor && anchor.getBoundingClientRect());
        if (!rect) return;
        var popRect = pop.getBoundingClientRect();
        var left = rect.left;
        var top  = rect.bottom + 4;
        if (left + popRect.width > window.innerWidth - 8) {
            left = window.innerWidth - popRect.width - 8;
        }
        if (top + popRect.height > window.innerHeight - 8) {
            top = rect.top - popRect.height - 4;
        }
        pop.style.left = Math.max(8, left) + 'px';
        pop.style.top  = Math.max(8, top) + 'px';
    }

    function vsApplyKindSelection(kindId, otherLabel) {
        if (!vsPopoverCtx) return;
        var ctx = vsPopoverCtx;
        if (ctx.mode === 'edit') {
            var sch = vsSchedules.find(function (s) { return s.id === ctx.scheduleId; });
            if (sch) {
                sch.kind = kindId;
                sch.otherLabel = (kindId === 'other') ? otherLabel : '';
            }
        } else {
            vsSchedules.push({
                id: 'vs-new-' + (vsNextSchedId++),
                vehicleId: ctx.vehicleId,
                date: ctx.date,
                startTime: '',
                endTime: '',
                kind: kindId,
                otherLabel: (kindId === 'other') ? otherLabel : ''
            });
        }
        vsCloseKindPopover();
        render();
    }

    // ==========================================================
    // 車両リスト (右サイドバー)
    // ==========================================================

    function vsRenderVehicleList(body, count) {
        body.classList.remove('mode-emp', 'mode-alerts');
        body.classList.add('mode-vehicle');

        var filtered = vsVehicles.filter(function (v) {
            if (sidebarActiveTab === 'dueSoon') {
                if (!vsIsDueSoon(v)) return false;
            } else if (sidebarActiveTab !== 'all' && v.owner !== sidebarActiveTab) {
                return false;
            }
            if (searchQuery) {
                var hay = (v.numberPlate + ' ' + v.model + ' ' + (v.vehicleName || '')).toLowerCase();
                if (hay.indexOf(searchQuery.toLowerCase()) === -1) return false;
            }
            return true;
        });

        if (count) count.textContent = filtered.length + '台';

        var currentGc = null;
        filtered.forEach(function (v) {
            if (sidebarActiveTab === 'all' && v.owner !== currentGc) {
                currentGc = v.owner;
                var h = document.createElement('div');
                h.className = 'md-la-emp-group';
                var gcLabel = (typeof groupCompaniesData !== 'undefined')
                    ? groupCompaniesData.find(function (g) { return g.code === v.owner; })
                    : null;
                h.textContent = gcLabel ? gcLabel.shortName : v.owner;
                body.appendChild(h);
            }
            body.appendChild(vsBuildVehicleCard(v));
        });

        if (filtered.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'md-la-placeholder-hint';
            empty.textContent = (sidebarActiveTab === 'dueSoon')
                ? '期限が30日以内の車両はありません'
                : '該当する車両はありません';
            body.appendChild(empty);
        }
    }

    function vsBuildVehicleCard(vehicle) {
        var c = document.createElement('div');
        c.className = 'md-vs-vehicle gc-' + vehicle.owner;
        c.draggable = true;
        c.dataset.vehicleId = vehicle.id;
        var shaken = vehicle.nextShakenDate || '-';
        var insp = vehicle.nextInspectionDate || '-';
        c.title = vehicle.numberPlate + ' (' + (vehicle.vehicleName || vehicle.model || '') + ')'
            + '\n車検: ' + shaken + ' / 点検: ' + insp;

        var num = document.createElement('span');
        num.className = 'md-vs-vehicle-num';
        num.textContent = vsGetLast4(vehicle);
        c.appendChild(num);

        var model = document.createElement('span');
        model.className = 'md-vs-vehicle-model';
        model.textContent = vehicle.vehicleName || vehicle.model || '';
        c.appendChild(model);

        var edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'md-vs-vehicle-edit';
        edit.title = '車両情報を編集';
        edit.innerHTML = '<svg class="ui-icon" aria-hidden="true" style="width:11px;height:11px;"><use href="#ui-icon-plus"/></svg>';
        // ペンアイコン代替: + を回転で「編集」感
        edit.innerHTML = '<span style="font-size:11px;line-height:1;">✎</span>';
        edit.addEventListener('mousedown', function (e) { e.stopPropagation(); });
        edit.addEventListener('click', function (e) {
            e.stopPropagation();
            vsOpenMasterModal(vehicle.id);
        });
        c.appendChild(edit);

        // 期限近いの警告ドット
        if (vsIsDueSoon(vehicle)) {
            var dot = document.createElement('span');
            dot.className = 'md-vs-vehicle-due-dot';
            dot.title = '車検または点検期限が30日以内';
            c.appendChild(dot);
        }

        // D&D 起点
        c.addEventListener('dragstart', function (e) {
            dragState = { sourceType: 'vehicle', vehicleId: vehicle.id };
            c.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'copy';
            try { e.dataTransfer.setData('text/plain', vehicle.id); } catch (err) {}
            laShowGhost(e, vsGetLast4(vehicle));
        });
        c.addEventListener('dragend', function () {
            c.classList.remove('is-dragging');
            laHideGhost();
            dragState = null;
            clearDropHighlights();
        });
        c.addEventListener('drag', laMoveGhost);

        return c;
    }

    function vsIsDueSoon(vehicle) {
        var now = laDemoTodayDate(); now.setHours(0, 0, 0, 0);
        var threshold = new Date(now.getTime() + VS_DUE_SOON_DAYS * 24 * 60 * 60 * 1000);
        function within(dateStr) {
            if (!dateStr) return false;
            var d = parseDate(dateStr);
            return d >= now && d <= threshold;
        }
        return within(vehicle.nextShakenDate) || within(vehicle.nextInspectionDate);
    }

    function vsRenderDueSoonBadge() {
        var el = document.getElementById('laDueSoonBadge');
        if (!el) return;
        var n = vsVehicles.filter(vsIsDueSoon).length;
        el.textContent = n;
        el.classList.toggle('md-la-hidden', n === 0);
    }

    // ==========================================================
    // 車両マスタ編集モーダル
    // ==========================================================
    function vsOpenMasterModal(vehicleId) {
        var isNew = !vehicleId;
        var v = isNew
            ? { id: 'v-new-' + (vsNextVehicleId++), numberPlate: '', plate: '', numberLast4: '', vehicleName: '', model: '', owner: 'touo', nextShakenDate: '', nextInspectionDate: '' }
            : Object.assign({}, vsVehicles.find(function (x) { return x.id === vehicleId; }));
        if (!v) return;

        var backdrop = document.createElement('div');
        backdrop.className = 'md-la-modal-backdrop';

        var modal = document.createElement('div');
        modal.className = 'md-la-modal md-la-modal-card';
        modal.style.minWidth = '440px';
        modal.style.maxWidth = '560px';
        modal.innerHTML =
            '<div class="md-la-modal-header">' +
                '<span>' + (isNew ? '車両を追加' : '車両情報を編集') + '</span>' +
                '<button type="button" class="md-la-modal-close" aria-label="閉じる">' +
                    '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg>' +
                '</button>' +
            '</div>' +
            '<div class="md-la-modal-body" style="padding:16px;">' +
                '<div class="md-vs-master-form">' +
                    '<label>ナンバープレート</label><input type="text" name="numberPlate" placeholder="品川 500 あ 12-34" value="' + (v.numberPlate || '') + '">' +
                    '<label>下4桁 (表示用)</label><input type="text" name="numberLast4" maxlength="6" placeholder="12-34" value="' + (v.numberLast4 || vsGetLast4(v)) + '">' +
                    '<label>車種・車名</label><input type="text" name="vehicleName" placeholder="ハイエース" value="' + (v.vehicleName || v.model || '') + '">' +
                    '<label>所属会社</label>' +
                    '<select name="owner">' +
                        '<option value="touo"' + (v.owner === 'touo' ? ' selected' : '') + '>東央警備</option>' +
                        '<option value="nikkei"' + (v.owner === 'nikkei' ? ' selected' : '') + '>Nikkei</option>' +
                        '<option value="zennihon"' + (v.owner === 'zennihon' ? ' selected' : '') + '>全日本</option>' +
                    '</select>' +
                    '<label>次回車検期限</label><input type="date" name="nextShakenDate" value="' + (v.nextShakenDate || '') + '">' +
                    '<label>次回点検期限</label><input type="date" name="nextInspectionDate" value="' + (v.nextInspectionDate || '') + '">' +
                '</div>' +
            '</div>' +
            '<div class="md-la-modal-footer">' +
                (isNew ? '' : '<button type="button" class="md-la-btn is-danger" data-action="delete">削除</button>') +
                '<div style="flex:1"></div>' +
                '<button type="button" class="md-la-btn" data-action="cancel">キャンセル</button>' +
                '<button type="button" class="md-la-btn is-primary" data-action="save">保存</button>' +
            '</div>';

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        function close() { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }

        modal.querySelector('.md-la-modal-close').addEventListener('click', close);
        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', function () {
            var f = function (name) { return modal.querySelector('[name="' + name + '"]').value.trim(); };
            var payload = {
                numberPlate: f('numberPlate'),
                numberLast4: f('numberLast4'),
                vehicleName: f('vehicleName'),
                model: f('vehicleName'),
                owner: f('owner'),
                nextShakenDate: f('nextShakenDate'),
                nextInspectionDate: f('nextInspectionDate')
            };
            if (!payload.numberPlate || !payload.vehicleName) {
                alert('ナンバープレートと車種・車名は必須です');
                return;
            }
            if (isNew) {
                payload.id = v.id;
                payload.plate = payload.numberLast4 || payload.numberPlate;
                vsVehicles.push(payload);
            } else {
                var orig = vsVehicles.find(function (x) { return x.id === vehicleId; });
                if (orig) Object.assign(orig, payload);
            }
            close();
            render();
        });
        var delBtn = modal.querySelector('[data-action="delete"]');
        if (delBtn) {
            delBtn.addEventListener('click', function () {
                if (!confirm('この車両を削除します。関連スケジュールも削除されます。よろしいですか?')) return;
                vsVehicles = vsVehicles.filter(function (x) { return x.id !== vehicleId; });
                vsSchedules = vsSchedules.filter(function (s) { return s.vehicleId !== vehicleId; });
                close();
                render();
            });
        }
        backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
    }

    // ==========================================================
    // 起動
    // ==========================================================

    document.addEventListener('DOMContentLoaded', function () {
        currentDate = laStoreCurrentDate();
        currentWeekAnchor = new Date(currentDate);
        miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        buildEmployees();
        seedWsAssignments();
        laStateRestoring = true;
        var loadedLeaves = laLoadApplicationsFromStore();
        if (!loadedLeaves) seedDemoLeaves();
        laStateRestoring = false;
        if (!loadedLeaves) laSaveApplicationsToStore();
        laCnSeedInitialDemo(); // 共通ベル (window.coNotifyPanel) へデモ通知投入
        // 祝日データ: キャッシュ即時適用 / API 取得後は再描画
        ensureHolidays(function () { render(); });

        // ヘッダー操作
        document.getElementById('laPrevBtn').addEventListener('click', navigatePrev);
        document.getElementById('laNextBtn').addEventListener('click', navigateNext);
        document.getElementById('laTodayBtn').addEventListener('click', navigateToday);

        // ミニカレンダー + マウスホイール
        bindMiniCal();
        bindCalendarWheel();

        // ビュータブ (月間・週間・年間すべて実装)
        document.querySelectorAll('.md-la-view-tab').forEach(function (el) {
            el.addEventListener('click', function () {
                var v = el.dataset.view;
                document.querySelectorAll('.md-la-view-tab').forEach(function (t) {
                    t.classList.toggle('is-active', t === el);
                });
                // ビュー切替時の date anchor 同期
                if (currentView !== v) {
                    if (v === 'week') {
                        var anchor = new Date(currentDate);
                        anchor.setDate(15);
                        currentWeekAnchor = anchor;
                    } else if (v === 'month') {
                        // 週/年 → 月: 現在アンカーの月を採用
                        var src = currentView === 'week' ? currentWeekAnchor : currentDate;
                        currentDate = new Date(src.getFullYear(), src.getMonth(), 1);
                    }
                    // year の場合は currentDate の年をそのまま使う
                }
                currentView = v;
                render();
            });
        });

        // サイドパネル 縦タブ
        document.querySelectorAll('.md-la-sidebar-vtab').forEach(function (el) {
            el.addEventListener('click', function () {
                selectSidebarTab(el.dataset.tab);
            });
        });

        // 折畳トグル
        var collapseBtn = document.getElementById('laSidebarToggle');
        if (collapseBtn) collapseBtn.addEventListener('click', toggleSidebar);

        // 検索
        var searchInput = document.getElementById('laSidebarSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchQuery = this.value.trim();
                renderSidebar();
            });
        }

        // コンパクトモード
        var compactBtn = document.getElementById('laCompactBtn');
        if (compactBtn) compactBtn.addEventListener('click', toggleCompactMode);

        // 新規申請 (placeholder)
        var newBtn = document.getElementById('laNewBtn');
        if (newBtn) newBtn.addEventListener('click', function () {
            alert('新規申請ダイアログは Phase E2 で実装予定です。\n\n現在はサイドパネルの社員バッジをカレンダーにドラッグ&ドロップで申請できます。');
        });

        // 集計モーダル
        var reportBtn = document.getElementById('laReportBtn');
        if (reportBtn) reportBtn.addEventListener('click', openReportModal);

        // 通知ベルは共通レイヤ (co-navbar.js + co-notify-panel.js) が管理。N-2.3 で旧 laNotifyBtn / toggleNotifyPanel / renderNotifyBadge を撤去。

        // ロール切替
        document.querySelectorAll('.md-la-role-btn').forEach(function (el) {
            el.addEventListener('click', function () {
                currentRole = el.dataset.role;
                document.querySelectorAll('.md-la-role-btn').forEach(function (b) {
                    b.classList.toggle('is-active', b.dataset.role === currentRole);
                });
                // ポップオーバーが開いていれば再構築 (権限表示更新)
                if (popoverState) {
                    var s = popoverState;
                    laClosePopover();
                    var lv = laLeaves.find(function (x) { return x.id === s.leaveId; });
                    if (lv) {
                        var anchor = document.querySelector('.md-la-badge[data-leave-id="' + lv.id + '"]');
                        if (anchor) laShowBadgeInfo(lv, anchor);
                    }
                }
            });
        });

        // GC フィルタ同期 (モーダル閉じた後に再描画)
        // co-navbar の GC モーダル閉じるタイミングでカスタムイベント想定
        document.addEventListener('mdNavGcFilterChanged', function () {
            syncGcFilter();
            renderCalendar();
        });

        window.addEventListener('storage', function(e) {
            if (!window.OmsMockStore || e.key !== window.OmsMockStore.key) return;
            laStateRestoring = true;
            try {
                currentDate = laStoreCurrentDate();
                currentWeekAnchor = new Date(currentDate);
                miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                laLoadApplicationsFromStore();
            } finally {
                laStateRestoring = false;
            }
            render();
        });

        // モード切替 (休暇申請管理 / 車両スケジュール管理)
        document.querySelectorAll('.md-la-mode-seg-btn').forEach(function (b) {
            b.addEventListener('click', function () {
                vsSwitchMode(b.dataset.mode);
            });
        });

        // 車両追加ボタン
        var addVehicleBtn = document.getElementById('vsAddVehicleBtn');
        if (addVehicleBtn) addVehicleBtn.addEventListener('click', function () { vsOpenMasterModal(null); });

        // 初期モード反映 (HTMLは is-mode-leave をクラスに持つ前提)
        var initialContainer = document.getElementById('laContainer');
        if (initialContainer && !initialContainer.classList.contains('is-mode-leave') && !initialContainer.classList.contains('is-mode-vehicle')) {
            initialContainer.classList.add('is-mode-leave');
        }

        // 年間ビュー 吹き出しツールチップ (休暇/車両共通)
        laYearTooltipInit();

        render();
    });
})();
