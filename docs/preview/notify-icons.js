/* ============================================================
   notify-icons.js — アイコン選定モードのレンダリング・選択・検索
   - パネル別カードを縦に並べ、各カード内でベル+タイプ別アイコンを選定
   - 選択結果は localStorage に保存、JSON 出力可
   - ライブラリ検索は index.json をフェッチして絞り込み
   ============================================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'notifyIconSelections.v1';

    var Data = window.NotifyIconsData;
    if (!Data) {
        console.warn('NotifyIconsData not loaded');
        return;
    }

    // ---------- 選択状態（localStorage 永続化） ----------
    var selections = loadSelections();

    function loadSelections() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
    }
    function saveSelections() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selections)); }
        catch (e) {}
    }
    function getSel(slotId) { return selections[slotId] || null; }
    function setSel(slotId, file) {
        if (file) selections[slotId] = file;
        else delete selections[slotId];
        saveSelections();
    }

    // ---------- ユーティリティ ----------
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') node.className = attrs[k];
                else if (k === 'dataset') {
                    Object.keys(attrs[k]).forEach(function (dk) { node.dataset[dk] = attrs[k][dk]; });
                } else if (k.indexOf('on') === 0) {
                    node.addEventListener(k.slice(2), attrs[k]);
                } else if (k === 'html') node.innerHTML = attrs[k];
                else node.setAttribute(k, attrs[k]);
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (c) {
                if (c == null) return;
                node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return node;
    }

    function iconUrl(file) { return Data.ICON_BASE_PATH + file; }
    function iconImg(file, cls) {
        return el('img', { src: iconUrl(file), class: cls || 'ni-icon-img', alt: '', loading: 'lazy' });
    }
    function resolveType(t) {
        if (typeof t === 'string') {
            var c = Data.COMMON_TYPES[t];
            return c ? Object.assign({ id: t, isCommon: true }, c) : null;
        }
        return Object.assign({ isCommon: false }, t);
    }

    // ---------- レンダリング: パネル別カード ----------
    function buildPanelCard(panel) {
        var card = el('section', { class: 'ni-card', dataset: { panelId: panel.id } });

        // ヘッダー
        card.appendChild(el('header', { class: 'ni-card-head' }, [
            el('h2', { class: 'ni-card-title' }, panel.label),
            el('span', { class: 'ni-card-sub' }, 'ベル1 + タイプ' + panel.types.length)
        ]));

        // ベルセクション
        var bell = Data.BELLS.find(function (b) { return b.id === panel.bellId; });
        if (bell) card.appendChild(buildSlot(bell.id, 'ベルアイコン', bell.candidates, 'bell'));

        // タイプセクション
        panel.types.forEach(function (t) {
            var resolved = resolveType(t);
            if (!resolved) return;
            var labelPrefix = resolved.isCommon ? '【共通】' : '';
            card.appendChild(buildSlot(resolved.id, labelPrefix + resolved.label, resolved.candidates, 'type'));
        });

        // プレビュー
        card.appendChild(buildPreview(panel));

        return card;
    }

    // ---------- スロット（1つのアイコン選定枠） ----------
    function buildSlot(slotId, label, candidates, kind) {
        var slot = el('div', { class: 'ni-slot', dataset: { slotId: slotId, kind: kind } });
        slot.appendChild(el('div', { class: 'ni-slot-label' }, [
            el('span', { class: 'ni-slot-label-text' }, label),
            el('span', { class: 'ni-slot-current', dataset: { role: 'current' } }, getSel(slotId) || '未選択')
        ]));

        var grid = el('div', { class: 'ni-slot-grid' });
        candidates.forEach(function (file) {
            grid.appendChild(buildCandidate(slotId, file));
        });
        // ライブラリ検索ボタン
        grid.appendChild(el('button', {
            class: 'ni-search-btn', type: 'button',
            onclick: function () { openSearchModal(slotId); }
        }, '📚 検索…'));
        slot.appendChild(grid);

        return slot;
    }

    function buildCandidate(slotId, file) {
        var isSel = (getSel(slotId) === file);
        var btn = el('button', {
            class: 'ni-cand' + (isSel ? ' is-selected' : ''),
            type: 'button',
            title: file,
            dataset: { slotId: slotId, file: file },
            onclick: function () { onSelectIcon(slotId, file); }
        }, [iconImg(file, 'ni-cand-img')]);
        return btn;
    }

    function onSelectIcon(slotId, file) {
        var current = getSel(slotId);
        if (current === file) {
            // クリックで解除
            setSel(slotId, null);
        } else {
            setSel(slotId, file);
        }
        refreshSlot(slotId);
        refreshAllPreviews();
    }

    function refreshSlot(slotId) {
        // 該当スロットの選択状態と current 表示を更新
        document.querySelectorAll('.ni-slot[data-slot-id="' + slotId + '"]').forEach(function (slot) {
            var sel = getSel(slotId);
            var cur = slot.querySelector('[data-role="current"]');
            if (cur) cur.textContent = sel || '未選択';
            slot.querySelectorAll('.ni-cand').forEach(function (btn) {
                btn.classList.toggle('is-selected', btn.dataset.file === sel);
            });
            // 検索で追加された候補がある場合、選択候補が表示中の候補にないなら追加表示
            if (sel && !slot.querySelector('.ni-cand[data-file="' + sel + '"]')) {
                var grid = slot.querySelector('.ni-slot-grid');
                var searchBtn = grid.querySelector('.ni-search-btn');
                grid.insertBefore(buildCandidate(slotId, sel), searchBtn);
                refreshSlot(slotId);
            }
        });
    }

    // ---------- プレビュー ----------
    function buildPreview(panel) {
        var box = el('div', { class: 'ni-preview', dataset: { previewFor: panel.id } });
        box.appendChild(el('div', { class: 'ni-preview-title' }, 'プレビュー'));

        // ベル横並び（このパネルのベル + 他ベルとの比較用に全ベル並べる）
        var bellRow = el('div', { class: 'ni-preview-bells' });
        Data.BELLS.forEach(function (b) {
            var sel = getSel(b.id);
            var bellBtn = el('div', {
                class: 'ni-preview-bell' + (b.id === panel.bellId ? ' is-current' : ''),
                title: b.label
            });
            if (sel) bellBtn.appendChild(iconImg(sel, 'ni-preview-bell-img'));
            else bellBtn.textContent = '?';
            bellRow.appendChild(bellBtn);
        });
        box.appendChild(bellRow);

        // 通知アイテム例（タイプごと1行）
        var itemList = el('div', { class: 'ni-preview-items' });
        panel.types.forEach(function (t) {
            var resolved = resolveType(t);
            if (!resolved) return;
            var sel = getSel(resolved.id);
            var item = el('div', { class: 'ni-preview-item is-unread' });
            var iconBox = el('div', { class: 'ni-preview-item-icon' });
            if (sel) iconBox.appendChild(iconImg(sel, 'ni-preview-item-img'));
            else iconBox.textContent = '?';
            item.appendChild(iconBox);
            item.appendChild(el('div', { class: 'ni-preview-item-text' }, [
                el('div', { class: 'ni-preview-item-main' }, resolved.label + ' のサンプル通知'),
                el('div', { class: 'ni-preview-item-sub' }, '◯◯ さん ・ 5分前')
            ]));
            itemList.appendChild(item);
        });
        box.appendChild(itemList);

        return box;
    }

    function refreshAllPreviews() {
        document.querySelectorAll('.ni-preview').forEach(function (box) {
            var panelId = box.dataset.previewFor;
            var panel = Data.PANELS.find(function (p) { return p.id === panelId; });
            if (!panel) return;
            var newBox = buildPreview(panel);
            box.parentNode.replaceChild(newBox, box);
        });
    }

    // ---------- ライブラリ検索（IconPicker に委譲） ----------
    function openSearchModal(slotId) {
        if (!window.IconPicker) {
            alert('IconPicker が読み込まれていません。co-icon-picker.js を確認してください。');
            return;
        }
        window.IconPicker.open({
            title: 'アイコンを選択（スロット: ' + slotId + '）',
            accept: ['svg', 'png'],
            basePath: Data.ICON_BASE_PATH,
            onPick: function (file) {
                setSel(slotId, file);
                refreshSlot(slotId);
                refreshAllPreviews();
            }
        });
    }

    // ---------- ヘッダーツールバー（JSON出力 / リセット） ----------
    function buildToolbar() {
        return el('div', { class: 'ni-toolbar' }, [
            el('button', { class: 'ni-tool-btn', type: 'button', onclick: exportJson }, '📋 JSON出力'),
            el('button', { class: 'ni-tool-btn', type: 'button', onclick: resetAll }, '↺ リセット'),
            el('span', { class: 'ni-tool-hint' }, '選択は自動保存（localStorage）')
        ]);
    }

    function exportJson() {
        var out = {};
        Data.BELLS.forEach(function (b) { if (getSel(b.id)) out[b.id] = getSel(b.id); });
        Object.keys(Data.COMMON_TYPES).forEach(function (k) { if (getSel(k)) out[k] = getSel(k); });
        Data.PANELS.forEach(function (p) {
            p.types.forEach(function (t) {
                var r = resolveType(t);
                if (r && !r.isCommon && getSel(r.id)) out[r.id] = getSel(r.id);
            });
        });
        var pretty = JSON.stringify(out, null, 2);
        try {
            navigator.clipboard.writeText(pretty).then(function () {
                alert('JSONをクリップボードにコピーしました\n\n' + pretty);
            }, function () {
                prompt('コピーしてください:', pretty);
            });
        } catch (e) {
            prompt('コピーしてください:', pretty);
        }
    }

    function resetAll() {
        if (!confirm('全選択をリセットしますか？')) return;
        selections = {};
        saveSelections();
        renderAll();
    }

    // ---------- 全体レンダリング ----------
    function renderAll() {
        var root = document.getElementById('cmpIcons');
        if (!root) return;
        root.innerHTML = '';
        root.appendChild(buildToolbar());
        Data.PANELS.forEach(function (p) { root.appendChild(buildPanelCard(p)); });
    }

    // ---------- モード切替に連動（cmpIconsモード起動時にレンダー） ----------
    function init() {
        // モードボタンクリックで cmpIcons モードに切り替わったらレンダリング（初回のみ）
        var rendered = false;
        document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
            if (btn.dataset.mode === 'icons') {
                btn.addEventListener('click', function () {
                    if (!rendered) { renderAll(); rendered = true; }
                });
            }
        });
        // ページロード時に既に icons モードがアクティブなら即レンダ
        var iconsSection = document.getElementById('cmpIcons');
        if (iconsSection && !iconsSection.classList.contains('cmp-hidden')) {
            renderAll();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
