/* ============================================================
   mock-employees-data.js - SL / WS / LA 共通の社員ダミーデータ
   ============================================================ */
(function () {
    'use strict';

    var DEFAULT_EMPLOYEES = [
        { name: '田中', company: 'touo', dept: 'touo-shisetsu' },
        { name: '佐藤', company: 'touo', dept: 'touo-shisetsu', workedPrevNight: true },
        { name: '鈴木', company: 'touo', dept: 'touo-kotsu' },
        { name: '高橋', company: 'touo', dept: 'touo-kotsu' },
        { name: '伊藤', company: 'touo', dept: 'touo-shisetsu' },
        { name: '林',   company: 'touo', dept: 'touo-shisetsu', isOnLeave: true },
        { name: '斎藤', company: 'touo', dept: 'touo-kotsu' },
        { name: '池田', company: 'touo', dept: 'touo-shisetsu' },
        { name: '橋本', company: 'touo', dept: 'touo-kotsu' },
        { name: '山本', company: 'nikkei', dept: 'nikkei-shisetsu' },
        { name: '中村', company: 'nikkei', dept: 'nikkei-shisetsu', workedPrevNight: true },
        { name: '小林', company: 'nikkei', dept: 'nikkei-kotsu' },
        { name: '渡辺', company: 'nikkei', dept: 'nikkei-kotsu' },
        { name: '加藤', company: 'nikkei', dept: 'nikkei-shisetsu' },
        { name: '清水', company: 'nikkei', dept: 'nikkei-kotsu', isOnLeave: true },
        { name: '山口', company: 'nikkei', dept: 'nikkei-shisetsu' },
        { name: '阿部', company: 'nikkei', dept: 'nikkei-shisetsu' },
        { name: '吉田', company: 'zennihon', dept: 'zen-kotsu1', workedPrevNight: true },
        { name: '山田', company: 'zennihon', dept: 'zen-kotsu1' },
        { name: '松本', company: 'zennihon', dept: 'zen-kotsu2' },
        { name: '井上', company: 'zennihon', dept: 'zen-kotsu2' },
        { name: '木村', company: 'zennihon', dept: 'zen-kotsu3' },
        { name: '森',   company: 'zennihon', dept: 'zen-kotsu3' },
        { name: '石川', company: 'zennihon', dept: 'zen-ehime' },
        { name: '前田', company: 'zennihon', dept: 'zen-ehime', isOnLeave: true }
    ];

    function clone(v) {
        return v == null ? v : JSON.parse(JSON.stringify(v));
    }

    function createEmployees() {
        return clone(DEFAULT_EMPLOYEES);
    }

    function employeeIdFromIndex(index) {
        return 'emp-' + (index + 1);
    }

    window.OmsMockEmployeesData = {
        createEmployees: createEmployees,
        employeeIdFromIndex: employeeIdFromIndex
    };
})();
