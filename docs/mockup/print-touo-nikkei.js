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
        let meetTime = '', meetContact = '';
        if (meetCell) {
            const td = meetCell.querySelector('.time-display');
            const cb = meetCell.querySelector('.contact-badge');
            meetTime = td ? td.textContent.trim() : '';
            meetContact = cb ? cb.textContent.trim() : '';
        }

        // 集合場所 (data-meeting-place から)
        let meetPlace = '';
        if (siteInfoCell && siteInfoCell.dataset.meetingPlace) {
            meetPlace = siteInfoCell.dataset.meetingPlace;
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
            const cb = block.querySelector('.contact-badge');
            const role = cb ? cb.textContent.trim() : '';
            // 役割のうち「直/会社/LINE」は印刷非表示、「迎え/OP/帰高」などは表示
            const showRole = role && !['直', '会社', 'LINE'].includes(role);
            assigned.push({ name, role: showRole ? role : '', gc: getEmployeeGc(name) });
        });

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
            meetPlace,
            meetTime,
            meetContact,
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
        let html = '<div class="pr-assign-grid">';
        for (let i = 0; i < ASSIGN_SLOTS; i++) {
            const a = assigned[i];
            if (a && a.name) {
                const gcCls = a.gc === 'nikkei' ? 'pr-gc-nikkei' : (a.gc === 'touo' ? 'pr-gc-touo' : '');
                html += `<div class="pr-assign-cell ${gcCls}">`;
                html += `<span class="pr-name">${esc(a.name)}</span>`;
                if (a.role) html += `<span class="pr-role">${esc(a.role)}</span>`;
                html += `</div>`;
            } else {
                html += `<div class="pr-assign-cell pr-assign-empty"></div>`;
            }
        }
        html += '</div>';
        // 溢れた社員（11人目以降）は備考寄せの小文字表示
        if (assigned.length > ASSIGN_SLOTS) {
            const overflow = assigned.slice(ASSIGN_SLOTS).map(a => a.name).filter(Boolean).join(', ');
            html += `<div style="font-size:7pt;color:#888;margin-top:0.5mm;">+他: ${esc(overflow)}</div>`;
        }
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
        if (r.meetPlace) html += `<span class="pr-meet-place">${esc(r.meetPlace.length > 6 ? r.meetPlace.substring(0,6) : r.meetPlace)}</span>`;
        if (r.meetTime) html += `<span class="pr-meet-time">${esc(r.meetTime)}</span>`;
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
