        // グループ会社データ
        const groupCompaniesData = [
            { id: 1, code: 'touo', name: '東央警備', borderClass: 'gc-border-touo' },
            { id: 2, code: 'nikkei', name: 'Nikkeiホールディングス', borderClass: 'gc-border-nikkei' }
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
                    // 下位の追加項目があればクリア
                    clearSubItemsBelow(level);
                },
                onAddNew: (item) => {
                    item.subItems = [];
                    // 親のsubItemsに追加
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

        // 指定レベルより下の追加項目を全て削除
        function clearSubItemsBelow(level) {
            while (subItemComboboxes.length > level + 1) {
                const last = subItemComboboxes.pop();
                const sec = document.getElementById(last.sectionId);
                if (sec) sec.remove();
            }
            renumberSubItems();
        }

        // 指定の追加項目を削除
        function removeSubItemLevel(sectionId, containerId) {
            const idx = subItemComboboxes.findIndex(cb => cb.id === containerId);
            if (idx >= 0) {
                // この段以降を全て削除
                while (subItemComboboxes.length > idx) {
                    const last = subItemComboboxes.pop();
                    const sec = document.getElementById(last.sectionId);
                    if (sec) sec.remove();
                }
            }
            renumberSubItems();
        }

        // 全追加項目をクリア
        function clearAllSubItems() {
            subItemComboboxes.forEach(cb => {
                const sec = document.getElementById(cb.sectionId);
                if (sec) sec.remove();
            });
            subItemComboboxes = [];
        }

        // 追加項目のラベル番号を振り直す
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

            // 現場名 Combobox
            siteNameCombobox = new Combobox('siteNameCombobox', {
                items: [],
                allowAddNew: true,
                onSelect: (item) => {
                    clearAllSubItems();
                },
                onAddNew: (item) => {
                    item.subItems = [];
                    if (companyCombobox.selectedItem) {
                        sitesData[companyCombobox.selectedItem.id].push(item);
                    }
                }
            });

            contactCombobox = new Combobox('contactCombobox', {
                items: contactsData,
                allowAddNew: false,
                onSelect: (item) => {
                    if (item) {
                        console.log('連絡選択:', item);
                    }
                }
            });

            // カラー設定パネル: カラーピッカー変更時にCSS変数を即時更新
            document.querySelectorAll('.color-setting-picker').forEach(picker => {
                picker.addEventListener('input', function() {
                    const cssVar = this.dataset.cssVar;
                    document.documentElement.style.setProperty(cssVar, this.value);
                    // HEX表示を更新
                    const hexLabel = document.querySelector('.color-setting-hex[data-css-var="' + cssVar + '"]');
                    if (hexLabel) hexLabel.textContent = this.value;
                });
            });

            // 保存済みパターンをlocalStorageから読み込み
            loadColorPresetsFromStorage();
        });

        // 現場詳細モーダルの開閉
        let currentSiteCell = null;

        function openSiteModal(cell) {
            currentSiteCell = cell;

            // data-group-company属性からグループ会社の初期値を設定
            const gcCode = cell.getAttribute('data-group-company');
            const gcSelect = document.getElementById('groupCompanySelect');
            if (gcCode) {
                const gc = groupCompaniesData.find(g => g.code === gcCode);
                if (gc) {
                    for (let i = 0; i < gcSelect.options.length; i++) {
                        if (gcSelect.options[i].text === gc.name) {
                            gcSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            } else {
                gcSelect.selectedIndex = 0;
            }

            // 追加項目をリセット
            clearAllSubItems();

            document.getElementById('siteModal').classList.add('active');
        }

        function closeSiteModal() {
            document.getElementById('siteModal').classList.remove('active');
        }

        function saveSiteModal() {
            // 保存処理（デモ）
            const groupCompany = document.getElementById('groupCompanySelect').value;
            const category = document.getElementById('categorySelect').value;
            const shift = document.getElementById('shiftSelect').value;
            const startTime = document.getElementById('startTimeInput').value;
            const endTime = document.getElementById('endTimeInput').value;
            const meetingTime = document.getElementById('meetingTimeInput').value;
            const contact = contactCombobox.selectedItem;
            const requiredCount = document.getElementById('requiredCountInput').value;
            const company = companyCombobox.selectedItem;
            const site = siteNameCombobox.selectedItem;
            const subItems = subItemComboboxes.map(cb => cb.instance.selectedItem).filter(Boolean);
            const displayName = buildSiteDisplayName();
            const notes = document.getElementById('notesInput').value;

            // グループ会社ボーダーを更新
            if (currentSiteCell) {
                groupCompaniesData.forEach(g => currentSiteCell.classList.remove(g.borderClass));
                currentSiteCell.removeAttribute('data-group-company');
                currentSiteCell.removeAttribute('data-gc-name');

                if (groupCompany) {
                    const gcName = document.getElementById('groupCompanySelect').selectedOptions[0]?.text;
                    const gc = groupCompaniesData.find(g => g.name === gcName);
                    if (gc) {
                        currentSiteCell.classList.add(gc.borderClass);
                        currentSiteCell.setAttribute('data-group-company', gc.code);
                        currentSiteCell.setAttribute('data-gc-name', gc.name);
                    }
                }

                // 現場名をグリッドに反映
                const siteNameDiv = currentSiteCell.querySelector('.site-name');
                if (siteNameDiv && displayName) {
                    siteNameDiv.textContent = displayName;
                }
            }

            console.log('保存データ:', {
                groupCompany, category, shift, startTime, endTime, meetingTime, requiredCount,
                contact: contact ? contact.name : null,
                company: company ? company.name : null,
                site: site ? site.name : null,
                subItems: subItems.map(s => s.name),
                displayName,
                notes
            });

            closeSiteModal();
        }

        // モーダル外クリックで閉じる
        document.getElementById('siteModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeSiteModal();
            }
        });

        // 個別連絡選択ポップアップ
        let currentEmployeeNameBlock = null;

        // 連絡項目リスト（追加・削除可能）
        const employeeContactItems = [
            { name: '会社', bg: '#e2e8f0', color: '#4a5568', borderColor: '#cbd5e0', cssClass: 'contact-company' },
            { name: '直', bg: '#c6f6d5', color: '#276749', borderColor: '#9ae6b4', cssClass: 'contact-direct' },
            { name: 'LINE', bg: '#c3fae8', color: '#0d9488', borderColor: '#81e6d9', cssClass: 'contact-line' },
            { name: '迎え', bg: '#fef3c7', color: '#92400e', borderColor: '#fbd38d', cssClass: 'contact-pickup' },
            { name: 'OP', bg: '#e9d8fd', color: '#6b46c1', borderColor: '#d6bcfa', cssClass: 'contact-op' }
        ];

        // 動的カラーパレット（新規追加用）
        const colorPalette = [
            { bg: '#fed7e2', color: '#97266d', borderColor: '#fbb6ce' },
            { bg: '#bee3f8', color: '#2b6cb0', borderColor: '#90cdf4' },
            { bg: '#feebc8', color: '#c05621', borderColor: '#fbd38d' },
            { bg: '#c6f6d5', color: '#276749', borderColor: '#9ae6b4' },
            { bg: '#e9d8fd', color: '#6b46c1', borderColor: '#d6bcfa' }
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

            // ポップアップ位置を計算
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
            // 未知の項目はデフォルトスタイル
            return { className: 'contact-badge', bg: '#edf2f7', color: '#4a5568' };
        }

        function setEmployeeContact(contactType) {
            if (!currentEmployeeNameBlock) return;

            const existingBadge = currentEmployeeNameBlock.querySelector('.contact-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

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
            const removedName = employeeContactItems[index].name;
            employeeContactItems.splice(index, 1);
            renderContactPopupOptions();
        }

        // Enter キーで追加
        document.getElementById('newContactItemInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addContactItem();
            }
        });

        // ポップアップ外クリックで閉じる
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
            if (e.target === this) {
                closeMapModal();
            }
        });

        // 車両・送迎編集モーダル
        let currentVtBox = null;
        let vtItems = [];
        let vtDragIndex = null;

        // 車両リスト（自由に追加可能）
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
                        bg: value.style.background || '#e2e8f0',
                        color: value.style.color || '#4a5568'
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
                // 内容: select or text
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
                    // 車両: セレクト + 自由入力追加
                    html += `<div class="vt-vehicle-input-wrap">
                        <select class="vt-value-select" onchange="vtItems[${index}].value = this.value">
                            <option value="">選択...</option>`;
                    vehicleList.forEach(v => {
                        const sel = item.value === v ? ' selected' : '';
                        html += `<option value="${escapeHtml(v)}"${sel}>${escapeHtml(v)}</option>`;
                    });
                    // リストにない値が入っている場合
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

        // 車両リストに新規追加
        function addNewVehicle(itemIndex, btn) {
            const row = btn.closest('.vt-item-row');
            const input = row.querySelector('.vt-new-vehicle-input');
            const name = input.value.trim();
            if (!name) return;
            if (!vehicleList.includes(name)) {
                vehicleList.push(name);
            }
            vtItems[itemIndex].value = name;
            input.value = '';
            syncVtItemsFromDom();
            renderVtItems();
        }

        // ドラッグ並べ替え
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
            if (index !== vtDragIndex) {
                e.currentTarget.classList.add('vt-drag-over');
            }
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
            document.querySelectorAll('#vtModalItems .vt-item-row').forEach(r => {
                r.classList.remove('vt-drag-over');
            });
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
            vtItems.push({ label: '', value: '', bg: '#e2e8f0', color: '#4a5568' });
            renderVtItems();
            const rows = document.querySelectorAll('#vtModalItems .vt-item-row');
            const lastRow = rows[rows.length - 1];
            if (lastRow) {
                lastRow.querySelector('.vt-label-input').focus();
            }
        }

        function removeVtItem(index) {
            vtItems.splice(index, 1);
            renderVtItems();
        }

        function saveVtModal() {
            if (!currentVtBox) return;
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
            if (!color) return '#e2e8f0';
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
            return '#e2e8f0';
        }

        document.getElementById('vtModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeVtModal();
            }
        });

        // 新規車両入力欄でEnterキー対応（イベント委譲）
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
                    if (!child.classList.contains('continuous-badge')) {
                        return child.textContent.trim();
                    }
                }
            }
            for (const child of nameBlock.children) {
                if (!child.classList.contains('contact-badge')) {
                    return child.textContent.trim();
                }
            }
            return null;
        }

        // 社員リストの配置状態を更新
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

        // 社員配置解除
        function removeEmployee(btn, event) {
            event.stopPropagation();
            const employeeTag = btn.closest('.assigned-employee');
            if (employeeTag) {
                employeeTag.remove();
                updateEmployeeListStatus();
            }
        }

        // ドラッグ&ドロップ機能
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

        // ドラッグ終了
        document.querySelectorAll('.employee-tag').forEach(tag => {
            tag.addEventListener('dragend', function() {
                this.classList.remove('dragging');
            });
        });

        // ===== 行選択・上下移動 =====

        let selectedGridRow = null;

        function selectRow(tr, event) {
            // モーダルやポップアップ内の要素クリック、または配置ゾーン内操作は無視
            if (event.target.closest('.modal-overlay, .contact-popup, .assigned-employee, .vehicle-transport-box, .vehicle-transport-add')) return;
            // 現場セル・地図セルクリックの場合はモーダルが開くので選択しない
            if (event.target.closest('.clickable-cell')) return;

            if (selectedGridRow === tr) {
                // 同じ行を再クリックで選択解除
                tr.classList.remove('selected');
                selectedGridRow = null;
            } else {
                if (selectedGridRow) {
                    selectedGridRow.classList.remove('selected');
                }
                tr.classList.add('selected');
                selectedGridRow = tr;
            }
        }

        function moveRowUp() {
            if (!selectedGridRow) {
                alert('移動する行を選択してください');
                return;
            }
            const prev = selectedGridRow.previousElementSibling;
            if (prev) {
                selectedGridRow.parentNode.insertBefore(selectedGridRow, prev);
                renumberRows();
            }
        }

        function moveRowDown() {
            if (!selectedGridRow) {
                alert('移動する行を選択してください');
                return;
            }
            const next = selectedGridRow.nextElementSibling;
            if (next) {
                selectedGridRow.parentNode.insertBefore(next, selectedGridRow);
                renumberRows();
            }
        }

        function renumberRows() {
            const rows = document.querySelectorAll('.grid-table tbody tr');
            rows.forEach((row, index) => {
                const noCell = row.querySelector('.col-no');
                if (noCell) {
                    noCell.textContent = index + 1;
                }
            });
        }

        // ===== ソート設定モーダル =====

        // ソートデータ管理
        const sortState = {
            category: [],     // 区分の順序
            shift: [],        // 昼夜の順序
            contractor: [],   // 契約先の順序
            site: [],         // 現場名の順序
            // ドリルダウン: 区分ごとの契約先順序
            categoryContractorOrders: {},
            // ドリルダウン: 契約先ごとの現場名順序
            contractorSiteOrders: {},
            // 選択中の項目
            selected: { category: null, shift: null, contractor: null, site: null },
            // フィルタ中の親
            filterCategory: null,
            filterContractor: null
        };

        // グリッドから現在のデータを抽出
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

        // ユニーク値を順序保持で取得
        function getUniqueValues(dataArray, key) {
            const seen = new Set();
            const result = [];
            dataArray.forEach(d => {
                const val = d[key];
                if (val && !seen.has(val)) {
                    seen.add(val);
                    result.push(val);
                }
            });
            return result;
        }

        // 条件付きユニーク値取得
        function getFilteredUniqueValues(dataArray, key, filterKey, filterValue) {
            const seen = new Set();
            const result = [];
            dataArray.forEach(d => {
                if (d[filterKey] === filterValue && d[key] && !seen.has(d[key])) {
                    seen.add(d[key]);
                    result.push(d[key]);
                }
            });
            return result;
        }

        function openSortModal() {
            const gridData = extractGridData();

            // 初期順序を設定
            sortState.category = getUniqueValues(gridData, 'category');
            sortState.shift = getUniqueValues(gridData, 'shift');
            sortState.contractor = getUniqueValues(gridData, 'contractor');
            sortState.site = getUniqueValues(gridData, 'site');

            // ドリルダウンデータ構築
            sortState.categoryContractorOrders = {};
            sortState.category.forEach(cat => {
                sortState.categoryContractorOrders[cat] = getFilteredUniqueValues(gridData, 'contractor', 'category', cat);
            });

            sortState.contractorSiteOrders = {};
            sortState.contractor.forEach(con => {
                sortState.contractorSiteOrders[con] = getFilteredUniqueValues(gridData, 'site', 'contractor', con);
            });

            // 選択状態リセット
            sortState.selected = { category: null, shift: null, contractor: null, site: null };
            sortState.filterCategory = null;
            sortState.filterContractor = null;

            // リスト描画
            renderSortList('category');
            renderSortList('shift');
            renderSortList('contractor');
            renderSortList('site');
            updateSortFilters();

            document.getElementById('sortModal').classList.add('active');
        }

        function closeSortModal() {
            document.getElementById('sortModal').classList.remove('active');
        }

        document.getElementById('sortModal').addEventListener('click', function(e) {
            if (e.target === this) closeSortModal();
        });

        // リスト描画
        function renderSortList(column) {
            const container = document.getElementById('sortList' + column.charAt(0).toUpperCase() + column.slice(1));
            let items;

            if (column === 'contractor' && sortState.filterCategory) {
                const cat = sortState.filterCategory;
                items = sortState.categoryContractorOrders[cat] || [];
            } else if (column === 'site' && sortState.filterContractor) {
                const con = sortState.filterContractor;
                items = sortState.contractorSiteOrders[con] || [];
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
                html = '<div style="padding: 20px; text-align: center; color: #a0aec0; font-size: 0.8rem;">項目なし</div>';
            }

            container.innerHTML = html;
        }

        // アイテム選択
        function selectSortItem(column, index) {
            sortState.selected[column] = index;
            renderSortList(column);

            // ドリルダウン連動
            if (column === 'category') {
                const items = sortState.category;
                sortState.filterCategory = items[index] || null;
                sortState.filterContractor = null;
                sortState.selected.contractor = null;
                sortState.selected.site = null;
                renderSortList('contractor');
                renderSortList('site');
                updateSortFilters();
            } else if (column === 'contractor') {
                let items;
                if (sortState.filterCategory) {
                    items = sortState.categoryContractorOrders[sortState.filterCategory] || [];
                } else {
                    items = sortState.contractor;
                }
                sortState.filterContractor = items[index] || null;
                sortState.selected.site = null;
                renderSortList('site');
                updateSortFilters();
            }
        }

        // フィルタ表示更新
        function updateSortFilters() {
            const contractorFilter = document.getElementById('sortContractorFilter');
            const siteFilter = document.getElementById('sortSiteFilter');

            if (sortState.filterCategory) {
                contractorFilter.textContent = '▸ ' + sortState.filterCategory;
            } else {
                contractorFilter.textContent = '（区分を選択で絞込み）';
            }

            if (sortState.filterContractor) {
                siteFilter.textContent = '▸ ' + sortState.filterContractor;
            } else {
                siteFilter.textContent = '（契約先を選択で絞込み）';
            }
        }

        // 上へ移動
        function sortMoveUp(column) {
            const idx = sortState.selected[column];
            if (idx === null || idx <= 0) return;

            const items = getCurrentSortItems(column);
            const temp = items[idx - 1];
            items[idx - 1] = items[idx];
            items[idx] = temp;

            sortState.selected[column] = idx - 1;
            renderSortList(column);
        }

        // 下へ移動
        function sortMoveDown(column) {
            const idx = sortState.selected[column];
            const items = getCurrentSortItems(column);
            if (idx === null || idx >= items.length - 1) return;

            const temp = items[idx + 1];
            items[idx + 1] = items[idx];
            items[idx] = temp;

            sortState.selected[column] = idx + 1;
            renderSortList(column);
        }

        // 現在表示中のリストアイテムを取得（ドリルダウン考慮）
        function getCurrentSortItems(column) {
            if (column === 'contractor' && sortState.filterCategory) {
                return sortState.categoryContractorOrders[sortState.filterCategory];
            } else if (column === 'site' && sortState.filterContractor) {
                return sortState.contractorSiteOrders[sortState.filterContractor];
            }
            return sortState[column];
        }

        // ソート実行
        function applySortSettings() {
            const tbody = document.querySelector('.grid-table tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // 各行にソート優先度を割り当て
            rows.sort((a, b) => {
                const dataA = extractRowData(a);
                const dataB = extractRowData(b);

                // 1. 区分
                let cmp = getSortPriority(sortState.category, dataA.category) - getSortPriority(sortState.category, dataB.category);
                if (cmp !== 0) return cmp;

                // 2. 昼夜
                cmp = getSortPriority(sortState.shift, dataA.shift) - getSortPriority(sortState.shift, dataB.shift);
                if (cmp !== 0) return cmp;

                // 3. 契約先（区分別の順序があればそれを使用）
                const catA = dataA.category;
                const contractorOrderA = sortState.categoryContractorOrders[catA] || sortState.contractor;
                const contractorOrderB = sortState.categoryContractorOrders[dataB.category] || sortState.contractor;
                cmp = getSortPriority(contractorOrderA, dataA.contractor) - getSortPriority(contractorOrderB, dataB.contractor);
                if (cmp !== 0) return cmp;

                // 4. 現場名（契約先別の順序があればそれを使用）
                const siteOrderA = sortState.contractorSiteOrders[dataA.contractor] || sortState.site;
                const siteOrderB = sortState.contractorSiteOrders[dataB.contractor] || sortState.site;
                cmp = getSortPriority(siteOrderA, dataA.site) - getSortPriority(siteOrderB, dataB.site);
                return cmp;
            });

            // DOMに反映
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

        // リセット
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

            renderSortList('category');
            renderSortList('shift');
            renderSortList('contractor');
            renderSortList('site');
            updateSortFilters();
        }

        // ===== 差分処理モーダル =====

        // 差分アイテムのID一覧と状態管理
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

            // 状態リセット
            diffItemIds.forEach(id => { diffDoneState[id] = false; });
            currentDiffItemId = diffItemIds[0];

            // UI初期化
            selectDiffItem(diffItemIds[0]);
            updateAllDiffStatus();

            modal.classList.add('active');
        }

        function closeDiffModal() {
            document.getElementById('diffModal').classList.remove('active');
        }

        // モーダル外クリックで閉じる
        document.getElementById('diffModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeDiffModal();
            }
        });

        // サイドバーの項目選択
        function selectDiffItem(id) {
            currentDiffItemId = id;

            // サイドバーのactive切替
            document.querySelectorAll('.diff-sidebar-item').forEach(item => {
                item.classList.toggle('active', item.dataset.diffId === id);
            });

            // 詳細パネルの表示切替
            document.querySelectorAll('.diff-detail-panel').forEach(panel => {
                panel.classList.toggle('active', panel.id === 'diffPanel_' + id);
            });
        }

        // 次の項目に移動
        function selectNextDiffItem() {
            const currentIndex = diffItemIds.indexOf(currentDiffItemId);
            if (currentIndex < diffItemIds.length - 1) {
                selectDiffItem(diffItemIds[currentIndex + 1]);
            }
        }

        // ラジオ/チェックボックス変更時 → 自動で済にする
        function onDiffRadioChange(diffId) {
            if (!diffDoneState[diffId]) {
                diffDoneState[diffId] = true;
                updateDiffStatus(diffId);
                updateDiffProgress();
            }
        }

        // 済状態のトグル（手動）
        function toggleDiffDone(diffId) {
            diffDoneState[diffId] = !diffDoneState[diffId];
            updateDiffStatus(diffId);
            updateDiffProgress();
        }

        // 個別のステータスUI更新
        function updateDiffStatus(diffId) {
            const icon = document.getElementById('diffStatus_' + diffId);
            const btn = document.getElementById('diffDoneBtn_' + diffId);
            const sidebarItem = document.querySelector('.diff-sidebar-item[data-diff-id="' + diffId + '"]');

            if (diffDoneState[diffId]) {
                icon.className = 'diff-status-icon status-done';
                icon.textContent = '✓';
                if (btn) {
                    btn.classList.add('is-done');
                    btn.textContent = '確認済み ✓（クリックで解除）';
                }
                if (sidebarItem) sidebarItem.classList.add('done');
            } else {
                icon.className = 'diff-status-icon status-pending';
                icon.textContent = '○';
                if (btn) {
                    btn.classList.remove('is-done');
                    btn.textContent = '確認済みにする';
                }
                if (sidebarItem) sidebarItem.classList.remove('done');
            }
        }

        // 全ステータスUI更新
        function updateAllDiffStatus() {
            diffItemIds.forEach(id => updateDiffStatus(id));
            updateDiffProgress();
        }

        // 進捗表示の更新
        function updateDiffProgress() {
            const doneCount = diffItemIds.filter(id => diffDoneState[id]).length;
            const total = diffItemIds.length;
            const progressEl = document.getElementById('diffProgress');
            progressEl.textContent = doneCount + ' / ' + total + ' 確認済み';
            progressEl.classList.toggle('all-done', doneCount === total);
        }

        // すべて受注簿側を選択
        function selectAllFile() {
            document.querySelectorAll('#diffModal .diff-items-table tbody tr').forEach(tr => {
                const fileRadio = tr.querySelector('.col-excel input[type="radio"]');
                if (fileRadio) fileRadio.checked = true;
            });
            document.querySelectorAll('#diffModal .diff-fuzzy-select label:first-of-type input[type="radio"]').forEach(r => {
                r.checked = true;
            });
            // 全て済にする
            diffItemIds.forEach(id => {
                diffDoneState[id] = true;
            });
            updateAllDiffStatus();
        }

        // すべてシステム側を選択
        function selectAllSys() {
            document.querySelectorAll('#diffModal .diff-items-table tbody tr').forEach(tr => {
                const sysRadio = tr.querySelector('.col-db input[type="radio"]');
                if (sysRadio) sysRadio.checked = true;
            });
            document.querySelectorAll('#diffModal .diff-fuzzy-select label:last-of-type input[type="radio"]').forEach(r => {
                r.checked = true;
            });
            // 全て済にする
            diffItemIds.forEach(id => {
                diffDoneState[id] = true;
            });
            updateAllDiffStatus();
        }

        // 編集ボタン
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
                btn.style.color = '#38a169';
                btn.style.borderColor = '#38a169';
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
                btn.style.color = '#4299e1';
                btn.style.borderColor = '#e2e8f0';

                // 編集確定で済にする
                onDiffRadioChange(currentDiffItemId);
            }
        }

        // 反映実行
        function applyDiff() {
            const doneCount = diffItemIds.filter(id => diffDoneState[id]).length;
            const total = diffItemIds.length;

            if (doneCount < total) {
                if (!confirm('未確認の項目が ' + (total - doneCount) + ' 件あります。\nこのまま反映しますか？')) {
                    return;
                }
            }

            const checkedCount = document.querySelectorAll('#diffModal input[type="radio"]:checked').length;
            alert('差分を反映しました（デモ）\n\n確認済み: ' + doneCount + '/' + total + '件\n選択された項目: ' + checkedCount + '件\n\n※ 実際のReact実装では、選択結果に基づきSupabase DBを更新します。');
            closeDiffModal();
        }

        // ==================== カラー設定パネル ====================
        const COLOR_DEFAULTS = {
            '--gc-color-touo': '#93c5fd',
            '--gc-color-nikkei': '#fca5a5',
            '--cat-bg-facility': '#c6f6d5',
            '--cat-bg-event': '#feebc8',
            '--cat-bg-traffic': '#bee3f8',
            '--cat-bg-highway': '#e9d8fd',
            '--cat-text-facility': '#276749',
            '--cat-text-event': '#c05621',
            '--cat-text-traffic': '#2b6cb0',
            '--cat-text-highway': '#6b46c1',
            '--shift-bg-day': '#fefcbf',
            '--shift-text-day': '#744210',
            '--shift-bg-night': '#2b6cb0',
            '--shift-text-night': '#ffffff'
        };
        const MAX_PRESETS = 5;
        const STORAGE_KEY = 'colorPresets';
        const ACTIVE_PRESET_KEY = 'activeColorPreset';

        function toggleColorSettingsPanel() {
            document.getElementById('colorSettingsPanel').classList.toggle('open');
        }

        // 現在のカラーピッカーの値を取得
        function getCurrentColors() {
            const colors = {};
            document.querySelectorAll('.color-setting-picker').forEach(picker => {
                colors[picker.dataset.cssVar] = picker.value;
            });
            return colors;
        }

        // 色をUIとCSS変数に適用
        function applyColors(colors) {
            Object.entries(colors).forEach(([cssVar, value]) => {
                document.documentElement.style.setProperty(cssVar, value);
                const picker = document.querySelector('.color-setting-picker[data-css-var="' + cssVar + '"]');
                if (picker) picker.value = value;
                const hex = document.querySelector('.color-setting-hex[data-css-var="' + cssVar + '"]');
                if (hex) hex.textContent = value;
            });
        }

        // デフォルトに戻す
        function resetColorsToDefault() {
            applyColors(COLOR_DEFAULTS);
            document.getElementById('colorPresetSelect').value = 'default';
            localStorage.setItem(ACTIVE_PRESET_KEY, 'default');
        }

        // localStorageからプリセット一覧を取得
        function getPresetsFromStorage() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            } catch { return []; }
        }

        // localStorageにプリセット一覧を保存
        function savePresetsToStorage(presets) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
        }

        // プリセットのselect要素を更新
        function updatePresetSelect(presets, activeId) {
            const select = document.getElementById('colorPresetSelect');
            // デフォルト以外を削除
            while (select.options.length > 1) select.remove(1);
            presets.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                select.appendChild(opt);
            });
            if (activeId) select.value = activeId;
        }

        // 起動時にlocalStorageからプリセットを読み込み
        function loadColorPresetsFromStorage() {
            const presets = getPresetsFromStorage();
            const activeId = localStorage.getItem(ACTIVE_PRESET_KEY) || 'default';
            updatePresetSelect(presets, activeId);
            if (activeId !== 'default') {
                const preset = presets.find(p => p.id === activeId);
                if (preset) applyColors(preset.colors);
            }
        }

        // プリセット選択時
        function loadColorPreset(presetId) {
            if (presetId === 'default') {
                resetColorsToDefault();
                return;
            }
            const presets = getPresetsFromStorage();
            const preset = presets.find(p => p.id === presetId);
            if (preset) {
                applyColors(preset.colors);
                localStorage.setItem(ACTIVE_PRESET_KEY, presetId);
            }
        }

        // 現在の色をプリセットとして保存
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

        // 選択中のプリセットを削除
        function deleteColorPreset() {
            const select = document.getElementById('colorPresetSelect');
            const activeId = select.value;
            if (activeId === 'default') {
                alert('デフォルトは削除できません。');
                return;
            }
            if (!confirm('パターン「' + select.options[select.selectedIndex].text + '」を削除しますか？')) return;
            let presets = getPresetsFromStorage();
            presets = presets.filter(p => p.id !== activeId);
            savePresetsToStorage(presets);
            updatePresetSelect(presets, 'default');
            resetColorsToDefault();
        }
