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

    // ========== 種別チップ (すべて / 追加 / 変更 / 削除) ==========
    // - 「すべて」を選択 → 他すべて解除
    // - 追加/変更/削除を選択 → 「すべて」解除 + 該当チップを多重選択トグル
    // - すべて解除になった場合は「すべて」を自動的にONに戻す
    document.addEventListener('click', function (e) {
        var chip = e.target.closest('.cn-filter-chip');
        if (!chip) return;
        var group = chip.parentElement;
        if (!group) return;
        var filter = chip.dataset.filter || 'all';
        if (filter === 'all') {
            group.querySelectorAll('.cn-filter-chip').forEach(function (c) {
                c.classList.toggle('is-active', c === chip);
            });
        } else {
            var allChip = group.querySelector('.cn-filter-chip[data-filter="all"]');
            if (allChip) allChip.classList.remove('is-active');
            chip.classList.toggle('is-active');
            // すべて解除になった場合は「すべて」を再ON
            var anyOn = Array.from(group.querySelectorAll('.cn-filter-chip')).some(function (c) {
                return c.classList.contains('is-active');
            });
            if (!anyOn && allChip) allChip.classList.add('is-active');
        }
        var view = group.closest('.cn-history-view') || group.closest('.cn-tab-view');
        if (view) applyCnFilters(view);
    });

    // ========== フィルタ適用 (種別チップ + 一覧選択 を統合) ==========
    function getActiveFilterTypes(view) {
        var group = view.querySelector('.cn-filter-chips');
        if (!group) return null; // フィルタ無し → 全件表示
        var allChip = group.querySelector('.cn-filter-chip[data-filter="all"]');
        if (allChip && allChip.classList.contains('is-active')) return null;
        var types = [];
        group.querySelectorAll('.cn-filter-chip.is-active').forEach(function (c) {
            if (c.dataset.filter && c.dataset.filter !== 'all') types.push(c.dataset.filter);
        });
        return types.length > 0 ? types : null;
    }

    function applyCnFilters(view) {
        if (!view) return;
        var types = getActiveFilterTypes(view);
        var pickAxis = view.dataset.pickAxis || '';
        var pickValue = view.dataset.pickValue || '';

        // 1) アイテム単位で絞り込み
        view.querySelectorAll('.cn-item').forEach(function (item) {
            var itemType = (item.dataset.type || '').toLowerCase();
            // 種別フィルタ
            var typeOk = !types || types.indexOf(itemType) !== -1;
            // 一覧選択フィルタ
            var pickOk = true;
            if (pickAxis && pickValue) {
                var attr = item.dataset[pickAxis] || '';
                pickOk = (attr === pickValue);
            }
            item.classList.toggle('is-hidden', !(typeOk && pickOk));
        });

        // 2) グループ (axis-group / date-group) 単位で全アイテム非表示なら自身も非表示
        view.querySelectorAll('.cn-axis-group, .cn-date-group').forEach(function (g) {
            var visible = g.querySelector('.cn-item:not(.is-hidden)');
            g.classList.toggle('is-hidden', !visible);
        });
    }
    // 公開: 外部からも再適用できるよう
    window._cnApplyFilters = applyCnFilters;

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
    // - cn-expand 有り: 排他アコーディオン展開（同パネル内の他は閉じる）+ 開く時のみ cn:jump 発火（フラッシュ用）
    // - cn-expand 無し: 即ジャンプ
    function fireJump(item) {
        var ev = new CustomEvent('cn:jump', { bubbles: true, detail: { item: item } });
        item.dispatchEvent(ev);
    }
    function setItemExpanded(item, expanded) {
        item.classList.toggle('is-expanded', expanded);
        var rowEl = item.querySelector(':scope > .cn-item-row');
        var chev = rowEl && rowEl.querySelector('.cn-chevron');
        if (chev) chev.textContent = expanded ? '▴' : '▾';
    }
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        if (e.target.closest('.cn-jump-btn')) return;
        var item = row.parentElement;
        if (!item) return;

        var hasExpand = !!item.querySelector(':scope > .cn-expand');
        if (!hasExpand) {
            // アコーディオン無し → 即ジャンプ
            item.classList.remove('is-unread');
            fireJump(item);
            return;
        }
        var willOpen = !item.classList.contains('is-expanded');
        if (willOpen) {
            // 排他: 同じ panel 内の他の展開済みアイテムを閉じる
            var panel = item.closest('.cn-panel');
            if (panel) {
                panel.querySelectorAll('.cn-item.is-expanded').forEach(function (other) {
                    if (other !== item) setItemExpanded(other, false);
                });
            }
            setItemExpanded(item, true);
            item.classList.remove('is-unread');
            // 開いた時のみフラッシュ発火（各画面のリスナーがパネルを閉じない実装になっている前提）
            fireJump(item);
        } else {
            setItemExpanded(item, false);
        }
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
                // フィルタを解除して再適用
                var view = btn.closest('.cn-history-view');
                if (view) {
                    delete view.dataset.pickAxis;
                    delete view.dataset.pickValue;
                    applyCnFilters(view);
                }
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
            var selValue = badge.textContent.trim();
            if (listBtn) {
                var prefix = listBtn.dataset.prefix || '';
                var label = listBtn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = prefix ? (prefix + ': ' + selValue) : selValue;
                listBtn.classList.add('is-selected');
                var fev = new CustomEvent('cn:filter-select', {
                    bubbles: true,
                    detail: { value: selValue, data: Object.assign({}, badge.dataset) }
                });
                listBtn.dispatchEvent(fev);
            }
            // 軸別の絞り込みを view に保存して適用
            // stepName: 'site' (現場名軸) / 'account' (アカウント軸)
            view.dataset.pickAxis = (stepName === 'account') ? 'account' : 'site';
            view.dataset.pickValue = selValue;
            applyCnFilters(view);

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
