        // グループ会社データ
        const groupCompaniesData = [
            { id: 1, code: 'touo', name: '東央警備', borderClass: 'gc-border-touo' },
            { id: 2, code: 'nikkei', name: 'Nikkeiホールディングス', borderClass: 'gc-border-nikkei' },
            { id: 3, code: 'zennihon', name: '全日本エンタープライズ', borderClass: 'gc-border-zennihon' }
        ];

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
                                <span class="combobox-add-new-icon">➕</span>
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
            document.querySelectorAll('.color-setting-picker').forEach(picker => {
                picker.addEventListener('input', function() {
                    const cssVar = this.dataset.cssVar;
                    document.documentElement.style.setProperty(cssVar, this.value);
                    const hexLabel = document.querySelector('.color-setting-hex[data-css-var="' + cssVar + '"]');
                    if (hexLabel) hexLabel.textContent = this.value;
                });
            });

            loadColorPresetsFromStorage();
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

            // === 時間パース ===
            const timeEl = cell.querySelector('.time');
            const timeText = timeEl ? timeEl.textContent.trim() : '';
            let startTime = '', endTime = '';
            if (timeText.includes(' - ')) {
                const parts = timeText.split(' - ');
                startTime = parts[0].trim();
                endTime = parts[1].trim();
            }
            document.getElementById('smStartTime').value = startTime;
            document.getElementById('smEndTime').value = endTime;

            // === コンボボックス復元 ===
            clearAllSubItems();
            const companyId = cell.dataset.companyId ? parseInt(cell.dataset.companyId) : null;
            const siteId = cell.dataset.siteId ? parseInt(cell.dataset.siteId) : null;
            if (companyId) {
                const companyItem = companiesData.find(c => c.id === companyId);
                if (companyItem) {
                    companyCombobox.select(companyItem);
                    if (siteId && sitesData[companyId]) {
                        const siteItem = sitesData[companyId].find(s => s.id === siteId);
                        if (siteItem) {
                            setTimeout(() => siteNameCombobox.select(siteItem), 0);
                        }
                    }
                }
            } else {
                // コンボボックスにセルのテキストを表示（IDが無い場合）
                const companyText = cell.querySelector('.company');
                if (companyText && companyText.textContent.trim()) {
                    const found = companiesData.find(c => c.name === companyText.textContent.trim());
                    if (found) companyCombobox.select(found);
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

            // 時間・数値
            const startTime = document.getElementById('smStartTime').value;
            const endTime = document.getElementById('smEndTime').value;
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
                    siteInfo.innerHTML = '<div class="site-badges"></div><div class="site-details"><div class="time"></div><div class="company"></div><div class="site-name"></div></div>';
                    currentSiteCell.insertBefore(siteInfo, currentSiteCell.firstChild);
                }
                const badges = siteInfo.querySelector('.site-badges');
                const details = siteInfo.querySelector('.site-details');

                // --- 会社ボーダー ---
                groupCompaniesData.forEach(g => currentSiteCell.classList.remove(g.borderClass));
                currentSiteCell.removeAttribute('data-group-company');
                currentSiteCell.removeAttribute('data-gc-name');
                if (branch) {
                    const gc = groupCompaniesData.find(g => g.name === branch);
                    if (gc) {
                        currentSiteCell.classList.add(gc.borderClass);
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

                // --- 時間 ---
                const timeEl = details.querySelector('.time');
                if (timeEl) {
                    if (startTime && endTime) timeEl.textContent = `${startTime} - ${endTime}`;
                    else if (startTime) timeEl.textContent = startTime;
                    else timeEl.textContent = '';
                }

                // --- 契約先 ---
                const companyEl = details.querySelector('.company');
                if (companyEl) companyEl.textContent = company ? company.name : '';

                // --- 現場名 ---
                const siteNameDiv = details.querySelector('.site-name');
                if (siteNameDiv) siteNameDiv.textContent = displayName || '';

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

                    // 集合時間・連絡 (index 4)
                    const meetingCell = cells[4];
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

                    // 必要人数 (index 5)
                    const countCell = cells[5];
                    if (countCell) {
                        let countDisp = countCell.querySelector('.count-display');
                        if (countDisp) {
                            const countText = countDisp.textContent.trim();
                            const match = countText.match(/(\d+)\/\d+/);
                            const assigned = match ? parseInt(match[1]) : 0;
                            const required = parseInt(requiredCount) || 1;
                            countDisp.textContent = `${assigned}/${required}`;
                            countDisp.classList.remove('count-ok', 'count-shortage');
                            countDisp.classList.add(assigned >= required ? 'count-ok' : 'count-shortage');
                        }
                    }

                    // 作業内容 (col-badge)
                    const badgeCell = row.querySelector('.col-badge');
                    if (badgeCell) {
                        badgeCell.innerHTML = smBuildBadgeDisplayHtml(badgeData);
                    }

                    // 備考 (col-notes) — 集合場所+備考の構造化表示
                    const notesCell = row.querySelector('.col-notes');
                    if (notesCell) ntRenderNotesCell(notesCell, meetingPlace, notes);
                }
            }

            // バッジスナップショットをクリア（保存成功）
            smBadgeSnapshot = null;

            console.log('保存データ:', {
                branch, category, shift, startTime, endTime, meetingTime, meetingPlace,
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

            // 集合場所を data属性から読み取り
            document.getElementById('mtMeetingPlace').value = siteCell ? (siteCell.dataset.meetingPlace || '') : '';

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

            // 集合場所保存
            const meetingPlace = document.getElementById('mtMeetingPlace').value.trim();
            if (siteCell) {
                if (meetingPlace) siteCell.dataset.meetingPlace = meetingPlace;
                else delete siteCell.dataset.meetingPlace;
            }

            // 備考列の集合場所表示を更新
            const notesCell = row ? row.querySelector('.col-notes') : null;
            if (notesCell) {
                const memoEl = notesCell.querySelector('.notes-memo');
                const memoText = memoEl ? memoEl.textContent.replace(/^備考/, '').trim() : '';
                ntRenderNotesCell(notesCell, meetingPlace, memoText);
            }

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
        // 集合場所・備考モーダル
        // ============================================
        let currentNotesCell = null;

        function openNotesModal(cell, event) {
            event.stopPropagation();
            currentNotesCell = cell;

            // 備考をセルの .notes-memo から読み取り
            const memoEl = cell.querySelector('.notes-memo');
            const memoText = memoEl ? memoEl.textContent.replace(/^備考/, '').trim() : '';
            document.getElementById('ntNotes').value = memoText;

            document.getElementById('notesModal').classList.add('active');
        }

        function saveNotesModal() {
            pushUndo();
            if (!currentNotesCell) return;
            const row = currentNotesCell.closest('tr');
            const siteCell = row ? row.querySelector('.col-site-info') : null;

            const notes = document.getElementById('ntNotes').value.trim();
            const meetingPlace = siteCell ? (siteCell.dataset.meetingPlace || '') : '';

            // セル表示更新
            ntRenderNotesCell(currentNotesCell, meetingPlace, notes);

            document.getElementById('notesModal').classList.remove('active');
            currentNotesCell = null;
        }

        function ntRenderNotesCell(cell, meetingPlace, notes) {
            let html = '';
            if (meetingPlace) {
                html += `<div class="notes-place"><span class="notes-label">集合</span>${escapeHtml(meetingPlace)}</div>`;
            }
            if (notes) {
                html += `<div class="notes-memo"><span class="notes-label">備考</span>${escapeHtml(notes)}</div>`;
            }
            cell.innerHTML = html;
        }

        function closeNotesModal() {
            document.getElementById('notesModal').classList.remove('active');
            currentNotesCell = null;
        }

        document.getElementById('notesModal').addEventListener('click', function(e) {
            if (e.target === this) closeNotesModal();
        });

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

        // 車両・送迎編集モーダル
        let currentVtBox = null;
        let vtItems = [];
        let vtDragIndex = null;

        const vehicleList = ['標識A', '標識B', '2t車', '軽トラ', 'ワゴン'];

        function openVtModal(box) {
            currentVtBox = box;
            vtItems = [];
            box.querySelectorAll('.box-section').forEach(section => {
                const label = section.querySelector('.box-label');
                const value = section.querySelector('.box-value');
                if (label && value) {
                    vtItems.push({
                        label: label.textContent.replace(':', '').trim(),
                        value: value.textContent.trim(),
                        bg: value.style.background || 'rgba(68,166,181,0.12)',
                        color: value.style.color || '#2A6B7A'
                    });
                }
            });
            renderVtItems();
            document.getElementById('vtModal').classList.add('active');
        }

        function closeVtModal() {
            document.getElementById('vtModal').classList.remove('active');
            currentVtBox = null;
            vtItems = [];
        }

        function syncVtItemsFromDom() {
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            rows.forEach((row, index) => {
                if (!vtItems[index]) return;
                const labelInput = row.querySelector('.vt-label-input');
                const valueSelect = row.querySelector('.vt-value-select');
                const valueInput = row.querySelector('.vt-value-input');
                const colors = row.querySelectorAll('input[type="color"]');
                if (labelInput) vtItems[index].label = labelInput.value.trim();
                if (valueSelect) vtItems[index].value = valueSelect.value.trim();
                if (valueInput) vtItems[index].value = valueInput.value.trim();
                if (colors[0]) vtItems[index].bg = colors[0].value;
                if (colors[1]) vtItems[index].color = colors[1].value;
            });
        }

        function renderVtItems() {
            const container = document.getElementById('vtModalItems');
            let html = '';
            vtItems.forEach((item, index) => {
                const isVehicle = item.label === '車両';
                html += `<div class="vt-item-row" draggable="true" data-vt-index="${index}"
                              ondragstart="vtRowDragStart(event, ${index})"
                              ondragover="vtRowDragOver(event, ${index})"
                              ondragleave="vtRowDragLeave(event)"
                              ondrop="vtRowDrop(event, ${index})"
                              ondragend="vtRowDragEnd(event)">
                    <span class="vt-drag-handle" title="ドラッグで並べ替え">⠿</span>
                    <input type="text" class="vt-label-input" value="${escapeHtml(item.label)}" placeholder="項目名"
                           style="width: 80px; flex: none;">`;

                if (isVehicle) {
                    html += `<div class="vt-vehicle-input-wrap">
                        <select class="vt-value-select" onchange="vtItems[${index}].value = this.value">
                            <option value="">選択...</option>`;
                    vehicleList.forEach(v => {
                        const sel = item.value === v ? ' selected' : '';
                        html += `<option value="${escapeHtml(v)}"${sel}>${escapeHtml(v)}</option>`;
                    });
                    if (item.value && !vehicleList.includes(item.value)) {
                        html += `<option value="${escapeHtml(item.value)}" selected>${escapeHtml(item.value)}</option>`;
                    }
                    html += `</select>
                        <input type="text" class="vt-new-vehicle-input" placeholder="新規車両名..." style="flex: 0 1 100px;">
                        <button class="vt-vehicle-add-btn" onclick="addNewVehicle(${index}, this)" title="車両を追加">＋</button>
                    </div>`;
                } else {
                    html += `<input type="text" class="vt-value-input" value="${escapeHtml(item.value)}" placeholder="内容">`;
                }

                html += `<input type="color" value="${rgbToHex(item.bg)}" title="背景色">
                    <input type="color" value="${rgbToHex(item.color)}" title="文字色">
                    <button class="vt-remove-btn" onclick="syncVtItemsFromDom(); removeVtItem(${index})">×</button>
                </div>`;
            });
            container.innerHTML = html;
        }

        function addNewVehicle(itemIndex, btn) {
            const row = btn.closest('.vt-item-row');
            const input = row.querySelector('.vt-new-vehicle-input');
            const name = input.value.trim();
            if (!name) return;
            if (!vehicleList.includes(name)) vehicleList.push(name);
            vtItems[itemIndex].value = name;
            input.value = '';
            syncVtItemsFromDom();
            renderVtItems();
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

        function addVtPresetItem(label, bg, color) {
            syncVtItemsFromDom();
            vtItems.push({ label: label, value: '', bg: bg, color: color });
            renderVtItems();
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                const sel = lastRow.querySelector('.vt-value-select');
                const inp = lastRow.querySelector('.vt-value-input');
                if (sel) sel.focus();
                else if (inp) inp.focus();
            }
        }

        function addVtEmptyItem() {
            syncVtItemsFromDom();
            vtItems.push({ label: '', value: '', bg: 'rgba(68,166,181,0.12)', color: '#2A6B7A' });
            renderVtItems();
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            const lastRow = rows[rows.length - 1];
            if (lastRow) lastRow.querySelector('.vt-label-input').focus();
        }

        function removeVtItem(index) {
            vtItems.splice(index, 1);
            renderVtItems();
        }

        function saveVtModal() {
            if (!currentVtBox) return;
            pushUndo();
            syncVtItemsFromDom();

            const validItems = vtItems.filter(item => item.label && item.value);

            let html = '';
            validItems.forEach(item => {
                html += `<div class="box-section">
                    <span class="box-label" style="color:${item.color};">${escapeHtml(item.label)}:</span>
                    <span class="box-value" style="background:${item.bg}; color:${item.color};">${escapeHtml(item.value)}</span>
                </div>`;
            });
            currentVtBox.innerHTML = html;

            if (validItems.length > 0) {
                currentVtBox.classList.add('has-items');
            } else {
                currentVtBox.classList.remove('has-items');
            }

            closeVtModal();
        }

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

        document.getElementById('vtModal').addEventListener('click', function(e) {
            if (e.target === this) closeVtModal();
        });

        document.getElementById('vtModalItems').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.classList.contains('vt-new-vehicle-input')) {
                e.preventDefault();
                const btn = e.target.nextElementSibling;
                if (btn) btn.click();
            }
        });

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
            const assignedNames = new Set();
            document.querySelectorAll('.assignment-zone .assigned-employee').forEach(el => {
                const name = getEmployeeName(el);
                if (name) assignedNames.add(name);
            });
            document.querySelectorAll('.side-panel-content .employee-tag').forEach(tag => {
                if (assignedNames.has(tag.textContent.trim())) {
                    tag.classList.add('assigned');
                } else {
                    tag.classList.remove('assigned');
                }
            });
        }

        function removeEmployee(btn, event) {
            event.stopPropagation();
            pushUndo();
            const employeeTag = btn.closest('.assigned-employee');
            if (employeeTag) {
                employeeTag.remove();
                updateEmployeeListStatus();
            }
        }

        function drag(ev) {
            ev.dataTransfer.setData("text", ev.target.textContent);
            ev.target.classList.add('dragging');
        }

        function allowDrop(ev) {
            ev.preventDefault();
            ev.target.classList.add('drag-over');
        }

        function dragLeave(ev) {
            ev.target.classList.remove('drag-over');
        }

        function drop(ev) {
            ev.preventDefault();
            ev.target.classList.remove('drag-over');
            pushUndo();
            var data = ev.dataTransfer.getData("text");
            var newTag = document.createElement('span');
            newTag.className = 'assigned-employee';
            newTag.innerHTML = '<span class="employee-name-block" onclick="openEmployeeContactPopup(this, event)">'
                + '<span>' + data + '</span>'
                + '</span>'
                + '<span class="remove-btn" onclick="removeEmployee(this, event)">×</span>';
            ev.target.appendChild(newTag);
            updateEmployeeListStatus();
        }

        document.querySelectorAll('.employee-tag').forEach(tag => {
            tag.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        });

        // ===== 行選択・上下移動 =====
        let selectedGridRow = null;

        function selectRow(tr, event) {
            if (event.target.closest('.modal-overlay, .contact-popup, .assigned-employee, .vehicle-transport-box, .vehicle-transport-add')) return;
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

        function renumberRows() {
            const rows = document.querySelectorAll('.grid-table tbody tr');
            rows.forEach((row, index) => {
                const noCell = row.querySelector('.col-no');
                if (noCell) noCell.textContent = index + 1;
            });
        }

        // ===== ソート設定モーダル =====
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
            sortState.category = getUniqueValues(gridData, 'category');
            sortState.shift = getUniqueValues(gridData, 'shift');
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
            sortState.category = getUniqueValues(gridData, 'category');
            sortState.shift = getUniqueValues(gridData, 'shift');
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

        // ===== 差分処理モーダル =====
        const diffItemIds = ['fuzzy1', 'fuzzy2', 'fuzzy3', 'value1', 'new1', 'dbonly1'];
        const diffDoneState = {};
        let currentDiffItemId = 'fuzzy1';

        function openDiffModal(direction) {
            const modal = document.getElementById('diffModal');
            const title = document.getElementById('diffModalTitle');

            if (direction === 'import') {
                title.textContent = '差分確認 - 受注簿データ取得（受注簿 → システム）';
                document.getElementById('diffNewLabel').textContent = '受注簿のみ';
                document.getElementById('diffNewBadge').textContent = '受注簿のみ';
                document.getElementById('diffNewSidebarBadge').textContent = '受注簿のみ';
            } else {
                title.textContent = '差分確認 - 受注簿へ転記（システム → 受注簿）';
                document.getElementById('diffNewLabel').textContent = 'システムのみ(新規)';
                document.getElementById('diffNewBadge').textContent = 'システムのみ(新規)';
                document.getElementById('diffNewSidebarBadge').textContent = 'システムのみ';
            }

            diffItemIds.forEach(id => { diffDoneState[id] = false; });
            currentDiffItemId = diffItemIds[0];
            selectDiffItem(diffItemIds[0]);
            updateAllDiffStatus();
            modal.classList.add('active');
        }

        function closeDiffModal() { document.getElementById('diffModal').classList.remove('active'); }

        document.getElementById('diffModal').addEventListener('click', function(e) {
            if (e.target === this) closeDiffModal();
        });

        function selectDiffItem(id) {
            currentDiffItemId = id;
            document.querySelectorAll('.diff-sidebar-item').forEach(item => {
                item.classList.toggle('active', item.dataset.diffId === id);
            });
            document.querySelectorAll('.diff-detail-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === 'diffPanel_' + id);
            });
        }

        function selectNextDiffItem() {
            const currentIndex = diffItemIds.indexOf(currentDiffItemId);
            if (currentIndex < diffItemIds.length - 1) selectDiffItem(diffItemIds[currentIndex + 1]);
        }

        function onDiffRadioChange(diffId) {
            if (!diffDoneState[diffId]) {
                diffDoneState[diffId] = true;
                updateDiffStatus(diffId);
                updateDiffProgress();
            }
        }

        function toggleDiffDone(diffId) {
            diffDoneState[diffId] = !diffDoneState[diffId];
            updateDiffStatus(diffId);
            updateDiffProgress();
        }

        function updateDiffStatus(diffId) {
            const icon = document.getElementById('diffStatus_' + diffId);
            const btn = document.getElementById('diffDoneBtn_' + diffId);
            const sidebarItem = document.querySelector('.diff-sidebar-item[data-diff-id="' + diffId + '"]');

            if (diffDoneState[diffId]) {
                icon.className = 'diff-status-icon status-done';
                icon.textContent = '✓';
                if (btn) { btn.classList.add('is-done'); btn.textContent = '確認済み ✓（クリックで解除）'; }
                if (sidebarItem) sidebarItem.classList.add('done');
            } else {
                icon.className = 'diff-status-icon status-pending';
                icon.textContent = '○';
                if (btn) { btn.classList.remove('is-done'); btn.textContent = '確認済みにする'; }
                if (sidebarItem) sidebarItem.classList.remove('done');
            }
        }

        function updateAllDiffStatus() {
            diffItemIds.forEach(id => updateDiffStatus(id));
            updateDiffProgress();
        }

        function updateDiffProgress() {
            const doneCount = diffItemIds.filter(id => diffDoneState[id]).length;
            const total = diffItemIds.length;
            const progressEl = document.getElementById('diffProgress');
            progressEl.textContent = doneCount + ' / ' + total + ' 確認済み';
            progressEl.classList.toggle('all-done', doneCount === total);
        }

        function selectAllFile() {
            document.querySelectorAll('#diffModal .diff-items-table tbody tr').forEach(tr => {
                const fileRadio = tr.querySelector('.col-excel input[type="radio"]');
                if (fileRadio) fileRadio.checked = true;
            });
            document.querySelectorAll('#diffModal .diff-fuzzy-select label:first-of-type input[type="radio"]').forEach(r => r.checked = true);
            diffItemIds.forEach(id => { diffDoneState[id] = true; });
            updateAllDiffStatus();
        }

        function selectAllSys() {
            document.querySelectorAll('#diffModal .diff-items-table tbody tr').forEach(tr => {
                const sysRadio = tr.querySelector('.col-db input[type="radio"]');
                if (sysRadio) sysRadio.checked = true;
            });
            document.querySelectorAll('#diffModal .diff-fuzzy-select label:last-of-type input[type="radio"]').forEach(r => r.checked = true);
            diffItemIds.forEach(id => { diffDoneState[id] = true; });
            updateAllDiffStatus();
        }

        function toggleDiffEdit(btn) {
            const tr = btn.closest('tr');
            const fileTd = tr.querySelector('.col-excel');
            const sysTd = tr.querySelector('.col-db');

            if (btn.textContent === '編集') {
                const checkedLabel = tr.querySelector('input[type="radio"]:checked');
                let currentValue = '';
                if (checkedLabel) {
                    const label = checkedLabel.closest('.diff-radio-label');
                    currentValue = label.textContent.replace(label.querySelector('input')?.outerHTML || '', '').trim();
                }

                fileTd.colSpan = 2;
                fileTd.className = '';
                fileTd.innerHTML = `<input type="text" class="diff-edit-input" value="${escapeHtml(currentValue)}">`;
                fileTd.querySelector('input').focus();

                if (sysTd) sysTd.style.display = 'none';
                btn.textContent = '確定';
                btn.style.color = '#276749';
                btn.style.borderColor = '#276749';
            } else {
                const editInput = fileTd.querySelector('.diff-edit-input');
                const newValue = editInput ? editInput.value : '';

                fileTd.colSpan = 1;
                fileTd.className = 'col-excel';

                const radioName = 'edited_' + Math.random().toString(36).substr(2, 5);
                fileTd.innerHTML = `<label class="diff-radio-label"><input type="radio" name="${radioName}" checked> ${escapeHtml(newValue)}</label>`;

                if (sysTd) {
                    sysTd.style.display = '';
                    sysTd.innerHTML = `<span class="diff-match-text">（編集済み）</span>`;
                }

                btn.textContent = '編集';
                btn.style.color = 'var(--accent)';
                btn.style.borderColor = 'var(--divider)';

                onDiffRadioChange(currentDiffItemId);
            }
        }

        function applyDiff() {
            const doneCount = diffItemIds.filter(id => diffDoneState[id]).length;
            const total = diffItemIds.length;

            if (doneCount < total) {
                if (!confirm('未確認の項目が ' + (total - doneCount) + ' 件あります。\nこのまま反映しますか？')) return;
            }

            const checkedCount = document.querySelectorAll('#diffModal input[type="radio"]:checked').length;
            alert('差分を反映しました（デモ）\n\n確認済み: ' + doneCount + '/' + total + '件\n選択された項目: ' + checkedCount + '件\n\n※ 実際のReact実装では、選択結果に基づきSupabase DBを更新します。');
            closeDiffModal();
        }

        // ==================== カラー設定パネル ====================
        // ライトテーマ用カラー（Coastal）デフォルト
        const COLOR_DEFAULTS = {
            '--gc-color-touo': '#3B8BC5',
            '--gc-color-nikkei': '#D05050',
            '--cat-bg-facility': 'rgba(56, 161, 105, 0.12)',
            '--cat-bg-event': 'rgba(221, 107, 32, 0.12)',
            '--cat-bg-traffic': 'rgba(49, 130, 206, 0.12)',
            '--cat-bg-highway': 'rgba(128, 90, 213, 0.12)',
            '--cat-text-facility': '#276749',
            '--cat-text-event': '#9C4221',
            '--cat-text-traffic': '#2B6CB0',
            '--cat-text-highway': '#6B46C1',
            '--shift-bg-day': 'rgba(214, 158, 46, 0.12)',
            '--shift-text-day': '#975A16',
            '--shift-bg-night': 'rgba(43, 108, 176, 0.12)',
            '--shift-text-night': '#2C5282'
        };
        const MAX_PRESETS = 5;
        const STORAGE_KEY = 'colorPresets_v2_light';
        const ACTIVE_PRESET_KEY = 'activeColorPreset_v2_light';

        function toggleColorSettingsPanel() {
            document.getElementById('colorSettingsPanel').classList.toggle('open');
        }

        function getCurrentColors() {
            const colors = {};
            document.querySelectorAll('.color-setting-picker').forEach(picker => {
                colors[picker.dataset.cssVar] = picker.value;
            });
            return colors;
        }

        function applyColors(colors) {
            Object.entries(colors).forEach(([cssVar, value]) => {
                document.documentElement.style.setProperty(cssVar, value);
                const picker = document.querySelector('.color-setting-picker[data-css-var="' + cssVar + '"]');
                if (picker) picker.value = value;
                const hex = document.querySelector('.color-setting-hex[data-css-var="' + cssVar + '"]');
                if (hex) hex.textContent = value;
            });
        }

        function resetColorsToDefault() {
            applyColors(COLOR_DEFAULTS);
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
                if (ci > 0) html += ' ';
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
            if (!confirm('この現場情報を削除しますか？')) return;
            pushUndo();
            if (currentSiteCell) {
                const siteNameDiv = currentSiteCell.querySelector('.site-name');
                if (siteNameDiv) siteNameDiv.textContent = '';
                groupCompaniesData.forEach(g => currentSiteCell.classList.remove(g.borderClass));
                currentSiteCell.removeAttribute('data-group-company');
                currentSiteCell.removeAttribute('data-gc-name');
            }
            closeSiteModal();
        }
