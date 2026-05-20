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
    // - cn-expand 有り: 排他アコーディオン展開（同パネル内の他は閉じる / フラッシュ発火なし）
    // - cn-expand 無し: 即ジャンプ + cn:jump 発火
    // - cn:jump detail は §6.5 仕様に準拠（item, source, affects, inContext, type, slot, target）
    function fireJump(item) {
        var affects = (item.dataset.affects || '').split(',')
            .map(function (s) { return s.trim(); }).filter(Boolean);
        var current = getCurrentPage();
        var inContext = !!(current && affects.indexOf(current) !== -1);
        var anchor = item.closest('.cn-anchor[data-bell]');
        var source = anchor ? anchor.dataset.bell : '';
        var target = null;
        if (item.dataset.target) {
            try { target = JSON.parse(item.dataset.target); }
            catch (err) { target = null; }
        }
        var ev = new CustomEvent('cn:jump', {
            bubbles: true,
            detail: {
                item: item,
                source: source,
                affects: affects,
                inContext: inContext,
                type: item.dataset.type || '',
                slot: item.dataset.slot || '',
                target: target
            }
        });
        item.dispatchEvent(ev);
    }
    function setItemExpanded(item, expanded) {
        item.classList.toggle('is-expanded', expanded);
        var rowEl = item.querySelector(':scope > .cn-item-row');
        var chev = rowEl && rowEl.querySelector('.cn-chevron');
        if (chev) chev.textContent = expanded ? '▴' : '▾';
    }
    // アイテム既読化時にベル単位のバッジを再計算する共通処理
    function markItemReadAndRefresh(item) {
        if (!item || !item.classList.contains('is-unread')) return;
        item.classList.remove('is-unread');
        var anchor = item.closest('.cn-anchor[data-bell]');
        if (!anchor) return;
        var bellId = anchor.dataset.bell;
        // ストアにも _read = true を反映（再レンダー時の is-unread 復活を防ぐ）
        var itemId = item.dataset.id;
        if (itemId && bellItemsStore && bellItemsStore[bellId]) {
            var stored = bellItemsStore[bellId].find(function (it) { return it.id === itemId; });
            if (stored) stored._read = true;
        }
        if (typeof updateBadge === 'function') {
            updateBadge(bellId);
        }
    }
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        if (e.target.closest('.cn-jump-btn')) return;
        if (e.target.closest('.cn-cross-jump-btn')) return;
        var item = row.parentElement;
        if (!item) return;

        var hasExpand = !!item.querySelector(':scope > .cn-expand');
        if (!hasExpand) {
            // アコーディオン無し → 即ジャンプ + 既読化 + バッジ更新
            markItemReadAndRefresh(item);
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
            // 展開時に既読化 + バッジ更新（フラッシュ発火はしない / N-5 で「現在画面で開く」ボタン経由）
            markItemReadAndRefresh(item);
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
        // ストアにも _read = true を反映（再レンダー時の is-unread 復活を防ぐ）
        var anchor = panel.closest('.cn-anchor[data-bell]');
        if (anchor) {
            var bellId = anchor.dataset.bell;
            if (bellItemsStore && bellItemsStore[bellId]) {
                bellItemsStore[bellId].forEach(function (it) { it._read = true; });
            }
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

    // ========== ベル/アイテム アイコン解決（Phase N-2.2） ==========
    // 27スロット既定アイコン（notify-icons-selected.json 2026-05-16 確定）。
    // 各画面の HTML から見た相対パスは `assets/icons/...`（docs/ 配下に置かれる前提）。
    var CN_ICON_BASE = 'assets/icons/';
    var CN_SLOT_DEFAULT = {
        // ベル7個
        'bell-ob':       'business/si-46623-personal-information.png',
        'bell-sl':       'person/si-13707-13707.png',
        'bell-ws':       'stationery/im-12555-karendaa.svg',
        'bell-la':       'sign-mark/si-8681-8681.png',
        'bell-pending':  'life/si-9922-9922.png',
        'bell-vehicle':  'transport/im-10867-jidou-sha.svg',
        'bell-master':   'sign-mark/im-00001-muryou-no-settei-haguruma.svg',
        // 共通タイプ4個
        'type-employee':    'person/im-15537-jimbutsu.svg',
        'type-vehicle':     'transport/im-10852-jouyousha.svg',
        'type-support':     'person/im-12114-sns-jimbutsu.svg',
        'type-reservation': 'person/si-13722-13722.png',
        // OB
        'type-ob-add':    'business/im-12034-keiyaku-sho.svg',
        'type-ob-modify': 'education/si-14519-14519.png',
        'type-ob-delete': 'sign-mark/im-11911-hosoi-batsu.svg',
        // SL
        'type-sl-auto':   'sign-mark/im-15851-kyouyuu.svg',
        // WS
        'type-ws-schedule-change': 'stationery/si-48956-calendar.png',
        'type-ws-leave-reflect':   'sign-mark/si-25968-mark-repeat.png',
        // LA
        'type-la-new':     'business/si-45841-document-teishutsu.png',
        'type-la-approve': 'sign-mark/im-11453-chekku-bokkusu.svg',
        'type-la-reject':  'sign-mark/im-11911-hosoi-batsu.svg',
        // 承認待ち
        'type-pending-wait': 'life/si-9922-9922.png',
        // 車両
        'type-vehicle-add':    'person/si-13878-13878.png',
        'type-vehicle-modify': 'stationery/im-10177-supana.svg',
        'type-vehicle-delete': 'sign-mark/im-11911-hosoi-batsu.svg',
        // マスタ
        'type-master-add':    'business/im-12034-keiyaku-sho.svg',
        'type-master-modify': 'education/si-14519-14519.png',
        'type-master-delete': 'sign-mark/im-11911-hosoi-batsu.svg'
    };
    // localStorage に保存されたユーザー選択を優先（プレビューのアイコン編集モードと共有）
    function readStoredSelections() {
        try { return JSON.parse(localStorage.getItem('notifyIconSelections.v1') || '{}'); }
        catch (e) { return {}; }
    }
    function resolveSlot(slotKey) {
        if (!slotKey) return null;
        var sel = readStoredSelections();
        return sel[slotKey] || CN_SLOT_DEFAULT[slotKey] || null;
    }

    // ========== プリミティブ (scope×op) 合成 — Phase N-2.4.3 ==========
    // window.NotifyIconsSelected (notify-icons-selected.js) と
    // localStorage の notifyPrimitives.v1 / notifyTypeOverrides.v1 を統合し、
    // item.scope + item.op の組み合わせから合成アイコン HTML を生成する。
    var CN_PRIMITIVES_KEY = 'notifyPrimitives.v1';
    var CN_OVERRIDES_KEY = 'notifyTypeOverrides.v1';
    function getBuiltInPrimitives() {
        var src = (window.NotifyIconsSelected && window.NotifyIconsSelected.primitives) || {};
        return {
            scope: src.scope || {},
            op: src.op || {}
        };
    }
    function getBuiltInTypeOverrides() {
        return (window.NotifyIconsSelected && window.NotifyIconsSelected.typeOverrides) || {};
    }
    function readStoredPrimitives() {
        try {
            var raw = JSON.parse(localStorage.getItem(CN_PRIMITIVES_KEY) || '{}');
            return { scope: raw.scope || {}, op: raw.op || {} };
        } catch (e) { return { scope: {}, op: {} }; }
    }
    function readStoredTypeOverrides() {
        try { return JSON.parse(localStorage.getItem(CN_OVERRIDES_KEY) || '{}'); }
        catch (e) { return {}; }
    }
    // axis: 'scope' | 'op'。localStorage > 組み込み の順で解決
    function resolvePrimitive(axis, key) {
        if (!key) return null;
        var stored = readStoredPrimitives();
        if (stored[axis] && stored[axis][key]) return stored[axis][key];
        var builtin = getBuiltInPrimitives();
        return builtin[axis][key] || null;
    }
    // (scope, op) → 個別 typeOverride 取得
    function resolveTypeOverride(scope, op) {
        if (!scope || !op) return null;
        var typeKey = scope + '-' + op;
        var stored = readStoredTypeOverrides();
        if (stored[typeKey]) return stored[typeKey];
        var builtin = getBuiltInTypeOverrides();
        return builtin[typeKey] || null;
    }
    // 合成アイコン HTML（マトリクス選定 UI の .cmp-mtx-composed と等価構造）
    // override 優先 → primitive 合成 → null
    function buildComposedIconHtml(scope, op) {
        if (!scope) return null;
        var override = resolveTypeOverride(scope, op);
        if (override) {
            return '<img class="cn-composed-single" src="' + CN_ICON_BASE + override + '" alt="">';
        }
        var basePath = resolvePrimitive('scope', scope);
        var opPath = op ? resolvePrimitive('op', op) : null;
        if (!basePath && !opPath) return null;
        return '<span class="cn-composed">'
            + (basePath ? '<img class="cn-composed-base" src="' + CN_ICON_BASE + basePath + '" alt="">' : '')
            + (opPath ? '<span class="cn-composed-op"><img class="cn-composed-op-img" src="' + CN_ICON_BASE + opPath + '" alt=""></span>' : '')
            + '</span>';
    }
    // item から slotKey を決定（item.slot 明示優先 → type-{bellId}-{type} → 種別フォールバック）
    function resolveItemSlotKey(bellId, item) {
        if (item.slot && CN_SLOT_DEFAULT[item.slot]) return item.slot;
        // 種別エイリアス（LAの new/approve/reject、Pendingの wait など）
        var typeAlias = { new: 'new', approve: 'approve', reject: 'reject', pending: 'wait', wait: 'wait', auto: 'auto' };
        var t = typeAlias[item.type] || item.type;
        var key = 'type-' + bellId + '-' + t;
        if (CN_SLOT_DEFAULT[key]) return key;
        // 共通タイプへのフォールバック（add/modify/delete に寄せる）
        var generic = { add: 'add', new: 'add', modify: 'modify', auto: 'modify', delete: 'delete', reject: 'delete', approve: 'modify', pending: 'modify', wait: 'modify' };
        var g = generic[item.type] || 'modify';
        var genericKey = 'type-ob-' + g;
        return CN_SLOT_DEFAULT[genericKey] ? genericKey : null;
    }
    // アイテム種別 → cn-icon の CSS クラスサフィックス（既存カラーマップに沿わせる）
    function resolveTypeClass(type) {
        var m = { add: 'add', modify: 'modify', delete: 'delete',
                  new: 'new', approve: 'approved', reject: 'rejected',
                  pending: 'pending', wait: 'pending', auto: 'modify',
                  master: 'master', leave: 'leave' };
        return m[type] || 'modify';
    }
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ========== ベル/アイテム 描画 API（Phase N-2.2） ==========
    function getAnchor(bellId) {
        return document.querySelector('.cn-anchor[data-bell="' + bellId + '"]');
    }
    function applyBellIcon(bellId) {
        var path = resolveSlot('bell-' + bellId);
        if (!path) return;
        var img = document.querySelector('[data-bell-icon="' + bellId + '"]');
        if (img) img.src = CN_ICON_BASE + path;
    }
    function buildItemHtml(bellId, item) {
        // Phase N-2.4.3: item.scope + item.op があれば合成優先。
        // type は表示色クラス用に scope-op から推測（add/place→add色、modify/approve→modify色、delete/reject/remove→delete色）。
        var effectiveType = item.type;
        if (!effectiveType && item.op) {
            var opToType = { add: 'add', place: 'add', modify: 'modify', approve: 'approve', delete: 'delete', remove: 'delete', reject: 'reject' };
            effectiveType = opToType[item.op] || 'modify';
        }
        var typeClass = resolveTypeClass(effectiveType);
        var unread = item._read ? '' : ' is-unread';
        // 合成アイコン優先（scope 必須、op はオプション）
        var composedHtml = item.scope ? buildComposedIconHtml(item.scope, item.op) : null;
        var slotKey = composedHtml ? '' : (resolveItemSlotKey(bellId, item) || '');
        var iconPath = composedHtml ? null : resolveSlot(slotKey);
        var iconInner = composedHtml
            ? composedHtml
            : (iconPath ? '<img class="cn-icon-img" src="' + CN_ICON_BASE + iconPath + '" alt="">' : '');
        // expand または affects のいずれかがあればアコーディオン展開可（種別問わず）
        var hasExpand = !!(item.expand || (item.affects && item.affects.length));
        var affectsAttr = (item.affects && item.affects.length)
            ? ' data-affects="' + escapeHtml(item.affects.join(',')) + '"' : '';
        var idAttr = item.id ? ' data-id="' + escapeHtml(item.id) + '"' : '';
        var targetAttr = item.target
            ? ' data-target="' + escapeHtml(JSON.stringify(item.target)) + '"' : '';
        var chevronHtml = hasExpand ? '<span class="cn-chevron">▾</span>' : '';
        var expandHtml = '';
        if (hasExpand) {
            var summary = item.expand ? '<div class="cn-expand-summary">' + escapeHtml(item.expand) + '</div>' : '';
            var hint = (item.affects && item.affects.length)
                ? '<div class="cn-cross-hint" data-affects="' + escapeHtml(item.affects.join(',')) + '"></div>'
                : '';
            expandHtml = '<div class="cn-expand">' + summary + hint + '</div>';
        }
        var scopeAttr = item.scope ? ' data-scope="' + escapeHtml(item.scope) + '"' : '';
        var opAttr = item.op ? ' data-op="' + escapeHtml(item.op) + '"' : '';
        return ''
            + '<div class="cn-item type-' + typeClass + unread + '"'
            +   idAttr
            +   ' data-type="' + escapeHtml(item.type || effectiveType || '') + '"'
            +   (slotKey ? ' data-slot="' + escapeHtml(slotKey) + '"' : '')
            +   scopeAttr
            +   opAttr
            +   affectsAttr
            +   targetAttr + '>'
            +   '<div class="cn-item-row">'
            +     '<div class="cn-icon type-' + typeClass + '">' + iconInner + '</div>'
            +     '<div class="cn-text">'
            +       '<div class="cn-text-main">' + escapeHtml(item.main || '') + '</div>'
            +       (item.sub ? '<div class="cn-text-sub">' + escapeHtml(item.sub) + '</div>' : '')
            +     '</div>'
            +     chevronHtml
            +   '</div>'
            +   expandHtml
            + '</div>';
    }
    // ベル別アイテムストア（addItem/removeItem の差分更新に使用）
    var bellItemsStore = {};
    var idSeq = 0;
    function ensureItemId(bellId, item) {
        if (item.id) return item;
        idSeq += 1;
        item.id = 'cn-' + bellId + '-' + Date.now().toString(36) + '-' + idSeq;
        return item;
    }
    function renderBellLatest(bellId) {
        var body = document.querySelector('[data-bell-body="' + bellId + '"]');
        if (!body) return;
        var items = bellItemsStore[bellId] || [];
        if (items.length === 0) {
            body.innerHTML = '<div class="cn-empty">新しい通知はありません</div>';
            updateBadge(bellId, 0);
            return;
        }
        // item.date 文字列で日付グループ化（順序保持）
        var groups = {};
        var order = [];
        items.forEach(function (item) {
            var d = item.date || '';
            if (!(d in groups)) { groups[d] = []; order.push(d); }
            groups[d].push(item);
        });
        var html = '';
        order.forEach(function (d) {
            html += '<div class="cn-date-group">';
            if (d) {
                html += '<button type="button" class="cn-date-group-head" aria-expanded="true">'
                      + escapeHtml(d)
                      + '<span class="cn-date-group-toggle" aria-hidden="true">▴</span>'
                      + '</button>';
            }
            groups[d].forEach(function (item) {
                html += buildItemHtml(bellId, item);
            });
            html += '</div>';
        });
        body.innerHTML = html;
        updateBadge(bellId);
    }
    function setItems(bellId, items) {
        items = (items || []).map(function (it) {
            return ensureItemId(bellId, Object.assign({}, it));
        });
        bellItemsStore[bellId] = items;
        renderBellLatest(bellId);
    }
    // 各画面JSが発信時に呼ぶ。先頭に追加（最新順）。id を返す。
    function addItem(bellId, item) {
        if (!bellItemsStore[bellId]) bellItemsStore[bellId] = [];
        var clone = ensureItemId(bellId, Object.assign({}, item));
        bellItemsStore[bellId].unshift(clone);
        renderBellLatest(bellId);
        return clone.id;
    }
    // 各画面JSが「変更が取り消された」「対応済み」を通知するため
    function removeItem(bellId, itemId) {
        var arr = bellItemsStore[bellId];
        if (!arr || !itemId) return false;
        var before = arr.length;
        bellItemsStore[bellId] = arr.filter(function (it) { return it.id !== itemId; });
        if (bellItemsStore[bellId].length === before) return false;
        renderBellLatest(bellId);
        return true;
    }
    function clearItems(bellId) {
        bellItemsStore[bellId] = [];
        renderBellLatest(bellId);
    }
    function getItems(bellId) {
        return (bellItemsStore[bellId] || []).slice();
    }
    function updateBadge(bellId, count) {
        var anchor = getAnchor(bellId);
        if (!anchor) return;
        if (count == null) {
            count = anchor.querySelectorAll('.cn-item.is-unread').length;
        }
        var badge = anchor.querySelector('.cn-trigger-badge');
        if (!badge) return;
        if (count > 0) {
            badge.textContent = String(count);
            badge.hidden = false;
        } else {
            badge.textContent = '0';
            badge.hidden = true;
        }
    }

    // (N-2.2 にあった「すべて既読」の重複ハンドラは N-2.3 で統合。上の cn-mark-all ハンドラに集約済み)

    // ========== クロス画面ヒント（Phase N-2.2 / 簡易版） ==========
    // 本格的な画面遷移ロジックは Phase N-5 で実装。本フェーズではヒント表示と alert モック動作。
    var CN_PAGE_LABELS = {
        'order-book':        'OB（受注簿）',
        'screen-layout':     'SL（業務管理計画書）',
        'weekly-schedule':   'WS（週間予定表）',
        'leave-application': 'LA（休暇申請）',
        'quick-access':      'QA（モバイル）',
        'master':            'マスタ管理'
    };
    function getCurrentPage() {
        var p = (typeof location !== 'undefined' ? location.pathname : '') || '';
        if (p.indexOf('screen-layout') !== -1)     return 'screen-layout';
        if (p.indexOf('order-book') !== -1)        return 'order-book';
        if (p.indexOf('weekly-schedule') !== -1)   return 'weekly-schedule';
        if (p.indexOf('leave-application') !== -1) return 'leave-application';
        if (p.indexOf('quick-access') !== -1)      return 'quick-access';
        return '';
    }
    function renderCrossHintsIn(item) {
        if (!item) return;
        var hintEl = item.querySelector(':scope > .cn-expand > .cn-cross-hint');
        if (!hintEl) return;
        var affects = (hintEl.dataset.affects || '').split(',')
            .map(function (s) { return s.trim(); }).filter(Boolean);
        if (affects.length === 0) { hintEl.innerHTML = ''; return; }
        var current = getCurrentPage();
        var html = '';
        if (affects.indexOf(current) >= 0) {
            html += '<span class="cn-cross-hint-in-context">現在画面（'
                  + (CN_PAGE_LABELS[current] || current)
                  + '）で対象セルがフラッシュされます</span>';
        } else {
            html += '<span class="cn-cross-hint-out">現在画面（'
                  + (CN_PAGE_LABELS[current] || current || '—')
                  + '）には波及しません</span>';
        }
        var others = affects.filter(function (a) { return a !== current; });
        if (others.length > 0) {
            html += '<span class="cn-cross-jumps">';
            others.forEach(function (a) {
                html += '<button type="button" class="cn-cross-jump-btn" data-target="'
                      + escapeHtml(a) + '">'
                      + escapeHtml(CN_PAGE_LABELS[a] || a) + ' で開く ↗</button>';
            });
            html += '</span>';
        }
        hintEl.innerHTML = html;
    }
    // アイテム展開時にヒントを描画（既存のアイテムクリックハンドラとは別経路で動作）
    document.addEventListener('click', function (e) {
        var row = e.target.closest('.cn-item-row');
        if (!row) return;
        if (e.target.closest('.cn-jump-btn')) return;
        if (e.target.closest('.cn-cross-jump-btn')) return;
        var item = row.parentElement;
        if (!item) return;
        // 既存ハンドラで is-expanded が付いた直後にヒント描画
        if (item.classList.contains('is-expanded')) {
            renderCrossHintsIn(item);
        }
    });
    // 「○○で開く ↗」ボタン: 本フェーズではモック動作（N-5 で本実装）
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-cross-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        var target = btn.dataset.target || '';
        var label = CN_PAGE_LABELS[target] || target;
        // 簡易モック: alert で確認だけ。実装は N-5 (クロス画面フラッシュ Phase)
        alert('クロス画面ジャンプ:\n' + label + ' を新タブで開き、対象セルへフラッシュします。\n（本実装は Phase N-5）');
    });

    // ========== 履歴タブ描画 API（Phase N-2.2 / P3 ハイブリッド） ==========
    // setHistory(bellId, config) で履歴タブを構築。
    // config = {
    //   businessAxis: { tab, search, prefix, groups: [{title, items}], companies, sites },
    //   accountAxis:  { tab, search, prefix, groups: [{title, items}], accounts }
    // }
    function buildAxisGroupsHtml(bellId, axisCfg) {
        return axisCfg.groups.map(function (g) {
            var itemsHtml = g.items.map(function (it) {
                // 履歴アイテムは既読扱い。expand/affects は保持し、modify系はアコーディオン展開可
                var clone = {};
                Object.keys(it).forEach(function (k) { clone[k] = it[k]; });
                clone._read = true;
                return buildItemHtml(bellId, clone);
            }).join('');
            return ''
                + '<div class="cn-axis-group">'
                +   '<button type="button" class="cn-axis-group-head" aria-expanded="true">'
                +     escapeHtml(g.title)
                +     '<span class="cn-axis-group-toggle" aria-hidden="true">▴</span>'
                +   '</button>'
                +   itemsHtml
                + '</div>';
        }).join('');
    }
    function buildPickViewHtml(axisCfg, kind) {
        if (kind === 'account') {
            var accountBadges = (axisCfg.accounts || []).map(function (a) {
                return '<button type="button" class="cn-pick-badge">' + escapeHtml(a) + '</button>';
            }).join('');
            return ''
                + '<div class="cn-pick-view" data-crumb-base="' + escapeHtml(axisCfg.prefix || '') + '"'
                +     ' data-step1-label="' + escapeHtml((axisCfg.prefix || '') + 'を選択') + '">'
                +   '<div class="cn-pick-head">'
                +     '<button type="button" class="cn-pick-back" aria-label="戻る">←</button>'
                +     '<div class="cn-pick-crumbs"></div>'
                +   '</div>'
                +   '<div class="cn-pick-step is-active" data-step="account">'
                +     '<div class="cn-pick-badges">' + accountBadges + '</div>'
                +   '</div>'
                + '</div>';
        }
        var companyBadges = (axisCfg.companies || []).map(function (c) {
            return '<button type="button" class="cn-pick-badge" data-company="'
                 + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
        }).join('');
        var siteGroups = Object.keys(axisCfg.sites || {}).map(function (c) {
            var siteBadges = (axisCfg.sites[c] || []).map(function (s) {
                return '<button type="button" class="cn-pick-badge">' + escapeHtml(s) + '</button>';
            }).join('');
            return '<div class="cn-pick-badges" data-company="' + escapeHtml(c) + '" hidden>'
                 + siteBadges + '</div>';
        }).join('');
        return ''
            + '<div class="cn-pick-view" data-crumb-base="' + escapeHtml(axisCfg.prefix || '') + '"'
            +     ' data-step1-label="契約先を選択">'
            +   '<div class="cn-pick-head">'
            +     '<button type="button" class="cn-pick-back" aria-label="戻る">←</button>'
            +     '<div class="cn-pick-crumbs"></div>'
            +   '</div>'
            +   '<div class="cn-pick-step is-active" data-step="company">'
            +     '<div class="cn-pick-badges">' + companyBadges + '</div>'
            +   '</div>'
            +   '<div class="cn-pick-step" data-step="site">' + siteGroups + '</div>'
            + '</div>';
    }
    function buildHistoryViewHtml(bellId, axisCfg, viewKey, kind) {
        return ''
            + '<div class="cn-history-view' + (viewKey === 'business' ? ' is-active' : '')
            +     '" data-view="' + viewKey + '">'
            +   '<div class="cn-history-toolbar">'
            +     '<div class="cn-search-row">'
            +       '<div class="cn-search">'
            +         '<input type="text" placeholder="' + escapeHtml(axisCfg.search || '検索...')
            +           + '" aria-label="' + escapeHtml(axisCfg.search || '検索') + '">'
            +       '</div>'
            +       '<button type="button" class="cn-list-pick-btn" data-prefix="'
            +         escapeHtml(axisCfg.prefix || '') + '">'
            +         '<span class="cn-list-pick-label">一覧</span>'
            +         '<span class="cn-list-pick-clear" aria-label="選択解除">×</span>'
            +       '</button>'
            +     '</div>'
            +     '<div class="cn-filter-chips">'
            +       '<button type="button" class="cn-filter-chip is-active" data-filter="all">すべて</button>'
            +       '<button type="button" class="cn-filter-chip" data-filter="add">追加</button>'
            +       '<button type="button" class="cn-filter-chip" data-filter="modify">変更</button>'
            +       '<button type="button" class="cn-filter-chip" data-filter="delete">削除</button>'
            +     '</div>'
            +   '</div>'
            +   '<div class="cn-body cn-body--history">' + buildAxisGroupsHtml(bellId, axisCfg) + '</div>'
            +   buildPickViewHtml(axisCfg, kind)
            + '</div>';
    }
    function buildHistoryLayoutHtml(bellId, cfg) {
        return ''
            + '<div class="cn-history-layout">'
            +   '<div class="cn-side-tabs">'
            +     '<button type="button" class="cn-side-tab is-active" data-view="business">'
            +       escapeHtml(cfg.businessAxis.tab) + '</button>'
            +     '<button type="button" class="cn-side-tab" data-view="account">'
            +       escapeHtml(cfg.accountAxis.tab) + '</button>'
            +   '</div>'
            +   '<div class="cn-history-main">'
            +     buildHistoryViewHtml(bellId, cfg.businessAxis, 'business', 'business')
            +     buildHistoryViewHtml(bellId, cfg.accountAxis,  'account',  'account')
            +   '</div>'
            + '</div>';
    }
    function setHistory(bellId, cfg) {
        var anchor = getAnchor(bellId);
        if (!anchor) return;
        var view = anchor.querySelector('.cn-tab-view[data-tab="history"]');
        if (!view) return;
        if (!cfg || !cfg.businessAxis || !cfg.accountAxis) {
            view.innerHTML = '<div class="cn-empty">履歴はありません</div>';
            return;
        }
        view.innerHTML = buildHistoryLayoutHtml(bellId, cfg);
    }

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
        },
        // Phase N-2.2 追加 API
        applyBellIcon: applyBellIcon,
        setItems: setItems,
        addItem: addItem,
        removeItem: removeItem,
        clearItems: clearItems,
        getItems: getItems,
        setHistory: setHistory,
        updateBadge: updateBadge,
        renderCrossHintsIn: renderCrossHintsIn,
        getCurrentPage: getCurrentPage,
        iconBase: CN_ICON_BASE,
        slotDefault: CN_SLOT_DEFAULT,
        pageLabels: CN_PAGE_LABELS,
        // Phase N-2.4.3 追加
        buildComposedIconHtml: buildComposedIconHtml,
        resolvePrimitive: resolvePrimitive,
        resolveTypeOverride: resolveTypeOverride
    };
})();
