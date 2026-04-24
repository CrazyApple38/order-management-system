/* ============================================================
   co-navbar.js — 共通ナビゲーションバー
   各画面の <body> 先頭に自動挿入
   ============================================================ */

(function () {
    'use strict';

    // --- 現在のページ判定 ---
    var path = location.pathname;
    var currentPage = 'other';
    if (path.indexOf('screen-layout') !== -1) currentPage = 'screen-layout';
    else if (path.indexOf('order-book') !== -1) currentPage = 'order-book';
    else if (path.indexOf('weekly-schedule') !== -1) currentPage = 'weekly-schedule';
    else if (path.indexOf('leave-application') !== -1) currentPage = 'leave-application';
    else if (path.indexOf('quick-access') !== -1) currentPage = 'quick-access';

    // --- マスタ管理メニュー項目 ---
    var masterItems = [
        { id: 'employee',       label: '社員',               icon: 'person.svg' },
        { id: 'site',           label: '現場',               icon: 'chart.svg' },
        { id: 'company',        label: '契約先',             icon: 'tag.svg' },
        { divider: true },
        { id: 'site-category',  label: '区分 / 区分バッジ',  icon: 'palette.svg' },
        { id: 'vehicle',        label: '車両 / ETCカード',   icon: 'gear.svg' },
        { id: 'license-type',   label: '資格種別',           icon: 'tag.svg' },
        { divider: true },
        { id: 'group-company',  label: 'グループ会社',       icon: 'chart.svg' },
        { id: 'org-unit',       label: '組織階層',           icon: 'chart.svg' },
        { id: 'penalty-code',   label: 'ペナルティコード',   icon: 'pencil.svg' },
        { id: 'holiday',        label: '祝日',               icon: 'calendar.svg' }
    ];

    // --- スケジュールメニュー項目 ---
    var scheduleItems = [
        { id: 'weekly-schedule',   label: '週間予定表',     icon: 'calendar.svg' },
        { id: 'leave-application', label: '休暇申請管理',   icon: 'clock.svg' }
    ];

    // --- HTML構築 ---
    function icon(name) {
        return '<img src="mockup/icons/' + name + '" class="md-nav-tab-icon" alt="">';
    }
    function menuItemIcon(name) {
        return '<img src="mockup/icons/' + name + '" class="md-nav-menu-item-icon" alt="">';
    }

    function buildMenuItems(items) {
        return items.map(function (item) {
            if (item.divider) return '<div class="md-nav-menu-divider"></div>';
            return '<button class="md-nav-menu-item" data-master="' + item.id + '">'
                + menuItemIcon(item.icon)
                + item.label
                + '</button>';
        }).join('');
    }

    var html = ''
        + '<nav class="md-nav-bar">'
        +   '<div class="md-nav-logo">受注管理</div>'
        // --- ページタブ ---
        +   '<a href="screen-layout.html" class="md-nav-tab' + (currentPage === 'screen-layout' ? ' md-nav-active' : '') + '">'
        +     icon('calendar.svg') + '業務管理計画書'
        +   '</a>'
        +   '<a href="order-book.html" class="md-nav-tab' + (currentPage === 'order-book' ? ' md-nav-active' : '') + '">'
        +     icon('chart.svg') + '受注簿'
        +   '</a>'
        // --- スケジュールドロップダウン ---
        +   '<div class="md-nav-dropdown" id="mdNavScheduleDD">'
        +     '<button class="md-nav-dropdown-btn' + ((currentPage === 'weekly-schedule' || currentPage === 'leave-application') ? ' md-nav-active' : '') + '" onclick="mdNavToggleDD(\'mdNavScheduleDD\')">'
        +       'スケジュール <span class="md-nav-dropdown-arrow">▼</span>'
        +     '</button>'
        +     '<div class="md-nav-dropdown-panel">'
        +       buildMenuItems(scheduleItems)
        +     '</div>'
        +   '</div>'
        +   '<div class="md-nav-sep"></div>'
        // --- マスタ管理ドロップダウン ---
        +   '<div class="md-nav-dropdown" id="mdNavMasterDD">'
        +     '<button class="md-nav-dropdown-btn" onclick="mdNavToggleDD(\'mdNavMasterDD\')">'
        +       'マスタ管理 <span class="md-nav-dropdown-arrow">▼</span>'
        +     '</button>'
        +     '<div class="md-nav-dropdown-panel">'
        +       buildMenuItems(masterItems)
        +     '</div>'
        +   '</div>'
        // --- GCフィルタボタン ---
        +   '<div class="md-nav-sep"></div>'
        +   '<button class="md-nav-gcf-btn" id="mdNavGcfBtn">'
        +     '<span id="mdNavGcfLabel">すべて</span>'
        +     '<span class="md-nav-gcf-arrow">▼</span>'
        +   '</button>'
        // --- スペーサー ---
        +   '<div class="md-nav-spacer"></div>'
        // --- モバイルタブ ---
        +   '<a href="quick-access.html" target="_blank" rel="noopener" class="md-nav-tab' + (currentPage === 'quick-access' ? ' md-nav-active' : '') + '">'
        +     icon('smartphone.svg') + 'モバイル'
        +   '</a>'
        // --- 右端アクション ---
        +   '<div class="md-nav-actions">'
        +     '<button class="md-nav-action-btn" id="mdNavNotifyBtn" title="変更通知">'
        +       '<img src="mockup/icons/bell.svg" alt="通知">'
        +       '<span class="md-cn-badge" id="mdNavCnBadge" style="display:none;">0</span>'
        +     '</button>'
        +     '<button class="md-nav-action-btn" id="mdNavThemeBtn" title="テーマ切替">'
        +       '<img src="mockup/icons/moon.svg" class="md-nav-theme-icon-light" alt="Dark">'
        +       '<img src="mockup/icons/brush.svg" class="md-nav-theme-icon-dark" alt="Light">'
        +     '</button>'
        +   '</div>'
        + '</nav>';

    // --- モーダルオーバーレイ ---
    html += ''
        + '<div class="md-nav-modal-overlay" id="mdNavMasterModal">'
        +   '<div class="md-nav-modal">'
        +     '<div class="md-nav-modal-header">'
        +       '<span class="md-nav-modal-title" id="mdNavModalTitle">マスタ</span>'
        +       '<button class="md-nav-modal-close" onclick="mdNavCloseModal()">&times;</button>'
        +     '</div>'
        +     '<div class="md-nav-modal-body" id="mdNavModalBody">'
        +       '<div class="md-nav-modal-placeholder">'
        +         '<div class="md-nav-modal-placeholder-icon">&#128221;</div>'
        +         'マスタデータ編集画面（実装予定）'
        +       '</div>'
        +     '</div>'
        +   '</div>'
        + '</div>';

    // --- 画面横断通知モーダル（マスタ管理・休暇申請など全画面共通の変更通知） ---
    // 各画面固有の行単位通知は、画面側のベル（obCnNotifyBtn / cnNotifyBtn 等）で扱う
    var mdNavCnItems = [
        { type: 'master',  icon: 'person.svg',   title: '社員マスタが更新されました',         desc: '佐藤 太郎 さんの所属が変更 (部署A → 部署B)', time: '10分前' },
        { type: 'leave',   icon: 'clock.svg',    title: '休暇申請が承認待ちです',             desc: '鈴木 一郎 / 2026-04-24 (金) 有給休暇',         time: '32分前' },
        { type: 'master',  icon: 'chart.svg',    title: '現場マスタに新規現場が追加されました', desc: '〇〇ビル新築工事 (東央警備)',                  time: '2時間前' }
    ];
    function mdNavCnBuildBody() {
        if (mdNavCnItems.length === 0) {
            return '<div class="md-nav-cn-empty">'
                + '<div class="md-nav-cn-empty-icon">&#128276;</div>'
                + '<div>新しい通知はありません</div>'
                + '</div>';
        }
        return '<ul class="md-nav-cn-list">' + mdNavCnItems.map(function (it) {
            return '<li class="md-nav-cn-item md-nav-cn-item--' + it.type + '">'
                + '<img src="mockup/icons/' + it.icon + '" class="md-nav-cn-item-icon" alt="">'
                + '<div class="md-nav-cn-item-body">'
                +   '<div class="md-nav-cn-item-title">' + it.title + '</div>'
                +   '<div class="md-nav-cn-item-desc">' + it.desc + '</div>'
                + '</div>'
                + '<div class="md-nav-cn-item-time">' + it.time + '</div>'
                + '</li>';
        }).join('') + '</ul>';
    }
    html += ''
        + '<div class="md-nav-modal-overlay" id="mdNavCnModal">'
        +   '<div class="md-nav-modal md-nav-cn-modal">'
        +     '<div class="md-nav-modal-header">'
        +       '<span class="md-nav-modal-title">変更通知（全画面共通）</span>'
        +       '<button type="button" class="md-nav-modal-close" onclick="mdNavCnCloseModal()" aria-label="閉じる">&times;</button>'
        +     '</div>'
        +     '<div class="md-nav-modal-body" id="mdNavCnBody"></div>'
        +   '</div>'
        + '</div>';

    // --- GCフィルタモーダル ---
    html += ''
        + '<div class="md-nav-gcf-overlay" id="mdNavGcfModal">'
        +   '<div class="md-nav-gcf-modal">'
        +     '<div class="md-nav-gcf-header">'
        +       '<h3>表示グループ会社</h3>'
        +       '<button class="md-nav-gcf-close" id="mdNavGcfClose">&times;</button>'
        +     '</div>'
        +     '<div class="md-nav-gcf-body">'
        +       '<p class="md-nav-gcf-hint">チェックを入れた会社のデータが表示されます</p>'
        +       '<div class="md-nav-gcf-checks" id="mdNavGcfChecks"></div>'
        +     '</div>'
        +     '<div class="md-nav-gcf-footer">'
        +       '<button class="md-nav-gcf-btn-cancel" id="mdNavGcfCancel">キャンセル</button>'
        +       '<button class="md-nav-gcf-btn-apply" id="mdNavGcfApply">適用</button>'
        +     '</div>'
        +   '</div>'
        + '</div>';

    // --- DOM挿入 ---
    var container = document.createElement('div');
    container.innerHTML = html;
    while (container.firstChild) {
        document.body.insertBefore(container.firstChild, document.body.firstChild);
    }

    // --- ドロップダウン開閉 ---
    window.mdNavToggleDD = function (id) {
        var el = document.getElementById(id);
        var isOpen = el.classList.contains('md-nav-open');
        // 全て閉じる
        document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
            d.classList.remove('md-nav-open');
        });
        if (!isOpen) el.classList.add('md-nav-open');
    };

    // 外部クリックで閉じる
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.md-nav-dropdown')) {
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
        }
    });

    // --- マスタメニュー項目クリック → モーダル表示 ---
    var masterLabels = {};
    masterItems.concat(scheduleItems).forEach(function (item) {
        if (!item.divider) masterLabels[item.id] = item.label;
    });

    // ページ遷移するメニュー項目
    var pageLinks = {
        'weekly-schedule':   'weekly-schedule.html',
        'leave-application': 'leave-application.html'
    };

    document.querySelectorAll('.md-nav-menu-item[data-master]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = this.getAttribute('data-master');
            // ドロップダウンを閉じる
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
            // ページ遷移 or モーダル
            if (pageLinks[id]) {
                location.href = pageLinks[id];
            } else {
                mdNavOpenModal(id, masterLabels[id] || 'マスタ');
            }
        });
    });

    // --- モーダル ---
    window.mdNavOpenModal = function (id, title) {
        var overlay = document.getElementById('mdNavMasterModal');
        document.getElementById('mdNavModalTitle').textContent = title;
        document.getElementById('mdNavModalBody').innerHTML =
            '<div class="md-nav-modal-placeholder">'
            + '<div class="md-nav-modal-placeholder-icon">&#128221;</div>'
            + title + ' 編集画面（実装予定）'
            + '</div>';
        overlay.classList.add('md-nav-modal-open');
    };

    window.mdNavCloseModal = function () {
        document.getElementById('mdNavMasterModal').classList.remove('md-nav-modal-open');
    };

    // オーバーレイクリックで閉じる
    document.getElementById('mdNavMasterModal').addEventListener('click', function (e) {
        if (e.target === this) mdNavCloseModal();
    });

    // ESCで閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            mdNavCloseModal();
            mdNavCnCloseModal();
            gcfCloseModal();
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
        }
    });

    // --- ナビバー通知ボタン → 画面横断通知モーダルを開く ---
    // 各画面固有の通知は画面側のベルで扱うため、ここでは画面モーダルを呼ばない
    window.mdNavCnOpenModal = function () {
        document.getElementById('mdNavCnBody').innerHTML = mdNavCnBuildBody();
        document.getElementById('mdNavCnModal').classList.add('md-nav-modal-open');
    };
    window.mdNavCnCloseModal = function () {
        document.getElementById('mdNavCnModal').classList.remove('md-nav-modal-open');
    };
    document.getElementById('mdNavNotifyBtn').addEventListener('click', mdNavCnOpenModal);
    document.getElementById('mdNavCnModal').addEventListener('click', function (e) {
        if (e.target === this) mdNavCnCloseModal();
    });

    // --- ナビバーバッジ: 画面横断通知の件数を独立カウント ---
    (function initNavCnBadge() {
        var navBadge = document.getElementById('mdNavCnBadge');
        if (!navBadge) return;
        var count = mdNavCnItems.length;
        if (count > 0) {
            navBadge.textContent = String(count);
            navBadge.style.display = '';
        } else {
            navBadge.style.display = 'none';
        }
    })();

    // --- GCフィルタ共通ロジック ---
    // groupCompaniesData / orgUnitsData は demo-data.js で定義（co-navbar.jsより先に読み込まれる前提）
    var gcfAllCodes = (typeof groupCompaniesData !== 'undefined')
        ? groupCompaniesData.map(function (gc) { return gc.code; })
        : ['touo', 'nikkei', 'zennihon'];
    var gcfAllData = (typeof groupCompaniesData !== 'undefined')
        ? groupCompaniesData
        : [
            { code: 'touo', name: '東央警備', shortName: '東央' },
            { code: 'nikkei', name: 'Nikkeiホールディングス', shortName: 'Nikkei' },
            { code: 'zennihon', name: '全日本エンタープライズ', shortName: 'AJE' }
        ];
    var gcfOrgUnits = (typeof orgUnitsData !== 'undefined') ? orgUnitsData : {};

    // --- ツリーユーティリティ ---
    // 会社配下の全ノードIDを収集
    function gcfCollectAllIds(gcCode) {
        var ids = [];
        function walk(nodes) {
            if (!nodes) return;
            nodes.forEach(function (n) { ids.push(n.id); if (n.children) walk(n.children); });
        }
        walk(gcfOrgUnits[gcCode] || []);
        return ids;
    }
    // ノードIDからどの会社に属するか判定
    function gcfFindCompany(unitId) {
        for (var i = 0; i < gcfAllCodes.length; i++) {
            if (gcfCollectAllIds(gcfAllCodes[i]).indexOf(unitId) >= 0) return gcfAllCodes[i];
        }
        return null;
    }

    // --- localStorage から復元 ---
    // フィルタ配列: 会社コード（全選択）+ 組織ノードID（部分選択）の混在
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem('gcFilter')); } catch (e) {}
    if (!Array.isArray(stored) || stored.length === 0) {
        // デフォルト: 全社全ノード選択
        stored = gcfAllCodes.slice();
    }
    // 不正値除去（有効な会社コード or 組織ノードIDのみ）
    var allValidIds = gcfAllCodes.slice();
    gcfAllCodes.forEach(function (gc) { allValidIds = allValidIds.concat(gcfCollectAllIds(gc)); });
    stored = stored.filter(function (id) { return allValidIds.indexOf(id) >= 0; });
    if (stored.length === 0) stored = gcfAllCodes.slice();

    // グローバルに公開
    window.mdNavGcFilter = stored;

    // --- 後方互換ヘルパー: 会社が1つでも選択されているか ---
    window.mdNavGcIsCompanyVisible = function (gcCode) {
        if (window.mdNavGcFilter.indexOf(gcCode) >= 0) return true;
        var unitIds = gcfCollectAllIds(gcCode);
        for (var i = 0; i < unitIds.length; i++) {
            if (window.mdNavGcFilter.indexOf(unitIds[i]) >= 0) return true;
        }
        return false;
    };

    // --- 組織ノードが選択されているか（祖先チェック含む） ---
    window.mdNavGcIsUnitVisible = function (unitId) {
        if (!unitId) return true; // 未指定は常に表示
        // 直接選択されている
        if (window.mdNavGcFilter.indexOf(unitId) >= 0) return true;
        // 所属会社が全選択されている
        var gcCode = gcfFindCompany(unitId);
        if (gcCode && window.mdNavGcFilter.indexOf(gcCode) >= 0) return true;
        // 祖先ノードが選択されている
        function findAncestors(nodes, targetId, path) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id === targetId) return path;
                if (nodes[i].children) {
                    var r = findAncestors(nodes[i].children, targetId, path.concat([nodes[i].id]));
                    if (r) return r;
                }
            }
            return null;
        }
        if (gcCode) {
            var ancestors = findAncestors(gcfOrgUnits[gcCode] || [], unitId, []);
            if (ancestors) {
                for (var i = 0; i < ancestors.length; i++) {
                    if (window.mdNavGcFilter.indexOf(ancestors[i]) >= 0) return true;
                }
            }
        }
        return false;
    };

    // --- ラベル生成 ---
    function gcfGetLabel() {
        // 全社全選択チェック
        var allSelected = gcfAllCodes.every(function (gc) {
            return window.mdNavGcFilter.indexOf(gc) >= 0;
        });
        if (allSelected) return 'すべて';

        var parts = [];
        gcfAllData.forEach(function (gc) {
            if (window.mdNavGcFilter.indexOf(gc.code) >= 0) {
                parts.push(gc.shortName);
            } else if (window.mdNavGcIsCompanyVisible(gc.code)) {
                parts.push(gc.shortName + '(一部)');
            }
        });
        return parts.length > 0 ? parts.join(' + ') : 'なし';
    }

    function gcfUpdateLabel() {
        var label = document.getElementById('mdNavGcfLabel');
        if (label) label.textContent = gcfGetLabel();
    }

    // --- ツリーチェックボックスUI生成 ---
    function gcfBuildTree(container, nodes, gcCode, indent) {
        nodes.forEach(function (node) {
            var hasChildren = node.children && node.children.length > 0;
            var row = document.createElement('div');
            row.className = 'md-nav-gcf-tree-row';
            row.style.paddingLeft = (indent * 20) + 'px';

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = node.id;
            cb.dataset.gc = gcCode;
            cb.dataset.gcfNode = '1';
            cb.addEventListener('change', function () { gcfSyncTree(gcCode); });
            row.appendChild(cb);

            var lbl = document.createElement('span');
            lbl.className = 'md-nav-gcf-tree-label';
            lbl.textContent = node.name;
            row.appendChild(lbl);

            container.appendChild(row);
            if (hasChildren) gcfBuildTree(container, node.children, gcCode, indent + 1);
        });
    }

    // ツリーチェック状態を復元
    function gcfRestoreChecks() {
        var filter = window.mdNavGcFilter;
        gcfAllData.forEach(function (gc) {
            var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gc.code + '"]');
            if (!companyCb) return;
            var isAll = filter.indexOf(gc.code) >= 0;
            var unitIds = gcfCollectAllIds(gc.code);
            if (isAll) {
                companyCb.checked = true;
                companyCb.indeterminate = false;
                // 子もすべてON
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb) cb.checked = true;
                });
            } else {
                // 部分選択チェック
                var checkedCount = 0;
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb) {
                        // 自身が選択 or 祖先が選択されているかチェック
                        cb.checked = filter.indexOf(uid) >= 0;
                        if (cb.checked) checkedCount++;
                    }
                });
                // 祖先選択 → 子孫も全ON
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (!cb || cb.checked) return;
                    // 祖先がフィルタに含まれるかチェック
                    var ggc = gc.code;
                    function findAncInFilter(nodes, targetId, path) {
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].id === targetId) {
                                for (var j = 0; j < path.length; j++) {
                                    if (filter.indexOf(path[j]) >= 0) return true;
                                }
                                return false;
                            }
                            if (nodes[i].children) {
                                var r = findAncInFilter(nodes[i].children, targetId, path.concat([nodes[i].id]));
                                if (r !== undefined) return r;
                            }
                        }
                    }
                    if (findAncInFilter(gcfOrgUnits[ggc] || [], uid, [])) {
                        cb.checked = true;
                        checkedCount++;
                    }
                });
                companyCb.checked = checkedCount > 0 && checkedCount === unitIds.length;
                companyCb.indeterminate = checkedCount > 0 && checkedCount < unitIds.length;
            }
        });
    }

    // 会社チェック変更 → 子すべてON/OFF
    function gcfToggleCompany(gcCode, checked) {
        var unitIds = gcfCollectAllIds(gcCode);
        unitIds.forEach(function (uid) {
            var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
            if (cb) cb.checked = checked;
        });
    }

    // 子ノード変更 → 親のindeterminate/checked同期
    function gcfSyncTree(gcCode) {
        var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gcCode + '"]');
        if (!companyCb) return;
        var unitIds = gcfCollectAllIds(gcCode);
        var total = unitIds.length;
        var checkedCount = 0;
        unitIds.forEach(function (uid) {
            var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
            if (cb && cb.checked) checkedCount++;
        });
        // 中間ノードの同期（子が全チェック → 親もチェック）
        function syncNode(nodes) {
            nodes.forEach(function (n) {
                if (n.children && n.children.length > 0) {
                    syncNode(n.children);
                    var nodeCb = document.querySelector('#mdNavGcfChecks input[value="' + n.id + '"]');
                    if (!nodeCb) return;
                    var childTotal = 0, childChecked = 0;
                    n.children.forEach(function (c) {
                        childTotal++;
                        var ccb = document.querySelector('#mdNavGcfChecks input[value="' + c.id + '"]');
                        if (ccb && ccb.checked) childChecked++;
                    });
                    // 子がすべてチェック → 親もチェック、一部 → indeterminate
                    if (childChecked === childTotal) {
                        nodeCb.checked = true; nodeCb.indeterminate = false;
                    } else if (childChecked > 0) {
                        nodeCb.checked = false; nodeCb.indeterminate = true;
                    }
                }
            });
        }
        syncNode(gcfOrgUnits[gcCode] || []);
        companyCb.checked = checkedCount === total;
        companyCb.indeterminate = checkedCount > 0 && checkedCount < total;
    }

    function gcfOpenModal() {
        var checksEl = document.getElementById('mdNavGcfChecks');
        checksEl.innerHTML = '';
        gcfAllData.forEach(function (gc) {
            // 会社ヘッダ行
            var companyRow = document.createElement('div');
            companyRow.className = 'md-nav-gcf-company-row';
            var companyCb = document.createElement('input');
            companyCb.type = 'checkbox';
            companyCb.value = gc.code;
            companyCb.dataset.gcfCompany = '1';
            companyCb.addEventListener('change', function () {
                gcfToggleCompany(gc.code, this.checked);
                if (!this.checked) this.indeterminate = false;
            });
            companyRow.appendChild(companyCb);
            var swatch = document.createElement('span');
            swatch.className = 'md-nav-gcf-swatch';
            swatch.style.background = 'var(--md-gc-bg-' + gc.code + ')';
            companyRow.appendChild(swatch);
            var nameSpan = document.createElement('span');
            nameSpan.className = 'md-nav-gcf-company-name';
            nameSpan.textContent = gc.name;
            companyRow.appendChild(nameSpan);
            checksEl.appendChild(companyRow);

            // 組織ツリー
            var units = gcfOrgUnits[gc.code] || [];
            if (units.length > 0) {
                var treeWrap = document.createElement('div');
                treeWrap.className = 'md-nav-gcf-tree';
                gcfBuildTree(treeWrap, units, gc.code, 1);
                checksEl.appendChild(treeWrap);
            }
        });
        gcfRestoreChecks();
        document.getElementById('mdNavGcfModal').classList.add('active');
    }

    function gcfCloseModal() {
        document.getElementById('mdNavGcfModal').classList.remove('active');
    }

    function gcfApply() {
        // チェック状態からフィルタ配列を構築
        var selected = [];
        gcfAllData.forEach(function (gc) {
            var companyCb = document.querySelector('#mdNavGcfChecks input[value="' + gc.code + '"]');
            if (!companyCb) return;
            if (companyCb.checked && !companyCb.indeterminate) {
                // 全選択 → 会社コードのみ
                selected.push(gc.code);
            } else {
                // 部分選択 → 個別ノードID
                var unitIds = gcfCollectAllIds(gc.code);
                unitIds.forEach(function (uid) {
                    var cb = document.querySelector('#mdNavGcfChecks input[value="' + uid + '"]');
                    if (cb && cb.checked) selected.push(uid);
                });
            }
        });
        if (selected.length === 0) {
            alert('少なくとも1つの会社または組織を選択してください。');
            return;
        }
        window.mdNavGcFilter = selected;
        localStorage.setItem('gcFilter', JSON.stringify(selected));
        gcfUpdateLabel();
        gcfCloseModal();
        document.dispatchEvent(new CustomEvent('gcFilterChanged', { detail: { selected: selected } }));
    }

    // グローバル公開
    window.mdNavGcFilterOpen = gcfOpenModal;

    // イベントバインド
    document.getElementById('mdNavGcfBtn').addEventListener('click', gcfOpenModal);
    document.getElementById('mdNavGcfClose').addEventListener('click', gcfCloseModal);
    document.getElementById('mdNavGcfCancel').addEventListener('click', gcfCloseModal);
    document.getElementById('mdNavGcfApply').addEventListener('click', gcfApply);
    document.getElementById('mdNavGcfModal').addEventListener('click', function (e) {
        if (e.target === this) gcfCloseModal();
    });

    // 初期ラベル設定
    gcfUpdateLabel();

    // --- テーマ切替ボタン ---
    document.getElementById('mdNavThemeBtn').addEventListener('click', function () {
        if (typeof toggleTheme === 'function') {
            toggleTheme();
        } else {
            // order-book用フォールバック（別方式の場合）
            var htmlEl = document.documentElement;
            var isDark = htmlEl.getAttribute('data-theme') === 'dark';
            var newTheme = isDark ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_v2', newTheme);
        }
    });

})();
