        // === テーマ切替 ===
        function toggleTheme() {
            const html = document.documentElement;
            const isDark = html.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme_v2', newTheme);
            var btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = isDark ? '🌙 Dark' : '☀️ Light';
        }
        (function initTheme() {
            var saved = localStorage.getItem('theme_v2');
            if (saved === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        })();

        // グループ会社データ
        // 【本番】DBのグループ会社マスターから動的に取得。背景色はユーザー設定テーブルから読み込み
        const groupCompaniesData = [
            { id: 1, code: 'touo', name: '東央警備', shortName: '東央', rowClass: 'gc-row-touo' },
            { id: 2, code: 'nikkei', name: 'Nikkeiホールディングス', shortName: 'Nikkei', rowClass: 'gc-row-nikkei' },
            { id: 3, code: 'zennihon', name: '全日本エンタープライズ', shortName: 'AJE', rowClass: 'gc-row-zennihon' }
        ];

        // 部署データ（会社コード → 部署リスト）
        // 【本番】DBの部署マスターから動的に取得
        const departmentsData = {
            touo:     [{ id: 'touo-shisetsu', name: '施設課' }, { id: 'touo-kotsu', name: '交通課' }],
            nikkei:   [{ id: 'nikkei-shisetsu', name: '施設課' }, { id: 'nikkei-kotsu', name: '交通課' }],
            zennihon: [{ id: 'zen-kotsu1', name: '交通一課' }, { id: 'zen-kotsu2', name: '交通二課' }]
        };

        // 社員データ（名前・所属会社・所属部署）
        // 【本番】DBの社員マスターから動的に取得
        const employeesData = [
            { name: '田中', company: 'touo', dept: 'touo-shisetsu' },
            { name: '佐藤', company: 'touo', dept: 'touo-shisetsu' },
            { name: '鈴木', company: 'touo', dept: 'touo-kotsu' },
            { name: '高橋', company: 'touo', dept: 'touo-kotsu' },
            { name: '伊藤', company: 'touo', dept: 'touo-shisetsu' },
            { name: '林',   company: 'touo', dept: 'touo-shisetsu' },
            { name: '斎藤', company: 'touo', dept: 'touo-kotsu' },
            { name: '池田', company: 'touo', dept: 'touo-shisetsu' },
            { name: '橋本', company: 'touo', dept: 'touo-kotsu' },
            { name: '山本', company: 'nikkei', dept: 'nikkei-shisetsu' },
            { name: '中村', company: 'nikkei', dept: 'nikkei-shisetsu' },
            { name: '小林', company: 'nikkei', dept: 'nikkei-kotsu' },
            { name: '渡辺', company: 'nikkei', dept: 'nikkei-kotsu' },
            { name: '加藤', company: 'nikkei', dept: 'nikkei-shisetsu' },
            { name: '清水', company: 'nikkei', dept: 'nikkei-kotsu' },
            { name: '山口', company: 'nikkei', dept: 'nikkei-shisetsu' },
            { name: '阿部', company: 'nikkei', dept: 'nikkei-shisetsu' },
            { name: '吉田', company: 'zennihon', dept: 'zen-kotsu1' },
            { name: '山田', company: 'zennihon', dept: 'zen-kotsu1' },
            { name: '松本', company: 'zennihon', dept: 'zen-kotsu2' },
            { name: '井上', company: 'zennihon', dept: 'zen-kotsu2' },
            { name: '木村', company: 'zennihon', dept: 'zen-kotsu1' },
            { name: '森',   company: 'zennihon', dept: 'zen-kotsu2' },
            { name: '石川', company: 'zennihon', dept: 'zen-kotsu1' },
            { name: '前田', company: 'zennihon', dept: 'zen-kotsu2' }
        ];

        // 車両データ（ナンバー・車種・所有者）
        // 【本番】DBの車両マスターから動的に取得
        const vehiclesData = [
            { plate: 'さ 3078', model: 'ハイエース', owner: 'touo' },
            { plate: 'わ 2490', model: 'キャラバン', owner: 'touo' },
            { plate: 'く 7521', model: 'プロボックス', owner: 'nikkei' },
            { plate: 'あ 1234', model: 'ハイエース', owner: 'touo' },
            { plate: 'か 5678', model: 'キャンター', owner: 'nikkei' },
            { plate: 'た 9012', model: 'エルフ', owner: 'touo' },
        ];

        // ETCカードデータ
        // 【本番】DBのETCカードマスターから動的に取得
        const etcCardsData = [
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

        // サイドパネル状態
        const spState = {
            activeTab: 'all',
            expandedCompanies: new Set(),
            mainTab: 'employee'
        };

        // サンプルデータ（契約先/元請け先）
        const companiesData = [
            { id: 1, name: '〇〇株式会社' },
            { id: 2, name: '△△建設' },
            { id: 3, name: '□□イベント' },
            { id: 4, name: '西日本高速道路' },
            { id: 5, name: '◇◇工業' },
            { id: 6, name: 'ABC警備' },
            { id: 7, name: '東央警備' },
            { id: 8, name: '西日本高速道路エンジニアリング四国' }
        ];

        // サンプルデータ（現場：階層構造対応）
        const sitesData = {
            1: [
                { id: 101, name: '〇〇ビル', hierarchyDepth: 2, subItems: [
                    { id: 1001, name: '巡回警備', subItems: [] },
                    { id: 1002, name: '夜間警備', subItems: [] }
                ]},
                { id: 103, name: '本社', hierarchyDepth: 2, subItems: [
                    { id: 1003, name: '受付警備', subItems: [] }
                ]}
            ],
            2: [
                { id: 201, name: '国道〇号線', hierarchyDepth: 2, subItems: [
                    { id: 2001, name: '舗装工事', subItems: [] }
                ]},
                { id: 202, name: '県道△号', hierarchyDepth: 2, subItems: [
                    { id: 2002, name: '橋梁工事', subItems: [] }
                ]}
            ],
            3: [
                { id: 301, name: '〇〇会館 展示会', hierarchyDepth: 1, subItems: [] },
                { id: 302, name: '〇〇アリーナ コンサート', hierarchyDepth: 1, subItems: [] }
            ],
            4: [
                { id: 401, name: '24-1234', hierarchyDepth: 3, subItems: [
                    { id: 4001, name: '〇〇橋補修工事', subItems: [
                        { id: 40001, name: '点検作業' },
                        { id: 40002, name: '清掃作業' }
                    ]}
                ]},
                { id: 402, name: '24-5678', hierarchyDepth: 3, subItems: [
                    { id: 4002, name: 'トンネル清掃', subItems: [
                        { id: 40003, name: '日常清掃' }
                    ]}
                ]}
            ],
            5: [
                { id: 501, name: '県道〇号', hierarchyDepth: 2, subItems: [
                    { id: 5001, name: '夜間規制', subItems: [] }
                ]},
                { id: 502, name: '工場前', hierarchyDepth: 2, subItems: [
                    { id: 5002, name: '交通整理', subItems: [] }
                ]}
            ],
            6: [],
            7: [],
            8: []
        };

        // 連絡選択肢データ
        const contactsData = [
            { id: 1, name: '会社' },
            { id: 2, name: '直' },
            { id: 3, name: 'LINE' }
        ];

        // --- Undo/Redo ---
        const undoStack = [];
        const redoStack = [];
        const MAX_HISTORY = 50;

        function cloneGridState() {
            const tbody = document.querySelector('.grid-table tbody');
            return {
                tbodyHTML: tbody ? tbody.innerHTML : '',
                companiesData: JSON.parse(JSON.stringify(companiesData)),
                sitesData: JSON.parse(JSON.stringify(sitesData)),
                employeeContactItems: typeof employeeContactItems !== 'undefined'
                    ? JSON.parse(JSON.stringify(employeeContactItems)) : [],
                vehicleList: typeof vehicleList !== 'undefined'
                    ? JSON.parse(JSON.stringify(vehicleList)) : [],
            };
        }

        function restoreGridState(snapshot) {
            const tbody = document.querySelector('.grid-table tbody');
            if (tbody) tbody.innerHTML = snapshot.tbodyHTML;
            companiesData.length = 0;
            snapshot.companiesData.forEach(c => companiesData.push(c));
            Object.keys(sitesData).forEach(k => delete sitesData[k]);
            Object.assign(sitesData, JSON.parse(JSON.stringify(snapshot.sitesData)));
            if (typeof employeeContactItems !== 'undefined') {
                employeeContactItems.length = 0;
                snapshot.employeeContactItems.forEach(i => employeeContactItems.push(i));
            }
            if (typeof vehicleList !== 'undefined') {
                vehicleList.length = 0;
                snapshot.vehicleList.forEach(v => vehicleList.push(v));
            }
            selectedGridRow = null;
            updateEmployeeListStatus();
        }

        function pushUndo() {
            undoStack.push(cloneGridState());
            if (undoStack.length > MAX_HISTORY) undoStack.shift();
            redoStack.length = 0;
            updateUndoRedoButtons();
        }

        function undo() {
            if (undoStack.length === 0) return;
            redoStack.push(cloneGridState());
            restoreGridState(undoStack.pop());
            updateUndoRedoButtons();
        }

        function redo() {
            if (redoStack.length === 0) return;
            undoStack.push(cloneGridState());
            restoreGridState(redoStack.pop());
            updateUndoRedoButtons();
        }

        function updateUndoRedoButtons() {
            const undoBtn = document.getElementById('undoBtn');
            const redoBtn = document.getElementById('redoBtn');
            if (undoBtn) undoBtn.disabled = undoStack.length === 0;
            if (redoBtn) redoBtn.disabled = redoStack.length === 0;
        }

        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
        });

        // Combobox管理
        class Combobox {
            constructor(containerId, options = {}) {
                this.container = document.getElementById(containerId);
                this.input = this.container.querySelector('.combobox-input');
                this.dropdown = this.container.querySelector('.combobox-dropdown');
                this.toggle = this.container.querySelector('.combobox-toggle');
                this.clear = this.container.querySelector('.combobox-clear');

                this.items = options.items || [];
                this.selectedItem = null;
                this.highlightedIndex = -1;
                this.onSelect = options.onSelect || (() => {});
                this.onAddNew = options.onAddNew || (() => {});
                this.allowAddNew = options.allowAddNew !== false;

                this.init();
            }

            init() {
                this.input.addEventListener('input', () => this.onInput());
                this.input.addEventListener('focus', () => this.open());
                this.input.addEventListener('keydown', (e) => this.onKeydown(e));
                this.toggle.addEventListener('click', () => this.toggleDropdown());
                this.clear.addEventListener('click', () => this.clearSelection());

                document.addEventListener('click', (e) => {
                    if (!this.container.contains(e.target)) {
                        this.close();
                    }
                });
            }

            setItems(items) {
                this.items = items;
                this.render();
            }

            onInput() {
                this.highlightedIndex = -1;
                this.render();
                this.open();
                this.updateClearButton();
            }

            render() {
                const query = this.input.value.toLowerCase().trim();
                let html = '';

                const filteredItems = this.items.filter(item =>
                    item.name.toLowerCase().includes(query)
                );

                if (filteredItems.length === 0 && !query) {
                    html = '<div class="combobox-no-results">リストが空です</div>';
                } else if (filteredItems.length === 0) {
                    html = '<div class="combobox-no-results">該当なし</div>';
                } else {
                    filteredItems.forEach((item, index) => {
                        const isSelected = this.selectedItem && this.selectedItem.id === item.id;
                        const isHighlighted = index === this.highlightedIndex;
                        const displayName = query ? this.highlightMatch(item.name, query) : item.name;

                        html += `<div class="combobox-option${isSelected ? ' selected' : ''}${isHighlighted ? ' highlighted' : ''}"
                                     data-id="${item.id}" data-index="${index}">
                                    <span class="combobox-option-icon">${isSelected ? '✓' : ''}</span>
                                    <span>${displayName}</span>
                                 </div>`;
                    });
                }

                // 新規追加オプション
                if (this.allowAddNew && query && !filteredItems.some(item => item.name.toLowerCase() === query)) {
                    html += `<div class="combobox-add-new" data-action="add-new">
                                <span class="combobox-add-new-icon"><img src="mockup/icons/plus.svg" class="ob-icon"></span>
                                <span>「${this.escapeHtml(this.input.value)}」を新規登録</span>
                             </div>`;
                }

                this.dropdown.innerHTML = html;

                // クリックイベント
                this.dropdown.querySelectorAll('.combobox-option').forEach(option => {
                    option.addEventListener('click', () => {
                        const id = parseInt(option.dataset.id);
                        const item = this.items.find(i => i.id === id);
                        if (item) this.select(item);
                    });
                });

                const addNewBtn = this.dropdown.querySelector('.combobox-add-new');
                if (addNewBtn) {
                    addNewBtn.addEventListener('click', () => this.addNew());
                }
            }

            highlightMatch(text, query) {
                const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
                return text.replace(regex, '<span class="combobox-match">$1</span>');
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            escapeRegex(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }

            select(item) {
                this.selectedItem = item;
                this.input.value = item.name;
                this.close();
                this.updateClearButton();
                this.onSelect(item);
            }

            addNew() {
                const newName = this.input.value.trim();
                if (!newName) return;

                const newId = Math.max(...this.items.map(i => i.id), 0) + 1;
                const newItem = { id: newId, name: newName };

                this.items.push(newItem);
                this.select(newItem);
                this.onAddNew(newItem);
            }

            clearSelection() {
                this.selectedItem = null;
                this.input.value = '';
                this.updateClearButton();
                this.render();
                this.input.focus();
                this.onSelect(null);
            }

            updateClearButton() {
                if (this.input.value) {
                    this.clear.classList.add('visible');
                } else {
                    this.clear.classList.remove('visible');
                }
            }

            open() {
                if (this.input.disabled) return;
                this.render();
                this.dropdown.classList.add('open');
            }

            close() {
                this.dropdown.classList.remove('open');
                this.highlightedIndex = -1;
            }

            toggleDropdown() {
                if (this.dropdown.classList.contains('open')) {
                    this.close();
                } else {
                    this.input.focus();
                    this.open();
                }
            }

            onKeydown(e) {
                const options = this.dropdown.querySelectorAll('.combobox-option');

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.highlightedIndex = Math.min(this.highlightedIndex + 1, options.length - 1);
                    this.render();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
                    this.render();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.highlightedIndex >= 0 && options[this.highlightedIndex]) {
                        options[this.highlightedIndex].click();
                    }
                } else if (e.key === 'Escape') {
                    this.close();
                }
            }

            enable() {
                this.input.disabled = false;
                this.input.placeholder = '入力して検索、またはリストから選択...';
            }

            disable() {
                this.input.disabled = true;
                this.input.placeholder = '会社を選択してから入力...';
                this.clearSelection();
            }
        }

        // Comboboxインスタンス
        let companyCombobox, siteNameCombobox, contactCombobox;
        // 動的追加項目のComboboxリスト
        let subItemComboboxes = [];
        let subItemIdCounter = 0;

        // 連結表示名を生成
        function buildSiteDisplayName() {
            const parts = [];
            if (siteNameCombobox && siteNameCombobox.selectedItem) parts.push(siteNameCombobox.selectedItem.name);
            subItemComboboxes.forEach(cb => {
                if (cb.instance && cb.instance.selectedItem) parts.push(cb.instance.selectedItem.name);
            });
            return parts.join(' ');
        }

        // 業務管理計画書 業務名をリアルタイム更新（読み取り専用表示）
        function smUpdatePlanTaskName() {
            const parts = [];
            // 親: 現場名
            if (siteNameCombobox && siteNameCombobox.selectedItem) {
                parts.push(siteNameCombobox.selectedItem.name);
            }
            // 子: 業務詳細の各値
            const subTasks = smCollectSubTasks();
            if (subTasks && subTasks.length > 0) {
                subTasks.forEach(st => { if (st.value) parts.push(st.value); });
            }
            const el = document.getElementById('smPlanTaskName');
            if (!el) return;
            if (parts.length > 0) {
                el.className = 'ob-plan-name-value';
                el.innerHTML = parts.join(' <span class="ob-plan-arrow">›</span> ');
            } else {
                el.className = 'ob-plan-name-value ob-plan-empty';
                el.textContent = '現場名・業務詳細を入力すると自動生成されます';
            }
        }

        // 追加項目セクションのHTMLを生成してComboboxを初期化
        function addSubItemLevel() {
            const level = subItemComboboxes.length;
            const containerId = 'subItemCombobox_' + (subItemIdCounter++);
            const sectionId = containerId + '_section';

            const section = document.createElement('div');
            section.className = 'modal-section sub-item-section';
            section.id = sectionId;
            section.innerHTML =
                '<div class="sub-item-header">' +
                    '<label>追加項目 ' + (level + 1) + '</label>' +
                    '<button type="button" class="sub-item-remove-btn" onclick="removeSubItemLevel(\'' + sectionId + '\', \'' + containerId + '\')" title="この追加項目を削除">✕</button>' +
                '</div>' +
                '<div class="combobox-container" id="' + containerId + '">' +
                    '<input type="text" class="combobox-input" placeholder="入力して検索、またはリストから選択..." autocomplete="off">' +
                    '<button type="button" class="combobox-clear">✕</button>' +
                    '<button type="button" class="combobox-toggle">▼</button>' +
                    '<div class="combobox-dropdown"></div>' +
                '</div>';

            const container = document.getElementById('subItemsContainer');
            const addBtn = document.getElementById('addSubItemBtn');
            container.insertBefore(section, addBtn);

            // 親の選択状態からsubItemsを取得
            let parentItems = [];
            if (level === 0 && siteNameCombobox.selectedItem && siteNameCombobox.selectedItem.subItems) {
                parentItems = siteNameCombobox.selectedItem.subItems;
            } else if (level > 0 && subItemComboboxes[level - 1] && subItemComboboxes[level - 1].instance.selectedItem) {
                const parentSel = subItemComboboxes[level - 1].instance.selectedItem;
                parentItems = parentSel.subItems || [];
            }

            const cbInstance = new Combobox(containerId, {
                items: parentItems,
                allowAddNew: true,
                onSelect: (item) => {
                    clearSubItemsBelow(level);
                    smUpdatePlanTaskName();
                },
                onAddNew: (item) => {
                    item.subItems = [];
                    if (level === 0 && siteNameCombobox.selectedItem) {
                        siteNameCombobox.selectedItem.subItems.push(item);
                    } else if (level > 0 && subItemComboboxes[level - 1] && subItemComboboxes[level - 1].instance.selectedItem) {
                        const parent = subItemComboboxes[level - 1].instance.selectedItem;
                        if (!parent.subItems) parent.subItems = [];
                        parent.subItems.push(item);
                    }
                }
            });

            subItemComboboxes.push({ id: containerId, sectionId, instance: cbInstance });
            renumberSubItems();
        }

        function clearSubItemsBelow(level) {
            while (subItemComboboxes.length > level + 1) {
                const last = subItemComboboxes.pop();
                const sec = document.getElementById(last.sectionId);
                if (sec) sec.remove();
            }
            renumberSubItems();
        }

        function removeSubItemLevel(sectionId, containerId) {
            const idx = subItemComboboxes.findIndex(cb => cb.id === containerId);
            if (idx >= 0) {
                while (subItemComboboxes.length > idx) {
                    const last = subItemComboboxes.pop();
                    const sec = document.getElementById(last.sectionId);
                    if (sec) sec.remove();
                }
            }
            renumberSubItems();
            smUpdatePlanTaskName();
        }

        function clearAllSubItems() {
            subItemComboboxes.forEach(cb => {
                const sec = document.getElementById(cb.sectionId);
                if (sec) sec.remove();
            });
            subItemComboboxes = [];
        }

        function renumberSubItems() {
            subItemComboboxes.forEach((cb, i) => {
                const sec = document.getElementById(cb.sectionId);
                if (sec) {
                    const label = sec.querySelector('label');
                    if (label) label.textContent = '追加項目 ' + (i + 1);
                }
            });
        }

        // 初期化
        document.addEventListener('DOMContentLoaded', function() {
            companyCombobox = new Combobox('companyCombobox', {
                items: companiesData,
                allowAddNew: true,
                onSelect: (item) => {
                    if (item) {
                        siteNameCombobox.enable();
                        siteNameCombobox.setItems(sitesData[item.id] || []);
                    } else {
                        siteNameCombobox.disable();
                    }
                    clearAllSubItems();
                },
                onAddNew: (item) => {
                    console.log('新規会社登録:', item);
                    sitesData[item.id] = [];
                }
            });

            siteNameCombobox = new Combobox('siteNameCombobox', {
                items: [],
                allowAddNew: true,
                onSelect: (item) => {
                    clearAllSubItems();
                    smUpdatePlanTaskName();
                },
                onAddNew: (item) => {
                    item.subItems = [];
                    if (companyCombobox.selectedItem) {
                        sitesData[companyCombobox.selectedItem.id].push(item);
                    }
                }
            });

            if (document.getElementById('contactCombobox')) {
                contactCombobox = new Combobox('contactCombobox', {
                    items: contactsData,
                    allowAddNew: false,
                    onSelect: (item) => {
                        if (item) {
                            console.log('連絡選択:', item);
                        }
                    }
                });
            }

            // カラー設定パネル: カラーピッカー変更時にCSS変数を即時更新
            // グループ会社（従来の直接CSS変数ピッカー）
            document.querySelectorAll('.color-setting-picker:not(.color-base-picker)').forEach(picker => {
                picker.addEventListener('input', function() {
                    const cssVar = this.dataset.cssVar;
                    document.documentElement.style.setProperty(cssVar, this.value);
                    const hexLabel = document.querySelector('.color-setting-hex[data-css-var="' + cssVar + '"]');
                    if (hexLabel) hexLabel.value = this.value;
                });
            });
            // ベース色ピッカー（区分・シフト: 背景・文字を自動生成）
            document.querySelectorAll('.color-base-picker').forEach(picker => {
                picker.addEventListener('input', function() {
                    const baseKey = this.dataset.baseKey;
                    applyBaseColor(baseKey, this.value);
                    const hexLabel = document.querySelector('.color-setting-hex[data-base-key="' + baseKey + '"]');
                    if (hexLabel) hexLabel.value = this.value;
                });
            });

            // プリセットカラーパレット: 最後にクリックしたピッカーを追跡
            let lastActivePicker = null;
            document.querySelectorAll('.color-setting-picker, .color-base-picker').forEach(picker => {
                picker.addEventListener('click', function() { lastActivePicker = this; });
                picker.addEventListener('input', function() { lastActivePicker = this; });
            });
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.addEventListener('click', function() {
                    if (!lastActivePicker) return;
                    lastActivePicker.value = this.dataset.color;
                    lastActivePicker.dispatchEvent(new Event('input'));
                });
            });

            // Hex入力フィールドからカラーピッカーへの逆同期
            document.querySelectorAll('.color-setting-hex').forEach(hexInput => {
                hexInput.addEventListener('change', function() {
                    let val = this.value.trim();
                    if (!val.startsWith('#')) val = '#' + val;
                    if (!/^#[0-9a-fA-F]{6}$/.test(val)) return;
                    this.value = val;
                    const cssVar = this.dataset.cssVar;
                    const baseKey = this.dataset.baseKey;
                    if (cssVar) {
                        const picker = document.querySelector('.color-setting-picker[data-css-var="' + cssVar + '"]');
                        if (picker) { picker.value = val; picker.dispatchEvent(new Event('input')); }
                    } else if (baseKey) {
                        const picker = document.querySelector('.color-base-picker[data-base-key="' + baseKey + '"]');
                        if (picker) { picker.value = val; picker.dispatchEvent(new Event('input')); }
                    }
                });
            });

            loadColorPresetsFromStorage();

            // テーマボタン初期テキスト
            var themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                themeBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
            }
        });

        // 現場詳細モーダルの開閉
        let currentSiteCell = null;

        function openSiteModal(cell) {
            currentSiteCell = cell;
            const row = cell.closest('tr');

            // === チップ復元 ===
            // 会社
            const gcCode = cell.getAttribute('data-group-company');
            let branchName = null;
            if (gcCode) {
                const gc = groupCompaniesData.find(g => g.code === gcCode);
                if (gc) branchName = gc.name;
            }
            // 区分
            const categoryBadge = cell.querySelector('.category-badge');
            const categoryName = categoryBadge ? categoryBadge.textContent.trim() : null;
            // 昼夜
            const shiftBadge = cell.querySelector('.shift-badge');
            const shiftName = shiftBadge ? shiftBadge.textContent.trim() : null;

            smChipSelected = { branch: branchName, category: categoryName, shift: shiftName };
            smRenderChips('smBranchChips', branchList, branchName, 'branch');
            smRenderChips('smCategoryChips', smGetCategoryList(), categoryName, 'category');
            smRenderChips('smShiftChips', shiftList, shiftName, 'shift');

            // === コンボボックス復元 ===
            clearAllSubItems();
            const companyId = cell.dataset.companyId ? parseInt(cell.dataset.companyId) : null;
            const siteId = cell.dataset.siteId ? parseInt(cell.dataset.siteId) : null;
            if (companyId) {
                const companyItem = companiesData.find(c => c.id === companyId);
                if (companyItem) {
                    companyCombobox.select(companyItem);
                    const sites = sitesData[companyId] || [];
                    let siteItem = null;
                    if (siteId) {
                        siteItem = sites.find(s => s.id === siteId);
                    }
                    if (!siteItem) {
                        // siteIdが無い場合、セルのテキストから前方一致で照合
                        const siteText = cell.querySelector('.site-name');
                        if (siteText && siteText.textContent.trim()) {
                            const cellSiteName = siteText.textContent.trim();
                            siteItem = sites.find(s => cellSiteName.startsWith(s.name));
                        }
                    }
                    if (siteItem) {
                        setTimeout(() => siteNameCombobox.select(siteItem), 0);
                    }
                }
            } else {
                // コンボボックスにセルのテキストを表示（IDが無い場合）
                const companyText = cell.querySelector('.company');
                if (companyText && companyText.textContent.trim()) {
                    const found = companiesData.find(c => c.name === companyText.textContent.trim());
                    if (found) {
                        companyCombobox.select(found);
                        const siteText = cell.querySelector('.site-name');
                        if (siteText && siteText.textContent.trim()) {
                            const sites = sitesData[found.id] || [];
                            const siteFound = sites.find(s => s.name === siteText.textContent.trim());
                            if (siteFound) {
                                setTimeout(() => siteNameCombobox.select(siteFound), 0);
                            }
                        }
                    }
                }
            }

            // === data属性の非表示フィールド ===
            document.getElementById('smSupervisor').value = cell.dataset.supervisor || '';
            document.getElementById('smSupervisorTel').value = cell.dataset.supervisorTel || '';

            // 業務詳細（サブタスク）
            let subTasks = [];
            if (cell.dataset.subTasks) {
                try { subTasks = JSON.parse(cell.dataset.subTasks); } catch(e) {}
            }
            smRenderSubTaskEntries(subTasks);

            // === バッジ初期化（区分連動） ===
            smBadgeSnapshot = JSON.parse(JSON.stringify(smBadgeDefinitions));
            let badgeChildIds = [];
            let badgeGcMap = {};
            if (cell.dataset.badgeData) {
                try {
                    const bd = JSON.parse(cell.dataset.badgeData);
                    badgeChildIds = bd.childIds || [];
                    badgeGcMap = bd.grandchildMap || {};
                } catch(e) {}
            }
            smRenderBadgeSection(categoryName, badgeChildIds, badgeGcMap);

            // 現場監督候補
            smRenderSupervisorCandidates();

            // 業務名プレビュー（コンボボックス選択完了後に更新）
            setTimeout(() => smUpdatePlanTaskName(), 50);

            document.getElementById('siteModal').classList.add('active');
        }

        function closeSiteModal() {
            // バッジ定義をキャンセル復元
            if (smBadgeSnapshot) {
                smBadgeDefinitions.length = 0;
                smBadgeSnapshot.forEach(b => smBadgeDefinitions.push(b));
                smBadgeSnapshot = null;
            }
            document.getElementById('siteModal').classList.remove('active');
            closeTimePicker();
        }

        function saveSiteModal() {
            pushUndo();

            // チップからの取得
            const branch = smChipSelected.branch;
            const category = smChipSelected.category;
            const shift = smChipSelected.shift;

            // 数値
            const meetingTimeEl = document.getElementById('smMeetingTime');
            const meetingTime = meetingTimeEl ? meetingTimeEl.value : '';
            const meetingPlaceEl = document.getElementById('smMeetingPlace');
            const meetingPlace = meetingPlaceEl ? meetingPlaceEl.value : '';
            const requiredCountEl = document.getElementById('smRequiredCount');
            const requiredCount = requiredCountEl ? requiredCountEl.value : '';
            const contact = contactCombobox ? contactCombobox.selectedItem : null;

            // コンボボックス
            const company = companyCombobox.selectedItem;
            const site = siteNameCombobox.selectedItem;
            const subItems = subItemComboboxes.map(cb => cb.instance.selectedItem).filter(Boolean);
            const displayName = buildSiteDisplayName();

            // 新規フィールド
            const subTasks = smCollectSubTasks();
            const badgeData = smGetSelectedBadgeData();
            const supervisor = document.getElementById('smSupervisor').value;
            const supervisorTel = document.getElementById('smSupervisorTel').value;
            const notesEl = document.getElementById('smNotes');
            const notes = notesEl ? notesEl.value : '';

            // === セルへの反映 ===
            if (currentSiteCell) {
                const row = currentSiteCell.closest('tr');

                // --- site-info 構造を確保 ---
                let siteInfo = currentSiteCell.querySelector('.site-info');
                if (!siteInfo) {
                    siteInfo = document.createElement('div');
                    siteInfo.className = 'site-info';
                    siteInfo.innerHTML = '<div class="site-badges"></div><div class="site-details"><div class="company"></div><div class="site-name"></div></div>';
                    currentSiteCell.insertBefore(siteInfo, currentSiteCell.firstChild);
                }
                const badges = siteInfo.querySelector('.site-badges');
                const details = siteInfo.querySelector('.site-details');

                // --- 会社背景色 ---
                const currentRow = currentSiteCell.closest('tr');
                groupCompaniesData.forEach(g => currentRow.classList.remove(g.rowClass));
                currentSiteCell.removeAttribute('data-group-company');
                currentSiteCell.removeAttribute('data-gc-name');
                if (branch) {
                    const gc = groupCompaniesData.find(g => g.name === branch);
                    if (gc) {
                        currentRow.classList.add(gc.rowClass);
                        currentSiteCell.setAttribute('data-group-company', gc.code);
                        currentSiteCell.setAttribute('data-gc-name', gc.name);
                    }
                }

                // --- 昼夜バッジ ---
                let shiftEl = badges.querySelector('.shift-badge');
                if (shift) {
                    if (!shiftEl) {
                        shiftEl = document.createElement('span');
                        shiftEl.className = 'shift-badge';
                        badges.insertBefore(shiftEl, badges.firstChild);
                    }
                    shiftEl.textContent = shift;
                    shiftEl.classList.remove('shift-day', 'shift-night');
                    const shiftCls = smShiftClassMap[shift];
                    if (shiftCls) shiftEl.classList.add(shiftCls);
                    // 行背景連動
                    if (row) {
                        if (shift === '夜') row.classList.add('row-night');
                        else row.classList.remove('row-night');
                    }
                } else if (shiftEl) {
                    shiftEl.remove();
                }

                // --- 区分バッジ ---
                let catEl = badges.querySelector('.category-badge');
                if (category) {
                    if (!catEl) {
                        catEl = document.createElement('span');
                        catEl.className = 'category-badge';
                        badges.appendChild(catEl);
                    }
                    catEl.textContent = category;
                    // 全 category-* クラスを除去
                    [...catEl.classList].filter(c => c.startsWith('category-') && c !== 'category-badge').forEach(c => catEl.classList.remove(c));
                    const catCls = smCategoryClassMap[category];
                    if (catCls) catEl.classList.add(catCls);
                } else if (catEl) {
                    catEl.remove();
                }

                // --- 契約先 ---
                const companyEl = details.querySelector('.company');
                if (companyEl) companyEl.textContent = company ? company.name : '';

                // --- 現場名 ---
                const siteNameDiv = details.querySelector('.site-name');
                if (siteNameDiv) siteNameDiv.textContent = displayName || '';

                // --- 現場監督バッジ ---
                let svBadge = details.querySelector('.supervisor-badge');
                if (supervisor) {
                    if (!svBadge) {
                        svBadge = document.createElement('div');
                        svBadge.className = 'supervisor-badge';
                        details.appendChild(svBadge);
                    }
                    svBadge.textContent = supervisor + (supervisorTel ? ' ' + supervisorTel : '');
                } else if (svBadge) {
                    svBadge.remove();
                }

                // --- data属性保存（コンボボックスID） ---
                if (company) currentSiteCell.dataset.companyId = company.id;
                else delete currentSiteCell.dataset.companyId;
                if (site) currentSiteCell.dataset.siteId = site.id;
                else delete currentSiteCell.dataset.siteId;

                // --- data属性保存（非表示フィールド） ---
                if (meetingPlace) currentSiteCell.dataset.meetingPlace = meetingPlace;
                else delete currentSiteCell.dataset.meetingPlace;
                if (supervisor) currentSiteCell.dataset.supervisor = supervisor;
                else delete currentSiteCell.dataset.supervisor;
                if (supervisorTel) currentSiteCell.dataset.supervisorTel = supervisorTel;
                else delete currentSiteCell.dataset.supervisorTel;
                if (subTasks.length > 0) currentSiteCell.dataset.subTasks = JSON.stringify(subTasks);
                else delete currentSiteCell.dataset.subTasks;
                if (badgeData.parentId) currentSiteCell.dataset.badgeData = JSON.stringify(badgeData);
                else delete currentSiteCell.dataset.badgeData;

                // --- 行内の他セル更新 ---
                if (row) {
                    const cells = row.querySelectorAll('td');

                    // 集合時間・連絡 (index 2)
                    const meetingCell = cells[2];
                    if (meetingCell) {
                        let timeDisp = meetingCell.querySelector('.time-display');
                        let contactEl = meetingCell.querySelector('.contact-badge');
                        if (meetingTime) {
                            if (!timeDisp) {
                                timeDisp = document.createElement('span');
                                timeDisp.className = 'time-display';
                                meetingCell.insertBefore(timeDisp, meetingCell.firstChild);
                            }
                            timeDisp.textContent = meetingTime;
                        } else if (timeDisp) {
                            timeDisp.textContent = '';
                        }
                        if (contact) {
                            if (!contactEl) {
                                contactEl = document.createElement('span');
                                contactEl.className = 'contact-badge';
                                meetingCell.appendChild(contactEl);
                            }
                            contactEl.textContent = contact.name;
                            // contactクラス更新
                            [...contactEl.classList].filter(c => c.startsWith('contact-') && c !== 'contact-badge').forEach(c => contactEl.classList.remove(c));
                            const empContact = employeeContactItems.find(ec => ec.name === contact.name);
                            if (empContact) contactEl.classList.add(empContact.cssClass);
                        } else if (contactEl) {
                            contactEl.remove();
                        }
                    }

                    // 必要人数 (index 4)
                    const countCell = cells[4];
                    if (countCell) {
                        let countDisp = countCell.querySelector('.count-display');
                        if (countDisp) {
                            const countText = countDisp.textContent.trim();
                            const match = countText.match(/(\d+)\/\d+/);
                            const assigned = match ? parseInt(match[1]) : 0;
                            const required = parseInt(requiredCount) || 1;
                            countDisp.textContent = `${assigned}/${required}`;
                            countDisp.classList.remove('count-ok', 'count-shortage', 'count-excess');
                            const isShort = assigned < required;
                            const isExc = assigned > required;
                            countDisp.classList.add(isShort ? 'count-shortage' : isExc ? 'count-excess' : 'count-ok');
                            let sBadge = countCell.querySelector('.count-shortage-badge');
                            if (isShort) {
                                if (!sBadge) { sBadge = document.createElement('span'); sBadge.className = 'count-shortage-badge'; sBadge.textContent = '不足'; countCell.appendChild(sBadge); }
                            } else if (sBadge) { sBadge.remove(); }
                            let eBadge = countCell.querySelector('.count-excess-badge');
                            if (isExc) {
                                if (!eBadge) { eBadge = document.createElement('span'); eBadge.className = 'count-excess-badge'; eBadge.textContent = '過多'; countCell.appendChild(eBadge); }
                            } else if (eBadge) { eBadge.remove(); }
                        }
                    }

                    // 作業内容 (col-badge)
                    const badgeCell = row.querySelector('.col-badge');
                    if (badgeCell) {
                        badgeCell.innerHTML = smBuildBadgeDisplayHtml(badgeData);
                    }

                    // 備考 (col-notes) — vtItems内の集合場所を同期
                    const notesCell = row.querySelector('.col-notes');
                    if (notesCell) {
                        let existingVtItems = [];
                        try { if (notesCell.dataset.vtItems) existingVtItems = JSON.parse(notesCell.dataset.vtItems); } catch(e) {}
                        // 集合場所を vtItems 内で更新
                        const mpIdx = existingVtItems.findIndex(i => i.label === '集合場所');
                        if (meetingPlace) {
                            if (mpIdx >= 0) existingVtItems[mpIdx].value = meetingPlace;
                            else existingVtItems.push({ label: '集合場所', value: meetingPlace, base: '#44A6B5', bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A' });
                        } else if (mpIdx >= 0) {
                            existingVtItems.splice(mpIdx, 1);
                        }
                        notesCell.dataset.vtItems = existingVtItems.length > 0 ? JSON.stringify(existingVtItems) : '';
                        ntRenderNotesCell(notesCell, existingVtItems);
                    }
                }
            }

            // バッジスナップショットをクリア（保存成功）
            smBadgeSnapshot = null;

            console.log('保存データ:', {
                branch, category, shift, meetingTime, meetingPlace,
                requiredCount, supervisor, supervisorTel,
                contact: contact ? contact.name : null,
                company: company ? company.name : null,
                site: site ? site.name : null,
                subItems: subItems.map(s => s.name),
                displayName,
                subTasks, badgeData, notes
            });

            document.getElementById('siteModal').classList.remove('active');
            closeTimePicker();
        }

        document.getElementById('siteModal').addEventListener('click', function(e) {
            if (e.target === this) closeSiteModal();
        });

        // ============================================
        // 集合モーダル
        // ============================================
        let currentMeetingCell = null;
        let mtSelectedContact = null;

        function openMeetingModal(cell, event) {
            event.stopPropagation();
            currentMeetingCell = cell;
            const row = cell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            // セルから現在値を読み取り
            const timeDisp = cell.querySelector('.time-display');
            document.getElementById('mtMeetingTime').value = timeDisp ? timeDisp.textContent.trim() : '';

            const contactBadge = cell.querySelector('.contact-badge');
            mtSelectedContact = contactBadge ? contactBadge.textContent.trim() : null;

            mtRenderContactChips();
            document.getElementById('meetingModal').classList.add('active');
        }

        function mtRenderContactChips() {
            const container = document.getElementById('mtContactChips');
            let html = '';
            employeeContactItems.forEach(item => {
                const active = mtSelectedContact === item.name ? ' ob-chip-active' : '';
                html += `<button type="button" class="ob-row-chip${active}" onclick="mtSelectContact('${escapeHtml(item.name)}')">${escapeHtml(item.name)}</button>`;
            });
            container.innerHTML = html;
        }

        function mtSelectContact(name) {
            // トグル: 同じものを再クリックで解除
            mtSelectedContact = mtSelectedContact === name ? null : name;
            mtRenderContactChips();
        }

        function mtAddContact() {
            const name = prompt('新しい連絡項目名を入力:');
            if (!name || !name.trim()) return;
            const trimmed = name.trim();
            if (employeeContactItems.some(i => i.name === trimmed)) {
                alert('同名の項目が既に存在します。');
                return;
            }
            const colorPalette = [
                { bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A', borderColor: 'rgba(68,166,181,0.3)' },
                { bg: 'rgba(56,161,105,0.12)', color: '#276749', borderColor: 'rgba(56,161,105,0.3)' },
                { bg: 'rgba(49,151,149,0.12)', color: '#285E61', borderColor: 'rgba(49,151,149,0.3)' },
                { bg: 'rgba(214,158,46,0.1)', color: '#975A16', borderColor: 'rgba(214,158,46,0.3)' },
                { bg: 'rgba(128,90,213,0.1)', color: '#6B46C1', borderColor: 'rgba(128,90,213,0.3)' }
            ];
            const idx = employeeContactItems.length % colorPalette.length;
            const colors = colorPalette[idx];
            const cssClass = 'contact-custom-' + employeeContactItems.length;
            employeeContactItems.push({
                name: trimmed, bg: colors.bg, color: colors.color,
                borderColor: colors.borderColor, cssClass: cssClass
            });
            mtSelectedContact = trimmed;
            mtRenderContactChips();
        }

        function saveMeetingModal() {
            pushUndo();
            if (!currentMeetingCell) return;
            const row = currentMeetingCell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            const meetingTime = document.getElementById('mtMeetingTime').value;

            // time-display 更新
            let timeDisp = currentMeetingCell.querySelector('.time-display');
            if (meetingTime) {
                if (!timeDisp) {
                    timeDisp = document.createElement('span');
                    timeDisp.className = 'time-display';
                    currentMeetingCell.insertBefore(timeDisp, currentMeetingCell.firstChild);
                }
                timeDisp.textContent = meetingTime;
            } else if (timeDisp) {
                timeDisp.textContent = '';
            }

            // contact-badge 更新
            let contactEl = currentMeetingCell.querySelector('.contact-badge');
            if (mtSelectedContact) {
                if (!contactEl) {
                    contactEl = document.createElement('span');
                    contactEl.className = 'contact-badge';
                    currentMeetingCell.appendChild(contactEl);
                }
                contactEl.textContent = mtSelectedContact;
                // CSSクラス更新
                [...contactEl.classList].filter(c => c.startsWith('contact-') && c !== 'contact-badge').forEach(c => contactEl.classList.remove(c));
                const empContact = employeeContactItems.find(ec => ec.name === mtSelectedContact);
                if (empContact) contactEl.classList.add(empContact.cssClass);
            } else if (contactEl) {
                contactEl.remove();
            }

            closeMeetingModal();
        }

        function closeMeetingModal() {
            document.getElementById('meetingModal').classList.remove('active');
            closeTimePicker();
            currentMeetingCell = null;
        }

        document.getElementById('meetingModal').addEventListener('click', function(e) {
            if (e.target === this) closeMeetingModal();
        });

        // ============================================
        // 作業内容・備考モーダル
        // ============================================
        let currentWorkCell = null;

        function openWorkModal(cell, event) {
            event.stopPropagation();
            currentWorkCell = cell;
            const row = cell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            // 区分を取得（バッジの親カテゴリ決定用）
            const categoryBadge = siteCell ? siteCell.querySelector('.category-badge') : null;
            const categoryName = categoryBadge ? categoryBadge.textContent.trim() : null;

            // バッジデータ復元
            smBadgeSnapshot = JSON.parse(JSON.stringify(smBadgeDefinitions));
            let badgeChildIds = [];
            let badgeGcMap = {};
            if (siteCell && siteCell.dataset.badgeData) {
                try {
                    const bd = JSON.parse(siteCell.dataset.badgeData);
                    badgeChildIds = bd.childIds || [];
                    badgeGcMap = bd.grandchildMap || {};
                } catch(e) {}
            }
            smRenderBadgeSection(categoryName, badgeChildIds, badgeGcMap);

            document.getElementById('workModal').classList.add('active');
        }

        function saveWorkModal() {
            pushUndo();
            if (!currentWorkCell) return;
            const row = currentWorkCell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            // バッジデータ保存
            const badgeData = smGetSelectedBadgeData();
            if (siteCell) {
                if (badgeData.parentId) siteCell.dataset.badgeData = JSON.stringify(badgeData);
                else delete siteCell.dataset.badgeData;
            }

            // col-badge セル更新
            currentWorkCell.innerHTML = smBuildBadgeDisplayHtml(badgeData);

            // スナップショットクリア（保存成功）
            smBadgeSnapshot = null;

            document.getElementById('workModal').classList.remove('active');
            currentWorkCell = null;
        }

        function closeWorkModal() {
            // バッジ定義をキャンセル復元
            if (smBadgeSnapshot) {
                smBadgeDefinitions.length = 0;
                smBadgeSnapshot.forEach(b => smBadgeDefinitions.push(b));
                smBadgeSnapshot = null;
            }
            document.getElementById('workModal').classList.remove('active');
            currentWorkCell = null;
        }

        document.getElementById('workModal').addEventListener('click', function(e) {
            if (e.target === this) closeWorkModal();
        });

        // ============================================
        // 送迎・備考モーダル（統合）
        // ============================================
        let currentNotesCell = null;
        let vtItems = [];
        let vtDragIndex = null;

        function openNotesModal(cell, event) {
            event.stopPropagation();
            currentNotesCell = cell;

            const row = cell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            // vtItems を dataset から読み取り
            vtItems = [];
            try {
                const stored = cell.dataset.vtItems;
                if (stored) vtItems = JSON.parse(stored);
            } catch (e) { vtItems = []; }

            // レガシーデータ移行: dataset にない場合、siteCell / DOM から復元
            if (vtItems.length === 0) {
                const mp = siteCell ? (siteCell.dataset.meetingPlace || '') : '';
                if (mp) vtItems.push({ label: '集合場所', value: mp, base: '#44A6B5', bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A' });
                const memoEl = cell.querySelector('.notes-memo');
                const memo = memoEl ? memoEl.textContent.replace(/^備考/, '').trim() : '';
                if (memo) vtItems.push({ label: '備考', value: memo, base: '#A0A0A0', bg: 'rgba(160,160,160,0.15)', color: '#6B7280' });
            }

            renderVtItems();
            document.getElementById('notesModal').classList.add('active');
        }

        function saveNotesModal() {
            pushUndo();
            if (!currentNotesCell) return;
            const row = currentNotesCell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            syncVtItemsFromDom();
            const validVtItems = vtItems.filter(item => item.label && item.value);

            // vtItems を dataset に保存
            currentNotesCell.dataset.vtItems = validVtItems.length > 0 ? JSON.stringify(validVtItems) : '';

            // 集合場所を siteCell.dataset に同期（現場詳細モーダルと共有）
            if (siteCell) {
                const mpItem = validVtItems.find(i => i.label === '集合場所');
                siteCell.dataset.meetingPlace = mpItem ? mpItem.value : '';
            }

            // セル表示更新
            ntRenderNotesCell(currentNotesCell, validVtItems);

            document.getElementById('notesModal').classList.remove('active');
            currentNotesCell = null;
            vtItems = [];
        }

        function ntRenderNotesCell(cell, items) {
            let html = '';
            if (items && items.length > 0) {
                items.forEach(item => {
                    html += `<div class="notes-transport" style="color:${item.color};"><span class="notes-label" style="background:${item.bg}; color:${item.color};">${escapeHtml(item.label)}</span>${escapeHtml(item.value)}</div>`;
                });
            }
            cell.innerHTML = html;
        }

        function closeNotesModal() {
            document.getElementById('notesModal').classList.remove('active');
            currentNotesCell = null;
            vtItems = [];
        }

        document.getElementById('notesModal').addEventListener('click', function(e) {
            if (e.target === this) closeNotesModal();
        });

        // --- 送迎アイテム管理（モーダル内） ---
        function syncVtItemsFromDom() {
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            rows.forEach((row, index) => {
                if (!vtItems[index]) return;
                const labelInput = row.querySelector('.vt-label-input');
                const valueInput = row.querySelector('.vt-value-input');
                const basePicker = row.querySelector('.vt-base-color');
                const textPicker = row.querySelector('.vt-text-color');
                if (labelInput) vtItems[index].label = labelInput.value.trim();
                if (valueInput) vtItems[index].value = valueInput.value.trim();
                if (basePicker) {
                    vtItems[index].base = basePicker.value;
                    const { bg } = deriveColors(basePicker.value);
                    vtItems[index].bg = bg;
                }
                if (textPicker) vtItems[index].color = textPicker.value;
            });
        }

        function renderVtItems() {
            const container = document.getElementById('vtModalItems');
            let html = '';
            vtItems.forEach((item, index) => {
                const baseHex = item.base || rgbToHex(item.bg);
                html += `<div class="vt-item-row" draggable="true" data-vt-index="${index}"
                              ondragstart="vtRowDragStart(event, ${index})"
                              ondragover="vtRowDragOver(event, ${index})"
                              ondragleave="vtRowDragLeave(event)"
                              ondrop="vtRowDrop(event, ${index})"
                              ondragend="vtRowDragEnd(event)">
                    <span class="vt-drag-handle" title="ドラッグで並べ替え">⠿</span>
                    <input type="text" class="vt-label-input" value="${escapeHtml(item.label)}" placeholder="項目名"
                           style="width: 80px; flex: none;">
                    <input type="text" class="vt-value-input" value="${escapeHtml(item.value)}" placeholder="内容">
                    <input type="color" class="vt-base-color" value="${baseHex}" title="ベース色" oninput="vtBaseColorChanged(${index}, this)">
                    <input type="color" class="vt-text-color" value="${rgbToHex(item.color)}" title="文字色">
                    <button class="vt-remove-btn" onclick="syncVtItemsFromDom(); removeVtItem(${index})">×</button>
                </div>`;
            });
            container.innerHTML = html;
        }

        function vtBaseColorChanged(index, picker) {
            const { bg, text } = deriveColors(picker.value);
            const row = picker.closest('.vt-item-row');
            const textPicker = row.querySelector('.vt-text-color');
            if (textPicker) textPicker.value = rgbToHex(text);
        }

        function vtRowDragStart(e, index) {
            vtDragIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            e.currentTarget.classList.add('vt-dragging');
            syncVtItemsFromDom();
        }

        function vtRowDragOver(e, index) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            rows.forEach(r => r.classList.remove('vt-drag-over'));
            if (index !== vtDragIndex) e.currentTarget.classList.add('vt-drag-over');
        }

        function vtRowDragLeave(e) {
            e.currentTarget.classList.remove('vt-drag-over');
        }

        function vtRowDrop(e, dropIndex) {
            e.preventDefault();
            e.currentTarget.classList.remove('vt-drag-over');
            if (vtDragIndex === null || vtDragIndex === dropIndex) return;
            const moved = vtItems.splice(vtDragIndex, 1)[0];
            vtItems.splice(dropIndex, 0, moved);
            vtDragIndex = null;
            renderVtItems();
        }

        function vtRowDragEnd(e) {
            e.currentTarget.classList.remove('vt-dragging');
            document.querySelectorAll('#vtModalItems .vt-item-row').forEach(r => r.classList.remove('vt-drag-over'));
            vtDragIndex = null;
        }

        function addVtPresetItem(label, base) {
            syncVtItemsFromDom();
            const { bg, text } = deriveColors(base);
            vtItems.push({ label: label, value: '', base: base, bg: bg, color: text });
            renderVtItems();
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                const inp = lastRow.querySelector('.vt-value-input');
                if (inp) inp.focus();
            }
        }

        function addVtEmptyItem() {
            syncVtItemsFromDom();
            const defaultBase = '#975A16';
            const { bg: emptyBg, text: emptyText } = deriveColors(defaultBase);
            vtItems.push({ label: '', value: '', base: defaultBase, bg: emptyBg, color: emptyText });
            renderVtItems();
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            const lastRow = rows[rows.length - 1];
            if (lastRow) lastRow.querySelector('.vt-label-input').focus();
        }

        function removeVtItem(index) {
            vtItems.splice(index, 1);
            renderVtItems();
        }

        // ============================================
        // 人数インライン編集
        // ============================================
        function startCountEdit(cell, event) {
            event.stopPropagation();
            const countDisp = cell.querySelector('.count-display');
            if (!countDisp || cell.querySelector('.count-inline-input')) return;

            const text = countDisp.textContent.trim();
            const match = text.match(/(\d+)\/(\d+)/);
            const assigned = match ? parseInt(match[1]) : 0;
            const required = match ? parseInt(match[2]) : 1;

            // 表示を 「配置済/」+ input に置き換え
            countDisp.textContent = assigned + '/';
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '99';
            input.value = required;
            input.className = 'count-inline-input';
            countDisp.appendChild(input);
            input.focus();
            input.select();

            function commitEdit() {
                const newRequired = parseInt(input.value) || 1;
                countDisp.textContent = `${assigned}/${newRequired}`;
                countDisp.classList.remove('count-ok', 'count-shortage', 'count-excess');
                const isShortage = assigned < newRequired;
                const isExcess = assigned > newRequired;
                countDisp.classList.add(isShortage ? 'count-shortage' : isExcess ? 'count-excess' : 'count-ok');
                let sBadge = cell.querySelector('.count-shortage-badge');
                if (isShortage) {
                    if (!sBadge) { sBadge = document.createElement('span'); sBadge.className = 'count-shortage-badge'; sBadge.textContent = '不足'; cell.appendChild(sBadge); }
                } else if (sBadge) { sBadge.remove(); }
                let eBadge = cell.querySelector('.count-excess-badge');
                if (isExcess) {
                    if (!eBadge) { eBadge = document.createElement('span'); eBadge.className = 'count-excess-badge'; eBadge.textContent = '過多'; cell.appendChild(eBadge); }
                } else if (eBadge) { eBadge.remove(); }
            }

            input.addEventListener('blur', commitEdit);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
                if (e.key === 'Escape') { input.value = required; input.blur(); }
            });
        }

        // 個別連絡選択ポップアップ
        let currentEmployeeNameBlock = null;

        // 連絡項目リスト（ライトテーマ用カラー（Coastal））
        const employeeContactItems = [
            { name: '会社', bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A', borderColor: 'rgba(68,166,181,0.3)', cssClass: 'contact-company' },
            { name: '直', bg: 'rgba(56,161,105,0.12)', color: '#276749', borderColor: 'rgba(56,161,105,0.3)', cssClass: 'contact-direct' },
            { name: 'LINE', bg: 'rgba(49,151,149,0.12)', color: '#285E61', borderColor: 'rgba(49,151,149,0.3)', cssClass: 'contact-line' },
            { name: '迎え', bg: 'rgba(214,158,46,0.1)', color: '#975A16', borderColor: 'rgba(214,158,46,0.3)', cssClass: 'contact-pickup' },
            { name: 'OP', bg: 'rgba(128,90,213,0.1)', color: '#6B46C1', borderColor: 'rgba(128,90,213,0.3)', cssClass: 'contact-op' }
        ];

        // 動的カラーパレット（新規追加用・ライトテーマ（Coastal））
        const colorPalette = [
            { bg: 'rgba(237,100,166,0.1)', color: '#B83280', borderColor: 'rgba(237,100,166,0.3)' },
            { bg: 'rgba(49,130,206,0.1)', color: '#2B6CB0', borderColor: 'rgba(49,130,206,0.3)' },
            { bg: 'rgba(221,107,32,0.1)', color: '#9C4221', borderColor: 'rgba(221,107,32,0.3)' },
            { bg: 'rgba(56,161,105,0.1)', color: '#276749', borderColor: 'rgba(56,161,105,0.3)' },
            { bg: 'rgba(128,90,213,0.1)', color: '#6B46C1', borderColor: 'rgba(128,90,213,0.3)' }
        ];

        function renderContactPopupOptions() {
            const container = document.getElementById('contactPopupOptions');
            const currentBadge = currentEmployeeNameBlock ? currentEmployeeNameBlock.querySelector('.contact-badge') : null;
            const currentContact = currentBadge ? currentBadge.textContent : null;

            let html = '';
            employeeContactItems.forEach((item, index) => {
                const isSelected = currentContact === item.name;
                html += `<button class="contact-popup-btn${isSelected ? ' selected' : ''}"
                            style="background:${item.bg}; color:${item.color}; border-color:${item.borderColor};"
                            onclick="setEmployeeContact('${item.name}')">
                            ${item.name}
                            <span class="delete-item-btn" onclick="event.stopPropagation(); removeContactItem(${index})">×</span>
                         </button>`;
            });
            html += `<button class="contact-popup-btn opt-clear" onclick="setEmployeeContact(null)">解除</button>`;
            container.innerHTML = html;
        }

        function openEmployeeContactPopup(nameBlock, event) {
            event.stopPropagation();
            const popup = document.getElementById('employeeContactPopup');

            if (currentEmployeeNameBlock === nameBlock && popup.classList.contains('active')) {
                closeEmployeeContactPopup();
                return;
            }

            currentEmployeeNameBlock = nameBlock;
            renderContactPopupOptions();

            const rect = nameBlock.getBoundingClientRect();
            popup.style.left = rect.left + 'px';
            popup.style.top = (rect.bottom + 4) + 'px';
            popup.classList.add('active');

            document.getElementById('newContactItemInput').value = '';
        }

        function closeEmployeeContactPopup() {
            document.getElementById('employeeContactPopup').classList.remove('active');
            currentEmployeeNameBlock = null;
        }

        function getContactStyle(contactName) {
            const item = employeeContactItems.find(i => i.name === contactName);
            if (item) {
                return { className: 'contact-badge ' + item.cssClass, bg: item.bg, color: item.color };
            }
            return { className: 'contact-badge', bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A' };
        }

        function setEmployeeContact(contactType) {
            if (!currentEmployeeNameBlock) return;
            pushUndo();

            const existingBadge = currentEmployeeNameBlock.querySelector('.contact-badge');
            if (existingBadge) existingBadge.remove();

            if (contactType) {
                const badge = document.createElement('span');
                const style = getContactStyle(contactType);
                badge.className = style.className;
                badge.style.background = style.bg;
                badge.style.color = style.color;
                badge.textContent = contactType;
                currentEmployeeNameBlock.appendChild(badge);
            }

            closeEmployeeContactPopup();
        }

        function addContactItem() {
            const input = document.getElementById('newContactItemInput');
            const name = input.value.trim();
            if (!name) return;
            if (employeeContactItems.some(i => i.name === name)) {
                input.value = '';
                return;
            }

            const paletteIndex = employeeContactItems.length % colorPalette.length;
            const colors = colorPalette[paletteIndex];
            const cssClass = 'contact-custom-' + employeeContactItems.length;

            employeeContactItems.push({
                name: name,
                bg: colors.bg,
                color: colors.color,
                borderColor: colors.borderColor,
                cssClass: cssClass
            });

            input.value = '';
            renderContactPopupOptions();
        }

        function removeContactItem(index) {
            employeeContactItems.splice(index, 1);
            renderContactPopupOptions();
        }

        document.getElementById('newContactItemInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addContactItem();
            }
        });

        document.addEventListener('click', function(e) {
            const popup = document.getElementById('employeeContactPopup');
            if (popup.classList.contains('active') && !popup.contains(e.target)) {
                closeEmployeeContactPopup();
            }
        });

        // 地図モーダル
        let currentMapCell = null;

        function openMapModal(cell, rowId) {
            currentMapCell = cell;
            const currentUrl = cell.getAttribute('data-map-url') || '';
            document.getElementById('mapUrlInput').value = currentUrl;
            document.getElementById('mapModal').classList.add('active');
            updateMapPreview();
            document.getElementById('mapUrlInput').focus();
        }

        function closeMapModal() {
            document.getElementById('mapModal').classList.remove('active');
            document.getElementById('mapPreviewFrame').src = '';
            document.getElementById('mapPreviewSection').style.display = 'none';
            currentMapCell = null;
        }

        function updateMapPreview() {
            const url = document.getElementById('mapUrlInput').value.trim();
            const previewSection = document.getElementById('mapPreviewSection');
            const iframe = document.getElementById('mapPreviewFrame');

            if (url) {
                iframe.src = url;
                previewSection.style.display = 'block';
            } else {
                iframe.src = '';
                previewSection.style.display = 'none';
            }
        }

        function saveMapModal() {
            const url = document.getElementById('mapUrlInput').value.trim();
            if (currentMapCell) {
                currentMapCell.setAttribute('data-map-url', url);
                if (url) {
                    currentMapCell.innerHTML = '<span class="map-link">MAP</span>';
                } else {
                    currentMapCell.innerHTML = '<span class="map-empty">＋</span>';
                }
            }
            closeMapModal();
        }

        function clearMapUrl() {
            document.getElementById('mapUrlInput').value = '';
            saveMapModal();
        }

        document.getElementById('mapModal').addEventListener('click', function(e) {
            if (e.target === this) closeMapModal();
        });

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function rgbToHex(color) {
            if (!color) return '#D3D0C8';
            if (color.startsWith('#')) {
                if (color.length === 4) {
                    return '#' + color[1]+color[1] + color[2]+color[2] + color[3]+color[3];
                }
                return color;
            }
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
                return '#' + match.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
            }
            return '#D3D0C8';
        }

        // 車両ドロップゾーン
        function removeVehicle(btn) {
            pushUndo();
            const tag = btn.closest('.vehicle-tag');
            if (tag) tag.remove();
            updateVehicleListStatus();
        }

        // 配置中の社員名を取得
        function getEmployeeName(assignedEl) {
            const nameBlock = assignedEl.querySelector('.employee-name-block');
            if (!nameBlock) return null;
            const continuous = nameBlock.querySelector('.employee-with-continuous');
            if (continuous) {
                for (const child of continuous.children) {
                    if (!child.classList.contains('continuous-badge')) return child.textContent.trim();
                }
            }
            for (const child of nameBlock.children) {
                if (!child.classList.contains('contact-badge')) return child.textContent.trim();
            }
            return null;
        }

        function updateEmployeeListStatus() {
            renderSidePanel();
        }

        // ===== サイドパネル 縦タブ・部署別表示 =====
        function renderSidePanel() {
            const vtabs = document.getElementById('spVtabs');
            const content = document.getElementById('spContent');
            const searchInput = document.getElementById('spSearchInput');
            if (!vtabs || !content) return;
            const searchTerm = searchInput ? searchInput.value.trim() : '';

            // 表示対象の会社
            const visibleCompanies = groupCompaniesData.filter(gc =>
                gcFilterState.selected.includes(gc.code)
            );

            // --- タブ列を構築 ---
            let tabsHtml = '';
            // 「すべて」タブ
            tabsHtml += '<div class="sp-vtab' + (spState.activeTab === 'all' ? ' active' : '') + '"'
                + ' data-sp-tab="all" onclick="spSelectTab(\'all\')">すべて</div>';

            visibleCompanies.forEach(function(gc) {
                const depts = departmentsData[gc.code] || [];
                const isExpanded = spState.expandedCompanies.has(gc.code);
                tabsHtml += '<div class="sp-gc-header' + (isExpanded ? ' expanded' : '') + '"'
                    + ' data-sp-gc="' + gc.code + '"'
                    + ' onclick="spToggleCompany(\'' + gc.code + '\')">' + gc.shortName + '</div>';
                tabsHtml += '<div class="sp-dept-group' + (isExpanded ? ' expanded' : '') + '"'
                    + ' data-sp-gc-group="' + gc.code + '">';
                depts.forEach(function(dept) {
                    tabsHtml += '<div class="sp-vtab' + (spState.activeTab === dept.id ? ' active' : '') + '"'
                        + ' data-sp-tab="' + dept.id + '"'
                        + ' onclick="spSelectTab(\'' + dept.id + '\')">' + dept.name + '</div>';
                });
                tabsHtml += '</div>';
            });
            vtabs.innerHTML = tabsHtml;

            // --- 社員リストを構築 ---
            // 配置済み社員名を取得
            const assignedNames = new Set();
            document.querySelectorAll('.assignment-zone .assigned-employee').forEach(function(el) {
                const name = getEmployeeName(el);
                if (name) assignedNames.add(name);
            });

            // フィルタリング
            let filtered = employeesData.filter(function(emp) {
                return visibleCompanies.some(function(gc) { return gc.code === emp.company; });
            });
            if (spState.activeTab !== 'all') {
                filtered = filtered.filter(function(emp) { return emp.dept === spState.activeTab; });
            }
            if (searchTerm) {
                filtered = filtered.filter(function(emp) { return emp.name.includes(searchTerm); });
            }

            let contentHtml = '';
            if (spState.activeTab === 'all') {
                // 会社別グループ表示
                visibleCompanies.forEach(function(gc) {
                    const companyEmps = filtered.filter(function(emp) { return emp.company === gc.code; });
                    if (companyEmps.length === 0) return;
                    contentHtml += '<div class="sp-gc-section-label">' + gc.shortName + '</div>';
                    companyEmps.forEach(function(emp) {
                        const isAssigned = assignedNames.has(emp.name);
                        contentHtml += '<span class="employee-tag' + (isAssigned ? ' assigned' : '') + '"'
                            + ' draggable="true" ondragstart="drag(event)"'
                            + ' data-company="' + emp.company + '"'
                            + ' data-dept="' + emp.dept + '">' + emp.name + '</span>';
                    });
                });
            } else {
                // 部署別フラット表示
                filtered.forEach(function(emp) {
                    const isAssigned = assignedNames.has(emp.name);
                    contentHtml += '<span class="employee-tag' + (isAssigned ? ' assigned' : '') + '"'
                        + ' draggable="true" ondragstart="drag(event)"'
                        + ' data-company="' + emp.company + '"'
                        + ' data-dept="' + emp.dept + '">' + emp.name + '</span>';
                });
            }
            content.innerHTML = contentHtml;

            // ヘッダーのカウント更新
            const countEl = document.querySelector('.sp-employee-count');
            if (countEl) {
                const total = employeesData.filter(function(emp) {
                    return visibleCompanies.some(function(gc) { return gc.code === emp.company; });
                }).length;
                countEl.textContent = spState.activeTab === 'all'
                    ? '全' + total + '名'
                    : filtered.length + '/' + total + '名';
            }

            // dragendリスナー再登録
            content.querySelectorAll('.employee-tag').forEach(function(tag) {
                tag.addEventListener('dragend', function() {
                    this.classList.remove('dragging');
                });
            });
        }

        function spSelectTab(tabId) {
            spState.activeTab = tabId;
            renderSidePanel();
        }

        function spToggleCompany(gcCode) {
            if (spState.expandedCompanies.has(gcCode)) {
                spState.expandedCompanies.delete(gcCode);
            } else {
                spState.expandedCompanies.add(gcCode);
            }
            // アクティブタブが閉じた会社の部署だった場合リセット
            if (spState.activeTab !== 'all') {
                var depts = departmentsData[gcCode] || [];
                var isInThisCompany = depts.some(function(d) { return d.id === spState.activeTab; });
                if (isInThisCompany && !spState.expandedCompanies.has(gcCode)) {
                    spState.activeTab = 'all';
                }
            }
            renderSidePanel();
        }

        // ===== メインタブ切替（社員/車両） =====
        function spSwitchMainTab(tab) {
            spState.mainTab = tab;
            var empPanel = document.getElementById('spEmployeePanel');
            var vehPanel = document.getElementById('spVehiclePanel');
            if (!empPanel || !vehPanel) return;
            var tabs = document.querySelectorAll('.sp-tab');
            tabs.forEach(function(t) {
                t.classList.toggle('active', t.dataset.spMain === tab);
            });
            if (tab === 'employee') {
                empPanel.style.display = '';
                vehPanel.style.display = 'none';
                renderSidePanel();
            } else {
                empPanel.style.display = 'none';
                vehPanel.style.display = '';
                renderVehiclePanel();
            }
        }

        // ===== 車両リストレンダリング =====
        function renderVehiclePanel() {
            var content = document.getElementById('spVehicleContent');
            var searchInput = document.getElementById('spVehicleSearchInput');
            if (!content) return;
            var searchTerm = searchInput ? searchInput.value.trim() : '';

            var visibleCompanies = groupCompaniesData.filter(function(gc) {
                return gcFilterState.selected.includes(gc.code);
            });

            // 配置済み車両ナンバーを取得
            var assignedPlates = new Set();
            document.querySelectorAll('.vehicle-drop-zone .vehicle-tag').forEach(function(tag) {
                var text = tag.childNodes[0];
                if (text) assignedPlates.add(text.textContent.trim());
            });

            // フィルタリング
            var filtered = vehiclesData.filter(function(v) {
                return visibleCompanies.some(function(gc) { return gc.code === v.owner; });
            });
            if (searchTerm) {
                filtered = filtered.filter(function(v) {
                    return v.plate.includes(searchTerm) || v.model.includes(searchTerm);
                });
            }

            // 配置済みETCラベルを取得
            var assignedEtcs = new Set();
            document.querySelectorAll('.etc-drop-zone .etc-tag').forEach(function(tag) {
                var text = tag.childNodes[0];
                if (text) assignedEtcs.add(text.textContent.trim());
            });

            // ETCフィルタリング
            var filteredEtc = etcCardsData.filter(function(e) {
                return visibleCompanies.some(function(gc) { return gc.code === e.owner; });
            });
            if (searchTerm) {
                filteredEtc = filteredEtc.filter(function(e) {
                    return e.label.includes(searchTerm);
                });
            }

            var html = '';
            visibleCompanies.forEach(function(gc) {
                var companyVehicles = filtered.filter(function(v) { return v.owner === gc.code; });
                var companyEtc = filteredEtc.filter(function(e) { return e.owner === gc.code; });
                if (companyVehicles.length === 0 && companyEtc.length === 0) return;
                html += '<div class="sp-gc-section-label">' + gc.shortName + '</div>';
                companyVehicles.forEach(function(v) {
                    var isAssigned = assignedPlates.has(v.plate);
                    html += '<span class="vehicle-list-tag' + (isAssigned ? ' assigned' : '') + '"'
                        + ' draggable="true" ondragstart="vehicleDrag(event)"'
                        + ' data-plate="' + v.plate + '"'
                        + ' data-model="' + v.model + '">'
                        + v.plate + '<span class="vlt-model">' + v.model + '</span>'
                        + '</span>';
                });
                if (companyEtc.length > 0) {
                    html += '<div class="sp-etc-label">ETC</div>';
                    companyEtc.forEach(function(e) {
                        var isAssigned = assignedEtcs.has(e.label);
                        html += '<span class="etc-list-tag' + (isAssigned ? ' assigned' : '') + '"'
                            + ' draggable="true" ondragstart="etcDrag(event)"'
                            + ' data-label="' + e.label + '">'
                            + e.label
                            + '</span>';
                    });
                }
            });
            content.innerHTML = html;

            // ヘッダーカウント更新
            var countEl = document.querySelector('.sp-vehicle-count');
            if (countEl) {
                var total = vehiclesData.filter(function(v) {
                    return visibleCompanies.some(function(gc) { return gc.code === v.owner; });
                }).length;
                countEl.textContent = '全' + total + '台';
            }

            // dragendリスナー
            content.querySelectorAll('.vehicle-list-tag, .etc-list-tag').forEach(function(tag) {
                tag.addEventListener('dragend', function() {
                    this.classList.remove('dragging');
                });
            });
        }

        function updateVehicleListStatus() {
            if (spState.mainTab === 'vehicle') renderVehiclePanel();
        }

        // ===== 車両D&D =====
        let dragSourceVehicleTag = null;
        let dragSourceEtcTag = null;

        function makeAssignedVehicleDraggable(el) {
            el.draggable = true;
            el.addEventListener('dragstart', function(ev) {
                ev.stopPropagation();
                dragSourceVehicleTag = el;
                var plate = el.childNodes[0].textContent.trim();
                ev.dataTransfer.setData('text/vehicle', plate);
                ev.dataTransfer.effectAllowed = 'move';
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', function() {
                el.classList.remove('dragging');
                dragSourceVehicleTag = null;
            });
        }

        function makeAssignedEtcDraggable(el) {
            el.draggable = true;
            el.addEventListener('dragstart', function(ev) {
                ev.stopPropagation();
                dragSourceEtcTag = el;
                var label = el.childNodes[0].textContent.trim();
                ev.dataTransfer.setData('text/etc', label);
                ev.dataTransfer.effectAllowed = 'move';
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', function() {
                el.classList.remove('dragging');
                dragSourceEtcTag = null;
            });
        }

        // 初期化: 既存の配置済み車両・ETCをドラッグ可能にする
        document.querySelectorAll('.vehicle-tag').forEach(makeAssignedVehicleDraggable);
        document.querySelectorAll('.etc-tag').forEach(makeAssignedEtcDraggable);

        function vehicleDrag(ev) {
            ev.dataTransfer.setData('text/vehicle', ev.target.dataset.plate);
            ev.dataTransfer.effectAllowed = 'copy';
            ev.target.classList.add('dragging');
        }

        // 車両・ETC共通: 車両列内どこにドロップしても自動振り分け
        function vtAllowDrop(ev) {
            if (ev.dataTransfer.types.includes('text/vehicle') || ev.dataTransfer.types.includes('text/etc')) {
                ev.preventDefault();
                var split = ev.currentTarget.closest('.vt-split-zone');
                if (!split) return;
                // ドラッグ種別に応じたゾーンをハイライト
                if (ev.dataTransfer.types.includes('text/vehicle')) {
                    split.querySelector('.vehicle-drop-zone').classList.add('drag-over');
                } else {
                    split.querySelector('.etc-drop-zone').classList.add('drag-over');
                }
            }
        }

        function vtDragLeave(ev) {
            var split = ev.currentTarget.closest('.vt-split-zone');
            if (!split) return;
            split.querySelector('.vehicle-drop-zone').classList.remove('drag-over');
            split.querySelector('.etc-drop-zone').classList.remove('drag-over');
        }

        function vtDrop(ev) {
            ev.preventDefault();
            var split = ev.currentTarget.closest('.vt-split-zone');
            if (!split) return;
            split.querySelector('.vehicle-drop-zone').classList.remove('drag-over');
            split.querySelector('.etc-drop-zone').classList.remove('drag-over');

            var plate = ev.dataTransfer.getData('text/vehicle');
            var label = ev.dataTransfer.getData('text/etc');

            if (plate) {
                var vZone = split.querySelector('.vehicle-drop-zone');

                // テーブル内タグの行間移動
                if (dragSourceVehicleTag) {
                    var sourceZone = dragSourceVehicleTag.closest('.vehicle-drop-zone');
                    if (sourceZone === vZone) { dragSourceVehicleTag = null; return; }

                    var targetShift = getRowShift(vZone);
                    var duplicate = false;
                    var allVZones = document.querySelectorAll('.vehicle-drop-zone');
                    for (var i = 0; i < allVZones.length; i++) {
                        if (allVZones[i] === sourceZone || allVZones[i] === vZone) continue;
                        if (getRowShift(allVZones[i]) !== targetShift) continue;
                        var tags = allVZones[i].querySelectorAll('.vehicle-tag');
                        for (var j = 0; j < tags.length; j++) {
                            if (tags[j].childNodes[0].textContent.trim() === plate) { duplicate = true; break; }
                        }
                        if (duplicate) break;
                    }
                    if (!duplicate) {
                        var inZone = vZone.querySelectorAll('.vehicle-tag');
                        for (var k = 0; k < inZone.length; k++) {
                            if (inZone[k].childNodes[0].textContent.trim() === plate) { duplicate = true; break; }
                        }
                    }
                    if (duplicate) { dragSourceVehicleTag = null; return; }

                    pushUndo();
                    dragSourceVehicleTag.remove();
                    var newTag = document.createElement('span');
                    newTag.className = 'vehicle-tag';
                    newTag.innerHTML = plate + '<button class="vehicle-remove-btn" onclick="removeVehicle(this)">×</button>';
                    vZone.appendChild(newTag);
                    makeAssignedVehicleDraggable(newTag);
                    dragSourceVehicleTag = null;
                    updateVehicleListStatus();
                } else {
                    // サイドパネルからの配置（同一シフト帯に既存配置があれば移動）
                    var targetShift = getRowShift(vZone);
                    var existingTag = null;

                    // ドロップ先に既に同じ車両がある場合は何もしない
                    var inZone = vZone.querySelectorAll('.vehicle-tag');
                    for (var k = 0; k < inZone.length; k++) {
                        if (inZone[k].childNodes[0].textContent.trim() === plate) return;
                    }

                    // 同一シフト帯の他の行で既存配置を探す
                    var allVZones = document.querySelectorAll('.vehicle-drop-zone');
                    for (var i = 0; i < allVZones.length; i++) {
                        if (allVZones[i] === vZone) continue;
                        if (getRowShift(allVZones[i]) !== targetShift) continue;
                        var tags = allVZones[i].querySelectorAll('.vehicle-tag');
                        for (var j = 0; j < tags.length; j++) {
                            if (tags[j].childNodes[0].textContent.trim() === plate) {
                                existingTag = tags[j];
                                break;
                            }
                        }
                        if (existingTag) break;
                    }

                    pushUndo();
                    if (existingTag) existingTag.remove();
                    var tag = document.createElement('span');
                    tag.className = 'vehicle-tag';
                    tag.innerHTML = plate + '<button class="vehicle-remove-btn" onclick="removeVehicle(this)">×</button>';
                    vZone.appendChild(tag);
                    makeAssignedVehicleDraggable(tag);
                    updateVehicleListStatus();
                }
            } else if (label) {
                var eZone = split.querySelector('.etc-drop-zone');

                // テーブル内ETCタグの行間移動
                if (dragSourceEtcTag) {
                    var sourceZone = dragSourceEtcTag.closest('.etc-drop-zone');
                    if (sourceZone === eZone) { dragSourceEtcTag = null; return; }

                    var targetShift2 = getRowShift(eZone);
                    var duplicate2 = false;
                    var allEZones = document.querySelectorAll('.etc-drop-zone');
                    for (var i2 = 0; i2 < allEZones.length; i2++) {
                        if (allEZones[i2] === sourceZone || allEZones[i2] === eZone) continue;
                        if (getRowShift(allEZones[i2]) !== targetShift2) continue;
                        var eTags = allEZones[i2].querySelectorAll('.etc-tag');
                        for (var j2 = 0; j2 < eTags.length; j2++) {
                            if (eTags[j2].childNodes[0].textContent.trim() === label) { duplicate2 = true; break; }
                        }
                        if (duplicate2) break;
                    }
                    if (!duplicate2) {
                        var inEZone = eZone.querySelectorAll('.etc-tag');
                        for (var k2 = 0; k2 < inEZone.length; k2++) {
                            if (inEZone[k2].childNodes[0].textContent.trim() === label) { duplicate2 = true; break; }
                        }
                    }
                    if (duplicate2) { dragSourceEtcTag = null; return; }

                    pushUndo();
                    dragSourceEtcTag.remove();
                    var newETag = document.createElement('span');
                    newETag.className = 'etc-tag';
                    newETag.innerHTML = label + '<button class="etc-remove-btn" onclick="removeEtc(this)">×</button>';
                    eZone.appendChild(newETag);
                    makeAssignedEtcDraggable(newETag);
                    dragSourceEtcTag = null;
                    updateVehicleListStatus();
                } else {
                    // サイドパネルからの新規配置
                    var targetShift2 = getRowShift(eZone);
                    var allEZones = document.querySelectorAll('.etc-drop-zone');
                    for (var i2 = 0; i2 < allEZones.length; i2++) {
                        if (getRowShift(allEZones[i2]) !== targetShift2) continue;
                        var eTags = allEZones[i2].querySelectorAll('.etc-tag');
                        for (var j2 = 0; j2 < eTags.length; j2++) {
                            if (eTags[j2].childNodes[0].textContent.trim() === label) return;
                        }
                    }
                    pushUndo();
                    var eTag = document.createElement('span');
                    eTag.className = 'etc-tag';
                    eTag.innerHTML = label + '<button class="etc-remove-btn" onclick="removeEtc(this)">×</button>';
                    eZone.appendChild(eTag);
                    makeAssignedEtcDraggable(eTag);
                    updateVehicleListStatus();
                }
            }
        }

        // ===== ETC D&D =====
        function etcDrag(ev) {
            ev.dataTransfer.setData('text/etc', ev.target.dataset.label);
            ev.dataTransfer.effectAllowed = 'copy';
            ev.target.classList.add('dragging');
        }

        function removeEtc(btn) {
            pushUndo();
            var tag = btn.closest('.etc-tag');
            if (tag) tag.remove();
            updateVehicleListStatus();
        }

        function updateRowCount(zone) {
            const row = zone.closest('tr');
            if (!row) return;
            const countCell = row.cells[4];
            if (!countCell) return;
            const countDisp = countCell.querySelector('.count-display');
            if (!countDisp) return;
            const assigned = zone.querySelectorAll('.assigned-employee').length;
            const text = countDisp.textContent.trim();
            const match = text.match(/\d+\/(\d+)/);
            const required = match ? parseInt(match[1]) : 1;
            countDisp.textContent = `${assigned}/${required}`;
            countDisp.classList.remove('count-ok', 'count-shortage', 'count-excess');
            const isShortage = assigned < required;
            const isExcess = assigned > required;
            countDisp.classList.add(isShortage ? 'count-shortage' : isExcess ? 'count-excess' : 'count-ok');
            let sBadge = countCell.querySelector('.count-shortage-badge');
            if (isShortage) {
                if (!sBadge) { sBadge = document.createElement('span'); sBadge.className = 'count-shortage-badge'; sBadge.textContent = '不足'; countCell.appendChild(sBadge); }
            } else if (sBadge) { sBadge.remove(); }
            let eBadge = countCell.querySelector('.count-excess-badge');
            if (isExcess) {
                if (!eBadge) { eBadge = document.createElement('span'); eBadge.className = 'count-excess-badge'; eBadge.textContent = '過多'; countCell.appendChild(eBadge); }
            } else if (eBadge) { eBadge.remove(); }
            renderMinimap();
        }

        function removeEmployee(btn, event) {
            event.stopPropagation();
            pushUndo();
            const employeeTag = btn.closest('.assigned-employee');
            if (employeeTag) {
                const zone = employeeTag.closest('.assignment-zone');
                employeeTag.remove();
                if (zone) updateRowCount(zone);
                updateEmployeeListStatus();
            }
        }

        // 行内の全配置社員を解除する
        function releaseRowEmployees(row) {
            var assigned = row.querySelectorAll('.assigned-employee');
            for (var i = 0; i < assigned.length; i++) {
                assigned[i].remove();
            }
            if (assigned.length > 0) updateEmployeeListStatus();
        }

        // ===== ミニマップ =====
        function renderMinimap() {
            var body = document.getElementById('minimapBody');
            var totalEl = document.getElementById('minimapTotal');
            if (!body) return;

            var rows = document.querySelectorAll('.grid-table tbody tr');
            var html = '';
            var totalRequired = 0;
            var totalAssigned = 0;

            rows.forEach(function(row, idx) {
                if (row.style.display === 'none') return;

                var shiftBadge = row.querySelector('.shift-badge');
                var shift = shiftBadge ? shiftBadge.textContent.trim() : '';
                var shiftClass = shift === '夜' ? 'shift-night' : 'shift-day';

                var companyEl = row.querySelector('.site-info .company');
                var siteEl = row.querySelector('.site-info .site-name');
                var company = companyEl ? companyEl.textContent.trim() : '';
                var site = siteEl ? siteEl.textContent.trim() : '';
                // 契約先＋現場名を短縮表示
                var siteText = company ? company + ' ' + site : site;

                var countDisp = row.querySelector('.count-display');
                var countText = countDisp ? countDisp.textContent.trim() : '0/0';
                var match = countText.match(/(\d+)\/(\d+)/);
                var assigned = match ? parseInt(match[1]) : 0;
                var required = match ? parseInt(match[2]) : 0;

                totalRequired += required;
                totalAssigned += assigned;

                var isShortage = assigned < required;
                var rowClass = 'minimap-row' + (isShortage ? ' shortage' : '');
                var countClass = 'minimap-count' + (isShortage ? ' shortage' : ' count-ok');

                html += '<div class="' + rowClass + '" onclick="minimapScrollToRow(' + idx + ')">'
                    + '<span class="minimap-shift ' + shiftClass + '">' + (shift || '-') + '</span>'
                    + '<span class="minimap-site" title="' + siteText.replace(/"/g, '&quot;') + '">' + siteText + '</span>'
                    + '<span class="' + countClass + '">' + assigned + '/' + required + '</span>'
                    + '</div>';
            });

            body.innerHTML = html;
            if (totalEl) {
                totalEl.textContent = totalAssigned + '/' + totalRequired;
            }
        }

        function toggleMinimap() {
            var minimap = document.querySelector('.minimap');
            var body = document.getElementById('minimapBody');
            if (!minimap || !body) return;
            minimap.classList.toggle('collapsed');
            body.classList.toggle('expanded');
        }

        function minimapScrollToRow(idx) {
            var rows = document.querySelectorAll('.grid-table tbody tr');
            var visibleIdx = 0;
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].style.display === 'none') continue;
                if (visibleIdx === idx) {
                    rows[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    rows[i].classList.add('highlight-flash');
                    setTimeout(function() { rows[i].classList.remove('highlight-flash'); }, 1500);
                    return;
                }
                visibleIdx++;
            }
        }

        // ===== ドラッグ＆ドロップ（サイドパネル→配置 & 配置間移動） =====
        let dragSourceAssignedEmployee = null;

        function makeAssignedEmployeeDraggable(el) {
            el.draggable = true;
            el.addEventListener('dragstart', function(ev) {
                ev.stopPropagation();
                dragSourceAssignedEmployee = el;
                const name = getEmployeeName(el);
                ev.dataTransfer.setData('text', name || '');
                ev.dataTransfer.effectAllowed = 'move';
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', function() {
                el.classList.remove('dragging');
                dragSourceAssignedEmployee = null;
            });
        }

        // 初期化: 既存の配置済み社員をドラッグ可能にする
        document.querySelectorAll('.assigned-employee').forEach(makeAssignedEmployeeDraggable);

        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.textContent);
            ev.target.classList.add('dragging');
        }

        function allowDrop(ev) {
            ev.preventDefault();
            const zone = ev.target.closest('.assignment-zone');
            if (zone) zone.classList.add('drag-over');
        }

        function dragLeave(ev) {
            const zone = ev.target.closest('.assignment-zone');
            if (zone && (!ev.relatedTarget || !zone.contains(ev.relatedTarget))) {
                zone.classList.remove('drag-over');
            }
        }

        // 行のシフト帯を取得（'昼' or '夜'）
        function getRowShift(zone) {
            var row = zone.closest('tr');
            if (!row) return null;
            var badge = row.querySelector('.shift-badge');
            return badge ? badge.textContent.trim() : null;
        }

        // 同一シフト帯に同名社員が既に配置されているか判定
        function isEmployeeDuplicateInShift(name, targetZone) {
            var targetShift = getRowShift(targetZone);
            var allZones = document.querySelectorAll('.assignment-zone');
            for (var i = 0; i < allZones.length; i++) {
                var z = allZones[i];
                if (z === targetZone) continue;
                var zShift = getRowShift(z);
                if (zShift !== targetShift) continue;
                var assigned = z.querySelectorAll('.assigned-employee');
                for (var j = 0; j < assigned.length; j++) {
                    if (getEmployeeName(assigned[j]) === name) return true;
                }
            }
            // 同一ゾーン内の重複もチェック
            var inZone = targetZone.querySelectorAll('.assigned-employee');
            for (var k = 0; k < inZone.length; k++) {
                if (getEmployeeName(inZone[k]) === name) return true;
            }
            return false;
        }

        function drop(ev) {
            ev.preventDefault();
            const zone = ev.target.closest('.assignment-zone');
            if (!zone) return;
            zone.classList.remove('drag-over');

            if (dragSourceAssignedEmployee) {
                // 配置済み社員の行間移動
                const sourceZone = dragSourceAssignedEmployee.closest('.assignment-zone');
                if (sourceZone === zone) { dragSourceAssignedEmployee = null; return; }

                const name = getEmployeeName(dragSourceAssignedEmployee);

                // 移動先の同一シフト帯に既に同名社員がいるかチェック（自分自身は除外）
                var targetShift = getRowShift(zone);
                var sourceShift = getRowShift(sourceZone);
                var duplicate = false;
                var allZones = document.querySelectorAll('.assignment-zone');
                for (var i = 0; i < allZones.length; i++) {
                    var z = allZones[i];
                    if (z === sourceZone || z === zone) continue;
                    if (getRowShift(z) !== targetShift) continue;
                    var assigned = z.querySelectorAll('.assigned-employee');
                    for (var j = 0; j < assigned.length; j++) {
                        if (getEmployeeName(assigned[j]) === name) { duplicate = true; break; }
                    }
                    if (duplicate) break;
                }
                // 移動先ゾーン内の重複チェック
                if (!duplicate) {
                    var inZone = zone.querySelectorAll('.assigned-employee');
                    for (var k = 0; k < inZone.length; k++) {
                        if (getEmployeeName(inZone[k]) === name) { duplicate = true; break; }
                    }
                }
                if (duplicate) { dragSourceAssignedEmployee = null; return; }

                pushUndo();

                // 元の行から削除
                dragSourceAssignedEmployee.remove();

                // 移動先に新規作成（連絡方法リセット）
                var newTag = document.createElement('span');
                newTag.className = 'assigned-employee';
                newTag.innerHTML = '<span class="employee-name-block" onclick="openEmployeeContactPopup(this, event)">'
                    + '<span>' + name + '</span>'
                    + '</span>'
                    + '<span class="remove-btn" onclick="removeEmployee(this, event)">×</span>';
                zone.appendChild(newTag);
                makeAssignedEmployeeDraggable(newTag);

                // 両方のゾーンのカウント更新
                updateRowCount(sourceZone);
                updateRowCount(zone);
                updateEmployeeListStatus();

                dragSourceAssignedEmployee = null;
            } else {
                // サイドパネルからの新規配置
                var data = ev.dataTransfer.getData("text");

                // 同一ゾーン内の重複チェック（同じ行に同じ人は不可）
                var inZone = zone.querySelectorAll('.assigned-employee');
                for (var k = 0; k < inZone.length; k++) {
                    if (getEmployeeName(inZone[k]) === data) return;
                }

                pushUndo();

                // 同一シフト帯の既存配置を検索し、あれば移動（元から削除）
                var targetShift = getRowShift(zone);
                var allZones = document.querySelectorAll('.assignment-zone');
                var movedFromZones = [];
                for (var i = 0; i < allZones.length; i++) {
                    var z = allZones[i];
                    if (z === zone) continue;
                    if (getRowShift(z) !== targetShift) continue;
                    var assigned = z.querySelectorAll('.assigned-employee');
                    for (var j = 0; j < assigned.length; j++) {
                        if (getEmployeeName(assigned[j]) === data) {
                            assigned[j].remove();
                            movedFromZones.push(z);
                            break;
                        }
                    }
                }

                var newTag = document.createElement('span');
                newTag.className = 'assigned-employee';
                newTag.innerHTML = '<span class="employee-name-block" onclick="openEmployeeContactPopup(this, event)">'
                    + '<span>' + data + '</span>'
                    + '</span>'
                    + '<span class="remove-btn" onclick="removeEmployee(this, event)">×</span>';
                zone.appendChild(newTag);
                makeAssignedEmployeeDraggable(newTag);
                updateRowCount(zone);
                for (var m = 0; m < movedFromZones.length; m++) { updateRowCount(movedFromZones[m]); }
                updateEmployeeListStatus();
            }
        }

        // ===== 行選択・上下移動 =====
        let selectedGridRow = null;

        function selectRow(tr, event) {
            if (event.target.closest('.modal-overlay, .contact-popup, .assigned-employee, .vehicle-drop-zone')) return;
            if (event.target.closest('.clickable-cell')) return;

            if (selectedGridRow === tr) {
                tr.classList.remove('selected');
                selectedGridRow = null;
            } else {
                if (selectedGridRow) selectedGridRow.classList.remove('selected');
                tr.classList.add('selected');
                selectedGridRow = tr;
            }
        }

        function moveRowUp() {
            if (!selectedGridRow) { alert('移動する行を選択してください'); return; }
            const prev = selectedGridRow.previousElementSibling;
            if (prev) {
                pushUndo();
                selectedGridRow.parentNode.insertBefore(selectedGridRow, prev);
                renumberRows();
            }
        }

        function moveRowDown() {
            if (!selectedGridRow) { alert('移動する行を選択してください'); return; }
            const next = selectedGridRow.nextElementSibling;
            if (next) {
                pushUndo();
                selectedGridRow.parentNode.insertBefore(next, selectedGridRow);
                renumberRows();
            }
        }

        function deleteRow() {
            if (!selectedGridRow) { alert('削除する行を選択してください'); return; }
            if (!confirm('この行を削除しますか？\n配置中の社員は自動的に解除されます。')) return;
            pushUndo();
            releaseRowEmployees(selectedGridRow);
            selectedGridRow.remove();
            selectedGridRow = null;
            renumberRows();
        }

        function renumberRows() {
            const rows = document.querySelectorAll('.grid-table tbody tr');
            rows.forEach((row, index) => {
                const noCell = row.querySelector('.col-no');
                if (!noCell) return;
                // テキストノードのみ更新（ベルアイコン等の子要素を保持）
                const textNode = Array.from(noCell.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = index + 1;
                } else {
                    noCell.insertBefore(document.createTextNode(index + 1), noCell.firstChild);
                }
            });
            renderMinimap();
        }

        // ===== ソート設定モーダル =====
        const DEFAULT_SORT_ORDER = {
            category: ['施設', 'イベント', '交通', '高速'],
            shift: ['昼', '夜']
        };

        const sortState = {
            category: [], shift: [], contractor: [], site: [],
            categoryContractorOrders: {},
            contractorSiteOrders: {},
            selected: { category: null, shift: null, contractor: null, site: null },
            filterCategory: null, filterContractor: null
        };

        function extractGridData() {
            const rows = document.querySelectorAll('.grid-table tbody tr');
            const data = [];
            rows.forEach(row => {
                const categoryBadge = row.querySelector('.category-badge');
                const shiftBadge = row.querySelector('.shift-badge');
                const company = row.querySelector('.site-info .company');
                const siteName = row.querySelector('.site-info .site-name');
                data.push({
                    row: row,
                    category: categoryBadge ? categoryBadge.textContent.trim() : '',
                    shift: shiftBadge ? shiftBadge.textContent.trim() : '',
                    contractor: company ? company.textContent.trim() : '',
                    site: siteName ? siteName.textContent.trim() : ''
                });
            });
            return data;
        }

        function getUniqueValues(dataArray, key) {
            const seen = new Set();
            const result = [];
            dataArray.forEach(d => {
                const val = d[key];
                if (val && !seen.has(val)) { seen.add(val); result.push(val); }
            });
            return result;
        }

        function getFilteredUniqueValues(dataArray, key, filterKey, filterValue) {
            const seen = new Set();
            const result = [];
            dataArray.forEach(d => {
                if (d[filterKey] === filterValue && d[key] && !seen.has(d[key])) {
                    seen.add(d[key]); result.push(d[key]);
                }
            });
            return result;
        }

        function openSortModal() {
            const gridData = extractGridData();
            // デフォルト順序を適用（グリッドに存在する値のみ）
            const gridCategories = getUniqueValues(gridData, 'category');
            sortState.category = DEFAULT_SORT_ORDER.category.filter(c => gridCategories.includes(c));
            gridCategories.forEach(c => { if (!sortState.category.includes(c)) sortState.category.push(c); });

            const gridShifts = getUniqueValues(gridData, 'shift');
            sortState.shift = DEFAULT_SORT_ORDER.shift.filter(s => gridShifts.includes(s));
            gridShifts.forEach(s => { if (!sortState.shift.includes(s)) sortState.shift.push(s); });

            sortState.contractor = getUniqueValues(gridData, 'contractor');
            sortState.site = getUniqueValues(gridData, 'site');

            sortState.categoryContractorOrders = {};
            sortState.category.forEach(cat => {
                sortState.categoryContractorOrders[cat] = getFilteredUniqueValues(gridData, 'contractor', 'category', cat);
            });
            sortState.contractorSiteOrders = {};
            sortState.contractor.forEach(con => {
                sortState.contractorSiteOrders[con] = getFilteredUniqueValues(gridData, 'site', 'contractor', con);
            });

            sortState.selected = { category: null, shift: null, contractor: null, site: null };
            sortState.filterCategory = null;
            sortState.filterContractor = null;

            renderSortList('category'); renderSortList('shift');
            renderSortList('contractor'); renderSortList('site');
            updateSortFilters();

            document.getElementById('sortModal').classList.add('active');
        }

        function closeSortModal() { document.getElementById('sortModal').classList.remove('active'); }

        document.getElementById('sortModal').addEventListener('click', function(e) {
            if (e.target === this) closeSortModal();
        });

        function renderSortList(column) {
            const container = document.getElementById('sortList' + column.charAt(0).toUpperCase() + column.slice(1));
            let items;
            if (column === 'contractor' && sortState.filterCategory) {
                items = sortState.categoryContractorOrders[sortState.filterCategory] || [];
            } else if (column === 'site' && sortState.filterContractor) {
                items = sortState.contractorSiteOrders[sortState.filterContractor] || [];
            } else {
                items = sortState[column];
            }

            let html = '';
            items.forEach((item, index) => {
                const isSelected = sortState.selected[column] === index;
                html += '<div class="sort-list-item' + (isSelected ? ' selected' : '') + '" onclick="selectSortItem(\'' + column + '\', ' + index + ')">'
                    + '<span class="sort-item-number">' + (index + 1) + '.</span>'
                    + '<span class="sort-item-name">' + escapeHtml(item) + '</span>'
                    + '</div>';
            });

            if (items.length === 0) {
                html = '<div style="padding: 20px; text-align: center; color: var(--text-disabled); font-size: 0.8rem;">項目なし</div>';
            }
            container.innerHTML = html;
        }

        function selectSortItem(column, index) {
            sortState.selected[column] = index;
            renderSortList(column);

            if (column === 'category') {
                sortState.filterCategory = sortState.category[index] || null;
                sortState.filterContractor = null;
                sortState.selected.contractor = null;
                sortState.selected.site = null;
                renderSortList('contractor'); renderSortList('site');
                updateSortFilters();
            } else if (column === 'contractor') {
                let items = sortState.filterCategory
                    ? (sortState.categoryContractorOrders[sortState.filterCategory] || [])
                    : sortState.contractor;
                sortState.filterContractor = items[index] || null;
                sortState.selected.site = null;
                renderSortList('site');
                updateSortFilters();
            }
        }

        function updateSortFilters() {
            const contractorFilter = document.getElementById('sortContractorFilter');
            const siteFilter = document.getElementById('sortSiteFilter');
            contractorFilter.textContent = sortState.filterCategory ? '▸ ' + sortState.filterCategory : '（区分を選択で絞込み）';
            siteFilter.textContent = sortState.filterContractor ? '▸ ' + sortState.filterContractor : '（契約先を選択で絞込み）';
        }

        function sortMoveUp(column) {
            const idx = sortState.selected[column];
            if (idx === null || idx <= 0) return;
            const items = getCurrentSortItems(column);
            const temp = items[idx - 1]; items[idx - 1] = items[idx]; items[idx] = temp;
            sortState.selected[column] = idx - 1;
            renderSortList(column);
        }

        function sortMoveDown(column) {
            const idx = sortState.selected[column];
            const items = getCurrentSortItems(column);
            if (idx === null || idx >= items.length - 1) return;
            const temp = items[idx + 1]; items[idx + 1] = items[idx]; items[idx] = temp;
            sortState.selected[column] = idx + 1;
            renderSortList(column);
        }

        function getCurrentSortItems(column) {
            if (column === 'contractor' && sortState.filterCategory) return sortState.categoryContractorOrders[sortState.filterCategory];
            if (column === 'site' && sortState.filterContractor) return sortState.contractorSiteOrders[sortState.filterContractor];
            return sortState[column];
        }

        function applySortSettings() {
            pushUndo();
            const tbody = document.querySelector('.grid-table tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) => {
                const dataA = extractRowData(a), dataB = extractRowData(b);
                let cmp = getSortPriority(sortState.category, dataA.category) - getSortPriority(sortState.category, dataB.category);
                if (cmp !== 0) return cmp;
                cmp = getSortPriority(sortState.shift, dataA.shift) - getSortPriority(sortState.shift, dataB.shift);
                if (cmp !== 0) return cmp;
                const contractorOrderA = sortState.categoryContractorOrders[dataA.category] || sortState.contractor;
                const contractorOrderB = sortState.categoryContractorOrders[dataB.category] || sortState.contractor;
                cmp = getSortPriority(contractorOrderA, dataA.contractor) - getSortPriority(contractorOrderB, dataB.contractor);
                if (cmp !== 0) return cmp;
                const siteOrderA = sortState.contractorSiteOrders[dataA.contractor] || sortState.site;
                const siteOrderB = sortState.contractorSiteOrders[dataB.contractor] || sortState.site;
                return getSortPriority(siteOrderA, dataA.site) - getSortPriority(siteOrderB, dataB.site);
            });

            rows.forEach(row => tbody.appendChild(row));
            renumberRows();
            closeSortModal();
        }

        function extractRowData(row) {
            const categoryBadge = row.querySelector('.category-badge');
            const shiftBadge = row.querySelector('.shift-badge');
            const company = row.querySelector('.site-info .company');
            const siteName = row.querySelector('.site-info .site-name');
            return {
                category: categoryBadge ? categoryBadge.textContent.trim() : '',
                shift: shiftBadge ? shiftBadge.textContent.trim() : '',
                contractor: company ? company.textContent.trim() : '',
                site: siteName ? siteName.textContent.trim() : ''
            };
        }

        function getSortPriority(orderArray, value) {
            const idx = orderArray.indexOf(value);
            return idx >= 0 ? idx : 9999;
        }

        function resetSortSettings() {
            const gridData = extractGridData();
            // デフォルト順序を適用（グリッドに存在する値のみ）
            const gridCategories = getUniqueValues(gridData, 'category');
            sortState.category = DEFAULT_SORT_ORDER.category.filter(c => gridCategories.includes(c));
            gridCategories.forEach(c => { if (!sortState.category.includes(c)) sortState.category.push(c); });

            const gridShifts = getUniqueValues(gridData, 'shift');
            sortState.shift = DEFAULT_SORT_ORDER.shift.filter(s => gridShifts.includes(s));
            gridShifts.forEach(s => { if (!sortState.shift.includes(s)) sortState.shift.push(s); });

            sortState.contractor = getUniqueValues(gridData, 'contractor');
            sortState.site = getUniqueValues(gridData, 'site');

            sortState.categoryContractorOrders = {};
            sortState.category.forEach(cat => {
                sortState.categoryContractorOrders[cat] = getFilteredUniqueValues(gridData, 'contractor', 'category', cat);
            });
            sortState.contractorSiteOrders = {};
            sortState.contractor.forEach(con => {
                sortState.contractorSiteOrders[con] = getFilteredUniqueValues(gridData, 'site', 'contractor', con);
            });

            sortState.selected = { category: null, shift: null, contractor: null, site: null };
            sortState.filterCategory = null;
            sortState.filterContractor = null;

            renderSortList('category'); renderSortList('shift');
            renderSortList('contractor'); renderSortList('site');
            updateSortFilters();
        }

        // ==================== カラー設定パネル ====================

        // --- ベース色 → 背景(rgba 12%) / 文字(暗色) 自動生成ユーティリティ ---
        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b };
        }
        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) { h = s = 0; }
            else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                else if (max === g) h = ((b - r) / d + 2) / 6;
                else h = ((r - g) / d + 4) / 6;
            }
            return { h, s, l };
        }
        function hslToHex(h, s, l) {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            let r, g, b;
            if (s === 0) { r = g = b = l; }
            else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            const toHex = v => { const h = Math.round(v * 255).toString(16); return h.length === 1 ? '0' + h : h; };
            return '#' + toHex(r) + toHex(g) + toHex(b);
        }
        /** ベース色HEXから背景rgbaと文字HEXを生成 */
        function deriveColors(baseHex) {
            const { r, g, b } = hexToRgb(baseHex);
            const bg = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.12)';
            const { h, s } = rgbToHsl(r, g, b);
            const textHex = hslToHex(h, Math.min(s * 1.1, 1), 0.22);
            return { bg, text: textHex };
        }
        /** ベース色キーからCSS変数名を解決 */
        function baseKeyToCssVars(baseKey) {
            if (baseKey.startsWith('cat-')) {
                return { bg: '--cat-bg-' + baseKey.slice(4), text: '--cat-text-' + baseKey.slice(4) };
            }
            // shift-day, shift-night
            return { bg: '--shift-bg-' + baseKey.slice(6), text: '--shift-text-' + baseKey.slice(6) };
        }
        /** ベース色を適用（背景・文字のCSS変数を自動設定） */
        function applyBaseColor(baseKey, baseHex) {
            const vars = baseKeyToCssVars(baseKey);
            const { bg, text } = deriveColors(baseHex);
            document.documentElement.style.setProperty(vars.bg, bg);
            document.documentElement.style.setProperty(vars.text, text);
        }

        // --- ベース色のデフォルト値 ---
        const BASE_COLOR_DEFAULTS = {
            '--gc-bg-touo': '#FFFFFF',
            '--gc-bg-nikkei': '#F3F9F6',
            '--gc-bg-zennihon': '#F2F4F8',
            'cat-facility': '#44A6B5',
            'cat-event': '#44A6B5',
            'cat-traffic': '#44A6B5',
            'cat-highway': '#44A6B5',
            'cat-support-event': '#44A6B5',
            'cat-support-traffic': '#44A6B5',
            'cat-support-highway': '#44A6B5',
            'cat-training': '#44A6B5',
            'cat-company': '#44A6B5',
            'shift-day': '#D3D0C8',
            'shift-night': '#004554'
        };
        const MAX_PRESETS = 5;
        const STORAGE_KEY = 'colorPresets_v2_light';
        const ACTIVE_PRESET_KEY = 'activeColorPreset_v2_light';

        function toggleColorSettingsPanel() {
            document.getElementById('colorSettingsPanel').classList.toggle('open');
        }
        document.addEventListener('click', function(e) {
            var panel = document.getElementById('colorSettingsPanel');
            if (!panel.classList.contains('open')) return;
            if (panel.contains(e.target)) return;
            // カラー設定ボタン自体のクリックはtoggleに任せる
            var btn = document.querySelector('[onclick*="toggleColorSettingsPanel"]');
            if (btn && btn.contains(e.target)) return;
            panel.classList.remove('open');
        });

        function getCurrentColors() {
            const colors = {};
            // グループ会社（従来の直接CSS変数ピッカー）
            document.querySelectorAll('.color-setting-picker:not(.color-base-picker)').forEach(picker => {
                colors[picker.dataset.cssVar] = picker.value;
            });
            // ベース色ピッカー（ベースキーで保存）
            document.querySelectorAll('.color-base-picker').forEach(picker => {
                colors[picker.dataset.baseKey] = picker.value;
            });
            return colors;
        }

        function applyColors(colors) {
            Object.entries(colors).forEach(([key, value]) => {
                if (key.startsWith('--')) {
                    // 従来のCSS変数（グループ会社背景色）
                    document.documentElement.style.setProperty(key, value);
                    const picker = document.querySelector('.color-setting-picker[data-css-var="' + key + '"]');
                    if (picker) picker.value = value;
                    const hex = document.querySelector('.color-setting-hex[data-css-var="' + key + '"]');
                    if (hex) hex.value = value;
                } else {
                    // ベース色キー → 背景・文字を自動生成
                    applyBaseColor(key, value);
                    const picker = document.querySelector('.color-base-picker[data-base-key="' + key + '"]');
                    if (picker) picker.value = value;
                    const hex = document.querySelector('.color-setting-hex[data-base-key="' + key + '"]');
                    if (hex) hex.value = value;
                }
            });
        }

        function resetColorsToDefault() {
            applyColors(BASE_COLOR_DEFAULTS);
            document.getElementById('colorPresetSelect').value = 'default';
            localStorage.setItem(ACTIVE_PRESET_KEY, 'default');
        }

        function getPresetsFromStorage() {
            try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
            catch { return []; }
        }

        function savePresetsToStorage(presets) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
        }

        function updatePresetSelect(presets, activeId) {
            const select = document.getElementById('colorPresetSelect');
            while (select.options.length > 1) select.remove(1);
            presets.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                select.appendChild(opt);
            });
            if (activeId) select.value = activeId;
        }

        function loadColorPresetsFromStorage() {
            const presets = getPresetsFromStorage();
            const activeId = localStorage.getItem(ACTIVE_PRESET_KEY) || 'default';
            updatePresetSelect(presets, activeId);
            if (activeId !== 'default') {
                const preset = presets.find(p => p.id === activeId);
                if (preset) applyColors(preset.colors);
            }
        }

        function loadColorPreset(presetId) {
            if (presetId === 'default') { resetColorsToDefault(); return; }
            const presets = getPresetsFromStorage();
            const preset = presets.find(p => p.id === presetId);
            if (preset) {
                applyColors(preset.colors);
                localStorage.setItem(ACTIVE_PRESET_KEY, presetId);
            }
        }

        function saveColorPreset() {
            const presets = getPresetsFromStorage();
            if (presets.length >= MAX_PRESETS) {
                alert('パターンは最大' + MAX_PRESETS + '個まで保存できます。\n不要なパターンを削除してから保存してください。');
                return;
            }
            const name = prompt('パターン名を入力してください:');
            if (!name || !name.trim()) return;
            const id = 'preset_' + Date.now();
            presets.push({ id, name: name.trim(), colors: getCurrentColors() });
            savePresetsToStorage(presets);
            updatePresetSelect(presets, id);
            localStorage.setItem(ACTIVE_PRESET_KEY, id);
        }

        function deleteColorPreset() {
            const select = document.getElementById('colorPresetSelect');
            const activeId = select.value;
            if (activeId === 'default') { alert('デフォルトは削除できません。'); return; }
            if (!confirm('パターン「' + select.options[select.selectedIndex].text + '」を削除しますか？')) return;
            let presets = getPresetsFromStorage();
            presets = presets.filter(p => p.id !== activeId);
            savePresetsToStorage(presets);
            updatePresetSelect(presets, 'default');
            resetColorsToDefault();
        }

        // ==================== 変更通知システム ====================

        const cnState = {
            notifications: [],
            history: [],
            unreadCount: 0,
            activeTab: 'latest',
            nextId: 1,
            filterRowId: ''   // 行ベルから開いた場合の現場名（空=フィルタなし）
        };

        function cnTimeNow() {
            const d = new Date();
            return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        }

        function updateNotifyBadge() {
            const badge = document.getElementById('cnBadge');
            if (cnState.unreadCount > 0) {
                badge.textContent = cnState.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }

        function showChangeToast(notification) {
            const container = document.getElementById('cnToastContainer');
            const toast = document.createElement('div');
            const typeClass = 'cn-toast-' + notification.type;
            const icons = { add: '🟢', modify: '🟡', delete: '🔴' };
            const typeLabels = { add: '追加', modify: '変更', delete: '削除' };

            toast.className = 'cn-toast ' + typeClass;
            toast.innerHTML =
                '<span class="cn-toast-icon">' + icons[notification.type] + '</span>' +
                '<div class="cn-toast-body">' +
                    '<div class="cn-toast-title">' + typeLabels[notification.type] + ' — ' + notification.user + '</div>' +
                    '<div class="cn-toast-desc">' + escapeHtml(notification.siteName) + '</div>' +
                '</div>' +
                '<span class="cn-toast-time">' + notification.time + '</span>';

            toast.onclick = function() {
                toast.classList.add('cn-toast-exit');
                setTimeout(function() { toast.remove(); }, 300);
                openChangeNotifyModal();
            };

            container.appendChild(toast);

            setTimeout(function() {
                if (toast.parentNode) {
                    toast.classList.add('cn-toast-exit');
                    setTimeout(function() { toast.remove(); }, 300);
                }
            }, 5000);
        }

        function openChangeNotifyModal() {
            cnState.filterRowId = '';
            // ヘッダーベルからは全既読
            cnState.notifications.forEach(function(n) { n._read = true; });
            cnState.unreadCount = 0;
            updateNotifyBadge();
            cnUpdateRowBells();
            // フィルタラベルを非表示
            var label = document.getElementById('cnRowFilterLabel');
            if (label) label.style.display = 'none';
            document.getElementById('changeNotifyModal').classList.add('active');
            renderLatestChanges();
            renderChangeHistory();
        }

        function cnOpenModalForRow(bellEl) {
            var row = bellEl.closest('tr');
            var siteName = cnGetRowSiteName(row);
            var pending = cnPendingMap.get(row);
            // 承認待ちの行 → ベルクリックで承認（既読化 + 変更適用 + ハイライト除去）
            if (pending) {
                if (pending.type === 'delete') {
                    // 削除はモーダルを開かずに承認のみ
                    cnApprovePending(row);
                    return;
                }
                cnApprovePending(row);
            }
            cnState.filterRowId = siteName;
            // 該当行の通知のみ既読
            cnState.notifications.forEach(function(n) {
                if (!n._read && n._rowId === siteName) n._read = true;
            });
            // 全体の未読数を再計算
            cnState.unreadCount = cnState.notifications.filter(function(n) { return !n._read; }).length;
            updateNotifyBadge();
            cnUpdateRowBells();
            // フィルタラベルを表示
            var label = document.getElementById('cnRowFilterLabel');
            if (label) {
                label.textContent = siteName;
                label.style.display = 'inline-block';
            }
            document.getElementById('changeNotifyModal').classList.add('active');
            renderLatestChanges();
            renderChangeHistory();
        }

        function closeChangeNotifyModal() {
            document.getElementById('changeNotifyModal').classList.remove('active');
            cnState.filterRowId = '';
        }

        // モーダル外クリックで閉じる
        document.getElementById('changeNotifyModal').addEventListener('click', function(e) {
            if (e.target === this) closeChangeNotifyModal();
        });

        function switchCnTab(tabName) {
            cnState.activeTab = tabName;
            document.querySelectorAll('.cn-tab').forEach(function(tab) {
                tab.classList.toggle('active', tab.dataset.tab === tabName);
            });
            document.querySelectorAll('.cn-tab-content').forEach(function(content) {
                content.classList.toggle('active', content.id === (tabName === 'latest' ? 'cnTabLatest' : 'cnTabHistory'));
            });
        }

        function renderLatestChanges() {
            const list = document.getElementById('cnCardList');
            var filtered = cnState.notifications;
            if (cnState.filterRowId) {
                filtered = filtered.filter(function(n) { return n._rowId === cnState.filterRowId; });
            }
            if (filtered.length === 0) {
                list.innerHTML = '<div class="cn-empty">変更通知はありません</div>';
                return;
            }

            const typeLabels = { add: '追加', modify: '変更', delete: '削除' };
            const smCategoryClassMapLocal = {
                '施設': 'category-facility', 'イベント': 'category-event',
                '交通': 'category-traffic', '高速': 'category-highway'
            };
            const smShiftClassMapLocal = { '昼': 'shift-day', '夜': 'shift-night' };

            list.innerHTML = filtered.map(function(n) {
                var cardClass = 'cn-card cn-card-' + n.type;
                var badgeClass = 'cn-type-badge cn-type-badge-' + n.type;
                var catClass = smCategoryClassMapLocal[n.category] || 'category-facility';
                var shiftClass = smShiftClassMapLocal[n.shift] || 'shift-day';

                var diffHtml = '';
                if (n.type === 'modify' && n.diffs) {
                    diffHtml = '<div class="cn-diff-list">' +
                        n.diffs.map(function(d) {
                            return '<div class="cn-diff-row">' +
                                '<span class="cn-diff-label">' + d.field + '</span>' +
                                '<span class="cn-diff-old">' + escapeHtml(d.oldVal) + '</span>' +
                                '<span class="cn-diff-arrow">→</span>' +
                                '<span class="cn-diff-new">' + escapeHtml(d.newVal) + '</span>' +
                            '</div>';
                        }).join('') +
                    '</div>';
                } else if (n.type === 'add' && n.details) {
                    diffHtml = '<div class="cn-diff-list">' +
                        n.details.map(function(d) {
                            return '<div class="cn-diff-row">' +
                                '<span class="cn-diff-label">' + d.field + '</span>' +
                                '<span class="cn-diff-new">' + escapeHtml(d.value) + '</span>' +
                            '</div>';
                        }).join('') +
                    '</div>';
                } else if (n.type === 'delete') {
                    diffHtml = '<div class="cn-diff-list"><div class="cn-diff-row"><span class="cn-diff-old">この行は削除されました</span></div></div>';
                }

                var stateClass = n.reverted ? ' cn-card-reverted' : (n._approved ? ' cn-card-approved' : '');
                var statusBadge = '';
                var actionsHtml = '';
                if (n.reverted) {
                    statusBadge = '<span class="cn-reverted-badge">キャンセル</span>';
                    actionsHtml = '<div class="cn-card-actions">' +
                        '<button class="cn-btn-reapprove" onclick="cnReapproveNotification(' + n.id + ')">適用する</button>' +
                    '</div>';
                } else {
                    if (n._approved) statusBadge = '<span class="cn-approved-badge">適用</span>';
                    actionsHtml = '<div class="cn-card-actions">' +
                        '<button class="cn-btn-revert" onclick="cnRevertNotification(' + n.id + ')">キャンセル</button>' +
                    '</div>';
                }

                return '<div class="' + cardClass + stateClass + '">' +
                    '<div class="cn-card-header">' +
                        '<span class="' + badgeClass + '">' + typeLabels[n.type] + '</span>' +
                        statusBadge +
                        '<span class="cn-card-user">' + escapeHtml(n.user) + '</span>' +
                        '<span class="cn-card-time">' + n.time + '</span>' +
                    '</div>' +
                    '<div class="cn-card-body">' +
                        '<div class="cn-card-site">' +
                            '<span class="shift-badge ' + shiftClass + '">' + n.shift + '</span>' +
                            '<span class="category-badge ' + catClass + '">' + n.category + '</span>' +
                            escapeHtml(n.siteName) +
                        '</div>' +
                        diffHtml +
                    '</div>' +
                    actionsHtml +
                '</div>';
            }).join('');
        }

        function renderChangeHistory() {
            const timeline = document.getElementById('cnTimeline');
            var filtered = cnState.history;
            if (cnState.filterRowId) {
                filtered = filtered.filter(function(h) { return h.siteName === cnState.filterRowId; });
            }
            if (filtered.length === 0) {
                timeline.innerHTML = '<div class="cn-empty">変更履歴はありません</div>';
                return;
            }

            const typeLabels = { add: '追加', modify: '変更', delete: '削除' };

            timeline.innerHTML = filtered.map(function(h) {
                return '<div class="cn-timeline-item tl-' + h.type + '">' +
                    '<div class="cn-tl-header">' +
                        '<span class="cn-tl-time">' + h.time + '</span>' +
                        '<span class="cn-tl-user">' + escapeHtml(h.user) + '</span>' +
                        '<span class="cn-tl-type cn-tl-type-' + h.type + '">' + typeLabels[h.type] + '</span>' +
                    '</div>' +
                    '<div class="cn-tl-content">' + escapeHtml(h.summary) + '</div>' +
                '</div>';
            }).join('');
        }

        function checkConflict(notification) {
            const siteModal = document.getElementById('siteModal');
            if (!siteModal.classList.contains('active')) return false;
            return true;
        }

        function showConflictBanner(notification) {
            const banner = document.getElementById('cnConflictBanner');
            const text = document.getElementById('cnConflictText');
            text.textContent = notification.user + 'が「' + notification.siteName + '」を変更しました。最新のデータに更新されます。';
            banner.style.display = 'flex';
        }

        function hideConflictBanner() {
            document.getElementById('cnConflictBanner').style.display = 'none';
        }

        function receiveChangeNotification(notification) {
            notification.id = cnState.nextId++;
            notification.reverted = false;
            notification._read = false;
            notification._rowId = notification.siteName || '';
            cnState.notifications.unshift(notification);
            cnState.history.unshift({
                type: notification.type,
                user: notification.user,
                time: notification.time,
                siteName: notification.siteName || '',
                summary: notification.siteName + (notification.type === 'modify' && notification.diffs
                    ? '（' + notification.diffs.map(function(d) { return d.field; }).join('・') + '）'
                    : '')
            });
            cnState.unreadCount++;
            updateNotifyBadge();

            if (checkConflict(notification)) {
                showConflictBanner(notification);
            }

            showChangeToast(notification);
            cnUpdateRowBells();
        }

        // --- デモシミュレーション（承認方式） ---
        let cnDemoInterval = null;
        let cnDemoRunning = false;
        let cnDemoIndex = 0;
        const cnPendingMap = new Map();

        const cnDemoSequence = [
            { type: 'modify', user: '山田（現場管理）', siteName: '国道〇号線 舗装工事', category: '交通', shift: '昼',
              diffs: [{ field: '時間', oldVal: '08:00 - 17:00', newVal: '09:00 - 18:00' }],
              apply: function(self) {
                  var row = cnFindRow('国道〇号線 舗装工事'); if (!row) return;
                  var tsEl = row.querySelector('.work-time-start');
                  var teEl = row.querySelector('.work-time-end');
                  var wtCell = row.querySelector('.col-work-time');
                  if (tsEl) cnShowCellDiff(tsEl, tsEl.textContent, '09:00');
                  if (teEl) cnShowCellDiff(teEl, teEl.textContent, '18:00');
                  if (wtCell) cnAddCellBadge(wtCell);
                  cnMarkPending(row, 'modify', function() {
                      if (tsEl) tsEl.textContent = '09:00';
                      if (teEl) teEl.textContent = '18:00';
                      cnCleanCellBadges(row);
                  });
              }},
            { type: 'add', user: '鈴木（受注担当）', siteName: '△△マンション 常駐警備', category: '施設', shift: '夜',
              details: [{ field: '会社', value: '△△不動産' }, { field: '区分', value: '施設（夜）' }, { field: '時間', value: '20:00 - 08:00' }, { field: '人数', value: '2名' }, { field: '集合', value: '19:30' }],
              apply: function(self) {
                  var tbody = document.querySelector('.grid-table tbody');
                  var no = tbody.querySelectorAll('tr').length + 1;
                  var tr = cnCreateRow({ no: no, gcClass: 'gc-row-touo', shiftClass: 'shift-night', shiftLabel: '夜',
                      categoryClass: 'category-facility', categoryLabel: '施設', company: '△△不動産',
                      siteName: '△△マンション 常駐警備', meetingTime: '19:30', meetingMethod: '直', meetingMethodClass: 'method-direct',
                      timeStart: '20:00', timeEnd: '08:00', count: '0/2', shortage: true });
                  tbody.appendChild(tr);
                  if (typeof renderMinimap === 'function') renderMinimap();
                  cnMarkPending(tr, 'add', function() {});
              }},
            { type: 'modify', user: '伊藤（配車担当）', siteName: '〇〇会館 展示会', category: 'イベント', shift: '昼',
              diffs: [{ field: '人数', oldVal: '1/2', newVal: '3/2' }, { field: '配置', oldVal: '山本', newVal: '山本, 吉田, 松本' }],
              apply: function(self) {
                  var row = cnFindRow('〇〇会館 展示会'); if (!row) return;
                  var countEl = row.querySelector('.count-display');
                  var countCell = countEl ? countEl.closest('td') : null;
                  if (countEl) cnShowCellDiff(countEl, countEl.textContent.trim(), '3/2');
                  if (countCell) cnAddCellBadge(countCell);
                  cnMarkPending(row, 'modify', function() {
                      if (countEl) { countEl.textContent = '3/2'; countEl.className = 'count-display count-over'; }
                      cnCleanCellBadges(row);
                  });
              }},
            { type: 'delete', user: '高橋（管理部）', siteName: '県道〇号 夜間規制', category: '高速', shift: '夜', diffs: null,
              apply: function(self) {
                  var row = cnFindRow('県道〇号 夜間規制'); if (!row) return;
                  cnMarkPending(row, 'delete', function() {
                      releaseRowEmployees(row);
                      row.remove(); cnRenumberRows();
                  });
              }},
            { type: 'add', user: '田中（営業部）', siteName: '□□公園 花火大会警備', category: 'イベント', shift: '昼',
              details: [{ field: '会社', value: '□□イベント' }, { field: '区分', value: 'イベント（昼）' }, { field: '時間', value: '16:00 - 22:00' }, { field: '人数', value: '5名' }, { field: '集合', value: '15:00' }],
              apply: function(self) {
                  var tbody = document.querySelector('.grid-table tbody');
                  var no = tbody.querySelectorAll('tr').length + 1;
                  var tr = cnCreateRow({ no: no, gcClass: 'gc-row-nikkei', shiftClass: 'shift-day', shiftLabel: '昼',
                      categoryClass: 'category-event', categoryLabel: 'イベント', company: '□□イベント',
                      siteName: '□□公園 花火大会警備', meetingTime: '15:00', meetingMethod: '会社', meetingMethodClass: 'method-company',
                      timeStart: '16:00', timeEnd: '22:00', count: '0/5', shortage: true });
                  tbody.appendChild(tr);
                  if (typeof renderMinimap === 'function') renderMinimap();
                  cnMarkPending(tr, 'add', function() {});
              }},
            { type: 'modify', user: '佐藤（営業部）', siteName: '〇〇ビル 巡回警備', category: '施設', shift: '昼',
              diffs: [{ field: '集合時間', oldVal: '08:45', newVal: '08:30' }],
              apply: function(self) {
                  var row = cnFindRow('〇〇ビル 巡回警備'); if (!row) return;
                  var mtEl = row.querySelector('.time-display');
                  var timeCell = mtEl ? mtEl.closest('td') : null;
                  if (mtEl) cnShowCellDiff(mtEl, mtEl.textContent, '08:30');
                  if (timeCell) cnAddCellBadge(timeCell);
                  cnMarkPending(row, 'modify', function() {
                      if (mtEl) mtEl.textContent = '08:30';
                      cnCleanCellBadges(row);
                  });
              }}
        ];

        // セル内差分表示ヘルパー
        function cnShowCellDiff(el, oldText, newText) {
            el.innerHTML = '<span class="cn-cell-old">' + oldText + '</span><div class="cn-cell-new">' + newText + '</div>';
        }

        function cnAddCellBadge(cell) {
            var badge = document.createElement('div');
            badge.className = 'cn-cell-badge';
            badge.textContent = '変更';
            cell.insertBefore(badge, cell.firstChild);
        }

        function cnCleanCellBadges(row) {
            var els = row.querySelectorAll('.cn-cell-badge');
            for (var i = 0; i < els.length; i++) els[i].remove();
        }

        function cnFindRow(siteName) {
            var rows = document.querySelectorAll('.grid-table tbody tr');
            for (var i = 0; i < rows.length; i++) {
                var sn = rows[i].querySelector('.site-name');
                if (sn && sn.textContent.trim() === siteName) return rows[i];
            }
            return null;
        }

        function cnMarkPending(row, type, commitFn) {
            row.classList.add('cn-pending');
            cnPendingMap.set(row, { type: type, commit: commitFn });
            // 追加・削除バッジ → No列に配置
            if (type === 'add' || type === 'delete') {
                var noCell = row.querySelector('.col-no');
                if (noCell) {
                    var badge = document.createElement('span');
                    badge.className = 'cn-row-badge cn-row-badge-' + type;
                    badge.textContent = type === 'add' ? '追加' : '削除';
                    noCell.appendChild(badge);
                }
            }
            // セルグロー（box-shadow inset）
            if (type === 'modify') {
                // 変更：cn-cell-badgeを持つセルのみ明滅
                var badgeCells = row.querySelectorAll('.cn-cell-badge');
                for (var j = 0; j < badgeCells.length; j++) {
                    var td = badgeCells[j].closest('td');
                    if (td) td.classList.add('cn-cell-glow-modify');
                }
            } else {
                // 追加・削除：行全体を明滅
                var cells = row.querySelectorAll('td');
                for (var j = 0; j < cells.length; j++) {
                    cells[j].classList.add('cn-cell-glow-' + type);
                }
            }
            // 行クリックで承認（captureフェーズでインラインonclickより先に発火）
            row._cnClickHandler = function(e) {
                // D&D操作中やボタンクリックは除外
                if (e.target.closest('button, .vehicle-send-section')) return;
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                cnApprovePending(row);
            };
            row.addEventListener('click', row._cnClickHandler, true);
        }

        function cnApprovePending(row) {
            var pending = cnPendingMap.get(row);
            if (!pending) return;
            // 対応する通知を承認済みにマーク
            var notif = cnState.notifications.find(function(n) { return n._row === row; });
            // delete承認前に行HTMLを保存（後で復元可能にする）
            if (pending.type === 'delete' && notif) {
                notif._deletedRowHtml = row.outerHTML;
                notif._deletedRowIndex = Array.from(row.parentNode.children).indexOf(row);
                notif._deletedRowParent = row.parentNode;
            }
            pending.commit();
            row.classList.remove('cn-pending');
            // セルグロー除去
            var cells = row.querySelectorAll('td');
            for (var j = 0; j < cells.length; j++) {
                cells[j].classList.remove('cn-cell-glow-add', 'cn-cell-glow-modify', 'cn-cell-glow-delete');
            }
            var els = row.querySelectorAll('.cn-row-badge, .cn-cell-badge');
            for (var i = 0; i < els.length; i++) els[i].remove();
            // 行クリックハンドラ解除
            if (row._cnClickHandler) {
                row.removeEventListener('click', row._cnClickHandler, true);
                row._cnClickHandler = null;
            }
            cnPendingMap.delete(row);
            if (notif) {
                notif._approved = true;
                notif._read = true;
            }
            if (pending.type !== 'delete') {
                row.classList.add('cn-flash-approve');
                setTimeout(function() { row.classList.remove('cn-flash-approve'); }, 2000);
            }
            // 未読数再計算 + ベル更新
            cnState.unreadCount = cnState.notifications.filter(function(n) { return !n._read; }).length;
            updateNotifyBadge();
            cnUpdateRowBells();
            // モーダルが開いていれば再描画
            if (document.getElementById('changeNotifyModal').classList.contains('active')) {
                renderLatestChanges();
            }
            if (typeof renderMinimap === 'function') renderMinimap();
        }

        function cnFlashRow(row, type) {
            row.classList.add('cn-flash-' + type);
            setTimeout(function() { row.classList.remove('cn-flash-' + type); }, 3000);
        }

        function cnRenumberRows() {
            var rows = document.querySelectorAll('.grid-table tbody tr');
            for (var i = 0; i < rows.length; i++) {
                var no = rows[i].querySelector('.col-no');
                if (!no) continue;
                // .cn-overlay等の子要素を破壊しないよう、テキストノードのみ更新
                var textNode = no.firstChild;
                if (textNode && textNode.nodeType === 3) {
                    textNode.textContent = i + 1;
                } else {
                    no.insertBefore(document.createTextNode(i + 1), no.firstChild);
                }
            }
            if (typeof renderMinimap === 'function') renderMinimap();
        }

        // --- 行ミニベルアイコン ---

        function cnGetRowSiteName(row) {
            var sn = row.querySelector('.site-name');
            return sn ? sn.textContent.trim() : '';
        }

        function cnGetUnreadForSite(siteName) {
            if (!siteName) return 0;
            return cnState.notifications.filter(function(n) {
                return !n._read && n._rowId === siteName;
            }).length;
        }

        function cnGetRowBellHtml(row) {
            var siteName = cnGetRowSiteName(row);
            var count = cnGetUnreadForSite(siteName);
            var cls = count > 0 ? 'cn-row-bell has-unread' : 'cn-row-bell';
            return '<span class="' + cls + '" onclick="event.stopPropagation(); cnOpenModalForRow(this)" title="この現場の変更通知">' +
                '<img src="mockup/icons/bell.svg" class="cn-row-bell-img">' +
                (count > 0 ? '<span class="cn-row-bell-dot"></span>' : '') +
            '</span>';
        }

        function cnInsertRowBells() {
            var rows = document.querySelectorAll('.grid-table tbody tr');
            for (var i = 0; i < rows.length; i++) {
                var noCell = rows[i].querySelector('.col-no');
                if (!noCell || noCell.querySelector('.cn-row-bell')) continue;
                var bell = document.createElement('span');
                bell.className = 'cn-row-bell';
                bell.setAttribute('onclick', 'event.stopPropagation(); cnOpenModalForRow(this)');
                bell.title = 'この現場の変更通知';
                bell.innerHTML = '<img src="mockup/icons/bell.svg" class="cn-row-bell-img">';
                noCell.appendChild(bell);
            }
        }

        function cnUpdateRowBells() {
            var rows = document.querySelectorAll('.grid-table tbody tr');
            for (var i = 0; i < rows.length; i++) {
                var noCell = rows[i].querySelector('.col-no');
                if (!noCell) continue;
                var bell = noCell.querySelector('.cn-row-bell');
                if (!bell) continue;
                var siteName = cnGetRowSiteName(rows[i]);
                var count = cnGetUnreadForSite(siteName);
                var dot = bell.querySelector('.cn-row-bell-dot');
                if (count > 0) {
                    bell.classList.add('has-unread');
                    if (!dot) {
                        dot = document.createElement('span');
                        dot.className = 'cn-row-bell-dot';
                        bell.appendChild(dot);
                    }
                } else {
                    bell.classList.remove('has-unread');
                    if (dot) dot.remove();
                }
            }
        }

        // 初期化時にベルを挿入
        cnInsertRowBells();

        // --- 元に戻す / やっぱり反映 ---

        // revert/reapprove後のオーバーレイ＋差分可視化
        function cnShowRevertOverlay(row, type, diffs) {
            // 既存の差分要素を先にクリーンアップ（重複防止）
            var staleEls = row.querySelectorAll('.cn-row-badge, .cn-cell-badge, .cn-cell-old, .cn-cell-new');
            for (var i = 0; i < staleEls.length; i++) staleEls[i].remove();

            // 該当行の通知を未読に戻す
            var siteName = cnGetRowSiteName(row);
            if (siteName) {
                cnState.notifications.forEach(function(n) {
                    if (n._rowId === siteName) n._read = false;
                });
                cnState.unreadCount = cnState.notifications.filter(function(n) { return !n._read; }).length;
                updateNotifyBadge();
                cnUpdateRowBells();
            }

            row.classList.add('cn-pending');
            // バッジ
            var noCell = row.querySelector('.col-no');
            if (noCell && (type === 'add' || type === 'delete')) {
                var badge = document.createElement('span');
                badge.className = 'cn-row-badge cn-row-badge-' + (type === 'add' ? 'delete' : 'add');
                badge.textContent = type === 'add' ? '削除' : '復元';
                noCell.appendChild(badge);
            }
            // modify差分表示（バッジはtdセル単位で重複防止）
            if (type === 'modify' && diffs) {
                var badgedTds = [];
                diffs.forEach(function(d) {
                    if (d.el) {
                        cnShowCellDiff(d.el, d.oldText, d.newText);
                        var td = d.td || d.el.closest('td');
                        if (td && badgedTds.indexOf(td) === -1) {
                            cnAddCellBadge(td);
                            badgedTds.push(td);
                        }
                    }
                });
            }
            // 行クリックで確認済みとして除去
            if (row._cnClickHandler) {
                row.removeEventListener('click', row._cnClickHandler, true);
            }
            row._cnClickHandler = function(e) {
                if (e.target.closest('button, .vehicle-send-section')) return;
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                row.classList.remove('cn-pending');
                var els = row.querySelectorAll('.cn-row-badge, .cn-cell-badge');
                for (var i = 0; i < els.length; i++) els[i].remove();
                // modifyの場合、差分表示をクリーンアップ（現在値のみ表示）
                var oldSpans = row.querySelectorAll('.cn-cell-old');
                for (var i = 0; i < oldSpans.length; i++) oldSpans[i].remove();
                var newSpans = row.querySelectorAll('.cn-cell-new');
                for (var i = 0; i < newSpans.length; i++) {
                    var parent = newSpans[i].parentElement;
                    var text = newSpans[i].textContent;
                    parent.textContent = text;
                }
                // 該当行の通知を既読に
                var sn = cnGetRowSiteName(row);
                if (sn) {
                    cnState.notifications.forEach(function(n) {
                        if (n._rowId === sn) n._read = true;
                    });
                    cnState.unreadCount = cnState.notifications.filter(function(n) { return !n._read; }).length;
                    updateNotifyBadge();
                    cnUpdateRowBells();
                }
                row.removeEventListener('click', row._cnClickHandler, true);
                row._cnClickHandler = null;
            };
            row.addEventListener('click', row._cnClickHandler, true);
        }

        function cnClearPending(row) {
            cnPendingMap.delete(row);
            row.classList.remove('cn-pending');
            var els = row.querySelectorAll('.cn-row-badge, .cn-cell-badge');
            for (var i = 0; i < els.length; i++) els[i].remove();
            if (row._cnClickHandler) {
                row.removeEventListener('click', row._cnClickHandler, true);
                row._cnClickHandler = null;
            }
        }

        function cnRevertNotification(id) {
            var n = cnState.notifications.find(function(x) { return x.id === id; });
            if (!n || n.reverted) return;

            if (n._approved) {
                // --- 承認済みからのrevert ---
                if (n.type === 'modify') {
                    var row = n._row || cnFindRow(n.siteName);
                    if (row && n._modifyData) {
                        // セルをクリーン状態にして元の値を復元
                        n._modifyData.forEach(function(d) { d.el.textContent = d.originalText; });
                        // 差分可視化（変更後B → 元の値A）
                        var diffs = n._modifyData.map(function(d) {
                            return { el: d.el, td: d.td, oldText: d.changedText, newText: d.originalText };
                        });
                        cnShowRevertOverlay(row, 'modify', diffs);
                    }
                } else if (n.type === 'add') {
                    var row = n._row || cnFindRow(n.siteName);
                    if (row) { row.remove(); cnRenumberRows(); }
                } else if (n.type === 'delete') {
                    // 保存済みHTMLから行を復元
                    if (n._deletedRowHtml && n._deletedRowParent) {
                        var temp = document.createElement('tbody');
                        temp.innerHTML = n._deletedRowHtml;
                        var restored = temp.firstChild;
                        var parent = n._deletedRowParent;
                        var siblings = parent.children;
                        if (n._deletedRowIndex < siblings.length) {
                            parent.insertBefore(restored, siblings[n._deletedRowIndex]);
                        } else {
                            parent.appendChild(restored);
                        }
                        n._row = restored;
                        cnRenumberRows();
                        cnShowRevertOverlay(restored, 'delete', null);
                    }
                }
            } else {
                // --- 未承認（pending）からのrevert ---
                if (n.type === 'modify') {
                    var row = n._row || cnFindRow(n.siteName);
                    if (!row || !n._modifyData) return;
                    // セルをクリーン状態にして元の値を復元
                    n._modifyData.forEach(function(d) { d.el.textContent = d.originalText; });
                    cnClearPending(row);
                    // 差分可視化（変更後B → 元の値A）
                    var revertDiffs = n._modifyData.map(function(d) {
                        return { el: d.el, td: d.td, oldText: d.changedText, newText: d.originalText };
                    });
                    cnShowRevertOverlay(row, 'modify', revertDiffs);
                } else if (n.type === 'add') {
                    var row = n._row || cnFindRow(n.siteName);
                    if (row) { releaseRowEmployees(row); cnPendingMap.delete(row); row.remove(); cnRenumberRows(); }
                } else if (n.type === 'delete') {
                    var row = n._row || cnFindRow(n.siteName);
                    if (!row) return;
                    cnClearPending(row);
                }
            }

            n.reverted = true;
            n._approved = false;
            renderLatestChanges();
        }

        function cnReapproveNotification(id) {
            var n = cnState.notifications.find(function(x) { return x.id === id; });
            if (!n || !n.reverted) return;

            if (n.type === 'modify') {
                var row = n._row || cnFindRow(n.siteName);
                if (row && n._modifyData) {
                    // revert状態をクリア
                    row.classList.remove('cn-pending');
                    var els = row.querySelectorAll('.cn-row-badge, .cn-cell-badge');
                    for (var i = 0; i < els.length; i++) els[i].remove();
                    if (row._cnClickHandler) {
                        row.removeEventListener('click', row._cnClickHandler, true);
                        row._cnClickHandler = null;
                    }
                    // セルをクリーン状態にして変更後の値を再設定
                    n._modifyData.forEach(function(d) { d.el.textContent = d.changedText; });
                    // 差分可視化（元の値A → 変更後B）
                    var diffs = n._modifyData.map(function(d) {
                        return { el: d.el, td: d.td, oldText: d.originalText, newText: d.changedText };
                    });
                    cnShowRevertOverlay(row, 'modify', diffs);
                }
            } else if (n.type === 'add') {
                // 行を再作成し即承認
                if (n._demoItem && n._demoItem.apply) {
                    n._demoItem.apply(n._demoItem);
                    var newRow = cnFindRow(n.siteName);
                    if (newRow) {
                        cnApprovePending(newRow);
                        n._row = newRow;
                        cnShowRevertOverlay(newRow, 'add', null);
                    }
                }
            } else if (n.type === 'delete') {
                var row = n._row || cnFindRow(n.siteName);
                if (row) {
                    // 再削除前に行HTMLを保存
                    n._deletedRowHtml = row.outerHTML;
                    n._deletedRowIndex = Array.from(row.parentNode.children).indexOf(row);
                    n._deletedRowParent = row.parentNode;
                    releaseRowEmployees(row);
                    row.remove();
                    cnRenumberRows();
                }
            }

            n.reverted = false;
            n._approved = true;
            renderLatestChanges();
        }

        function cnCreateRow(d) {
            var tr = document.createElement('tr');
            tr.className = d.gcClass;
            tr.setAttribute('onclick', 'selectRow(this, event)');
            var countClass = d.shortage ? 'count-display count-shortage' : 'count-display count-ok';
            tr.innerHTML =
                '<td class="col-no">' + d.no +
                    '<span class="cn-row-bell" onclick="event.stopPropagation(); cnOpenModalForRow(this)" title="この現場の変更通知">' +
                        '<img src="mockup/icons/bell.svg" class="cn-row-bell-img">' +
                    '</span></td>' +
                '<td class="col-site-info clickable-cell" onclick="openSiteModal(this)">' +
                  '<div class="site-info"><div class="site-badges">' +
                    '<span class="shift-badge ' + d.shiftClass + '">' + d.shiftLabel + '</span>' +
                    '<span class="category-badge ' + d.categoryClass + '">' + d.categoryLabel + '</span>' +
                  '</div><div class="site-details">' +
                    '<div class="company">' + d.company + '</div>' +
                    '<div class="site-name">' + d.siteName + '</div>' +
                  '</div></div></td>' +
                '<td class="clickable-cell" onclick="openMeetingModal(this, event)">' +
                  '<span class="time-display">' + d.meetingTime + '</span>' +
                  '<span class="contact-badge ' + d.meetingMethodClass + '">' + d.meetingMethod + '</span></td>' +
                '<td class="col-work-time clickable-cell" onclick="openWorkTimeModal(this, event)"' +
                  ' data-start-time="' + d.timeStart + '" data-end-time="' + d.timeEnd + '">' +
                  '<span class="work-time-start">' + d.timeStart + '</span>' +
                  '<span class="work-time-end">' + d.timeEnd + '</span></td>' +
                '<td class="clickable-cell" onclick="startCountEdit(this, event)">' +
                  '<span class="' + countClass + '">' + d.count + '</span>' +
                  (d.shortage ? '<span class="count-shortage-badge">不足</span>' : '') + '</td>' +
                '<td><div class="assignment-zone" ondrop="drop(event)" ondragover="allowDrop(event)" ondragleave="dragLeave(event)"></div></td>' +
                '<td class="col-badge clickable-cell" onclick="openWorkModal(this, event)"></td>' +
                '<td class="col-map clickable-cell" onclick="openMapModal(this, ' + d.no + ')"></td>' +
                '<td class="col-vt"><div class="vt-split-zone"><div class="vehicle-drop-zone" ondrop="vtDrop(event)" ondragover="vtAllowDrop(event)" ondragleave="vtDragLeave(event)"></div><div class="etc-drop-zone" ondrop="vtDrop(event)" ondragover="vtAllowDrop(event)" ondragleave="vtDragLeave(event)"></div></div></td>' +
                '<td class="col-notes clickable-cell" onclick="openNotesModal(this, event)"></td>';
            return tr;
        }

        function sendDemoNotification() {
            if (cnDemoIndex >= cnDemoSequence.length) {
                toggleChangeNotifyDemo();
                return;
            }
            var item = cnDemoSequence[cnDemoIndex];
            cnDemoIndex++;
            var n = { type: item.type, user: item.user, siteName: item.siteName,
                category: item.category, shift: item.shift, time: cnTimeNow(),
                diffs: item.diffs ? item.diffs.map(function(d) { return Object.assign({}, d); }) : null,
                details: item.details ? item.details.map(function(d) { return Object.assign({}, d); }) : null };
            n._demoItem = item;
            receiveChangeNotification(n);
            if (item.apply) item.apply(item);
            // 通知と行をリンク
            var row = cnFindRow(n.siteName);
            if (row) {
                n._row = row;
                var pending = cnPendingMap.get(row);
                if (pending) n._commitFn = pending.commit;
                // modify: 不変のテキスト値と要素参照を保存（DOM状態に依存しない）
                if (n.type === 'modify') {
                    var modifyData = [];
                    row.querySelectorAll('.cn-cell-old').forEach(function(el) {
                        var parent = el.parentElement;
                        var newSpan = parent.querySelector('.cn-cell-new');
                        modifyData.push({
                            el: parent,
                            td: parent.closest('td'),
                            originalText: el.textContent,
                            changedText: newSpan ? newSpan.textContent : ''
                        });
                    });
                    n._modifyData = modifyData;
                }
            }
        }

        function toggleChangeNotifyDemo() {
            var btn = document.getElementById('cnDemoBtn');
            if (cnDemoRunning) {
                clearInterval(cnDemoInterval);
                cnDemoInterval = null;
                cnDemoRunning = false;
                btn.textContent = '▶ デモ開始';
                btn.style.background = '';
                btn.style.color = '';
            } else {
                cnState.notifications = [];
                cnState.history = [];
                cnState.unreadCount = 0;
                cnState.nextId = 1;
                cnPendingMap.clear();
                updateNotifyBadge();
                cnDemoIndex = 0;
                cnDemoRunning = true;
                btn.textContent = '⏹ デモ停止';
                btn.style.background = '#e53e3e';
                btn.style.color = '#fff';
                sendDemoNotification();
                cnDemoInterval = setInterval(sendDemoNotification, 3000);
            }
        }

        // --- フッター詳細情報 折りたたみ ---
        function toggleFooterDetails() {
            var content = document.getElementById('footerDetailsContent');
            var icon = document.querySelector('.footer-toggle-icon');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.classList.add('open');
            } else {
                content.style.display = 'none';
                icon.classList.remove('open');
            }
        }

        // --- カスタム時間ピッカー（10分刻み） ---
        let timePickerTargetId = null;
        let timePickerSelectedHour = null;

        function openTimePicker(inputId, anchorEl) {
            const dropdown = document.getElementById('timePickerDropdown');
            if (timePickerTargetId === inputId && dropdown.style.display !== 'none') {
                closeTimePicker();
                return;
            }
            const input = document.getElementById(inputId);
            const currentVal = input.value || '';
            const parts = currentVal.split(':');
            const currentHour = parts.length >= 2 ? parseInt(parts[0]) : null;
            const currentMin = parts.length >= 2 ? parseInt(parts[1]) : null;

            timePickerTargetId = inputId;
            timePickerSelectedHour = currentHour;

            const hoursEl = document.getElementById('timePickerHours');
            let hhtml = '';
            for (let h = 0; h < 24; h++) {
                const sel = h === currentHour ? ' ob-time-selected' : '';
                hhtml += `<div class="ob-time-option${sel}" data-value="${h}" onclick="selectTimeHour(${h})">${String(h).padStart(2, '0')}</div>`;
            }
            hoursEl.innerHTML = hhtml;

            const minsEl = document.getElementById('timePickerMinutes');
            let mhtml = '';
            for (let m = 0; m < 60; m += 10) {
                const sel = m === currentMin ? ' ob-time-selected' : '';
                mhtml += `<div class="ob-time-option${sel}" data-value="${m}" onclick="selectTimeMinute(${m})">${String(m).padStart(2, '0')}</div>`;
            }
            minsEl.innerHTML = mhtml;

            const el = anchorEl || input;
            const rect = el.getBoundingClientRect();
            dropdown.style.display = 'flex';
            const ddRect = dropdown.getBoundingClientRect();
            let left = rect.left;
            let top = rect.bottom + 4;
            if (left + ddRect.width > window.innerWidth) left = window.innerWidth - ddRect.width - 8;
            if (top + ddRect.height > window.innerHeight) top = rect.top - ddRect.height - 4;
            dropdown.style.left = left + 'px';
            dropdown.style.top = top + 'px';

            if (currentHour !== null) {
                const hourOpt = hoursEl.children[currentHour];
                if (hourOpt) hourOpt.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }

        function selectTimeHour(h) {
            timePickerSelectedHour = h;
            document.querySelectorAll('#timePickerHours .ob-time-option').forEach(el => {
                el.classList.toggle('ob-time-selected', parseInt(el.dataset.value) === h);
            });
        }

        function selectTimeMinute(m) {
            if (timePickerSelectedHour === null) timePickerSelectedHour = 0;
            const input = document.getElementById(timePickerTargetId);
            input.value = `${String(timePickerSelectedHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            closeTimePicker();
        }

        function closeTimePicker() {
            const dropdown = document.getElementById('timePickerDropdown');
            if (dropdown) dropdown.style.display = 'none';
            timePickerTargetId = null;
            timePickerSelectedHour = null;
        }

        document.addEventListener('mousedown', function (e) {
            const dropdown = document.getElementById('timePickerDropdown');
            if (!dropdown || dropdown.style.display === 'none') return;
            if (dropdown.contains(e.target)) return;
            if (e.target.classList.contains('ob-time-input') || e.target.classList.contains('ob-time-picker-icon')) return;
            closeTimePicker();
        });

        // ============================================
        // 現場詳細入力モーダル — 新機能
        // ============================================

        // --- データ定義 ---
        const branchList = ['東央警備', 'Nikkeiホールディングス', '全日本エンタープライズ'];
        const shiftList = ['昼', '夜'];

        // 区分名 → CSSクラス マッピング
        const smCategoryClassMap = {
            '施設': 'category-facility',
            'イベント': 'category-event',
            '交通': 'category-traffic',
            '高速': 'category-highway',
            '応援交通': 'category-support-traffic',
            '応援イベント': 'category-support-event',
            '応援高速': 'category-support-highway',
            '研修': 'category-training',
            '社内': 'category-company',
        };
        // 昼夜 → CSSクラス マッピング
        const smShiftClassMap = { '昼': 'shift-day', '夜': 'shift-night' };

        let smBadgeDefinitions = [
            { id: 'facility',        name: '施設',     children: [] },
            { id: 'event',           name: 'イベント', children: [] },
            { id: 'highway',         name: '高速',     children: [
                { id: 'hw-lane',     name: '車線規制', children: [
                    { id: 'hw-lane-sign',  name: '標識車' },
                    { id: 'hw-lane-mat',   name: '規制材' },
                    { id: 'hw-lane-light', name: '保安灯' },
                ]},
                { id: 'hw-shoulder', name: '路肩規制', children: [
                    { id: 'hw-sh-cone', name: 'コーン' },
                    { id: 'hw-sh-bar',  name: 'バー' },
                ]},
                { id: 'hw-booth',    name: 'ブース規制', children: [] },
                { id: 'hw-security', name: '保安員', children: [] },
            ]},
            { id: 'traffic',         name: '交通',     children: [
                { id: 'tr-alternate', name: '片側交互', children: [
                    { id: 'tr-alt-flag', name: '旗' },
                    { id: 'tr-alt-sign', name: '看板' },
                ]},
                { id: 'tr-closure',   name: '通行止め', children: [] },
            ]},
            { id: 'support-traffic', name: '応援交通', children: [] },
        ];

        let smCategoryToBadgeId = {
            '施設':     'facility',
            'イベント': 'event',
            '高速':     'highway',
            '交通':     'traffic',
            '応援交通': 'support-traffic',
        };

        let smBadgeNextId = 1;
        function smGenerateBadgeId(prefix) {
            return `${prefix}-sm-${smBadgeNextId++}`;
        }

        function smGetCategoryList() {
            return smBadgeDefinitions.map(b => b.name);
        }

        // --- 状態変数 ---
        let smChipSelected = { branch: null, category: null, shift: null };

        // バッジ状態
        let smSelectedParentBadge = null;
        let smSelectedChildBadges = [];
        let smSelectedGrandchildBadges = {};
        let smDeletedBadgeInfo = null;
        let smBadgeUndoTimer = null;
        let smBadgeSnapshot = null;

        // 現場監督候補状態
        let smSvCandidateList = [];
        let smSvDeletedCandidate = null;
        let smSvUndoTimer = null;
        let smSvDragSrcIdx = null;

        // デフォルトサブタスクラベルプレフィックス
        const smDefaultSubTaskPrefix = '工事名';

        // --- デモ用 現場監督候補データ ---
        const smDemoSupervisorCandidates = [
            { name: '山田太郎', tel: '090-1234-5678' },
            { name: '佐藤次郎', tel: '080-9876-5432' },
            { name: '田中三郎', tel: '070-5555-1234' },
        ];

        // ============================================
        // チップ選択
        // ============================================
        function smRenderChips(containerId, items, selectedValue, groupKey) {
            const container = document.getElementById(containerId);
            if (!container) return;
            let html = '';
            items.forEach(item => {
                const active = item === selectedValue ? ' ob-chip-active' : '';
                html += `<button type="button" class="ob-row-chip${active}" onclick="smSelectChip('${groupKey}', '${escapeHtml(item)}')">${escapeHtml(item)}</button>`;
            });
            container.innerHTML = html;
        }

        function smSelectChip(groupKey, value) {
            smChipSelected[groupKey] = value;
            if (groupKey === 'branch') smRenderChips('smBranchChips', branchList, value, 'branch');
            else if (groupKey === 'category') {
                smRenderChips('smCategoryChips', smGetCategoryList(), value, 'category');
                // 区分が変わったらバッジも更新
                smRenderBadgeSection(value, [], {});
            }
            else if (groupKey === 'shift') smRenderChips('smShiftChips', shiftList, value, 'shift');
        }

        function smAddCategory() {
            const name = prompt('新しい区分名を入力:');
            if (!name || !name.trim()) return;
            const trimmed = name.trim();
            if (smGetCategoryList().includes(trimmed)) {
                alert('同名の区分が既に存在します。');
                return;
            }
            const badgeId = smGenerateBadgeId('cat');
            smBadgeDefinitions.push({ id: badgeId, name: trimmed, children: [] });
            smCategoryToBadgeId[trimmed] = badgeId;
            smSelectChip('category', trimmed);
        }

        // ============================================
        // 業務詳細（サブタスク）
        // ============================================
        function smRenderSubTaskEntries(subTasks) {
            const list = document.getElementById('smSubTaskList');
            if (!list) return;
            list.innerHTML = '';
            if (!subTasks || subTasks.length === 0) return;
            subTasks.forEach((st, idx) => {
                const entry = document.createElement('div');
                entry.className = 'ob-sub-task-entry';
                entry.dataset.idx = idx;
                entry.innerHTML =
                    `<input type="text" class="ob-sub-label-input" value="${escapeHtml(st.label)}" placeholder="項目名" oninput="smUpdatePlanTaskName()">` +
                    `<input type="text" class="ob-sub-value-input" value="${escapeHtml(st.value)}" placeholder="内容を入力" oninput="smUpdatePlanTaskName()">` +
                    `<button type="button" class="ob-btn-remove-sub" onclick="smRemoveSubTask(${idx})" title="削除">×</button>`;
                list.appendChild(entry);
            });
            smUpdatePlanTaskName();
        }

        function smAddSubTask() {
            const list = document.getElementById('smSubTaskList');
            if (!list) return;
            const currentCount = list.children.length;
            const nums = ['①','②','③','④','⑤'];
            const num = nums[currentCount] || (currentCount + 1);
            const defaultLabel = smDefaultSubTaskPrefix + num;
            const idx = currentCount;
            const entry = document.createElement('div');
            entry.className = 'ob-sub-task-entry';
            entry.dataset.idx = idx;
            entry.innerHTML =
                `<input type="text" class="ob-sub-label-input" value="${escapeHtml(defaultLabel)}" placeholder="項目名" oninput="smUpdatePlanTaskName()">` +
                `<input type="text" class="ob-sub-value-input" value="" placeholder="内容を入力" oninput="smUpdatePlanTaskName()">` +
                `<button type="button" class="ob-btn-remove-sub" onclick="smRemoveSubTask(${idx})" title="削除">×</button>`;
            list.appendChild(entry);
            entry.querySelector('.ob-sub-value-input').focus();
            smUpdatePlanTaskName();
        }

        function smRemoveSubTask(idx) {
            const list = document.getElementById('smSubTaskList');
            if (!list) return;
            const entries = list.querySelectorAll('.ob-sub-task-entry');
            if (entries[idx]) entries[idx].remove();
            list.querySelectorAll('.ob-sub-task-entry').forEach((entry, i) => {
                entry.dataset.idx = i;
                entry.querySelector('.ob-btn-remove-sub').setAttribute('onclick', `smRemoveSubTask(${i})`);
            });
            smUpdatePlanTaskName();
        }

        function smCollectSubTasks() {
            const list = document.getElementById('smSubTaskList');
            if (!list) return [];
            const entries = list.querySelectorAll('.ob-sub-task-entry');
            const subTasks = [];
            entries.forEach(entry => {
                const label = entry.querySelector('.ob-sub-label-input').value.trim();
                const value = entry.querySelector('.ob-sub-value-input').value.trim();
                subTasks.push({ label: label || '項目', value });
            });
            return subTasks;
        }

        // ============================================
        // バッジ（3階層）
        // ============================================
        function smRenderBadgeSection(category, childIds, grandchildMap) {
            smSelectedParentBadge = smCategoryToBadgeId[category] || null;
            smSelectedChildBadges = childIds ? [...childIds] : [];
            smSelectedGrandchildBadges = grandchildMap ? JSON.parse(JSON.stringify(grandchildMap)) : {};

            const display = document.getElementById('smBadgeParentDisplay');
            if (!display) return;
            if (!display) return;
            const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
            if (parent) {
                display.textContent = parent.name;
                display.className = 'ob-badge-parent-display';
            } else {
                display.textContent = category || '-';
                display.className = 'ob-badge-parent-display ob-badge-parent-unknown';
            }
            smRenderChildBadges();
        }

        function smRenderChildBadges() {
            const container = document.getElementById('smBadgeChildList');
            const wrapper = document.getElementById('smBadgeChildSection');
            if (!container || !wrapper) return;

            if (!smSelectedParentBadge) {
                wrapper.style.display = 'none';
                return;
            }
            const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
            if (!parent || parent.children.length === 0) {
                container.innerHTML = '<span class="ob-badge-empty">バッジなし</span>';
                wrapper.style.display = 'flex';
                return;
            }

            let html = '';
            parent.children.forEach((c, i) => {
                const sel = smSelectedChildBadges.includes(c.id) ? ' ob-badge-selected' : '';
                html += `<div class="ob-badge-drag-item" draggable="true" data-badge-idx="${i}" data-badge-id="${c.id}" data-badge-level="child">`;
                html += `<span class="ob-badge-drag-grip">☰</span>`;
                html += `<button type="button" class="ob-badge-chip ob-badge-child${sel}" onclick="smToggleChildBadge('${c.id}')">${escapeHtml(c.name)}</button>`;
                html += `<button type="button" class="ob-badge-delete-btn" onclick="smDeleteBadge('child','${c.id}')" title="削除">✕</button>`;
                html += `</div>`;
            });

            // 選択済み子バッジの孫セクション
            parent.children.forEach(c => {
                if (smSelectedChildBadges.includes(c.id) && c.children) {
                    html += smRenderGrandchildSection(c);
                }
            });

            container.innerHTML = html;
            wrapper.style.display = 'flex';
            smInitBadgeDragDrop('child');
            smInitBadgeDragDrop('grandchild');
        }

        function smRenderGrandchildSection(childBadge) {
            const gcIds = smSelectedGrandchildBadges[childBadge.id] || [];
            let html = `<div class="ob-grandchild-section" data-child-id="${childBadge.id}">`;
            html += `<div class="ob-grandchild-header">`;
            html += `<span class="ob-grandchild-label">${escapeHtml(childBadge.name)} <span class="ob-grandchild-arrow">›</span> 詳細</span>`;
            html += `<button type="button" class="ob-btn-add-badge ob-btn-add-gc" onclick="smAddGrandchildBadge('${childBadge.id}')">+ 追加</button>`;
            html += `</div>`;
            if (!childBadge.children || childBadge.children.length === 0) {
                html += `<div class="ob-grandchild-chips"><span class="ob-badge-empty">詳細なし</span></div>`;
            } else {
                html += `<div class="ob-grandchild-chips">`;
                childBadge.children.forEach((gc, gi) => {
                    const sel = gcIds.includes(gc.id) ? ' ob-badge-selected' : '';
                    html += `<div class="ob-badge-drag-item ob-gc-drag-item" draggable="true" data-badge-idx="${gi}" data-badge-id="${gc.id}" data-badge-level="grandchild" data-parent-child="${childBadge.id}">`;
                    html += `<span class="ob-badge-drag-grip">☰</span>`;
                    html += `<button type="button" class="ob-badge-chip ob-badge-grandchild${sel}" onclick="smToggleGrandchildBadge('${childBadge.id}','${gc.id}')">${escapeHtml(gc.name)}</button>`;
                    html += `<button type="button" class="ob-badge-delete-btn" onclick="smDeleteBadge('grandchild','${gc.id}','${childBadge.id}')" title="削除">✕</button>`;
                    html += `</div>`;
                });
                html += `</div>`;
            }
            html += `<div class="ob-badge-undo-bar ob-gc-undo-bar" id="smGcUndoBar_${childBadge.id}" style="display:none;">`;
            html += `<span id="smGcUndoMsg_${childBadge.id}"></span>`;
            html += `<button type="button" class="ob-badge-undo-btn" onclick="smUndoDeleteBadge()">戻す</button>`;
            html += `</div>`;
            html += `</div>`;
            return html;
        }

        function smToggleChildBadge(id) {
            const idx = smSelectedChildBadges.indexOf(id);
            if (idx >= 0) smSelectedChildBadges.splice(idx, 1);
            else smSelectedChildBadges.push(id);
            smRenderChildBadges();
        }

        function smToggleGrandchildBadge(childId, gcId) {
            if (!smSelectedGrandchildBadges[childId]) smSelectedGrandchildBadges[childId] = [];
            const arr = smSelectedGrandchildBadges[childId];
            const idx = arr.indexOf(gcId);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(gcId);
            smRenderChildBadges();
        }

        function smDeleteBadge(level, id, childId) {
            const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
            if (!parent) return;
            if (level === 'child') {
                const ci = parent.children.findIndex(c => c.id === id);
                if (ci < 0) return;
                const removed = parent.children.splice(ci, 1)[0];
                smDeletedBadgeInfo = { level: 'child', badge: removed, index: ci, parentId: smSelectedParentBadge };
                smSelectedChildBadges = smSelectedChildBadges.filter(cid => cid !== id);
                delete smSelectedGrandchildBadges[id];
                smRenderChildBadges();
                smShowBadgeUndoBar(removed.name, 'smBadgeUndoBar');
            } else if (level === 'grandchild') {
                const child = parent.children.find(c => c.id === childId);
                if (!child) return;
                const gi = child.children.findIndex(gc => gc.id === id);
                if (gi < 0) return;
                const removed = child.children.splice(gi, 1)[0];
                smDeletedBadgeInfo = { level: 'grandchild', badge: removed, index: gi, parentId: smSelectedParentBadge, childId };
                if (smSelectedGrandchildBadges[childId]) {
                    smSelectedGrandchildBadges[childId] = smSelectedGrandchildBadges[childId].filter(gid => gid !== id);
                }
                smRenderChildBadges();
                smShowBadgeUndoBar(removed.name, `smGcUndoBar_${childId}`);
            }
        }

        function smShowBadgeUndoBar(name, barId) {
            const bar = document.getElementById(barId);
            if (!bar) return;
            const msgId = barId.replace('Bar', 'Msg');
            const msgEl = document.getElementById(msgId);
            if (msgEl) msgEl.textContent = `「${name}」を削除しました`;
            bar.style.display = 'flex';
            if (smBadgeUndoTimer) clearTimeout(smBadgeUndoTimer);
            smBadgeUndoTimer = setTimeout(() => {
                bar.style.display = 'none';
                smDeletedBadgeInfo = null;
                smBadgeUndoTimer = null;
            }, 5000);
        }

        function smUndoDeleteBadge() {
            if (!smDeletedBadgeInfo) return;
            const parent = smBadgeDefinitions.find(p => p.id === smDeletedBadgeInfo.parentId);
            if (!parent) return;
            if (smDeletedBadgeInfo.level === 'child') {
                parent.children.splice(smDeletedBadgeInfo.index, 0, smDeletedBadgeInfo.badge);
            } else if (smDeletedBadgeInfo.level === 'grandchild') {
                const child = parent.children.find(c => c.id === smDeletedBadgeInfo.childId);
                if (child) child.children.splice(smDeletedBadgeInfo.index, 0, smDeletedBadgeInfo.badge);
            }
            // undo barを非表示
            document.querySelectorAll('#workModal .ob-badge-undo-bar').forEach(b => b.style.display = 'none');
            if (smBadgeUndoTimer) { clearTimeout(smBadgeUndoTimer); smBadgeUndoTimer = null; }
            smDeletedBadgeInfo = null;
            smRenderChildBadges();
        }

        function smAddChildBadge() {
            const name = prompt('新しい作業内容を入力:');
            if (!name || !name.trim()) return;
            const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
            if (!parent) return;
            const id = smGenerateBadgeId('child');
            parent.children.push({ id, name: name.trim(), children: [] });
            smRenderChildBadges();
        }

        function smAddGrandchildBadge(childId) {
            const name = prompt('新しい詳細項目を入力:');
            if (!name || !name.trim()) return;
            const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
            if (!parent) return;
            const child = parent.children.find(c => c.id === childId);
            if (!child) return;
            if (!child.children) child.children = [];
            const id = smGenerateBadgeId('gc');
            child.children.push({ id, name: name.trim() });
            smRenderChildBadges();
        }

        function smGetSelectedBadgeData() {
            return {
                parentId: smSelectedParentBadge,
                childIds: [...smSelectedChildBadges],
                grandchildMap: JSON.parse(JSON.stringify(smSelectedGrandchildBadges))
            };
        }

        // バッジデータ → col-badge セル用HTML生成
        function smBuildBadgeDisplayHtml(badgeData) {
            if (!badgeData || !badgeData.parentId || !badgeData.childIds || badgeData.childIds.length === 0) return '';
            const parent = smBadgeDefinitions.find(p => p.id === badgeData.parentId);
            if (!parent) return '';
            let html = '<div class="badge-display">';
            const gcMap = badgeData.grandchildMap || {};
            badgeData.childIds.forEach((childId, ci) => {
                const child = parent.children.find(c => c.id === childId);
                if (!child) return;
                if (ci > 0) html += '<span class="badge-group-sep"></span>';
                html += `<span class="badge-tag badge-child-tag">${escapeHtml(child.name)}</span>`;
                const gcIds = gcMap[childId];
                if (gcIds && gcIds.length > 0 && child.children) {
                    html += '<span class="badge-gc-sep">›</span>';
                    gcIds.forEach(gcId => {
                        const gc = child.children.find(g => g.id === gcId);
                        if (gc) html += `<span class="badge-tag badge-gc-tag">${escapeHtml(gc.name)}</span>`;
                    });
                }
            });
            html += '</div>';
            return html;
        }

        // バッジ ドラッグ＆ドロップ
        let smBadgeDragSrcIdx = null;
        let smBadgeDragLevel = null;
        let smBadgeDragChildId = null;

        function smInitBadgeDragDrop(level) {
            const selector = level === 'child'
                ? '#smBadgeChildList > .ob-badge-drag-item[data-badge-level="child"]'
                : '#smBadgeChildList .ob-gc-drag-item[data-badge-level="grandchild"]';
            document.querySelectorAll(selector).forEach(item => {
                item.addEventListener('dragstart', e => {
                    smBadgeDragSrcIdx = parseInt(item.dataset.badgeIdx);
                    smBadgeDragLevel = level;
                    smBadgeDragChildId = item.dataset.parentChild || null;
                    item.classList.add('ob-badge-dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                item.addEventListener('dragover', e => {
                    e.preventDefault();
                    if (smBadgeDragLevel !== level) return;
                    if (level === 'grandchild' && smBadgeDragChildId !== item.dataset.parentChild) return;
                    item.classList.add('ob-badge-drag-over');
                });
                item.addEventListener('dragleave', () => item.classList.remove('ob-badge-drag-over'));
                item.addEventListener('drop', e => {
                    e.preventDefault();
                    item.classList.remove('ob-badge-drag-over');
                    const targetIdx = parseInt(item.dataset.badgeIdx);
                    if (smBadgeDragSrcIdx === null || smBadgeDragSrcIdx === targetIdx) return;
                    const parent = smBadgeDefinitions.find(p => p.id === smSelectedParentBadge);
                    if (!parent) return;
                    let arr;
                    if (level === 'child') {
                        arr = parent.children;
                    } else {
                        const child = parent.children.find(c => c.id === smBadgeDragChildId);
                        if (!child) return;
                        arr = child.children;
                    }
                    const moved = arr.splice(smBadgeDragSrcIdx, 1)[0];
                    arr.splice(targetIdx, 0, moved);
                    smRenderChildBadges();
                });
                item.addEventListener('dragend', () => {
                    item.classList.remove('ob-badge-dragging');
                    smBadgeDragSrcIdx = null;
                    smBadgeDragLevel = null;
                    smBadgeDragChildId = null;
                });
            });
        }

        // ============================================
        // 現場監督候補
        // ============================================
        function smRenderSupervisorCandidates() {
            const container = document.getElementById('smSupervisorCandidates');
            if (!container) return;
            smSvCandidateList = [...smDemoSupervisorCandidates];
            if (smSvCandidateList.length === 0) {
                container.style.display = 'none';
                return;
            }
            smRenderSvChips();
            container.style.display = 'flex';
        }

        function smRenderSvChips() {
            const chipsEl = document.getElementById('smSvCandidateChips');
            if (!chipsEl) return;
            let html = '';
            smSvCandidateList.forEach((c, i) => {
                const label = c.tel ? `${escapeHtml(c.name)} / ${escapeHtml(c.tel)}` : escapeHtml(c.name);
                html += `<div class="ob-sv-drag-item" draggable="true" data-sv-idx="${i}">`;
                html += `<span class="ob-sv-drag-grip">☰</span>`;
                html += `<button type="button" class="ob-supervisor-chip" onclick="smSelectSupervisorCandidate(${i})">${label}</button>`;
                html += `<button type="button" class="ob-sv-delete-btn" onclick="smDeleteSupervisorCandidate(${i})" title="削除">✕</button>`;
                html += `</div>`;
            });
            chipsEl.innerHTML = html;
            smInitSvDragDrop();
        }

        function smSelectSupervisorCandidate(idx) {
            if (!smSvCandidateList[idx]) return;
            document.getElementById('smSupervisor').value = smSvCandidateList[idx].name;
            document.getElementById('smSupervisorTel').value = smSvCandidateList[idx].tel;
        }

        function smDeleteSupervisorCandidate(idx) {
            const removed = smSvCandidateList.splice(idx, 1)[0];
            if (!removed) return;
            smSvDeletedCandidate = { candidate: removed, index: idx };
            smRenderSvChips();
            smShowSvUndoBar(removed.name);
            if (smSvCandidateList.length === 0) {
                document.getElementById('smSupervisorCandidates').style.display = 'none';
            }
        }

        function smShowSvUndoBar(name) {
            const bar = document.getElementById('smSvUndoBar');
            if (!bar) return;
            const msg = document.getElementById('smSvUndoMsg');
            if (msg) msg.textContent = `「${name}」を削除しました`;
            bar.style.display = 'flex';
            if (smSvUndoTimer) clearTimeout(smSvUndoTimer);
            smSvUndoTimer = setTimeout(() => {
                bar.style.display = 'none';
                smSvDeletedCandidate = null;
                smSvUndoTimer = null;
            }, 5000);
        }

        function smUndoDeleteSupervisor() {
            if (!smSvDeletedCandidate) return;
            smSvCandidateList.splice(smSvDeletedCandidate.index, 0, smSvDeletedCandidate.candidate);
            smSvDeletedCandidate = null;
            if (smSvUndoTimer) { clearTimeout(smSvUndoTimer); smSvUndoTimer = null; }
            const bar = document.getElementById('smSvUndoBar');
            if (bar) bar.style.display = 'none';
            smRenderSvChips();
            document.getElementById('smSupervisorCandidates').style.display = 'flex';
        }

        function smInitSvDragDrop() {
            document.querySelectorAll('#smSvCandidateChips .ob-sv-drag-item').forEach(item => {
                item.addEventListener('dragstart', e => {
                    smSvDragSrcIdx = parseInt(item.dataset.svIdx);
                    item.classList.add('ob-sv-dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                item.addEventListener('dragover', e => {
                    e.preventDefault();
                    item.classList.add('ob-sv-drag-over');
                });
                item.addEventListener('dragleave', () => item.classList.remove('ob-sv-drag-over'));
                item.addEventListener('drop', e => {
                    e.preventDefault();
                    item.classList.remove('ob-sv-drag-over');
                    const targetIdx = parseInt(item.dataset.svIdx);
                    if (smSvDragSrcIdx === null || smSvDragSrcIdx === targetIdx) return;
                    const moved = smSvCandidateList.splice(smSvDragSrcIdx, 1)[0];
                    smSvCandidateList.splice(targetIdx, 0, moved);
                    smRenderSvChips();
                });
                item.addEventListener('dragend', () => {
                    item.classList.remove('ob-sv-dragging');
                    smSvDragSrcIdx = null;
                });
            });
        }

        // ============================================
        // 削除ボタン
        // ============================================
        function smDeleteSite() {
            if (!confirm('この現場情報を削除しますか？\n配置中の社員は自動的に解除されます。')) return;
            pushUndo();
            if (currentSiteCell) {
                const siteNameDiv = currentSiteCell.querySelector('.site-name');
                if (siteNameDiv) siteNameDiv.textContent = '';
                const delRow = currentSiteCell.closest('tr');
                groupCompaniesData.forEach(g => delRow.classList.remove(g.rowClass));
                currentSiteCell.removeAttribute('data-group-company');
                currentSiteCell.removeAttribute('data-gc-name');
                // 配置社員を自動解除
                releaseRowEmployees(delRow);
            }
            closeSiteModal();
        }

        // ============================================
        // 作業時間モーダル
        // ============================================
        let currentWorkTimeCell = null;

        function openWorkTimeModal(cell, event) {
            event.stopPropagation();
            currentWorkTimeCell = cell;
            const startTime = cell.dataset.startTime || '';
            const endTime = cell.dataset.endTime || '';
            document.getElementById('wtStartTime').value = startTime;
            document.getElementById('wtEndTime').value = endTime;
            document.getElementById('workTimeModal').classList.add('active');
        }

        function closeWorkTimeModal() {
            document.getElementById('workTimeModal').classList.remove('active');
            closeTimePicker();
            currentWorkTimeCell = null;
        }

        document.getElementById('workTimeModal').addEventListener('click', function(e) {
            if (e.target === this) closeWorkTimeModal();
        });

        function saveWorkTimeModal() {
            if (!currentWorkTimeCell) return;
            pushUndo();
            const startTime = document.getElementById('wtStartTime').value;
            const endTime = document.getElementById('wtEndTime').value;
            currentWorkTimeCell.dataset.startTime = startTime;
            currentWorkTimeCell.dataset.endTime = endTime;
            let startEl = currentWorkTimeCell.querySelector('.work-time-start');
            let endEl = currentWorkTimeCell.querySelector('.work-time-end');
            if (!startEl) {
                startEl = document.createElement('span');
                startEl.className = 'work-time-start';
                currentWorkTimeCell.appendChild(startEl);
            }
            if (!endEl) {
                endEl = document.createElement('span');
                endEl.className = 'work-time-end';
                currentWorkTimeCell.appendChild(endEl);
            }
            startEl.textContent = startTime || '';
            endEl.textContent = endTime || '';
            closeWorkTimeModal();
        }

        // ============================================
        // グループ会社フィルタ
        // ============================================
        // 【本番】デフォルトはログインユーザーの所属から自動判定
        //   東央警備・Nikkei所属 → ['touo','nikkei']
        //   全日本エンタープライズ所属 → ['zennihon']
        const gcFilterState = { selected: ['touo', 'nikkei'] };

        // サイドパネル初期化: 表示中会社を展開し、レンダリング
        gcFilterState.selected.forEach(function(code) { spState.expandedCompanies.add(code); });
        renderSidePanel();
        renderMinimap();

        // 検索入力でリアルタイムフィルタ
        var spSearchEl = document.getElementById('spSearchInput');
        if (spSearchEl) {
            spSearchEl.addEventListener('input', function() {
                renderSidePanel();
            });
        }
        var spVehicleSearchEl = document.getElementById('spVehicleSearchInput');
        if (spVehicleSearchEl) {
            spVehicleSearchEl.addEventListener('input', function() {
                renderVehiclePanel();
            });
        }

        function openGcFilterModal() {
            const modal = document.getElementById('gcFilterModal');
            modal.querySelectorAll('.gcf-checkbox-item input').forEach(cb => {
                cb.checked = gcFilterState.selected.includes(cb.value);
            });
            modal.classList.add('active');
        }

        function closeGcFilterModal() {
            document.getElementById('gcFilterModal').classList.remove('active');
        }

        function applyGcFilter() {
            const modal = document.getElementById('gcFilterModal');
            const checked = Array.from(modal.querySelectorAll('.gcf-checkbox-item input:checked')).map(cb => cb.value);
            if (checked.length === 0) {
                alert('少なくとも1つのグループ会社を選択してください。');
                return;
            }
            gcFilterState.selected = checked;

            // ラベル更新
            const allCodes = groupCompaniesData.map(g => g.code);
            const isAll = allCodes.length === checked.length && allCodes.every(c => checked.includes(c));
            document.getElementById('gcFilterLabel').textContent = isAll
                ? 'すべて'
                : checked.map(c => {
                    const gc = groupCompaniesData.find(g => g.code === c);
                    return gc ? gc.shortName : c;
                }).join(' + ');

            // 行の表示/非表示
            const tbody = document.querySelector('.grid-table tbody');
            if (tbody) {
                tbody.querySelectorAll('tr').forEach(row => {
                    const gc = groupCompaniesData.find(g => row.classList.contains(g.rowClass));
                    if (gc) {
                        row.style.display = checked.includes(gc.code) ? '' : 'none';
                    }
                });
            }
            // サイドパネル連動: 非表示会社のタブをリセット
            if (spState.activeTab !== 'all') {
                var activeDeptCompany = null;
                Object.keys(departmentsData).forEach(function(code) {
                    if (departmentsData[code].some(function(d) { return d.id === spState.activeTab; })) {
                        activeDeptCompany = code;
                    }
                });
                if (activeDeptCompany && !checked.includes(activeDeptCompany)) {
                    spState.activeTab = 'all';
                }
            }
            // 非表示会社のアコーディオンをクリア＆新規表示会社を展開
            spState.expandedCompanies.forEach(function(code) {
                if (!checked.includes(code)) spState.expandedCompanies.delete(code);
            });
            checked.forEach(function(code) { spState.expandedCompanies.add(code); });
            renderSidePanel();
            renderMinimap();

            closeGcFilterModal();
        }
