(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.master.notifications.v1';
    var MAX_ITEMS = 50;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function load() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && saved.version === 1 && Array.isArray(saved.items)) {
                return saved.items.filter(function (item) { return item && item.domain === 'master'; });
            }
        } catch (error) {
            console.warn('マスタ変更通知を読み込めませんでした。', error);
        }
        return [];
    }

    function add(payload) {
        var item = Object.assign({}, clone(payload || {}), {
            id: 'master-change-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
            domain: 'master',
            primaryPage: 'master-management',
            createdAt: new Date().toISOString()
        });
        delete item.targetDate;
        var items = load();
        items.unshift(item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items: items.slice(0, MAX_ITEMS) }));
        return clone(item);
    }

    window.OmsMockMasterNotifications = {
        storageKey: STORAGE_KEY,
        load: function () { return clone(load()); },
        add: add
    };
})();
