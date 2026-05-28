/* ============================================================
   mock-orders-data.js - OB / SL 共通の受注ダミーデータ
   ============================================================ */
(function () {
    'use strict';

    var DEFAULT_SUB_TASK_PREFIX = '工事名';

    var DEFAULT_ORDER_ROWS = [
        { _rowId: 1,  branch: '東央警備', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
        { _rowId: 2,  branch: '東央警備', category: '高速', shift: '夜', company: '(株)〇〇高速', task: '東名SA巡回', hidden: false },
        { _rowId: 3,  branch: '東央警備', category: '高速', shift: '昼', company: '△△建設(株)', task: '中央道補修', hidden: false },
        { _rowId: 4,  branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '〇〇ビル巡回', hidden: false },
        { _rowId: 5,  branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '△△マンション', hidden: false },
        { _rowId: 6,  branch: '東央警備', category: '交通', shift: '夜', company: '□□警備(株)', task: '国道1号線', hidden: false },
        { _rowId: 7,  branch: '東央警備', category: '施設', shift: '昼', company: '全日本エンタープライズ', task: '商業施設A', hidden: false },
        { _rowId: 8,  branch: '東央警備', category: '交通', shift: '昼', company: '(株)丸山建設', task: '', hidden: false },
        { _rowId: 9,  branch: 'Nikkeiホールディングス', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '名神SA巡回', hidden: false },
        { _rowId: 10, branch: 'Nikkeiホールディングス', category: '高速', shift: '昼', company: '△△建設(株)', task: '東名高速補修', hidden: true },
        { _rowId: 11, branch: 'Nikkeiホールディングス', category: '交通', shift: '昼', company: '(株)丸山建設', task: '□□公園整備', hidden: false },
        { _rowId: 12, branch: 'Nikkeiホールディングス', category: '交通', shift: '夜', company: '□□警備(株)', task: '県道12号線', hidden: false },
        { _rowId: 13, branch: 'Nikkeiホールディングス', category: '施設', shift: '昼', company: '全日本エンタープライズ', task: '商業施設B', hidden: false },
        { _rowId: 14, branch: '全日本エンタープライズ', category: '高速', shift: '昼', company: '(株)〇〇高速', task: '新東名SA巡回', hidden: false },
        { _rowId: 15, branch: '全日本エンタープライズ', category: '交通', shift: '昼', company: '(株)丸山建設', task: '〇〇交差点', hidden: false },
        { _rowId: 16, branch: '全日本エンタープライズ', category: '交通', shift: '夜', company: '□□警備(株)', task: '国道246号線', hidden: false },
        { _rowId: 17, branch: '全日本エンタープライズ', category: '施設', shift: '昼', company: '全日本エンタープライズ', task: '商業施設C', hidden: false },
    ];

    var SAMPLE_SUB_TASKS = {
        '高速': [
            { values: ['橋梁補修', '下地処理'] },
            { values: ['舗装工事', '本体施工'] },
            { values: ['トンネル点検', '仕上げ確認'] },
            { values: ['路面点検', '目視確認'] },
            { values: ['設備巡回', '計器チェック'] },
        ],
        '交通': [
            { values: ['交通誘導'] },
            { values: ['規制設置'] },
            { values: ['安全確認'] },
        ],
        '施設': [
            { values: ['巡回警備'] },
            { values: ['入退館管理'] },
            { values: ['設備点検'] },
        ],
    };

    var SAMPLE_INDIVIDUAL_SUB_TASKS = [
        { values: ['〇〇交差点'] },
        { values: ['△△公園前'] },
        { values: ['□□駅前'] },
        { values: ['××橋付近'] },
        { values: ['〇〇町3丁目'] },
        { values: ['△△通り'] },
        { values: ['□□インター入口'] },
        { values: ['〇〇小学校前'] },
    ];

    function clone(v) {
        return v == null ? v : JSON.parse(JSON.stringify(v));
    }

    function createSampleRows() {
        return clone(DEFAULT_ORDER_ROWS);
    }

    function getNextRowId(rows) {
        return (rows || DEFAULT_ORDER_ROWS).reduce(function(max, row) {
            return Math.max(max, parseInt(row && row._rowId, 10) || 0);
        }, 0) + 1;
    }

    function buildDailyTaskName(parentTask, subTasks) {
        var parts = [];
        if (parentTask) parts.push(parentTask);
        if (subTasks && subTasks.length > 0) {
            subTasks.forEach(function(st) { if (st.value) parts.push(st.value); });
        }
        return parts.join(' > ');
    }

    function dateFromKey(dateKey) {
        var m = String(dateKey || '2026-05-01').match(/^(\d{4})-(\d{2})-(\d{2})$/);
        var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(2026, 4, 1);
        if (Number.isNaN(d.getTime())) d = new Date(2026, 4, 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function buildSubTasks(row) {
        var samples = !row.task ? SAMPLE_INDIVIDUAL_SUB_TASKS : (SAMPLE_SUB_TASKS[row.category] || []);
        var sample = samples.length ? samples[Math.floor(Math.random() * samples.length)] : null;
        var subTasks = [];
        if (!sample) return subTasks;
        for (var i = 0; i < sample.values.length; i++) {
            var num = ['①','②','③','④','⑤'][i] || (i + 1);
            subTasks.push({
                label: DEFAULT_SUB_TASK_PREFIX + num,
                value: sample.values[i] || '',
            });
        }
        return subTasks;
    }

    function buildBadge(row) {
        if (row.category === '高速') {
            var childOpts = ['hw-lane', 'hw-shoulder', 'hw-booth', 'hw-security'];
            var picked = childOpts.filter(function() { return Math.random() > 0.5; });
            var gcMap = {};
            picked.forEach(function(cid) {
                if (cid === 'hw-lane' && Math.random() > 0.4) {
                    var gcOpts = ['hw-lane-sign', 'hw-lane-mat', 'hw-lane-light'];
                    gcMap[cid] = gcOpts.filter(function() { return Math.random() > 0.5; });
                } else if (cid === 'hw-shoulder' && Math.random() > 0.5) {
                    gcMap[cid] = ['hw-sh-cone'];
                }
            });
            return { parentId: 'highway', childIds: picked.length > 0 ? picked : [childOpts[0]], grandchildMap: gcMap };
        }
        if (row.category === '施設') {
            return { parentId: 'facility', childIds: [], grandchildMap: {} };
        }
        if (row.category === '交通' && Math.random() > 0.5) {
            var trafficOpts = ['tr-alternate', 'tr-closure'];
            var cid = trafficOpts[Math.floor(Math.random() * 2)];
            var trafficGcMap = {};
            if (cid === 'tr-alternate' && Math.random() > 0.5) trafficGcMap[cid] = ['tr-alt-flag'];
            return { parentId: 'traffic', childIds: [cid], grandchildMap: trafficGcMap };
        }
        return null;
    }

    function generateCellData(opts) {
        opts = opts || {};
        var year = opts.year || 2026;
        var month = opts.month || 5;
        var rows = opts.rows || createSampleRows();
        var demoToday = dateFromKey(opts.demoTodayKey || '2026-05-01');
        var data = {};
        var daysInMonth = new Date(year, month, 0).getDate();

        rows.forEach(function(row, ri) {
            data[ri] = {};
            for (var d = 1; d <= daysInMonth; d++) {
                if (Math.random() <= 0.35) continue;
                var count = Math.floor(Math.random() * 5) + 1;
                var names = ['山田太郎', '鈴木一郎', '佐藤花子', '田中次郎', '高橋三郎', '渡辺四郎', '伊藤五郎'];
                var cellDate = new Date(year, month - 1, d);
                var isFuture = cellDate >= demoToday;
                var assigned = (isFuture && Math.random() > 0.4) ? '' : names.slice(0, count).join('、');
                var startH = row.shift === '夜' ? 20 : 7 + Math.floor(Math.random() * 2);
                var endH = row.shift === '夜' ? 5 : 16 + Math.floor(Math.random() * 2);
                var subTasks = buildSubTasks(row);
                var badge = buildBadge(row);
                var cellEntry = {
                    count: count,
                    subTasks: subTasks,
                    dailyTaskName: buildDailyTaskName(row.task, subTasks),
                    startTime: String(startH).padStart(2, '0') + ':00',
                    endTime: String(endH).padStart(2, '0') + ':00',
                    supervisor: ['山田太郎', '佐藤次郎', '鈴木三郎', ''][Math.floor(Math.random() * 4)],
                    supervisorTel: ['090-1234-5678', '080-9876-5432', '070-1111-2222', ''][Math.floor(Math.random() * 4)],
                    assignment: assigned,
                    mapUrl: '',
                    badge: badge,
                    confidence: ['confirmed', 'tentative_high', 'tentative_low'][Math.floor(Math.random() * 3)],
                    remarks: Math.random() > 0.8 ? '雨天中止の可能性あり' : '',
                };
                var entries = [cellEntry];

                if (Math.random() < 0.2 && count >= 3) {
                    var count2 = Math.floor(Math.random() * Math.min(count - 1, 3)) + 1;
                    cellEntry.count = count - count2;
                    var startH2 = row.shift === '夜' ? 20 : 7 + Math.floor(Math.random() * 2);
                    var endH2 = row.shift === '夜' ? 5 : 16 + Math.floor(Math.random() * 2);
                    entries.push({
                        count: count2,
                        subTasks: [],
                        dailyTaskName: buildDailyTaskName(row.task, []),
                        startTime: String(startH2).padStart(2, '0') + ':00',
                        endTime: String(endH2).padStart(2, '0') + ':00',
                        supervisor: '',
                        supervisorTel: '',
                        assignment: '',
                        mapUrl: '',
                        badge: badge ? clone(badge) : null,
                        confidence: cellEntry.confidence,
                        remarks: '',
                        meetingPlace: '',
                        meetingTime: '',
                    });
                }

                data[ri][d] = entries;
            }
        });

        return data;
    }

    function buildMonthState(year, month, demoTodayKey) {
        var rows = createSampleRows();
        return {
            sampleRows: rows,
            cellData: generateCellData({ year: year, month: month, rows: rows, demoTodayKey: demoTodayKey }),
            obNextRowId: getNextRowId(rows)
        };
    }

    window.OmsMockOrdersData = {
        defaultSubTaskPrefix: DEFAULT_SUB_TASK_PREFIX,
        createSampleRows: createSampleRows,
        getNextRowId: getNextRowId,
        buildDailyTaskName: buildDailyTaskName,
        generateCellData: generateCellData,
        buildMonthState: buildMonthState,
    };

    // デモ用: 行削除→復旧トグルの対象となる「削除済みダミー行」
    // 初期グリッドには存在せず、通知の「データを復旧する」で再挿入される。
    window.OMS_DEMO_DELETED_ROW = {
        _rowId: 'demo-deleted-1',
        branch: '東央警備', category: '高速', shift: '昼',
        company: '西日本高速道路(株)', task: 'PJNo.26-5225', hidden: false
    };
    // 復旧済みフラグ（localStorage 永続化。単一の真実源として多重復旧を防止）
    window.OmsDemoRecover = {
        KEY: 'oms.demo.deletedRowRecovered.v1',
        isRecovered: function () {
            try { return localStorage.getItem(this.KEY) === 'true'; } catch (e) { return false; }
        },
        setRecovered: function (v) {
            try {
                if (v) localStorage.setItem(this.KEY, 'true');
                else localStorage.removeItem(this.KEY);
            } catch (e) {}
        }
    };
})();
