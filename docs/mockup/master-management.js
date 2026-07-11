(function () {
    'use strict';

    var STORAGE_KEY = 'mock.oms.master.v1';
    var MASTER_IDS = [
        'company', 'group-company', 'license-type', 'support-partner',
        'price-note', 'special-note', 'vehicle', 'etc-card', 'holiday', 'penalty-code'
    ];
    var selectedMasterId = 'company';
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
        return { version: 2, nextIds: nextIds, datasets: datasets };
    }

    function loadState() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && saved.version === 2 && saved.datasets) {
                MASTER_IDS.forEach(function (id) {
                    if (!Array.isArray(saved.datasets[id])) saved.datasets[id] = masterDefinitions[id].seed();
                });
                if (!saved.nextIds) saved.nextIds = {};
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
        var options = fieldDef && fieldDef.options ? fieldDef.options : [];
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

    function renderTable() {
        var definition = currentDefinition();
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
        if (fieldDef.type === 'select' || fieldDef.type === 'vehicle-select') {
            var options = fieldDef.type === 'vehicle-select'
                ? [{ value: '', label: '紐付けなし' }].concat(state.datasets.vehicle.filter(function (vehicle) { return vehicle.isActive; }).map(function (vehicle) {
                    return { value: vehicle.id, label: vehicle.licensePlate + ' / ' + vehicle.model };
                }))
                : fieldDef.options;
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

    function renderEditor(item) {
        document.getElementById('maFields').innerHTML = currentDefinition().fields.map(function (fieldDef) {
            return renderField(fieldDef, item);
        }).join('');
    }

    function clearEditor() {
        selectedId = null;
        editorMode = 'detail';
        document.getElementById('maMasterForm').hidden = true;
        document.getElementById('maPropMode').textContent = '詳細';
        document.getElementById('maPropTitle').textContent = '未選択';
        document.getElementById('maPropSub').textContent = currentDefinition().singular + 'を選択するか、新規追加を実行してください。';
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
        document.getElementById('maPropTitle').textContent = item.name || item.shortName || item.body || item.licensePlate || item.cardLabel || currentDefinition().singular;
        document.getElementById('maPropSub').textContent = item.code || item.vehicleCode || item.date || '';
        var toggle = document.getElementById('maToggleActiveBtn');
        toggle.hidden = false;
        toggle.textContent = item.isActive ? '無効化' : '有効化';
        toggle.className = item.isActive ? 'btn btn-danger' : 'btn btn-secondary';
        setPanelMode('detail');
        renderTable();
    }

    function startNew() {
        selectedId = null;
        editorMode = 'new';
        renderEditor({ sortOrder: currentItems().length + 1 });
        document.getElementById('maMasterForm').hidden = false;
        document.getElementById('maPropMode').textContent = '新規追加';
        document.getElementById('maPropTitle').textContent = currentDefinition().singular + 'を追加';
        document.getElementById('maPropSub').textContent = '必須項目を入力して保存します。';
        document.getElementById('maToggleActiveBtn').hidden = true;
        setPanelMode('detail');
        renderTable();
        var first = document.querySelector('#maFields input, #maFields select, #maFields textarea');
        if (first) first.focus();
    }

    function readFormValues() {
        var values = {};
        currentDefinition().fields.forEach(function (fieldDef) {
            var input = document.getElementById('maField-' + fieldDef.key);
            if (fieldDef.type === 'checkbox') values[fieldDef.key] = input.checked;
            else if (fieldDef.type === 'number') values[fieldDef.key] = input.value === '' ? 0 : Number(input.value);
            else values[fieldDef.key] = input.value.trim();
        });
        return values;
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
        var duplicate = findDuplicate(values);
        if (duplicate) {
            var duplicateInput = document.getElementById('maField-' + duplicate.field);
            duplicateInput.setCustomValidity(duplicate.message);
            duplicateInput.reportValidity();
            return;
        }
        document.querySelectorAll('#maFields input, #maFields select, #maFields textarea').forEach(function (input) {
            input.setCustomValidity('');
        });
        if (editorMode === 'new') {
            var newItem = Object.assign(baseRecord(nextLocalId(), values.sortOrder || currentItems().length + 1), values);
            if (currentDefinition().normalize) newItem = currentDefinition().normalize(newItem);
            currentItems().push(newItem);
            selectedId = newItem.id;
        } else {
            var item = currentItems().find(function (row) { return row.id === selectedId; });
            if (!item) return;
            Object.assign(item, values);
            if (currentDefinition().normalize) currentDefinition().normalize(item);
        }
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
                document.getElementById('maPropTitle').textContent = item.name || item.shortName || item.body || item.licensePlate || item.cardLabel || currentDefinition().singular;
                document.getElementById('maPropSub').textContent = item.code || item.vehicleCode || item.date || '';
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

    function bindEvents() {
        document.getElementById('maSearch').addEventListener('input', renderTable);
        document.getElementById('maNewBtn').addEventListener('click', startNew);
        document.getElementById('maMasterForm').addEventListener('submit', submitItem);
        document.getElementById('maToggleActiveBtn').addEventListener('click', toggleActive);
        document.getElementById('maFields').addEventListener('input', function (event) { event.target.setCustomValidity(''); });
        document.getElementById('maSideNav').addEventListener('click', function (event) {
            var button = event.target.closest('[data-master]');
            if (button && !button.disabled) switchMaster(button.getAttribute('data-master'), true);
        });
        document.getElementById('maTableBody').addEventListener('click', function (event) {
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
