/* ============================================================================
   print-touo-nikkei.js — 業務管理計画書プリント書式（東央警備 & Nikkei）
   ----------------------------------------------------------------------------
   - screen-layout.html のグリッドテーブルから行データを抽出
   - 東央警備 + Nikkei + 固定3行（会社・休み・休み申請あり）のみを印刷
   - カテゴリ別グルーピング + 縦書きラベル
   - 印刷ヘッダー固定値: 同席担当者=片岡 / 電話当番=渋谷・正木
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

    const ASSIGN_SLOTS = 10; // 配置社員氏名セル数

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

        // 備考（車両プレート + notes テキスト合成）
        const vehiclePlates = [];
        tr.querySelectorAll('.col-vt .vehicle-tag').forEach(v => {
            const clone = v.cloneNode(true);
            clone.querySelectorAll('button').forEach(b => b.remove());
            vehiclePlates.push(clone.textContent.trim());
        });
        const notesParts = [];
        const notesCell = tr.querySelector('.col-notes');
        if (notesCell && notesCell.dataset.vtItems) {
            try {
                const items = JSON.parse(notesCell.dataset.vtItems);
                items.forEach(it => {
                    if (it.label === '備考' && it.value) notesParts.push(it.value);
                });
            } catch (_) {}
        }
        const remarksLines = [];
        if (vehiclePlates.length) remarksLines.push(vehiclePlates.join(' / '));
        notesParts.forEach(n => remarksLines.push(n));
        const remarks = remarksLines.join('\n');

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
            remarks
        };
    }

    function extractAllRows() {
        const rows = [];
        document.querySelectorAll('.grid-table tbody tr').forEach(tr => {
            // GCフィルタ非表示行はスキップ（画面に出ていない行は印刷対象外）
            if (tr.style.display === 'none') return;
            const data = extractRowData(tr);
            if (data) rows.push(data);
        });
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
        // 配置人数が ASSIGN_SLOTS(10) を超えた場合は段数を増やし、
        // 各セルは通常サイズを保ったまま 2 段目以降に折り返す。
        const rows = Math.max(1, Math.ceil(assigned.length / ASSIGN_SLOTS));
        const totalSlots = rows * ASSIGN_SLOTS;
        const gridCls = rows > 1 ? 'pr-assign-grid pr-assign-grid--multi' : 'pr-assign-grid';
        let html = `<div class="${gridCls}">`;
        for (let i = 0; i < totalSlots; i++) {
            const a = assigned[i];
            if (a && a.name) {
                const gcCls = a.gc === 'nikkei' ? 'pr-gc-nikkei' : (a.gc === 'touo' ? 'pr-gc-touo' : '');
                const leaveCls = a.isOnLeave ? ' pr-on-leave' : '';
                const holidayChipCls = a.isHolidayChip ? ' pr-holiday-chip' : '';
                const holidayAssignedCls = a.isHolidayAssigned ? ' pr-holiday-assigned' : '';
                html += `<div class="pr-assign-cell ${gcCls}${leaveCls}${holidayChipCls}${holidayAssignedCls}">`;
                // 連勤マーク（▼ 上）
                if (a.continuousAbove) html += `<span class="continuous-badge continuous-above">▼</span>`;
                // 名前 + 休 サブバッジ
                html += `<span class="pr-name">${esc(a.name)}`;
                if (a.isOnLeave && !a.isHolidayChip) html += `<span class="sl-holiday-sub">休</span>`;
                html += `</span>`;
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
                html += `</div>`;
            } else {
                html += `<div class="pr-assign-cell pr-assign-empty"></div>`;
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
        // ＋ 集合/休憩 インジケーター（テンプレ準拠）
        html += `<td class="pr-count-cell">`;
        if (r.count) {
            const m = r.count.match(/(\d+)\s*\/\s*(\d+)/);
            html += `<div class="pr-count-num">${esc(m ? m[2] : r.count)}</div>`;
        }
        if (!r.isFixed) {
            html += `<div class="pr-meet-rest-indicator">`;
            html += `<span class="pr-mr-shugo">集合</span>`;
            html += `<span class="pr-mr-kyukei">休憩</span>`;
            html += `</div>`;
        }
        html += `</td>`;

        // 配置社員
        html += `<td class="pr-col-assign" style="padding:0;">${renderAssignCells(r.assigned, r.isFixed)}</td>`;

        // 備考
        html += `<td class="pr-remarks-cell">${esc(r.remarks)}</td>`;

        // 目報
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
        html += `<div class="pr-header-field"><span class="pr-header-field-label">同席担当者</span><span class="pr-header-field-value">${esc(header.attendant)}</span></div>`;
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
        html += `<thead><tr>`;
        html += `<th></th>`;
        html += `<th>契約先</th>`;
        html += `<th>集合・出発</th>`;
        html += `<th>業務時間</th>`;
        html += `<th>人数</th>`;
        html += `<th>配置社員氏名</th>`;
        html += `<th>備考</th>`;
        html += `<th>目報</th>`;
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
                    <button onclick="prClosePreview()">✕ 閉じる</button>
                </div>
                <div id="prSheetContainer"></div>
            `;
            document.body.appendChild(overlay);
        }
        document.getElementById('prSheetContainer').innerHTML = renderSheet();
        overlay.classList.add('pr-active');
        document.body.style.overflow = 'hidden';
    }

    function closePrintPreview() {
        const overlay = document.getElementById('printOverlay');
        if (overlay) overlay.classList.remove('pr-active');
        document.body.style.overflow = '';
    }

    function doPrint() {
        window.print();
    }

    // Escキーで閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('printOverlay');
            if (overlay && overlay.classList.contains('pr-active')) {
                closePrintPreview();
            }
        }
    });

    // グローバル公開
    window.openPrintPreview = openPrintPreview;
    window.prClosePreview = closePrintPreview;
    window.prDoPrint = doPrint;
})();
