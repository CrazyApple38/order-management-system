/* ============================================================
   co-notify-panel.js — レール通知カード (cn-card) 共通挙動
   R-2 (2026-07-03) 簡素化モデル §3.7.8:
   - 統合ベル1個 (.cn-trigger) クリックで .cn-anchor 内の .cn-card を開閉
   - カテゴリはエンティティ導出 (§3.7.9): 受注/配置/申請・承認/マスタ
   - 対象日 (targetDate) 基準の日別グルーピング + カテゴリフィルタチップ
   - アイテムアコーディオン (diffs / クロスジャンプ / cn:action ボタン)
   - 「すべて既読」 + フッター「変更通知センターで開く →」
   - 履歴タブ・検索・一覧選択フローは撤去 (集積・検索はセンターの責務)
   ============================================================ */
(function () {
    'use strict';

    function currentNotificationPage() {
        var path = location.pathname;
        if (path.indexOf('screen-layout') !== -1) return 'screen-layout';
        if (path.indexOf('order-book') !== -1) return 'order-book';
        if (path.indexOf('weekly-schedule') !== -1) return 'weekly-schedule';
        if (path.indexOf('leave-application') !== -1) return 'leave-application';
        if (path.indexOf('quick-access') !== -1) return 'quick-access';
        if (path.indexOf('master-management') !== -1) return 'master-management';
        return '';
    }

    function isItemInvolved(item) {
        if (typeof item.involved === 'boolean') return item.involved;
        var page = currentNotificationPage();
        if (!page) return true;
        if (page === 'master-management' && deriveCategory(item, item.sourceBell) === 'master') return true;
        if (item.primaryPage === page) return true;
        return Array.isArray(item.affects) && item.affects.indexOf(page) !== -1;
    }

    // ========== 通知ジャンプ先フォーカス ==========
    var focusOverlayState = {
        timer: null,
        targets: [],
        hole: null,
        reposition: null,
        onDismiss: null
    };

    function normalizeElements(input) {
        if (!input) return [];
        if (input instanceof Element) return [input];
        return Array.prototype.slice.call(input).filter(function (el) {
            return el instanceof Element;
        });
    }

    function clearFocusOverlay() {
        if (focusOverlayState.timer) {
            clearTimeout(focusOverlayState.timer);
            focusOverlayState.timer = null;
        }
        if (focusOverlayState.onDismiss) {
            document.removeEventListener('click', focusOverlayState.onDismiss, true);
            focusOverlayState.onDismiss = null;
        }
        if (focusOverlayState.reposition) {
            window.removeEventListener('scroll', focusOverlayState.reposition, true);
            window.removeEventListener('resize', focusOverlayState.reposition);
            focusOverlayState.reposition = null;
        }
        if (focusOverlayState.hole && focusOverlayState.hole.parentNode) {
            focusOverlayState.hole.parentNode.removeChild(focusOverlayState.hole);
        }
        focusOverlayState.hole = null;
        focusOverlayState.targets = [];
    }

    // 対象要素群の外接矩形（viewport 座標）を返す
    function unionTargetRect(els) {
        var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        els.forEach(function (el) {
            var rc = el.getBoundingClientRect();
            if (rc.width === 0 && rc.height === 0) return;
            if (rc.left < l) l = rc.left;
            if (rc.top < t) t = rc.top;
            if (rc.right > r) r = rc.right;
            if (rc.bottom > b) b = rc.bottom;
        });
        if (l === Infinity) return null;
        return { left: l, top: t, width: r - l, height: b - t };
    }

    // 外接矩形をスクロール祖先の可視領域で切り詰める（2026-07-20）。
    // 横スクロールする表では画面外の列の rect まで union されるため、
    // クリップしないとスポットライトが表の外（SL では右プロパティ列）まで広がる。
    function clipRectToScrollAncestors(rect, el) {
        if (!rect || !el) return rect;
        var l = rect.left, t = rect.top, r = rect.left + rect.width, b = rect.top + rect.height;
        var node = el.parentElement;
        while (node && node.nodeType === 1) {
            var cs = window.getComputedStyle(node);
            if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
                var rc = node.getBoundingClientRect();
                if (rc.left > l) l = rc.left;
                if (rc.top > t) t = rc.top;
                if (rc.right < r) r = rc.right;
                if (rc.bottom < b) b = rc.bottom;
            }
            node = node.parentElement;
        }
        if (r <= l || b <= t) return null;
        return { left: l, top: t, width: r - l, height: b - t };
    }

    // 通知ジャンプ着地演出: 画面全体を暗転し、対象セル（複数なら外接矩形）だけを
    // くり抜いて明るく残すスポットライト。透明な穴要素に外向き box-shadow を掛けて
    // 周囲を一括で暗くする方式（候補セル単位ではなく画面全体が一様に暗くなる）。
    // opts.candidateSelector は後方互換のため受け取るが使用しない。
    function showFocusOverlay(targetsInput, options) {
        var targets = normalizeElements(targetsInput);
        if (!targets.length) return;
        var opts = options || {};
        var duration = opts.duration || 3500;

        clearFocusOverlay();

        var hole = document.createElement('div');
        hole.className = 'cn-focus-spotlight';
        hole.style.animationDuration = duration + 'ms';
        document.body.appendChild(hole);

        focusOverlayState.targets = targets;
        focusOverlayState.hole = hole;
        focusOverlayState.reposition = function () {
            var rect = unionTargetRect(focusOverlayState.targets);
            rect = clipRectToScrollAncestors(rect, focusOverlayState.targets[0]);
            if (!rect) {
                hole.style.display = 'none';
                return;
            }
            hole.style.display = '';
            hole.style.left = rect.left + 'px';
            hole.style.top = rect.top + 'px';
            hole.style.width = rect.width + 'px';
            hole.style.height = rect.height + 'px';
        };
        focusOverlayState.reposition();
        window.addEventListener('scroll', focusOverlayState.reposition, true);
        window.addEventListener('resize', focusOverlayState.reposition);

        focusOverlayState.timer = setTimeout(clearFocusOverlay, duration);
        focusOverlayState.onDismiss = function () { clearFocusOverlay(); };
        setTimeout(function () {
            if (focusOverlayState.onDismiss) {
                document.addEventListener('click', focusOverlayState.onDismiss, true);
            }
        }, 0);
    }

    window.coNotifyFocusOverlay = {
        show: showFocusOverlay,
        clear: clearFocusOverlay
    };

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
        // カード内の閉じるボタン
        var closeBtn = e.target.closest('.cn-close');
        if (closeBtn) {
            var closeAnchor = closeBtn.closest('.cn-anchor');
            if (closeAnchor) closeAnchor.classList.remove('is-open');
            return;
        }
        // カード外クリック → 閉じる
        if (!e.target.closest('.cn-card')) {
            closeAllPanels(null);
        }
    });

    // Escape キーで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeAllPanels(null);
    });

    // ========== フィルタチップ ==========
    // cn-card: カテゴリ (すべて / 受注 / 配置 / 申請・承認 / マスタ)
    // - 「すべて」を選択 → 他すべて解除
    // - 個別チップを選択 → 「すべて」解除 + 該当チップを多重選択トグル
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
        var view = group.closest('.cn-card');
        if (view) applyCnFilters(view);
    });

    // ========== フィルタ適用 ==========
    function getActiveFilterValues(view) {
        var group = view.querySelector('.cn-filter-chips[data-filter-group="category"], .cn-filter-chips:not([data-filter-group])');
        if (!group) return null; // フィルタ無し → 全件表示
        var allChip = group.querySelector('.cn-filter-chip[data-filter="all"]');
        if (allChip && allChip.classList.contains('is-active')) return null;
        var values = [];
        group.querySelectorAll('.cn-filter-chip.is-active').forEach(function (c) {
            if (c.dataset.filter && c.dataset.filter !== 'all') values.push(c.dataset.filter);
        });
        return values.length > 0 ? values : null;
    }

    function getActiveScope(view) {
        var group = view.querySelector('.cn-filter-chips[data-filter-group="scope"]');
        if (!group) return 'all';
        var active = group.querySelector('.cn-filter-chip.is-active');
        return active ? (active.dataset.filter || 'all') : 'all';
    }

    function applyCnFilters(view) {
        if (!view) return;
        var values = getActiveFilterValues(view);
        var scope = getActiveScope(view);

        // 1) アイテム単位で絞り込み (data-category = エンティティ導出)
        view.querySelectorAll('.cn-item').forEach(function (item) {
            var key = item.dataset.category || '';
            var valueOk = !values || values.indexOf(key) !== -1;
            var scopeOk = scope !== 'involved' || item.dataset.involved !== 'false';
            item.classList.toggle('is-hidden', !valueOk || !scopeOk);
        });

        // 2) グループ単位で全アイテム非表示なら自身も非表示
        view.querySelectorAll('.cn-axis-group, .cn-date-group').forEach(function (g) {
            var visible = g.querySelector('.cn-item:not(.is-hidden)');
            g.classList.toggle('is-hidden', !visible);
        });

        var visibleItems = view.querySelectorAll('.cn-item:not(.is-hidden)');
        var count = view.querySelector('.cn-count');
        if (count) count.textContent = visibleItems.length ? visibleItems.length + '件' : '';
        var anchor = view.closest('.cn-anchor');
        if (anchor) {
            updateBadge(anchor.dataset.bell || 'all', view.querySelectorAll('.cn-item.is-unread:not(.is-hidden)').length);
        }
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

    // (QA モバイル互換セクションは R-3e で QA が新カードへ移行したため撤去 2026-07-10)

    // ========== アイテムクリック ==========
    // - cn-expand 有り: 排他アコーディオン展開（同パネル内の他は閉じる / フラッシュ発火なし）
    // - cn-expand 無し: 即ジャンプ + cn:jump 発火
    // - cn:jump detail は §6.5 仕様に準拠（item, source, affects, inContext, type, slot, target）
    function parseItemTarget(item) {
        if (!item || !item.dataset || !item.dataset.target) return null;
        try { return JSON.parse(item.dataset.target); }
        catch (err) { return null; }
    }
    function targetOwnerPage(rawTarget) {
        if (!rawTarget || !rawTarget.axis) return '';
        var axisPage = {
            orderId: 'order-book',
            orderBookEntry: 'order-book',
            siteName: 'screen-layout',
            slRow: 'screen-layout',
            wsCell: 'weekly-schedule',
            leaveId: 'leave-application',
            vehicleSchedule: 'leave-application',
            qaCell: 'quick-access'
        };
        return axisPage[rawTarget.axis] || '';
    }
    var CN_PAGE_TARGET_AXES = {
        'order-book':        ['orderId', 'siteName'],
        'screen-layout':     ['siteName', 'orderId', 'wsCell'],
        'weekly-schedule':   ['wsCell', 'siteName', 'orderId', 'leaveId'],
        'leave-application': ['leaveId', 'vehicleSchedule'],
        'quick-access':      ['qaCell']
    };
    function currentStoreDateKey() {
        return (window.OmsMockStore && window.OmsMockStore.getCurrentDate && window.OmsMockStore.getCurrentDate()) || '';
    }
    function isTargetDateVisibleOnPage(rawTarget, page) {
        if (!rawTarget || !rawTarget.date) return true;
        // SL is a single-day screen. Only flash WS-origin cells on SL when the dates match.
        if (page === 'screen-layout') {
            return String(rawTarget.date) === String(currentStoreDateKey());
        }
        return true;
    }
    function canPageHandleTarget(rawTarget, page) {
        if (!rawTarget || !rawTarget.axis || !page) return false;
        var axes = CN_PAGE_TARGET_AXES[page] || [];
        return axes.indexOf(rawTarget.axis) >= 0 && isTargetDateVisibleOnPage(rawTarget, page);
    }
    function resolveTargetForPage(rawTarget, page) {
        if (!rawTarget || !page) return null;
        if (rawTarget.axis) {
            return (targetOwnerPage(rawTarget) === page || canPageHandleTarget(rawTarget, page)) ? rawTarget : null;
        }
        var pageTarget = rawTarget[page] || null;
        return isTargetDateVisibleOnPage(pageTarget, page) ? pageTarget : null;
    }
    function targetPages(rawTarget) {
        if (!rawTarget) return [];
        if (rawTarget.axis) {
            var owner = targetOwnerPage(rawTarget);
            return owner ? [owner] : [];
        }
        return Object.keys(rawTarget).filter(function (key) {
            return !!(rawTarget[key] && rawTarget[key].axis);
        });
    }
    function sourceToPrimaryPage(source) {
        var map = {
            ob: 'order-book',
            sl: 'screen-layout',
            ws: 'weekly-schedule',
            la: 'leave-application',
            pending: 'leave-application',
            vehicle: 'screen-layout',
            order: 'order-book',
            assignment: 'screen-layout',
            approval: 'leave-application'
        };
        return map[source] || '';
    }
    function inferDomain(source, scope) {
        if (source === 'ob' || scope === 'row' || scope === 'site' || scope === 'badge') return 'order';
        if (scope === 'employee' || scope === 'support') return 'person-assignment';
        if (scope === 'vehicle' || source === 'vehicle') return 'vehicle-assignment';
        if (scope === 'reservation') return 'support-reservation';
        if (scope === 'application' || source === 'la' || source === 'pending') return 'leave';
        if (source === 'master') return 'master';
        return '';
    }
    function inferPrimaryPage(source, scope, rawTarget) {
        var domain = inferDomain(source, scope);
        var domainPrimary = {
            order: 'order-book',
            'person-assignment': 'screen-layout',
            'vehicle-assignment': 'screen-layout',
            'support-reservation': 'weekly-schedule',
            leave: 'leave-application',
            master: 'order-book'
        };
        var firstTarget = targetPages(rawTarget)[0] || '';
        return domainPrimary[domain] || firstTarget || sourceToPrimaryPage(source);
    }
    function buildJumpDetail(item, pageOverride) {
        var affects = (item.dataset.affects || '').split(',')
            .map(function (s) { return s.trim(); }).filter(Boolean);
        var page = pageOverride || getCurrentPage();
        var anchor = item.closest('.cn-anchor[data-bell]');
        var source = item.dataset.sourceBell || (anchor ? anchor.dataset.bell : '');
        var rawTarget = parseItemTarget(item);
        var target = resolveTargetForPage(rawTarget, page);
        var scope = item.dataset.scope || '';
        var domain = item.dataset.domain || inferDomain(source, scope);
        var primaryPage = item.dataset.primaryPage || inferPrimaryPage(source, scope, rawTarget);
        var inContext = !!(page && target && affects.indexOf(page) !== -1);
        var diffs = null;
        if (item.dataset.diffs) {
            try { diffs = JSON.parse(item.dataset.diffs); }
            catch (err) { diffs = null; }
        }
        return {
            item: item,
            source: source,
            affects: affects,
            inContext: inContext,
            page: page,
            domain: domain,
            primaryPage: primaryPage,
            type: item.dataset.type || '',
            op: item.dataset.op || '',
            scope: scope,
            slot: item.dataset.slot || '',
            target: target,
            rawTarget: rawTarget,
            targetPages: targetPages(rawTarget),
            diffs: diffs
        };
    }
    function fireJump(item) {
        var detail = buildJumpDetail(item);
        var ev = new CustomEvent('cn:jump', {
            bubbles: true,
            detail: detail
        });
        item.dispatchEvent(ev);
    }
    function shouldKeepExpandedAfterJump(detail) {
        if (!detail || !detail.inContext || !detail.target) return false;
        // アクションボタン付き (元に戻す等) はジャンプ後もパネル・展開を維持する
        // (閉じるとボタンへ到達できなくなるため。R-3e QA で導入・全画面共通の一般則)
        if (detail.item && detail.item.querySelector('.cn-action-btn')) return true;
        if (detail.primaryPage && detail.primaryPage !== detail.page) return true;
        var sourcePage = sourceToPrimaryPage(detail.source);
        if (sourcePage && sourcePage !== detail.page) return true;
        var ownerPage = targetOwnerPage(detail.target);
        return !!(ownerPage && ownerPage !== detail.page);
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
        if (e.target.closest('.cn-action-btn')) return;
        var item = row.parentElement;
        if (!item) return;
        if (item.dataset.locked) return; // ロック済み: 展開もジャンプもしない（重複操作防止）

        var hasExpand = !!item.querySelector(':scope > .cn-expand');
        if (!hasExpand) {
            // アコーディオン無し → 即ジャンプ + 既読化 + バッジ更新
            markItemReadAndRefresh(item);
            fireJump(item);
            return;
        }
        var currentDetail = buildJumpDetail(item);
        if (currentDetail.inContext && currentDetail.target) {
            markItemReadAndRefresh(item);
            fireJump(item);
            if (shouldKeepExpandedAfterJump(currentDetail)) {
                var currentPanel = item.closest('.cn-card');
                if (currentPanel) {
                    currentPanel.querySelectorAll('.cn-item.is-expanded').forEach(function (other) {
                        if (other !== item) setItemExpanded(other, false);
                    });
                }
                setItemExpanded(item, true);
                renderCrossHintsIn(item);
                return;
            }
            var currentAnchor = item.closest('.cn-anchor[data-bell]');
            if (currentAnchor && window.coNotifyPanel && typeof window.coNotifyPanel.close === 'function') {
                window.coNotifyPanel.close(currentAnchor);
            }
            return;
        }
        var willOpen = !item.classList.contains('is-expanded');
        if (willOpen) {
            // 排他: 同じカード/パネル内の他の展開済みアイテムを閉じる
            var panel = item.closest('.cn-card');
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

    // アクションボタン (復旧 / 復旧キャンセル等) — cn:action を発火し、各ページ/ナビバーが処理
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-action-btn');
        if (!btn) return;
        e.stopPropagation();
        var action = btn.getAttribute('data-cn-action') || '';
        var item = btn.closest('.cn-item');
        var ev = new CustomEvent('cn:action', {
            bubbles: true,
            detail: { action: action, item: item }
        });
        (item || document).dispatchEvent(ev);
    });

    // ========== すべて既読 ==========
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-mark-all');
        if (!btn) return;
        var panel = btn.closest('.cn-card');
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

    // ========== 「変更通知センターで開く →」 (R-2 導線 / 同タブ遷移) ==========
    // 集積・検索はセンターの責務 (§3.7.8)。現状はプレビューのセンターモックへ接続 (R-4 で改修予定)。
    var CN_CENTER_URL = 'preview/change-notification-center-mockup.html';
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-center-link');
        if (!btn) return;
        e.stopPropagation();
        window.location.href = CN_CENTER_URL;
    });

    // ========== ベル/アイテム アイコン解決（Phase N-2.2） ==========
    // 27スロット既定アイコン（notify-icons-selected.json 2026-05-16 確定）。
    // 各画面の HTML から見た相対パスは `assets/icons/...`（docs/ 配下に置かれる前提）。
    var CN_ICON_BASE = 'assets/icons/';
    var CN_SLOT_DEFAULT = {
        // 統合ベル (R-2 / 1ベル化)
        'bell-all':        'sign-mark/im-00155-beru-no-aikon-sozai-sono-5.svg',
        // ベル4分類
        'bell-order':      'business/si-46623-personal-information.png',
        'bell-assignment': 'stationery/im-12555-karendaa.svg',
        'bell-approval':   'sign-mark/si-8681-8681.png',
        'bell-master':     'sign-mark/im-00001-muryou-no-settei-haguruma.svg',
        // 旧ベルID（API互換用）
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
        var legacyBellSlots = {
            'bell-order': 'bell-ob',
            'bell-assignment': 'bell-ws',
            'bell-approval': 'bell-la'
        };
        var legacySlot = legacyBellSlots[slotKey];
        return sel[slotKey] || (legacySlot ? sel[legacySlot] : null) || CN_SLOT_DEFAULT[slotKey] || null;
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
    // アイテム種別 → cn-item の CSS クラスサフィックス（既存カラーマップに沿わせる）
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

    // ========== ベル/アイテム 描画 API（Phase N-2.2 → R-2 で1ベル統合） ==========
    // 旧ベルID (ob/sl/ws/la/pending/vehicle/master) と旧4分類ID (order/assignment/
    // approval/master) はすべて統合ベル 'all' へ吸収する。旧IDは sourceBell として
    // 保持し、カテゴリはエンティティ (domain) から導出する (§3.7.9)。
    var CN_UNIFIED_BELL = 'all';
    var CN_BELL_ALIASES = Object.assign({
        ob: 'order',
        sl: 'assignment',
        ws: 'assignment',
        vehicle: 'assignment',
        la: 'approval',
        pending: 'approval',
        master: 'master'
    }, window.coNotifyBellAliases || {});
    // エンティティ (domain) → 通知カテゴリ (§3.7.9 の導出ルール)
    var CN_DOMAIN_CATEGORY = {
        order: 'order',
        'person-assignment': 'assignment',
        'vehicle-assignment': 'assignment',
        'support-reservation': 'assignment',
        leave: 'approval',
        master: 'master'
    };
    var CN_CATEGORY_LABELS = {
        order: '受注',
        assignment: '配置',
        approval: '申請・承認',
        master: 'マスタ'
    };
    // 配置カテゴリのサブタグ (R-2 確定: 自社/応援/協力業者/車両・ETC)
    var CN_SUBTAG_LABELS = {
        own: '自社',
        support: '応援',
        partner: '協力業者',
        vehicle: '車両・ETC'
    };
    function normalizeBellId(bellId) {
        // R-2: DOM 上のベルは統合1個のみ。どの旧IDで呼ばれても 'all' に解決する。
        return CN_UNIFIED_BELL;
    }
    // カテゴリ導出: 明示 category > domain > inferDomain(発信元, scope) > 旧エイリアス
    function deriveCategory(item) {
        if (!item) return 'master';
        if (item.category && CN_CATEGORY_LABELS[item.category]) return item.category;
        var domain = item.domain || inferDomain(item.sourceBell || '', item.scope || '');
        if (CN_DOMAIN_CATEGORY[domain]) return CN_DOMAIN_CATEGORY[domain];
        var alias = CN_BELL_ALIASES[item.sourceBell || ''];
        return (alias && CN_CATEGORY_LABELS[alias]) ? alias : 'master';
    }
    // サブタグ導出 (配置カテゴリのみ): 明示 subTag > 車両系 > 応援配置 > 予約系(協力業者) > 自社
    function deriveSubTag(item, category) {
        if (category !== 'assignment' || !item) return '';
        if (item.subTag && CN_SUBTAG_LABELS[item.subTag]) return item.subTag;
        var domain = item.domain || '';
        var scope = item.scope || '';
        if (domain === 'vehicle-assignment' || scope === 'vehicle') return 'vehicle';
        if (scope === 'support') return 'support';
        if (domain === 'support-reservation' || scope === 'reservation') return 'partner';
        return 'own';
    }
    function normalizeItemForBell(sourceBell, item) {
        var clone = Object.assign({}, item || {});
        if (!clone.sourceBell) clone.sourceBell = sourceBell;
        return clone;
    }
    function getAnchor(bellId) {
        return document.querySelector('.cn-anchor[data-bell="' + normalizeBellId(bellId) + '"]');
    }
    function applyBellIcon(bellId) {
        bellId = normalizeBellId(bellId);
        var path = resolveSlot('bell-' + bellId);
        if (!path) return;
        var img = document.querySelector('[data-bell-icon="' + bellId + '"]');
        if (img) img.src = CN_ICON_BASE + path;
    }
    function normalizeDiffValue(value) {
        if (value === null || value === undefined || value === '') return '(空)';
        return String(value);
    }
    function cnParseDateKey(value) {
        var m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return null;
        return {
            year: parseInt(m[1], 10),
            month: parseInt(m[2], 10),
            day: parseInt(m[3], 10)
        };
    }
    function cnCurrentDateParts() {
        var key = '';
        if (window.OmsMockStore && typeof window.OmsMockStore.getCurrentDate === 'function') {
            key = window.OmsMockStore.getCurrentDate();
        }
        var parts = cnParseDateKey(key);
        if (parts) return parts;
        var now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    }
    function cnDatePartsToTime(parts) {
        return new Date(parts.year, parts.month - 1, parts.day).getTime();
    }
    function cnFormatTargetDateBadge(parts) {
        if (!parts || !parts.month || !parts.day) return '';
        var d = new Date(parts.year, parts.month - 1, parts.day);
        var weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        var md = parts.month + '/' + parts.day + '（' + weekdays[d.getDay()] + '）';
        var base = cnCurrentDateParts();
        return (parts.year && parts.year !== base.year) ? parts.year + '/' + md : md;
    }
    function cnFirstTarget(target) {
        if (!target) return null;
        if (target.axis) return target;
        var pages = Object.keys(target);
        for (var i = 0; i < pages.length; i += 1) {
            var t = target[pages[i]];
            if (t && typeof t === 'object') return t;
        }
        return null;
    }
    // targetDate (R-2 第一級ファセット): 単日 = 'YYYY-MM-DD' 文字列 / 範囲 = { start, end }。
    // 未指定時は target の date / day から導出する (後方互換)。
    function cnTargetDateRange(item) {
        if (item && item.targetDate) {
            if (typeof item.targetDate === 'string') {
                var single = cnParseDateKey(item.targetDate);
                return single ? { start: single, end: null } : null;
            }
            if (typeof item.targetDate === 'object') {
                var start = cnParseDateKey(item.targetDate.start);
                var end = cnParseDateKey(item.targetDate.end);
                if (start) return { start: start, end: end };
            }
        }
        var target = cnFirstTarget(item ? item.target : null);
        if (!target) return null;
        var fromDate = cnParseDateKey(target.date);
        if (fromDate) return { start: fromDate, end: null };
        if (target.day != null && target.day !== '') {
            var base = cnCurrentDateParts();
            var day = parseInt(target.day, 10);
            if (Number.isFinite(day)) return { start: { year: base.year, month: base.month, day: day }, end: null };
        }
        return null;
    }
    function cnFormatTargetDateRange(range) {
        if (!range || !range.start) return '';
        var label = cnFormatTargetDateBadge(range.start);
        if (range.end && (range.end.year !== range.start.year ||
                          range.end.month !== range.start.month ||
                          range.end.day !== range.start.day)) {
            label += '〜' + cnFormatTargetDateBadge(range.end);
        }
        return label;
    }
    function cnTargetDateBadgeHtml(item) {
        var label = cnFormatTargetDateRange(cnTargetDateRange(item));
        return label ? '<span class="cn-date-badge">' + escapeHtml(label) + '</span>' : '';
    }
    function cnDisplaySub(item) {
        var sub = String((item && item.sub) || '').trim();
        if (!sub) return '';
        var date = String((item && item.date) || '').trim();
        var parts = sub.split('・').map(function (p) { return p.trim(); }).filter(Boolean);
        if (parts.length >= 2) {
            var actor = parts[0];
            var tail = parts.slice(1).join(' ・ ');
            if (/(今日|昨日|\d{1,2}\/\d{1,2}|\d{4}\/\d{1,2}\/\d{1,2}|\d{1,2}月\d{1,2}日)/.test(tail)) return actor + ' ・ ' + tail;
            if (date && /^\d{1,2}:\d{2}$/.test(tail)) return actor + ' ・ ' + date + ' ' + tail;
            if (date) return actor + ' ・ ' + date + ' ' + tail;
            return actor + ' ・ ' + tail;
        }
        return date ? sub + ' ・ ' + date : sub;
    }
    function buildDiffHtml(diffs) {
        if (!Array.isArray(diffs) || diffs.length === 0) return '';
        return '<div class="cn-diff-list">' + diffs.map(function (d) {
            return '<div class="cn-diff-line">'
                 +   '<div class="cn-diff-label">' + escapeHtml(d.field || '変更') + '</div>'
                 +   '<div class="cn-diff-values">'
                 +     '<div class="cn-diff-to">' + escapeHtml(normalizeDiffValue(d.newVal)) + '</div>'
                 +     '<div class="cn-diff-from">' + escapeHtml(normalizeDiffValue(d.oldVal)) + '</div>'
                 +   '</div>'
                 + '</div>';
        }).join('') + '</div>';
    }
    // R-2: cn-card アイテム (SL層モックの cn-site / cn-diff / cn-meta 構造を移植)。
    // バッジはカテゴリ + 配置サブタグ + 対象日 (発信元画面バッジは表示せず data として保持)。
    function buildItemHtml(bellId, item) {
        // type は表示色クラス用に scope-op から推測（add/place→add色、modify/approve→modify色、delete/reject/remove→delete色）。
        var effectiveType = item.type;
        if (!effectiveType && item.op) {
            var opToType = { add: 'add', place: 'add', modify: 'modify', approve: 'approve', delete: 'delete', remove: 'delete', reject: 'reject' };
            effectiveType = opToType[item.op] || 'modify';
        }
        var typeClass = resolveTypeClass(effectiveType);
        var unread = item._read ? '' : ' is-unread';
        var category = deriveCategory(item);
        var subTag = deriveSubTag(item, category);
        // expand または affects のいずれかがあればアコーディオン展開可（種別問わず）
        var hasDiffs = Array.isArray(item.diffs) && item.diffs.length > 0;
        var hasActions = Array.isArray(item.actions) && item.actions.length > 0;
        // locked: 確定/取り消し済み表示。取り消し線・展開不可（重複操作の防止）
        var isLocked = !!item.locked;
        var hasExpand = !isLocked && !!(item.expand || hasDiffs || hasActions || (item.affects && item.affects.length));
        var affectsAttr = (item.affects && item.affects.length)
            ? ' data-affects="' + escapeHtml(item.affects.join(',')) + '"' : '';
        var idAttr = item.id ? ' data-id="' + escapeHtml(item.id) + '"' : '';
        var targetAttr = item.target
            ? ' data-target="' + escapeHtml(JSON.stringify(item.target)) + '"' : '';
        var diffsAttr = hasDiffs
            ? ' data-diffs="' + escapeHtml(JSON.stringify(item.diffs)) + '"' : '';
        var domainAttr = item.domain ? ' data-domain="' + escapeHtml(item.domain) + '"' : '';
        var primaryAttr = item.primaryPage ? ' data-primary-page="' + escapeHtml(item.primaryPage) + '"' : '';
        var sourceBell = item.sourceBell || bellId;
        var sourceAttr = sourceBell ? ' data-source-bell="' + escapeHtml(sourceBell) + '"' : '';
        var badgesHtml = ''
            + '<span class="cn-cat-badge cn-cat-' + escapeHtml(category) + '">' + escapeHtml(CN_CATEGORY_LABELS[category] || category) + '</span>'
            + (subTag ? '<span class="cn-subtag-badge">' + escapeHtml(CN_SUBTAG_LABELS[subTag] || subTag) + '</span>' : '')
            + cnTargetDateBadgeHtml(item);
        // インライン差分 (先頭1件のみ / 全量は展開内 cn-diff-list)
        var inlineDiffHtml = '';
        if (hasDiffs) {
            var d0 = item.diffs[0] || {};
            inlineDiffHtml = '<span class="cn-diff">'
                + '<span class="d-label">' + escapeHtml(d0.field || '変更') + '</span>'
                + '<span class="d-from">' + escapeHtml(normalizeDiffValue(d0.oldVal)) + '</span>'
                + '<span class="d-arrow">→</span>'
                + '<span class="d-to">' + escapeHtml(normalizeDiffValue(d0.newVal)) + '</span>'
                + (item.diffs.length > 1 ? '<span class="d-more">ほか' + (item.diffs.length - 1) + '件</span>' : '')
                + '</span>';
        }
        var subText = cnDisplaySub(item);
        var chevronHtml = hasExpand ? '<span class="cn-chevron">▾</span>' : '';
        var expandHtml = '';
        if (hasExpand) {
            var summary = item.expand ? '<div class="cn-expand-summary">' + escapeHtml(item.expand) + '</div>' : '';
            var diffsHtml = buildDiffHtml(item.diffs);
            var hint = (item.affects && item.affects.length)
                ? '<div class="cn-cross-hint" data-affects="' + escapeHtml(item.affects.join(',')) + '"></div>'
                : '';
            var actionsHtml = '';
            if (hasActions) {
                actionsHtml = item.actions.map(function (a) {
                    var cls = 'cn-action-btn' + (a.action === 'cancel-recover-order' ? ' cn-action-btn--cancel' : '');
                    return '<button type="button" class="' + cls + '" data-cn-action="' + escapeHtml(a.action || '') + '">'
                        + escapeHtml(a.label || '') + '</button>';
                }).join('');
            }
            expandHtml = '<div class="cn-expand">' + summary + diffsHtml + hint + actionsHtml + '</div>';
        }
        var scopeAttr = item.scope ? ' data-scope="' + escapeHtml(item.scope) + '"' : '';
        var involvedAttr = ' data-involved="' + (isItemInvolved(item) ? 'true' : 'false') + '"';
        var opAttr = item.op ? ' data-op="' + escapeHtml(item.op) + '"' : '';
        var colorAttr = item.color ? ' data-color="' + escapeHtml(item.color) + '"' : '';
        return ''
            + '<div class="cn-item type-' + typeClass + unread + (isLocked ? ' cn-item-locked' : '') + '"'
            +   idAttr
            +   (isLocked ? ' data-locked="1"' : '')
            +   ' data-type="' + escapeHtml(item.type || effectiveType || '') + '"'
            +   ' data-category="' + escapeHtml(category) + '"'
            +   (subTag ? ' data-sub-tag="' + escapeHtml(subTag) + '"' : '')
            +   scopeAttr
            +   involvedAttr
            +   opAttr
            +   colorAttr
            +   affectsAttr
            +   domainAttr
            +   primaryAttr
            +   sourceAttr
            +   targetAttr
            +   diffsAttr + '>'
            +   '<div class="cn-item-row">'
            +     '<div class="cn-text">'
            +       '<div class="cn-badges">' + badgesHtml + '</div>'
            +       '<div class="cn-site"><span class="cn-text-main-label">' + escapeHtml(item.main || '') + '</span></div>'
            +       inlineDiffHtml
            +       (subText ? '<div class="cn-meta">' + escapeHtml(subText) + '</div>' : '')
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
    // R-2: 日別グルーピングは対象日 (targetDate) 基準 (§3.7.9)。
    // 対象日あり = 昇順 (当日→将来)、対象日なし = 末尾「対象日なし」グループ。
    function renderBellLatest(bellId) {
        bellId = normalizeBellId(bellId);
        var body = document.querySelector('[data-bell-body="' + bellId + '"]');
        if (!body) return;
        var card = body.closest('.cn-card');
        var items = bellItemsStore[bellId] || [];
        var countEl = card ? card.querySelector('.cn-count') : null;
        if (countEl) countEl.textContent = items.length > 0 ? (items.length + '件') : '';
        if (items.length === 0) {
            body.innerHTML = '<div class="cn-empty">新しい通知はありません</div>';
            updateBadge(bellId, 0);
            return;
        }
        var groups = {};
        var order = [];
        items.forEach(function (item) {
            var range = cnTargetDateRange(item);
            var key = '';
            var time = Infinity; // 対象日なしは末尾
            if (range && range.start) {
                key = cnFormatTargetDateRange(range);
                time = cnDatePartsToTime(range.start);
            }
            if (!(key in groups)) {
                groups[key] = { label: key || '対象日なし', time: time, items: [] };
                order.push(key);
            }
            groups[key].items.push(item);
        });
        order.sort(function (a, b) { return groups[a].time - groups[b].time; });
        var html = '';
        order.forEach(function (key) {
            var g = groups[key];
            html += '<div class="cn-date-group">'
                  + '<button type="button" class="cn-date-group-head" aria-expanded="true">'
                  + escapeHtml(g.label)
                  + '<span class="cn-date-group-toggle" aria-hidden="true">▴</span>'
                  + '</button>';
            g.items.forEach(function (item) {
                html += buildItemHtml(bellId, item);
            });
            html += '</div>';
        });
        body.innerHTML = html;
        updateBadge(bellId);
        // カテゴリフィルタが選択中なら再適用
        if (card) applyCnFilters(card);
    }
    function setItems(bellId, items) {
        var sourceBell = bellId;
        var targetBell = normalizeBellId(bellId);
        items = (items || []).map(function (it) {
            return ensureItemId(targetBell, normalizeItemForBell(sourceBell, it));
        });
        if (targetBell !== sourceBell) {
            var current = bellItemsStore[targetBell] || [];
            var hasCommonSeedForSource = current.some(function (it) {
                return (it.sourceBell || targetBell) === sourceBell && it._commonSeed;
            });
            if (hasCommonSeedForSource) {
                renderBellLatest(targetBell);
                return;
            }
            var preserved = current.filter(function (it) {
                return (it.sourceBell || targetBell) !== sourceBell;
            });
            bellItemsStore[targetBell] = items.concat(preserved);
        } else {
            // 統合ベルへの seed 全置換 (co-navbar の setItems('all', ...))。
            // 実操作で addItem された通知 (_commonSeed なし) は残す。
            var existing = (bellItemsStore[targetBell] || []).filter(function (it) {
                return !it._commonSeed;
            });
            bellItemsStore[targetBell] = existing.concat(items);
        }
        renderBellLatest(targetBell);
    }
    // 各画面JSが発信時に呼ぶ。先頭に追加（最新順）。id を返す。
    function addItem(bellId, item) {
        var sourceBell = bellId;
        var targetBell = normalizeBellId(bellId);
        if (!bellItemsStore[targetBell]) bellItemsStore[targetBell] = [];
        var clone = ensureItemId(targetBell, normalizeItemForBell(sourceBell, item));
        bellItemsStore[targetBell].unshift(clone);
        renderBellLatest(targetBell);
        return clone.id;
    }
    // 各画面JSが「変更が取り消された」「対応済み」を通知するため
    function removeItem(bellId, itemId) {
        var targetBell = normalizeBellId(bellId);
        var arr = bellItemsStore[targetBell];
        if (!arr || !itemId) return false;
        var before = arr.length;
        bellItemsStore[targetBell] = arr.filter(function (it) { return it.id !== itemId; });
        if (bellItemsStore[targetBell].length === before) return false;
        renderBellLatest(targetBell);
        return true;
    }
    function clearItems(bellId) {
        var targetBell = normalizeBellId(bellId);
        if (targetBell !== bellId) {
            bellItemsStore[targetBell] = (bellItemsStore[targetBell] || []).filter(function (it) {
                return (it.sourceBell || targetBell) !== bellId;
            });
        } else {
            bellItemsStore[targetBell] = [];
        }
        renderBellLatest(targetBell);
    }
    function getItems(bellId) {
        var targetBell = normalizeBellId(bellId);
        var items = (bellItemsStore[targetBell] || []).slice();
        if (targetBell !== bellId) {
            return items.filter(function (it) { return (it.sourceBell || targetBell) === bellId; });
        }
        return items;
    }
    function updateBadge(bellId, count) {
        bellId = normalizeBellId(bellId);
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

    // ========== クロス画面ヒント + ジャンプ（Phase N-5） ==========
    var CN_PAGE_LABELS = {
        'order-book':        'OB（受注簿）',
        'screen-layout':     'SL（業務管理計画書）',
        'weekly-schedule':   'WS（週間予定表）',
        'leave-application': 'LA（休暇申請）',
        'quick-access':      'QA（モバイル）',
        'master':            'マスタ管理'
    };
    var CN_PAGE_URLS = {
        'order-book':        'order-book.html',
        'screen-layout':     'screen-layout.html',
        'weekly-schedule':   'weekly-schedule.html',
        'leave-application': 'leave-application.html',
        'quick-access':      'quick-access.html'
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
        var currentDetail = buildJumpDetail(item, current);
        var html = '';
        if (currentDetail.inContext && currentDetail.target) {
            html += '<span class="cn-cross-hint-in-context">現在画面（'
                  + (CN_PAGE_LABELS[current] || current)
                  + '）で対象セルがフラッシュされます</span>';
        } else {
            html += '<span class="cn-cross-hint-out">現在画面（'
                  + (CN_PAGE_LABELS[current] || current || '—')
                  + '）では直接フラッシュしません</span>';
        }
        var pages = currentDetail.targetPages.slice();
        if (currentDetail.primaryPage && pages.indexOf(currentDetail.primaryPage) === -1) {
            pages.unshift(currentDetail.primaryPage);
        }
        var others = pages.filter(function (a, idx) {
            return a && a !== current && pages.indexOf(a) === idx && resolveTargetForPage(currentDetail.rawTarget, a);
        });
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
    function buildPageUrl(page, detail) {
        var path = CN_PAGE_URLS[page];
        if (!path) return '';
        var base = new URL(path, location.href);
        if (detail.target) {
            base.searchParams.set('cnJump', JSON.stringify({
                source: detail.source,
                affects: detail.affects,
                page: page,
                inContext: false,
                domain: detail.domain,
                primaryPage: detail.primaryPage,
                type: detail.type,
                op: detail.op,
                scope: detail.scope,
                slot: detail.slot,
                target: detail.target,
                rawTarget: detail.rawTarget
            }));
        }
        return base.toString();
    }
    // 「○○で開く ↗」ボタン: 対象画面を同じタブで開き、URL パラメータで target を渡す
    // (旧仕様: window.open(_blank) で新タブが量産される問題を解消 / 2026-05-27)
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.cn-cross-jump-btn');
        if (!btn) return;
        e.stopPropagation();
        var item = btn.closest('.cn-item');
        var page = btn.dataset.target || '';
        if (!item || !page) return;
        var detail = buildJumpDetail(item, page);
        var url = buildPageUrl(page, detail);
        if (!url) return;
        markItemReadAndRefresh(item);
        window.location.href = url;
    });

    function dispatchJumpFromUrl() {
        var raw = '';
        try { raw = new URLSearchParams(location.search || '').get('cnJump') || ''; }
        catch (err) { raw = ''; }
        if (!raw) return;
        // URL から cnJump を除去 (リロード時の再発火 + ブックマーク汚染防止)
        try {
            var cleanUrl = new URL(location.href);
            cleanUrl.searchParams.delete('cnJump');
            window.history.replaceState({}, '', cleanUrl.toString());
        } catch (errClean) { /* 古いブラウザ等 */ }
        var payload = null;
        try { payload = JSON.parse(raw); }
        catch (err2) { payload = null; }
        if (!payload || !payload.target) return;
        var current = getCurrentPage();
        var ev = new CustomEvent('cn:jump', {
            bubbles: true,
            detail: {
                item: null,
                source: payload.source || '',
                affects: payload.affects || [],
                inContext: true,
                page: current,
                type: payload.type || '',
                op: payload.op || '',
                slot: payload.slot || '',
                target: payload.target,
                rawTarget: payload.rawTarget || null,
                fromUrl: true
            }
        });
        setTimeout(function () { document.dispatchEvent(ev); }, 450);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', dispatchJumpFromUrl);
    } else {
        dispatchJumpFromUrl();
    }

    // ========== 履歴タブ API（R-2 で撤去 / 後方互換の no-op） ==========
    // 集積・検索・軸別の履歴閲覧は変更通知センターの責務 (§3.7.8)。
    // 旧呼び出し元が残っていても壊れないよう API シグネチャのみ維持する。
    function setHistory(bellId, cfg) { /* deprecated (R-2): レール通知カードに履歴タブは無い */ }

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
        resolveTargetForPage: resolveTargetForPage,
        iconBase: CN_ICON_BASE,
        slotDefault: CN_SLOT_DEFAULT,
        pageLabels: CN_PAGE_LABELS,
        // Phase N-2.4.3 追加
        buildComposedIconHtml: buildComposedIconHtml,
        resolvePrimitive: resolvePrimitive,
        resolveTypeOverride: resolveTypeOverride
    };
})();
