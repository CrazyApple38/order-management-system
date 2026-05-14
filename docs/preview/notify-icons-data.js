/* ============================================================
   notify-icons-data.js — 変更通知アイコン候補データ
   - ベル7個 + アイテムタイプ20個（共通4 + パネル別16）の推奨候補
   - file パスは docs/assets/icons/ 配下の相対パス
   - 各 candidates は 5 個まで（必要なら検索パネルから追加選択）
   ============================================================ */
(function () {
    'use strict';

    // ---------- 共通タイプ（SL/WSで参照） ----------
    var COMMON_TYPES = {
        'type-employee': {
            label: '社員配置',
            candidates: [
                'person/im-11186-jimbutsu-aikon-chiimu.svg',
                'person/im-15835-jimbutsu.svg',
                'person/im-15001-jimbutsu.svg',
                'person/im-15534-jimbutsu.svg',
                'person/im-15003-jimbutsu-botan.svg'
            ]
        },
        'type-vehicle': {
            label: '車両配置',
            candidates: [
                'transport/im-00237-jidousha-no-aikon-sozai-sono-2.svg',
                'transport/im-00238-jidousha-no-muryou-aikon-sozai-sono-3.svg',
                'transport/im-00240-torakku.svg',
                'transport/im-00241-torakku-no-aikon-sozai-sono-2.svg',
                'transport/im-14750-jidousha.svg'
            ]
        },
        'type-support': {
            label: '応援配置',
            candidates: [
                'person/im-11186-jimbutsu-aikon-chiimu.svg',
                'person/im-15516-chiimu.svg',
                'person/im-15517-chiimu.svg',
                'person/im-14439-chiimu.svg',
                'person/im-11557-chiimu.svg'
            ]
        },
        'type-reservation': {
            label: '応援予約変更',
            candidates: [
                'business/im-00188-sukejuuru-karendaa.svg',
                'stationery/im-15711-himekuri-karendaa.svg',
                'stationery/im-12567-karendaa.svg',
                'person/im-11186-jimbutsu-aikon-chiimu.svg',
                'stationery/im-12558-karendaa.svg'
            ]
        }
    };

    // ---------- ベル定義 ----------
    var BELLS = [
        {
            id: 'bell-ob',
            label: 'OB（受注簿）',
            candidates: [
                'business/im-15655-adoresu-chou.svg',
                'business/im-11138-techou.svg',
                'business/im-16148-shorui.svg',
                'business/im-12034-keiyaku-sho.svg',
                'business/im-15283-memo-chou.svg'
            ]
        },
        {
            id: 'bell-sl',
            label: 'SL（業務管理計画書）',
            candidates: [
                'business/im-00188-sukejuuru-karendaa.svg',
                'stationery/im-00051-kami-to-pen.svg',
                'building/im-14724-biru.svg',
                'person/im-12791-kouji-no-sagyou-in.svg',
                'business/im-15656-techou.svg'
            ]
        },
        {
            id: 'bell-ws',
            label: 'WS（週間予定表）',
            candidates: [
                'stationery/im-15711-himekuri-karendaa.svg',
                'stationery/im-12558-karendaa.svg',
                'stationery/im-12577-karendaa.svg',
                'stationery/im-12567-karendaa.svg',
                'business/im-00188-sukejuuru-karendaa.svg'
            ]
        },
        {
            id: 'bell-la',
            label: 'LA（休暇申請管理）',
            candidates: [
                'other/im-14579-bakansu-no-muryou.svg',
                'food/im-11931-kyuukei-kafe-no-maaku.svg',
                'business/im-11624-24-jikan-mukyuu.svg',
                'stationery/im-11591-shimpuru-na-maru-tokei.svg',
                'stationery/im-15711-himekuri-karendaa.svg'
            ]
        },
        {
            id: 'bell-pending',
            label: '休暇申請承認待ち',
            candidates: [
                'stationery/im-11612-sunadokei.svg',
                'stationery/im-11613-sunadokei-no-furii-sozai.svg',
                'stationery/im-11589-shikaku-taipu-no-mezamashi-tokei.svg',
                'business/im-11597-udedokei-no-muryou.svg',
                'sign-mark/im-11574-hatena.svg'
            ]
        },
        {
            id: 'bell-vehicle',
            label: '車両スケジュール',
            candidates: [
                'transport/im-00237-jidousha-no-aikon-sozai-sono-2.svg',
                'transport/im-00238-jidousha-no-muryou-aikon-sozai-sono-3.svg',
                'transport/im-00240-torakku.svg',
                'transport/im-00241-torakku-no-aikon-sozai-sono-2.svg',
                'transport/im-14750-jidousha.svg'
            ]
        },
        {
            id: 'bell-master',
            label: 'マスタ更新',
            candidates: [
                'sign-mark/im-00001-muryou-no-settei-haguruma.svg',
                'sign-mark/im-16009-haguruma.svg',
                'sign-mark/im-00003-settei-no-haguruma-kumiawase.svg',
                'sign-mark/im-16023-karaa-settei.svg',
                'sign-mark/im-14476-haguruma.svg'
            ]
        }
    ];

    // ---------- パネル定義（ベル + タイプの組み合わせ） ----------
    // types: COMMON_TYPES のキー文字列 OR { id, label, candidates } インライン定義
    var PANELS = [
        {
            id: 'panel-ob',
            label: 'OB（受注簿）',
            bellId: 'bell-ob',
            types: [
                {
                    id: 'type-ob-add', label: '受注追加',
                    candidates: [
                        'sign-mark/im-00105-purasu.svg',
                        'sign-mark/im-16176-purasu-mainasu.svg',
                        'person/im-13509-jimbutsu-shiruetto-purasu.svg',
                        'other/im-11457-iipurasu.svg',
                        'business/im-12034-keiyaku-sho.svg'
                    ]
                },
                {
                    id: 'type-ob-modify', label: '受注変更',
                    candidates: [
                        'stationery/im-00051-kami-to-pen.svg',
                        'stationery/im-15441-empitsu-no-muryou.svg',
                        'stationery/im-15442-empitsu.svg',
                        'stationery/im-15686-empitsu-botan.svg',
                        'stationery/im-11104-mannenhitsu-no-pen-saki.svg'
                    ]
                },
                {
                    id: 'type-ob-delete', label: '受注削除',
                    candidates: [
                        'sign-mark/im-11911-hosoi-batsu.svg',
                        'stationery/im-11988-sutandaado-na-gomibako.svg',
                        'stationery/im-11989-gomibako.svg',
                        'person/im-15910-gomibako.svg',
                        'stationery/im-11995-gomibako.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-sl',
            label: 'SL（業務管理計画書）',
            bellId: 'bell-sl',
            types: [
                'type-employee', 'type-vehicle', 'type-support', 'type-reservation',
                {
                    id: 'type-sl-auto', label: '自動受注生成',
                    candidates: [
                        'business/im-16070-robotto-aamu.svg',
                        'business/im-16069-robotto-aamu.svg',
                        'sign-mark/im-00105-purasu.svg',
                        'transport/im-11727-risaikuru-kaishuu-kaa.svg',
                        'business/im-00188-sukejuuru-karendaa.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-ws',
            label: 'WS（週間予定表）',
            bellId: 'bell-ws',
            types: [
                'type-employee', 'type-vehicle', 'type-support', 'type-reservation',
                {
                    id: 'type-ws-schedule-change', label: '週間予定変更',
                    candidates: [
                        'stationery/im-15711-himekuri-karendaa.svg',
                        'business/im-00188-sukejuuru-karendaa.svg',
                        'stationery/im-12558-karendaa.svg',
                        'stationery/im-12577-karendaa.svg',
                        'stationery/im-15441-empitsu-no-muryou.svg'
                    ]
                },
                {
                    id: 'type-ws-leave-reflect', label: '休バッジ反映',
                    candidates: [
                        'other/im-14579-bakansu-no-muryou.svg',
                        'food/im-11931-kyuukei-kafe-no-maaku.svg',
                        'business/im-11624-24-jikan-mukyuu.svg',
                        'stationery/im-11591-shimpuru-na-maru-tokei.svg',
                        'stationery/im-12567-karendaa.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-la',
            label: 'LA（休暇申請管理）',
            bellId: 'bell-la',
            types: [
                {
                    id: 'type-la-new', label: '新規申請',
                    candidates: [
                        'sign-mark/im-00105-purasu.svg',
                        'business/im-16148-shorui.svg',
                        'business/im-12034-keiyaku-sho.svg',
                        'stationery/im-00051-kami-to-pen.svg',
                        'other/im-14579-bakansu-no-muryou.svg'
                    ]
                },
                {
                    id: 'type-la-approve', label: '承認',
                    candidates: [
                        'sign-mark/im-11451-chekku-maaku-no-muryou.svg',
                        'sign-mark/im-14979-ok.svg',
                        'sign-mark/im-11452-chekku-bokkusu.svg',
                        'sign-mark/im-11453-chekku-bokkusu.svg',
                        'sign-mark/im-00150-facebook-no-ii-ne-kaze-aikon-sono-2.svg'
                    ]
                },
                {
                    id: 'type-la-reject', label: '却下',
                    candidates: [
                        'sign-mark/im-11911-hosoi-batsu.svg',
                        'sign-mark/im-11907-chuui-maaku-no-senga.svg',
                        'sign-mark/im-11908-chuui-maaku.svg',
                        'stationery/im-11988-sutandaado-na-gomibako.svg',
                        'sign-mark/im-13774-chuui-maaku-6.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-pending',
            label: '休暇申請承認待ち',
            bellId: 'bell-pending',
            types: [
                {
                    id: 'type-pending-wait', label: '承認待ち',
                    candidates: [
                        'stationery/im-11612-sunadokei.svg',
                        'stationery/im-11613-sunadokei-no-furii-sozai.svg',
                        'stationery/im-11589-shikaku-taipu-no-mezamashi-tokei.svg',
                        'business/im-11597-udedokei-no-muryou.svg',
                        'sign-mark/im-11574-hatena.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-vehicle',
            label: '車両スケジュール',
            bellId: 'bell-vehicle',
            types: [
                {
                    id: 'type-vehicle-add', label: 'スケ追加',
                    candidates: [
                        'sign-mark/im-00105-purasu.svg',
                        'sign-mark/im-16176-purasu-mainasu.svg',
                        'person/im-13509-jimbutsu-shiruetto-purasu.svg',
                        'other/im-11457-iipurasu.svg',
                        'person/im-13512-jimbutsu-senga-aikon-purasu.svg'
                    ]
                },
                {
                    id: 'type-vehicle-modify', label: 'スケ変更',
                    candidates: [
                        'stationery/im-00051-kami-to-pen.svg',
                        'stationery/im-15441-empitsu-no-muryou.svg',
                        'stationery/im-15442-empitsu.svg',
                        'stationery/im-15686-empitsu-botan.svg',
                        'stationery/im-11104-mannenhitsu-no-pen-saki.svg'
                    ]
                },
                {
                    id: 'type-vehicle-delete', label: 'スケ削除',
                    candidates: [
                        'sign-mark/im-11911-hosoi-batsu.svg',
                        'stationery/im-11988-sutandaado-na-gomibako.svg',
                        'stationery/im-11989-gomibako.svg',
                        'person/im-15910-gomibako.svg',
                        'stationery/im-11995-gomibako.svg'
                    ]
                }
            ]
        },
        {
            id: 'panel-master',
            label: 'マスタ更新',
            bellId: 'bell-master',
            types: [
                {
                    id: 'type-master-add', label: 'マスタ追加',
                    candidates: [
                        'sign-mark/im-00105-purasu.svg',
                        'sign-mark/im-16176-purasu-mainasu.svg',
                        'person/im-13509-jimbutsu-shiruetto-purasu.svg',
                        'person/im-13512-jimbutsu-senga-aikon-purasu.svg',
                        'other/im-11457-iipurasu.svg'
                    ]
                },
                {
                    id: 'type-master-modify', label: 'マスタ変更',
                    candidates: [
                        'sign-mark/im-00001-muryou-no-settei-haguruma.svg',
                        'stationery/im-00051-kami-to-pen.svg',
                        'stationery/im-15441-empitsu-no-muryou.svg',
                        'sign-mark/im-16009-haguruma.svg',
                        'sign-mark/im-14476-haguruma.svg'
                    ]
                },
                {
                    id: 'type-master-delete', label: 'マスタ削除',
                    candidates: [
                        'sign-mark/im-11911-hosoi-batsu.svg',
                        'stationery/im-11988-sutandaado-na-gomibako.svg',
                        'stationery/im-11989-gomibako.svg',
                        'person/im-15910-gomibako.svg',
                        'stationery/im-11995-gomibako.svg'
                    ]
                }
            ]
        }
    ];

    // ---------- 公開 ----------
    window.NotifyIconsData = {
        BELLS: BELLS,
        PANELS: PANELS,
        COMMON_TYPES: COMMON_TYPES,
        ICON_BASE_PATH: '../assets/icons/'
    };
})();
