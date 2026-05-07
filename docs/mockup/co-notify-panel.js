/* ============================================================
   co-notify-panel.js — 変更通知パネル 共通挙動
   - ベルアイコン (.cn-trigger) クリックで .cn-anchor を開閉
   - 上タブ (最新/履歴) / 縦サブタブ (現場名/アカウント) 切替
   - 軸グループ・日付グループ・アイテムアコーディオン
   - 一覧選択フロー (契約先 → 現場 / アカウント)
   - 「すべて既読」
   ============================================================ */
(function () {
    'use strict';

    // ========== パネル開閉 ==========
    function closeAllPanels(except) {
        document.querySelectorAll('.cn-anchor.is-open').forEach(function (a) {
            if (a !== except) a.classList.remove('is-open');
        });
    }

    document.addEventListener('click', function (e) {
        // トリガー (ベルボタン) クリック
        var trigger = e.target.closest('.cn-trigger');
        if (trigger) {
            var anchor = trigger.closest('.cn-anchor');
            if (!anchor) return;
            var willOpen = !anchor.classList.contains('is-open');
            closeAllPanels(anchor);
            anchor.classList.toggle('is-open', willOpen);
            if (willOpen && typeof window.coNotifyPanelOnOpen === 'function') {
                window.coNotifyPanelOnOpen(anchor);
            }
            return;
        }
        // パネル外クリック → 閉じる
        if (!e.target.closest('.cn-panel')) {
            closeAllPanels(null);
        }
    });

    // Escape キーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAllPanels(null);
    });

    // ========== 上タブ (最新 / 履歴) ==========
    document.addEventListener('click', function (e) {
        var tab = e.target.closest('.cn-tab');
        if (!tab) return;
        var panel = tab.closest('.cn-panel');
        if (!panel) return;
        var name = tab.dataset.tab;
        panel.querySelectorAll('.cn-tab').forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
        });
        panel.querySelectorAll('.cn-tab-view').forEach(function (v) {
            v.classList.toggle('is-active', v.dataset.tab === name);
        });
    });

    // ========== 縦サブタブ (現場名 / アカウント) ==========
    document.addEventListener('click', function (e) {
        var stab = e.target.closest('.cn-side-tab');
        if (!stab) return;
        var view = stab.dataset.view;
        var layout = stab.closest('.cn-history-layout');
        if (!layout || !view) return;
        layout.querySelectorAll('.cn-side-tab').forEach(function (t) {
            t.classList.toggle('is-active', t === stab);
        });
        layout.querySelectorAll('.cn-history-view').forEach(function (v) {
            v.classList.toggle('is-active', v.dataset.view === view);
        });
    });

    // ========== 種別チップ (追加 / 変更 / 削除 / すべて) ==========
    document.addEventListener('click', function (e) {
        var chip = e.target.closest('.cn-filter-chip');
        if (!chip) return;
        var group = chip.parentElement;
        if (!group) return;
        group.querySelectorAll('.cn-filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c === chip);
        });
    });

    // ========== グループヘッダーのアコーディオン ==========
    document.addEventListener('click', function (e) {
        var head = e.target.closest('.cn-axis-group-head, .cn-date-group-head');
        if (!head) return;
        var group = head.closest('.cn-axis-group, .cn-date-group');
        if (!group) return;
        var willCollapse = !group.classList.contains('is-collapsed');
        group.classList.toggle('is-collapsed', willCollapse);
        head.setAttribute('aria-expanded', String(!willCollapse));
        var toggle = head.querySelector('.cn-axis-group-toggle, .cn-date-group-toggle');
        if (toggle) toggle.textContent = willCollapse ? '▾' : '▴';
    });

    // ========== アイテムクリック ==========
    // - type-add / type-delete → ジャンプ (差分なし、即遷移)
    // - type-modify など       → アコーディオン展開 + 既読化
    function fireJump(item) {
        var ev = new CustomEvent('cn:jump', { bubbles: true, detail: { item: item } });
        item.dispatchEvent(ev);
    }
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        if (e.target.closest('.cn-jump-btn')) return;
        var item = row.parentElement;
        if (!item) return;

        // 追加/削除はアコーディオン無しで即ジャンプ
        if (item.classList.contains('type-add') || item.classList.contains('type-delete')) {
            item.classList.remove('is-unread');
            fireJump(item);
            return;
        }
        // 変更等はアコーディオン展開 + 既読化
        var willOpen = !item.classList.contains('is-expanded');
        item.classList.toggle('is-expanded', willOpen);
        if (willOpen) item.classList.remove('is-unread');
        var chev = row.querySelector('.cn-chevron');
        if (chev) chev.textContent = willOpen ? '▴' : '▾';
    });

    // ジャンプボタン (アコーディオン内)
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        var item = btn.closest('.cn-item');
        if (item) fireJump(item);
    });

    // ========== すべて既読 ==========
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-mark-all');
        if (!btn) return;
        var panel = btn.closest('.cn-panel');
        if (!panel) return;
        panel.querySelectorAll('.cn-item.is-unread').forEach(function (item) {
            item.classList.remove('is-unread');
        });
        // 未読バッジも 0 に
        var anchor = panel.closest('.cn-anchor');
        if (anchor) {
            var badge = anchor.querySelector('.cn-trigger-badge');
            if (badge) {
                badge.textContent = '0';
                badge.hidden = true;
            }
        }
        var ev = new CustomEvent('cn:mark-all', { bubbles: true });
        panel.dispatchEvent(ev);
    });

    // ========== 一覧選択フロー (契約先 → 現場 / アカウント) ==========
    function renderCrumbsInitial(pickView) {
        var crumbs = pickView.querySelector('.cn-pick-crumbs');
        if (!crumbs) return;
        var base = pickView.dataset.crumbBase || '';
        var step1Label = pickView.dataset.step1Label || '選択';
        crumbs.innerHTML =
            '<span>' + base + '</span>' +
            '<span class="cn-pick-crumb-sep">&gt;</span>' +
            '<span class="cn-pick-crumb-current">' + step1Label + '</span>';
    }

    // 「一覧」ボタン: 選択画面を開く / × クリックで選択解除
    document.addEventListener('click', function (e) {
        var clear = e.target.closest('.cn-list-pick-clear');
        if (clear) {
            e.stopPropagation();
            var btn = clear.closest('.cn-list-pick-btn');
            if (btn) {
                btn.classList.remove('is-selected');
                var label = btn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = '一覧';
                var pev = new CustomEvent('cn:filter-clear', { bubbles: true });
                btn.dispatchEvent(pev);
            }
            return;
        }
        var pickBtn = e.target.closest('.cn-list-pick-btn');
        if (!pickBtn) return;
        var view = pickBtn.closest('.cn-history-view');
        if (!view) return;
        var pickView = view.querySelector('.cn-pick-view');
        if (!pickView) return;
        pickView.querySelectorAll('.cn-pick-step').forEach(function (s, i) {
            s.classList.toggle('is-active', i === 0);
        });
        renderCrumbsInitial(pickView);
        view.classList.add('is-picking');
    });

    // バッジクリック: ステップ進行 (company → site) or 選択確定
    document.addEventListener('click', function (e) {
        var badge = e.target.closest('.cn-pick-badge');
        if (!badge) return;
        var step = badge.closest('.cn-pick-step');
        if (!step || !step.classList.contains('is-active')) return;
        var pickView = step.closest('.cn-pick-view');
        var view = pickView.closest('.cn-history-view');
        var stepName = step.dataset.step;

        if (stepName === 'company') {
            var company = badge.dataset.company;
            var step2 = pickView.querySelector('.cn-pick-step[data-step="site"]');
            if (!step2) return;
            step2.querySelectorAll('.cn-pick-badges').forEach(function (g) {
                g.hidden = (g.dataset.company !== company);
            });
            step.classList.remove('is-active');
            step2.classList.add('is-active');
            var crumbs = pickView.querySelector('.cn-pick-crumbs');
            var base = pickView.dataset.crumbBase || '';
            crumbs.innerHTML =
                '<span>' + base + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span>' + company + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span class="cn-pick-crumb-current">現場を選択</span>';
        } else {
            var listBtn = view.querySelector('.cn-list-pick-btn');
            if (listBtn) {
                var prefix = listBtn.dataset.prefix || '';
                var label = listBtn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = prefix ? (prefix + ': ' + badge.textContent.trim()) : badge.textContent.trim();
                listBtn.classList.add('is-selected');
                var fev = new CustomEvent('cn:filter-select', {
                    bubbles: true,
                    detail: { value: badge.textContent.trim(), data: Object.assign({}, badge.dataset) }
                });
                listBtn.dispatchEvent(fev);
            }
            view.classList.remove('is-picking');
        }
    });

    // 戻るボタン: ステップ2 → ステップ1, ステップ1 → リストビューへ
    document.addEventListener('click', function (e) {
        var back = e.target.closest('.cn-pick-back');
        if (!back) return;
        var pickView = back.closest('.cn-pick-view');
        var view = back.closest('.cn-history-view');
        if (!pickView || !view) return;
        var step2 = pickView.querySelector('.cn-pick-step[data-step="site"]');
        if (step2 && step2.classList.contains('is-active')) {
            step2.classList.remove('is-active');
            var step1 = pickView.querySelector('.cn-pick-step[data-step="company"]');
            if (step1) step1.classList.add('is-active');
            renderCrumbsInitial(pickView);
        } else {
            view.classList.remove('is-picking');
        }
    });

    // ========== 公開 API ==========
    window.coNotifyPanel = {
        open: function (anchor) {
            if (!anchor) return;
            closeAllPanels(anchor);
            anchor.classList.add('is-open');
        },
        close: function (anchor) {
            if (anchor) anchor.classList.remove('is-open');
            else closeAllPanels(null);
        },
        toggle: function (anchor) {
            if (!anchor) return;
            var willOpen = !anchor.classList.contains('is-open');
            closeAllPanels(anchor);
            anchor.classList.toggle('is-open', willOpen);
        },
        setBadge: function (anchor, count) {
            if (!anchor) return;
            var badge = anchor.querySelector('.cn-trigger-badge');
            if (!badge) return;
            badge.textContent = String(count);
            badge.hidden = (count <= 0);
        }
    };
})();
