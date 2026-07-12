(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.master.v1';
    var MASTER_IDS = [
        'company', 'group-company', 'license-type', 'support-partner',
        'price-note', 'special-note', 'vehicle', 'etc-card', 'holiday', 'penalty-code',
        'org-level-type', 'org-unit', 'site', 'site-category', 'employee'
    ];
    var selectedMasterId = 'company';
    var selectedId = null;
    var editorMode = 'detail';
    var statusFilter = 'active';
    var collapsedTreeIds = {};

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

    var gcOptions = [
        { value: 'touo', label: '東央警備' },
        { value: 'nikkei', label: 'Nikkeiホールディングス' },
        { value: 'zennihon', label: '全日本エンタープライズ' }
    ];

    var masterDefinitions = {
        'company': {
            label: '契約先', singular: '契約先', search: '契約先を検索',
            columns: [['code', '契約先コード'], ['name', '契約先名', 'strong'], ['formalName', '正式名称'], ['notes', '備考', 'sub']],
            fields: [
                field('code', '契約先コード', 'text', true, 20), field('name', '契約先名', 'text', true, 100),
                field('formalName', '正式名称', 'text', true, 200, '注文書の発注者名に使用します。'),
                field('notes', '備考', 'textarea')
            ],
            unique: [['code', '同じ契約先コードが登録されています。']], seed: seedCompanies
        },
        'group-company': {
            label: 'グループ会社', singular: 'グループ会社', search: 'グループ会社を検索',
            columns: [['code', '会社コード'], ['name', '会社名', 'strong'], ['shortName', '略称'], ['phone', '電話番号']],
            fields: [
                field('code', '会社コード', 'text', true, 20), field('name', '会社名', 'text', true, 100),
                field('shortName', '表示用略称', 'text', false, 20), field('postalCode', '郵便番号', 'text', false, 8),
                field('address', '住所', 'textarea'), field('representativeTitle', '代表者役職', 'text', false, 50),
                field('representativeName', '代表者名', 'text', false, 50), field('phone', '代表電話番号', 'text', false, 20),
                field('sortOrder', '表示順', 'number')
            ],
            unique: [['code', '同じ会社コードが登録されています。']], seed: seedGroupCompanies
        },
        'org-level-type': {
            label: '組織階層種別', singular: '組織階層種別', search: '階層種別を検索',
            columns: [['name', '階層種別名', 'strong']],
            fields: [
                selectField('gcCode', 'グループ会社', gcOptions),
                treeParentField('parentId', '上位階層種別'),
                field('name', '階層種別名', 'text', true, 50)
            ],
            tree: treeConfig('gcCode', function () { return gcOptions; }, '階層種別', 5),
            normalize: normalizeOrgLevelType,
            seed: seedOrgLevelTypes
        },
        'org-unit': {
            label: '組織ノード', singular: '組織ノード', search: '組織ノードを検索',
            columns: [['code', '組織コード'], ['name', '組織名', 'strong']],
            fields: [
                selectField('gcCode', 'グループ会社', gcOptions),
                treeParentField('parentId', '親組織ノード'),
                field('code', '組織コード', 'text', true, 20),
                field('name', '組織名', 'text', true, 100),
                field('sortOrder', '表示順', 'number')
            ],
            tree: treeConfig('gcCode', function () { return gcOptions; }, '組織', 5),
            compoundUnique: ['gcCode', 'code'], compoundMessage: '同じ会社に同じ組織コードが登録されています。',
            seed: seedOrgUnits
        },
        'employee': {
            label: '社員', singular: '社員', search: '社員を検索',
            columns: [['employeeCode', '社員コード'], ['name', '氏名', 'strong'], ['gcCode', '所属GC', 'option'], ['orgUnitId', '所属組織', 'org-unit']],
            fields: [
                field('employeeCode', '社員コード', 'text', true, 20),
                field('name', '氏名', 'text', true, 50),
                field('shortName', '略称', 'text', false, 10),
                selectField('gcCode', '所属グループ会社', gcOptions),
                { key: 'orgUnitId', label: '所属組織', type: 'employee-org-select' },
                field('sortOrder', '表示順', 'number')
            ],
            unique: [['employeeCode', '同じ社員コードが登録されています。']],
            employeeEditor: true,
            normalize: normalizeEmployee,
            seed: seedEmployees
        },
        'license-type': {
            label: '資格検定', singular: '資格種別', search: '資格を検索',
            columns: [['code', '資格コード'], ['name', '資格名', 'strong'], ['category', 'カテゴリ', 'option'], ['requiresRenewal', '更新', 'boolean']],
            fields: [
                field('code', '資格コード', 'text', true, 20), field('name', '資格名', 'text', true, 100),
                selectField('category', 'カテゴリ', [
                    { value: 'certification', label: '検定' }, { value: 'license', label: '運転免許' }, { value: 'skill', label: 'スキル' }
                ]), checkboxField('requiresRenewal', '更新が必要'), field('sortOrder', '表示順', 'number')
            ],
            unique: [['code', '同じ資格コードが登録されています。']], seed: seedLicenseTypes
        },
        'support-partner': {
            label: '協力業者', singular: '協力業者', search: '協力業者を検索',
            columns: [['shortName', '略称', 'strong'], ['gcCode', '依頼元GC', 'option'], ['formalName', '正式名称'], ['isMasterComplete', '情報', 'complete']],
            fields: [
                selectField('gcCode', '依頼元グループ会社', gcOptions), field('shortName', '略称', 'text', true, 50),
                field('formalName', '正式名称', 'text', false, 200), field('postalCode', '郵便番号', 'text', false, 8),
                field('address', '住所', 'textarea'), field('representativeTitle', '代表者役職', 'text', false, 50),
                field('representativeName', '代表者名', 'text', false, 50), field('phone', '電話番号', 'text', false, 20),
                field('email', 'メールアドレス', 'email', false, 100), field('notes', '備考', 'textarea')
            ],
            compoundUnique: ['gcCode', 'shortName'], compoundMessage: '同じGCに同じ略称が登録されています。',
            normalize: normalizeSupportPartner, seed: seedSupportPartners
        },
        'price-note': templateDefinition('料金特記定型文', '料金特記', seedPriceNotes),
        'special-note': templateDefinition('その他特記定型文', 'その他特記', seedSpecialNotes),
        'vehicle': {
            label: '車両', singular: '車両', search: '車両を検索',
            columns: [['vehicleCode', '車両コード'], ['licensePlate', 'ナンバー', 'strong'], ['model', '車種'], ['gcCode', '所属GC', 'option']],
            fields: [
                field('vehicleCode', '車両コード', 'text', true, 20), selectField('gcCode', '所属グループ会社', gcOptions),
                field('licensePlate', 'フルナンバープレート', 'text', true, 20), field('plateShort', '短縮表記', 'text', false, 20),
                field('shortName', '略称', 'text', false, 20), field('model', '車種名', 'text', false, 100),
                field('shakenDate', '車検満了日', 'date'), field('inspectionDate', '点検満了日', 'date'),
                field('notes', '備考', 'textarea'), field('sortOrder', '表示順', 'number')
            ],
            unique: [['vehicleCode', '同じ車両コードが登録されています。'], ['licensePlate', '同じナンバープレートが登録されています。']],
            seed: seedVehicles
        },
        'etc-card': {
            label: 'ETCカード', singular: 'ETCカード', search: 'ETCカードを検索',
            columns: [['cardLabel', 'カードラベル', 'strong'], ['gcCode', '所属GC', 'option'], ['vehicleId', '紐付け車両', 'vehicle']],
            fields: [
                field('cardLabel', 'カードラベル', 'text', true, 30), selectField('gcCode', '所属グループ会社', gcOptions),
                { key: 'vehicleId', label: '紐付け車両', type: 'vehicle-select' }, field('notes', '備考', 'textarea'),
                field('sortOrder', '表示順', 'number')
            ],
            compoundUnique: ['gcCode', 'cardLabel'], compoundMessage: '同じGCに同じカードラベルが登録されています。', seed: seedEtcCards
        },
        'holiday': {
            label: '祝日', singular: '祝日', search: '祝日を検索',
            columns: [['date', '日付'], ['name', '祝日名', 'strong']],
            fields: [field('date', '日付', 'date', true), field('name', '祝日名', 'text', true, 50)],
            unique: [['date', '同じ日付の祝日が登録されています。']], seed: seedHolidays
        },
        'penalty-code': {
            label: 'ペナルティコード', singular: 'ペナルティコード', search: 'ペナルティを検索',
            columns: [['code', 'コード'], ['name', 'コード名', 'strong'], ['description', '説明', 'sub']],
            fields: [
                field('code', 'コード', 'text', true, 20), field('name', 'コード名', 'text', true, 100),
                field('description', '説明', 'textarea'), field('sortOrder', '表示順', 'number')
            ],
            unique: [['code', '同じペナルティコードが登録されています。']], seed: seedPenaltyCodes
        },
        'site': {
            label: '現場', singular: '現場・子項目', search: '現場を検索',
            columns: [['code', '現場コード'], ['name', '現場・項目名', 'strong']],
            fields: [
                dynamicSelectField('companyId', '契約先', function () { return companyOptions(true); }),
                treeParentField('parentId', '親現場・項目'),
                field('code', '現場・項目コード', 'text', true, 20),
                field('name', '現場・項目名', 'text', true, 100),
                field('label', '項目ラベル', 'text', false, 50, '子項目の場合に使用します。'),
                { key: 'categoryId', label: '区分', type: 'select', options: categoryOptions(), required: false },
                { key: 'defaultShiftType', label: '既定シフト', type: 'select', required: false, options: [
                    { value: '', label: '未設定' }, { value: 'day', label: '昼' }, { value: 'night', label: '夜' }
                ]},
                field('defaultStartTime', '既定開始時刻', 'time'),
                field('defaultEndTime', '既定終了時刻', 'time'),
                field('notes', '備考', 'textarea'),
                field('sortOrder', '表示順', 'number')
            ],
            tree: treeConfig('companyId', function () { return companyOptions(true); }, '現場', 3),
            compoundUnique: ['companyId', 'code'], compoundMessage: '同じ契約先に同じ現場・項目コードが登録されています。',
            normalize: normalizeSite,
            seed: seedSites
        },
        'site-category': {
            label: '区分・バッジ', singular: '区分・バッジ', search: '区分・バッジを検索',
            columns: [['code', 'コード'], ['name', '区分・バッジ名', 'strong']],
            fields: [
                treeParentField('parentId', '親区分・バッジ'),
                field('code', 'コード', 'text', true, 20),
                field('name', '区分・バッジ名', 'text', true, 50),
                field('sortOrder', '表示順', 'number')
            ],
            tree: treeConfig(null, null, '区分・バッジ', 3),
            unique: [['code', '同じ区分・バッジコードが登録されています。']],
            seed: seedSiteCategories
        }
    };

    function field(key, label, type, required, maxlength, help) {
        return { key: key, label: label, type: type || 'text', required: !!required, maxlength: maxlength || 0, help: help || '' };
    }

    function selectField(key, label, options) {
        return { key: key, label: label, type: 'select', options: options, required: true };
    }

    function checkboxField(key, label) {
        return { key: key, label: label, type: 'checkbox' };
    }

    function dynamicSelectField(key, label, optionsProvider) {
        return { key: key, label: label, type: 'select', optionsProvider: optionsProvider, required: true };
    }

    function treeParentField(key, label) {
        return { key: key, label: label, type: 'tree-parent' };
    }

    function treeConfig(groupKey, groupOptionsProvider, itemType, maxDepth) {
        return {
            groupKey: groupKey,
            groupOptionsProvider: groupOptionsProvider,
            itemType: itemType,
            maxDepth: maxDepth
        };
    }

    function companyOptions(includeInactive) {
        var companies = state && state.datasets && state.datasets.company ? state.datasets.company : seedCompanies();
        return companies.filter(function (item) { return includeInactive || item.isActive; }).map(function (item) {
            return { value: item.id, label: item.name };
        });
    }

    function categoryOptions() {
        return [
            { value: '', label: '未設定' },
            { value: 'facility', label: '施設' }, { value: 'event', label: 'イベント' },
            { value: 'highway', label: '高速' }, { value: 'traffic', label: '交通' },
            { value: 'support-traffic', label: '応援交通' }
        ];
    }

    function templateDefinition(label, singular, seed) {
        return {
            label: label, singular: singular, search: label + 'を検索',
            columns: [['body', '定型文', 'strong'], ['isDefaultSelected', '既定選択', 'boolean']],
            fields: [field('body', '定型文本文', 'textarea', true), checkboxField('isDefaultSelected', '新規作成時に既定で選択'), field('sortOrder', '表示順', 'number')],
            seed: seed
        };
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function baseRecord(id, sortOrder) {
        return { id: id, sortOrder: sortOrder || 0, isActive: true };
    }

    function seedCompanies() {
        var source = typeof companiesData !== 'undefined' && Array.isArray(companiesData) ? companiesData : [];
        return source.map(function (company, index) {
            var name = String(company.name || '');
            var formal = window.CoCompanyInput ? window.CoCompanyInput.normalize(name).value : name;
            return Object.assign(baseRecord('company-' + company.id, index + 1), {
                code: 'C' + String(index + 1).padStart(3, '0'), name: name, formalName: formal, notes: ''
            });
        });
    }

    function seedGroupCompanies() {
        var source = typeof groupCompaniesData !== 'undefined' && Array.isArray(groupCompaniesData) ? groupCompaniesData : [];
        return source.map(function (item, index) {
            return Object.assign(baseRecord('group-company-' + item.id, index + 1), {
                code: String(item.code || '').toUpperCase(), name: item.name || '', shortName: item.shortName || '',
                postalCode: '', address: '', representativeTitle: '', representativeName: '', phone: ''
            });
        });
    }

    function seedOrgLevelTypes() {
        var source = typeof orgLevelTypesData !== 'undefined' ? orgLevelTypesData : {};
        var rows = [];
        Object.keys(source).forEach(function (gcCode) {
            var parentId = '';
            source[gcCode].forEach(function (item, index) {
                var id = 'org-level-type-' + gcCode + '-' + item.depth;
                rows.push(Object.assign(baseRecord(id, index + 1), {
                    gcCode: gcCode, parentId: parentId, depth: item.depth, name: item.name || ''
                }));
                parentId = id;
            });
        });
        return rows;
    }

    function normalizeOrgLevelType(item) {
        item.depth = treeDepthFor(item, currentItems());
        return item;
    }

    function seedOrgUnits() {
        var source = typeof orgUnitsData !== 'undefined' ? orgUnitsData : {};
        var rows = [];
        Object.keys(source).forEach(function (gcCode) {
            function walk(nodes, parentId) {
                (nodes || []).forEach(function (node, index) {
                    rows.push(Object.assign(baseRecord(node.id, index + 1), {
                        gcCode: gcCode,
                        parentId: parentId || '',
                        code: String(node.id || '').replace(gcCode + '-', '').replace('zen-', '').replace(/-/g, '_').toUpperCase(),
                        name: node.name || ''
                    }));
                    walk(node.children, node.id);
                });
            }
            walk(source[gcCode], '');
        });
        return rows;
    }

    function seedEmployees() {
        var source = window.OmsMockEmployeesData ? window.OmsMockEmployeesData.createEmployees() : [];
        return source.map(function (item, index) {
            var employeeId = window.OmsMockEmployeesData && window.OmsMockEmployeesData.employeeIdFromIndex
                ? window.OmsMockEmployeesData.employeeIdFromIndex(index)
                : 'emp-' + (index + 1);
            var licenses = [];
            if (index === 0) licenses = [
                { licenseTypeId: 'license-type-2', licenseNumber: '交2-1001', acquiredDate: '2024-04-01', expiryDate: '', notes: '' },
                { licenseTypeId: 'license-type-13', licenseNumber: 'MT-1001', acquiredDate: '2020-06-15', expiryDate: '2030-06-15', notes: '' }
            ];
            if (index === 9) licenses = [
                { licenseTypeId: 'license-type-4', licenseNumber: '施2-2001', acquiredDate: '2023-10-01', expiryDate: '', notes: '' }
            ];
            if (index === 17) licenses = [
                { licenseTypeId: 'license-type-14', licenseNumber: 'AT-3001', acquiredDate: '2022-03-12', expiryDate: '2027-03-12', notes: '' }
            ];
            return Object.assign(baseRecord(employeeId, index + 1), {
                employeeCode: 'E' + String(index + 1).padStart(3, '0'),
                gcCode: item.company || 'touo',
                orgUnitId: item.dept || '',
                name: item.name || '',
                shortName: item.name || '',
                licenses: licenses,
                conflictEmployeeIds: index === 0 ? ['emp-3'] : (index === 2 ? ['emp-1'] : [])
            });
        });
    }

    function seedSites() {
        var source = typeof defaultSitesData !== 'undefined' ? defaultSitesData : {};
        var rows = [];
        Object.keys(source).forEach(function (companySourceId) {
            function walk(nodes, parentId, depth) {
                (nodes || []).forEach(function (node, index) {
                    var id = depth === 1 ? 'site-' + node.id : 'site-sub-' + node.id;
                    rows.push(Object.assign(baseRecord(id, index + 1), {
                        companyId: 'company-' + companySourceId,
                        parentId: parentId || '',
                        code: (depth === 1 ? 'S' : 'SI') + String(node.id),
                        name: node.name || '',
                        label: depth === 1 ? '' : (depth === 2 ? '業務内容' : '作業内容'),
                        categoryId: '', defaultShiftType: '', defaultStartTime: '', defaultEndTime: '', notes: ''
                    }));
                    walk(node.subItems, id, depth + 1);
                });
            }
            walk(source[companySourceId], '', 1);
        });
        return rows;
    }

    function normalizeSite(item) {
        if (item.parentId) {
            var parent = currentItems().find(function (row) { return row.id === item.parentId; });
            if (parent) item.companyId = parent.companyId;
        }
        return item;
    }

    function cascadeTreeGroup(item) {
        var definition = currentDefinition();
        if (!definition.tree || !definition.tree.groupKey || !item) return;
        var groupKey = definition.tree.groupKey;
        currentItems().forEach(function (child) {
            if (child.parentId === item.id && child[groupKey] !== item[groupKey]) {
                child[groupKey] = item[groupKey];
                cascadeTreeGroup(child);
            }
        });
    }

    function seedSiteCategories() {
        var source = [
            { id: 'facility', name: '施設', children: [] },
            { id: 'event', name: 'イベント', children: [] },
            { id: 'highway', name: '高速', children: [
                { id: 'hw-lane', name: '車線規制', children: [
                    { id: 'hw-lane-sign', name: '標識車' }, { id: 'hw-lane-mat', name: '規制材' }, { id: 'hw-lane-light', name: '保安灯' }
                ]},
                { id: 'hw-shoulder', name: '路肩規制', children: [
                    { id: 'hw-sh-cone', name: 'コーン' }, { id: 'hw-sh-bar', name: 'バー' }
                ]},
                { id: 'hw-booth', name: 'ブース規制', children: [] },
                { id: 'hw-security', name: '保安員', children: [] }
            ]},
            { id: 'traffic', name: '交通', children: [
                { id: 'tr-alternate', name: '片側交互', children: [
                    { id: 'tr-alt-flag', name: '旗' }, { id: 'tr-alt-sign', name: '看板' }
                ]},
                { id: 'tr-closure', name: '通行止め', children: [] }
            ]},
            { id: 'support-traffic', name: '応援交通', children: [] }
        ];
        var rows = [];
        function walk(nodes, parentId) {
            (nodes || []).forEach(function (node, index) {
                rows.push(Object.assign(baseRecord(node.id, index + 1), {
                    parentId: parentId || '', code: String(node.id).replace(/-/g, '_').toUpperCase(), name: node.name || ''
                }));
                walk(node.children, node.id);
            });
        }
        walk(source, '');
        return rows;
    }

    function seedLicenseTypes() {
        var rows = [
            ['TRAFFIC_1', '交通誘導警備 1級', 'certification', false], ['TRAFFIC_2', '交通誘導警備 2級', 'certification', false],
            ['FACILITY_1', '施設警備 1級', 'certification', false], ['FACILITY_2', '施設警備 2級', 'certification', false],
            ['CROWD_1', '雑踏警備 1級', 'certification', false], ['CROWD_2', '雑踏警備 2級', 'certification', false],
            ['AIRPORT_1', '空港保安警備 1級', 'certification', false], ['AIRPORT_2', '空港保安警備 2級', 'certification', false],
            ['NUCLEAR_1', '核燃料物質等危険物運搬警備 1級', 'certification', false], ['NUCLEAR_2', '核燃料物質等危険物運搬警備 2級', 'certification', false],
            ['VALUABLE_1', '貴重品運搬警備 1級', 'certification', false], ['VALUABLE_2', '貴重品運搬警備 2級', 'certification', false],
            ['LICENSE_NORMAL_MT', '普通免許（MT）', 'license', true], ['LICENSE_NORMAL_AT', '普通免許（AT限定）', 'license', true],
            ['LICENSE_SEMI_MEDIUM_MT', '準中型免許（MT）', 'license', true], ['LICENSE_SEMI_MEDIUM_AT', '準中型免許（AT限定）', 'license', true],
            ['LICENSE_MEDIUM_MT', '中型免許（MT）', 'license', true], ['LICENSE_MEDIUM_AT', '中型免許（AT限定）', 'license', true],
            ['SKILL_SIGN_TRUCK', '標識車', 'skill', false], ['SKILL_SIGN_TRUCK_EXT', '標識車（外販）', 'skill', false],
            ['SKILL_2TON_TRUCK', '2トン車', 'skill', false]
        ];
        return rows.map(function (row, index) {
            return Object.assign(baseRecord('license-type-' + (index + 1), index + 1), {
                code: row[0], name: row[1], category: row[2], requiresRenewal: row[3]
            });
        });
    }

    function seedSupportPartners() {
        var source = window.OmsMockAssignmentsData ? window.OmsMockAssignmentsData.createSupportPartners() : [];
        return source.filter(function (item) { return !item.isPreset; }).map(function (item, index) {
            return Object.assign(baseRecord(item.id, index + 1), {
                gcCode: item.gcCode || 'touo', shortName: item.shortName || '', formalName: item.formalName || '',
                postalCode: item.postalCode || '', address: item.address || '', representativeTitle: item.representativeTitle || '',
                representativeName: item.representativeName || '', phone: item.phone || '', email: item.email || '', notes: '',
                isMasterComplete: !!item.isMasterComplete, isActive: item.isActive !== false
            });
        });
    }

    function seedPriceNotes() {
        return [
            Object.assign(baseRecord('price-note-1', 1), { body: '上記金額は税抜きとなります。', isDefaultSelected: true }),
            Object.assign(baseRecord('price-note-2', 2), { body: '上記金額は交通費・ETC代・ガソリン代・宿泊費等の係る諸経費を全て含めた金額になります。', isDefaultSelected: true })
        ];
    }

    function seedSpecialNotes() {
        return [
            Object.assign(baseRecord('special-note-1', 1), { body: '警備業法を遵守し、乙の警備員は乙の管理監督の下業務を行う事', isDefaultSelected: true }),
            Object.assign(baseRecord('special-note-2', 2), { body: '警備員が使用するその他の資機材は自社の物を使用する事', isDefaultSelected: true })
        ];
    }

    function seedVehicles() {
        var source = window.OmsMockVehiclesData ? window.OmsMockVehiclesData.createVehicles() : [];
        return source.map(function (item, index) {
            return Object.assign(baseRecord(item.id, index + 1), {
                vehicleCode: String(item.id || ('V-' + (index + 1))).toUpperCase(), gcCode: item.owner || 'touo',
                licensePlate: item.numberPlate || '', plateShort: item.plate || '', shortName: item.plate || '', model: item.model || '',
                shakenDate: item.nextShakenDate || '', inspectionDate: item.nextInspectionDate || '', notes: ''
            });
        });
    }

    function seedEtcCards() {
        var source = window.OmsMockVehiclesData ? window.OmsMockVehiclesData.createEtcCards() : [];
        return source.map(function (item, index) {
            return Object.assign(baseRecord('etc-card-' + (index + 1), index + 1), {
                cardLabel: item.label || '', gcCode: item.owner || 'touo', vehicleId: '', notes: ''
            });
        });
    }

    function seedHolidays() {
        var rows = [
            ['2026-01-01', '元日'], ['2026-01-12', '成人の日'], ['2026-02-11', '建国記念の日'], ['2026-02-23', '天皇誕生日'],
            ['2026-03-20', '春分の日'], ['2026-04-29', '昭和の日'], ['2026-05-03', '憲法記念日'], ['2026-05-04', 'みどりの日'],
            ['2026-05-05', 'こどもの日'], ['2026-05-06', '休日'], ['2026-07-20', '海の日'], ['2026-08-11', '山の日'],
            ['2026-09-21', '敬老の日'], ['2026-09-22', '国民の休日'], ['2026-09-23', '秋分の日'], ['2026-10-12', 'スポーツの日'],
            ['2026-11-03', '文化の日'], ['2026-11-23', '勤労感謝の日']
        ];
        return rows.map(function (row, index) {
            return Object.assign(baseRecord('holiday-' + (index + 1), index + 1), { date: row[0], name: row[1] });
        });
    }

    function seedPenaltyCodes() {
        return [['SICK', '病欠・体調不良'], ['LATE', '寝坊・遅刻'], ['ABSENT_NOTICE', '事前連絡あり欠勤'], ['OTHER', 'その他']]
            .map(function (row, index) {
                return Object.assign(baseRecord('penalty-code-' + (index + 1), index + 1), { code: row[0], name: row[1], description: '' });
            });
    }

    function createInitialState(previousCompanies, previousNextCompanyId) {
        var datasets = {};
        MASTER_IDS.forEach(function (id) {
            datasets[id] = id === 'company' && Array.isArray(previousCompanies) ? clone(previousCompanies) : masterDefinitions[id].seed();
        });
        var nextIds = {};
        if (Array.isArray(previousCompanies)) {
            var usedLocalIds = previousCompanies.map(function (item) {
                var match = String(item.id || '').match(/^company-local-(\d+)$/);
                return match ? Number(match[1]) : 0;
            });
            nextIds.company = Math.max.apply(null, [0, Number(previousNextCompanyId || 1) - 1].concat(usedLocalIds));
        }
        return { version: 4, nextIds: nextIds, datasets: datasets };
    }

    function loadState() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && (saved.version === 2 || saved.version === 3 || saved.version === 4) && saved.datasets) {
                MASTER_IDS.forEach(function (id) {
                    if (!Array.isArray(saved.datasets[id])) saved.datasets[id] = masterDefinitions[id].seed();
                });
                if (!saved.nextIds) saved.nextIds = {};
                saved.version = 4;
                return saved;
            }
            if (saved && Array.isArray(saved.companies)) return createInitialState(saved.companies, saved.nextCompanyId);
        } catch (error) {
            console.warn('マスタ管理の保存データを読み込めませんでした。', error);
        }
        return createInitialState();
    }

    var state = loadState();

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
    }

    function currentDefinition() { return masterDefinitions[selectedMasterId]; }
    function currentItems() { return state.datasets[selectedMasterId]; }

    function countFor(id) {
        return masterDefinitions[id] ? state.datasets[id].filter(function (item) { return item.isActive; }).length : 0;
    }

    function renderNav() {
        document.getElementById('maSideNav').innerHTML = masterSections.map(function (section) {
            return '<div class="side-nav-heading">' + escapeHtml(section.label) + '</div>' + section.items.map(function (item) {
                var enabled = !!masterDefinitions[item[0]];
                var active = item[0] === selectedMasterId;
                return '<button type="button" class="side-nav-item' + (active ? ' active' : '') + '" data-master="' + item[0] + '"' + (enabled ? '' : ' disabled') + '>'
                    + '<span class="icon ' + item[2] + ' icon-ink" aria-hidden="true"></span>'
                    + escapeHtml(item[1]) + '<span class="nav-count">' + countFor(item[0]) + '</span></button>';
            }).join('');
        }).join('');
    }

    function optionLabel(fieldDef, value) {
        var options = fieldDef && fieldDef.optionsProvider ? fieldDef.optionsProvider() : (fieldDef && fieldDef.options ? fieldDef.options : []);
        var option = options.find(function (item) { return item.value === value; });
        return option ? option.label : value;
    }

    function displayValue(item, column) {
        var key = column[0];
        var type = column[2];
        var value = item[key];
        if (type === 'option') {
            var fieldDef = currentDefinition().fields.find(function (fieldItem) { return fieldItem.key === key; });
            return optionLabel(fieldDef, value);
        }
        if (type === 'boolean') return value ? '必要' : '不要';
        if (type === 'complete') return value ? '完備' : '未完備';
        if (type === 'vehicle') {
            var vehicle = state.datasets.vehicle.find(function (row) { return row.id === value; });
            return vehicle ? vehicle.licensePlate : '';
        }
        if (type === 'org-unit') {
            var orgUnit = state.datasets['org-unit'].find(function (row) { return row.id === item[key]; });
            return orgUnit ? orgUnit.name : '未設定';
        }
        return value == null ? '' : value;
    }

    function searchableValues(item) {
        return currentDefinition().fields.map(function (fieldDef) {
            return fieldDef.type === 'select' ? optionLabel(fieldDef, item[fieldDef.key]) : item[fieldDef.key];
        });
    }

    function filteredItems() {
        var query = document.getElementById('maSearch').value.trim().toLocaleLowerCase('ja');
        return currentItems().filter(function (item) {
            if (statusFilter === 'active' && !item.isActive) return false;
            if (statusFilter === 'inactive' && item.isActive) return false;
            if (!query) return true;
            return searchableValues(item).some(function (value) {
                return String(value == null ? '' : value).toLocaleLowerCase('ja').indexOf(query) !== -1;
            });
        }).sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
    }

    function treeDepthFor(item, items) {
        var depth = 1;
        var parentId = item && item.parentId;
        var visited = {};
        while (parentId && !visited[parentId] && depth < 10) {
            visited[parentId] = true;
            var parent = items.find(function (row) { return row.id === parentId; });
            if (!parent) break;
            depth += 1;
            parentId = parent.parentId;
        }
        return depth;
    }

    function treeGroupOptions(definition) {
        if (!definition.tree.groupKey) return [{ value: '', label: definition.label }];
        return definition.tree.groupOptionsProvider ? definition.tree.groupOptionsProvider() : [];
    }

    function treeGroupKey(definition, item) {
        return definition.tree.groupKey ? String(item[definition.tree.groupKey] || '') : '';
    }

    function treeTypeLabel(item, depth) {
        if (selectedMasterId === 'org-level-type') return '第' + depth + '階層';
        if (selectedMasterId === 'org-unit') {
            var level = state.datasets['org-level-type'].find(function (row) {
                return row.gcCode === item.gcCode && treeDepthFor(row, state.datasets['org-level-type']) === depth;
            });
            return level ? level.name : '組織';
        }
        if (selectedMasterId === 'site') return depth === 1 ? '現場' : (item.label || '子項目');
        if (selectedMasterId === 'site-category') return depth === 1 ? '区分' : (depth === 2 ? '子バッジ' : '孫バッジ');
        return currentDefinition().tree.itemType;
    }

    function treeCollapsed(key) {
        return !!(collapsedTreeIds[selectedMasterId] && collapsedTreeIds[selectedMasterId][key]);
    }

    function toggleTree(key) {
        if (!collapsedTreeIds[selectedMasterId]) collapsedTreeIds[selectedMasterId] = {};
        collapsedTreeIds[selectedMasterId][key] = !collapsedTreeIds[selectedMasterId][key];
        renderTable();
    }

    function renderTreeTable(definition) {
        var items = currentItems().slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
        var query = document.getElementById('maSearch').value.trim().toLocaleLowerCase('ja');
        var included = {};
        items.forEach(function (item) {
            var statusMatch = statusFilter === 'all' || (statusFilter === 'active' ? item.isActive : !item.isActive);
            var queryMatch = !query || searchableValues(item).some(function (value) {
                return String(value == null ? '' : value).toLocaleLowerCase('ja').indexOf(query) !== -1;
            });
            if (statusMatch && queryMatch) included[item.id] = true;
        });
        Object.keys(included).forEach(function (id) {
            var current = items.find(function (row) { return row.id === id; });
            var guard = {};
            while (current && current.parentId && !guard[current.parentId]) {
                guard[current.parentId] = true;
                included[current.parentId] = true;
                current = items.find(function (row) { return row.id === current.parentId; });
            }
        });

        var rows = [];
        var visibleCount = Object.keys(included).length;
        treeGroupOptions(definition).forEach(function (group) {
            var groupItems = items.filter(function (item) { return treeGroupKey(definition, item) === String(group.value) && included[item.id]; });
            if (!groupItems.length) return;
            var groupKey = 'group:' + group.value;
            var groupCollapsed = !query && treeCollapsed(groupKey);
            rows.push('<tr class="ma-tree-group"><td colspan="3"><button type="button" class="ma-tree-toggle' + (groupCollapsed ? ' is-collapsed' : '')
                + '" data-tree-key="' + escapeHtml(groupKey) + '" title="' + (groupCollapsed ? '展開' : '折りたたみ') + '" aria-label="' + (groupCollapsed ? '展開' : '折りたたみ') + '">'
                + '<span class="chev" aria-hidden="true"></span></button><strong>' + escapeHtml(group.label) + '</strong><span class="ma-tree-group-count">'
                + groupItems.length + '件</span></td></tr>');
            if (groupCollapsed) return;
            var groupIds = {};
            groupItems.forEach(function (item) { groupIds[item.id] = true; });
            var roots = groupItems.filter(function (item) { return !item.parentId || !groupIds[item.parentId]; });
            function appendNode(item) {
                var depth = treeDepthFor(item, items);
                var children = groupItems.filter(function (row) { return row.parentId === item.id; });
                var key = 'item:' + item.id;
                var collapsed = !query && treeCollapsed(key);
                var toggle = children.length
                    ? '<button type="button" class="ma-tree-toggle' + (collapsed ? ' is-collapsed' : '') + '" data-tree-key="' + escapeHtml(key)
                        + '" title="' + (collapsed ? '展開' : '折りたたみ') + '" aria-label="' + (collapsed ? '展開' : '折りたたみ') + '"><span class="chev" aria-hidden="true"></span></button>'
                    : '<span class="ma-tree-spacer" aria-hidden="true"></span>';
                rows.push('<tr data-id="' + escapeHtml(item.id) + '" class="ma-tree-row ma-tree-depth-' + Math.min(depth, 5) + ' ' + (item.id === selectedId ? 'is-selected' : '') + '" tabindex="0">'
                    + '<td><div class="ma-tree-cell">' + toggle + '<strong>' + escapeHtml(item.name || item.code || definition.singular) + '</strong></div></td>'
                    + '<td class="sub">' + escapeHtml(treeTypeLabel(item, depth)) + '</td>'
                    + '<td><span class="ma-status' + (item.isActive ? ' is-active' : '') + '">' + (item.isActive ? '有効' : '無効') + '</span></td></tr>');
                if (!collapsed) children.forEach(appendNode);
            }
            roots.forEach(appendNode);
        });

        document.getElementById('maTableHead').innerHTML = '<tr><th>' + escapeHtml(definition.label) + '</th><th>種別</th><th class="num">状態</th></tr>';
        document.getElementById('maTableBody').innerHTML = rows.join('');
        document.getElementById('maEmptyState').hidden = visibleCount !== 0;
        document.getElementById('maEmptyTitle').textContent = '該当する' + definition.label + 'はありません';
        document.getElementById('maMainTitle').textContent = definition.label;
        document.getElementById('maMainCount').textContent = visibleCount + '件';
        document.getElementById('maTable').setAttribute('aria-label', definition.label + 'ツリー');
        renderNav();
    }

    function renderTable() {
        var definition = currentDefinition();
        if (definition.tree) {
            renderTreeTable(definition);
            return;
        }
        var items = filteredItems();
        document.getElementById('maTableHead').innerHTML = '<tr>' + definition.columns.map(function (column) {
            return '<th>' + escapeHtml(column[1]) + '</th>';
        }).join('') + '<th class="num">状態</th></tr>';
        document.getElementById('maTableBody').innerHTML = items.map(function (item) {
            return '<tr data-id="' + escapeHtml(item.id) + '" class="' + (item.id === selectedId ? 'is-selected' : '') + '" tabindex="0">'
                + definition.columns.map(function (column) {
                    var content = escapeHtml(displayValue(item, column));
                    if (column[2] === 'strong') content = '<strong>' + content + '</strong>';
                    return '<td class="' + (column[2] === 'sub' ? 'sub' : '') + '">' + content + '</td>';
                }).join('')
                + '<td><span class="ma-status' + (item.isActive ? ' is-active' : '') + '">' + (item.isActive ? '有効' : '無効') + '</span></td></tr>';
        }).join('');
        document.getElementById('maEmptyState').hidden = items.length !== 0;
        document.getElementById('maEmptyTitle').textContent = '該当する' + definition.label + 'はありません';
        document.getElementById('maMainTitle').textContent = definition.label;
        document.getElementById('maMainCount').textContent = items.length + '件';
        document.getElementById('maTable').setAttribute('aria-label', definition.label + '一覧');
        renderNav();
    }

    function renderField(fieldDef, item) {
        var value = item && item[fieldDef.key] != null ? item[fieldDef.key] : '';
        var id = 'maField-' + fieldDef.key;
        if (fieldDef.type === 'checkbox') {
            return '<label class="check ma-check"><input type="checkbox" id="' + id + '" name="' + fieldDef.key + '"' + (value ? ' checked' : '') + '><span class="box"></span>' + escapeHtml(fieldDef.label) + '</label>';
        }
        var control;
        if (fieldDef.type === 'select' || fieldDef.type === 'vehicle-select' || fieldDef.type === 'tree-parent' || fieldDef.type === 'employee-org-select') {
            var options = fieldDef.type === 'vehicle-select'
                ? [{ value: '', label: '紐付けなし' }].concat(state.datasets.vehicle.filter(function (vehicle) { return vehicle.isActive; }).map(function (vehicle) {
                    return { value: vehicle.id, label: vehicle.licensePlate + ' / ' + vehicle.model };
                }))
                : fieldDef.type === 'tree-parent' ? treeParentOptions(item || {})
                : fieldDef.type === 'employee-org-select' ? employeeOrgOptions(item && item.gcCode, value)
                : fieldDef.optionsProvider ? fieldDef.optionsProvider() : fieldDef.options;
            control = '<div class="select-wrap"><select class="input" id="' + id + '" name="' + fieldDef.key + '"' + (fieldDef.required ? ' required' : '') + '>'
                + options.map(function (option) {
                    return '<option value="' + escapeHtml(option.value) + '"' + (option.value === value ? ' selected' : '') + '>' + escapeHtml(option.label) + '</option>';
                }).join('') + '</select></div>';
        } else if (fieldDef.type === 'textarea') {
            control = '<textarea class="input" id="' + id + '" name="' + fieldDef.key + '" rows="4"' + (fieldDef.required ? ' required' : '') + '>' + escapeHtml(value) + '</textarea>';
        } else {
            control = '<input class="input" id="' + id + '" name="' + fieldDef.key + '" type="' + fieldDef.type + '" value="' + escapeHtml(value) + '"'
                + (fieldDef.required ? ' required' : '') + (fieldDef.maxlength ? ' maxlength="' + fieldDef.maxlength + '"' : '') + '>';
        }
        return '<div class="field"><label class="field-label" for="' + id + '">' + escapeHtml(fieldDef.label) + '</label>' + control
            + (fieldDef.help ? '<span class="field-help">' + escapeHtml(fieldDef.help) + '</span>' : '') + '</div>';
    }

    function treeParentOptions(item) {
        var definition = currentDefinition();
        if (!definition.tree) return [];
        var groupKey = definition.tree.groupKey;
        var selectedGroup = groupKey ? String(item[groupKey] || '') : '';
        var descendants = {};
        function markDescendants(parentId) {
            currentItems().forEach(function (row) {
                if (row.parentId === parentId && !descendants[row.id]) {
                    descendants[row.id] = true;
                    markDescendants(row.id);
                }
            });
        }
        if (item.id) markDescendants(item.id);
        var options = [{ value: '', label: '親なし（ルート）' }];
        currentItems().filter(function (row) {
            if (row.id === item.id || descendants[row.id]) return false;
            if (groupKey && String(row[groupKey] || '') !== selectedGroup) return false;
            return treeDepthFor(row, currentItems()) < definition.tree.maxDepth;
        }).sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); }).forEach(function (row) {
            var depth = treeDepthFor(row, currentItems());
            options.push({ value: row.id, label: Array(depth).join('- ') + row.name });
        });
        return options;
    }

    function renderEditor(item) {
        document.getElementById('maFields').innerHTML = currentDefinition().fields.map(function (fieldDef) {
            return renderField(fieldDef, item);
        }).join('') + (currentDefinition().employeeEditor ? renderEmployeeExtras(item || {}) : '');
    }

    function employeeOrgOptions(gcCode, selectedValue) {
        return [{ value: '', label: '未設定' }].concat(state.datasets['org-unit'].filter(function (row) {
            return (row.isActive || row.id === selectedValue) && row.gcCode === gcCode;
        }).sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); }).map(function (row) {
            return { value: row.id, label: row.name };
        }));
    }

    function licenseOptions(selectedValue) {
        return state.datasets['license-type'].filter(function (row) { return row.isActive || row.id === selectedValue; }).map(function (row) {
            return '<option value="' + escapeHtml(row.id) + '"' + (row.id === selectedValue ? ' selected' : '') + '>' + escapeHtml(row.name) + '</option>';
        }).join('');
    }

    function employeeOptions(selectedValue) {
        return state.datasets.employee.filter(function (row) {
            return (row.isActive || row.id === selectedValue) && row.id !== selectedId;
        }).sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); }).map(function (row) {
            return '<option value="' + escapeHtml(row.id) + '"' + (row.id === selectedValue ? ' selected' : '') + '>' + escapeHtml(row.name + ' / ' + row.employeeCode) + '</option>';
        }).join('');
    }

    function renderLicenseRow(record) {
        record = record || {};
        return '<div class="ma-sublist-item" data-license-row>'
            + '<div class="field"><label class="field-label">資格・スキル</label><div class="select-wrap"><select class="input" data-license-field="licenseTypeId" required>'
            + '<option value="">選択してください</option>' + licenseOptions(record.licenseTypeId || '') + '</select></div></div>'
            + '<div class="field"><label class="field-label">資格番号</label><input class="input" data-license-field="licenseNumber" maxlength="50" value="' + escapeHtml(record.licenseNumber || '') + '"></div>'
            + '<div class="ma-sublist-dates"><div class="field"><label class="field-label">取得日</label><input class="input" type="date" data-license-field="acquiredDate" value="' + escapeHtml(record.acquiredDate || '') + '"></div>'
            + '<div class="field"><label class="field-label">有効期限</label><input class="input" type="date" data-license-field="expiryDate" value="' + escapeHtml(record.expiryDate || '') + '"></div></div>'
            + '<div class="field"><label class="field-label">備考</label><input class="input" data-license-field="notes" value="' + escapeHtml(record.notes || '') + '"></div>'
            + '<button type="button" class="btn btn-ghost btn-sm ma-sublist-remove" data-remove-sublist="license">資格を削除</button></div>';
    }

    function renderConflictRow(employeeId) {
        return '<div class="ma-sublist-item ma-conflict-item" data-conflict-row><div class="field"><label class="field-label">同時配置を避ける社員</label>'
            + '<div class="select-wrap"><select class="input" data-conflict-field required><option value="">選択してください</option>'
            + employeeOptions(employeeId || '') + '</select></div></div>'
            + '<button type="button" class="btn btn-ghost btn-sm ma-sublist-remove" data-remove-sublist="conflict">制約を削除</button></div>';
    }

    function renderEmployeeExtras(item) {
        var licenses = Array.isArray(item.licenses) ? item.licenses : [];
        var conflicts = Array.isArray(item.conflictEmployeeIds) ? item.conflictEmployeeIds : [];
        return '<div class="ma-employee-section"><div class="section-title">資格・スキル</div><div class="ma-sublist" id="maEmployeeLicenses">'
            + licenses.map(renderLicenseRow).join('') + '</div><button type="button" class="btn btn-secondary btn-sm ma-sublist-add" data-add-sublist="license">資格を追加</button></div>'
            + '<div class="ma-employee-section"><div class="section-title">配置制約</div><div class="ma-sublist" id="maEmployeeConflicts">'
            + conflicts.map(renderConflictRow).join('') + '</div><button type="button" class="btn btn-secondary btn-sm ma-sublist-add" data-add-sublist="conflict">制約を追加</button></div>';
    }

    function itemTitle(item) {
        return item.name || item.shortName || item.body || item.licensePlate || item.cardLabel || currentDefinition().singular;
    }

    function itemSub(item) {
        return item.code || item.vehicleCode || item.date || '';
    }

    function clearEditor() {
        selectedId = null;
        editorMode = 'detail';
        document.getElementById('maMasterForm').hidden = true;
        document.getElementById('maPropMode').textContent = '詳細';
        document.getElementById('maPropTitle').textContent = '未選択';
        document.getElementById('maPropSub').textContent = currentDefinition().singular + 'を選択するか、新規追加を実行してください。';
        document.getElementById('maAddChildBtn').hidden = true;
        renderTable();
    }

    function selectItem(id) {
        var item = currentItems().find(function (row) { return row.id === id; });
        if (!item) return;
        selectedId = id;
        editorMode = 'edit';
        renderEditor(item);
        document.getElementById('maMasterForm').hidden = false;
        document.getElementById('maPropMode').textContent = '編集';
        document.getElementById('maPropTitle').textContent = itemTitle(item);
        document.getElementById('maPropSub').textContent = itemSub(item);
        var toggle = document.getElementById('maToggleActiveBtn');
        toggle.hidden = false;
        toggle.textContent = item.isActive ? '無効化' : '有効化';
        toggle.className = item.isActive ? 'btn btn-danger' : 'btn btn-secondary';
        var childButton = document.getElementById('maAddChildBtn');
        childButton.hidden = !currentDefinition().tree || treeDepthFor(item, currentItems()) >= currentDefinition().tree.maxDepth;
        setPanelMode('detail');
        renderTable();
    }

    function startNew(defaults) {
        selectedId = null;
        editorMode = 'new';
        var initial = Object.assign({ sortOrder: currentItems().length + 1 }, defaults || {});
        if (currentDefinition().tree && currentDefinition().tree.groupKey && !initial[currentDefinition().tree.groupKey]) {
            var groups = treeGroupOptions(currentDefinition());
            initial[currentDefinition().tree.groupKey] = groups.length ? groups[0].value : '';
        }
        renderEditor(initial);
        document.getElementById('maMasterForm').hidden = false;
        document.getElementById('maPropMode').textContent = '新規追加';
        document.getElementById('maPropTitle').textContent = currentDefinition().singular + 'を追加';
        document.getElementById('maPropSub').textContent = '必須項目を入力して保存します。';
        document.getElementById('maToggleActiveBtn').hidden = true;
        document.getElementById('maAddChildBtn').hidden = true;
        setPanelMode('detail');
        renderTable();
        var first = document.querySelector('#maFields input, #maFields select, #maFields textarea');
        if (first) first.focus();
    }

    function startChild() {
        if (!selectedId || !currentDefinition().tree) return;
        var parent = currentItems().find(function (row) { return row.id === selectedId; });
        if (!parent || treeDepthFor(parent, currentItems()) >= currentDefinition().tree.maxDepth) return;
        var defaults = { parentId: parent.id, sortOrder: currentItems().filter(function (row) { return row.parentId === parent.id; }).length + 1 };
        if (currentDefinition().tree.groupKey) defaults[currentDefinition().tree.groupKey] = parent[currentDefinition().tree.groupKey];
        startNew(defaults);
    }

    function readFormValues() {
        var values = {};
        currentDefinition().fields.forEach(function (fieldDef) {
            var input = document.getElementById('maField-' + fieldDef.key);
            if (fieldDef.type === 'checkbox') values[fieldDef.key] = input.checked;
            else if (fieldDef.type === 'number') values[fieldDef.key] = input.value === '' ? 0 : Number(input.value);
            else values[fieldDef.key] = input.value.trim();
        });
        if (currentDefinition().employeeEditor) {
            values.licenses = Array.from(document.querySelectorAll('[data-license-row]')).map(function (row) {
                var result = {};
                row.querySelectorAll('[data-license-field]').forEach(function (input) { result[input.getAttribute('data-license-field')] = input.value.trim(); });
                return result;
            });
            values.conflictEmployeeIds = Array.from(document.querySelectorAll('[data-conflict-field]')).map(function (input) { return input.value; }).filter(Boolean);
        }
        return values;
    }

    function validateEmployeeValues(values) {
        if (!currentDefinition().employeeEditor) return null;
        var licenseIds = values.licenses.map(function (row) { return row.licenseTypeId; });
        if (new Set(licenseIds).size !== licenseIds.length) return { elementId: '', selector: '[data-license-field="licenseTypeId"]', message: '同じ資格は1件だけ登録できます。' };
        if (new Set(values.conflictEmployeeIds).size !== values.conflictEmployeeIds.length) return { elementId: '', selector: '[data-conflict-field]', message: '同じ社員の配置制約は1件だけ登録できます。' };
        return null;
    }

    function normalizeEmployee(item) {
        item.licenses = Array.isArray(item.licenses) ? item.licenses : [];
        item.conflictEmployeeIds = Array.isArray(item.conflictEmployeeIds) ? item.conflictEmployeeIds : [];
        return item;
    }

    function syncEmployeeConflicts(item) {
        state.datasets.employee.forEach(function (employee) {
            normalizeEmployee(employee);
            employee.conflictEmployeeIds = employee.conflictEmployeeIds.filter(function (id) { return id !== item.id; });
        });
        item.conflictEmployeeIds.forEach(function (otherId) {
            var other = state.datasets.employee.find(function (employee) { return employee.id === otherId; });
            if (other && other.conflictEmployeeIds.indexOf(item.id) === -1) other.conflictEmployeeIds.push(item.id);
        });
    }

    function findDuplicate(values) {
        var definition = currentDefinition();
        var duplicateField = null;
        var message = '';
        (definition.unique || []).some(function (rule) {
            var key = rule[0];
            var value = String(values[key] || '').toLocaleLowerCase();
            var found = currentItems().some(function (item) {
                return item.id !== selectedId && String(item[key] || '').toLocaleLowerCase() === value;
            });
            if (found) { duplicateField = key; message = rule[1]; }
            return found;
        });
        if (!duplicateField && definition.compoundUnique) {
            var foundCompound = currentItems().some(function (item) {
                return item.id !== selectedId && definition.compoundUnique.every(function (key) {
                    return String(item[key] || '').toLocaleLowerCase() === String(values[key] || '').toLocaleLowerCase();
                });
            });
            if (foundCompound) { duplicateField = definition.compoundUnique[definition.compoundUnique.length - 1]; message = definition.compoundMessage; }
        }
        return duplicateField ? { field: duplicateField, message: message } : null;
    }

    function validateTreeValues(values) {
        var definition = currentDefinition();
        if (!definition.tree) return null;
        var parent = values.parentId ? currentItems().find(function (row) { return row.id === values.parentId; }) : null;
        if (values.parentId && !parent) return { field: 'parentId', message: '選択した親が見つかりません。' };
        if (parent && definition.tree.groupKey) values[definition.tree.groupKey] = parent[definition.tree.groupKey];
        var nextDepth = parent ? treeDepthFor(parent, currentItems()) + 1 : 1;
        if (nextDepth > definition.tree.maxDepth) return { field: 'parentId', message: 'これ以上深い階層には移動できません。' };
        if (selectedMasterId === 'org-level-type') {
            var sibling = currentItems().find(function (row) {
                return row.id !== selectedId && row.gcCode === values.gcCode && String(row.parentId || '') === String(values.parentId || '');
            });
            if (sibling) return { field: 'parentId', message: '同じ深さの階層種別は1件だけ登録できます。' };
        }
        if (selectedMasterId === 'org-unit') {
            var levelExists = state.datasets['org-level-type'].some(function (row) {
                return row.isActive && row.gcCode === values.gcCode && treeDepthFor(row, state.datasets['org-level-type']) === nextDepth;
            });
            if (!levelExists) return { field: 'parentId', message: 'この深さの組織階層種別が定義されていません。' };
        }
        return null;
    }

    function normalizeSupportPartner(item) {
        item.isMasterComplete = !!(item.formalName && item.address && item.representativeTitle && item.representativeName);
        return item;
    }

    function nextLocalId() {
        var next = (state.nextIds[selectedMasterId] || 0) + 1;
        state.nextIds[selectedMasterId] = next;
        return selectedMasterId + '-local-' + next;
    }

    function submitItem(event) {
        event.preventDefault();
        var values = readFormValues();
        if (currentDefinition().normalize) currentDefinition().normalize(values);
        var duplicate = validateTreeValues(values) || validateEmployeeValues(values) || findDuplicate(values);
        if (duplicate) {
            var duplicateInput = duplicate.selector ? document.querySelector(duplicate.selector) : document.getElementById(duplicate.elementId || ('maField-' + duplicate.field));
            duplicateInput.setCustomValidity(duplicate.message);
            duplicateInput.reportValidity();
            return;
        }
        document.querySelectorAll('#maFields input, #maFields select, #maFields textarea').forEach(function (input) {
            input.setCustomValidity('');
        });
        if (editorMode === 'new') {
            var newItem = Object.assign(baseRecord(nextLocalId(), values.sortOrder || currentItems().length + 1), values);
            currentItems().push(newItem);
            selectedId = newItem.id;
            cascadeTreeGroup(newItem);
        } else {
            var item = currentItems().find(function (row) { return row.id === selectedId; });
            if (!item) return;
            Object.assign(item, values);
            if (currentDefinition().normalize) currentDefinition().normalize(item);
            cascadeTreeGroup(item);
        }
        if (currentDefinition().employeeEditor) syncEmployeeConflicts(currentItems().find(function (row) { return row.id === selectedId; }));
        saveState();
        selectItem(selectedId);
    }

    function toggleActive() {
        var item = currentItems().find(function (row) { return row.id === selectedId; });
        if (!item) return;
        item.isActive = !item.isActive;
        saveState();
        if ((statusFilter === 'active' && !item.isActive) || (statusFilter === 'inactive' && item.isActive)) {
            clearEditor();
            return;
        }
        selectItem(item.id);
    }

    function switchMaster(id, updateUrl) {
        if (!masterDefinitions[id]) return;
        selectedMasterId = id;
        document.getElementById('maSearch').value = '';
        document.getElementById('maSearch').placeholder = currentDefinition().search;
        if (updateUrl) history.replaceState(null, '', location.pathname + '?master=' + encodeURIComponent(id));
        clearEditor();
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
        document.getElementById('maMasterForm').hidden = mode === 'history' || editorMode === 'detail';
        if (mode === 'history') {
            document.getElementById('maPropMode').textContent = '変更履歴';
            document.getElementById('maPropTitle').textContent = 'マスタ変更';
            document.getElementById('maPropSub').textContent = '変更通知のうちマスタ更新を表示します。';
            renderHistory();
        } else if (selectedId) {
            var item = currentItems().find(function (row) { return row.id === selectedId; });
            if (item) {
                document.getElementById('maPropMode').textContent = '編集';
                document.getElementById('maPropTitle').textContent = itemTitle(item);
                document.getElementById('maPropSub').textContent = itemSub(item);
            }
        } else if (editorMode === 'new') {
            document.getElementById('maPropMode').textContent = '新規追加';
            document.getElementById('maPropTitle').textContent = currentDefinition().singular + 'を追加';
            document.getElementById('maPropSub').textContent = '必須項目を入力して保存します。';
        } else {
            document.getElementById('maPropMode').textContent = '詳細';
            document.getElementById('maPropTitle').textContent = '未選択';
            document.getElementById('maPropSub').textContent = currentDefinition().singular + 'を選択するか、新規追加を実行してください。';
        }
    }

    function mountNotifyRail() {
        var bells = document.getElementById('mdNavCnBells');
        var rail = document.getElementById('maRail');
        if (bells && rail) rail.appendChild(bells);
    }

    function refreshTreeParentOptions() {
        var parentSelect = document.getElementById('maField-parentId');
        if (!parentSelect || !currentDefinition().tree) return;
        var draft = readFormValues();
        if (selectedId) draft.id = selectedId;
        var currentValue = parentSelect.value;
        parentSelect.innerHTML = treeParentOptions(draft).map(function (option) {
            return '<option value="' + escapeHtml(option.value) + '"' + (option.value === currentValue ? ' selected' : '') + '>' + escapeHtml(option.label) + '</option>';
        }).join('');
        if (!parentSelect.querySelector('option:checked')) parentSelect.value = '';
    }

    function bindEvents() {
        document.getElementById('maSearch').addEventListener('input', renderTable);
        document.getElementById('maNewBtn').addEventListener('click', function () { startNew(); });
        document.getElementById('maAddChildBtn').addEventListener('click', startChild);
        document.getElementById('maMasterForm').addEventListener('submit', submitItem);
        document.getElementById('maToggleActiveBtn').addEventListener('click', toggleActive);
        document.getElementById('maFields').addEventListener('input', function (event) {
            event.target.setCustomValidity('');
            document.querySelectorAll('[data-license-field="licenseTypeId"], [data-conflict-field]').forEach(function (input) { input.setCustomValidity(''); });
        });
        document.getElementById('maFields').addEventListener('change', function (event) {
            if (currentDefinition().tree && event.target.name === currentDefinition().tree.groupKey) refreshTreeParentOptions();
            if (currentDefinition().employeeEditor && event.target.name === 'gcCode') {
                var orgSelect = document.getElementById('maField-orgUnitId');
                orgSelect.innerHTML = employeeOrgOptions(event.target.value, '').map(function (option) {
                    return '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.label) + '</option>';
                }).join('');
            }
        });
        document.getElementById('maFields').addEventListener('click', function (event) {
            var addButton = event.target.closest('[data-add-sublist]');
            if (addButton) {
                var type = addButton.getAttribute('data-add-sublist');
                var container = document.getElementById(type === 'license' ? 'maEmployeeLicenses' : 'maEmployeeConflicts');
                container.insertAdjacentHTML('beforeend', type === 'license' ? renderLicenseRow({}) : renderConflictRow(''));
                var firstInput = container.lastElementChild.querySelector('select, input');
                if (firstInput) firstInput.focus();
                return;
            }
            var removeButton = event.target.closest('[data-remove-sublist]');
            if (removeButton) removeButton.closest('.ma-sublist-item').remove();
        });
        document.getElementById('maSideNav').addEventListener('click', function (event) {
            var button = event.target.closest('[data-master]');
            if (button && !button.disabled) switchMaster(button.getAttribute('data-master'), true);
        });
        document.getElementById('maTableBody').addEventListener('click', function (event) {
            var treeToggle = event.target.closest('[data-tree-key]');
            if (treeToggle) {
                event.stopPropagation();
                toggleTree(treeToggle.getAttribute('data-tree-key'));
                return;
            }
            var row = event.target.closest('tr[data-id]');
            if (row) selectItem(row.getAttribute('data-id'));
        });
        document.getElementById('maTableBody').addEventListener('keydown', function (event) {
            var row = event.target.closest('tr[data-id]');
            if (row && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                selectItem(row.getAttribute('data-id'));
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
        var requested = new URLSearchParams(location.search).get('master');
        if (masterDefinitions[requested]) selectedMasterId = requested;
        mountNotifyRail();
        bindEvents();
        document.getElementById('maSearch').placeholder = currentDefinition().search;
        clearEditor();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
