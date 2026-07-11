(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.master.v1';
    var state = loadState();
    var selectedId = null;
    var editorMode = 'detail';
    var statusFilter = 'active';

    var masterSections = [
        { label: '組織', items: [
            ['group-company', 'グループ会社', 'i-settings'],
            ['org-level-type', '組織階層種別', 'i-settings'],
            ['org-unit', '組織ノード', 'i-settings']
        ]},
        { label: '人事', items: [
            ['employee', '社員', 'i-person'],
            ['license-type', '資格検定', 'i-doc']
        ]},
        { label: '現場・取引', items: [
            ['company', '契約先', 'i-doc'],
            ['site', '現場', 'i-task'],
            ['site-category', '区分・バッジ', 'i-task']
        ]},
        { label: '協力業者', items: [
            ['support-partner', '協力業者', 'i-support']
        ]},
        { label: '書類テンプレ', items: [
            ['price-note', '料金特記定型文', 'i-doc'],
            ['special-note', 'その他特記定型文', 'i-doc'],
            ['order-template', '注文書テンプレート', 'i-doc']
        ]},
        { label: '車両・資機材', items: [
            ['vehicle', '車両', 'i-car'],
            ['etc-card', 'ETCカード', 'i-car']
        ]},
        { label: '運用・制度', items: [
            ['holiday', '祝日', 'i-task'],
            ['penalty-code', 'ペナルティコード', 'i-task']
        ]},
        { label: 'システム', items: [
            ['user-role', 'ユーザー・権限', 'i-person'],
            ['color-preset', 'カラープリセット', 'i-settings'],
            ['user-company', 'ユーザー契約先紐付', 'i-settings']
        ]}
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function seedCompanies() {
        var source = typeof companiesData !== 'undefined' && Array.isArray(companiesData) ? companiesData : [];
        return source.map(function (company, index) {
            var name = String(company.name || '');
            var formal = window.CoCompanyInput ? window.CoCompanyInput.normalize(name).value : name;
            return {
                id: 'company-' + company.id,
                code: 'C' + String(index + 1).padStart(3, '0'),
                name: name,
                formalName: formal,
                notes: '',
                sortOrder: index + 1,
                isActive: true
            };
        });
    }

    function loadState() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && Array.isArray(saved.companies)) return saved;
        } catch (error) {
            console.warn('マスタ管理の保存データを読み込めませんでした。', error);
        }
        return { version: 1, nextCompanyId: 1, companies: seedCompanies() };
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
    }

    function countFor(id) {
        if (id === 'company') return state.companies.filter(function (item) { return item.isActive; }).length;
        if (id === 'group-company' && typeof groupCompaniesData !== 'undefined') return groupCompaniesData.length;
        if (id === 'org-level-type' && typeof orgLevelTypesData !== 'undefined') return Object.keys(orgLevelTypesData).length;
        if (id === 'employee' && typeof employeesData !== 'undefined') return employeesData.length;
        if (id === 'vehicle' && typeof vehiclesData !== 'undefined') return vehiclesData.length;
        if (id === 'etc-card' && typeof etcCardsData !== 'undefined') return etcCardsData.length;
        return 0;
    }

    function renderNav() {
        var html = masterSections.map(function (section) {
            return '<div class="side-nav-heading">' + escapeHtml(section.label) + '</div>' + section.items.map(function (item) {
                var active = item[0] === 'company';
                return '<button type="button" class="side-nav-item' + (active ? ' active' : '') + '" data-master="' + item[0] + '"' + (active ? '' : ' disabled') + '>'
                    + '<span class="icon ' + item[2] + ' icon-ink" aria-hidden="true"></span>'
                    + escapeHtml(item[1]) + '<span class="nav-count">' + countFor(item[0]) + '</span></button>';
            }).join('');
        }).join('');
        document.getElementById('maSideNav').innerHTML = html;
    }

    function filteredCompanies() {
        var query = document.getElementById('maSearch').value.trim().toLocaleLowerCase('ja');
        return state.companies.filter(function (company) {
            if (statusFilter === 'active' && !company.isActive) return false;
            if (statusFilter === 'inactive' && company.isActive) return false;
            if (!query) return true;
            return [company.code, company.name, company.formalName, company.notes].some(function (value) {
                return String(value || '').toLocaleLowerCase('ja').indexOf(query) !== -1;
            });
        }).sort(function (a, b) { return a.sortOrder - b.sortOrder; });
    }

    function renderTable() {
        var items = filteredCompanies();
        document.getElementById('maTableBody').innerHTML = items.map(function (company) {
            return '<tr data-id="' + escapeHtml(company.id) + '" class="' + (company.id === selectedId ? 'is-selected' : '') + '" tabindex="0">'
                + '<td>' + escapeHtml(company.code) + '</td>'
                + '<td><strong>' + escapeHtml(company.name) + '</strong></td>'
                + '<td>' + escapeHtml(company.formalName) + '</td>'
                + '<td class="sub">' + escapeHtml(company.notes || '') + '</td>'
                + '<td><span class="ma-status' + (company.isActive ? ' is-active' : '') + '">' + (company.isActive ? '有効' : '無効') + '</span></td>'
                + '</tr>';
        }).join('');
        document.getElementById('maEmptyState').hidden = items.length !== 0;
        document.getElementById('maMainCount').textContent = items.length + '件';
        renderNav();
    }

    function clearEditor() {
        selectedId = null;
        editorMode = 'detail';
        document.getElementById('maCompanyForm').hidden = true;
        document.getElementById('maPropMode').textContent = '詳細';
        document.getElementById('maPropTitle').textContent = '未選択';
        document.getElementById('maPropSub').textContent = '契約先を選択するか、新規追加を実行してください。';
        renderTable();
    }

    function selectCompany(id) {
        var company = state.companies.find(function (item) { return item.id === id; });
        if (!company) return;
        selectedId = id;
        editorMode = 'edit';
        document.getElementById('maCompanyForm').hidden = false;
        document.getElementById('maPropMode').textContent = '編集';
        document.getElementById('maPropTitle').textContent = company.name;
        document.getElementById('maPropSub').textContent = company.code;
        document.getElementById('maCompanyCode').value = company.code;
        document.getElementById('maCompanyName').value = company.name;
        document.getElementById('maCompanyFormalName').value = company.formalName;
        document.getElementById('maCompanyNotes').value = company.notes || '';
        var toggle = document.getElementById('maToggleActiveBtn');
        toggle.hidden = false;
        toggle.textContent = company.isActive ? '無効化' : '有効化';
        toggle.className = company.isActive ? 'btn btn-danger' : 'btn btn-secondary';
        setPanelMode('detail');
        renderTable();
    }

    function startNew() {
        selectedId = null;
        editorMode = 'new';
        document.getElementById('maCompanyForm').reset();
        document.getElementById('maCompanyForm').hidden = false;
        document.getElementById('maPropMode').textContent = '新規追加';
        document.getElementById('maPropTitle').textContent = '契約先を追加';
        document.getElementById('maPropSub').textContent = '必須項目を入力して保存します。';
        document.getElementById('maToggleActiveBtn').hidden = true;
        setPanelMode('detail');
        renderTable();
        document.getElementById('maCompanyCode').focus();
    }

    function submitCompany(event) {
        event.preventDefault();
        var code = document.getElementById('maCompanyCode').value.trim();
        var name = document.getElementById('maCompanyName').value.trim();
        var formalName = document.getElementById('maCompanyFormalName').value.trim();
        var notes = document.getElementById('maCompanyNotes').value.trim();
        var duplicate = state.companies.some(function (item) {
            return item.code.toLocaleLowerCase() === code.toLocaleLowerCase() && item.id !== selectedId;
        });
        if (duplicate) {
            document.getElementById('maCompanyCode').setCustomValidity('同じ契約先コードが登録されています。');
            document.getElementById('maCompanyCode').reportValidity();
            return;
        }
        document.getElementById('maCompanyCode').setCustomValidity('');
        if (editorMode === 'new') {
            var id = 'company-local-' + state.nextCompanyId++;
            state.companies.push({
                id: id,
                code: code,
                name: name,
                formalName: formalName,
                notes: notes,
                sortOrder: state.companies.length + 1,
                isActive: true
            });
            selectedId = id;
        } else {
            var company = state.companies.find(function (item) { return item.id === selectedId; });
            if (!company) return;
            company.code = code;
            company.name = name;
            company.formalName = formalName;
            company.notes = notes;
        }
        saveState();
        selectCompany(selectedId);
    }

    function toggleActive() {
        var company = state.companies.find(function (item) { return item.id === selectedId; });
        if (!company) return;
        company.isActive = !company.isActive;
        saveState();
        if ((statusFilter === 'active' && !company.isActive) || (statusFilter === 'inactive' && company.isActive)) {
            clearEditor();
            return;
        }
        selectCompany(company.id);
    }

    function renderHistory() {
        var list = document.getElementById('maHistoryList');
        var items = window.coNotifyPanel && window.coNotifyPanel.getItems
            ? window.coNotifyPanel.getItems('all').filter(function (item) { return item.domain === 'master'; })
            : [];
        list.innerHTML = items.length ? items.map(function (item) {
            return '<div class="list-plain"><strong>' + escapeHtml(item.title || item.summary || 'マスタ更新') + '</strong>'
                + '<span class="sub">' + escapeHtml(item.time || item.createdAt || '') + '</span></div>';
        }).join('') : '<div class="ma-history-empty">変更履歴はありません。</div>';
    }

    function setPanelMode(mode) {
        document.querySelectorAll('.panel-rail [data-mode]').forEach(function (button) {
            button.classList.toggle('active', button.getAttribute('data-mode') === mode);
        });
        document.getElementById('maHistoryPanel').hidden = mode !== 'history';
        document.getElementById('maCompanyForm').hidden = mode === 'history' || editorMode === 'detail';
        if (mode === 'history') {
            document.getElementById('maPropMode').textContent = '変更履歴';
            document.getElementById('maPropTitle').textContent = 'マスタ変更';
            document.getElementById('maPropSub').textContent = '変更通知のうちマスタ更新を表示します。';
            renderHistory();
        } else if (selectedId) {
            var company = state.companies.find(function (item) { return item.id === selectedId; });
            if (company) {
                document.getElementById('maPropMode').textContent = '編集';
                document.getElementById('maPropTitle').textContent = company.name;
                document.getElementById('maPropSub').textContent = company.code;
            }
        }
    }

    function mountNotifyRail() {
        var bells = document.getElementById('mdNavCnBells');
        var rail = document.getElementById('maRail');
        if (bells && rail) rail.appendChild(bells);
    }

    function selectFromUrl() {
        var requested = new URLSearchParams(location.search).get('master');
        if (requested && requested !== 'company') {
            history.replaceState(null, '', location.pathname + '?master=company');
        }
    }

    function bindEvents() {
        document.getElementById('maSearch').addEventListener('input', renderTable);
        document.getElementById('maNewBtn').addEventListener('click', startNew);
        document.getElementById('maCompanyForm').addEventListener('submit', submitCompany);
        document.getElementById('maToggleActiveBtn').addEventListener('click', toggleActive);
        document.getElementById('maCompanyCode').addEventListener('input', function () { this.setCustomValidity(''); });
        document.getElementById('maTableBody').addEventListener('click', function (event) {
            var row = event.target.closest('tr[data-id]');
            if (row) selectCompany(row.getAttribute('data-id'));
        });
        document.getElementById('maTableBody').addEventListener('keydown', function (event) {
            var row = event.target.closest('tr[data-id]');
            if (row && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                selectCompany(row.getAttribute('data-id'));
            }
        });
        document.querySelectorAll('#maStatusFilter [data-status]').forEach(function (button) {
            button.addEventListener('click', function () {
                statusFilter = button.getAttribute('data-status');
                document.querySelectorAll('#maStatusFilter [data-status]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                clearEditor();
            });
        });
        document.querySelectorAll('.panel-rail [data-mode]').forEach(function (button) {
            button.addEventListener('click', function () { setPanelMode(button.getAttribute('data-mode')); });
        });
    }

    function init() {
        selectFromUrl();
        mountNotifyRail();
        bindEvents();
        renderTable();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
