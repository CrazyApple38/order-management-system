/* ============================================================
   mock-vehicles-data.js - SL / WS / LA 共通の車両・ETCダミーデータ
   ============================================================ */
(function () {
    'use strict';

    var DEFAULT_VEHICLES = [
        // 東央警備
        { id: 'v-001', plate: 'さ 3078', numberPlate: '品川 500 さ 30-78', model: 'ハイエース',   owner: 'touo',     nextShakenDate: '2026-08-15', nextInspectionDate: '2026-06-10' },
        { id: 'v-002', plate: 'わ 2490', numberPlate: '品川 500 わ 24-90', model: 'キャラバン',   owner: 'touo',     nextShakenDate: '2026-11-20', nextInspectionDate: '2026-05-25' },
        { id: 'v-003', plate: 'あ 1234', numberPlate: '品川 500 あ 12-34', model: 'ハイエース',   owner: 'touo',     nextShakenDate: '2026-06-05', nextInspectionDate: '2026-09-01' },
        { id: 'v-004', plate: 'た 9012', numberPlate: '品川 800 た 90-12', model: 'エルフ',       owner: 'touo',     nextShakenDate: '2027-02-10', nextInspectionDate: '2026-07-20' },
        { id: 'v-005', plate: 'ふ 4501', numberPlate: '品川 300 ふ 45-01', model: 'プロボックス', owner: 'touo',     nextShakenDate: '2026-10-30', nextInspectionDate: '2026-05-18' },
        // Nikkei
        { id: 'v-006', plate: 'く 7521', numberPlate: '横浜 500 く 75-21', model: 'プロボックス', owner: 'nikkei',   nextShakenDate: '2026-09-12', nextInspectionDate: '2026-06-08' },
        { id: 'v-007', plate: 'か 5678', numberPlate: '横浜 800 か 56-78', model: 'キャンター',   owner: 'nikkei',   nextShakenDate: '2026-12-25', nextInspectionDate: '2026-05-22' },
        { id: 'v-008', plate: 'み 3344', numberPlate: '横浜 500 み 33-44', model: 'ハイエース',   owner: 'nikkei',   nextShakenDate: '2026-07-08', nextInspectionDate: '2026-08-15' },
        { id: 'v-009', plate: 'は 8899', numberPlate: '横浜 300 は 88-99', model: 'プロボックス', owner: 'nikkei',   nextShakenDate: '2027-01-15', nextInspectionDate: '2026-06-30' },
        { id: 'v-010', plate: 'の 6710', numberPlate: '横浜 800 の 67-10', model: 'エルフ',       owner: 'nikkei',   nextShakenDate: '2026-06-18', nextInspectionDate: '2026-09-10' },
        // 全日本
        { id: 'v-011', plate: 'ゆ 1122', numberPlate: '足立 500 ゆ 11-22', model: 'ハイエース',   owner: 'zennihon', nextShakenDate: '2026-08-30', nextInspectionDate: '2026-05-29' },
        { id: 'v-012', plate: 'ら 4455', numberPlate: '足立 800 ら 44-55', model: 'キャンター',   owner: 'zennihon', nextShakenDate: '2026-11-05', nextInspectionDate: '2026-06-22' },
        { id: 'v-013', plate: 'え 7788', numberPlate: '足立 300 え 77-88', model: 'プロボックス', owner: 'zennihon', nextShakenDate: '2026-05-28', nextInspectionDate: '2026-08-08' },
        { id: 'v-014', plate: 'り 2233', numberPlate: '足立 500 り 22-33', model: 'キャラバン',   owner: 'zennihon', nextShakenDate: '2026-10-12', nextInspectionDate: '2026-07-15' },
        { id: 'v-015', plate: 'お 9988', numberPlate: '足立 800 お 99-88', model: 'エルフ',       owner: 'zennihon', nextShakenDate: '2027-03-20', nextInspectionDate: '2026-06-15' },
    ];

    var VEHICLE_SCHEDULE_KINDS = [
        { id: 'inspection', label: '点検',   color: '#1976d2' },
        { id: 'repair',     label: '修理',   color: '#d32f2f' },
        { id: 'oil',        label: 'オイル', color: '#f57c00' },
        { id: 'shaken',     label: '車検',   color: '#7b1fa2' },
        { id: 'tire',       label: 'タイヤ', color: '#388e3c' },
        { id: 'other',      label: 'その他', color: '#616161' }
    ];

    var DEFAULT_VEHICLE_SCHEDULES = [
        // 2026年5月
        { id: 'vs-001', vehicleId: 'v-001', date: '2026-05-15', startTime: '09:00', endTime: '12:00', kind: 'oil' },
        { id: 'vs-002', vehicleId: 'v-001', date: '2026-05-15', startTime: '13:00', endTime: '15:00', kind: 'tire' },
        { id: 'vs-003', vehicleId: 'v-003', date: '2026-05-18', startTime: '10:00', endTime: '17:00', kind: 'inspection' },
        { id: 'vs-004', vehicleId: 'v-007', date: '2026-05-20', startTime: '09:00', endTime: '11:00', kind: 'repair' },
        { id: 'vs-005', vehicleId: 'v-005', date: '2026-05-22', startTime: '14:00', endTime: '16:00', kind: 'oil' },
        { id: 'vs-006', vehicleId: 'v-011', date: '2026-05-25', startTime: '09:30', endTime: '12:30', kind: 'inspection' },
        { id: 'vs-007', vehicleId: 'v-008', date: '2026-05-28', startTime: '10:00', endTime: '15:00', kind: 'shaken' },
        { id: 'vs-008', vehicleId: 'v-013', date: '2026-05-28', startTime: '13:00', endTime: '17:00', kind: 'shaken' },
        { id: 'vs-009', vehicleId: 'v-002', date: '2026-05-29', startTime: '09:00', endTime: '11:00', kind: 'other', otherLabel: 'ETC再設定' },
        { id: 'vs-010', vehicleId: 'v-006', date: '2026-05-08', startTime: '10:00', endTime: '12:00', kind: 'oil' },
        // 2026年6月
        { id: 'vs-011', vehicleId: 'v-001', date: '2026-06-10', startTime: '09:00', endTime: '17:00', kind: 'inspection' },
        { id: 'vs-012', vehicleId: 'v-003', date: '2026-06-05', startTime: '10:00', endTime: '16:00', kind: 'shaken' },
        { id: 'vs-013', vehicleId: 'v-010', date: '2026-06-18', startTime: '09:00', endTime: '12:00', kind: 'shaken' },
        { id: 'vs-014', vehicleId: 'v-012', date: '2026-06-22', startTime: '13:00', endTime: '15:00', kind: 'tire' }
    ];

    var DEFAULT_ETC_CARDS = [
        { label: 'ETC-A', owner: 'touo' },
        { label: 'ETC-B', owner: 'touo' },
        { label: 'ETC-C', owner: 'touo' },
        { label: 'ETC-D', owner: 'touo' },
        { label: 'ETC-E', owner: 'touo' },
        { label: 'ETC-F', owner: 'touo' },
        { label: 'ETC く7521', owner: 'nikkei' },
        { label: 'ETC わ2490', owner: 'nikkei' },
        { label: 'ETC か5678', owner: 'nikkei' },
    ];

    function clone(v) {
        return v == null ? v : JSON.parse(JSON.stringify(v));
    }

    window.OmsMockVehiclesData = {
        createVehicles: function () { return clone(DEFAULT_VEHICLES); },
        createScheduleKinds: function () { return clone(VEHICLE_SCHEDULE_KINDS); },
        createVehicleSchedules: function () { return clone(DEFAULT_VEHICLE_SCHEDULES); },
        createEtcCards: function () { return clone(DEFAULT_ETC_CARDS); }
    };
})();
