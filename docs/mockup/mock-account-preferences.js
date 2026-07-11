/* G-3: shared user_preferences mock loader and screen defaults. */
(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.account.preferences.v1';
    var GC_RUNTIME_KEY = 'mock.oms.account.gc-filter-runtime.v1';
    var SCREEN_IDS = ['screen-layout', 'order-book', 'weekly-schedule', 'leave-application', 'quick-access'];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function groupCompanyCodes() {
        if (typeof groupCompaniesData !== 'undefined' && Array.isArray(groupCompaniesData)) {
            return groupCompaniesData.map(function (company) { return company.code; });
        }
        return ['touo', 'nikkei', 'zennihon'];
    }

    function defaults() {
        var gcCodes = groupCompanyCodes();
        var gcDefaults = {};
        var visibility = {};
        SCREEN_IDS.forEach(function (screenId) {
            gcDefaults[screenId] = gcCodes.slice();
            visibility[screenId] = true;
        });
        return {
            gc_filter_default: gcDefaults,
            notification_scope_default: 'involved',
            screen_visibility: visibility,
            density_default: 'normal'
        };
    }

    function normalize(values) {
        var result = defaults();
        if (!values || typeof values !== 'object') return result;
        if (values.gc_filter_default && typeof values.gc_filter_default === 'object') {
            SCREEN_IDS.forEach(function (screenId) {
                if (Array.isArray(values.gc_filter_default[screenId])) {
                    result.gc_filter_default[screenId] = values.gc_filter_default[screenId].slice();
                }
            });
        }
        if (values.screen_visibility && typeof values.screen_visibility === 'object') {
            SCREEN_IDS.forEach(function (screenId) {
                if (typeof values.screen_visibility[screenId] === 'boolean') {
                    result.screen_visibility[screenId] = values.screen_visibility[screenId];
                }
            });
        }
        if (values.notification_scope_default === 'all' || values.notification_scope_default === 'involved') {
            result.notification_scope_default = values.notification_scope_default;
        }
        if (['compact', 'normal', 'spacious'].indexOf(values.density_default) !== -1) {
            result.density_default = values.density_default;
        }
        return result;
    }

    function load() {
        var saved;
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        } catch (error) {
            return defaults();
        }
        if (!saved || !Array.isArray(saved.preferences)) return defaults();
        var values = {};
        saved.preferences.forEach(function (entry) {
            if (entry && typeof entry.pref_key === 'string') values[entry.pref_key] = clone(entry.pref_value);
        });
        return normalize(values);
    }

    function save(values) {
        var normalized = normalize(values);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: 1,
            user_id: 'mock-user-sato',
            preferences: Object.keys(normalized).map(function (key) {
                return { pref_key: key, pref_value: clone(normalized[key]) };
            })
        }));
        clearGcRuntime();
        return normalized;
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        clearGcRuntime();
        return defaults();
    }

    function loadGcRuntime(screenId) {
        var saved;
        try {
            saved = JSON.parse(localStorage.getItem(GC_RUNTIME_KEY) || 'null');
        } catch (error) {
            return null;
        }
        return saved && Array.isArray(saved[screenId]) ? saved[screenId].slice() : null;
    }

    function saveGcRuntime(screenId, selected) {
        if (SCREEN_IDS.indexOf(screenId) === -1 || !Array.isArray(selected)) return;
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem(GC_RUNTIME_KEY) || '{}') || {}; } catch (error) {}
        saved[screenId] = selected.slice();
        localStorage.setItem(GC_RUNTIME_KEY, JSON.stringify(saved));
    }

    function clearGcRuntime() {
        localStorage.removeItem(GC_RUNTIME_KEY);
        localStorage.removeItem('gcFilter');
    }

    function applyDensity(values) {
        var density = normalize(values || load()).density_default;
        if (density === 'normal') document.documentElement.removeAttribute('data-density');
        else document.documentElement.setAttribute('data-density', density);
        return density;
    }

    window.OmsMockAccountPreferences = {
        key: STORAGE_KEY,
        screenIds: SCREEN_IDS.slice(),
        defaults: defaults,
        load: load,
        save: save,
        reset: reset,
        loadGcRuntime: loadGcRuntime,
        saveGcRuntime: saveGcRuntime,
        clearGcRuntime: clearGcRuntime,
        applyDensity: applyDensity
    };

    applyDensity(load());
})();
