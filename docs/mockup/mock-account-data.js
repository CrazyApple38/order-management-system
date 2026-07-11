/* G-2: shared mock source for user profiles, assignments, and QA companies. */
(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.account.users.v1';
    var CURRENT_USER_ID = 'mock-user-sato';
    var QA_USER_ID = 'mock-user-tanaka';
    var QA_COMPANIES = [
        {
            id: 1, name: '鈴木建設株式会社', categories: ['交通', '高速'], lastOrderDate: '2026-03-28', orderCount: 15,
            sites: [
                { id: 101, name: '国道16号 拡幅工事現場', lastOrderDate: '2026-03-28', branch: '東央警備', category: '交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
                { id: 102, name: '東名高速 補修工事', lastOrderDate: '2026-03-20', branch: '東央警備', category: '高速', shift: '夜', presetStart: '20:00', presetEnd: '05:00' }
            ]
        },
        {
            id: 2, name: '東京イベントサービス', categories: ['イベント'], lastOrderDate: '2026-03-25', orderCount: 8,
            sites: [
                { id: 201, name: '東京ドーム コンサート警備', lastOrderDate: '2026-03-25', branch: 'Nikkeiホールディングス', category: 'イベント', shift: '昼', presetStart: '09:00', presetEnd: '18:00' },
                { id: 202, name: '幕張メッセ 展示会', lastOrderDate: '2026-03-10', branch: 'Nikkeiホールディングス', category: 'イベント', shift: '昼', presetStart: '08:00', presetEnd: '17:00' }
            ]
        },
        {
            id: 3, name: 'ABCマンション管理組合', categories: ['施設'], lastOrderDate: '2026-03-22', orderCount: 30,
            sites: [
                { id: 301, name: 'ABCマンション 常駐警備', lastOrderDate: '2026-03-22', branch: '全日本エンタープライズ', category: '施設', shift: '昼', presetStart: '08:00', presetEnd: '17:00' }
            ]
        },
        {
            id: 4, name: '関東道路サービス', categories: ['高速'], lastOrderDate: '2026-03-18', orderCount: 22,
            sites: [
                { id: 401, name: '首都高速 中央環状線 車線規制', lastOrderDate: '2026-03-18', branch: '東央警備', category: '高速', shift: '夜', presetStart: '20:00', presetEnd: '05:00' },
                { id: 402, name: '東北自動車道 路肩規制', lastOrderDate: '2026-03-12', branch: '東央警備', category: '高速', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
                { id: 403, name: '常磐自動車道 保安業務', lastOrderDate: '2026-03-05', branch: 'Nikkeiホールディングス', category: '高速', shift: '昼', presetStart: '07:00', presetEnd: '16:00' }
            ]
        },
        {
            id: 5, name: '市川市役所', categories: ['交通'], lastOrderDate: '2026-03-15', orderCount: 5,
            sites: [
                { id: 501, name: '市川駅前 歩行者天国', lastOrderDate: '2026-03-15', branch: '全日本エンタープライズ', category: '交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' }
            ]
        },
        {
            id: 6, name: 'グローバル警備応援', categories: ['応援交通'], lastOrderDate: '2026-03-10', orderCount: 3,
            sites: [
                { id: 601, name: '横浜市内 交通誘導', lastOrderDate: '2026-03-10', branch: '東央警備', category: '応援交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' }
            ]
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function seed() {
        return {
            version: 1,
            current_user_id: CURRENT_USER_ID,
            profiles: [
                { id: 'profile-sato', user_id: CURRENT_USER_ID, auth_email: 'sato@example.com', employee_id: 'emp-2', group_company_id: 'touo', display_name: '佐藤', role: 'admin', is_active: true },
                { id: 'profile-tanaka', user_id: 'mock-user-tanaka', auth_email: 'tanaka@example.com', employee_id: 'emp-1', group_company_id: 'touo', display_name: '田中', role: 'sales', is_active: true },
                { id: 'profile-yamamoto', user_id: 'mock-user-yamamoto', auth_email: 'yamamoto@example.com', employee_id: 'emp-10', group_company_id: 'nikkei', display_name: '山本', role: 'dispatch', is_active: true },
                { id: 'profile-yoshida', user_id: 'mock-user-yoshida', auth_email: 'yoshida@example.com', employee_id: 'emp-18', group_company_id: 'zennihon', display_name: '吉田', role: 'accounting', is_active: true }
            ],
            user_company_assignments: [
                { user_id: CURRENT_USER_ID, company_id: 1, sort_order: 0 },
                { user_id: CURRENT_USER_ID, company_id: 4, sort_order: 1 },
                { user_id: 'mock-user-tanaka', company_id: 1, sort_order: 0 },
                { user_id: 'mock-user-tanaka', company_id: 2, sort_order: 1 },
                { user_id: 'mock-user-tanaka', company_id: 5, sort_order: 2 }
            ]
        };
    }

    function normalize(saved) {
        if (!saved || !Array.isArray(saved.profiles) || !Array.isArray(saved.user_company_assignments)) return seed();
        saved.current_user_id = saved.current_user_id || CURRENT_USER_ID;
        return saved;
    }

    function load() {
        try {
            return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
        } catch (error) {
            return seed();
        }
    }

    function save(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(clone(state))));
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        return seed();
    }

    function assignedCompanyIds(userId) {
        return load().user_company_assignments
            .filter(function (item) { return item.user_id === userId; })
            .sort(function (a, b) { return a.sort_order - b.sort_order; })
            .map(function (item) { return item.company_id; });
    }

    window.OmsMockAccountData = {
        storageKey: STORAGE_KEY,
        currentUserId: CURRENT_USER_ID,
        qaUserId: QA_USER_ID,
        load: load,
        save: save,
        reset: reset,
        createQaClients: function () { return clone(QA_COMPANIES); },
        createQaCompanies: function () {
            return QA_COMPANIES.map(function (company) { return { id: company.id, name: company.name }; });
        },
        assignedCompanyIds: assignedCompanyIds
    };
})();
