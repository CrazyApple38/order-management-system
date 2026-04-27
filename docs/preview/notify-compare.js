/* notify-compare.js — Before/After モード切替 + 統合案アコーディオン挙動 */
(function () {
    'use strict';

    /* Before / After モード切替 */
    document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.dataset.mode;
            document.querySelectorAll('.cmp-mode-btn').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });
            document.getElementById('cmpBefore').classList.toggle('cmp-hidden', mode !== 'before');
            document.getElementById('cmpAfter').classList.toggle('cmp-hidden', mode !== 'after');
        });
    });

    /* 統合案アイテム: 行クリックでアコーディオン開閉 + 既読化 */
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        // ジャンプボタンクリックは別ハンドラへ
        if (e.target.closest('.cn-jump-btn')) return;
        var item = row.parentElement;
        var willOpen = !item.classList.contains('is-expanded');
        item.classList.toggle('is-expanded', willOpen);
        if (willOpen) item.classList.remove('is-unread');
        var chev = row.querySelector('.cn-chevron');
        if (chev) chev.textContent = willOpen ? '▴' : '▾';
    });

    /* ジャンプボタン: デモ動作 (アラート + 親アイテムを既読化) */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        var item = btn.closest('.cn-item');
        var name = item ? item.querySelector('.cn-text-main').textContent.trim() : '';
        alert('ジャンプ動作デモ:\n「' + name + '」の対象セルへスクロール+フラッシュ表示します\n(本番では各画面のグリッド該当セルに飛びます)');
        if (item) item.classList.remove('is-unread');
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
})();
