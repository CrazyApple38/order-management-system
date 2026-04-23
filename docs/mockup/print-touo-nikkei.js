/* ============================================================================
   print-touo-nikkei.js — 業務管理計画書プリント書式（東央警備 & Nikkei）
   ----------------------------------------------------------------------------
   - screen-layout.html のグリッドテーブルから行データを抽出
   - 東央警備 + Nikkei + 固定3行（会社・休み・休み申請あり）のみを印刷
   - カテゴリ別グルーピング + 縦書きラベル
   - 印刷ヘッダー固定値: 当番=片岡 / 電話当番=渋谷・正木
   ============================================================================ */

(function() {
    'use strict';

    // ---------- カテゴリ → 縦書きラベル ----------
    const CATEGORY_LABEL = {
        'category-highway':         '高速',
        'category-facility':        '施設',
        'category-event':           'イベント',
        'category-traffic':         '交通',
        'category-support-event':   '応援',
        'category-support-traffic': '応援',
        'category-support-highway': '応援',
        'category-training':        '研修',
        'category-company':         '会社'
    };

    const ASSIGN_SLOTS = 8; // 配置社員氏名セル数（1段あたり）

    // ---------- 社員 GC マッピング ----------
    function getEmployeeGc(name) {
        if (typeof employeesData === 'undefined') return null;
        const emp = employeesData.find(e => e.name === name);
        return emp ? emp.company : null;
    }

    // ---------- 日付/ヘッダ情報 ----------
    function getSheetHeaderInfo() {
        const dateEl = document.querySelector('.date-display');
        let dateText = '';
        let weekday = '';
        if (dateEl) {
            const wd = dateEl.querySelector('.weekday');
            weekday = wd ? wd.textContent.trim() : '';
            dateText = dateEl.childNodes[0] && dateEl.childNodes[0].nodeType === Node.TEXT_NODE
                ? dateEl.childNodes[0].textContent.trim()
                : dateEl.textContent.replace(weekday, '').trim();
        }
        return {
            title: '業務管理計画書',
            date: dateText || '',
            weekday: weekday || '',
            attendant: '片岡',
            phoneDuty: '渋谷・正木'
        };
    }

    // ---------- 行データ抽出 ----------
    function extractRowData(tr) {
        // 通常データ行: gc-row-touo / gc-row-nikkei
        const isFixed = tr.dataset.fixed === 'true';
        const isTouo  = tr.classList.contains('md-gc-row-touo');
        const isNikkei = tr.classList.contains('md-gc-row-nikkei');
        const isZennihon = tr.classList.contains('md-gc-row-zennihon');
        if (!isFixed && !isTouo && !isNikkei) return null; // zennihon等は除外

        const siteInfoCell = tr.querySelector('.col-site-info');

        // カテゴリ検出 (class="category-xxx" を含む)
        let categoryClass = null;
        if (siteInfoCell) {
            const catEl = siteInfoCell.querySelector('.category-badge');
            if (catEl) {
                for (const cls of catEl.classList) {
                    if (cls.startsWith('category-') && cls !== 'category-badge') { categoryClass = cls; break; }
                }
            }
        }

        // 契約先・業務名
        let company = '', taskName = '';
        if (isFixed) {
            const labelEl = tr.querySelector('.md-row-fixed-label');
            company = labelEl ? labelEl.textContent.trim() : '';
        } else if (siteInfoCell) {
            const c = siteInfoCell.querySelector('.company');
            const s = siteInfoCell.querySelector('.site-name');
            company = c ? c.textContent.trim() : '';
            taskName = s ? s.textContent.trim() : '';
        }

        // 集合: 時刻 + 連絡方法
        const meetCell = tr.querySelector('td.clickable-cell[onclick*="openMeetingModal"]');
        let meetTime = '', meetContact = '', meetContactClass = '';
        if (meetCell) {
            const td = meetCell.querySelector('.time-display');
            const cb = meetCell.querySelector('.contact-badge');
            meetTime = td ? td.textContent.trim() : '';
            if (cb) {
                meetContact = cb.textContent.trim();
                const kindCls = Array.from(cb.classList).find(c => c.startsWith('contact-') && c !== 'contact-badge');
                meetContactClass = kindCls || '';
            }
        }

        // 業務時間 (data-start-time / data-end-time)
        const wtCell = tr.querySelector('.col-work-time');
        let wtStart = '', wtEnd = '';
        if (wtCell) {
            wtStart = wtCell.dataset.startTime || (wtCell.querySelector('.work-time-start')?.textContent.trim() || '');
            wtEnd   = wtCell.dataset.endTime   || (wtCell.querySelector('.work-time-end')?.textContent.trim() || '');
        }

        // 人数
        const countEl = tr.querySelector('.count-display');
        const countText = countEl ? countEl.textContent.trim() : '';

        // 配置社員
        const assigned = [];
        tr.querySelectorAll('.assignment-zone .assigned-employee').forEach(aEl => {
            const block = aEl.querySelector('.employee-name-block');
            if (!block) return;
            // 名前: employee-with-continuous 内の span、なければ直下の最初の span
            let nameEl = block.querySelector('.employee-with-continuous > span:not(.continuous-badge)');
            if (!nameEl) {
                nameEl = Array.from(block.children).find(n =>
                    n.tagName === 'SPAN' && !n.classList.contains('contact-badge') && !n.classList.contains('employee-with-continuous')
                );
            }
            const name = nameEl ? nameEl.textContent.trim() : '';
            // 連絡方法バッジ
            const cb = block.querySelector('.contact-badge');
            let contactText = '', contactClass = '';
            if (cb) {
                contactText = cb.textContent.trim();
                contactClass = Array.from(cb.classList).find(c => c.startsWith('contact-') && c !== 'contact-badge') || '';
            }
            // 連勤マーク（▼ 上下）
            const continuousAbove = !!block.querySelector('.continuous-badge-above');
            const continuousBelow = !!block.querySelector('.continuous-badge-below');
            // 休み申請あり社員（配置済み）
            const isOnLeave = aEl.classList.contains('sl-on-leave');
            assigned.push({
                name, contactText, contactClass,
                continuousAbove, continuousBelow, isOnLeave,
                gc: getEmployeeGc(name)
            });
        });
        // 休（申請あり）固定行: sl-holiday-chip からも抽出
        if (isFixed && tr.classList.contains('md-row-fixed-off-approved')) {
            tr.querySelectorAll('.assignment-zone .sl-holiday-chip').forEach(chip => {
                const name = chip.dataset.empName
                    || (chip.querySelector('span:not(.sl-holiday-assign-info)')?.textContent.trim() || '');
                if (!name) return;
                const infoEl = chip.querySelector('.sl-holiday-assign-info');
                const holidayAssignInfo = infoEl ? infoEl.textContent.trim() : '';
                const isHolidayAssigned = chip.classList.contains('sl-holiday-assigned');
                assigned.push({
                    name, contactText: '', contactClass: '',
                    continuousAbove: false, continuousBelow: false,
                    isOnLeave: true, isHolidayChip: true,
                    isHolidayAssigned, holidayAssignInfo,
                    gc: getEmployeeGc(name)
                });
            });
        }

        // 備考（車両プレート + ETC プレート + notes テキスト合成）
        const vehiclePlates = [];
        tr.querySelectorAll('.col-vt .vehicle-drop-zone .vehicle-tag').forEach(v => {
            const clone = v.cloneNode(true);
            clone.querySelectorAll('button').forEach(b => b.remove());
            vehiclePlates.push(clone.textContent.trim());
        });
        const etcPlates = [];
        tr.querySelectorAll('.col-vt .etc-drop-zone .etc-tag').forEach(e => {
            const clone = e.cloneNode(true);
            clone.querySelectorAll('button').forEach(b => b.remove());
            etcPlates.push(clone.textContent.trim());
        });
        // 備考セルに載せる notes 項目（備考 / 集合場所 / 送迎 を対象）
        const NOTES_INCLUDE = ['備考', '集合場所', '送迎'];
        const notesParts = [];
        const notesCell = tr.querySelector('.col-notes');
        if (notesCell && notesCell.dataset.vtItems) {
            try {
                const items = JSON.parse(notesCell.dataset.vtItems);
                items.forEach(it => {
                    if (!it.value) return;
                    if (NOTES_INCLUDE.includes(it.label)) {
                        notesParts.push({ label: it.label, value: it.value });
                    }
                });
            } catch (_) {}
        }
        // 備考セルを構造化: 車両プレート / ETCプレート / 備考テキスト行を別要素にして、
        // 間に点線の区切り線を描画できるようにする。
        const remarksParts = [];
        if (vehiclePlates.length) {
            remarksParts.push(`<div class="pr-remarks-vehicles">${esc(vehiclePlates.join(' / '))}</div>`);
        }
        if (etcPlates.length) {
            remarksParts.push(`<div class="pr-remarks-etc">${esc(etcPlates.join(' / '))}</div>`);
        }
        notesParts.forEach(n => {
            // 「備考」はラベルを省略、その他（集合場所 / 送迎）は項目名を前置
            if (n.label === '備考') {
                remarksParts.push(`<div class="pr-remarks-notes">${esc(n.value)}</div>`);
            } else {
                remarksParts.push(`<div class="pr-remarks-notes"><span class="pr-remarks-label">${esc(n.label)}</span>${esc(n.value)}</div>`);
            }
        });
        const remarksHtml = remarksParts.join('');

        return {
            isFixed,
            fixedKind: isFixed ? (tr.classList.contains('md-row-fixed-off-approved') ? 'off-approved'
                                : tr.classList.contains('md-row-fixed-off-unapproved') ? 'off-unapproved'
                                : 'company') : null,
            gc: isTouo ? 'touo' : (isNikkei ? 'nikkei' : null),
            categoryClass,
            company,
            taskName,
            meetTime,
            meetContact,
            meetContactClass,
            wtStart,
            wtEnd,
            count: countText,
            assigned,
            remarksHtml
        };
    }

    // 「休み（申請なし）」行に入れる未配置社員を算出する。
    // 対象: 東央警備 + Nikkei の社員のうち、
    //   - どの通常現場にも配置されていない
    //   - 休み申請（isOnLeave）も出していない
    function collectUnassignedEmployees(rows) {
        if (typeof employeesData === 'undefined') return [];
        const assignedNames = new Set();
        rows.forEach(r => {
            if (r.isFixed) return;
            (r.assigned || []).forEach(a => { if (a.name) assignedNames.add(a.name); });
        });
        const result = [];
        employeesData.forEach(emp => {
            if (emp.company !== 'touo' && emp.company !== 'nikkei') return;
            if (emp.isOnLeave) return;
            if (assignedNames.has(emp.name)) return;
            result.push({
                name: emp.name,
                contactText: '', contactClass: '',
                continuousAbove: false, continuousBelow: false,
                isOnLeave: false,
                gc: emp.company
            });
        });
        return result;
    }

    function extractAllRows() {
        const rows = [];
        document.querySelectorAll('.grid-table tbody tr').forEach(tr => {
            // GCフィルタ非表示行はスキップ（画面に出ていない行は印刷対象外）
            if (tr.style.display === 'none') return;
            const data = extractRowData(tr);
            if (data) rows.push(data);
        });
        // 休み（申請なし）行に未配置社員を自動注入（手動配置がある場合は上書きしない）
        const unassigned = collectUnassignedEmployees(rows);
        if (unassigned.length) {
            rows.forEach(r => {
                if (r.isFixed && r.fixedKind === 'off-unapproved' && r.assigned.length === 0) {
                    r.assigned = unassigned;
                }
            });
        }
        return rows;
    }

    // ---------- カテゴリ別グルーピング (連続する同カテゴリを1ブロック化) ----------
    function groupByCategory(rows) {
        const groups = [];
        let current = null;
        rows.forEach(r => {
            // 固定行はカテゴリラベルなし（独立グループ）
            if (r.isFixed) {
                groups.push({ label: null, categoryClass: null, rows: [r], isFixed: true });
                current = null;
                return;
            }
            const key = r.categoryClass || '__none__';
            if (current && current._key === key) {
                current.rows.push(r);
            } else {
                current = {
                    _key: key,
                    label: CATEGORY_LABEL[r.categoryClass] || '',
                    categoryClass: r.categoryClass,
                    rows: [r],
                    isFixed: false
                };
                groups.push(current);
            }
        });
        return groups;
    }

    // ---------- セル描画ヘルパ ----------
    function esc(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[c]);
    }

    function renderAssignCells(assigned, isFixed) {
        // 配置人数が ASSIGN_SLOTS(8) を超えた場合は段数を増やし、
        // 各セルは通常サイズを保ったまま 2 段目以降に折り返す。
        const rows = Math.max(1, Math.ceil(assigned.length / ASSIGN_SLOTS));
        const totalSlots = rows * ASSIGN_SLOTS;
        const gridCls = rows > 1 ? 'pr-assign-grid pr-assign-grid--multi' : 'pr-assign-grid';
        let html = `<div class="${gridCls}">`;
        for (let i = 0; i < totalSlots; i++) {
            const a = assigned[i];
            if (a && a.name) {
                const gcCls = a.gc === 'nikkei' ? 'pr-gc-nikkei'
                            : a.gc === 'touo' ? 'pr-gc-touo'
                            : a.gc === 'zennihon' ? 'pr-gc-zennihon'
                            : '';
                const leaveCls = a.isOnLeave ? ' pr-on-leave' : '';
                const holidayChipCls = a.isHolidayChip ? ' pr-holiday-chip' : '';
                const holidayAssignedCls = a.isHolidayAssigned ? ' pr-holiday-assigned' : '';
                html += `<div class="pr-assign-cell ${gcCls}${leaveCls}${holidayChipCls}${holidayAssignedCls}">`;
                // 連勤マーク（▼ 上）
                if (a.continuousAbove) html += `<span class="continuous-badge continuous-above">▼</span>`;
                // 名前（文字数に応じて縮小クラスを付与。セル幅を揃えるため）
                const nameLen = Math.min(6, Math.max(1, (a.name || '').length));
                html += `<span class="pr-name pr-name-len-${nameLen}">${esc(a.name)}</span>`;
                // 休 サブバッジ（名前の下に独立表示）
                if (a.isOnLeave && !a.isHolidayChip) html += `<span class="sl-holiday-sub">休</span>`;
                // 連勤マーク（▼ 下）
                if (a.continuousBelow) html += `<span class="continuous-badge continuous-below">▼</span>`;
                // 連絡方法バッジ
                if (a.contactText) {
                    const ck = a.contactClass ? ' ' + esc(a.contactClass) : '';
                    html += `<span class="contact-badge${ck}">${esc(a.contactText)}</span>`;
                }
                // 休（申請あり）行のチップ: 配置先情報
                if (a.holidayAssignInfo) {
                    html += `<span class="pr-holiday-info">${esc(a.holidayAssignInfo)}</span>`;
                }
                // 事務員の手書きチェック欄（印刷後に運用で使用）
                html += `<div class="pr-assign-check"></div>`;
                html += `</div>`;
            } else {
                html += `<div class="pr-assign-cell pr-assign-empty"><div class="pr-assign-check"></div></div>`;
            }
        }
        html += '</div>';
        return html;
    }

    function rowClassFor(r) {
        if (r.isFixed) {
            return r.fixedKind === 'off-approved' ? 'pr-row-off-approved' : 'pr-row-fixed';
        }
        return r.gc === 'nikkei' ? 'pr-row-nikkei' : 'pr-row-touo';
    }

    function renderRow(r, includeLabelCell, labelCellHtml) {
        const rowCls = rowClassFor(r);
        let html = `<tr class="${rowCls}">`;
        if (includeLabelCell) html += labelCellHtml;

        // 契約先 (会社 + 業務名)
        html += `<td class="pr-col-client">`;
        if (r.company) html += `<div class="pr-client-company">${esc(r.company)}</div>`;
        if (r.taskName) html += `<div class="pr-client-task">${esc(r.taskName)}</div>`;
        html += `</td>`;

        // 集合・出発
        html += `<td class="pr-meet-cell">`;
        if (r.meetTime) html += `<span class="pr-meet-time">${esc(r.meetTime)}</span>`;
        if (r.meetContact) {
            const kindCls = r.meetContactClass ? ' ' + esc(r.meetContactClass) : '';
            html += `<span class="pr-meet-contact contact-badge${kindCls}">${esc(r.meetContact)}</span>`;
        }
        html += `</td>`;

        // 業務時間
        html += `<td class="pr-worktime-cell">`;
        if (r.wtStart) html += `<span class="pr-wt-start">${esc(r.wtStart)}</span>`;
        if (r.wtEnd) html += `<span class="pr-wt-end">${esc(r.wtEnd)}</span>`;
        html += `</td>`;

        // 人数 (n/m 表記のうち右側 m を採用。count-display は "2/2" 形式)
        html += `<td class="pr-count-cell">`;
        if (r.count) {
            const m = r.count.match(/(\d+)\s*\/\s*(\d+)/);
            html += `<div class="pr-count-num">${esc(m ? m[2] : r.count)}</div>`;
        }
        html += `</td>`;

        // 配置社員
        html += `<td class="pr-col-assign" style="padding:0;">${renderAssignCells(r.assigned, r.isFixed)}</td>`;

        // 備考（構造化済み HTML をそのまま差し込む。内部テキストは extractRowData 側で esc 済み）
        html += `<td class="pr-remarks-cell">${r.remarksHtml || ''}</td>`;

        // 日報
        html += `<td class="pr-report-cell"></td>`;

        html += `</tr>`;
        return html;
    }

    function renderSheet() {
        const header = getSheetHeaderInfo();
        const rows = extractAllRows();
        const groups = groupByCategory(rows);

        let html = '';
        // === シートヘッダー ===
        html += `<div class="pr-sheet">`;
        html += `<div class="pr-header">`;
        html += `<div class="pr-header-left"></div>`;
        html += `<div class="pr-header-center">`;
        html += `<span class="pr-header-title">${esc(header.title)}</span>`;
        html += `<span class="pr-header-date">${esc(header.date)}</span>`;
        html += `<span class="pr-header-weekday">${esc(header.weekday)}</span>`;
        html += `</div>`;
        html += `<div class="pr-header-right">`;
        html += `<div class="pr-header-field"><span class="pr-header-field-label">当番</span><span class="pr-header-field-value">${esc(header.attendant)}</span></div>`;
        html += `<div class="pr-header-field"><span class="pr-header-field-label">電話当番</span><span class="pr-header-field-value">${esc(header.phoneDuty)}</span></div>`;
        html += `</div>`;
        html += `</div>`;

        // === テーブル ===
        html += `<table class="pr-table"><colgroup>`;
        html += `<col class="pr-col-highway">`;
        html += `<col class="pr-col-client">`;
        html += `<col class="pr-col-meet">`;
        html += `<col class="pr-col-worktime">`;
        html += `<col class="pr-col-count">`;
        html += `<col class="pr-col-assign">`;
        html += `<col class="pr-col-remarks">`;
        html += `<col class="pr-col-report">`;
        html += `</colgroup>`;
        // th 内のテキストは .pr-th-text で包み、レンダリング後に列幅へ自動フィットさせる
        html += `<thead><tr>`;
        html += `<th></th>`;
        html += `<th><span class="pr-th-text">契約先</span></th>`;
        html += `<th><span class="pr-th-text">集合・出発</span></th>`;
        html += `<th><span class="pr-th-text">業務時間</span></th>`;
        html += `<th><span class="pr-th-text">人数</span></th>`;
        html += `<th><span class="pr-th-text">配置社員氏名</span></th>`;
        html += `<th><span class="pr-th-text">備考</span></th>`;
        html += `<th><span class="pr-th-text">日報</span></th>`;
        html += `</tr></thead>`;
        html += `<tbody>`;

        groups.forEach(g => {
            const labelHtml = g.label
                ? `<td class="pr-col-group-label" rowspan="${g.rows.length}">${esc(g.label)}</td>`
                : `<td class="pr-col-group-label" rowspan="${g.rows.length}"></td>`;
            g.rows.forEach((r, i) => {
                html += renderRow(r, i === 0, labelHtml);
            });
        });

        html += `</tbody></table>`;
        html += `</div>`;
        return html;
    }

    // ---------- thead 文字の自動フィット ----------
    // 各 <th> の実幅に対し、内部 .pr-th-text の自然幅が超過する場合は
    // transform: scale() でテキストだけを縮小してはみ出しを防ぐ。
    function autoFitThText(container) {
        if (!container) return;
        const spans = container.querySelectorAll('.pr-table thead th .pr-th-text');
        spans.forEach(span => {
            span.style.transform = '';
            const th = span.parentElement;
            if (!th) return;
            // padding 分を除いた利用可能幅
            const csTh = window.getComputedStyle(th);
            const padX = parseFloat(csTh.paddingLeft) + parseFloat(csTh.paddingRight);
            const avail = th.clientWidth - padX;
            const natural = span.offsetWidth;
            if (avail <= 0 || natural <= avail) return;
            const scale = Math.max(0.5, avail / natural);
            span.style.transformOrigin = 'center';
            span.style.transform = `scale(${scale})`;
        });
    }

    // ---------- 拡大・縮小制御 ----------
    const PR_ZOOM_MIN = 0.3;
    const PR_ZOOM_MAX = 2.5;
    const PR_ZOOM_STEP = 0.1;
    let prZoomScale = 1;

    function applyZoom() {
        const container = document.getElementById('prSheetContainer');
        if (!container) return;
        container.style.zoom = prZoomScale;
        const label = document.getElementById('prZoomLabel');
        if (label) label.textContent = Math.round(prZoomScale * 100) + '%';
    }
    function zoomIn() {
        prZoomScale = Math.min(PR_ZOOM_MAX, Math.round((prZoomScale + PR_ZOOM_STEP) * 100) / 100);
        applyZoom();
    }
    function zoomOut() {
        prZoomScale = Math.max(PR_ZOOM_MIN, Math.round((prZoomScale - PR_ZOOM_STEP) * 100) / 100);
        applyZoom();
    }
    function zoomReset() {
        prZoomScale = 1;
        applyZoom();
    }
    function zoomFit() {
        const overlay = document.getElementById('printOverlay');
        const container = document.getElementById('prSheetContainer');
        if (!overlay || !container) return;
        // zoom=1 の実寸で測定
        container.style.zoom = 1;
        const sheet = container.querySelector('.pr-sheet');
        if (!sheet) return;
        const toolbar = overlay.querySelector('.pr-overlay-toolbar');
        const availW = overlay.clientWidth - 40;
        const availH = overlay.clientHeight - (toolbar ? toolbar.offsetHeight : 60) - 40;
        const sw = sheet.offsetWidth;
        const sh = sheet.offsetHeight;
        const ratio = Math.min(availW / sw, availH / sh);
        prZoomScale = Math.max(PR_ZOOM_MIN, Math.min(PR_ZOOM_MAX, ratio));
        applyZoom();
    }

    // ---------- オーバーレイ制御 ----------
    function openPrintPreview() {
        let overlay = document.getElementById('printOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'printOverlay';
            overlay.className = 'pr-overlay';
            overlay.innerHTML = `
                <div class="pr-overlay-toolbar">
                    <button class="pr-btn-primary" onclick="prDoPrint()">🖨 プリンタで印刷</button>
                    <span class="pr-tb-sep"></span>
                    <button onclick="prZoomOut()" title="縮小">−</button>
                    <button onclick="prZoomReset()" title="等倍 (100%)"><span id="prZoomLabel">100%</span></button>
                    <button onclick="prZoomIn()" title="拡大">＋</button>
                    <button onclick="prZoomFit()" title="ウィンドウにフィット">全体表示</button>
                    <span class="pr-tb-sep"></span>
                    <button onclick="prClosePreview()">✕ 閉じる</button>
                </div>
                <div id="prSheetContainer"></div>
            `;
            document.body.appendChild(overlay);
        }
        const container = document.getElementById('prSheetContainer');
        container.innerHTML = renderSheet();
        overlay.classList.add('pr-active');
        document.body.style.overflow = 'hidden';
        prZoomScale = 1;
        applyZoom();
        // thead 文字を列幅に合わせて自動縮小 (レイアウト確定後に実行)
        requestAnimationFrame(() => autoFitThText(container));
    }

    function closePrintPreview() {
        const overlay = document.getElementById('printOverlay');
        if (overlay) overlay.classList.remove('pr-active');
        document.body.style.overflow = '';
    }

    function doPrint() {
        // 印刷時は zoom を一時的に 1 に戻し、終了後に復元
        const container = document.getElementById('prSheetContainer');
        const prev = prZoomScale;
        if (container) container.style.zoom = 1;
        window.print();
        if (container) container.style.zoom = prev;
    }

    // Escキーで閉じる / Ctrl+=/-/0 で拡大縮小
    document.addEventListener('keydown', function(e) {
        const overlay = document.getElementById('printOverlay');
        if (!overlay || !overlay.classList.contains('pr-active')) return;
        if (e.key === 'Escape') {
            closePrintPreview();
        } else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            zoomIn();
        } else if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            zoomOut();
        } else if (e.ctrlKey && e.key === '0') {
            e.preventDefault();
            zoomReset();
        }
    });

    // グローバル公開
    window.openPrintPreview = openPrintPreview;
    window.prClosePreview = closePrintPreview;
    window.prDoPrint = doPrint;
    window.prZoomIn = zoomIn;
    window.prZoomOut = zoomOut;
    window.prZoomReset = zoomReset;
    window.prZoomFit = zoomFit;
})();
