/* G-2: personal preferences and admin-only user management. */
(function () {
    'use strict';

    var PREFERENCES_KEY = 'mock.oms.account.preferences.v1';
    var SCREENS = [
        { id: 'screen-layout', label: '業務管理計画書' },
        { id: 'order-book', label: '受注簿' },
        { id: 'weekly-schedule', label: '週間予定表' },
        { id: 'leave-application', label: '休暇申請管理' },
        { id: 'quick-access', label: 'Quick Access' }
    ];
    var ROLE_LABELS = {
        sales: '営業担当者',
        dispatch: '配置担当者',
        accounting: '経理',
        admin: '管理者'
    };
    var accountState = window.OmsMockAccountData ? window.OmsMockAccountData.load() : null;
    var activeTab = 'personal';
    var selectedUserId = null;
    var statusFilter = 'active';

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function groupCompanies() {
        return typeof groupCompaniesData !== 'undefined' && Array.isArray(groupCompaniesData) ? groupCompaniesData : [];
    }

    function employees() {
        return typeof employeesData !== 'undefined' && Array.isArray(employeesData) ? employeesData : [];
    }

    function qaCompanies() {
        return window.OmsMockAccountData ? window.OmsMockAccountData.createQaCompanies() : [];
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

    function loadValues() {
        var defaults = defaultValues();
        try {
            var saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || 'null');
            if (!saved || !Array.isArray(saved.preferences)) return defaults;
            saved.preferences.forEach(function (entry) {
                if (entry && Object.prototype.hasOwnProperty.call(defaults, entry.pref_key)) defaults[entry.pref_key] = clone(entry.pref_value);
            });
        } catch (error) {
            return defaults;
        }
        return defaults;
    }

    function checkMarkup(id, label, checked, attrs) {
        return '<label class="check"><input type="checkbox" id="' + id + '" '
            + (checked ? 'checked ' : '') + (attrs || '') + '><span class="box"></span>' + label + '</label>';
    }

    function switchMarkup(screen, checked) {
        return '<label class="ac-toggle-item" for="acVisible-' + screen.id + '"><span>' + screen.label + '</span>'
            + '<span class="switch"><input type="checkbox" id="acVisible-' + screen.id + '" data-screen="' + screen.id + '" '
            + (checked ? 'checked' : '') + '><span class="track"></span><span class="knob"></span></span></label>';
    }

    function renderPreferences(values) {
        var companies = groupCompanies();
        document.getElementById('acGcDefaults').innerHTML = SCREENS.slice(0, 4).map(function (screen) {
            var selected = values.gc_filter_default[screen.id] || [];
            return '<div class="ac-gc-row"><strong>' + screen.label + '</strong><div class="ac-checks">'
                + companies.map(function (company) {
                    return checkMarkup('acGc-' + screen.id + '-' + company.code, company.shortName || company.name,
                        selected.indexOf(company.code) !== -1, 'data-screen="' + screen.id + '" data-gc="' + company.code + '"');
                }).join('') + '</div></div>';
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

    function savePreferences() {
        var values = collectValues();
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
            version: 1,
            user_id: 'mock-user-sato',
            preferences: Object.keys(values).map(function (key) { return { pref_key: key, pref_value: clone(values[key]) }; })
        }));
        showStatus('保存しました');
    }

    function employeeOptionMarkup(selectedId) {
        var html = '<option value="">紐付けなし</option>';
        employees().forEach(function (employee, index) {
            var id = 'emp-' + (index + 1);
            html += '<option value="' + id + '"' + (selectedId === id ? ' selected' : '') + '>'
                + employee.name + ' / ' + groupCompanyName(employee.company) + '</option>';
        });
        return html;
    }

    function groupCompanyName(code) {
        var company = groupCompanies().find(function (item) { return item.code === code; });
        return company ? company.name : '未設定';
    }

    function employeeFor(profile) {
        var index = Number(String(profile.employee_id || '').replace('emp-', '')) - 1;
        return index >= 0 ? employees()[index] : null;
    }

    function employeeName(profile) {
        var employee = employeeFor(profile);
        return employee ? employee.name : '紐付けなし';
    }

    function assignmentIds(userId) {
        return accountState.user_company_assignments
            .filter(function (item) { return item.user_id === userId; })
            .sort(function (a, b) { return a.sort_order - b.sort_order; })
            .map(function (item) { return item.company_id; });
    }

    function renderUserRows() {
        var query = document.getElementById('acUserSearch').value.trim().toLowerCase();
        var rows = accountState.profiles.filter(function (profile) {
            var matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? profile.is_active : !profile.is_active);
            var haystack = (profile.display_name + ' ' + profile.auth_email).toLowerCase();
            return matchesStatus && (!query || haystack.indexOf(query) !== -1);
        });
        document.getElementById('acUserRows').innerHTML = rows.map(function (profile) {
            var employee = employeeFor(profile);
            var selected = profile.user_id === selectedUserId;
            return '<tr data-user-id="' + profile.user_id + '" tabindex="0" class="' + (selected ? 'is-selected' : '') + '">'
                + '<td><strong>' + escapeHtml(profile.display_name) + '</strong><span class="sub">' + escapeHtml(profile.auth_email) + '</span></td>'
                + '<td>' + ROLE_LABELS[profile.role] + '</td><td>' + employeeName(profile) + '</td>'
                + '<td>' + groupCompanyName(employee ? employee.company : profile.group_company_id) + '</td>'
                + '<td class="num">' + assignmentIds(profile.user_id).length + '</td>'
                + '<td><span class="mini-badge ' + (profile.is_active ? 'ok' : 'warn') + '">' + (profile.is_active ? '有効' : '無効') + '</span></td></tr>';
        }).join('');
        document.getElementById('acUserEmpty').hidden = rows.length > 0;
    }

    function renderAssignments(userId) {
        var assigned = assignmentIds(userId);
        document.getElementById('acUserAssignments').innerHTML = qaCompanies().map(function (company) {
            return checkMarkup('acAssignment-' + company.id, company.name, assigned.indexOf(company.id) !== -1,
                'data-company-id="' + company.id + '"');
        }).join('');
    }

    function openUser(userId, isNew) {
        var profile = isNew ? {
            id: '', user_id: '', auth_email: '', employee_id: '', group_company_id: '', display_name: '', role: 'sales', is_active: true
        } : accountState.profiles.find(function (item) { return item.user_id === userId; });
        if (!profile) return;
        selectedUserId = isNew ? null : profile.user_id;
        document.getElementById('acUserPropTitle').textContent = isNew ? '新規ユーザー' : profile.display_name;
        document.getElementById('acUserPropMode').textContent = isNew ? '新規作成' : '編集';
        document.getElementById('acUserName').value = profile.display_name;
        document.getElementById('acUserEmail').value = profile.auth_email;
        document.getElementById('acUserRole').value = profile.role;
        document.getElementById('acUserEmployee').innerHTML = employeeOptionMarkup(profile.employee_id);
        document.getElementById('acUserActive').checked = profile.is_active;
        document.getElementById('acUserError').textContent = '';
        updateEditorGroupCompany();
        renderAssignments(profile.user_id);
        renderUserRows();
    }

    function updateEditorGroupCompany() {
        var employeeId = document.getElementById('acUserEmployee').value;
        var index = Number(employeeId.replace('emp-', '')) - 1;
        var employee = index >= 0 ? employees()[index] : null;
        document.getElementById('acUserGroupCompany').value = employee ? groupCompanyName(employee.company) : '未設定';
    }

    function saveUser() {
        var name = document.getElementById('acUserName').value.trim();
        var email = document.getElementById('acUserEmail').value.trim();
        var error = document.getElementById('acUserError');
        if (!name || !email || email.indexOf('@') < 1) {
            error.textContent = '表示名と正しいメールアドレスを入力してください。';
            return;
        }
        var duplicate = accountState.profiles.some(function (profile) {
            return profile.auth_email.toLowerCase() === email.toLowerCase() && profile.user_id !== selectedUserId;
        });
        if (duplicate) {
            error.textContent = 'このメールアドレスは使用済みです。';
            return;
        }
        var employeeId = document.getElementById('acUserEmployee').value;
        var employeeIndex = Number(employeeId.replace('emp-', '')) - 1;
        var employee = employeeIndex >= 0 ? employees()[employeeIndex] : null;
        var profile = selectedUserId ? accountState.profiles.find(function (item) { return item.user_id === selectedUserId; }) : null;
        if (!profile) {
            selectedUserId = 'mock-user-' + Date.now();
            profile = { id: 'profile-' + Date.now(), user_id: selectedUserId };
            accountState.profiles.push(profile);
        }
        profile.display_name = name;
        profile.auth_email = email;
        profile.role = document.getElementById('acUserRole').value;
        profile.employee_id = employeeId || null;
        profile.group_company_id = employee ? employee.company : null;
        profile.is_active = document.getElementById('acUserActive').checked;
        accountState.user_company_assignments = accountState.user_company_assignments.filter(function (item) { return item.user_id !== selectedUserId; });
        document.querySelectorAll('#acUserAssignments input[data-company-id]:checked').forEach(function (input, index) {
            accountState.user_company_assignments.push({
                user_id: selectedUserId,
                company_id: Number(input.getAttribute('data-company-id')),
                sort_order: index
            });
        });
        window.OmsMockAccountData.save(accountState);
        error.textContent = '';
        renderUserRows();
        openUser(selectedUserId, false);
        showStatus('ユーザーを保存しました');
    }

    function showStatus(message) {
        var status = document.getElementById('acSaveStatus');
        status.textContent = message;
        window.setTimeout(function () { status.textContent = ''; }, 2000);
    }

    function setViewerRole(role) {
        var canManage = role === 'admin';
        document.getElementById('acUserAdminTab').hidden = !canManage;
        if (!canManage && activeTab === 'users') setActiveTab('personal');
    }

    function setActiveTab(tab) {
        if (tab === 'users' && document.getElementById('acUserAdminTab').hidden) return;
        activeTab = tab;
        document.querySelectorAll('[data-tab]').forEach(function (button) {
            var active = button.getAttribute('data-tab') === tab;
            button.classList.toggle('active', active);
            button.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelector('.ac-personal-view').hidden = tab !== 'personal';
        document.querySelector('.ac-users-view').hidden = tab !== 'users';
        document.querySelector('.ac-user-prop').hidden = tab !== 'users';
        document.querySelector('.ac-workspace').classList.toggle('is-user-admin', tab === 'users');
        if (tab === 'users') {
            if (!selectedUserId && accountState.profiles.length) selectedUserId = accountState.profiles[0].user_id;
            renderUserRows();
            openUser(selectedUserId, false);
        }
    }

    function resetCurrentTab() {
        if (activeTab === 'users') {
            accountState = window.OmsMockAccountData.reset();
            selectedUserId = accountState.current_user_id;
            renderUserRows();
            openUser(selectedUserId, false);
            showStatus('ユーザーデータを既定値に戻しました');
            return;
        }
        localStorage.removeItem(PREFERENCES_KEY);
        renderPreferences(defaultValues());
        showStatus('既定値に戻しました');
    }

    function bind() {
        ['acNotificationScope', 'acDensity', 'acUserStatusFilter'].forEach(function (id) {
            document.getElementById(id).addEventListener('click', function (event) {
                var button = event.target.closest('button[data-value]');
                if (!button) return;
                setSegment(id, button.getAttribute('data-value'));
                if (id === 'acUserStatusFilter') {
                    statusFilter = button.getAttribute('data-value');
                    renderUserRows();
                }
            });
        });
        document.querySelector('[role="tablist"]').addEventListener('click', function (event) {
            var tab = event.target.closest('[data-tab]');
            if (tab) setActiveTab(tab.getAttribute('data-tab'));
        });
        document.getElementById('acViewerRole').addEventListener('change', function (event) { setViewerRole(event.target.value); });
        document.getElementById('acSaveBtn').addEventListener('click', function () { activeTab === 'users' ? saveUser() : savePreferences(); });
        document.getElementById('acResetBtn').addEventListener('click', resetCurrentTab);
        document.getElementById('acAddUserBtn').addEventListener('click', function () { openUser('', true); });
        document.getElementById('acUserSearch').addEventListener('input', renderUserRows);
        document.getElementById('acUserEmployee').addEventListener('change', updateEditorGroupCompany);
        document.getElementById('acUserRows').addEventListener('click', function (event) {
            var row = event.target.closest('tr[data-user-id]');
            if (row) openUser(row.getAttribute('data-user-id'), false);
        });
        document.getElementById('acUserRows').addEventListener('keydown', function (event) {
            var row = event.target.closest('tr[data-user-id]');
            if (row && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openUser(row.getAttribute('data-user-id'), false);
            }
        });
    }

    function moveBellToRail() {
        var bells = document.getElementById('mdNavCnBells');
        var rail = document.getElementById('acRail');
        if (bells && rail) rail.appendChild(bells);
    }

    renderPreferences(loadValues());
    document.getElementById('acUserEmployee').innerHTML = employeeOptionMarkup('');
    setSegment('acUserStatusFilter', statusFilter);
    setViewerRole(document.getElementById('acViewerRole').value);
    bind();
    moveBellToRail();
})();
