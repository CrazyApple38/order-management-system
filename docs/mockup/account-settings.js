/* G-1: account personal preferences backed by a dedicated localStorage key. */
(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.account.preferences.v1';
    var SCREENS = [
        { id: 'screen-layout', label: '業務管理計画書' },
        { id: 'order-book', label: '受注簿' },
        { id: 'weekly-schedule', label: '週間予定表' },
        { id: 'leave-application', label: '休暇申請管理' },
        { id: 'quick-access', label: 'Quick Access' }
    ];

    function groupCompanies() {
        return typeof groupCompaniesData !== 'undefined' && Array.isArray(groupCompaniesData)
            ? groupCompaniesData
            : [];
    }

    function defaultValues() {
        var gcIds = groupCompanies().map(function (company) { return company.code; });
        var gcDefaults = {};
        var visibility = {};
        SCREENS.forEach(function (screen) {
            gcDefaults[screen.id] = gcIds.slice();
            visibility[screen.id] = true;
        });
        return {
            gc_filter_default: gcDefaults,
            notification_scope_default: 'involved',
            screen_visibility: visibility,
            density_default: 'normal'
        };
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function loadValues() {
        var defaults = defaultValues();
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (!saved || !Array.isArray(saved.preferences)) return defaults;
            saved.preferences.forEach(function (entry) {
                if (entry && Object.prototype.hasOwnProperty.call(defaults, entry.pref_key)) {
                    defaults[entry.pref_key] = clone(entry.pref_value);
                }
            });
        } catch (error) {
            return defaults;
        }
        return defaults;
    }

    function checkMarkup(id, label, checked, attrs) {
        return '<label class="check">'
            + '<input type="checkbox" id="' + id + '" ' + (checked ? 'checked ' : '') + (attrs || '') + '>'
            + '<span class="box"></span>' + label
            + '</label>';
    }

    function switchMarkup(screen, checked) {
        return '<label class="ac-toggle-item" for="acVisible-' + screen.id + '">'
            + '<span>' + screen.label + '</span>'
            + '<span class="switch">'
            + '<input type="checkbox" id="acVisible-' + screen.id + '" data-screen="' + screen.id + '" ' + (checked ? 'checked' : '') + '>'
            + '<span class="track"></span><span class="knob"></span>'
            + '</span></label>';
    }

    function render(values) {
        var companies = groupCompanies();
        document.getElementById('acGcDefaults').innerHTML = SCREENS.slice(0, 4).map(function (screen) {
            var selected = values.gc_filter_default[screen.id] || [];
            return '<div class="ac-gc-row"><strong>' + screen.label + '</strong><div class="ac-checks">'
                + companies.map(function (company) {
                    return checkMarkup(
                        'acGc-' + screen.id + '-' + company.code,
                        company.shortName || company.name,
                        selected.indexOf(company.code) !== -1,
                        'data-screen="' + screen.id + '" data-gc="' + company.code + '"'
                    );
                }).join('')
                + '</div></div>';
        }).join('');

        document.getElementById('acScreenVisibility').innerHTML = SCREENS.map(function (screen) {
            return switchMarkup(screen, values.screen_visibility[screen.id] !== false);
        }).join('');
        setSegment('acNotificationScope', values.notification_scope_default);
        setSegment('acDensity', values.density_default);
    }

    function setSegment(id, value) {
        document.querySelectorAll('#' + id + ' button').forEach(function (button) {
            var active = button.getAttribute('data-value') === value;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function segmentValue(id) {
        var active = document.querySelector('#' + id + ' button.active');
        return active ? active.getAttribute('data-value') : '';
    }

    function collectValues() {
        var gcDefaults = {};
        SCREENS.slice(0, 4).forEach(function (screen) {
            gcDefaults[screen.id] = Array.from(document.querySelectorAll('#acGcDefaults input[data-screen="' + screen.id + '"]:checked'))
                .map(function (input) { return input.getAttribute('data-gc'); });
        });
        var visibility = {};
        document.querySelectorAll('#acScreenVisibility input[data-screen]').forEach(function (input) {
            visibility[input.getAttribute('data-screen')] = input.checked;
        });
        return {
            gc_filter_default: gcDefaults,
            notification_scope_default: segmentValue('acNotificationScope'),
            screen_visibility: visibility,
            density_default: segmentValue('acDensity')
        };
    }

    function save() {
        var values = collectValues();
        var record = {
            version: 1,
            user_id: 'mock-user-sato',
            preferences: Object.keys(values).map(function (key) {
                return { pref_key: key, pref_value: clone(values[key]) };
            })
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        var status = document.getElementById('acSaveStatus');
        status.textContent = '保存しました';
        window.setTimeout(function () { status.textContent = ''; }, 2000);
    }

    function bindSegments() {
        ['acNotificationScope', 'acDensity'].forEach(function (id) {
            document.getElementById(id).addEventListener('click', function (event) {
                var button = event.target.closest('button[data-value]');
                if (button) setSegment(id, button.getAttribute('data-value'));
            });
        });
    }

    function moveBellToRail() {
        var bells = document.getElementById('mdNavCnBells');
        var rail = document.getElementById('acRail');
        if (bells && rail) rail.appendChild(bells);
    }

    render(loadValues());
    bindSegments();
    moveBellToRail();
    document.getElementById('acSaveBtn').addEventListener('click', save);
    document.getElementById('acResetBtn').addEventListener('click', function () {
        localStorage.removeItem(STORAGE_KEY);
        render(defaultValues());
        document.getElementById('acSaveStatus').textContent = '既定値に戻しました';
    });
})();
