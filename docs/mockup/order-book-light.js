/* ===========================
   受注簿モックアップ JS (Coastal Light)
   CSS Grid Layout
   ===========================
   ※ 本ファイルはモックアップ用です。
   ※ 【モックアップ専用】とコメントされた箇所は、本番環境では
   　 DB/APIからのデータ取得に置き換える必要があります。
   ※ 【検証用】とコメントされた箇所は、本番環境では不要です。
   =========================== */

// --- 状態 ---
let currentYear = 2026;
let currentMonth = 3; // 1-indexed
let weekendColorsEnabled = true;
let showHiddenRows = false;
let filterBarVisible = false;

// --- Undo/Redo ---
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

function cloneState() {
    return {
        cellData: JSON.parse(JSON.stringify(cellData)),
        badgeDefinitions: JSON.parse(JSON.stringify(badgeDefinitions)),
        categoryToBadgeId: JSON.parse(JSON.stringify(categoryToBadgeId)),
        sampleRows: JSON.parse(JSON.stringify(sampleRows)),
    };
}

function restoreState(snapshot) {
    cellData = snapshot.cellData;
    badgeDefinitions = snapshot.badgeDefinitions;
    categoryToBadgeId = snapshot.categoryToBadgeId;
    sampleRows = snapshot.sampleRows;
}

function pushUndo() {
    // badgeSnapshotがある場合、モーダル編集中にバッジが変更されているため
    // 変更前のbadgeDefinitionsを使ってスナップショットを作成
    const state = cloneState();
    if (badgeSnapshot) {
        state.badgeDefinitions = JSON.parse(JSON.stringify(badgeSnapshot));
        // categoryToBadgeIdもbadgeSnapshotから再構築
        const oldMap = {};
        badgeSnapshot.forEach(b => { oldMap[b.name] = b.id; });
        state.categoryToBadgeId = oldMap;
    }
    undoStack.push(state);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0;
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(cloneState());
    restoreState(undoStack.pop());
    updateUndoRedoButtons();
    renderGrid();
}

function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(cloneState());
    restoreState(redoStack.pop());
    updateUndoRedoButtons();
    renderGrid();
}

function updateUndoRedoButtons() {
    document.getElementById('undoBtn').disabled = undoStack.length === 0;
    document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

// --- タッチドラッグ共通ヘルパー ---
// モバイル端末でHTML5 Drag&Dropが動作しない問題に対応
// touchstart/touchmove/touchend でドラッグ操作をシミュレート
function enableTouchDrag(container, itemSelector, {
    onReorder,           // (srcIdx, destIdx) => void — 並べ替え確定時
    draggingClass = 'ob-touch-dragging',
    overClass = 'ob-touch-drag-over',
    idxAttr = 'data-drag-idx',
    gripSelector = null, // グリップ要素のセレクタ（nullなら要素全体）
} = {}) {
    let srcEl = null;
    let srcIdx = null;
    let placeholder = null;
    let lastOverEl = null;

    function getItems() { return [...container.querySelectorAll(itemSelector)]; }

    function getIdxFromPoint(x, y) {
        const items = getItems();
        for (const item of items) {
            if (item === placeholder) continue;
            const rect = item.getBoundingClientRect();
            if (y >= rect.top && y <= rect.bottom && x >= rect.left && x <= rect.right) {
                return item;
            }
        }
        return null;
    }

    function handleTouchStart(e) {
        // グリップ指定時はグリップ部分のみ反応
        if (gripSelector) {
            const grip = e.target.closest(gripSelector);
            if (!grip) return;
        }
        const item = e.target.closest(itemSelector);
        if (!item) return;

        srcEl = item;
        srcIdx = parseInt(item.getAttribute(idxAttr));
        if (isNaN(srcIdx)) { srcEl = null; return; }

        // 長押し不要で即座に開始
        srcEl.classList.add(draggingClass);
        e.preventDefault(); // スクロール抑制
    }

    function handleTouchMove(e) {
        if (!srcEl) return;
        e.preventDefault();
        const touch = e.touches[0];
        const overEl = getIdxFromPoint(touch.clientX, touch.clientY);

        if (lastOverEl && lastOverEl !== overEl) {
            lastOverEl.classList.remove(overClass);
        }
        if (overEl && overEl !== srcEl) {
            overEl.classList.add(overClass);
        }
        lastOverEl = overEl;
    }

    function handleTouchEnd(e) {
        if (!srcEl) return;
        srcEl.classList.remove(draggingClass);
        if (lastOverEl) {
            lastOverEl.classList.remove(overClass);
            const destIdx = parseInt(lastOverEl.getAttribute(idxAttr));
            if (!isNaN(destIdx) && srcIdx !== destIdx) {
                onReorder(srcIdx, destIdx);
            }
        }
        srcEl = null;
        srcIdx = null;
        lastOverEl = null;
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
}

// --- 祝日データ（2026年） ---
// 【モックアップ専用】本番環境ではDBまたは祝日APIから動的に取得
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

// --- 業務詳細のデフォルト項目名 ---
// 項目追加時に「工事名①」「工事名②」… の連番で自動命名
const defaultSubTaskPrefix = '工事名';

// 区分別サンプル子・孫データ
// 【モックアップ専用】本番環境ではDBのsite_sub_itemsテーブルから取得
const sampleSubTasks = {
    '高速': [
        { labels: ['橋梁補修', '下地処理'], values: ['橋梁補修', '下地処理'] },
        { labels: ['舗装工事', '本体施工'], values: ['舗装工事', '本体施工'] },
        { labels: ['トンネル点検', '仕上げ確認'], values: ['トンネル点検', '仕上げ確認'] },
        { labels: ['路面点検', '目視確認'], values: ['路面点検', '目視確認'] },
        { labels: ['設備巡回', '計器チェック'], values: ['設備巡回', '計器チェック'] },
    ],
    '交通': [
        { labels: ['交通誘導'], values: ['交通誘導'] },
        { labels: ['規制設置'], values: ['規制設置'] },
        { labels: ['安全確認'], values: ['安全確認'] },
    ],
    '施設': [
        { labels: ['巡回警備'], values: ['巡回警備'] },
        { labels: ['入退館管理'], values: ['入退館管理'] },
        { labels: ['設備点検'], values: ['設備点検'] },
    ],
};

// --- バッジ定義（グローバル） ---
// 【モックアップ専用】本番環境ではDBのbadge_definitionsテーブルから取得
let badgeDefinitions = [
    { id: 'facility',        name: '施設',     children: [] },
    { id: 'event',           name: 'イベント', children: [] },
    { id: 'highway',         name: '高速',     children: [
        { id: 'hw-lane',     name: '車線規制', children: [
            { id: 'hw-lane-sign',   name: '標識車' },
            { id: 'hw-lane-mat',    name: '規制材' },
            { id: 'hw-lane-light',  name: '保安灯' },
        ]},
        { id: 'hw-shoulder', name: '路肩規制', children: [
            { id: 'hw-sh-cone', name: 'コーン' },
            { id: 'hw-sh-bar',  name: 'バー' },
        ]},
        { id: 'hw-booth',    name: 'ブース規制', children: [] },
        { id: 'hw-security', name: '保安員', children: [] },
    ]},
    { id: 'traffic',         name: '交通',     children: [
        { id: 'tr-alternate', name: '片側交互', children: [
            { id: 'tr-alt-flag', name: '旗' },
            { id: 'tr-alt-sign', name: '看板' },
        ]},
        { id: 'tr-closure',   name: '通行止め', children: [] },
    ]},
    { id: 'support-traffic', name: '応援交通', children: [] },
];

let badgeNextId = 1; // 新規バッジ用の連番

function generateBadgeId(prefix) {
    return `${prefix}-custom-${badgeNextId++}`;
}

// --- サンプルデータ ---
// 【モックアップ専用】本番環境ではDBのorder_rows / ordersテーブルからAPI経由で取得
let sampleRows = [
    { branch: '東央警備', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
    { branch: '東央警備', category: '高速', shift: '夜', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
    { branch: '東央警備', category: '高速',   shift: '昼', company: '△△建設(株)',  task: '中央道補修', hidden: false },
    { branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '〇〇ビル巡回', hidden: false },
    { branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '△△マンション', hidden: false },
    { branch: '東央警備', category: '交通', shift: '夜', company: '□□警備(株)',  task: '国道1号線',  hidden: false },
    { branch: '東央警備', category: '施設',   shift: '昼', company: '全日本エンタープライズ', task: '商業施設A', hidden: false },
    { branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '', hidden: false },
    { branch: 'Nikkeiホールディングス', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '名神SA巡回', hidden: false },
    { branch: 'Nikkeiホールディングス', category: '高速',   shift: '昼', company: '△△建設(株)',  task: '東名高速補修', hidden: true },
    { branch: 'Nikkeiホールディングス', category: '交通', shift: '昼', company: '(株)丸山建設', task: '□□公園整備', hidden: false },
    { branch: 'Nikkeiホールディングス', category: '交通', shift: '夜', company: '□□警備(株)',  task: '県道12号線', hidden: false },
    { branch: 'Nikkeiホールディングス', category: '施設',   shift: '昼', company: '全日本エンタープライズ', task: '商業施設B', hidden: false },
    { branch: '全日本エンタープライズ', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '新東名SA巡回', hidden: false },
    { branch: '全日本エンタープライズ', category: '交通', shift: '昼', company: '(株)丸山建設', task: '〇〇交差点', hidden: false },
    { branch: '全日本エンタープライズ', category: '交通', shift: '夜', company: '□□警備(株)',  task: '国道246号線', hidden: false },
    { branch: '全日本エンタープライズ', category: '施設', shift: '昼', company: '全日本エンタープライズ', task: '商業施設C', hidden: false },
];

// --- 計画書業務名の自動生成（親業務名 > 子 > 孫 の階層表示） ---
function buildDailyTaskName(parentTask, subTasks) {
    const parts = [];
    if (parentTask) parts.push(parentTask);
    if (subTasks && subTasks.length > 0) {
        subTasks.forEach(st => { if (st.value) parts.push(st.value); });
    }
    return parts.join(' > ');
}

// セルデータ生成（サンプル）
// 【モックアップ専用】本番環境ではorder_cellsテーブルからAPI経由で取得。この関数全体が不要。
function generateCellData() {
    const data = {};
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    sampleRows.forEach((row, ri) => {
        data[ri] = {};
        for (let d = 1; d <= daysInMonth; d++) {
            const hasData = Math.random() > 0.35;
            if (hasData) {
                const count = Math.floor(Math.random() * 5) + 1;
                const names = ['山田太郎', '鈴木一郎', '佐藤花子', '田中次郎', '高橋三郎', '渡辺四郎', '伊藤五郎'];
                // 未来日は60%が未配置（信頼度の違いが確認できるよう）
                const cellDate = new Date(currentYear, currentMonth - 1, d);
                const isFuture = cellDate >= new Date(new Date().setHours(0,0,0,0));
                const assigned = (isFuture && Math.random() > 0.4) ? '' : names.slice(0, count).join('、');
                const startH = row.shift === '夜' ? 20 : 7 + Math.floor(Math.random() * 2);
                const endH = row.shift === '夜' ? 5 : 16 + Math.floor(Math.random() * 2);
                const catSamples = sampleSubTasks[row.category] || [];
                const sample = catSamples.length ? catSamples[Math.floor(Math.random() * catSamples.length)] : null;

                // subTasks: 動的配列 [{ label, value }]
                const subTasks = [];
                if (sample) {
                    for (let i = 0; i < sample.values.length; i++) {
                        const num = ['①','②','③','④','⑤'][i] || (i + 1);
                        subTasks.push({
                            label: defaultSubTaskPrefix + num,
                            value: sample.values[i] || '',
                        });
                    }
                }

                const cellEntry = {
                    count: count,
                    subTasks: subTasks,
                    dailyTaskName: '',
                    startTime: String(startH).padStart(2, '0') + ':00',
                    endTime: String(endH).padStart(2, '0') + ':00',
                    supervisor: ['山田太郎', '佐藤次郎', '鈴木三郎', ''][Math.floor(Math.random() * 4)],
                    supervisorTel: ['090-1234-5678', '080-9876-5432', '070-1111-2222', ''][Math.floor(Math.random() * 4)],
                    assignment: assigned,
                    mapUrl: '',
                    badge: null,
                    confidence: ['confirmed', 'tentative_high', 'tentative_low'][Math.floor(Math.random() * 3)],
                    remarks: Math.random() > 0.8 ? '雨天中止の可能性あり' : '',
                };
                // サンプル用バッジ自動付与
                if (row.category === '高速') {
                    const childOpts = ['hw-lane', 'hw-shoulder', 'hw-booth', 'hw-security'];
                    const picked = childOpts.filter(() => Math.random() > 0.5);
                    const gcMap = {};
                    picked.forEach(cid => {
                        if (cid === 'hw-lane' && Math.random() > 0.4) {
                            const gcOpts = ['hw-lane-sign', 'hw-lane-mat', 'hw-lane-light'];
                            gcMap[cid] = gcOpts.filter(() => Math.random() > 0.5);
                        } else if (cid === 'hw-shoulder' && Math.random() > 0.5) {
                            gcMap[cid] = ['hw-sh-cone'];
                        }
                    });
                    cellEntry.badge = { parentId: 'highway', childIds: picked.length > 0 ? picked : [childOpts[0]], grandchildMap: gcMap };
                } else if (row.category === '施設') {
                    cellEntry.badge = { parentId: 'facility', childIds: [], grandchildMap: {} };
                } else if (row.category === '交通' && Math.random() > 0.5) {
                    const childOpts = ['tr-alternate', 'tr-closure'];
                    const cid = childOpts[Math.floor(Math.random() * 2)];
                    const gcMap = {};
                    if (cid === 'tr-alternate' && Math.random() > 0.5) {
                        gcMap[cid] = ['tr-alt-flag'];
                    }
                    cellEntry.badge = { parentId: 'traffic', childIds: [cid], grandchildMap: gcMap };
                }
                // 計画書業務名を自動生成（親業務名 > 子 > 孫）
                cellEntry.dailyTaskName = buildDailyTaskName(row.task, cellEntry.subTasks);
                data[ri][d] = cellEntry;
            }
        }
    });
    return data;
}

let cellData = generateCellData(); // 【モックアップ専用】本番ではAPIから取得したデータで初期化

// --- 信頼度の自動確定ルール ---
// ルール1: 昨日以前の日付 → 自動的に「確定」（常に適用、手動フラグ無視）
// ルール2: 業務管理計画書で社員が配置されている → 自動的に「確定」（手動フラグがあればスキップ）
function applyAutoConfidence() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    sampleRows.forEach((_row, ri) => {
        if (!cellData[ri]) return;
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = cellData[ri][d];
            if (!cell) continue;

            const cellDate = new Date(currentYear, currentMonth - 1, d);
            cellDate.setHours(0, 0, 0, 0);

            // ルール1: 昨日以前 → 確定（過去の事実は変わらないため常に適用）
            if (cellDate < today) {
                cell.confidence = 'confirmed';
                cell.confidenceManual = false; // 過去日は手動フラグをリセット
                continue;
            }

            // ユーザーが手動で設定した場合はルール2をスキップ
            if (cell.confidenceManual) continue;

            // ルール2: 社員が配置済み → 確定
            // （実システムではassignment_detailsの存在で判定）
            if (cell.assignment && cell.assignment.trim() !== '') {
                cell.confidence = 'confirmed';
            }
        }
    });
}

// 【モックアップ専用】本番ではサーバーサイドで信頼度を計算済みのデータを返却
applyAutoConfidence();

// --- グリッド描画 ---
function renderGrid() {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const totalCols = 5 + daysInMonth + 1; // frozen(5) + dates + total(1)

    const grid = document.getElementById('obGrid');

    // grid-template-columns を設定
    const colDef = `140px 64px 36px 130px 130px repeat(${daysInMonth}, 48px) 56px`;
    grid.style.gridTemplateColumns = colDef;

    let html = '';

    // === ヘッダー行 ===
    const frozenHeaders = ['会社', '区分', '昼夜', '契約先名', '業務名'];
    frozenHeaders.forEach((h, i) => {
        html += `<div class="ob-cell ob-header ob-frozen-${i}">${h}</div>`;
    });
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(currentYear, currentMonth - 1, d);
        const dow = dt.getDay();
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        let cls = 'ob-cell ob-header ob-date-header';
        if (weekendColorsEnabled) {
            if (holidays[dateStr]) cls += ' ob-holiday-head';
            else if (dow === 0) cls += ' ob-sun-head';
            else if (dow === 6) cls += ' ob-sat-head';
        }
        html += `<div class="${cls}"><span class="ob-day-num">${d}</span><span class="ob-day-name">${dayNames[dow]}</span></div>`;
    }
    // 合計列ヘッダー
    html += '<div class="ob-cell ob-header ob-date-header"><span class="ob-day-num">計</span></div>';

    // === データ行 ===
    let visibleCount = 0;
    let visibleRowIndex = 0;
    const dailyTotalsMin = new Array(daysInMonth).fill(0); // 確定のみ
    const dailyTotalsMax = new Array(daysInMonth).fill(0); // 全て含む

    sampleRows.forEach((row, ri) => {
        const isHidden = row.hidden && !showHiddenRows;
        const isDimmed = row.hidden && showHiddenRows;
        if (!isFiltered(row)) return;

        let rowCls = '';
        if (isHidden) rowCls = 'ob-row-hidden';
        else if (isDimmed) rowCls = 'ob-row-dimmed';
        if (row.shift === '夜') rowCls += ' ob-night';

        const isEven = (!isHidden) && (visibleRowIndex % 2 === 1);
        const evenCls = isEven ? ' ob-even-row' : '';

        if (!isHidden) { visibleCount++; visibleRowIndex++; }

        // Frozen cells（クリックで行編集モーダルを開く）
        html += `<div class="ob-cell ob-frozen-0 ob-frozen-clickable ${rowCls}${evenCls}" onclick="openRowEditModal(${ri})">${row.branch}</div>`;
        html += `<div class="ob-cell ob-frozen-1 ob-frozen-clickable ${rowCls}${evenCls}" onclick="openRowEditModal(${ri})">${row.category}</div>`;
        html += `<div class="ob-cell ob-frozen-2 ob-frozen-clickable ${rowCls}${evenCls}" onclick="openRowEditModal(${ri})">${row.shift}</div>`;
        html += `<div class="ob-cell ob-frozen-3 ob-frozen-clickable ${rowCls}${evenCls}" onclick="openRowEditModal(${ri})">${row.company}</div>`;
        const taskLabel = row.task || '<span class="ob-individual-task">(個別)</span>';
        html += `<div class="ob-cell ob-frozen-4 ob-frozen-clickable ${rowCls}${evenCls}" onclick="openRowEditModal(${ri})">${taskLabel}</div>`;

        // Date cells
        let rowTotalMin = 0; // 確定のみ
        let rowTotalMax = 0; // 全て含む
        for (let d = 1; d <= daysInMonth; d++) {
            const dt = new Date(currentYear, currentMonth - 1, d);
            const dow = dt.getDay();
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cell = cellData[ri] && cellData[ri][d];
            let cls = `ob-cell ob-date-cell ${rowCls}${evenCls}`;
            if (weekendColorsEnabled) {
                if (holidays[dateStr]) cls += ' ob-holiday';
                else if (dow === 0) cls += ' ob-sun';
                else if (dow === 6) cls += ' ob-sat';
            }
            // 信頼度クラス
            if (cell && cell.confidence === 'tentative_high') cls += ' ob-conf-tentative_high';
            else if (cell && cell.confidence === 'tentative_low') cls += ' ob-conf-tentative_low';
            let cellContent = '';
            if (cell) {
                cellContent = `<span class="ob-cell-count">${cell.count}</span>`;
                // 子バッジを小さなテキストで表示
                if (cell.badge && cell.badge.childIds && cell.badge.childIds.length > 0) {
                    const parent = badgeDefinitions.find(p => p.id === cell.badge.parentId);
                    if (parent) {
                        const names = cell.badge.childIds
                            .map(cid => parent.children.find(c => c.id === cid))
                            .filter(Boolean)
                            .map(c => c.name);
                        if (names.length > 0) {
                            cellContent += `<span class="ob-cell-badge-text">${escapeHtml(names.join('・'))}</span>`;
                        }
                    }
                }
            }
            if (cell && !isHidden) {
                rowTotalMax += cell.count;
                dailyTotalsMax[d - 1] += cell.count;
                if (cell.confidence === 'confirmed' || !cell.confidence) {
                    rowTotalMin += cell.count;
                    dailyTotalsMin[d - 1] += cell.count;
                }
            }
            html += `<div class="${cls}" data-ri="${ri}" data-day="${d}" onmouseenter="showTooltip(event,${ri},${d})" onmouseleave="hideTooltip()" onclick="openEditModal(${ri},${d})">${cellContent}</div>`;
        }

        // Row total（最小～最大）
        const rowTotalLabel = rowTotalMax === 0 ? '' : (rowTotalMin === rowTotalMax ? `${rowTotalMax}` : `${rowTotalMin}<span class="ob-total-max">~${rowTotalMax}</span>`);
        html += `<div class="ob-cell ob-total-cell ${rowCls}${evenCls}">${rowTotalLabel}</div>`;
    });

    // === 合計行 ===
    html += '<div class="ob-cell ob-total-row ob-frozen-0"></div>';
    html += '<div class="ob-cell ob-total-row ob-frozen-1"></div>';
    html += '<div class="ob-cell ob-total-row ob-frozen-2"></div>';
    html += '<div class="ob-cell ob-total-row ob-frozen-3"></div>';
    html += '<div class="ob-cell ob-total-row ob-frozen-4" style="justify-content:flex-end;">合計</div>';
    let grandTotalMin = 0;
    let grandTotalMax = 0;
    for (let d = 0; d < daysInMonth; d++) {
        grandTotalMin += dailyTotalsMin[d];
        grandTotalMax += dailyTotalsMax[d];
        const dayLabel = dailyTotalsMax[d] === 0 ? '' : (dailyTotalsMin[d] === dailyTotalsMax[d] ? `${dailyTotalsMax[d]}` : `${dailyTotalsMin[d]}<span class="ob-total-max">~${dailyTotalsMax[d]}</span>`);
        html += `<div class="ob-cell ob-total-row">${dayLabel}</div>`;
    }
    const grandLabel = grandTotalMin === grandTotalMax ? `${grandTotalMax}` : `${grandTotalMin}<span class="ob-total-max">~${grandTotalMax}</span>`;
    html += `<div class="ob-cell ob-total-row ob-grand-total">${grandLabel}</div>`;

    grid.innerHTML = html;
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

function applyFilters() { renderGrid(); }

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
    cellData = generateCellData(); // 【モックアップ専用】本番ではAPIから該当月のデータを取得
    applyAutoConfidence(); // 【モックアップ専用】本番ではサーバーサイドで計算済み
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

    // タイトル: 契約先名 / 親業務名 › 子 › 孫 の連結表示
    const dailyName = cell.dailyTaskName || buildDailyTaskName(row.task, cell.subTasks);
    const titleTask = dailyName
        ? dailyName.replace(/ > /g, ' <span class="ob-tt-arrow">›</span> ')
        : (row.task || '(個別業務)');
    let thtml = `<div class="ob-tt-title">${row.company} / ${titleTask}</div>`;
    thtml += `<div class="ob-tt-row"><span class="ob-tt-label">日付:</span><span class="ob-tt-value">${dateStr}（${row.shift}）</span></div>`;
    thtml += `<div class="ob-tt-row"><span class="ob-tt-label">時間:</span><span class="ob-tt-value">${cell.startTime} - ${cell.endTime}</span></div>`;
    if (cell.supervisor) thtml += `<div class="ob-tt-row"><span class="ob-tt-label">現場監督:</span><span class="ob-tt-value">${cell.supervisor}${cell.supervisorTel ? ' / ' + cell.supervisorTel : ''}</span></div>`;
    if (cell.meetingPlace || cell.meetingTime) thtml += `<div class="ob-tt-row"><span class="ob-tt-label">集合:</span><span class="ob-tt-value">${cell.meetingPlace || ''}${cell.meetingPlace && cell.meetingTime ? ' / ' : ''}${cell.meetingTime || ''}</span></div>`;
    thtml += `<div class="ob-tt-row"><span class="ob-tt-label">人数:</span><span class="ob-tt-value">${cell.count}名</span></div>`;
    const badgeText = getBadgeDisplayText(cell.badge);
    if (badgeText) thtml += `<div class="ob-tt-row"><span class="ob-tt-label">バッジ:</span><span class="ob-tt-value"><span class="ob-tt-badge">${escapeHtml(badgeText)}</span></span></div>`;
    if (cell.mapUrl) thtml += `<div class="ob-tt-row"><span class="ob-tt-label">地図:</span><span class="ob-tt-value ob-tt-map-link">📍 あり</span></div>`;
    if (cell.remarks) thtml += `<div class="ob-tt-row"><span class="ob-tt-label">備考:</span><span class="ob-tt-value">${cell.remarks}</span></div>`;

    const tooltip = document.getElementById('cellTooltip');
    tooltip.innerHTML = thtml;
    tooltip.style.display = 'block';

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

// サブタスクエントリをDOMに描画
function renderSubTaskEntries(subTasks, category) {
    const list = document.getElementById('subTaskList');
    list.innerHTML = '';
    if (!subTasks || subTasks.length === 0) {
        // エントリが無い場合は空表示
        return;
    }
    subTasks.forEach((st, idx) => {
        const entry = document.createElement('div');
        entry.className = 'ob-sub-task-entry';
        entry.dataset.idx = idx;
        entry.innerHTML =
            `<input type="text" class="ob-sub-label-input" value="${escapeHtml(st.label)}" placeholder="項目名" title="項目名を編集" oninput="updateDailyTaskNamePreview()">` +
            `<input type="text" class="ob-sub-value-input" value="${escapeHtml(st.value)}" placeholder="内容を入力" oninput="updateDailyTaskNamePreview()">` +
            `<button type="button" class="ob-btn-remove-sub" onclick="removeSubTaskEntry(${idx})" title="削除">×</button>`;
        list.appendChild(entry);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// サブタスクエントリを追加
function addSubTaskEntry() {
    const list = document.getElementById('subTaskList');
    const currentCount = list.children.length;
    const num = ['①','②','③','④','⑤'][currentCount] || (currentCount + 1);
    const defaultLabel = defaultSubTaskPrefix + num;

    const idx = currentCount;
    const entry = document.createElement('div');
    entry.className = 'ob-sub-task-entry';
    entry.dataset.idx = idx;
    entry.innerHTML =
        `<input type="text" class="ob-sub-label-input" value="${escapeHtml(defaultLabel)}" placeholder="項目名" title="項目名を編集" oninput="updateDailyTaskNamePreview()">` +
        `<input type="text" class="ob-sub-value-input" value="" placeholder="内容を入力" oninput="updateDailyTaskNamePreview()">` +
        `<button type="button" class="ob-btn-remove-sub" onclick="removeSubTaskEntry(${idx})" title="削除">×</button>`;
    list.appendChild(entry);
    // フォーカスを新しいエントリに移動
    entry.querySelector('.ob-sub-value-input').focus();
    updateDailyTaskNamePreview();
}

// サブタスクエントリを削除
function removeSubTaskEntry(idx) {
    const list = document.getElementById('subTaskList');
    const entries = list.querySelectorAll('.ob-sub-task-entry');
    if (entries[idx]) {
        entries[idx].remove();
        // インデックスを再割り当て
        list.querySelectorAll('.ob-sub-task-entry').forEach((entry, i) => {
            entry.dataset.idx = i;
            entry.querySelector('.ob-btn-remove-sub').setAttribute('onclick', `removeSubTaskEntry(${i})`);
        });
    }
    updateDailyTaskNamePreview();
}

// サブタスクエントリからデータを収集
function collectSubTasks() {
    const list = document.getElementById('subTaskList');
    const entries = list.querySelectorAll('.ob-sub-task-entry');
    const subTasks = [];
    entries.forEach(entry => {
        const label = entry.querySelector('.ob-sub-label-input').value.trim();
        const value = entry.querySelector('.ob-sub-value-input').value.trim();
        subTasks.push({ label: label || '項目', value: value });
    });
    return subTasks;
}

// 計画書業務名をリアルタイム更新（読み取り専用表示）
function updateDailyTaskNamePreview() {
    const row = sampleRows[editingRi];
    const parentTask = row ? row.task : '';
    const subTasks = collectSubTasks();
    const autoName = buildDailyTaskName(parentTask, subTasks);
    const el = document.getElementById('editDailyTaskName');
    if (autoName) {
        el.className = 'ob-plan-name-value';
        el.innerHTML = autoName.replace(/ > /g, ' <span class="ob-plan-arrow">›</span> ');
    } else {
        el.className = 'ob-plan-name-value ob-plan-empty';
        el.textContent = '業務詳細を入力すると自動生成されます';
    }
}

// --- 信頼度選択 ---
const confidenceOptions = [
    { value: 'confirmed',      label: '確定' },
    { value: 'tentative_high', label: '予定（高）' },
    { value: 'tentative_low',  label: '予定（低）' },
];
let selectedConfidence = 'confirmed';
let confidenceManualFlag = false; // ユーザーがチップを手動で変更したか

function renderConfidenceChips(value) {
    selectedConfidence = value || 'confirmed';
    const container = document.getElementById('confidenceChips');
    let html = '';
    confidenceOptions.forEach(opt => {
        const active = opt.value === selectedConfidence ? ` ob-conf-active-${opt.value}` : '';
        html += `<button type="button" class="ob-confidence-chip${active}" onclick="selectConfidence('${opt.value}')">${escapeHtml(opt.label)}</button>`;
    });
    container.innerHTML = html;
}

function selectConfidence(value) {
    confidenceManualFlag = true; // ユーザーが手動で選択
    renderConfidenceChips(value);
}

// --- バッジ選択 ---
let selectedParentBadge = null;   // 区分から自動決定される親バッジID
let selectedChildBadges = [];     // 選択中の子バッジID配列
let selectedGrandchildBadges = {}; // { childId: [grandchildId, ...] }

// 区分名 → バッジID マッピング
// 【モックアップ専用】本番環境ではDBのbadge_definitionsから動的に構築
let categoryToBadgeId = {
    '施設':     'facility',
    'イベント': 'event',
    '高速':     'highway',
    '交通':     'traffic',
    '応援交通': 'support-traffic',
};

function renderBadgeSection(category, childIds, grandchildMap) {
    selectedParentBadge = categoryToBadgeId[category] || null;
    selectedChildBadges = childIds ? [...childIds] : [];
    selectedGrandchildBadges = grandchildMap ? JSON.parse(JSON.stringify(grandchildMap)) : {};

    const display = document.getElementById('badgeParentDisplay');
    const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
    if (parent) {
        display.textContent = parent.name;
        display.className = 'ob-badge-parent-display';
    } else {
        display.textContent = category || '-';
        display.className = 'ob-badge-parent-display ob-badge-parent-unknown';
    }

    renderChildBadges();
}

// --- バッジ削除復元用（子・孫共通） ---
let deletedBadgeInfo = null; // { level, parentId, childId?, badge, index, wasSelected, grandchildIds? }
let badgeUndoTimer = null;

// --- バッジスナップショット（モーダルキャンセル時の復元用） ---
let badgeSnapshot = null; // Deep copy of badgeDefinitions at modal open

function renderChildBadges() {
    const container = document.getElementById('badgeChildList');
    const wrapper = document.getElementById('badgeChildSection');
    if (!selectedParentBadge) {
        wrapper.style.display = 'none';
        return;
    }
    const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
    if (!parent || parent.children.length === 0) {
        container.innerHTML = '<span class="ob-badge-empty">バッジなし</span>';
        wrapper.style.display = 'flex';
        return;
    }
    let html = '';
    // 子バッジを横一列に表示
    parent.children.forEach((c, i) => {
        const sel = selectedChildBadges.includes(c.id) ? ' ob-badge-selected' : '';
        html += `<div class="ob-badge-drag-item" draggable="true" data-badge-idx="${i}" data-badge-id="${c.id}" data-badge-level="child">`;
        html += `<span class="ob-badge-drag-grip">☰</span>`;
        html += `<button type="button" class="ob-badge-chip ob-badge-child${sel}" onclick="toggleChildBadge('${c.id}')">${escapeHtml(c.name)}</button>`;
        html += `<button type="button" class="ob-badge-delete-btn" onclick="deleteBadge('child','${c.id}')" title="削除">✕</button>`;
        html += `</div>`;
    });
    // 孫バッジセクション: 選択済み子バッジの下にまとめて表示
    parent.children.forEach(c => {
        if (selectedChildBadges.includes(c.id) && c.children) {
            html += renderGrandchildSection(c);
        }
    });
    container.innerHTML = html;
    wrapper.style.display = 'flex';
    initBadgeDragDrop('child');
    initBadgeDragDrop('grandchild');

    // タッチドラッグ: 子バッジ
    enableTouchDrag(container, '.ob-badge-drag-item:not(.ob-gc-drag-item)', {
        idxAttr: 'data-badge-idx',
        draggingClass: 'ob-badge-dragging',
        overClass: 'ob-badge-drag-over',
        gripSelector: '.ob-badge-drag-grip',
        onReorder(srcIdx, destIdx) {
            const p = badgeDefinitions.find(b => b.id === selectedParentBadge);
            if (!p) return;
            const moved = p.children.splice(srcIdx, 1)[0];
            p.children.splice(destIdx, 0, moved);
            renderChildBadges();
        },
    });
    // タッチドラッグ: 孫バッジ（各子バッジセクションごと）
    container.querySelectorAll('.ob-grandchild-section').forEach(sec => {
        const childId = sec.dataset.childId;
        enableTouchDrag(sec, '.ob-gc-drag-item', {
            idxAttr: 'data-badge-idx',
            draggingClass: 'ob-badge-dragging',
            overClass: 'ob-badge-drag-over',
            gripSelector: '.ob-badge-drag-grip',
            onReorder(srcIdx, destIdx) {
                const p = badgeDefinitions.find(b => b.id === selectedParentBadge);
                if (!p) return;
                const child = p.children.find(c => c.id === childId);
                if (!child || !child.children) return;
                const moved = child.children.splice(srcIdx, 1)[0];
                child.children.splice(destIdx, 0, moved);
                renderChildBadges();
            },
        });
    });
}

function renderGrandchildSection(childBadge) {
    const gcIds = selectedGrandchildBadges[childBadge.id] || [];
    let html = `<div class="ob-grandchild-section" data-child-id="${childBadge.id}">`;
    html += `<div class="ob-grandchild-header">`;
    html += `<span class="ob-grandchild-label">${escapeHtml(childBadge.name)} <span class="ob-grandchild-arrow">›</span> 詳細</span>`;
    html += `<button type="button" class="ob-btn-add-badge ob-btn-add-gc" onclick="addGrandchildBadge('${childBadge.id}')">+ 追加</button>`;
    html += `</div>`;
    if (!childBadge.children || childBadge.children.length === 0) {
        html += `<div class="ob-grandchild-chips"><span class="ob-badge-empty">詳細なし</span></div>`;
    } else {
        html += `<div class="ob-grandchild-chips">`;
        childBadge.children.forEach((gc, gi) => {
            const sel = gcIds.includes(gc.id) ? ' ob-badge-selected' : '';
            html += `<div class="ob-badge-drag-item ob-gc-drag-item" draggable="true" data-badge-idx="${gi}" data-badge-id="${gc.id}" data-badge-level="grandchild" data-parent-child="${childBadge.id}">`;
            html += `<span class="ob-badge-drag-grip">☰</span>`;
            html += `<button type="button" class="ob-badge-chip ob-badge-grandchild${sel}" onclick="toggleGrandchildBadge('${childBadge.id}','${gc.id}')">${escapeHtml(gc.name)}</button>`;
            html += `<button type="button" class="ob-badge-delete-btn" onclick="deleteBadge('grandchild','${gc.id}','${childBadge.id}')" title="削除">✕</button>`;
            html += `</div>`;
        });
        html += `</div>`;
    }
    // 孫バッジ用Undoバー
    html += `<div class="ob-badge-undo-bar ob-gc-undo-bar" id="gcUndoBar_${childBadge.id}" style="display:none;">`;
    html += `<span id="gcUndoMsg_${childBadge.id}"></span>`;
    html += `<button type="button" class="ob-badge-undo-btn" onclick="undoDeleteBadge()">戻す</button>`;
    html += `</div>`;
    html += `</div>`;
    return html;
}

// --- バッジ ドラッグ＆ドロップ（子・孫共通） ---
let badgeDragSrcIdx = null;
let badgeDragLevel = null;
let badgeDragParentChild = null;

function initBadgeDragDrop(level) {
    const selector = level === 'grandchild' ? '.ob-gc-drag-item' : '.ob-badge-drag-item:not(.ob-gc-drag-item)';
    const items = document.querySelectorAll(selector);
    items.forEach(item => {
        item.addEventListener('dragstart', onBadgeDragStart);
        item.addEventListener('dragover', onBadgeDragOver);
        item.addEventListener('drop', onBadgeDrop);
        item.addEventListener('dragend', onBadgeDragEnd);
        item.addEventListener('dragenter', onBadgeDragEnter);
        item.addEventListener('dragleave', onBadgeDragLeave);
    });
}

function onBadgeDragStart(e) {
    badgeDragSrcIdx = parseInt(e.currentTarget.dataset.badgeIdx);
    badgeDragLevel = e.currentTarget.dataset.badgeLevel;
    badgeDragParentChild = e.currentTarget.dataset.parentChild || null;
    e.currentTarget.classList.add('ob-badge-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', badgeDragSrcIdx);
}

function onBadgeDragOver(e) {
    if (e.currentTarget.dataset.badgeLevel !== badgeDragLevel) return;
    if (badgeDragLevel === 'grandchild' && e.currentTarget.dataset.parentChild !== badgeDragParentChild) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function onBadgeDragEnter(e) {
    if (e.currentTarget.dataset.badgeLevel !== badgeDragLevel) return;
    if (badgeDragLevel === 'grandchild' && e.currentTarget.dataset.parentChild !== badgeDragParentChild) return;
    e.currentTarget.classList.add('ob-badge-drag-over');
}

function onBadgeDragLeave(e) {
    e.currentTarget.classList.remove('ob-badge-drag-over');
}

function onBadgeDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('ob-badge-drag-over');
    if (e.currentTarget.dataset.badgeLevel !== badgeDragLevel) return;
    const destIdx = parseInt(e.currentTarget.dataset.badgeIdx);
    if (badgeDragSrcIdx === null || badgeDragSrcIdx === destIdx) return;

    if (badgeDragLevel === 'child') {
        const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
        if (!parent) return;
        const moved = parent.children.splice(badgeDragSrcIdx, 1)[0];
        parent.children.splice(destIdx, 0, moved);
    } else if (badgeDragLevel === 'grandchild') {
        const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
        if (!parent) return;
        const child = parent.children.find(c => c.id === badgeDragParentChild);
        if (!child || !child.children) return;
        const moved = child.children.splice(badgeDragSrcIdx, 1)[0];
        child.children.splice(destIdx, 0, moved);
    }
    renderChildBadges();
}

function onBadgeDragEnd() {
    badgeDragSrcIdx = null;
    badgeDragLevel = null;
    badgeDragParentChild = null;
    document.querySelectorAll('.ob-badge-drag-item').forEach(el => {
        el.classList.remove('ob-badge-dragging', 'ob-badge-drag-over');
    });
}

// --- バッジ削除（子・孫共通） ---
function deleteBadge(level, id, childId) {
    const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
    if (!parent) return;

    if (level === 'child') {
        const idx = parent.children.findIndex(c => c.id === id);
        if (idx < 0) return;
        const badge = parent.children[idx];
        const wasSelected = selectedChildBadges.includes(id);
        const savedGcIds = selectedGrandchildBadges[id] ? [...selectedGrandchildBadges[id]] : [];
        parent.children.splice(idx, 1);
        const selIdx = selectedChildBadges.indexOf(id);
        if (selIdx >= 0) selectedChildBadges.splice(selIdx, 1);
        delete selectedGrandchildBadges[id];
        deletedBadgeInfo = { level: 'child', parentId: selectedParentBadge, badge, index: idx, wasSelected, grandchildIds: savedGcIds };
        renderChildBadges();
        showBadgeUndoBar(badge.name, 'badgeUndoBar');
    } else if (level === 'grandchild') {
        const child = parent.children.find(c => c.id === childId);
        if (!child || !child.children) return;
        const idx = child.children.findIndex(gc => gc.id === id);
        if (idx < 0) return;
        const badge = child.children[idx];
        const gcIds = selectedGrandchildBadges[childId] || [];
        const wasSelected = gcIds.includes(id);
        child.children.splice(idx, 1);
        if (wasSelected) {
            selectedGrandchildBadges[childId] = gcIds.filter(gid => gid !== id);
        }
        deletedBadgeInfo = { level: 'grandchild', parentId: selectedParentBadge, childId, badge, index: idx, wasSelected };
        renderChildBadges();
        showBadgeUndoBar(badge.name, `gcUndoBar_${childId}`);
    }
}

function showBadgeUndoBar(name, barId) {
    // 全Undoバーを非表示
    document.querySelectorAll('.ob-badge-undo-bar').forEach(b => b.style.display = 'none');
    const bar = document.getElementById(barId);
    if (!bar) return;
    const msg = bar.querySelector('span[id$="Msg"], span[id$="Msg_"]') || bar.querySelector('span');
    if (msg) msg.textContent = `「${name}」を削除しました`;
    bar.style.display = 'flex';
    if (badgeUndoTimer) clearTimeout(badgeUndoTimer);
    badgeUndoTimer = setTimeout(() => {
        bar.style.display = 'none';
        deletedBadgeInfo = null;
        badgeUndoTimer = null;
    }, 5000);
}

function undoDeleteBadge() {
    if (!deletedBadgeInfo) return;
    const parent = badgeDefinitions.find(p => p.id === deletedBadgeInfo.parentId);
    if (!parent) return;

    if (deletedBadgeInfo.level === 'child') {
        parent.children.splice(deletedBadgeInfo.index, 0, deletedBadgeInfo.badge);
        if (deletedBadgeInfo.wasSelected) {
            selectedChildBadges.push(deletedBadgeInfo.badge.id);
        }
        if (deletedBadgeInfo.grandchildIds && deletedBadgeInfo.grandchildIds.length > 0) {
            selectedGrandchildBadges[deletedBadgeInfo.badge.id] = deletedBadgeInfo.grandchildIds;
        }
    } else if (deletedBadgeInfo.level === 'grandchild') {
        const child = parent.children.find(c => c.id === deletedBadgeInfo.childId);
        if (child && child.children) {
            child.children.splice(deletedBadgeInfo.index, 0, deletedBadgeInfo.badge);
            if (deletedBadgeInfo.wasSelected) {
                if (!selectedGrandchildBadges[deletedBadgeInfo.childId]) selectedGrandchildBadges[deletedBadgeInfo.childId] = [];
                selectedGrandchildBadges[deletedBadgeInfo.childId].push(deletedBadgeInfo.badge.id);
            }
        }
    }

    document.querySelectorAll('.ob-badge-undo-bar').forEach(b => b.style.display = 'none');
    if (badgeUndoTimer) clearTimeout(badgeUndoTimer);
    badgeUndoTimer = null;
    deletedBadgeInfo = null;
    renderChildBadges();
}

function toggleChildBadge(id) {
    const idx = selectedChildBadges.indexOf(id);
    if (idx >= 0) {
        selectedChildBadges.splice(idx, 1);
    } else {
        selectedChildBadges.push(id);
    }
    renderChildBadges();
}

function toggleGrandchildBadge(childId, gcId) {
    if (!selectedGrandchildBadges[childId]) selectedGrandchildBadges[childId] = [];
    const arr = selectedGrandchildBadges[childId];
    const idx = arr.indexOf(gcId);
    if (idx >= 0) {
        arr.splice(idx, 1);
    } else {
        arr.push(gcId);
    }
    renderChildBadges();
}

function addChildBadge() {
    if (!selectedParentBadge) return;
    const name = prompt('新しい作業内容を入力:');
    if (!name || !name.trim()) return;
    const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
    if (!parent) return;
    const id = generateBadgeId('child');
    parent.children.push({ id, name: name.trim(), children: [] });
    renderChildBadges();
}

function addGrandchildBadge(childId) {
    const parent = badgeDefinitions.find(p => p.id === selectedParentBadge);
    if (!parent) return;
    const child = parent.children.find(c => c.id === childId);
    if (!child) return;
    const name = prompt('新しい詳細項目を入力:');
    if (!name || !name.trim()) return;
    if (!child.children) child.children = [];
    const id = generateBadgeId('gc');
    child.children.push({ id, name: name.trim() });
    renderChildBadges();
}

function getSelectedBadgeData() {
    if (!selectedParentBadge) return null;
    return {
        parentId: selectedParentBadge,
        childIds: [...selectedChildBadges],
        grandchildMap: JSON.parse(JSON.stringify(selectedGrandchildBadges)),
    };
}

function getBadgeDisplayText(badge) {
    if (!badge || !badge.parentId) return '';
    const parent = badgeDefinitions.find(p => p.id === badge.parentId);
    if (!parent) return '';
    let text = parent.name;
    if (badge.childIds && badge.childIds.length > 0) {
        const parts = [];
        badge.childIds.forEach(cid => {
            const child = parent.children.find(c => c.id === cid);
            if (!child) return;
            const gcMap = badge.grandchildMap || {};
            const gcIds = gcMap[cid] || [];
            if (gcIds.length > 0 && child.children) {
                const gcNames = gcIds
                    .map(gid => child.children.find(gc => gc.id === gid))
                    .filter(Boolean)
                    .map(gc => gc.name);
                if (gcNames.length > 0) {
                    parts.push(child.name + ': ' + gcNames.join('・'));
                } else {
                    parts.push(child.name);
                }
            } else {
                parts.push(child.name);
            }
        });
        if (parts.length > 0) text += '（' + parts.join('、') + '）';
    }
    return text;
}

// --- カスタム時間ピッカー（10分刻み） ---
let timePickerTargetId = null;
let timePickerSelectedHour = null;

function openTimePicker(inputId, anchorEl) {
    const dropdown = document.getElementById('timePickerDropdown');
    // 既に同じ入力用に開いている場合は閉じる
    if (timePickerTargetId === inputId && dropdown.style.display !== 'none') {
        closeTimePicker();
        return;
    }
    const input = document.getElementById(inputId);
    const currentVal = input.value || '';
    const parts = currentVal.split(':');
    const currentHour = parts.length >= 2 ? parseInt(parts[0]) : null;
    const currentMin = parts.length >= 2 ? parseInt(parts[1]) : null;

    timePickerTargetId = inputId;
    timePickerSelectedHour = currentHour;

    // 時リスト
    const hoursEl = document.getElementById('timePickerHours');
    let hhtml = '';
    for (let h = 0; h < 24; h++) {
        const sel = h === currentHour ? ' ob-time-selected' : '';
        hhtml += `<div class="ob-time-option${sel}" data-value="${h}" onclick="selectTimeHour(${h})">${String(h).padStart(2, '0')}</div>`;
    }
    hoursEl.innerHTML = hhtml;

    // 分リスト（10分刻み）
    const minsEl = document.getElementById('timePickerMinutes');
    let mhtml = '';
    for (let m = 0; m < 60; m += 10) {
        const sel = m === currentMin ? ' ob-time-selected' : '';
        mhtml += `<div class="ob-time-option${sel}" data-value="${m}" onclick="selectTimeMinute(${m})">${String(m).padStart(2, '0')}</div>`;
    }
    minsEl.innerHTML = mhtml;

    // 位置を計算
    const el = anchorEl || input;
    const rect = el.getBoundingClientRect();
    dropdown.style.display = 'flex';
    const ddRect = dropdown.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 4;
    if (left + ddRect.width > window.innerWidth) left = window.innerWidth - ddRect.width - 8;
    if (top + ddRect.height > window.innerHeight) top = rect.top - ddRect.height - 4;
    dropdown.style.left = left + 'px';
    dropdown.style.top = top + 'px';

    // 現在の時にスクロール
    if (currentHour !== null) {
        const hourOpt = hoursEl.children[currentHour];
        if (hourOpt) hourOpt.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
}

function selectTimeHour(h) {
    timePickerSelectedHour = h;
    document.querySelectorAll('#timePickerHours .ob-time-option').forEach(el => {
        el.classList.toggle('ob-time-selected', parseInt(el.dataset.value) === h);
    });
}

function selectTimeMinute(m) {
    if (timePickerSelectedHour === null) timePickerSelectedHour = 0;
    const input = document.getElementById(timePickerTargetId);
    input.value = `${String(timePickerSelectedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    closeTimePicker();
}

function closeTimePicker() {
    document.getElementById('timePickerDropdown').style.display = 'none';
    timePickerTargetId = null;
    timePickerSelectedHour = null;
}

// 外側クリックで閉じる
document.addEventListener('mousedown', function (e) {
    const dropdown = document.getElementById('timePickerDropdown');
    if (!dropdown || dropdown.style.display === 'none') return;
    if (dropdown.contains(e.target)) return;
    // 時間入力やボタンのクリックはopenTimePickerで処理するのでここでは閉じない
    if (e.target.classList.contains('ob-time-input') || e.target.classList.contains('ob-time-picker-icon')) return;
    closeTimePicker();
});

// --- 現場地図プレビュー ---
function previewMap() {
    const url = document.getElementById('editMapUrl').value.trim();
    if (!url) return;
    const container = document.getElementById('mapPreviewContainer');
    const iframe = document.getElementById('mapPreviewFrame');
    iframe.src = url;
    container.style.display = 'block';
}

function clearMapPreview() {
    const container = document.getElementById('mapPreviewContainer');
    const iframe = document.getElementById('mapPreviewFrame');
    iframe.src = '';
    container.style.display = 'none';
}

// --- 同一業務名の現場監督・連絡先 候補管理 ---
let svCandidateList = [];          // 現在表示中の候補配列
let svDeletedCandidate = null;     // 削除復元用
let svUndoTimer = null;
let svDragSrcIdx = null;           // ドラッグ元インデックス

function getSupervisorCandidates(task) {
    if (!task) return [];
    const seen = new Set();
    const results = [];
    sampleRows.forEach((row, ri) => {
        if (row.task !== task) return;
        const rowCells = cellData[ri];
        if (!rowCells) return;
        Object.values(rowCells).forEach(cell => {
            if (!cell || !cell.supervisor) return;
            const key = cell.supervisor + '||' + (cell.supervisorTel || '');
            if (seen.has(key)) return;
            seen.add(key);
            results.push({ name: cell.supervisor, tel: cell.supervisorTel || '' });
        });
    });
    return results;
}

function renderSupervisorCandidates(task) {
    const container = document.getElementById('supervisorCandidates');
    const chipsEl = document.getElementById('supervisorCandidateChips');
    svCandidateList = getSupervisorCandidates(task);
    if (svCandidateList.length === 0) {
        container.style.display = 'none';
        return;
    }
    renderSvChips();
    container.style.display = 'flex';
}

function renderSvChips() {
    const chipsEl = document.getElementById('supervisorCandidateChips');
    let html = '';
    svCandidateList.forEach((c, i) => {
        const label = c.tel ? `${escapeHtml(c.name)} / ${escapeHtml(c.tel)}` : escapeHtml(c.name);
        html += `<div class="ob-sv-drag-item" draggable="true" data-sv-idx="${i}">`;
        html += `<span class="ob-sv-drag-grip">☰</span>`;
        html += `<button type="button" class="ob-supervisor-chip" onclick="selectSupervisorCandidate(${i})">${label}</button>`;
        html += `<button type="button" class="ob-sv-delete-btn" onclick="deleteSupervisorCandidate(${i})" title="削除">✕</button>`;
        html += `</div>`;
    });
    chipsEl.innerHTML = html;
    initSvDragDrop();
}

function selectSupervisorCandidate(idx) {
    if (!svCandidateList[idx]) return;
    document.getElementById('editSupervisor').value = svCandidateList[idx].name;
    document.getElementById('editSupervisorTel').value = svCandidateList[idx].tel;
}

// --- 候補削除 & Undo ---
function deleteSupervisorCandidate(idx) {
    const removed = svCandidateList.splice(idx, 1)[0];
    if (!removed) return;
    svDeletedCandidate = { candidate: removed, index: idx };
    renderSvChips();
    showSvUndoBar(removed.name);
    if (svCandidateList.length === 0) {
        document.getElementById('supervisorCandidates').style.display = 'none';
    }
}

function showSvUndoBar(name) {
    const bar = document.getElementById('svUndoBar');
    document.getElementById('svUndoMsg').textContent = `「${name}」を削除しました`;
    bar.style.display = 'flex';
    if (svUndoTimer) clearTimeout(svUndoTimer);
    svUndoTimer = setTimeout(() => {
        bar.style.display = 'none';
        svDeletedCandidate = null;
        svUndoTimer = null;
    }, 5000);
}

function undoDeleteSupervisor() {
    if (!svDeletedCandidate) return;
    svCandidateList.splice(svDeletedCandidate.index, 0, svDeletedCandidate.candidate);
    svDeletedCandidate = null;
    if (svUndoTimer) { clearTimeout(svUndoTimer); svUndoTimer = null; }
    document.getElementById('svUndoBar').style.display = 'none';
    document.getElementById('supervisorCandidates').style.display = 'flex';
    renderSvChips();
}

// --- 候補ドラッグ&ドロップ ---
function initSvDragDrop() {
    const chipsEl = document.getElementById('supervisorCandidateChips');
    document.querySelectorAll('.ob-sv-drag-item').forEach(item => {
        item.addEventListener('dragstart', onSvDragStart);
        item.addEventListener('dragover', onSvDragOver);
        item.addEventListener('drop', onSvDrop);
        item.addEventListener('dragend', onSvDragEnd);
        item.addEventListener('dragenter', e => e.currentTarget.classList.add('ob-sv-drag-over'));
        item.addEventListener('dragleave', e => e.currentTarget.classList.remove('ob-sv-drag-over'));
    });
    // タッチドラッグ対応
    enableTouchDrag(chipsEl, '.ob-sv-drag-item', {
        idxAttr: 'data-sv-idx',
        draggingClass: 'ob-sv-dragging',
        overClass: 'ob-sv-drag-over',
        gripSelector: '.ob-sv-drag-grip',
        onReorder(srcIdx, destIdx) {
            const moved = svCandidateList.splice(srcIdx, 1)[0];
            svCandidateList.splice(destIdx, 0, moved);
            renderSvChips();
        },
    });
}

function onSvDragStart(e) {
    svDragSrcIdx = parseInt(e.currentTarget.dataset.svIdx);
    e.currentTarget.classList.add('ob-sv-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', svDragSrcIdx);
}

function onSvDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function onSvDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('ob-sv-drag-over');
    const destIdx = parseInt(e.currentTarget.dataset.svIdx);
    if (svDragSrcIdx === null || svDragSrcIdx === destIdx) return;
    const moved = svCandidateList.splice(svDragSrcIdx, 1)[0];
    svCandidateList.splice(destIdx, 0, moved);
    renderSvChips();
}

function onSvDragEnd() {
    svDragSrcIdx = null;
    document.querySelectorAll('.ob-sv-drag-item').forEach(el => {
        el.classList.remove('ob-sv-dragging', 'ob-sv-drag-over');
    });
}

function openEditModal(ri, day) {
    editingRi = ri;
    editingDay = day;
    // バッジ定義のスナップショット保存（キャンセル時復元用）
    badgeSnapshot = JSON.parse(JSON.stringify(badgeDefinitions));
    const row = sampleRows[ri];
    const cell = cellData[ri] && cellData[ri][day];
    const dateStr = `${currentYear}年${currentMonth}月${day}日`;

    const taskDisplay = row.task || '(個別業務)';
    document.getElementById('editModalTitle').textContent = `セル編集 - ${dateStr}`;
    document.getElementById('editModalInfo').innerHTML =
        `<strong>${row.company}</strong> / ${taskDisplay}<br>` +
        `${row.branch} | ${row.category} | ${row.shift}勤`;

    document.getElementById('editCount').value = cell ? cell.count : '';
    confidenceManualFlag = cell ? (cell.confidenceManual || false) : false;
    renderConfidenceChips(cell ? (cell.confidence || 'confirmed') : 'confirmed');
    document.getElementById('editStartTime').value = cell ? cell.startTime : '';
    document.getElementById('editEndTime').value = cell ? cell.endTime : '';
    document.getElementById('editSupervisor').value = cell ? (cell.supervisor || '') : '';
    document.getElementById('editSupervisorTel').value = cell ? (cell.supervisorTel || '') : '';
    document.getElementById('editMeetingPlace').value = cell ? (cell.meetingPlace || '') : '';
    document.getElementById('editMeetingTime').value = cell ? (cell.meetingTime || '') : '';
    document.getElementById('editMapUrl').value = cell ? (cell.mapUrl || '') : '';
    document.getElementById('editRemarks').value = cell ? cell.remarks : '';

    // 地図プレビューをリセット（URLがあれば自動表示）
    const mapUrl = cell ? (cell.mapUrl || '') : '';
    if (mapUrl) {
        document.getElementById('mapPreviewFrame').src = mapUrl;
        document.getElementById('mapPreviewContainer').style.display = 'block';
    } else {
        clearMapPreview();
    }

    // 動的サブタスクエントリを描画
    const subTasks = cell ? (cell.subTasks || []) : [];
    renderSubTaskEntries(subTasks, row.category);

    // 計画書業務名（読み取り専用：リアルタイム自動生成）
    updateDailyTaskNamePreview();

    // バッジ選択を復元（親バッジは区分から自動決定）
    const badge = cell ? (cell.badge || null) : null;
    renderBadgeSection(row.category, badge ? badge.childIds : [], badge ? (badge.grandchildMap || {}) : {});

    // 同一業務名の現場監督・連絡先候補を表示
    renderSupervisorCandidates(row.task);

    document.getElementById('editModalOverlay').style.display = 'flex';
}

function closeEditModal(e) {
    if (e && e.target !== e.currentTarget) return;
    // キャンセル時：バッジ定義をスナップショットから復元
    if (badgeSnapshot) {
        badgeDefinitions.length = 0;
        badgeSnapshot.forEach(b => badgeDefinitions.push(b));
        badgeSnapshot = null;
    }
    closeTimePicker();
    document.getElementById('editModalOverlay').style.display = 'none';
}

function saveEdit() {
    pushUndo();
    // 保存時：バッジ変更を確定（スナップショット破棄）
    badgeSnapshot = null;
    const count = parseInt(document.getElementById('editCount').value) || 0;
    if (!cellData[editingRi]) cellData[editingRi] = {};

    if (count === 0) {
        delete cellData[editingRi][editingDay];
    } else {
        const subTasks = collectSubTasks();
        const row = sampleRows[editingRi];
        cellData[editingRi][editingDay] = {
            count: count,
            confidence: selectedConfidence,
            confidenceManual: confidenceManualFlag,
            subTasks: subTasks,
            dailyTaskName: buildDailyTaskName(row.task, subTasks),
            startTime: document.getElementById('editStartTime').value,
            endTime: document.getElementById('editEndTime').value,
            supervisor: document.getElementById('editSupervisor').value,
            supervisorTel: document.getElementById('editSupervisorTel').value,
            meetingPlace: document.getElementById('editMeetingPlace').value,
            meetingTime: document.getElementById('editMeetingTime').value,
            mapUrl: document.getElementById('editMapUrl').value.trim(),
            badge: getSelectedBadgeData(),
            remarks: document.getElementById('editRemarks').value,
        };
    }
    closeEditModal();
    applyAutoConfidence();
    renderGrid();
}

function deleteCell() {
    if (editingRi === null || editingDay === null) return;
    pushUndo();
    badgeSnapshot = null; // セル削除時もバッジ変更を確定
    if (cellData[editingRi]) {
        delete cellData[editingRi][editingDay];
    }
    closeEditModal();
    renderGrid();
}

// --- 行情報編集モーダル ---
let editingRowRi = null;
let rowEditSelected = { branch: null, category: null, shift: null };

// 会社リスト（グローバル）
// 【モックアップ専用】本番環境ではDBのcompaniesテーブルから取得
const branchList = ['東央警備', 'Nikkeiホールディングス', '全日本エンタープライズ'];
// 昼夜リスト
// 【モックアップ専用】本番環境ではDBのshift_typesマスタから取得
const shiftList = ['昼', '夜'];

// 区分リストはbadgeDefinitionsから動的に取得
function getCategoryList() {
    return badgeDefinitions.map(b => b.name);
}

function renderRowChips(containerId, items, selectedValue, groupKey) {
    const container = document.getElementById(containerId);
    let html = '';
    items.forEach(item => {
        const active = item === selectedValue ? ' ob-chip-active' : '';
        html += `<button type="button" class="ob-row-chip${active}" onclick="selectRowChip('${groupKey}', '${escapeHtml(item)}')">${escapeHtml(item)}</button>`;
    });
    container.innerHTML = html;
}

function selectRowChip(groupKey, value) {
    rowEditSelected[groupKey] = value;
    // 対応するチップコンテナを再描画
    if (groupKey === 'branch') renderRowChips('rowEditBranchChips', branchList, value, 'branch');
    else if (groupKey === 'category') renderRowChips('rowEditCategoryChips', getCategoryList(), value, 'category');
    else if (groupKey === 'shift') renderRowChips('rowEditShiftChips', shiftList, value, 'shift');
}

function addRowCategory() {
    const name = prompt('新しい区分名を入力:');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    // 既存チェック
    if (getCategoryList().includes(trimmed)) {
        alert('この区分は既に存在します。');
        return;
    }

    // badgeDefinitionsに追加（子バッジなし）
    const badgeId = 'custom-cat-' + (badgeNextId++);
    badgeDefinitions.push({ id: badgeId, name: trimmed, children: [] });
    categoryToBadgeId[trimmed] = badgeId;

    // 新しい区分を選択状態にして再描画
    rowEditSelected.category = trimmed;
    renderRowChips('rowEditCategoryChips', getCategoryList(), trimmed, 'category');
}

function addNewRow() {
    editingRowRi = -1; // 新規行モード
    document.getElementById('rowEditModalTitle').textContent = '新規行追加';

    // チップ選択を空に初期化
    rowEditSelected.branch = null;
    rowEditSelected.category = null;
    rowEditSelected.shift = null;
    renderRowChips('rowEditBranchChips', branchList, null, 'branch');
    renderRowChips('rowEditCategoryChips', getCategoryList(), null, 'category');
    renderRowChips('rowEditShiftChips', shiftList, null, 'shift');

    document.getElementById('rowEditCompany').value = '';
    document.getElementById('rowEditTask').value = '';
    document.getElementById('rowEditModalOverlay').style.display = 'flex';
}

function openRowEditModal(ri) {
    editingRowRi = ri;
    const row = sampleRows[ri];
    document.getElementById('rowEditModalTitle').textContent = `行情報編集 - ${row.company || '(未設定)'}`;

    // チップ選択を初期化
    rowEditSelected.branch = row.branch;
    rowEditSelected.category = row.category;
    rowEditSelected.shift = row.shift;
    renderRowChips('rowEditBranchChips', branchList, row.branch, 'branch');
    renderRowChips('rowEditCategoryChips', getCategoryList(), row.category, 'category');
    renderRowChips('rowEditShiftChips', shiftList, row.shift, 'shift');

    document.getElementById('rowEditCompany').value = row.company;
    document.getElementById('rowEditTask').value = row.task;
    document.getElementById('rowEditModalOverlay').style.display = 'flex';
}

function closeRowEditModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('rowEditModalOverlay').style.display = 'none';
}

function saveRowEdit() {
    if (editingRowRi === null) return;
    pushUndo();

    // 新規行モード
    if (editingRowRi === -1) {
        const branch = rowEditSelected.branch || branchList[0];
        const category = rowEditSelected.category || getCategoryList()[0] || '';
        const shift = rowEditSelected.shift || '昼';
        const company = document.getElementById('rowEditCompany').value || '';
        const task = document.getElementById('rowEditTask').value || '';

        sampleRows.push({ branch, category, shift, company, task, hidden: false });
        closeRowEditModal();
        renderGrid();
        return;
    }

    const row = sampleRows[editingRowRi];
    const oldCategory = row.category;
    row.branch = rowEditSelected.branch || row.branch;
    row.category = rowEditSelected.category || row.category;
    row.shift = rowEditSelected.shift || row.shift;
    row.company = document.getElementById('rowEditCompany').value;
    row.task = document.getElementById('rowEditTask').value;

    // 区分が変わった場合、セルのバッジ親IDを更新
    if (row.category !== oldCategory) {
        const newBadgeId = categoryToBadgeId[row.category] || null;
        const rowCells = cellData[editingRowRi];
        if (rowCells) {
            Object.keys(rowCells).forEach(day => {
                const cell = rowCells[day];
                if (cell && cell.badge) {
                    cell.badge.parentId = newBadgeId;
                    cell.badge.childIds = []; // 親が変わったので子バッジをリセット
                    cell.badge.grandchildMap = {};
                }
            });
        }
    }

    // dailyTaskName を再生成（業務名変更時）
    const rowCells = cellData[editingRowRi];
    if (rowCells) {
        Object.keys(rowCells).forEach(day => {
            const cell = rowCells[day];
            if (cell) {
                cell.dailyTaskName = buildDailyTaskName(row.task, cell.subTasks);
            }
        });
    }

    closeRowEditModal();
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

    // li要素にdata-sort-idxを付与（タッチドラッグ用）
    [...list.children].forEach((li, i) => li.setAttribute('data-sort-idx', i));

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

    // タッチドラッグ対応
    enableTouchDrag(list, 'li', {
        idxAttr: 'data-sort-idx',
        draggingClass: 'ob-touch-dragging',
        overClass: 'drag-over',
        gripSelector: '.ob-sort-grip',
        onReorder(srcIdx, destIdx) {
            const items = [...list.children];
            const srcItem = items[srcIdx];
            const destItem = items[destIdx];
            if (!srcItem || !destItem) return;
            if (srcIdx < destIdx) destItem.after(srcItem);
            else destItem.before(srcItem);
            // インデックスを再付与
            [...list.children].forEach((li, i) => li.setAttribute('data-sort-idx', i));
        },
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

    cellData = generateCellData(); // 【モックアップ専用】本番ではソート後にAPIから再取得
    closeSortModal();
    renderGrid();
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // 【検証用】本日の日付をヘッダーに表示（信頼度の自動確定を確認するため）
    // 本番環境では不要、または別の方式で実装
    const now = new Date();
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const todayEl = document.getElementById('todayLabel');
    if (todayEl) {
        todayEl.textContent = `本日: ${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}（${dayNames[now.getDay()]}）`;
    }
    renderGrid();
});
