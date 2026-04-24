/* ============================================================
   leave-application.js — 休暇申請管理モックアップ
   Phase E1: 月間ビュー + D&D 配置 + サイドパネル + 折畳
   ============================================================ */

(function () {
    'use strict';

    // ==========================================================
    // 定数・ユーティリティ
    // ==========================================================

    var KIND = { paid: '有給', absent: '欠勤', other: 'その他' };
    var PART = { full: '全', am: '前', pm: '後' };
    var STATUS = { pending: '申請中', approved: '承認済', rejected: '却下' };

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
    var currentDate = new Date(2026, 3, 1); // 2026-04-01 起点 (デモデータの想定月)
    var currentView = 'month'; // 'month' | 'week' | 'year' (E5 以降で拡張)
    var currentWeekAnchor = new Date(2026, 3, 13); // 2026-04-13 (月曜) 起点
    var sidebarCollapsed = false;
    var sidebarActiveTab = 'all'; // 'all' | 'touo' | 'nikkei' | 'zennihon'
    var gcFilter = { touo: true, nikkei: true, zennihon: true };
    var compactMode = false;
    var searchQuery = '';

    // D&D 状態
    var dragState = null; // { sourceType: 'employee'|'badge', employeeId, fromDate, ghostEl }

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
    }

    function seedWsAssignments() {
        // 当月 (2026-04) に WS 配置がある想定のデモデータを仕込む
        // 休暇申請と競合する日を含めることで衝突警告の動作確認ができる
        var seeds = [
            // 林 (empIdx=5) が 4/3, 4/4 に休暇申請中 → 4/4 に配置済み (衝突)
            { empIdx: 5,  date: '2026-04-04', siteName: '〇〇ビル', shift: '昼' },
            // 清水 (empIdx=14) が 4/8, 4/9 に休暇申請中 → 4/9 に配置済み (衝突)
            { empIdx: 14, date: '2026-04-09', siteName: '□□イベント', shift: '夜' },
            // 山田 (empIdx=18) が 4/15 に休暇申請中 → 4/15 に配置済み (衝突)
            { empIdx: 18, date: '2026-04-15', siteName: '高速SA補修', shift: '昼' },
            // 衝突しない配置も混ぜる (一覧での通常表示用)
            { empIdx: 3,  date: '2026-04-20', siteName: '△△マンション', shift: '昼' },
            { empIdx: 10, date: '2026-04-22', siteName: '△△マンション', shift: '昼' }
        ];
        seeds.forEach(function (s) {
            if (!laEmployees[s.empIdx]) return;
            var key = laEmployees[s.empIdx].id + '|' + s.date;
            laWsAssignments[key] = { siteName: s.siteName, shift: s.shift };
        });
    }

    function hasWsConflict(employeeId, dateKey) {
        return !!laWsAssignments[employeeId + '|' + dateKey];
    }

    function getWsAssignment(employeeId, dateKey) {
        return laWsAssignments[employeeId + '|' + dateKey] || null;
    }

    function seedDemoLeaves() {
        // 2026-04 のダミー申請を何件か
        var seeds = [
            { empIdx: 5,  day: 3,  partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 5,  day: 4,  partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 14, day: 8,  partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 14, day: 9,  partition: 'am',   kind: 'paid',   status: 'pending'  },
            { empIdx: 26, day: 10, partition: 'full', kind: 'absent', status: 'approved' },
            { empIdx: 2,  day: 15, partition: 'pm',   kind: 'paid',   status: 'approved' },
            { empIdx: 9,  day: 15, partition: 'full', kind: 'paid',   status: 'approved' },
            { empIdx: 18, day: 15, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 21, day: 15, partition: 'full', kind: 'other',  status: 'approved' },
            { empIdx: 5,  day: 20, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 5,  day: 21, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 5,  day: 22, partition: 'full', kind: 'paid',   status: 'pending'  },
            { empIdx: 25, day: 24, partition: 'full', kind: 'paid',   status: 'rejected' },
            { empIdx: 11, day: 27, partition: 'am',   kind: 'paid',   status: 'approved' }
        ];
        seeds.forEach(function (s) {
            if (!laEmployees[s.empIdx]) return;
            laLeaves.push({
                id: 'lv-' + (nextLeaveId++),
                employeeId: laEmployees[s.empIdx].id,
                date: '2026-04-' + pad(s.day),
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

    function render() {
        renderLabel();
        updateViewVisibility();
        if (currentView === 'month') renderCalendar();
        if (currentView === 'week')  renderWeek();
        if (currentView === 'year')  renderYear();
        renderSidebar();
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
        var today = new Date();
        var countsByDate = {};

        cells.forEach(function (d) {
            var key = fmtDate(d);
            var isOtherMonth = d.getMonth() !== currentDate.getMonth();
            var isPast = d < today && !sameDay(d, today);
            var dow = d.getDay();

            var cell = document.createElement('div');
            cell.className = 'md-la-cell';
            cell.dataset.date = key;
            if (isOtherMonth) cell.classList.add('is-other-month');
            if (dow === 6) cell.classList.add('is-sat');
            if (dow === 0) cell.classList.add('is-sun');
            if (sameDay(d, today)) cell.classList.add('is-today');
            if (isPast) cell.classList.add('is-past');

            var head = document.createElement('div');
            head.className = 'md-la-cell-head';
            var day = document.createElement('span');
            day.className = 'md-la-cell-day';
            day.textContent = d.getDate();
            head.appendChild(day);

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

            var MAX_VISIBLE = 3;
            var visible = dayLeaves.slice(0, MAX_VISIBLE);
            var overflow = dayLeaves.length - visible.length;
            visible.forEach(function (lv) { body.appendChild(buildBadge(lv)); });
            if (overflow > 0) {
                var more = document.createElement('div');
                more.className = 'md-la-badge-more';
                more.textContent = '+' + overflow + ' 件';
                more.title = '折り畳み中: ' + overflow + '件の申請';
                body.appendChild(more);
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
        var today = new Date();
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
        e.dataTransfer.dropEffect = (dragState.sourceType === 'employee') ? 'copy' : 'move';
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
    }

    // ==========================================================
    // 年間ビュー (E5: 12ヶ月サムネイル + ヒートマップ)
    // ==========================================================

    function renderYear() {
        var root = document.getElementById('laYear');
        if (!root) return;
        root.innerHTML = '';

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
        var today = new Date(); today.setHours(0, 0, 0, 0);
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
            cell.textContent = d.getDate();
            if (d.getMonth() !== month) cell.classList.add('is-other-month');
            var dow = d.getDay();
            if (dow === 6) cell.classList.add('is-sat');
            if (dow === 0) cell.classList.add('is-sun');
            if (sameDay(d, today)) cell.classList.add('is-today');

            // ヒートマップレベル
            if (d.getMonth() === month) {
                var count = (byDate[key] || []).length;
                var level = 0;
                if (count >= 1 && count <= 1) level = 1;
                else if (count === 2) level = 2;
                else if (count === 3) level = 3;
                else if (count === 4) level = 4;
                else if (count >= 5)  level = 5;
                if (level > 0) {
                    cell.classList.add('lv-' + level);
                    cell.title = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' — ' + count + '人休';
                }
            }
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
        sg.appendChild(summaryCard('欠勤', report.kindDays.absent.toFixed(1), '日'));
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
              '<th class="num">欠勤</th>' +
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
    // CSV 出力 (E5)
    // ==========================================================

    function exportReportCsv(report) {
        var lines = [];
        lines.push(['社員', 'GC', '有給', '欠勤', 'その他', '合計', '有給残'].join(','));
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

    function buildBadge(lv) {
        var emp = laEmployees.find(function (e) { return e.id === lv.employeeId; });
        if (!emp) return document.createElement('span');

        var b = document.createElement('div');
        b.className = 'md-la-badge kind-' + lv.kind + ' is-' + lv.status;
        b.dataset.leaveId = lv.id;
        b.draggable = true;
        var conflict = getWsAssignment(lv.employeeId, lv.date);
        if (conflict) b.classList.add('is-ws-conflict');
        b.title = emp.name + ' — ' + KIND[lv.kind] + ' (' + PART[lv.partition] + '休) / ' + STATUS[lv.status]
            + (conflict ? '\n⚠ WS配置済み: ' + conflict.siteName + '（' + conflict.shift + '）' : '');

        var gc = document.createElement('span');
        gc.className = 'md-la-badge-gc gc-' + emp.company;
        b.appendChild(gc);

        var part = document.createElement('span');
        part.className = 'md-la-badge-part';
        part.textContent = PART[lv.partition];
        b.appendChild(part);

        var name = document.createElement('span');
        name.className = 'md-la-badge-name';
        name.textContent = emp.name;
        b.appendChild(name);

        var initial = document.createElement('span');
        initial.className = 'md-la-badge-initial';
        initial.textContent = emp.name.charAt(0);
        b.appendChild(initial);

        if (conflict) {
            var warn = document.createElement('span');
            warn.className = 'md-la-badge-conflict';
            warn.title = 'WS配置済み: ' + conflict.siteName + '（' + conflict.shift + '）';
            warn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-caution"/></svg>';
            b.appendChild(warn);
        }

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
        var count = document.getElementById('laSidebarCount');
        if (!body) return;
        body.innerHTML = '';

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

        var main = document.createElement('div');
        main.className = 'md-la-emp-main';

        var top = document.createElement('div');
        top.className = 'md-la-emp-top';
        var name = document.createElement('span');
        name.className = 'md-la-emp-name';
        name.textContent = emp.name;
        top.appendChild(name);
        var role = document.createElement('span');
        role.className = 'md-la-emp-role';
        role.textContent = emp.role === 'dcp' ? 'DCP' : (emp.role === 'chief' ? '現場責任' : '一般');
        top.appendChild(role);
        main.appendChild(top);

        var bottom = document.createElement('div');
        bottom.className = 'md-la-emp-bottom';
        var stats = document.createElement('span');
        stats.className = 'md-la-emp-leave-stats';
        stats.innerHTML = '有給残 <strong>' + emp.paidLeaveRemaining + '</strong>日 / 今月 <strong>'
            + emp.paidLeaveUsedThisMonth + '</strong>日';
        bottom.appendChild(stats);

        var alerts = document.createElement('span');
        alerts.className = 'md-la-emp-alerts';
        if (emp.paidLeaveUsedThisMonth === 0) {
            var u = document.createElement('span');
            u.className = 'md-la-emp-alert unsubmitted';
            u.title = '今月未申請';
            u.textContent = '!';
            alerts.appendChild(u);
        }
        var pendingCount = laLeaves.filter(function (lv) {
            return lv.employeeId === emp.id && lv.status === 'pending';
        }).length;
        if (pendingCount > 0) {
            var p = document.createElement('span');
            p.className = 'md-la-emp-alert pending';
            p.title = '未承認 ' + pendingCount + '件';
            p.textContent = pendingCount;
            alerts.appendChild(p);
        }
        bottom.appendChild(alerts);

        main.appendChild(bottom);
        c.appendChild(main);

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
    // D&D: セル ドロップ受け入れ
    // ==========================================================

    function onCellDragOver(e) {
        if (!dragState) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = (dragState.sourceType === 'employee') ? 'copy' : 'move';
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
            }
        } else if (dragState.sourceType === 'badge') {
            var lv = laLeaves.find(function (x) { return x.id === dragState.leaveId; });
            if (lv) lv.date = targetDate;
        }
        renderCalendar();
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
        renderCalendar();
        renderSidebar();
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
                memo: lv.memo || ''
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

        // body
        var body = document.createElement('div');
        body.className = 'md-la-popover-body';

        // 区分
        body.appendChild(buildSegmentField('区分', 'partition',
            [['full', '全休'], ['am', '午前休'], ['pm', '午後休']]));
        // 種別
        body.appendChild(buildSegmentField('種別', 'kind',
            [['paid', '有給'], ['absent', '欠勤'], ['other', 'その他']], true));
        // ステータス
        body.appendChild(buildSegmentField('ステータス', 'status',
            [['pending', '申請中'], ['approved', '承認済'], ['rejected', '却下']], false, true));
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
        memoInput.addEventListener('input', function () { s.draft.memo = this.value; });
        memoField.appendChild(memoLabel);
        memoField.appendChild(memoInput);
        body.appendChild(memoField);

        pop.appendChild(body);

        // フッター
        var footer = document.createElement('div');
        footer.className = 'md-la-popover-footer';
        var delBtn = document.createElement('button');
        delBtn.className = 'md-la-btn is-danger';
        delBtn.textContent = '削除';
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
        saveBtn.addEventListener('click', onSaveLeave);
        footer.appendChild(saveBtn);
        pop.appendChild(footer);

        // 矢印
        var arrow = document.createElement('div');
        arrow.className = 'md-la-popover-arrow';
        pop.appendChild(arrow);

        return pop;
    }

    function buildSegmentField(labelText, key, options, useKindColor, useStatusColor) {
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
            btn.addEventListener('click', function () {
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
        if (lv) {
            lv.partition = popoverState.draft.partition;
            lv.kind      = popoverState.draft.kind;
            lv.status    = popoverState.draft.status;
            lv.reason    = popoverState.draft.reason;
            lv.memo      = popoverState.draft.memo;
        }
        laClosePopover();
        renderCalendar();
        renderSidebar(); // 未承認アラート数更新
    }

    function onDeleteLeave() {
        if (!popoverState) return;
        if (!confirm('この申請を削除します。よろしいですか？')) return;
        laLeaves = laLeaves.filter(function (x) { return x.id !== popoverState.leaveId; });
        laClosePopover();
        renderCalendar();
        renderSidebar();
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
        render();
    }
    function navigateToday() {
        var t = new Date();
        if (currentView === 'week') {
            currentWeekAnchor = new Date(t);
        } else {
            currentDate = new Date(t.getFullYear(), t.getMonth(), 1);
        }
        render();
    }

    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        var sb = document.getElementById('laSidebar');
        if (sb) sb.classList.toggle('is-collapsed', sidebarCollapsed);
    }

    function selectSidebarTab(tab) {
        sidebarActiveTab = tab;
        // UI 更新
        document.querySelectorAll('.md-la-sidebar-vtab').forEach(function (el) {
            el.classList.toggle('is-active', el.dataset.tab === tab);
        });
        // 折り畳みから復帰
        if (sidebarCollapsed) toggleSidebar();
        renderSidebar();
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
    // 起動
    // ==========================================================

    document.addEventListener('DOMContentLoaded', function () {
        buildEmployees();
        seedWsAssignments();
        seedDemoLeaves();

        // ヘッダー操作
        document.getElementById('laPrevBtn').addEventListener('click', navigatePrev);
        document.getElementById('laNextBtn').addEventListener('click', navigateNext);
        document.getElementById('laTodayBtn').addEventListener('click', navigateToday);

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

        // GC フィルタ同期 (モーダル閉じた後に再描画)
        // co-navbar の GC モーダル閉じるタイミングでカスタムイベント想定
        document.addEventListener('mdNavGcFilterChanged', function () {
            syncGcFilter();
            renderCalendar();
        });

        render();
    });
})();
