/* notify-compare.js — Before/After モード切替 + 統合案アコーディオン挙動 */
(function () {
    'use strict';

    /* Before / After / 履歴 / アイコン選定 / ベル並び / パネルレイアウト / 自動生成行オーバーレイ モード切替 */
    var modeTargets = {
        before: 'cmpBefore',
        after: 'cmpAfter',
        history: 'cmpHistory',
        icons: 'cmpIcons',
        'bell-order': 'cmpBellOrder',
        'panel-layout': 'cmpPanelLayout',
        'auto-overlay': 'cmpAutoOverlay'
    };
    document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.dataset.mode;
            document.querySelectorAll('.cmp-mode-btn').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });
            Object.keys(modeTargets).forEach(function (key) {
                var el = document.getElementById(modeTargets[key]);
                if (el) el.classList.toggle('cmp-hidden', key !== mode);
            });
        });
    });

    /* 履歴ツールバー: 種別チップの選択切替 (デモ動作) */
    document.addEventListener('click', function (e) {
        var chip = e.target.closest('.cn-filter-chip');
        if (!chip) return;
        var group = chip.parentElement;
        if (!group) return;
        group.querySelectorAll('.cn-filter-chip').forEach(function (c) {
            c.classList.toggle('is-active', c === chip);
        });
    });

    /* グループヘッダーのアコーディオン
       - 履歴タブ: 軸グループ (契約先/現場名 や 操作者 単位)
       - 統合案 after: 日付グループ (今日/昨日 等) */
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

    /* 履歴タブ 縦型タブ切替: 軸 (現場/業務 ↔ アカウント) */
    document.addEventListener('click', function (e) {
        var tab = e.target.closest('.cn-side-tab');
        if (!tab) return;
        var view = tab.dataset.view;
        var layout = tab.closest('.cn-history-layout');
        if (!layout || !view) return;
        layout.querySelectorAll('.cn-side-tab').forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
        });
        layout.querySelectorAll('.cn-history-view').forEach(function (v) {
            v.classList.toggle('is-active', v.dataset.view === view);
        });
    });

    /* 共通: ジャンプ動作デモ (アラート + 親アイテムを既読化) */
    function jumpToCell(item) {
        if (!item) return;
        var nameEl = item.querySelector('.cn-text-main');
        var name = nameEl ? nameEl.textContent.trim().replace(/\s+/g, ' ') : '';
        alert('ジャンプ動作デモ:\n「' + name + '」の対象セルへスクロール+フラッシュ表示します\n(本番では各画面のグリッド該当セルに飛びます)');
        item.classList.remove('is-unread');
    }

    /* 統合案アイテム: 行クリック
       - type-add / type-delete → 直接ジャンプ (差分なし)
       - type-modify など → アコーディオン開閉 + 既読化 */
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        // ジャンプボタンクリックは別ハンドラへ
        if (e.target.closest('.cn-jump-btn')) return;
        var item = row.parentElement;

        // 追加/削除はアコーディオン無し、直接ジャンプ
        if (item.classList.contains('type-add') || item.classList.contains('type-delete')) {
            jumpToCell(item);
            return;
        }

        // 変更などはアコーディオン展開
        var willOpen = !item.classList.contains('is-expanded');
        item.classList.toggle('is-expanded', willOpen);
        if (willOpen) item.classList.remove('is-unread');
        var chev = row.querySelector('.cn-chevron');
        if (chev) chev.textContent = willOpen ? '▴' : '▾';
    });

    /* ジャンプボタン: アコーディオン内ボタン経由のジャンプ */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        jumpToCell(btn.closest('.cn-item'));
    });

    /* 「すべて既読」ボタン */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-mark-all');
        if (!btn) return;
        var panel = btn.closest('.cn-panel');
        if (!panel) return;
        panel.querySelectorAll('.cn-item.is-unread').forEach(function (item) {
            item.classList.remove('is-unread');
        });
    });

    /* パンくずを基本状態 (ベース > ステップ1ラベル) に書き戻す */
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

    /* 「一覧」ボタン: 選択画面を開く / × クリックで選択解除 */
    document.addEventListener('click', function (e) {
        // × クリック (選択解除) — ボタン本体への伝播は止める
        var clear = e.target.closest('.cn-list-pick-clear');
        if (clear) {
            e.stopPropagation();
            var btn = clear.closest('.cn-list-pick-btn');
            if (btn) {
                btn.classList.remove('is-selected');
                var label = btn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = '一覧';
            }
            return;
        }
        // ボタン本体クリック (選択画面を開く)
        var pickBtn = e.target.closest('.cn-list-pick-btn');
        if (!pickBtn) return;
        var view = pickBtn.closest('.cn-history-view');
        if (!view) return;
        var pickView = view.querySelector('.cn-pick-view');
        if (!pickView) return;
        // ステップ1にリセット
        pickView.querySelectorAll('.cn-pick-step').forEach(function (s, i) {
            s.classList.toggle('is-active', i === 0);
        });
        renderCrumbsInitial(pickView);
        view.classList.add('is-picking');
    });

    /* バッジクリック: ステップ進行 (company → site) or 選択確定 (site / account) */
    document.addEventListener('click', function (e) {
        var badge = e.target.closest('.cn-pick-badge');
        if (!badge) return;
        var step = badge.closest('.cn-pick-step');
        if (!step || !step.classList.contains('is-active')) return;
        var pickView = step.closest('.cn-pick-view');
        var view = pickView.closest('.cn-history-view');
        var stepName = step.dataset.step;
        if (stepName === 'company') {
            // ステップ2 (現場) へ進む
            var company = badge.dataset.company;
            var step2 = pickView.querySelector('.cn-pick-step[data-step="site"]');
            if (!step2) return;
            step2.querySelectorAll('.cn-pick-badges').forEach(function (g) {
                g.hidden = (g.dataset.company !== company);
            });
            step.classList.remove('is-active');
            step2.classList.add('is-active');
            // パンくず: ベース > 契約先名 > 現場を選択
            var crumbs = pickView.querySelector('.cn-pick-crumbs');
            var base = pickView.dataset.crumbBase || '';
            crumbs.innerHTML =
                '<span>' + base + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span>' + company + '</span>' +
                '<span class="cn-pick-crumb-sep">&gt;</span>' +
                '<span class="cn-pick-crumb-current">現場を選択</span>';
        } else {
            // 選択確定 (現場 or アカウント)
            var listBtn = view.querySelector('.cn-list-pick-btn');
            if (listBtn) {
                var prefix = listBtn.dataset.prefix || '';
                var label = listBtn.querySelector('.cn-list-pick-label');
                if (label) label.textContent = prefix + ': ' + badge.textContent.trim();
                listBtn.classList.add('is-selected');
            }
            view.classList.remove('is-picking');
        }
    });

    /* 戻るボタン: ステップ2 → ステップ1, ステップ1 / アカウント → リストビューへ */
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
})();
