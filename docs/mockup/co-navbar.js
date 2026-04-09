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
        { id: 'weekly-schedule', label: '社員週間予定表', icon: 'calendar.svg' },
        { id: 'leave-request',   label: '休暇申請管理',   icon: 'clock.svg' }
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
        // --- スケジュールドロップダウン ---
        +   '<div class="md-nav-dropdown" id="mdNavScheduleDD">'
        +     '<button class="md-nav-dropdown-btn" onclick="mdNavToggleDD(\'mdNavScheduleDD\')">'
        +       'スケジュール <span class="md-nav-dropdown-arrow">▼</span>'
        +     '</button>'
        +     '<div class="md-nav-dropdown-panel">'
        +       buildMenuItems(scheduleItems)
        +     '</div>'
        +   '</div>'
        // --- スペーサー ---
        +   '<div class="md-nav-spacer"></div>'
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
        'weekly-schedule': 'weekly-schedule.html'
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
            document.querySelectorAll('.md-nav-dropdown.md-nav-open').forEach(function (d) {
                d.classList.remove('md-nav-open');
            });
        }
    });

    // --- 通知ボタン → 各画面の通知モーダルを呼び出す ---
    document.getElementById('mdNavNotifyBtn').addEventListener('click', function () {
        if (currentPage === 'screen-layout' && typeof openChangeNotifyModal === 'function') {
            openChangeNotifyModal();
        } else if (currentPage === 'order-book' && typeof obCnOpenModal === 'function') {
            obCnOpenModal();
        }
    });

    // --- 通知バッジ同期: 各画面のバッジ更新を検知してナビバーにも反映 ---
    function syncNavBadge() {
        var srcBadge = null;
        if (currentPage === 'screen-layout') srcBadge = document.getElementById('cnBadge');
        else if (currentPage === 'order-book') srcBadge = document.getElementById('obCnBadge');
        var navBadge = document.getElementById('mdNavCnBadge');
        if (srcBadge && navBadge) {
            navBadge.textContent = srcBadge.textContent;
            navBadge.style.display = srcBadge.style.display;
        }
    }
    // MutationObserverでバッジの変更を監視
    var observeTarget = currentPage === 'screen-layout'
        ? document.getElementById('cnBadge')
        : document.getElementById('obCnBadge');
    if (observeTarget) {
        var observer = new MutationObserver(syncNavBadge);
        observer.observe(observeTarget, { childList: true, attributes: true, attributeFilter: ['style'] });
    }
    // 初回同期
    setTimeout(syncNavBadge, 100);

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
