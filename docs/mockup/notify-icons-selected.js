/* ============================================================
   notify-icons-selected.js — 確定アイコン定義 (JS ラッパー)

   docs/preview/notify-icons-selected.json と同一内容を window 経由で公開。
   file:// 環境でも fetch なしで読み込めるよう、本ファイルを script タグで
   ロードしてから co-notify-panel.js を読み込むこと。

   SSOT は notify-icons-selected.json。本ファイルは手動同期。
   ============================================================ */
(function () {
    'use strict';

    window.NotifyIconsSelected = {
        _meta: {
            selectedAt: '2026-05-19',
            plan: 'docs/plan/notification-refactor-plan.md',
            iconBasePath: 'docs/assets/icons/',
            matrix: {
                scopes: ['row', 'site', 'badge', 'employee', 'vehicle', 'support', 'reservation', 'schedule', 'leave-badge', 'application'],
                ops: ['add', 'modify', 'delete', 'approve', 'reject', 'place', 'remove'],
                applicable: {
                    'row':         ['add', 'modify', 'delete'],
                    'site':        ['add', 'modify', 'delete'],
                    'badge':       ['add', 'delete'],
                    'employee':    ['modify', 'place', 'remove'],
                    'vehicle':     ['modify', 'place', 'remove'],
                    'support':     ['modify', 'place', 'remove'],
                    'reservation': ['add', 'modify', 'delete'],
                    'schedule':    ['modify'],
                    'leave-badge': ['modify'],
                    'application': ['add', 'approve', 'reject']
                }
            }
        },
        bells: {
            'bell-ob':      'business/si-46623-personal-information.png',
            'bell-sl':      'person/si-13707-13707.png',
            'bell-ws':      'stationery/im-12555-karendaa.svg',
            'bell-la':      'sign-mark/si-8681-8681.png',
            'bell-pending': 'life/si-9922-9922.png',
            'bell-vehicle': 'transport/im-10867-jidou-sha.svg',
            'bell-master':  'sign-mark/im-00001-muryou-no-settei-haguruma.svg'
        },
        commonTypes: {
            'type-employee':    'person/im-15537-jimbutsu.svg',
            'type-vehicle':     'transport/im-10852-jouyousha.svg',
            'type-support':     'person/im-12114-sns-jimbutsu.svg',
            'type-reservation': 'person/si-13722-13722.png'
        },
        primitives: {
            scope: {
                'row':         'stationery/im-12036-hakushi-no-shorui-fairu.svg',
                'site':        'stationery/im-12041-shimpuru-na-shorui-fairu.svg',
                'badge':       'sign-mark/si-1981-1981.png',
                'employee':    'person/im-11324-sarariiman.svg',
                'vehicle':     'transport/si-24610-norimono-car.png',
                'support':     'person/im-11558-chiimu-no-muryou.svg',
                'reservation': 'person/im-00195-kouru-sentaa-no-jimbutsu-aikon-sozai-sono-3.svg',
                'schedule':    'stationery/si-48956-calendar.png',
                'leave-badge': 'person/im-11564-kazoku.svg',
                'application': 'business/si-45841-document-teishutsu.png'
            },
            op: {
                'add':     'sign-mark/im-00105-purasu.svg',
                'modify':  'education/si-14519-14519.png',
                'delete':  'stationery/si-14569-14569.png',
                'approve': 'sign-mark/im-11451-chekku-maaku-no-muryou.svg',
                'reject':  'sign-mark/im-11914-futoi-batsu.svg',
                'place':   'person/im-14440-jimbutsu-no-muryou-sozai.svg',
                'remove':  'sign-mark/si-1710-1710.png'
            }
        },
        typeOverrides: {}
    };
})();
