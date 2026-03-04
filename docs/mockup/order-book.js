/* ===========================
   受注簿モックアップ JS
   =========================== */

// --- 状態 ---
let currentYear = 2026;
let currentMonth = 2; // 1-indexed
let weekendColorsEnabled = true;
let showHiddenRows = false;
let filterBarVisible = false;

// --- 祝日データ（2026年） ---
const holidays = {
    '2026-01-01': '元日',
    '2026-01-12': '成人の日',
    '2026-02-11': '建国記念の日',
    '2026-02-23': '天皇誕生日',
    '2026-03-20': '春分の日',
    '2026-04-29': '昭和の日',
    '2026-05-03': '憲法記念日',
    '2026-05-04': 'みどりの日',
    '2026-05-05': 'こどもの日',
    '2026-05-06': '振替休日',
    '2026-07-20': '海の日',
    '2026-08-11': '山の日',
    '2026-09-21': '敬老の日',
    '2026-09-22': '秋分の日',
    '2026-09-23': '国民の休日',
    '2026-10-12': 'スポーツの日',
    '2026-11-03': '文化の日',
    '2026-11-23': '勤労感謝の日',
};

// --- サンプルデータ ---
const sampleRows = [
    { branch: '本社', category: '高速SA', shift: '昼', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
    { branch: '本社', category: '高速SA', shift: '夜', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
    { branch: '本社', category: '高速',   shift: '昼', company: '△△建設(株)',  task: '中央道補修', hidden: false },
    { branch: '本社', category: '一般道', shift: '昼', company: '(株)丸山建設', task: '〇〇ビル巡回', hidden: false },
    { branch: '本社', category: '一般道', shift: '昼', company: '(株)丸山建設', task: '△△マンション', hidden: false },
    { branch: '本社', category: '一般道', shift: '夜', company: '□□警備(株)',  task: '国道1号線',  hidden: false },
    { branch: '本社', category: '施設',   shift: '昼', company: '全日本エンタープライズ', task: '商業施設A', hidden: false },
    { branch: '支店', category: '高速SA', shift: '昼', company: '(株)〇〇高速', task: '名神SA巡回', hidden: false },
    { branch: '支店', category: '高速',   shift: '昼', company: '△△建設(株)',  task: '東名高速補修', hidden: true },
    { branch: '支店', category: '一般道', shift: '昼', company: '(株)丸山建設', task: '□□公園整備', hidden: false },
    { branch: '支店', category: '一般道', shift: '夜', company: '□□警備(株)',  task: '県道12号線', hidden: false },
    { branch: '支店', category: '施設',   shift: '昼', company: '全日本エンタープライズ', task: '商業施設B', hidden: false },
];

// セルデータ生成（サンプル）
function generateCellData() {
    const data = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    sampleRows.forEach((row, ri) => {
        data[ri] = {};
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(currentYear, currentMonth - 1, d);
            const dow = dt.getDay();
            // ランダムにデータを配置
            const hasData = Math.random() > 0.35;
            if (hasData) {
                const count = Math.floor(Math.random() * 5) + 1;
                const names = ['山田太郎', '鈴木一郎', '佐藤花子', '田中次郎', '高橋三郎', '渡辺四郎', '伊藤五郎'];
                const assigned = names.slice(0, count).join('、');
                const startH = row.shift === '夜' ? 20 : 7 + Math.floor(Math.random() * 2);
                const endH = row.shift === '夜' ? 5 : 16 + Math.floor(Math.random() * 2);
                data[ri][d] = {
                    count: count,
                    siteName: row.task + ' 現場',
                    startTime: String(startH).padStart(2, '0') + ':00',
                    endTime: String(endH).padStart(2, '0') + ':00',
                    meetingPlace: ['△△駅', '○○IC', '現地集合', '□□PA'][Math.floor(Math.random() * 4)],
                    meetingTime: String(startH - 1).padStart(2, '0') + ':30',
                    assignment: assigned,
                    contact: Math.random() > 0.7 ? '担当: 木村' : '',
                    remarks: Math.random() > 0.8 ? '雨天中止の可能性あり' : '',
                };
            }
        }
    });
    return data;
}

let cellData = generateCellData();

// --- グリッド描画 ---
function renderGrid() {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    // ヘッダー
    let headHtml = '<tr>';
    const frozenHeaders = ['本社/支店', '区分', '昼夜', '契約先名', '業務名'];
    frozenHeaders.forEach((h, i) => {
        headHtml += `<th class="ob-frozen ob-frozen-${i}">${h}</th>`;
    });
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(currentYear, currentMonth - 1, d);
        const dow = dt.getDay();
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let cls = 'ob-date-header';
        if (weekendColorsEnabled) {
            if (holidays[dateStr]) cls += ' ob-holiday-head';
            else if (dow === 0) cls += ' ob-sun-head';
            else if (dow === 6) cls += ' ob-sat-head';
        }
        headHtml += `<th class="${cls}"><span class="ob-day-num">${d}</span><span class="ob-day-name">${dayNames[dow]}</span></th>`;
    }
    // 合計列
    headHtml += '<th class="ob-date-header" style="min-width:44px;"><span class="ob-day-num">計</span></th>';
    headHtml += '</tr>';
    document.getElementById('gridHead').innerHTML = headHtml;

    // ボディ
    let bodyHtml = '';
    let visibleCount = 0;
    const dailyTotals = new Array(daysInMonth).fill(0);

    sampleRows.forEach((row, ri) => {
        const isHidden = row.hidden && !showHiddenRows;
        const isDimmed = row.hidden && showHiddenRows;
        if (!isFiltered(row)) return;

        let rowCls = '';
        if (isHidden) rowCls = 'ob-row-hidden';
        else if (isDimmed) rowCls = 'ob-row-dimmed';

        if (row.shift === '夜') rowCls += ' ob-night';
        if (!isHidden) visibleCount++;

        bodyHtml += `<tr class="${rowCls}" data-ri="${ri}">`;
        bodyHtml += `<td class="ob-frozen ob-frozen-0">${row.branch}</td>`;
        bodyHtml += `<td class="ob-frozen ob-frozen-1">${row.category}</td>`;
        bodyHtml += `<td class="ob-frozen ob-frozen-2">${row.shift}</td>`;
        bodyHtml += `<td class="ob-frozen ob-frozen-3">${row.company}</td>`;
        bodyHtml += `<td class="ob-frozen ob-frozen-4">${row.task}</td>`;

        let rowTotal = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(currentYear, currentMonth - 1, d);
            const dow = dt.getDay();
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cell = cellData[ri] && cellData[ri][d];
            let cls = 'ob-date-cell';
            if (cell) cls += ' ob-has-comment';
            if (weekendColorsEnabled) {
                if (holidays[dateStr]) cls += ' ob-holiday';
                else if (dow === 0) cls += ' ob-sun';
                else if (dow === 6) cls += ' ob-sat';
            }
            const val = cell ? cell.count : '';
            if (cell && !isHidden) {
                rowTotal += cell.count;
                dailyTotals[d - 1] += cell.count;
            }
            bodyHtml += `<td class="${cls}" data-ri="${ri}" data-day="${d}" onmouseenter="showTooltip(event,${ri},${d})" onmouseleave="hideTooltip()" onclick="openEditModal(${ri},${d})">${val}</td>`;
        }
        bodyHtml += `<td style="font-weight:700; background:#fefce8; min-width:44px;">${rowTotal || ''}</td>`;
        bodyHtml += '</tr>';
    });

    // 合計行
    bodyHtml += '<tr class="ob-total-row">';
    bodyHtml += '<td class="ob-frozen ob-frozen-0"></td>';
    bodyHtml += '<td class="ob-frozen ob-frozen-1"></td>';
    bodyHtml += '<td class="ob-frozen ob-frozen-2"></td>';
    bodyHtml += '<td class="ob-frozen ob-frozen-3"></td>';
    bodyHtml += '<td class="ob-frozen ob-frozen-4" style="text-align:right; font-weight:700;">合計</td>';
    let grandTotal = 0;
    for (let d = 0; d < daysInMonth; d++) {
        grandTotal += dailyTotals[d];
        bodyHtml += `<td>${dailyTotals[d] || ''}</td>`;
    }
    bodyHtml += `<td style="font-weight:700; background:#fef9c3;">${grandTotal}</td>`;
    bodyHtml += '</tr>';

    document.getElementById('gridBody').innerHTML = bodyHtml;
    document.getElementById('summaryText').textContent = `全 ${sampleRows.length} 件 / 表示 ${visibleCount} 件`;
}

// --- フィルタ ---
function isFiltered(row) {
    const fb = document.getElementById('filterBranch').value;
    const fc = document.getElementById('filterCategory').value;
    const fs = document.getElementById('filterShift').value;
    const fco = document.getElementById('filterCompany').value.trim();
    if (fb && row.branch !== fb) return false;
    if (fc && row.category !== fc) return false;
    if (fs && row.shift !== fs) return false;
    if (fco && !row.company.includes(fco)) return false;
    return true;
}

function toggleFilterRow() {
    filterBarVisible = !filterBarVisible;
    document.getElementById('filterBar').style.display = filterBarVisible ? 'flex' : 'none';
    document.querySelector('.ob-tb-btn:nth-child(2)').classList.toggle('active', filterBarVisible);
}

function applyFilters() {
    renderGrid();
}

function clearFilters() {
    document.getElementById('filterBranch').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterShift').value = '';
    document.getElementById('filterCompany').value = '';
    renderGrid();
}

// --- 月切替え ---
function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    document.getElementById('monthLabel').textContent = `${currentYear}年${currentMonth}月`;
    cellData = generateCellData();
    renderGrid();
}

// --- 土日祝色トグル ---
function toggleWeekendColors() {
    weekendColorsEnabled = !weekendColorsEnabled;
    document.querySelector('.ob-tb-btn:nth-child(4)').classList.toggle('active', weekendColorsEnabled);
    renderGrid();
}

// --- 表示/非表示トグル ---
function toggleHiddenRows() {
    showHiddenRows = !showHiddenRows;
    document.querySelector('.ob-tb-btn:nth-child(3)').classList.toggle('active', showHiddenRows);
    renderGrid();
}

// --- ツールチップ ---
function showTooltip(e, ri, day) {
    const cell = cellData[ri] && cellData[ri][day];
    if (!cell) return;
    const row = sampleRows[ri];
    const dateStr = `${currentMonth}/${day}`;

    let html = `<div class="ob-tt-title">${row.company} / ${row.task}</div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">日付:</span><span class="ob-tt-value">${dateStr}（${row.shift}）</span></div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">現場名:</span><span class="ob-tt-value">${cell.siteName}</span></div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">時間:</span><span class="ob-tt-value">${cell.startTime} - ${cell.endTime}</span></div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">集合:</span><span class="ob-tt-value">${cell.meetingPlace} ${cell.meetingTime}</span></div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">人数:</span><span class="ob-tt-value">${cell.count}名</span></div>`;
    html += `<div class="ob-tt-row"><span class="ob-tt-label">配置:</span><span class="ob-tt-value">${cell.assignment}</span></div>`;
    if (cell.contact) html += `<div class="ob-tt-row"><span class="ob-tt-label">連絡:</span><span class="ob-tt-value">${cell.contact}</span></div>`;
    if (cell.remarks) html += `<div class="ob-tt-row"><span class="ob-tt-label">備考:</span><span class="ob-tt-value">${cell.remarks}</span></div>`;

    const tooltip = document.getElementById('cellTooltip');
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';

    // 位置調整
    const rect = e.target.getBoundingClientRect();
    let left = rect.right + 8;
    let top = rect.top;
    if (left + 320 > window.innerWidth) left = rect.left - 328;
    if (top + tooltip.offsetHeight > window.innerHeight) top = window.innerHeight - tooltip.offsetHeight - 10;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function hideTooltip() {
    document.getElementById('cellTooltip').style.display = 'none';
}

// --- 編集モーダル ---
let editingRi = null;
let editingDay = null;

function openEditModal(ri, day) {
    editingRi = ri;
    editingDay = day;
    const row = sampleRows[ri];
    const cell = cellData[ri] && cellData[ri][day];
    const dateStr = `${currentYear}年${currentMonth}月${day}日`;

    document.getElementById('editModalTitle').textContent = `セル編集 - ${dateStr}`;
    document.getElementById('editModalInfo').innerHTML =
        `<strong>${row.company}</strong> / ${row.task}<br>` +
        `${row.branch} | ${row.category} | ${row.shift}勤`;

    document.getElementById('editCount').value = cell ? cell.count : '';
    document.getElementById('editSiteName').value = cell ? cell.siteName : '';
    document.getElementById('editStartTime').value = cell ? cell.startTime : '';
    document.getElementById('editEndTime').value = cell ? cell.endTime : '';
    document.getElementById('editMeetingPlace').value = cell ? cell.meetingPlace : '';
    document.getElementById('editMeetingTime').value = cell ? cell.meetingTime : '';
    document.getElementById('editAssignment').value = cell ? cell.assignment : '';
    document.getElementById('editContact').value = cell ? cell.contact : '';
    document.getElementById('editRemarks').value = cell ? cell.remarks : '';

    document.getElementById('editModalOverlay').style.display = 'flex';
}

function closeEditModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('editModalOverlay').style.display = 'none';
}

function saveEdit() {
    const count = parseInt(document.getElementById('editCount').value) || 0;
    if (!cellData[editingRi]) cellData[editingRi] = {};

    if (count === 0) {
        delete cellData[editingRi][editingDay];
    } else {
        cellData[editingRi][editingDay] = {
            count: count,
            siteName: document.getElementById('editSiteName').value,
            startTime: document.getElementById('editStartTime').value,
            endTime: document.getElementById('editEndTime').value,
            meetingPlace: document.getElementById('editMeetingPlace').value,
            meetingTime: document.getElementById('editMeetingTime').value,
            assignment: document.getElementById('editAssignment').value,
            contact: document.getElementById('editContact').value,
            remarks: document.getElementById('editRemarks').value,
        };
    }
    closeEditModal();
    renderGrid();
}

// --- ソートモーダル ---
function openSortModal() {
    document.getElementById('sortModalOverlay').style.display = 'flex';
    initSortDrag();
}

function closeSortModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('sortModalOverlay').style.display = 'none';
}

function toggleSortDir(btn) {
    btn.textContent = btn.textContent === '▲' ? '▼' : '▲';
}

function initSortDrag() {
    const list = document.getElementById('sortList');
    let dragItem = null;

    list.querySelectorAll('li').forEach(li => {
        li.addEventListener('dragstart', () => { dragItem = li; li.style.opacity = '0.4'; });
        li.addEventListener('dragend', () => { dragItem = null; li.style.opacity = '1'; list.querySelectorAll('li').forEach(l => l.classList.remove('drag-over')); });
        li.addEventListener('dragover', (e) => { e.preventDefault(); li.classList.add('drag-over'); });
        li.addEventListener('dragleave', () => { li.classList.remove('drag-over'); });
        li.addEventListener('drop', (e) => {
            e.preventDefault();
            li.classList.remove('drag-over');
            if (dragItem !== li) {
                const items = [...list.children];
                const fromIdx = items.indexOf(dragItem);
                const toIdx = items.indexOf(li);
                if (fromIdx < toIdx) li.after(dragItem);
                else li.before(dragItem);
            }
        });
    });
}

function applySort() {
    const list = document.getElementById('sortList');
    const sortKeys = [...list.children].map(li => ({
        key: li.dataset.key,
        asc: li.querySelector('.ob-sort-dir').textContent === '▲',
    }));

    sampleRows.sort((a, b) => {
        for (const sk of sortKeys) {
            const va = a[sk.key] || '';
            const vb = b[sk.key] || '';
            const cmp = va.localeCompare(vb, 'ja');
            if (cmp !== 0) return sk.asc ? cmp : -cmp;
        }
        return 0;
    });

    // セルデータのインデックスも再マッピング
    cellData = generateCellData();
    closeSortModal();
    renderGrid();
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
});
