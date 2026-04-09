/* ============================================================
   weekly-schedule.js — 週間予定表モックアップ
   ============================================================ */

(function () {
    'use strict';

    // ==========================================================
    // デモデータ
    // ==========================================================

    // 現場区分
    var CATEGORIES = {
        facility: '施設',
        traffic:  '交通',
        highway:  '高速',
        event:    'イベント'
    };

    // 週間予定表用 現場データ
    var wsSitesData = [
        { id: 's1', name: '〇〇ビル', category: 'facility', company: '〇〇株式会社',
          orders: { day: 3, night: 2 } },
        { id: 's2', name: '△△マンション', category: 'facility', company: '△△建設',
          orders: { day: 2, night: 1 } },
        { id: 's3', name: '国道1号線 舗装工事', category: 'traffic', company: '◇◇工業',
          orders: { day: 4, night: 0 } },
        { id: 's4', name: '県道15号 橋梁工事', category: 'traffic', company: '△△建設',
          orders: { day: 3, night: 2 } },
        { id: 's5', name: '高速SA補修 24-1234', category: 'highway', company: '西日本高速道路',
          orders: { day: 5, night: 3 } },
        { id: 's6', name: '〇〇アリーナ コンサート', category: 'event', company: '□□イベント',
          orders: { day: 6, night: 0 } }
    ];

    // 車両データ（demo-data.js から流用 + 拡張）
    var wsVehiclesData = [
        { id: 'v1', plate: 'さ 3078', model: 'ハイエース', owner: 'touo' },
        { id: 'v2', plate: 'わ 2490', model: 'キャラバン', owner: 'touo' },
        { id: 'v3', plate: 'く 7521', model: 'プロボックス', owner: 'nikkei' },
        { id: 'v4', plate: 'あ 1234', model: 'ハイエース', owner: 'touo' },
        { id: 'v5', plate: 'か 5678', model: 'キャンター', owner: 'nikkei' }
    ];

    // 社員データ（demo-data.js のものを参照 — グローバル employeesData を使用）
    // employeesData は demo-data.js で定義済み

    // 初期配置データ（デモ用）
    // assignments[employeeIndex][dateKey][shift] = [siteId, ...]
    var assignments = {};
    // vehicleAssignments[dateKey][shift] = { siteId: vehicleId }
    var vehicleAssignments = {};

    // 休みデータ
    // holidays[employeeIndex][dateKey] = true
    var holidays = {};

    // ==========================================================
    // 状態管理
    // ==========================================================

    var today = new Date(2026, 3, 9); // 2026-04-09
    var viewStartDate = getWeekStart(today);  // 表示開始日（月曜）
    var visibleWeeks = 4; // 4週間表示
    var selectedDate = formatDateKey(today);  // サイドバー用
    var collapsedGroups = {};

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

    function getDaysOfWeek() { return ['日', '月', '火', '水', '木', '金', '土']; }

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

    // 祝日（簡易：2026年4月固定）
    var holidayDates = {
        '2026-04-29': '昭和の日'
    };

    // ==========================================================
    // デモ初期配置生成
    // ==========================================================

    function generateDemoAssignments() {
        assignments = {};
        vehicleAssignments = {};
        holidays = {};

        var dates = getVisibleDates();
        var empCount = employeesData.length;

        // いくつかの社員に休みを設定
        holidays[2] = {}; holidays[2][formatDateKey(dates[3])] = true;
        holidays[5] = {}; holidays[5][formatDateKey(dates[1])] = true;
        holidays[7] = {}; holidays[7][formatDateKey(dates[5])] = true;
        holidays[10] = {}; holidays[10][formatDateKey(dates[2])] = true;

        // サンプル配置
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
            { emp: 21, dayOffset: 0, shift: 'day', site: 's4' }
        ];

        samplePlacements.forEach(function (p) {
            if (p.emp >= empCount) return;
            var dk = formatDateKey(dates[p.dayOffset]);
            if (!assignments[p.emp]) assignments[p.emp] = {};
            if (!assignments[p.emp][dk]) assignments[p.emp][dk] = {};
            if (!assignments[p.emp][dk][p.shift]) assignments[p.emp][dk][p.shift] = [];
            assignments[p.emp][dk][p.shift].push(p.site);
        });

        // 車両配置サンプル
        var dk0 = formatDateKey(dates[0]);
        var dk1 = formatDateKey(dates[1]);
        vehicleAssignments[dk0] = { day: {}, night: {} };
        vehicleAssignments[dk0].day['s1'] = 'v1';
        vehicleAssignments[dk0].day['s3'] = 'v2';
        vehicleAssignments[dk0].night['s4'] = 'v2'; // 昼夜連続
        vehicleAssignments[dk1] = { day: {}, night: {} };
        vehicleAssignments[dk1].day['s5'] = 'v3';
    }

    // ==========================================================
    // グループ構築
    // ==========================================================

    function buildEmployeeGroups() {
        var groups = [];
        var gcOrder = ['touo', 'nikkei', 'zennihon'];
        var gcNames = { touo: '東央警備', nikkei: 'Nikkei', zennihon: 'AJE' };

        gcOrder.forEach(function (gc) {
            var deptMap = {};
            employeesData.forEach(function (emp, idx) {
                if (emp.company !== gc) return;
                if (!deptMap[emp.dept]) deptMap[emp.dept] = [];
                deptMap[emp.dept].push({ index: idx, name: emp.name, dept: emp.dept, company: gc });
            });

            // 部門名を解決
            var deptEntries = Object.keys(deptMap).map(function (deptId) {
                var deptName = deptId;
                if (departmentsData && departmentsData[gc]) {
                    departmentsData[gc].forEach(function (d) {
                        if (d.id === deptId) deptName = d.name;
                    });
                }
                return {
                    id: deptId,
                    gcCode: gc,
                    gcName: gcNames[gc],
                    deptName: deptName,
                    employees: deptMap[deptId]
                };
            });

            groups = groups.concat(deptEntries);
        });
        return groups;
    }

    // ==========================================================
    // グリッド描画
    // ==========================================================

    function renderGrid() {
        var wrapper = document.getElementById('wsGridWrapper');
        var grid = document.getElementById('wsGrid');
        if (!grid) return;

        var dates = getVisibleDates();
        var dayCount = dates.length;
        var colCount = 1 + dayCount * 2; // name + (day+night)*dayCount

        // グリッドカラム設定
        grid.style.gridTemplateColumns = '140px repeat(' + (dayCount * 2) + ', minmax(52px, 1fr))';
        grid.innerHTML = '';

        // --- ヘッダー行1: 日付 ---
        var corner1 = el('div', 'md-ws-corner', '社員名');
        corner1.style.gridRow = '1';
        grid.appendChild(corner1);

        dates.forEach(function (d, i) {
            var dk = formatDateKey(d);
            var dow = getDaysOfWeek()[d.getDay()];
            var mm = d.getMonth() + 1;
            var dd = d.getDate();
            var cls = 'md-ws-date-header';
            if (d.getDay() === 6) cls += ' md-ws-sat';
            if (d.getDay() === 0) cls += ' md-ws-sun';
            if (holidayDates[dk]) cls += ' md-ws-holiday';
            if (dk === formatDateKey(today)) cls += ' md-ws-today';
            var header = el('div', cls, mm + '/' + dd + '(' + dow + ')');
            header.style.gridColumn = 'span 2';
            header.dataset.date = dk;
            header.addEventListener('click', function () {
                selectDate(dk);
            });
            header.style.cursor = 'pointer';
            grid.appendChild(header);
        });

        // --- ヘッダー行2: 昼/夜 ---
        var corner2 = el('div', 'md-ws-corner', '');
        corner2.style.gridRow = '2';
        corner2.style.fontSize = '10px';
        corner2.style.borderBottom = '2px solid var(--secondary)';
        grid.appendChild(corner2);

        dates.forEach(function (d, i) {
            var dayH = el('div', 'md-ws-shift-header', '昼');
            var nightH = el('div', 'md-ws-shift-header md-ws-shift-night', '夜');
            grid.appendChild(dayH);
            grid.appendChild(nightH);
        });

        // --- データ行 ---
        var groups = buildEmployeeGroups();
        var currentRow = 3;

        groups.forEach(function (group) {
            var groupId = group.id;
            var isCollapsed = !!collapsedGroups[groupId];

            // グループヘッダー
            var groupRow = el('div', 'md-ws-group-row' + (isCollapsed ? ' md-ws-collapsed' : ''));
            groupRow.style.gridRow = currentRow;
            groupRow.innerHTML =
                '<span class="md-ws-group-chevron">▼</span>' +
                '<span class="md-ws-group-gc-badge">' + group.gcName + '</span>' +
                '<span>' + group.deptName + '</span>' +
                '<span style="font-size:10px;color:var(--text-tertiary);font-weight:400;">(' + group.employees.length + '名)</span>';
            groupRow.dataset.groupId = groupId;
            groupRow.addEventListener('click', function () {
                toggleGroup(groupId);
            });
            grid.appendChild(groupRow);
            currentRow++;

            // 社員行
            group.employees.forEach(function (emp) {
                var gcClass = ' md-ws-gc-' + emp.company;
                var nameCell = el('div', 'md-ws-name-cell' + gcClass, emp.name);
                nameCell.dataset.empIndex = emp.index;
                nameCell.dataset.groupId = groupId;
                if (isCollapsed) nameCell.classList.add('md-ws-row-hidden');
                nameCell.style.gridRow = currentRow;
                nameCell.style.gridColumn = '1';
                grid.appendChild(nameCell);

                // 各日付セル
                dates.forEach(function (d, di) {
                    var dk = formatDateKey(d);
                    var isPast = d < today;
                    var isHoliday = holidays[emp.index] && holidays[emp.index][dk];

                    ['day', 'night'].forEach(function (shift, si) {
                        var colIdx = 2 + di * 2 + si;
                        var cellCls = 'md-ws-cell';
                        if (si === 0) cellCls += ' md-ws-day-col';
                        if (si === 1) cellCls += ' md-ws-night-col';
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
                            var mark = el('div', 'md-ws-holiday-mark', '休');
                            cell.appendChild(mark);
                            cell.classList.add('md-ws-holiday-cell');
                        } else {
                            // 配置済み現場
                            var empAssign = assignments[emp.index];
                            if (empAssign && empAssign[dk] && empAssign[dk][shift]) {
                                empAssign[dk][shift].forEach(function (siteId) {
                                    var site = findSite(siteId);
                                    if (!site) return;
                                    var chipCls = 'md-ws-site-chip';
                                    if (shift === 'night') chipCls += ' md-ws-night-chip';
                                    if (isPast) chipCls += ' md-ws-readonly';
                                    var chip = el('div', chipCls, truncate(site.name, 8));
                                    chip.dataset.siteId = siteId;
                                    chip.title = site.name + ' (' + site.company + ')';
                                    if (!isPast) {
                                        chip.draggable = true;
                                        chip.addEventListener('dragstart', onChipDragStart);
                                        chip.addEventListener('dragend', onChipDragEnd);
                                    }
                                    cell.appendChild(chip);
                                });
                            }
                        }

                        // ドロップ対象
                        if (!isPast && !isHoliday) {
                            cell.addEventListener('dragover', onCellDragOver);
                            cell.addEventListener('dragleave', onCellDragLeave);
                            cell.addEventListener('drop', onCellDrop);
                        }

                        grid.appendChild(cell);
                    });
                });
                currentRow++;
            });

            // 車両行
            var vNameCell = el('div', 'md-ws-name-cell md-ws-vehicle-name md-ws-gc-' + group.gcCode);
            vNameCell.innerHTML = '<span style="margin-right:4px;">🚗</span> 車両';
            vNameCell.dataset.groupId = groupId;
            if (isCollapsed) vNameCell.classList.add('md-ws-row-hidden');
            vNameCell.style.gridRow = currentRow;
            vNameCell.style.gridColumn = '1';
            grid.appendChild(vNameCell);

            dates.forEach(function (d, di) {
                var dk = formatDateKey(d);
                ['day', 'night'].forEach(function (shift, si) {
                    var colIdx = 2 + di * 2 + si;
                    var vCell = el('div', 'md-ws-cell md-ws-vehicle-cell');
                    if (si === 0) vCell.classList.add('md-ws-day-col');
                    if (si === 1) vCell.classList.add('md-ws-night-col');
                    vCell.dataset.groupId = groupId;
                    if (isCollapsed) vCell.classList.add('md-ws-row-hidden');
                    vCell.style.gridRow = currentRow;
                    vCell.style.gridColumn = colIdx;

                    // 車両チップ
                    var va = vehicleAssignments[dk];
                    if (va && va[shift]) {
                        Object.keys(va[shift]).forEach(function (siteId) {
                            var vehicleId = va[shift][siteId];
                            var vehicle = findVehicle(vehicleId);
                            if (!vehicle) return;
                            // この現場にこのグループの社員がいるか確認
                            var hasGroupEmployee = group.employees.some(function (emp) {
                                var ea = assignments[emp.index];
                                return ea && ea[dk] && ea[dk][shift] && ea[dk][shift].indexOf(siteId) >= 0;
                            });
                            if (!hasGroupEmployee) return;

                            // 昼夜連続チェック
                            var isSpanning = false;
                            if (shift === 'day' && va.night && va.night[siteId] === vehicleId) {
                                isSpanning = true;
                            }
                            if (shift === 'night') {
                                if (va.day && va.day[siteId] === vehicleId) return; // 昼で既に描画
                            }

                            if (isSpanning) {
                                var span = el('div', 'md-ws-vehicle-span');
                                span.textContent = vehicle.plate + ' ' + vehicle.model;
                                span.title = '昼夜連続: ' + findSite(siteId).name + ' に駐車中';
                                span.style.right = '2px';
                                span.style.gridColumn = 'span 2';
                                // span要素をabsolute配置するため親にrelativeを設定
                                vCell.style.position = 'relative';
                                vCell.style.overflow = 'visible';
                                vCell.style.zIndex = '5';
                                vCell.appendChild(span);
                            } else {
                                var vChip = el('div', 'md-ws-vehicle-chip', truncate(vehicle.plate, 10));
                                vChip.title = vehicle.plate + ' ' + vehicle.model;
                                vCell.appendChild(vChip);
                            }
                        });
                    }

                    grid.appendChild(vCell);
                });
            });
            currentRow++;
        });

        // ヘッダー更新
        updateMonthLabel();
    }

    // ==========================================================
    // サイドバー描画
    // ==========================================================

    function renderSidebar() {
        var body = document.getElementById('wsSidebarBody');
        if (!body) return;

        var d = parseDate(selectedDate);
        if (!d) return;

        // ヘッダー更新
        var dateLabel = document.getElementById('wsSidebarDate');
        var dowLabel = document.getElementById('wsSidebarDow');
        if (dateLabel) {
            var mm = d.getMonth() + 1;
            var dd = d.getDate();
            dateLabel.textContent = mm + '月' + dd + '日';
        }
        if (dowLabel) {
            dowLabel.textContent = '(' + getDaysOfWeek()[d.getDay()] + ')';
        }

        body.innerHTML = '';

        // その日の全現場を表示
        var hasSites = false;

        wsSitesData.forEach(function (site) {
            // この日にこの現場の配置があるか確認
            var dayAssigned = getAssignedEmployees(site.id, selectedDate, 'day');
            var nightAssigned = getAssignedEmployees(site.id, selectedDate, 'night');
            var dayOrders = site.orders.day;
            var nightOrders = site.orders.night;

            // 受注がある現場のみ表示
            if (dayOrders === 0 && nightOrders === 0) return;
            hasSites = true;

            var card = document.createElement('div');
            card.className = 'md-ws-site-card';
            card.dataset.siteId = site.id;

            // ヘッダー
            var header = document.createElement('div');
            header.className = 'md-ws-site-card-header';

            var dragHandle = el('span', 'md-ws-drag-handle', '⠿');
            header.appendChild(dragHandle);

            var name = el('div', 'md-ws-site-card-name', site.name);
            header.appendChild(name);

            // シフト別の情報を表示
            if (dayOrders > 0) {
                header.appendChild(createStaffBadge(dayAssigned.length, dayOrders, 'day'));
            }
            if (nightOrders > 0) {
                header.appendChild(createStaffBadge(nightAssigned.length, nightOrders, 'night'));
            }

            var chevron = el('span', 'md-ws-site-card-chevron', '▶');
            header.appendChild(chevron);

            header.addEventListener('click', function (e) {
                if (e.target.closest('.md-ws-drag-handle')) return;
                card.classList.toggle('md-ws-expanded');
            });

            card.appendChild(header);

            // ボディ（展開時）
            var cardBody = document.createElement('div');
            cardBody.className = 'md-ws-site-card-body';

            // 昼の配置
            if (dayOrders > 0) {
                var daySection = document.createElement('div');
                daySection.className = 'md-ws-assigned-list';
                var dayLabel = el('div', 'md-ws-assigned-label');
                dayLabel.innerHTML = '<span class="md-ws-shift-badge md-ws-shift-day-badge">昼</span> 配置 ' + dayAssigned.length + '/' + dayOrders + '名';
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
                    empty.textContent = '未配置';
                    daySection.appendChild(empty);
                }
                cardBody.appendChild(daySection);
            }

            // 夜の配置
            if (nightOrders > 0) {
                var nightSection = document.createElement('div');
                nightSection.className = 'md-ws-assigned-list';
                var nightLabel = el('div', 'md-ws-assigned-label');
                nightLabel.innerHTML = '<span class="md-ws-shift-badge md-ws-shift-night-badge">夜</span> 配置 ' + nightAssigned.length + '/' + nightOrders + '名';
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
                    emptyN.textContent = '未配置';
                    nightSection.appendChild(emptyN);
                }
                cardBody.appendChild(nightSection);
            }

            // 車両情報
            var va = vehicleAssignments[selectedDate];
            var vehicleItems = [];
            if (va) {
                ['day', 'night'].forEach(function (sh) {
                    if (va[sh] && va[sh][site.id]) {
                        var v = findVehicle(va[sh][site.id]);
                        if (v) vehicleItems.push({ vehicle: v, shift: sh });
                    }
                });
            }
            if (vehicleItems.length > 0) {
                var vLabel = el('div', 'md-ws-vehicle-list-label', '🚗 車両');
                cardBody.appendChild(vLabel);
                vehicleItems.forEach(function (vi) {
                    var vRow = el('div', 'md-ws-vehicle-list-item');
                    var shiftStr = vi.shift === 'day' ? '昼' : '夜';
                    vRow.textContent = vi.vehicle.plate + ' ' + vi.vehicle.model + ' [' + shiftStr + ']';
                    cardBody.appendChild(vRow);
                });
            }

            card.appendChild(cardBody);

            // カード全体をドラッグ可能にする
            card.draggable = true;
            card.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'sidebar-site',
                    siteId: site.id
                }));
                e.dataTransfer.effectAllowed = 'copy';
                card.style.opacity = '0.5';
            });
            card.addEventListener('dragend', function () {
                card.style.opacity = '';
            });

            body.appendChild(card);
        });

        if (!hasSites) {
            body.innerHTML = '<div class="md-ws-sidebar-empty">この日の現場データはありません</div>';
        }
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

        var shiftMark = shift === 'night' ? '夜' : '昼';
        badge.textContent = shiftMark + ' ' + assigned + '/' + required;
        return badge;
    }

    // ==========================================================
    // ドラッグ＆ドロップ
    // ==========================================================

    var dragData = null;

    function onChipDragStart(e) {
        var chip = e.target;
        dragData = {
            type: 'move-chip',
            siteId: chip.dataset.siteId,
            fromEmpIndex: parseInt(chip.closest('[data-emp-index]').dataset.empIndex),
            fromDate: chip.closest('[data-date]').dataset.date,
            fromShift: chip.closest('[data-shift]').dataset.shift
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'move';
        chip.classList.add('md-ws-dragging');
    }

    function onChipDragEnd(e) {
        e.target.classList.remove('md-ws-dragging');
        dragData = null;
    }

    function onCellDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        e.currentTarget.classList.add('md-ws-drag-over');
    }

    function onCellDragLeave(e) {
        e.currentTarget.classList.remove('md-ws-drag-over');
    }

    function onCellDrop(e) {
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
            // サイドバーからのドロップ → 配置追加
            addAssignment(empIndex, date, shift, data.siteId);
        } else if (data.type === 'move-chip') {
            // グリッド内移動
            removeAssignment(data.fromEmpIndex, data.fromDate, data.fromShift, data.siteId);
            addAssignment(empIndex, date, shift, data.siteId);
        }

        renderGrid();
        renderSidebar();
    }

    function addAssignment(empIndex, date, shift, siteId) {
        if (!assignments[empIndex]) assignments[empIndex] = {};
        if (!assignments[empIndex][date]) assignments[empIndex][date] = {};
        if (!assignments[empIndex][date][shift]) assignments[empIndex][date][shift] = [];
        // 重複チェック
        if (assignments[empIndex][date][shift].indexOf(siteId) < 0) {
            assignments[empIndex][date][shift].push(siteId);
        }
    }

    function removeAssignment(empIndex, date, shift, siteId) {
        if (!assignments[empIndex] || !assignments[empIndex][date] || !assignments[empIndex][date][shift]) return;
        var arr = assignments[empIndex][date][shift];
        var idx = arr.indexOf(siteId);
        if (idx >= 0) arr.splice(idx, 1);
    }

    // ==========================================================
    // ナビゲーション
    // ==========================================================

    function prevWeek() {
        viewStartDate.setDate(viewStartDate.getDate() - 7);
        renderGrid();
        updateMonthLabel();
    }

    function nextWeek() {
        viewStartDate.setDate(viewStartDate.getDate() + 7);
        renderGrid();
        updateMonthLabel();
    }

    function goToday() {
        viewStartDate = getWeekStart(today);
        selectedDate = formatDateKey(today);
        renderGrid();
        renderSidebar();
        updateMonthLabel();
    }

    function updateMonthLabel() {
        var label = document.getElementById('wsMonthLabel');
        if (!label) return;
        var dates = getVisibleDates();
        var first = dates[0];
        var last = dates[dates.length - 1];
        var y1 = first.getFullYear();
        var m1 = first.getMonth() + 1;
        var y2 = last.getFullYear();
        var m2 = last.getMonth() + 1;
        if (y1 === y2 && m1 === m2) {
            label.textContent = y1 + '年' + m1 + '月';
        } else {
            label.textContent = y1 + '年' + m1 + '月 〜 ' + (y1 !== y2 ? y2 + '年' : '') + m2 + '月';
        }
    }

    function selectDate(dk) {
        selectedDate = dk;
        renderSidebar();
        // 日付ヘッダーのハイライト
        document.querySelectorAll('.md-ws-date-header').forEach(function (h) {
            h.style.outline = h.dataset.date === dk ? '2px solid var(--accent-light)' : '';
            h.style.outlineOffset = h.dataset.date === dk ? '-2px' : '';
        });
    }

    function toggleGroup(groupId) {
        collapsedGroups[groupId] = !collapsedGroups[groupId];
        var isCollapsed = collapsedGroups[groupId];

        // グループヘッダーのスタイル
        var groupRow = document.querySelector('.md-ws-group-row[data-group-id="' + groupId + '"]');
        if (groupRow) {
            groupRow.classList.toggle('md-ws-collapsed', isCollapsed);
        }

        // 子要素の表示/非表示
        document.querySelectorAll('[data-group-id="' + groupId + '"]').forEach(function (el) {
            if (el.classList.contains('md-ws-group-row')) return;
            el.classList.toggle('md-ws-row-hidden', isCollapsed);
        });
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
        return str.length > max ? str.substring(0, max) + '…' : str;
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

    function parseDate(dk) {
        var parts = dk.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
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

    // ==========================================================
    // テーマ切替
    // ==========================================================

    window.toggleTheme = function () {
        var htmlEl = document.documentElement;
        var isDark = htmlEl.getAttribute('data-theme') === 'dark';
        var newTheme = isDark ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme_v2', newTheme);
    };

    // 保存済みテーマの復元
    function restoreTheme() {
        var saved = localStorage.getItem('theme_v2');
        if (saved === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // ==========================================================
    // 初期化
    // ==========================================================

    function init() {
        restoreTheme();
        generateDemoAssignments();

        // ナビゲーションボタン
        var prevBtn = document.getElementById('wsPrevWeek');
        var nextBtn = document.getElementById('wsNextWeek');
        var todayBtn = document.getElementById('wsTodayBtn');
        if (prevBtn) prevBtn.addEventListener('click', prevWeek);
        if (nextBtn) nextBtn.addEventListener('click', nextWeek);
        if (todayBtn) todayBtn.addEventListener('click', goToday);

        renderGrid();
        renderSidebar();

        // 初回日付選択ハイライト
        selectDate(selectedDate);
    }

    // DOMReady
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
