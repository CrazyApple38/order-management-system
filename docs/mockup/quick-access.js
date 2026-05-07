/* ===========================
   Quick Access モックアップ JS
   =========================== */

// --- モックデータ ---
const qaCurrentUser = { name: '田中 太郎', email: 'tanaka@example.com', initials: '田', branch: '東央警備' };

let qaClients = [
    {
        id: 1, name: '鈴木建設株式会社', categories: ['交通', '高速'],
        lastOrderDate: '2026-03-28', orderCount: 15,
        sites: [
            { id: 101, name: '国道16号 拡幅工事現場', lastOrderDate: '2026-03-28', branch: '東央警備', category: '交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
            { id: 102, name: '東名高速 補修工事', lastOrderDate: '2026-03-20', branch: '東央警備', category: '高速', shift: '夜', presetStart: '20:00', presetEnd: '05:00' },
        ]
    },
    {
        id: 2, name: '東京イベントサービス', categories: ['イベント'],
        lastOrderDate: '2026-03-25', orderCount: 8,
        sites: [
            { id: 201, name: '東京ドーム コンサート警備', lastOrderDate: '2026-03-25', branch: 'Nikkeiホールディングス', category: 'イベント', shift: '昼', presetStart: '09:00', presetEnd: '18:00' },
            { id: 202, name: '幕張メッセ 展示会', lastOrderDate: '2026-03-10', branch: 'Nikkeiホールディングス', category: 'イベント', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
        ]
    },
    {
        id: 3, name: 'ABCマンション管理組合', categories: ['施設'],
        lastOrderDate: '2026-03-22', orderCount: 30,
        sites: [
            { id: 301, name: 'ABCマンション 常駐警備', lastOrderDate: '2026-03-22', branch: '全日本エンタープライズ', category: '施設', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
        ]
    },
    {
        id: 4, name: '関東道路サービス', categories: ['高速'],
        lastOrderDate: '2026-03-18', orderCount: 22,
        sites: [
            { id: 401, name: '首都高速 中央環状線 車線規制', lastOrderDate: '2026-03-18', branch: '東央警備', category: '高速', shift: '夜', presetStart: '20:00', presetEnd: '05:00' },
            { id: 402, name: '東北自動車道 路肩規制', lastOrderDate: '2026-03-12', branch: '東央警備', category: '高速', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
            { id: 403, name: '常磐自動車道 保安業務', lastOrderDate: '2026-03-05', branch: 'Nikkeiホールディングス', category: '高速', shift: '昼', presetStart: '07:00', presetEnd: '16:00' },
        ]
    },
    {
        id: 5, name: '市川市役所', categories: ['交通'],
        lastOrderDate: '2026-03-15', orderCount: 5,
        sites: [
            { id: 501, name: '市川駅前 歩行者天国', lastOrderDate: '2026-03-15', branch: '全日本エンタープライズ', category: '交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
        ]
    },
    {
        id: 6, name: 'グローバル警備応援', categories: ['応援交通'],
        lastOrderDate: '2026-03-10', orderCount: 3,
        sites: [
            { id: 601, name: '横浜市内 交通誘導', lastOrderDate: '2026-03-10', branch: '東央警備', category: '応援交通', shift: '昼', presetStart: '08:00', presetEnd: '17:00' },
        ]
    },
];

const qaCategories = ['すべて', '施設', 'イベント', '高速', '交通', '応援交通'];

// マスタリスト（受注簿と同期）
const qaBranchList = ['東央警備', 'Nikkeiホールディングス', '全日本エンタープライズ'];
// GCフィルタ: branch名 → gcコードのマッピング
const qaBranchToGcCode = { '東央警備': 'touo', 'Nikkeiホールディングス': 'nikkei', '全日本エンタープライズ': 'zennihon' };
function qaIsGcVisible(branch) {
    if (!window.mdNavGcIsCompanyVisible) return true;
    var code = qaBranchToGcCode[branch];
    return !code || window.mdNavGcIsCompanyVisible(code);
}
const qaCategoryList = ['施設', 'イベント', '高速', '交通', '応援交通'];
const qaShiftList = ['昼', '夜'];

// カレンダー用モックデータ（セルに入った受注データ）
let qaCalendarData = {};

// --- 非表示リスト ---
let qaHiddenClients = [];   // { ...client } 丸ごと保持
let qaHiddenSites = [];     // { clientId, clientName, site }

// --- 状態 ---
let qaActiveTab = 'すべて';
let qaExpandedClientId = null;
let qaCalendarYear = 2026;
let qaCalendarMonth = 3; // 0-indexed → April = 3
let qaSelectedDay = null;
let qaCurrentClientId = null;
let qaCurrentSiteId = null;
let qaCurrentClientName = '';
let qaCurrentSiteName = '';

// --- ログイン ---
function qaLogin() {
    const email = document.getElementById('qaEmail').value;
    const pass = document.getElementById('qaPassword').value;
    if (!email || !pass) {
        document.getElementById('qaLoginError').style.display = 'block';
        document.getElementById('qaLoginError').textContent = 'メールアドレスとパスワードを入力してください';
        return;
    }
    // 【モックアップ専用】認証をスキップ
    document.getElementById('qaLoginScreen').style.display = 'none';
    document.getElementById('qaHomeScreen').style.display = 'flex';
    qaRenderHome();
}

function qaLogout() {
    qaCloseAccountMenu();
    qaCloseActionMenu();
    document.getElementById('qaHomeScreen').style.display = 'none';
    document.getElementById('qaCalendarScreen').classList.remove('active');
    document.getElementById('qaLoginScreen').style.display = 'flex';
    document.getElementById('qaEmail').value = '';
    document.getElementById('qaPassword').value = '';
}

// --- アカウントメニュー（ドロップダウン） ---
function qaToggleAccountMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('qaAccountMenu');
    const expanded = !menu.hasAttribute('hidden');
    if (expanded) { qaCloseAccountMenu(); return; }

    // ユーザー情報を反映
    document.getElementById('qaAccountName').textContent = qaCurrentUser.name;
    document.getElementById('qaAccountEmail').textContent = qaCurrentUser.email;

    // 現在アクティブなアバターボタンの直下に配置
    const btn = event && event.currentTarget
        ? event.currentTarget
        : (document.getElementById('qaAvatarBtnCal')?.offsetParent
            ? document.getElementById('qaAvatarBtnCal')
            : document.getElementById('qaAvatarBtn'));
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';

    menu.removeAttribute('hidden');
    ['qaAvatarBtn', 'qaAvatarBtnCal'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.setAttribute('aria-expanded', 'true');
    });

    // 外側クリック/ESCで閉じる
    setTimeout(() => {
        document.addEventListener('click', qaAccountMenuOutsideClick);
        document.addEventListener('keydown', qaAccountMenuKeydown);
    }, 0);
}
function qaCloseAccountMenu() {
    const menu = document.getElementById('qaAccountMenu');
    if (!menu || menu.hasAttribute('hidden')) return;
    menu.setAttribute('hidden', '');
    ['qaAvatarBtn', 'qaAvatarBtnCal'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.setAttribute('aria-expanded', 'false');
    });
    document.removeEventListener('click', qaAccountMenuOutsideClick);
    document.removeEventListener('keydown', qaAccountMenuKeydown);
}
function qaAccountMenuOutsideClick(e) {
    const menu = document.getElementById('qaAccountMenu');
    if (menu.contains(e.target)) return;
    if (e.target.closest('.qa-avatar-btn')) return;
    qaCloseAccountMenu();
}
function qaAccountMenuKeydown(e) {
    if (e.key === 'Escape') qaCloseAccountMenu();
}

// --- ログアウト確認 ---
function qaLogoutConfirmOpen() {
    qaCloseAccountMenu();
    document.getElementById('qaLogoutConfirmOverlay').removeAttribute('hidden');
}
function qaLogoutConfirmClose() {
    document.getElementById('qaLogoutConfirmOverlay').setAttribute('hidden', '');
}
function qaLogoutConfirmOk() {
    qaLogoutConfirmClose();
    qaLogout();
}

// --- アクションメニュー（契約先/現場 kebab 共用） ---
let qaActionMenuBtn = null;

function qaRenderActionMenu(items) {
    const menu = document.getElementById('qaActionMenu');
    menu.innerHTML = items.map(item => {
        const iconHtml = item.icon
            ? `<svg class="ui-icon" aria-hidden="true"><use href="#${item.icon}"/></svg>`
            : '';
        const danger = item.danger ? ' qa-action-menu-item--danger' : '';
        return `<button type="button" class="qa-action-menu-item${danger}" role="menuitem" data-action-idx="${item.idx}">${iconHtml}<span>${item.label}</span></button>`;
    }).join('');
    menu.querySelectorAll('.qa-action-menu-item').forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            qaCloseActionMenu();
            items[i].onClick();
        });
    });
}

function qaPositionActionMenu(triggerBtn) {
    const menu = document.getElementById('qaActionMenu');
    const rect = triggerBtn.getBoundingClientRect();
    menu.removeAttribute('hidden');
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    let top = rect.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, rect.top - mh - 6);
    let right = Math.max(8, window.innerWidth - rect.right);
    if (right + mw > window.innerWidth - 8) right = 8;
    menu.style.top = top + 'px';
    menu.style.right = right + 'px';
}

function qaOpenActionMenu(event, items) {
    const btn = event.currentTarget;
    if (qaActionMenuBtn === btn) { qaCloseActionMenu(); return; }
    qaCloseActionMenu();
    qaRenderActionMenu(items);
    qaPositionActionMenu(btn);
    btn.setAttribute('aria-expanded', 'true');
    qaActionMenuBtn = btn;
    setTimeout(() => {
        document.addEventListener('click', qaActionMenuOutsideClick);
        document.addEventListener('keydown', qaActionMenuKeydown);
    }, 0);
}

function qaCloseActionMenu() {
    const menu = document.getElementById('qaActionMenu');
    if (!menu || menu.hasAttribute('hidden')) return;
    menu.setAttribute('hidden', '');
    if (qaActionMenuBtn) qaActionMenuBtn.setAttribute('aria-expanded', 'false');
    qaActionMenuBtn = null;
    document.removeEventListener('click', qaActionMenuOutsideClick);
    document.removeEventListener('keydown', qaActionMenuKeydown);
}

function qaActionMenuOutsideClick(e) {
    const menu = document.getElementById('qaActionMenu');
    if (menu.contains(e.target)) return;
    if (e.target.closest('.qa-kebab-btn')) return;
    qaCloseActionMenu();
}

function qaActionMenuKeydown(e) {
    if (e.key === 'Escape') qaCloseActionMenu();
}

function qaOpenClientMenu(event, clientId) {
    qaOpenActionMenu(event, [
        { idx: 0, label: '修正', onClick: () => qaOpenClientEditModal(clientId) },
        { idx: 1, label: '非表示', onClick: () => qaHideClient(clientId) },
    ]);
}

function qaOpenSiteMenu(event, clientId, siteId, hasOrders) {
    const items = [
        { idx: 0, label: '修正', onClick: () => qaEditSite(clientId, siteId) },
    ];
    if (hasOrders) {
        items.push({ idx: 1, label: '非表示', onClick: () => qaHideSite(clientId, siteId) });
    } else {
        items.push({ idx: 1, label: '削除', danger: true, onClick: () => qaDeleteSite(clientId, siteId) });
    }
    qaOpenActionMenu(event, items);
}

// --- ホーム画面 ---
function qaRenderHome() {
    const initials = qaCurrentUser.initials;
    document.getElementById('qaUserInitials').textContent = initials;
    const calEl = document.getElementById('qaUserInitialsCal');
    if (calEl) calEl.textContent = initials;
    qaRenderTabs();
    qaRenderClients();
}

function qaRenderTabs() {
    const container = document.getElementById('qaTabs');
    const hiddenCount = qaHiddenClients.length + qaHiddenSites.length;
    container.innerHTML = qaCategories.map(cat =>
        `<div class="qa-tab${qaActiveTab === cat ? ' active' : ''}" onclick="qaSelectTab('${cat}')">${cat}</div>`
    ).join('')
    + (hiddenCount > 0
        ? `<div class="qa-tab qa-tab-hidden${qaActiveTab === '非表示' ? ' active' : ''}" onclick="qaSelectTab('非表示')">非表示 (${hiddenCount})</div>`
        : '');
}

function qaSelectTab(cat) {
    qaActiveTab = cat;
    qaExpandedClientId = null;
    // 非表示タブではツールバーを隠す
    const toolbar = document.getElementById('qaAddClientBtn')?.closest('.qa-content-toolbar');
    if (toolbar) toolbar.style.display = cat === '非表示' ? 'none' : '';
    const addForm = document.getElementById('qaAddClientForm');
    if (cat === '非表示' && addForm) addForm.classList.remove('active');
    qaRenderTabs();
    qaRenderClients();
}

function qaRenderClients() {
    const container = document.getElementById('qaClientList');

    // 非表示タブ
    if (qaActiveTab === '非表示') {
        qaRenderHiddenList(container);
        return;
    }

    // GCフィルタ適用: 表示対象の現場を持つ契約先のみ表示
    var gcFiltered = qaClients.map(function(c) {
        var sites = c.sites.filter(function(s) { return qaIsGcVisible(s.branch); });
        return { client: c, sites: sites };
    }).filter(function(item) { return item.sites.length > 0; });

    const filtered = qaActiveTab === 'すべて'
        ? gcFiltered.map(function(item) { return item.client; })
        : gcFiltered.filter(function(item) {
            return item.client.categories.includes(qaActiveTab) ||
                item.sites.some(function(s) { return s.category === qaActiveTab; });
        }).map(function(item) { return item.client; });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:32px 0;font-size:13px;">該当する契約先がありません</div>';
        return;
    }

    container.innerHTML = filtered.map(client => {
        const expanded = qaExpandedClientId === client.id;
        const initials = client.name.charAt(0);
        // タブに応じて現場をフィルタ（GCフィルタ＋カテゴリ）
        const gcVisibleSites = client.sites.filter(s => qaIsGcVisible(s.branch));
        const visibleSites = qaActiveTab === 'すべて'
            ? gcVisibleSites
            : gcVisibleSites.filter(s => s.category === qaActiveTab || (!s.category && client.categories.includes(qaActiveTab)));
        return `
        <div class="qa-client-card${expanded ? ' expanded' : ''}" data-client-id="${client.id}">
            <div class="qa-client-card-header" onclick="qaToggleClient(${client.id})">
                <div class="qa-client-icon"><span>${initials}</span></div>
                <div class="qa-client-info">
                    <div class="qa-client-name">${escHtml(client.name)}</div>
                    <div class="qa-client-meta">
                        <span class="qa-client-meta-item">最終受注: ${formatDate(client.lastOrderDate)}</span>
                        <span class="qa-client-meta-item">現場: ${visibleSites.length}件</span>
                    </div>
                </div>
                <div class="qa-client-right">
                    <button type="button" class="qa-kebab-btn" onclick="event.stopPropagation(); qaOpenClientMenu(event, ${client.id})" aria-haspopup="menu" aria-expanded="false" aria-label="契約先の操作メニュー"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-kebab"/></svg></button>
                    <span class="qa-client-arrow" aria-hidden="true"><svg class="ui-icon"><use href="#ui-icon-chevron-right"/></svg></span>
                </div>
            </div>
            <div class="qa-site-list">
                <div class="qa-add-site-row" onclick="qaAddSiteModal(${client.id})">
                    <div class="qa-add-site-icon" aria-hidden="true"><svg class="ui-icon"><use href="#ui-icon-plus"/></svg></div>
                    <span class="qa-add-site-label">新規現場を追加</span>
                </div>
                ${visibleSites.map(site => {
                    const hasOrders = site.lastOrderDate && site.lastOrderDate !== '—';
                    return `
                <div class="qa-site-item" data-site-id="${site.id}">
                    <div class="qa-site-main" onclick="qaOpenCalendar(${client.id}, ${site.id})">
                        <div class="qa-site-info">
                            <div class="qa-site-name">${site.name === '(個別業務)' ? '<span class="qa-individual-task">(個別業務)</span>' : escHtml(site.name)}</div>
                            <div class="qa-site-detail">
                                <span>最終受注: ${formatDate(site.lastOrderDate)}</span>
                                ${site.branch ? `<span>${escHtml(site.branch)}</span>` : ''}
                                ${site.shift ? `<span>${escHtml(site.shift)}</span>` : ''}
                            </div>
                        </div>
                        <span class="qa-site-go" aria-hidden="true"><svg class="ui-icon"><use href="#ui-icon-chevron-right"/></svg></span>
                    </div>
                    <div class="qa-site-actions">
                        <button type="button" class="qa-kebab-btn" onclick="event.stopPropagation(); qaOpenSiteMenu(event, ${client.id}, ${site.id}, ${hasOrders})" aria-haspopup="menu" aria-expanded="false" aria-label="現場の操作メニュー"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-kebab"/></svg></button>
                    </div>
                </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
}

function qaToggleClient(clientId) {
    qaExpandedClientId = qaExpandedClientId === clientId ? null : clientId;
    qaRenderClients();
}

// --- 新規契約先 ---
function qaShowAddClient() {
    document.getElementById('qaAddClientForm').classList.add('active');
    document.getElementById('qaAddClientBtn').style.display = 'none';
    document.getElementById('qaNewClientName').focus();
}

function qaHideAddClient() {
    document.getElementById('qaAddClientForm').classList.remove('active');
    document.getElementById('qaAddClientBtn').style.display = 'flex';
    document.getElementById('qaNewClientName').value = '';
    document.getElementById('qaClientSuggest').classList.remove('active');
    document.getElementById('qaClientSuggest').innerHTML = '';
}

// --- 契約先名 曖昧検索サジェスト ---
function qaClientSuggest(query) {
    const el = document.getElementById('qaClientSuggest');
    const q = query.trim();
    if (!q) { el.classList.remove('active'); el.innerHTML = ''; return; }

    const qLower = q.toLowerCase();
    const scored = qaClients.map(c => {
        const name = c.name;
        const nLower = name.toLowerCase();
        let score = 0;
        // 完全一致
        if (nLower === qLower) score = 100;
        // 前方一致
        else if (nLower.startsWith(qLower)) score = 80;
        // 部分一致
        else if (nLower.includes(qLower)) score = 60;
        // 各文字が順序通りに含まれる（曖昧一致）
        else {
            let idx = 0;
            for (let i = 0; i < nLower.length && idx < qLower.length; i++) {
                if (nLower[i] === qLower[idx]) idx++;
            }
            if (idx === qLower.length) score = 30;
        }
        return { client: c, name, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length === 0) { el.classList.remove('active'); el.innerHTML = ''; return; }

    let html = '<div class="qa-client-suggest-hint">💡 既存の契約先に一致する候補があります（クリックで移動）</div>';
    scored.forEach(({ client, name, score }) => {
        const badgeClass = score === 100 ? 'exact' : 'warn';
        const badgeText = score === 100 ? '完全一致' : score >= 60 ? '類似' : 'あいまい一致';
        const highlighted = qaHighlightMatch(name, q);
        html += `<div class="qa-client-suggest-item" onclick="qaJumpToClient(${client.id})">
            <span class="suggest-name">${highlighted}</span>
            <span class="suggest-badge ${badgeClass}">${badgeText}</span>
        </div>`;
    });
    el.innerHTML = html;
    el.classList.add('active');
}

function qaHighlightMatch(text, query) {
    const qLower = query.toLowerCase();
    const tLower = text.toLowerCase();
    // 部分一致の場合はその範囲をハイライト
    const idx = tLower.indexOf(qLower);
    if (idx >= 0) {
        return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
    }
    // 曖昧一致：各マッチ文字をハイライト
    let result = '';
    let qi = 0;
    for (let i = 0; i < text.length; i++) {
        if (qi < qLower.length && tLower[i] === qLower[qi]) {
            result += '<mark>' + text[i] + '</mark>';
            qi++;
        } else {
            result += text[i];
        }
    }
    return result;
}

function qaJumpToClient(clientId) {
    document.getElementById('qaClientSuggest').classList.remove('active');
    document.getElementById('qaClientSuggest').innerHTML = '';
    qaHideAddClient();
    qaExpandedClientId = clientId;
    qaRenderClients();
    // スクロールして該当カードを表示
    setTimeout(() => {
        const card = document.querySelector(`[data-client-id="${clientId}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function qaSubmitNewClient() {
    const name = document.getElementById('qaNewClientName').value.trim();
    if (!name) return;
    const duplicate = qaClients.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
        if (!confirm(`「${duplicate.name}」は既に登録されています。\nそれでも新規登録しますか？`)) return;
    }
    const newId = Math.max(...qaClients.map(c => c.id)) + 1;
    const cat = qaActiveTab === 'すべて' ? '交通' : qaActiveTab;
    qaClients.unshift({
        id: newId, name: name, categories: [cat],
        lastOrderDate: new Date().toISOString().slice(0, 10), orderCount: 0,
        sites: []
    });
    qaHideAddClient();
    qaExpandedClientId = newId;
    qaRenderClients();
    qaShowToast(`${name} を登録しました`);
    qaCnSelfNotify('add', {
        clientId: newId, clientName: name,
        details: [{ field: '契約先名', value: name }, { field: '区分', value: cat }]
    });
}

// --- 契約先名 編集モーダル ---
let qaClientEditId = null;

function qaOpenClientEditModal(clientId) {
    const client = qaClients.find(c => c.id === clientId);
    if (!client) return;
    qaClientEditId = clientId;
    document.getElementById('qaClientEditName').value = client.name;
    document.getElementById('qaClientEditOverlay').style.display = 'flex';
    document.getElementById('qaClientEditName').focus();
}

function qaCloseClientEditModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('qaClientEditOverlay').style.display = 'none';
    qaClientEditId = null;
}

function qaSaveClientEdit() {
    const name = document.getElementById('qaClientEditName').value.trim();
    if (!name) return;
    const client = qaClients.find(c => c.id === qaClientEditId);
    if (!client) return;
    const oldName = client.name;
    client.name = name;
    qaCloseClientEditModal();
    qaRenderClients();
    qaShowToast('契約先名を更新しました');
    if (oldName !== name) {
        qaCnSelfNotify('modify', {
            clientId: client.id, clientName: name,
            diffs: [{ field: '契約先名', oldVal: oldName, newVal: name }]
        });
    }
}

// --- 契約先の非表示 ---
function qaHideClient(clientId) {
    const idx = qaClients.findIndex(c => c.id === clientId);
    if (idx === -1) return;
    const client = qaClients[idx];
    qaHiddenClients.push(JSON.parse(JSON.stringify(client)));
    qaClients.splice(idx, 1);
    if (qaExpandedClientId === clientId) qaExpandedClientId = null;
    qaRenderTabs();
    qaRenderClients();
    qaShowToast(`${client.name} を非表示にしました`);
}

// --- 現場の非表示（受注実績あり） ---
function qaHideSite(clientId, siteId) {
    const client = qaClients.find(c => c.id === clientId);
    const site = client?.sites.find(s => s.id === siteId);
    if (!client || !site) return;
    qaHiddenSites.push({ clientId, clientName: client.name, site: JSON.parse(JSON.stringify(site)) });
    client.sites = client.sites.filter(s => s.id !== siteId);
    qaRenderTabs();
    qaRenderClients();
    qaShowToast(`${site.name} を非表示にしました`);
}

// --- 非表示リスト描画 ---
function qaRenderHiddenList(container) {
    if (qaHiddenClients.length === 0 && qaHiddenSites.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:32px 0;font-size:13px;">非表示にした項目はありません</div>';
        return;
    }
    let html = '';
    if (qaHiddenClients.length > 0) {
        html += '<div class="qa-hidden-section-title">契約先</div>';
        html += qaHiddenClients.map((c, i) => `
            <div class="qa-hidden-item">
                <div class="qa-hidden-item-icon"><span>${c.name.charAt(0)}</span></div>
                <div class="qa-hidden-item-info">
                    <div class="qa-hidden-item-name">${escHtml(c.name)}</div>
                    <div class="qa-hidden-item-meta">現場 ${c.sites.length}件</div>
                </div>
                <button class="qa-hidden-restore-btn" onclick="qaRestoreClient(${i})">再表示</button>
                <button class="qa-hidden-delete-btn" onclick="qaRemoveHiddenClient(${i})">削除</button>
            </div>
        `).join('');
    }
    if (qaHiddenSites.length > 0) {
        html += '<div class="qa-hidden-section-title">現場</div>';
        html += qaHiddenSites.map((entry, i) => `
            <div class="qa-hidden-item">
                <div class="qa-hidden-item-info">
                    <div class="qa-hidden-item-name">${escHtml(entry.site.name)}</div>
                    <div class="qa-hidden-item-meta">${escHtml(entry.clientName)}</div>
                </div>
                <button class="qa-hidden-restore-btn" onclick="qaRestoreSite(${i})">再表示</button>
                <button class="qa-hidden-delete-btn" onclick="qaRemoveHiddenSite(${i})">削除</button>
            </div>
        `).join('');
    }
    container.innerHTML = html;
}

// --- 再表示 ---
function qaRestoreClient(index) {
    const client = qaHiddenClients.splice(index, 1)[0];
    qaClients.unshift(client);
    qaAfterRestore(`${client.name} を再表示しました`);
}

function qaRestoreSite(index) {
    const entry = qaHiddenSites.splice(index, 1)[0];
    const client = qaClients.find(c => c.id === entry.clientId);
    if (client) {
        client.sites.unshift(entry.site);
    } else {
        const hiddenClient = qaHiddenClients.find(c => c.id === entry.clientId);
        if (hiddenClient) {
            hiddenClient.sites.unshift(entry.site);
        }
    }
    qaAfterRestore(`${entry.site.name} を再表示しました`);
}

function qaRemoveHiddenClient(index) {
    const client = qaHiddenClients.splice(index, 1)[0];
    qaAfterRestore(`${client.name} を非表示リストから削除しました`);
}

function qaRemoveHiddenSite(index) {
    const entry = qaHiddenSites.splice(index, 1)[0];
    qaAfterRestore(`${entry.site.name} を非表示リストから削除しました`);
}

function qaAfterRestore(msg) {
    // 非表示リストが空になったら「すべて」に戻る
    if (qaHiddenClients.length === 0 && qaHiddenSites.length === 0 && qaActiveTab === '非表示') {
        qaSelectTab('すべて');
    } else {
        qaRenderTabs();
        qaRenderClients();
    }
    qaShowToast(msg);
}

// --- 新規現場（モーダルを開く） ---
function qaAddSiteModal(clientId) {
    qaOpenSiteModal(clientId, null);
}

// --- 現場の修正（モーダルを開く） ---
function qaEditSite(clientId, siteId) {
    qaOpenSiteModal(clientId, siteId);
}

// --- 現場情報モーダル ---
let qaSiteModalState = { clientId: null, siteId: null, branch: null, category: null, shift: null };

function qaOpenSiteModal(clientId, siteId) {
    const client = qaClients.find(c => c.id === clientId);
    if (!client) return;
    const site = siteId ? client.sites.find(s => s.id === siteId) : null;

    qaSiteModalState = {
        clientId,
        siteId,
        branch: site?.branch || (siteId ? null : qaCurrentUser.branch),
        category: site?.category || null,
        shift: site?.shift || null
    };

    document.getElementById('qaSiteModalTitle').textContent = site ? '現場情報 編集' : '新規現場 追加';
    document.getElementById('qaSiteModalName').value = (site && site.name !== '(個別業務)') ? site.name : '';

    // チップレンダリング
    qaRenderSiteModalChips('qaSiteModalBranch', qaBranchList, qaSiteModalState.branch, 'branch');
    qaRenderSiteModalChips('qaSiteModalCategory', qaCategoryList, qaSiteModalState.category, 'category');
    qaRenderSiteModalChips('qaSiteModalShift', qaShiftList, qaSiteModalState.shift, 'shift');

    // タイムセレクト初期化
    qaInitModalTimeSelects();
    qaSetTimeValue('qaSiteModalStart', site?.presetStart || '');
    qaSetTimeValue('qaSiteModalEnd', site?.presetEnd || '');

    qaUpdateSiteModalWarnings();
    document.getElementById('qaSiteModalOverlay').style.display = 'flex';
    document.getElementById('qaSiteModalName').focus();
}

function qaCloseSiteModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('qaSiteModalOverlay').style.display = 'none';
}

function qaRenderSiteModalChips(containerId, list, selected, group) {
    const container = document.getElementById(containerId);
    container.innerHTML = list.map(item => {
        const cls = item === selected ? 'qa-modal-chip active' : 'qa-modal-chip';
        return `<div class="${cls}" onclick="qaSelectSiteModalChip(this, '${group}')">${escHtml(item)}</div>`;
    }).join('');
}

function qaSelectSiteModalChip(el, group) {
    el.parentElement.querySelectorAll('.qa-modal-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    qaSiteModalState[group] = el.textContent;
    // リアルタイム警告更新
    qaUpdateSiteModalWarnings();
}

function qaInitModalTimeSelects() {
    ['qaSiteModalStart', 'qaSiteModalEnd'].forEach(id => {
        const row = document.getElementById(id);
        const hourSel = row.querySelector('.qa-time-hour');
        const minSel = row.querySelector('.qa-time-min');
        hourSel.innerHTML = '<option value="">--</option>';
        for (let h = 0; h < 24; h++) {
            hourSel.innerHTML += `<option value="${h}">${String(h).padStart(2, '0')}</option>`;
        }
        minSel.innerHTML = '<option value="">--</option>';
        for (let m = 0; m < 60; m += 10) {
            minSel.innerHTML += `<option value="${m}">${String(m).padStart(2, '0')}</option>`;
        }
    });
}

function qaClearSiteModalWarnings() {
    ['Branch', 'Category', 'Shift'].forEach(key => {
        document.getElementById(`qaSiteModal${key}Warn`).classList.remove('active');
        document.getElementById(`qaSiteModal${key}Label`).classList.remove('warn');
    });
}

// リアルタイム警告: 新規追加時に未選択項目を警告表示
function qaUpdateSiteModalWarnings() {
    // 編集モードでは警告非表示
    if (qaSiteModalState.siteId) {
        qaClearSiteModalWarnings();
        return;
    }
    ['branch', 'category', 'shift'].forEach(group => {
        const key = group.charAt(0).toUpperCase() + group.slice(1);
        const warn = document.getElementById(`qaSiteModal${key}Warn`);
        const label = document.getElementById(`qaSiteModal${key}Label`);
        if (qaSiteModalState[group]) {
            warn.classList.remove('active');
            label.classList.remove('warn');
        } else {
            warn.classList.add('active');
            label.classList.add('warn');
        }
    });
}

function qaSaveSiteModal() {
    const nameInput = document.getElementById('qaSiteModalName').value.trim();
    const name = nameInput || '(個別業務)';

    const { clientId, siteId } = qaSiteModalState;
    const client = qaClients.find(c => c.id === clientId);
    if (!client) return;

    // 新規追加時のみ必須チェック（会社・区分・昼夜）
    if (!siteId) {
        qaUpdateSiteModalWarnings();
        if (!qaSiteModalState.branch || !qaSiteModalState.category || !qaSiteModalState.shift) {
            return;
        }
    }

    const siteData = {
        name,
        branch: qaSiteModalState.branch,
        category: qaSiteModalState.category,
        shift: qaSiteModalState.shift,
        presetStart: qaGetTimeValue('qaSiteModalStart'),
        presetEnd: qaGetTimeValue('qaSiteModalEnd'),
    };

    if (siteId) {
        // 修正
        const site = client.sites.find(s => s.id === siteId);
        if (!site) return;
        const oldData = { name: site.name, branch: site.branch, category: site.category, shift: site.shift, presetStart: site.presetStart, presetEnd: site.presetEnd };
        Object.assign(site, siteData);
        qaShowToast('現場情報を更新しました');
        // 変���差分を生成
        const diffs = [];
        const labels = { name: '現場名', branch: '会社', category: '区分', shift: '昼夜', presetStart: '開始時間', presetEnd: '終了時間' };
        for (const key of Object.keys(labels)) {
            if ((oldData[key] || '') !== (siteData[key] || '')) {
                diffs.push({ field: labels[key], oldVal: oldData[key] || '—', newVal: siteData[key] || '—' });
            }
        }
        if (diffs.length > 0) {
            qaCnSelfNotify('modify', {
                clientId, siteId, clientName: client.name, siteName: siteData.name,
                category: siteData.category, shift: siteData.shift, branch: siteData.branch,
                diffs: diffs
            });
        }
    } else {
        // 新規追加
        const newSiteId = Math.floor(Math.random() * 10000) + 1000;
        client.sites.unshift({ id: newSiteId, lastOrderDate: '—', ...siteData });
        qaShowToast(`${name} を追加しました`);
        qaCnSelfNotify('add', {
            clientId, siteId: newSiteId, clientName: client.name, siteName: name,
            category: siteData.category, shift: siteData.shift, branch: siteData.branch,
            details: [
                { field: '現場名', value: name },
                { field: '会社', value: siteData.branch || '—' },
                { field: '区分', value: (siteData.category || '') + (siteData.shift ? '（' + siteData.shift + '）' : '') }
            ]
        });
    }

    qaCloseSiteModal();
    qaExpandedClientId = clientId;
    qaRenderClients();
}

function qaDeleteSite(clientId, siteId) {
    const client = qaClients.find(c => c.id === clientId);
    const site = client?.sites.find(s => s.id === siteId);
    if (!client || !site) return;

    if (!confirm(`「${site.name}」を削除します。よろしいですか？`)) return;

    client.sites = client.sites.filter(s => s.id !== siteId);
    qaRenderClients();
    qaShowToast('現場を削除しました');
    qaCnSelfNotify('delete', {
        clientId, siteId, clientName: client.name, siteName: site.name,
        category: site.category, shift: site.shift, branch: site.branch,
        details: [{ field: '操作', value: '現場を削除' }]
    });
}

// --- ダミーデータ生成 ---
function qaGenerateDummyData() {
    qaCalendarData = {};
    qaPlacementData = {};
    const year = qaCalendarYear;
    const month = qaCalendarMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const supervisors = ['山田太郎', '佐藤次郎', '鈴木三郎'];
    const tels = ['090-1234-5678', '080-9876-5432', '070-1111-2222'];
    const reliabilities = ['確定', '予定（高）', '予定（低）'];
    const subTaskSamples = [
        [{ label: '工事名①', value: '路面切削工' }, { label: '工事名②', value: '舗装工' }],
        [{ label: '工事名①', value: '車線規制' }],
        [{ label: '工事名①', value: '交通誘導警備' }, { label: '工事名②', value: '歩行者誘導' }, { label: '工事名③', value: '資材搬入' }],
        [{ label: '工事名①', value: '巡回警備' }],
    ];
    const meetingPlaces = ['現場事務所前', '正門前', '駐車場入口', '交差点北側', ''];
    const meetingTimes = ['07:00', '07:30', '08:00', '19:00', ''];
    const remarksSamples = ['', '', '', '雨天中止の可能性あり', '資材搬入あり', '夜間作業注意'];

    for (let d = 1; d <= daysInMonth; d++) {
        if (Math.random() > 0.55) continue; // 約55%の日にデータあり

        const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cellDate = new Date(year, month, d);
        const isFuture = cellDate >= today;

        // 配置先1
        const count1 = Math.floor(Math.random() * 5) + 1;
        const rel1 = isFuture ? reliabilities[Math.floor(Math.random() * 3)] : '確定';
        const startH1 = 7 + Math.floor(Math.random() * 2);
        const endH1 = 16 + Math.floor(Math.random() * 2);
        const supIdx1 = Math.floor(Math.random() * supervisors.length);
        const sub1 = subTaskSamples[Math.floor(Math.random() * subTaskSamples.length)];

        qaPlacementData[`${dayKey}-0`] = {
            count: String(count1),
            reliability: rel1,
            subTasks: JSON.parse(JSON.stringify(sub1)),
            badges: [],
            startTime: String(startH1).padStart(2, '0') + ':00',
            endTime: String(endH1).padStart(2, '0') + ':00',
            supervisor: supervisors[supIdx1],
            supervisorTel: tels[supIdx1],
            meetingPlace: meetingPlaces[Math.floor(Math.random() * meetingPlaces.length)],
            meetingTime: meetingTimes[Math.floor(Math.random() * meetingTimes.length)],
            maps: [],
            remarks: remarksSamples[Math.floor(Math.random() * remarksSamples.length)]
        };

        const entries = [{ count: count1, reliability: rel1 }];

        // 約25%の確率で配置先2を追加
        if (Math.random() < 0.25 && count1 >= 2) {
            const count2 = Math.floor(Math.random() * 3) + 1;
            const rel2 = isFuture ? reliabilities[Math.floor(Math.random() * 3)] : '確定';
            const startH2 = 8 + Math.floor(Math.random() * 2);
            const endH2 = 17 + Math.floor(Math.random() * 2);
            const supIdx2 = Math.floor(Math.random() * supervisors.length);
            const sub2 = subTaskSamples[Math.floor(Math.random() * subTaskSamples.length)];

            qaPlacementData[`${dayKey}-1`] = {
                count: String(count2),
                reliability: rel2,
                subTasks: JSON.parse(JSON.stringify(sub2)),
                badges: [],
                startTime: String(startH2).padStart(2, '0') + ':00',
                endTime: String(endH2).padStart(2, '0') + ':00',
                supervisor: supervisors[supIdx2],
                supervisorTel: tels[supIdx2],
                meetingPlace: meetingPlaces[Math.floor(Math.random() * meetingPlaces.length)],
                meetingTime: meetingTimes[Math.floor(Math.random() * meetingTimes.length)],
                maps: [],
                remarks: ''
            };
            entries.push({ count: count2, reliability: rel2 });
        }

        qaCalendarData[dayKey] = { entries };
    }
}

// --- カレンダー画面 ---
function qaOpenCalendar(clientId, siteId) {
    const client = qaClients.find(c => c.id === clientId);
    const site = client?.sites.find(s => s.id === siteId);
    if (!client || !site) return;

    qaCurrentClientId = clientId;
    qaCurrentSiteId = siteId;
    qaCurrentClientName = client.name;
    qaCurrentSiteName = site.name;
    qaSelectedDay = null;

    document.getElementById('qaCalClientName').textContent = client.name;
    document.getElementById('qaCalSiteName').textContent = site.name;
    document.getElementById('qaHomeScreen').style.display = 'none';
    document.getElementById('qaCalendarScreen').classList.add('active');

    // 編集パネルは非表示（セルクリックで表示）
    const panel = document.getElementById('qaCalEditPanel');
    panel.classList.remove('active', 'collapsed');

    // 【モックアップ専用】ダミーデータを生成
    qaGenerateDummyData();
    qaRenderCalendar();
}

let qaWeekMode = false;

function qaCloseCalendar() {
    document.getElementById('qaCalendarScreen').classList.remove('active');
    document.getElementById('qaHomeScreen').style.display = 'flex';
    qaSelectedDay = null;
    qaWeekMode = false;
    document.getElementById('qaCalBody').classList.remove('qa-week-mode');
}

function qaChangeMonth(delta) {
    if (qaWeekMode) {
        qaNavWeek(delta);
    } else {
        qaNavMonth(delta);
    }
}

function qaNavMonth(delta) {
    qaCalendarMonth += delta;
    if (qaCalendarMonth > 11) { qaCalendarMonth = 0; qaCalendarYear++; }
    if (qaCalendarMonth < 0) { qaCalendarMonth = 11; qaCalendarYear--; }
    qaSelectedDay = null;
    document.getElementById('qaCalEditPanel').classList.remove('active');
    qaExitWeekMode();
    qaGenerateDummyData();
    qaRenderCalendar();
}

function qaNavWeek(delta) {
    if (qaSelectedDay) qaSavePlacementData();

    const focusDay = qaSelectedDay || 1;
    const dt = new Date(qaCalendarYear, qaCalendarMonth, focusDay);
    const sun = new Date(dt);
    sun.setDate(sun.getDate() - sun.getDay());
    sun.setDate(sun.getDate() + delta * 7);

    const newYear = sun.getFullYear();
    const newMonth = sun.getMonth();

    if (newYear !== qaCalendarYear || newMonth !== qaCalendarMonth) {
        qaCalendarYear = newYear;
        qaCalendarMonth = newMonth;
    }

    const newDay = qaFindDayInWeek(sun, qaCalendarYear, qaCalendarMonth);
    qaSelectedDay = newDay;
    qaActivePlacement = 0;
    qaResetPlacementTabs();
    qaRenderCalendar();
    qaShowSelectedWeekOnly(newDay);
    qaUpdateNavLabels();

    // 編集パネルを更新
    const dateStr = `${qaCalendarYear}年${qaCalendarMonth + 1}月${newDay}日`;
    const dtNew = new Date(qaCalendarYear, qaCalendarMonth, newDay);
    const dowNames = ['日', '月', '火', '水', '木', '金', '土'];
    document.getElementById('qaCalEditDate').textContent = `${dateStr}（${dowNames[dtNew.getDay()]}）`;
    qaLoadPlacementData();
}

function qaFindDayInWeek(weekSunday, year, month) {
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekSunday);
        d.setDate(d.getDate() + i);
        if (d.getFullYear() === year && d.getMonth() === month) {
            return d.getDate();
        }
    }
    return 1;
}

function qaEnterWeekMode() {
    qaWeekMode = true;
    document.getElementById('qaCalBody').classList.add('qa-week-mode');
    document.getElementById('qaCalEditPanel').classList.remove('collapsed');
    qaUpdateNavLabels();
}

function qaExitWeekMode() {
    qaWeekMode = false;
    document.getElementById('qaCalBody').classList.remove('qa-week-mode');
    qaUpdateNavLabels();
    qaShowAllCalendarCells();
}

// --- アコーディオン開閉 ---
function qaToggleEditPanel() {
    const panel = document.getElementById('qaCalEditPanel');
    const isCollapsed = panel.classList.toggle('collapsed');
    if (isCollapsed) {
        // 折りたたみ → 月表示に戻す
        qaExitWeekMode();
        qaRenderCalendar();
    } else {
        // 展開 → 週表示に戻す
        if (qaSelectedDay) {
            qaEnterWeekMode();
            qaRenderCalendar();
            qaShowSelectedWeekOnly(qaSelectedDay);
        }
    }
}

function qaUpdateNavLabels() {
    const prevBtn = document.getElementById('qaCalNavPrev');
    const nextBtn = document.getElementById('qaCalNavNext');
    const prevLabel = qaWeekMode ? '前週' : '前月';
    const nextLabel = qaWeekMode ? '次週' : '次月';
    prevBtn.querySelector('span').textContent = prevLabel;
    nextBtn.querySelector('span').textContent = nextLabel;
    prevBtn.setAttribute('aria-label', prevLabel);
    nextBtn.setAttribute('aria-label', nextLabel);
    document.getElementById('qaCalMonthLabel').textContent = `${qaCalendarYear}年${qaCalendarMonth + 1}月`;
}

function qaShowSelectedWeekOnly(day) {
    const grid = document.getElementById('qaCalGrid');
    const cells = grid.children;
    const firstDow = new Date(qaCalendarYear, qaCalendarMonth, 1).getDay();
    const selectedRow = Math.floor((firstDow + day - 1) / 7);

    let cellIdx = 0;
    for (let i = 0; i < cells.length; i++) {
        if (i < 7) continue; // 曜日ヘッダーはそのまま
        const row = Math.floor(cellIdx / 7);
        cells[i].style.display = (row === selectedRow) ? '' : 'none';
        cellIdx++;
    }
}

function qaShowAllCalendarCells() {
    const grid = document.getElementById('qaCalGrid');
    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
        cells[i].style.display = '';
    }
}

// セル内の配置先エントリHTMLを生成
// day: 当月日（当月セル用）、outsideArgs: 前月/次月クリック用引数文字列
function qaCalEntriesHtml(data, day, outsideArgs) {
    if (!data) return '';
    // 旧形式（{ count: N }）との互換
    if (!data.entries) {
        if (data.count) {
            const click = outsideArgs
                ? `event.stopPropagation(); qaSelectOutsideDayEntry(${outsideArgs}, 0)`
                : `event.stopPropagation(); qaSelectDayEntry(${day}, 0)`;
            return `<div class="qa-cal-entries"><div class="qa-cal-entry" onclick="${click}"><span class="qa-cal-count">${data.count}</span></div></div>`;
        }
        return '';
    }
    if (data.entries.length === 0) return '';
    let html = '<div class="qa-cal-entries">';
    for (let si = 0; si < data.entries.length; si++) {
        const entry = data.entries[si];
        let confCls = '';
        if (entry.reliability === '予定（高）') confCls = ' qa-cal-tentative-high';
        else if (entry.reliability === '予定（低）') confCls = ' qa-cal-tentative-low';
        const selCls = (day === qaSelectedDay && si === qaActivePlacement && document.getElementById('qaCalEditPanel')?.classList.contains('active')) ? ' qa-cal-entry-selected' : '';
        const click = outsideArgs
            ? `event.stopPropagation(); qaSelectOutsideDayEntry(${outsideArgs}, ${si})`
            : `event.stopPropagation(); qaSelectDayEntry(${day}, ${si})`;
        html += `<div class="qa-cal-entry${selCls}" onclick="${click}"><span class="qa-cal-count${confCls}">${entry.count}</span></div>`;
    }
    html += '</div>';
    return html;
}

function qaRenderCalendar() {
    const year = qaCalendarYear;
    const month = qaCalendarMonth;
    document.getElementById('qaCalMonthLabel').textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dowLabels = ['日', '月', '火', '水', '木', '金', '土'];
    let html = dowLabels.map((d, i) => {
        let cls = 'qa-cal-dow';
        if (i === 0) cls += ' qa-cal-sun';
        if (i === 6) cls += ' qa-cal-sat';
        return `<div class="${cls}">${d}</div>`;
    }).join('');

    // 前月（月を跨いだ日もクリック可能）
    for (let i = firstDay - 1; i >= 0; i--) {
        const prevDay = prevMonthDays - i;
        const prevDt = new Date(year, month - 1, prevDay);
        const prevDow = prevDt.getDay();
        let cls = 'qa-cal-cell qa-cal-outside';
        if (prevDow === 0) cls += ' qa-cal-sun';
        if (prevDow === 6) cls += ' qa-cal-sat';
        const prevKey = `${prevDt.getFullYear()}-${String(prevDt.getMonth() + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
        const prevData = qaCalendarData[prevKey];
        const prevOutArgs = `${prevDt.getFullYear()}, ${prevDt.getMonth()}, ${prevDay}`;
        html += `<div class="${cls}" onclick="qaSelectOutsideDay(${prevOutArgs})">
            <span class="qa-cal-day-num">${prevDay}</span>${qaCalEntriesHtml(prevData, null, prevOutArgs)}
        </div>`;
    }

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const dow = dt.getDay();
        let cls = 'qa-cal-cell';
        if (dow === 0) cls += ' qa-cal-sun';
        if (dow === 6) cls += ' qa-cal-sat';
        if (dt.getTime() === today.getTime()) cls += ' qa-cal-today';
        if (d === qaSelectedDay) cls += ' qa-cal-selected';

        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const data = qaCalendarData[key];

        html += `<div class="${cls}" onclick="qaSelectDay(${d})">
            <span class="qa-cal-day-num">${d}</span>${qaCalEntriesHtml(data, d)}
        </div>`;
    }

    // 次月（月を跨いだ日もクリック可能）
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        const nextDt = new Date(year, month + 1, i);
        const nextDow = nextDt.getDay();
        let cls = 'qa-cal-cell qa-cal-outside';
        if (nextDow === 0) cls += ' qa-cal-sun';
        if (nextDow === 6) cls += ' qa-cal-sat';
        const nextKey = `${nextDt.getFullYear()}-${String(nextDt.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const nextData = qaCalendarData[nextKey];
        const nextOutArgs = `${nextDt.getFullYear()}, ${nextDt.getMonth()}, ${i}`;
        html += `<div class="${cls}" onclick="qaSelectOutsideDay(${nextOutArgs})">
            <span class="qa-cal-day-num">${i}</span>${qaCalEntriesHtml(nextData, null, nextOutArgs)}
        </div>`;
    }

    document.getElementById('qaCalGrid').innerHTML = html;

    // 週表示モード中はレンダリング後に自動的に選択週のみ表示
    if (qaWeekMode && qaSelectedDay) {
        qaShowSelectedWeekOnly(qaSelectedDay);
    }
}

// --- 配置先タブ ---
let qaPlacementCount = 1;
let qaActivePlacement = 0;
let qaPlacementData = {}; // key: "dayKey-placementIdx"

function qaSelectPlacement(idx) {
    // 切替前に現在の配置先データを保存
    qaSavePlacementData();
    qaActivePlacement = idx;
    document.querySelectorAll('.qa-placement-tab').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.idx) === idx);
    });
    qaLoadPlacementData();
}

function qaRenderPlacementTabs() {
    const tabs = document.getElementById('qaPlacementTabs');
    let html = '';
    for (let i = 0; i < qaPlacementCount; i++) {
        const cls = i === qaActivePlacement ? 'qa-placement-tab active' : 'qa-placement-tab';
        html += `<button type="button" class="${cls}" data-idx="${i}" onclick="qaSelectPlacement(${i})">配置先${i + 1}</button>`;
    }
    html += '<button type="button" class="qa-placement-add" onclick="qaAddPlacement()">+ 追加</button>';
    tabs.innerHTML = html;
}

function qaAddPlacement() {
    qaSavePlacementData();
    qaPlacementCount++;
    qaActivePlacement = qaPlacementCount - 1;
    qaRenderPlacementTabs();
    qaLoadPlacementData();
    qaShowToast(`配置先${qaPlacementCount} を追加しました`);
}

function qaDeletePlacement() {
    if (qaPlacementCount <= 1) {
        // 最後の1件 → 日全体を削除
        qaDeleteEntry();
        return;
    }
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(qaSelectedDay).padStart(2, '0')}`;
    // 削除対象のデータをクリア
    delete qaPlacementData[`${dayKey}-${qaActivePlacement}`];
    // 削除後のインデックスを詰める
    for (let i = qaActivePlacement + 1; i < qaPlacementCount; i++) {
        const oldKey = `${dayKey}-${i}`;
        const newKey = `${dayKey}-${i - 1}`;
        if (qaPlacementData[oldKey]) {
            qaPlacementData[newKey] = qaPlacementData[oldKey];
            delete qaPlacementData[oldKey];
        }
    }
    qaPlacementCount--;
    if (qaActivePlacement >= qaPlacementCount) qaActivePlacement = qaPlacementCount - 1;
    // カレンダー表示用データを即時更新
    const entries = [];
    for (let i = 0; i < qaPlacementCount; i++) {
        const pd = qaPlacementData[`${dayKey}-${i}`];
        if (pd && parseInt(pd.count) > 0) {
            entries.push({ count: parseInt(pd.count), reliability: pd.reliability || '確定' });
        }
    }
    if (entries.length === 0) {
        delete qaCalendarData[dayKey];
    } else {
        qaCalendarData[dayKey] = { entries };
    }
    qaRenderCalendar();
    qaRenderPlacementTabs();
    qaLoadPlacementData();
    qaShowToast('配置先を削除しました');

    // 変更通知を送信（スナップショットと比較）
    const site = qaCurrentSiteId ? (function() {
        var c = qaClients.find(function(x) { return x.id === qaCurrentClientId; });
        return c ? c.sites.find(function(s) { return s.id === qaCurrentSiteId; }) : null;
    })() : null;
    const dayLabel = (qaCalendarMonth + 1) + '月' + qaSelectedDay + '日';
    const oldTotal = qaEntrySnapshot && qaEntrySnapshot.entries ? qaEntrySnapshot.entries.reduce(function(sum, e) { return sum + e.count; }, 0) : 0;
    const newTotal = entries.reduce(function(sum, e) { return sum + e.count; }, 0);
    const diffs = [];
    if (oldTotal !== newTotal) diffs.push({ field: '人数', oldVal: oldTotal + '名', newVal: newTotal + '名' });
    const oldCount = qaEntrySnapshot && qaEntrySnapshot.entries ? qaEntrySnapshot.entries.length : 0;
    if (oldCount !== entries.length) diffs.push({ field: '配置先数', oldVal: oldCount + '件', newVal: entries.length + '件' });
    if (diffs.length > 0) {
        var _cnOldSnap = { dayKey: dayKey, calendarData: qaEntrySnapshot ? JSON.parse(JSON.stringify(qaEntrySnapshot)) : null, placements: qaPlacementSnapshot ? JSON.parse(JSON.stringify(qaPlacementSnapshot)) : {} };
        var _cnNewPlacements = {};
        Object.keys(qaPlacementData).forEach(function(k) {
            if (k.startsWith(dayKey + '-')) _cnNewPlacements[k] = JSON.parse(JSON.stringify(qaPlacementData[k]));
        });
        var _cnNewSnap = { dayKey: dayKey, calendarData: qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null, placements: _cnNewPlacements };
        qaCnSelfNotify('modify', {
            clientId: qaCurrentClientId, siteId: qaCurrentSiteId,
            clientName: qaCurrentClientName, siteName: qaCurrentSiteName,
            category: site?.category || '', shift: site?.shift || '', branch: site?.branch || '',
            dayKey: dayKey, dayLabel: dayLabel,
            diffs: diffs,
            _snapshot: _cnOldSnap, _newSnapshot: _cnNewSnap
        });
    }
}

function qaResetPlacementTabs() {
    qaPlacementCount = 1;
    qaActivePlacement = 0;
    qaRenderPlacementTabs();
}

function qaGetPlacementKey() {
    if (!qaSelectedDay) return null;
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(qaSelectedDay).padStart(2, '0')}`;
    return `${dayKey}-${qaActivePlacement}`;
}

function qaSavePlacementData() {
    const pk = qaGetPlacementKey();
    if (!pk) return;
    // 編集パネルが開かれていない場合はフォームデータを保存しない
    const panel = document.getElementById('qaCalEditPanel');
    if (!panel || !panel.classList.contains('active')) return;
    const activeChip = document.querySelector('.qa-reliability-chip.active');
    const activeBadges = Array.from(document.querySelectorAll('.qa-badge-chip.active')).map(c => c.textContent);
    const subTasks = Array.from(document.querySelectorAll('.qa-sub-task-row')).map(row => ({
        label: row.querySelector('.qa-sub-label').value,
        value: row.querySelector('.qa-sub-value').value
    }));
    qaPlacementData[pk] = {
        count: document.getElementById('qaEditCount').value,
        reliability: activeChip?.dataset.value || '確定',
        subTasks: subTasks,
        badges: activeBadges,
        startTime: qaGetTimeValue('qaEditStartTime'),
        endTime: qaGetTimeValue('qaEditEndTime'),
        supervisor: document.getElementById('qaEditSupervisor').value,
        supervisorTel: document.getElementById('qaEditSupervisorTel').value,
        meetingPlace: document.getElementById('qaEditMeetingPlace').value,
        meetingTime: qaGetTimeValue('qaEditMeetingTime'),
        maps: qaCollectMapEntries(),
        remarks: document.getElementById('qaEditRemarks').value
    };
}

// 人数入力時にカレンダーセルをリアルタイム更新
function qaLiveUpdateCalendar() {
    if (!qaSelectedDay) return;
    // 現在の編集中データをplacementDataに一時保存
    qaSavePlacementData();
    // カレンダー表示用データを更新
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(qaSelectedDay).padStart(2, '0')}`;
    const entries = [];
    for (let i = 0; i < qaPlacementCount; i++) {
        const pd = qaPlacementData[`${dayKey}-${i}`];
        if (pd && parseInt(pd.count) > 0) {
            entries.push({ count: parseInt(pd.count), reliability: pd.reliability || '確定' });
        }
    }
    if (entries.length === 0) {
        delete qaCalendarData[dayKey];
    } else {
        qaCalendarData[dayKey] = { entries };
    }
    qaRenderCalendar();
}

function qaLoadPlacementData() {
    const pk = qaGetPlacementKey();
    const data = pk ? qaPlacementData[pk] : null;
    document.getElementById('qaEditCount').value = data?.count || '';
    qaSetTimeValue('qaEditStartTime', data?.startTime || '');
    qaSetTimeValue('qaEditEndTime', data?.endTime || '');
    document.getElementById('qaEditSupervisor').value = data?.supervisor || '';
    document.getElementById('qaEditSupervisorTel').value = data?.supervisorTel || '';
    document.getElementById('qaEditMeetingPlace').value = data?.meetingPlace || '';
    qaSetTimeValue('qaEditMeetingTime', data?.meetingTime || '');
    // 地図エントリを描画
    const maps = data ? (data.maps || (data.mapUrl ? [{ label: '現場地図', url: data.mapUrl }] : null)) : null;
    qaRenderMapEntries(maps);
    document.getElementById('qaEditRemarks').value = data?.remarks || '';

    // 信頼度
    const reliability = data?.reliability || '確定';
    document.querySelectorAll('.qa-reliability-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.value === reliability);
    });

    // バッジ
    const badges = data?.badges || [];
    document.querySelectorAll('.qa-badge-chip').forEach(chip => {
        chip.classList.toggle('active', badges.includes(chip.textContent));
    });

    // サブタスク
    if (data?.subTasks && data.subTasks.length > 0) {
        qaRenderSubTasks(data.subTasks);
    } else {
        qaRenderSubTasks([{ label: '工事名1', value: '' }]);
    }

    qaUpdateDailyTaskName();
}

// --- 業務名プレビュー ---
function qaUpdateDailyTaskName() {
    const el = document.getElementById('qaDailyTaskName');
    if (!el) return;
    const parts = [];
    if (qaCurrentSiteName) parts.push(qaCurrentSiteName);
    document.querySelectorAll('.qa-sub-task-row .qa-sub-value').forEach(input => {
        if (input.value.trim()) parts.push(input.value.trim());
    });
    if (parts.length > 0) {
        el.textContent = parts.join(' > ');
        el.style.color = '';
        el.style.fontStyle = '';
        el.style.fontWeight = '';
    } else {
        el.textContent = '業務詳細を入力すると自動生成されます';
        el.style.color = 'var(--text-disabled)';
        el.style.fontStyle = 'italic';
        el.style.fontWeight = '400';
    }

    // ヘッダーの現場名：現場名 + 工事名を連結して表示
    const siteNameEl = document.getElementById('qaCalSiteName');
    if (siteNameEl) {
        const taskNames = [];
        document.querySelectorAll('.qa-sub-task-row .qa-sub-value').forEach(input => {
            if (input.value.trim()) taskNames.push(input.value.trim());
        });
        if (qaCurrentSiteName === '(個別業務)') {
            siteNameEl.textContent = taskNames.length > 0 ? taskNames.join(' ') : '(個別業務)';
        } else {
            const displayParts = [qaCurrentSiteName, ...taskNames];
            siteNameEl.textContent = displayParts.join(' ');
        }
    }
}

// --- 業務詳細サブタスク ---
function qaRenderSubTasks(tasks) {
    const container = document.getElementById('qaSubTaskList');
    container.innerHTML = tasks.map((t, i) => `
        <div class="qa-sub-task-row" data-idx="${i}">
            <input type="text" class="qa-sub-label" placeholder="ラベル" value="${escHtml(t.label)}">
            <input type="text" class="qa-sub-value" placeholder="内容を入力…" value="${escHtml(t.value)}" oninput="qaUpdateDailyTaskName()">
            <button type="button" class="qa-sub-delete" onclick="qaRemoveSubTask(this)" title="削除" aria-label="削除"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg></button>
        </div>
    `).join('');
}

function qaSubTaskLabel(num) {
    return `工事名${num}`;
}

function qaAddSubTask() {
    const container = document.getElementById('qaSubTaskList');
    const nextNum = container.children.length + 1;
    const row = document.createElement('div');
    row.className = 'qa-sub-task-row';
    row.dataset.idx = nextNum - 1;
    row.innerHTML = `
        <input type="text" class="qa-sub-label" placeholder="ラベル" value="${qaSubTaskLabel(nextNum)}">
        <input type="text" class="qa-sub-value" placeholder="内容を入力…" oninput="qaUpdateDailyTaskName()">
        <button type="button" class="qa-sub-delete" onclick="qaRemoveSubTask(this)" title="削除" aria-label="削除"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg></button>
    `;
    container.appendChild(row);
    row.querySelector('.qa-sub-label').focus();
}

function qaRemoveSubTask(btn) {
    const row = btn.closest('.qa-sub-task-row');
    const container = document.getElementById('qaSubTaskList');
    if (container.children.length <= 1) {
        qaShowToast('最低1つの業務詳細が必要です');
        return;
    }
    row.remove();
    qaUpdateDailyTaskName();
}

// --- バッジ ---
function qaToggleBadge(el) {
    el.classList.toggle('active');
}

function qaAddBadge() {
    const name = prompt('新しい作業内容バッジ名を入力:');
    if (!name || !name.trim()) return;
    const chip = document.createElement('div');
    chip.className = 'qa-badge-chip';
    chip.textContent = name.trim();
    chip.onclick = () => qaToggleBadge(chip);
    document.getElementById('qaBadgeChildChips').appendChild(chip);
    qaShowToast(`${name.trim()} を追加しました`);
}

// --- 地図 複数エントリ管理 ---
function qaAddMapEntry() {
    const list = document.getElementById('qaMapEntryList');
    const idx = list.children.length;
    const entry = document.createElement('div');
    entry.className = 'qa-map-entry';
    entry.dataset.idx = idx;
    entry.innerHTML =
        `<div class="qa-map-entry-header">` +
            `<input type="text" class="qa-sub-label qa-map-label" value="" placeholder="タイトル">` +
            `<button type="button" class="qa-sub-delete" onclick="qaRemoveMapEntry(${idx})" title="削除" aria-label="削除"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg></button>` +
        `</div>` +
        `<div class="qa-map-url-row">` +
            `<input type="url" class="qa-map-url-input" placeholder="Google Maps等のURLを入力">` +
            `<button type="button" class="qa-map-preview-btn" onclick="qaPreviewMap(this)">開く</button>` +
        `</div>`;
    list.appendChild(entry);
    entry.querySelector('.qa-map-label').focus();
}

function qaRemoveMapEntry(idx) {
    const list = document.getElementById('qaMapEntryList');
    const entries = list.querySelectorAll('.qa-map-entry');
    if (entries[idx]) {
        entries[idx].remove();
        list.querySelectorAll('.qa-map-entry').forEach((entry, i) => {
            entry.dataset.idx = i;
            entry.querySelector('.qa-sub-delete').setAttribute('onclick', `qaRemoveMapEntry(${i})`);
        });
    }
}

function qaPreviewMap(btn) {
    const entry = btn.closest('.qa-map-entry');
    const url = entry.querySelector('.qa-map-url-input').value.trim();
    if (!url) {
        qaShowToast('URLを入力してください');
        return;
    }
    window.open(url, '_blank');
}

function qaRenderMapEntries(maps) {
    const list = document.getElementById('qaMapEntryList');
    list.innerHTML = '';
    if (!maps || maps.length === 0) {
        maps = [{ label: '現場地図', url: '' }];
    }
    maps.forEach((m, i) => {
        const entry = document.createElement('div');
        entry.className = 'qa-map-entry';
        entry.dataset.idx = i;
        const safeLabel = (m.label || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        const safeUrl = (m.url || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
        entry.innerHTML =
            `<div class="qa-map-entry-header">` +
                `<input type="text" class="qa-sub-label qa-map-label" value="${safeLabel}" placeholder="タイトル">` +
                `<button type="button" class="qa-sub-delete" onclick="qaRemoveMapEntry(${i})" title="削除" aria-label="削除"><svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg></button>` +
            `</div>` +
            `<div class="qa-map-url-row">` +
                `<input type="url" class="qa-map-url-input" value="${safeUrl}" placeholder="Google Maps等のURLを入力">` +
                `<button type="button" class="qa-map-preview-btn" onclick="qaPreviewMap(this)">開く</button>` +
            `</div>`;
        list.appendChild(entry);
    });
}

function qaCollectMapEntries() {
    const list = document.getElementById('qaMapEntryList');
    const entries = list.querySelectorAll('.qa-map-entry');
    const maps = [];
    entries.forEach(entry => {
        const label = entry.querySelector('.qa-map-label').value.trim();
        const url = entry.querySelector('.qa-map-url-input').value.trim();
        if (label || url) maps.push({ label, url });
    });
    return maps;
}

// --- 月外セル選択（前月・次月の日をクリック） ---
function qaSelectOutsideDay(year, month, day) {
    if (qaSelectedDay) qaSavePlacementData();
    qaCalendarYear = year;
    qaCalendarMonth = month;
    qaSelectedDay = null; // リセットしてからselectDayに委譲
    qaRenderCalendar();
    qaSelectDay(day);
}

// --- エントリ直接選択（配置先指定付き） ---
function qaSelectDayEntry(day, siteIdx) {
    const panel = document.getElementById('qaCalEditPanel');
    if (qaSelectedDay === day && panel.classList.contains('active')) {
        // 同じ日が既に開いている → 配置先タブ切り替え＋アコーディオン展開
        qaSavePlacementData();
        qaSelectPlacement(siteIdx);
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            qaEnterWeekMode();
            qaShowSelectedWeekOnly(day);
        }
        qaRenderCalendar();
        return;
    }
    // 別の日 → 通常のセル選択後に配置先を指定
    qaSelectDay(day, siteIdx);
}

function qaSelectOutsideDayEntry(year, month, day, siteIdx) {
    if (qaSelectedDay) qaSavePlacementData();
    qaCalendarYear = year;
    qaCalendarMonth = month;
    qaSelectedDay = null;
    qaRenderCalendar();
    qaSelectDay(day, siteIdx);
}

// 通知用：セル選択時のスナップショット（oninputでcalendarDataが更新されるため保存時比較用）
let qaEntrySnapshot = null;
let qaPlacementSnapshot = {};  // 配置先データのスナップショット（地図等の詳細比較用）

// --- セル選択 ---
function qaSelectDay(day, initialSiteIdx) {
    // 切り替え前に現在のデータを保存
    if (qaSelectedDay) {
        qaSavePlacementData();
    }

    qaSelectedDay = day;

    // 通知用スナップショットを保存
    const snapDayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    qaEntrySnapshot = qaCalendarData[snapDayKey] ? JSON.parse(JSON.stringify(qaCalendarData[snapDayKey])) : null;
    // 配置先データのスナップショットも保存
    qaPlacementSnapshot = {};
    Object.keys(qaPlacementData).forEach(k => {
        if (k.startsWith(snapDayKey + '-')) {
            qaPlacementSnapshot[k] = JSON.parse(JSON.stringify(qaPlacementData[k]));
        }
    });
    qaActivePlacement = 0;
    qaResetPlacementTabs();
    qaRenderCalendar();

    // パネルを展開状態にして週表示に切り替え
    const panel = document.getElementById('qaCalEditPanel');
    panel.classList.add('active');
    panel.classList.remove('collapsed');
    qaEnterWeekMode();
    qaShowSelectedWeekOnly(day);

    const dateStr = `${qaCalendarYear}年${qaCalendarMonth + 1}月${day}日`;
    const dt = new Date(qaCalendarYear, qaCalendarMonth, day);
    const dowNames = ['日', '月', '火', '水', '木', '金', '土'];
    document.getElementById('qaCalEditDate').textContent = `${dateStr}（${dowNames[dt.getDay()]}）`;

    // 既存の配置先タブを復元（データを上書きしないようカウントのみ増やす）
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let maxPlacement = 0;
    Object.keys(qaPlacementData).forEach(k => {
        if (k.startsWith(dayKey + '-')) {
            const idx = parseInt(k.split('-').pop());
            if (idx > maxPlacement) maxPlacement = idx;
        }
    });
    qaPlacementCount = maxPlacement + 1;
    qaRenderPlacementTabs();

    // 指定された配置先タブを選択（保存せずにロードのみ）
    const targetIdx = (typeof initialSiteIdx === 'number' && initialSiteIdx < qaPlacementCount) ? initialSiteIdx : 0;
    qaActivePlacement = targetIdx;
    document.querySelectorAll('.qa-placement-tab').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.idx) === targetIdx);
    });
    qaLoadPlacementData();
    qaRenderCalendar();
}

function qaSelectReliability(el) {
    document.querySelectorAll('.qa-reliability-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function qaCloseEditPanel() {
    const panel = document.getElementById('qaCalEditPanel');
    panel.classList.remove('active', 'collapsed');
    qaSelectedDay = null;
    qaExitWeekMode();
    qaRenderCalendar();
}

function qaDeleteEntry() {
    if (!qaSelectedDay) return;
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(qaSelectedDay).padStart(2, '0')}`;
    const dayLabel = (qaCalendarMonth + 1) + '月' + qaSelectedDay + '日';
    // 復元用スナップショット（削除前）
    var _cnDelSnap = { dayKey: dayKey, calendarData: qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null, placements: {} };
    Object.keys(qaPlacementData).forEach(function(k) {
        if (k.startsWith(dayKey + '-')) _cnDelSnap.placements[k] = JSON.parse(JSON.stringify(qaPlacementData[k]));
    });
    // 該当日の全配置先データを削除
    Object.keys(qaPlacementData).forEach(k => {
        if (k.startsWith(dayKey + '-')) delete qaPlacementData[k];
    });
    delete qaCalendarData[dayKey];
    qaCloseEditPanel();
    qaShowToast('削除しました');

    // 変更通知を送信
    const site = qaCurrentSiteId ? (function() {
        var c = qaClients.find(function(x) { return x.id === qaCurrentClientId; });
        return c ? c.sites.find(function(s) { return s.id === qaCurrentSiteId; }) : null;
    })() : null;
    qaCnSelfNotify('delete', {
        clientId: qaCurrentClientId, siteId: qaCurrentSiteId,
        clientName: qaCurrentClientName, siteName: qaCurrentSiteName,
        category: site?.category || '', shift: site?.shift || '', branch: site?.branch || '',
        dayKey: dayKey, dayLabel: dayLabel,
        _deletedSnapshot: _cnDelSnap
    });
}

function qaSaveEntry() {
    if (!qaSelectedDay) return;
    const count = parseInt(document.getElementById('qaEditCount').value);
    if (!count || count <= 0) {
        qaShowToast('人数を入力してください');
        return;
    }

    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(qaSelectedDay).padStart(2, '0')}`;
    // セル選択時のスナップショットを通知比較用に使う（oninputでcalendarDataが先に更新されるため）
    const oldEntries = qaEntrySnapshot;

    // 現在の配置先データを保存
    qaSavePlacementData();

    // カレンダー表示用 — 配置先ごとのエントリ配列を保存
    const entries = [];
    for (let i = 0; i < qaPlacementCount; i++) {
        const pd = qaPlacementData[`${dayKey}-${i}`];
        if (pd && parseInt(pd.count) > 0) {
            entries.push({ count: parseInt(pd.count), reliability: pd.reliability || '確定' });
        }
    }
    if (entries.length === 0) {
        delete qaCalendarData[dayKey];
    } else {
        qaCalendarData[dayKey] = { entries };
    }
    // アコーディオンを折りたたむ
    document.getElementById('qaCalEditPanel').classList.add('collapsed');
    qaExitWeekMode();
    qaRenderCalendar();
    document.getElementById('qaCalendarScreen').scrollTop = 0;
    qaShowToast('保存しました');

    // 変更通知を送信
    const site = qaCurrentSiteId ? (function() {
        var c = qaClients.find(function(x) { return x.id === qaCurrentClientId; });
        return c ? c.sites.find(function(s) { return s.id === qaCurrentSiteId; }) : null;
    })() : null;
    const dayLabel = (qaCalendarMonth + 1) + '月' + qaSelectedDay + '日';
    const isNew = !oldEntries;
    const totalCount = entries.reduce(function(sum, e) { return sum + e.count; }, 0);

    // 復元用スナップショット（新しい状態）
    var _cnNewPlacements = {};
    Object.keys(qaPlacementData).forEach(function(k) {
        if (k.startsWith(dayKey + '-')) _cnNewPlacements[k] = JSON.parse(JSON.stringify(qaPlacementData[k]));
    });
    var _cnNewCalSnap = qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null;

    if (isNew) {
        qaCnSelfNotify('add', {
            clientId: qaCurrentClientId, siteId: qaCurrentSiteId,
            clientName: qaCurrentClientName, siteName: qaCurrentSiteName,
            category: site?.category || '', shift: site?.shift || '', branch: site?.branch || '',
            dayKey: dayKey, dayLabel: dayLabel,
            details: [
                { field: '人数', value: totalCount + '名' },
                { field: '配置先数', value: entries.length + '件' }
            ],
            _addedKey: dayKey,
            _addedData: _cnNewPlacements,
            _addedCalEntry: _cnNewCalSnap
        });
    } else {
        const oldTotal = oldEntries.entries ? oldEntries.entries.reduce(function(sum, e) { return sum + e.count; }, 0) : 0;
        const diffs = [];
        if (oldTotal !== totalCount) diffs.push({ field: '人数', oldVal: oldTotal + '名', newVal: totalCount + '名' });
        if (oldEntries.entries && oldEntries.entries.length !== entries.length) diffs.push({ field: '配置先数', oldVal: oldEntries.entries.length + '件', newVal: entries.length + '件' });
        // 配置先ごとの詳細差分（地図等）
        for (let i = 0; i < qaPlacementCount; i++) {
            const pk = `${dayKey}-${i}`;
            const oldPd = qaPlacementSnapshot[pk];
            const newPd = qaPlacementData[pk];
            if (oldPd && newPd) {
                var oldMaps = oldPd.maps || (oldPd.mapUrl ? [{ label: '現場地図', url: oldPd.mapUrl }] : []);
                var newMaps = newPd.maps || (newPd.mapUrl ? [{ label: '現場地図', url: newPd.mapUrl }] : []);
                var oldMapStr = oldMaps.map(function(m) { return (m.label || '') + ':' + (m.url || ''); }).join('|');
                var newMapStr = newMaps.map(function(m) { return (m.label || '') + ':' + (m.url || ''); }).join('|');
                if (oldMapStr !== newMapStr) {
                    var oldLabels = oldMaps.map(function(m) { return m.label || '(無題)'; }).join(', ') || '(なし)';
                    var newLabels = newMaps.map(function(m) { return m.label || '(無題)'; }).join(', ') || '(なし)';
                    diffs.push({ field: '地図', oldVal: oldLabels, newVal: newLabels });
                    break;  // 1件でも差分があれば十分
                }
            }
        }
        if (diffs.length > 0) {
            // 復元用スナップショット（変更前の状態）
            var _cnOldSnap = { dayKey: dayKey, calendarData: oldEntries ? JSON.parse(JSON.stringify(oldEntries)) : null, placements: qaPlacementSnapshot ? JSON.parse(JSON.stringify(qaPlacementSnapshot)) : {} };
            var _cnNewSnap = { dayKey: dayKey, calendarData: _cnNewCalSnap, placements: _cnNewPlacements };
            qaCnSelfNotify('modify', {
                clientId: qaCurrentClientId, siteId: qaCurrentSiteId,
                clientName: qaCurrentClientName, siteName: qaCurrentSiteName,
                category: site?.category || '', shift: site?.shift || '', branch: site?.branch || '',
                dayKey: dayKey, dayLabel: dayLabel,
                diffs: diffs,
                _snapshot: _cnOldSnap, _newSnapshot: _cnNewSnap
            });
        }
    }
}

// --- ユーティリティ ---
function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function qaShowToast(msg) {
    const toast = document.getElementById('qaToast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// --- タイムセレクト初期化 ---
function qaInitTimeSelects() {
    document.querySelectorAll('.qa-time-select-row').forEach(row => {
        const hourSel = row.querySelector('.qa-time-hour');
        const minSel = row.querySelector('.qa-time-min');
        if (hourSel.options.length > 0) return; // 初期化済み
        // 空選択肢
        hourSel.innerHTML = '<option value="">--</option>';
        for (let h = 0; h < 24; h++) {
            hourSel.innerHTML += `<option value="${h}">${String(h).padStart(2, '0')}</option>`;
        }
        minSel.innerHTML = '<option value="">--</option>';
        for (let m = 0; m < 60; m += 10) {
            minSel.innerHTML += `<option value="${m}">${String(m).padStart(2, '0')}</option>`;
        }
    });
}

function qaGetTimeValue(id) {
    const row = document.getElementById(id);
    const h = row.querySelector('.qa-time-hour').value;
    const m = row.querySelector('.qa-time-min').value;
    if (h === '' && m === '') return '';
    return `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

function qaSetTimeValue(id, val) {
    const row = document.getElementById(id);
    const hourSel = row.querySelector('.qa-time-hour');
    const minSel = row.querySelector('.qa-time-min');
    if (!val) {
        hourSel.value = '';
        minSel.value = '';
        return;
    }
    const parts = val.split(':');
    hourSel.value = parseInt(parts[0]);
    // 分を最も近い10分単位に丸める
    const rawMin = parseInt(parts[1]) || 0;
    minSel.value = Math.round(rawMin / 10) * 10;
}

// --- Enterキー対応 ---
document.addEventListener('DOMContentLoaded', () => {
    qaInitTimeSelects();
    document.getElementById('qaPassword')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') qaLogin();
    });
    document.getElementById('qaNewClientName')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') qaSubmitNewClient();
    });
    // 共通GCフィルタ変更イベントで再描画
    document.addEventListener('gcFilterChanged', () => {
        qaRenderTabs();
        qaRenderClients();
        // 変更通知モーダルが開いていれば再描画
        var cnModal = document.getElementById('qaCnModal');
        if (cnModal && cnModal.classList.contains('active')) {
            qaCnRenderLatest();
            qaCnRenderHistory();
        }
    });
});

// ==================== 変更通知システム ====================

const qaCnState = {
    notifications: [],
    history: [],
    unreadCount: 0,
    activeTab: 'latest',
    nextId: 1,
    filterSite: ''
};

const qaCnCatClassMap = {
    '施設': 'md-cn-cat-facility', 'イベント': 'md-cn-cat-event',
    '高速': 'md-cn-cat-highway', '交通': 'md-cn-cat-traffic',
    '応援交通': 'md-cn-cat-support'
};
const qaCnShiftClassMap = { '昼': 'md-cn-shift-day', '夜': 'md-cn-shift-night' };

function qaCnTimeNow() {
    var d = new Date();
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
        d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

// バッジ更新（ホーム + カレンダー両方）
function qaCnUpdateBadge() {
    ['qaCnBadge', 'qaCnBadgeCal'].forEach(function(id) {
        var badge = document.getElementById(id);
        if (!badge) return;
        if (qaCnState.unreadCount > 0) {
            badge.textContent = qaCnState.unreadCount;
            badge.hidden = false;
        } else {
            badge.textContent = '0';
            badge.hidden = true;
        }
    });
}

// トースト表示（コンパクト1行・1件のみ・横スワイプで消去）
function qaCnShowToast(n) {
    var container = document.getElementById('qaCnToastContainer');
    if (!container) return;
    // 既存のトーストを即座に除去
    var existing = container.querySelectorAll('.md-cn-toast');
    for (var i = 0; i < existing.length; i++) existing[i].remove();
    var toast = document.createElement('div');
    var dotColors = { add: '#44A6B5', modify: '#DECCBE', delete: '#DB577B' };
    var typeLabels = { add: '追加', modify: '変更', delete: '削除' };
    toast.className = 'md-cn-toast md-cn-toast-' + n.type;
    toast.innerHTML =
        '<span class="md-cn-toast-icon" style="width:10px;height:10px;border-radius:50%;background:' + dotColors[n.type] + ';flex-shrink:0;"></span>' +
        '<div class="md-cn-toast-body">' +
            '<span class="md-cn-toast-title">' + typeLabels[n.type] + '</span>' +
            '<span class="md-cn-toast-desc">' + escHtml(n.user) + ' — ' + escHtml(n.siteName || '') + '</span>' +
        '</div>';
    // タップで通知モーダルを開く
    toast.onclick = function() {
        qaCnDismissToast(toast);
        qaCnOpenModal();
    };
    // 横スワイプで消去
    qaCnAddSwipeToDismiss(toast);
    container.appendChild(toast);
    // 3秒後に自動消去
    setTimeout(function() {
        if (toast.parentNode) {
            qaCnDismissToast(toast);
        }
    }, 3000);
}

function qaCnDismissToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('md-cn-toast-exit');
    setTimeout(function() { toast.remove(); }, 250);
}

function qaCnAddSwipeToDismiss(toast) {
    var startX = 0;
    var currentX = 0;
    var swiping = false;
    toast.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        currentX = startX;
        swiping = true;
        toast.style.transition = 'none';
    }, { passive: true });
    toast.addEventListener('touchmove', function(e) {
        if (!swiping) return;
        currentX = e.touches[0].clientX;
        var dx = currentX - startX;
        if (dx > 0) {
            toast.style.transform = 'translateX(' + dx + 'px)';
            toast.style.opacity = Math.max(0, 1 - dx / 150);
        }
    }, { passive: true });
    toast.addEventListener('touchend', function() {
        if (!swiping) return;
        swiping = false;
        var dx = currentX - startX;
        toast.style.transition = '';
        if (dx > 60) {
            qaCnDismissToast(toast);
        } else {
            toast.style.transform = '';
            toast.style.opacity = '';
        }
    });
}

// パネル開閉: ヘッダーベルクリックは描画のみ。開閉は co-notify-panel.js が処理
function qaCnOpenModal() {
    // 既に開いているアンカーがあれば描画スキップ (閉じる動作)
    var anyOpen = document.querySelector('.qa-cn-anchor.is-open');
    if (anyOpen) return;
    qaCnState.notifications.forEach(function(n) { n._read = true; });
    qaCnState.unreadCount = 0;
    qaCnUpdateBadge();
    qaCnRenderLatest();
    qaCnRenderHistory();
}

function qaCnCloseModal() {
    document.querySelectorAll('.qa-cn-anchor').forEach(function(a) {
        if (window.coNotifyPanel) window.coNotifyPanel.close(a);
    });
}

// 互換ラッパー (co-notify-panel.js が処理する上タブ切替)
function qaCnSwitchTab(tabName) {
    qaCnState.activeTab = tabName;
    document.querySelectorAll('.qa-cn-panel').forEach(function(panel) {
        panel.querySelectorAll('.cn-tab').forEach(function(t) {
            t.classList.toggle('is-active', t.dataset.tab === tabName);
        });
        panel.querySelectorAll('.cn-tab-view').forEach(function(v) {
            v.classList.toggle('is-active', v.dataset.tab === tabName);
        });
    });
}

// 現場フィルタ (履歴タブ内チップ/一覧で代替するため互換スタブ)
function qaCnSetFilter(site) {
    qaCnState.filterSite = site;
    qaCnRenderLatest();
    qaCnRenderHistory();
}
function qaCnUpdateFilterSelect() { /* 互換スタブ: 旧selectは廃止 */ }

// セル明滅ハイライト
function qaCnHighlightCell(dayKey, type) {
    // 既存のハイライトをクリア
    document.querySelectorAll('.qa-cal-cell[class*="md-cn-cell-glow-"]').forEach(function(el) {
        el.classList.remove('md-cn-cell-glow-add', 'md-cn-cell-glow-modify', 'md-cn-cell-glow-delete');
    });
    // dayKeyからday番号を取得
    var parts = dayKey.split('-');
    var targetYear = parseInt(parts[0]);
    var targetMonth = parseInt(parts[1]) - 1; // 0-indexed
    var targetDay = parseInt(parts[2]);
    // 現在表示中のカレンダーと一致するか
    if (targetYear !== qaCalendarYear || targetMonth !== qaCalendarMonth) return;
    // セルを探す
    var cells = document.querySelectorAll('.qa-cal-cell');
    cells.forEach(function(cell) {
        if (cell.classList.contains('qa-cal-outside')) return;
        var dayNum = cell.querySelector('.qa-cal-day-num');
        if (dayNum && parseInt(dayNum.textContent) === targetDay) {
            var glowClass = 'md-cn-cell-glow-' + (type || 'modify');
            cell.classList.add(glowClass);
            setTimeout(function() { cell.classList.remove(glowClass); }, 5000);
        }
    });
}

// カードクリック→該当カレンダー画面へ遷移してセルハイライト
function qaCnCardClick(notificationId) {
    var n = qaCnState.notifications.find(function(x) { return x.id === notificationId; });
    if (!n || !n.dayKey) return;
    qaCnCloseModal();

    // カレンダー画面が開いていない or 別の現場を表示中なら遷移
    var calScreen = document.getElementById('qaCalendarScreen');
    var isCalOpen = calScreen && calScreen.classList.contains('active');
    var isSameSite = qaCurrentClientName === n.clientName && qaCurrentSiteName === n.siteName;

    if (!isCalOpen || !isSameSite) {
        // 該当の現場のカレンダーを開く
        if (n.clientId && n.siteId) {
            qaOpenCalendar(n.clientId, n.siteId);
        }
    }

    // dayKeyの年月に合わせてカレンダーを移動
    var parts = n.dayKey.split('-');
    var targetYear = parseInt(parts[0]);
    var targetMonth = parseInt(parts[1]) - 1;
    if (qaCalendarYear !== targetYear || qaCalendarMonth !== targetMonth) {
        qaCalendarYear = targetYear;
        qaCalendarMonth = targetMonth;
        qaRenderCalendar();
    }

    setTimeout(function() { qaCnHighlightCell(n.dayKey, n.type); }, 200);
}

// 履歴→最新タブの該当アイテムへジャンプ
function qaCnJumpToCard(notificationId) {
    qaCnSwitchTab('latest');
    setTimeout(function() {
        var item = document.querySelector('.qa-cn-panel.qa-cn-anchor-open .cn-item[data-nid="' + notificationId + '"]')
            || document.querySelector('.qa-cn-panel .cn-item[data-nid="' + notificationId + '"]');
        if (!item) return;
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        item.classList.add('cn-item-highlight');
        setTimeout(function() { item.classList.remove('cn-item-highlight'); }, 1500);
    }, 50);
}

// ========== 通知パネル レンダリング (cn-* 規約) ==========
const qaCnIconChars = { add: '＋', modify: '✎', delete: '✕' };

function qaCnSiteLabel(n) {
    if (n.clientName && n.siteName) return n.clientName + ' / ' + n.siteName;
    return n.siteName || n.clientName || '';
}

function qaCnDescribeAction(n) {
    var name = qaCnSiteLabel(n);
    if (n.type === 'add') return name + ' を新規追加';
    if (n.type === 'delete') return name + ' を削除';
    if (n.type === 'modify') {
        var fields = n.diffs ? n.diffs.map(function(d) { return d.field; }).join('・') : '';
        return name + (fields ? ' の' + fields + 'を変更' : ' を変更');
    }
    return name;
}

function qaCnBuildDiffHtml(n) {
    if (n.type === 'modify' && n.diffs) {
        return n.diffs.map(function(d) {
            return '<div class="cn-diff-line">' +
                '<span class="cn-diff-label">' + escHtml(d.field) + '</span>' +
                '<span class="cn-diff-from">' + escHtml(d.oldVal) + '</span>' +
                '<span class="cn-diff-arrow">→</span>' +
                '<span class="cn-diff-to">' + escHtml(d.newVal) + '</span>' +
            '</div>';
        }).join('');
    } else if (n.type === 'add' && n.details) {
        return n.details.map(function(d) {
            return '<div class="cn-diff-line">' +
                '<span class="cn-diff-label">' + escHtml(d.field) + '</span>' +
                '<span class="cn-diff-to">' + escHtml(d.value) + '</span>' +
            '</div>';
        }).join('');
    }
    return '';
}

function qaCnRenderItem(n) {
    var iconChar = qaCnIconChars[n.type] || '?';
    var stateClass = n.reverted ? ' is-reverted' : (n._approved ? ' is-approved' : '');
    var unreadClass = !n._read ? ' is-unread' : '';
    var dayChip = n.dayLabel ? '<span class="cn-date-chip">' + escHtml(n.dayLabel) + '</span>' : '';

    var diffHtml = qaCnBuildDiffHtml(n);
    if (!diffHtml && n.type === 'delete') {
        diffHtml = '<div class="cn-diff-line"><span class="cn-diff-from">この配置は削除されました</span></div>';
    }
    var actionBtn = n.reverted
        ? '<button type="button" class="cn-jump-btn" onclick="event.stopPropagation();qaCnReapprove(' + n.id + ')">↻ 適用する</button>'
        : '<button type="button" class="cn-jump-btn" onclick="event.stopPropagation();qaCnRevert(' + n.id + ')">↩ キャンセル</button>';
    var expandHtml = '<div class="cn-expand">' + diffHtml + actionBtn + '</div>';
    var chevron = '<span class="cn-chevron">▾</span>';

    var siteKey = n.siteName || '';
    return '<div class="cn-item type-' + n.type + unreadClass + stateClass + '" data-nid="' + n.id + '" data-type="' + n.type + '" data-site="' + escHtml(siteKey) + '" data-account="' + escHtml(n.user || '') + '">' +
        '<div class="cn-item-row">' +
            '<div class="cn-icon type-' + n.type + '">' + iconChar + '</div>' +
            '<div class="cn-text">' +
                '<div class="cn-text-main">' + escHtml(qaCnDescribeAction(n)) + dayChip + '</div>' +
                '<div class="cn-text-sub">' + escHtml(n.user) + ' ・ ' + escHtml(n.time || '') + '</div>' +
            '</div>' +
            chevron +
        '</div>' +
        expandHtml +
    '</div>';
}

function qaCnFilterNotifications() {
    return qaCnState.notifications.filter(function(n) {
        if (n.branch && typeof qaIsGcVisible === 'function' && !qaIsGcVisible(n.branch)) return false;
        if (qaCnState.filterSite !== '' && n.siteName !== qaCnState.filterSite) return false;
        return true;
    });
}

function qaCnRenderLatest() {
    var bodies = document.querySelectorAll('.qa-cn-latest-body');
    var filtered = qaCnFilterNotifications();
    var html;
    if (filtered.length === 0) {
        html = '<div class="cn-empty">変更通知はありません</div>';
    } else {
        html = '<div class="cn-date-group">' +
            '<button type="button" class="cn-date-group-head" aria-expanded="true">今日' +
                '<span class="cn-date-group-toggle" aria-hidden="true">▴</span>' +
            '</button>' +
            filtered.map(qaCnRenderItem).join('') +
        '</div>';
    }
    bodies.forEach(function(b) { b.innerHTML = html; });
}

function qaCnFilterHistory() {
    return qaCnState.history.filter(function(h) {
        if (h.branch && typeof qaIsGcVisible === 'function' && !qaIsGcVisible(h.branch)) return false;
        if (qaCnState.filterSite !== '' && h.siteName !== qaCnState.filterSite) return false;
        return true;
    });
}

function qaCnRenderHistoryItem(h) {
    var iconChar = qaCnIconChars[h.type] || '?';
    var name = h.clientName ? h.clientName + ' / ' + (h.siteName || '') : (h.siteName || '');
    var dayChip = h.dayLabel ? '<span class="cn-date-chip">' + escHtml(h.dayLabel) + '</span>' : '';
    var summary = h.summary ? ' (' + h.summary + ')' : '';
    var siteKey = h.siteName || '';
    var attrs = (h.notificationId != null ? ' data-nid="' + h.notificationId + '"' : '') +
        ' data-type="' + h.type + '"' +
        ' data-site="' + escHtml(siteKey) + '"' +
        ' data-account="' + escHtml(h.user || '') + '"';
    return '<div class="cn-item type-' + h.type + '"' + attrs + '>' +
        '<div class="cn-item-row">' +
            '<div class="cn-icon type-' + h.type + '">' + iconChar + '</div>' +
            '<div class="cn-text">' +
                '<div class="cn-text-main">' + escHtml(name) + escHtml(summary) + dayChip + '</div>' +
                '<div class="cn-text-sub">' + escHtml(h.user) + ' ・ ' + escHtml(h.time || '') + '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function qaCnGroupBy(items, keyFn) {
    var groups = {};
    var order = [];
    items.forEach(function(it) {
        var k = keyFn(it) || '(未分類)';
        if (!groups[k]) { groups[k] = []; order.push(k); }
        groups[k].push(it);
    });
    return order.map(function(k) { return { key: k, items: groups[k] }; });
}

function qaCnRenderAxisGroups(grouped) {
    if (grouped.length === 0) return '<div class="cn-empty">変更履歴はありません</div>';
    return grouped.map(function(g) {
        return '<div class="cn-axis-group">' +
            '<button type="button" class="cn-axis-group-head" aria-expanded="true">' + escHtml(g.key) +
                '<span class="cn-axis-group-toggle" aria-hidden="true">▴</span>' +
            '</button>' +
            g.items.map(qaCnRenderHistoryItem).join('') +
        '</div>';
    }).join('');
}

function qaCnRenderHistory() {
    var siteBodies = document.querySelectorAll('.qa-cn-history-site-body');
    var accBodies = document.querySelectorAll('.qa-cn-history-account-body');
    var filtered = qaCnFilterHistory();

    var bySite = qaCnGroupBy(filtered, function(h) {
        return h.clientName ? h.clientName + ' / ' + (h.siteName || '') : (h.siteName || '');
    });
    var siteHtml = qaCnRenderAxisGroups(bySite);
    siteBodies.forEach(function(b) { b.innerHTML = siteHtml; });

    var byAcc = qaCnGroupBy(filtered, function(h) { return h.user; });
    var accHtml = qaCnRenderAxisGroups(byAcc);
    accBodies.forEach(function(b) { b.innerHTML = accHtml; });

    qaCnRenderPickBadges(filtered);
}

function qaCnRenderPickBadges(historyItems) {
    var companyBadgeNodes = document.querySelectorAll('.qa-cn-pick-company');
    var siteGroupsNodes = document.querySelectorAll('.qa-cn-pick-site-groups');
    var accBadgeNodes = document.querySelectorAll('.qa-cn-pick-account');

    var byCompany = qaCnGroupBy(
        historyItems.filter(function(h) { return !!h.clientName; }),
        function(h) { return h.clientName; }
    );
    var companyHtml = byCompany.length
        ? byCompany.map(function(g) {
            return '<button type="button" class="cn-pick-badge" data-company="' + escHtml(g.key) + '">' + escHtml(g.key) + '</button>';
        }).join('')
        : '<button type="button" class="cn-pick-badge" disabled>契約先がありません</button>';
    companyBadgeNodes.forEach(function(n) { n.innerHTML = companyHtml; });

    var siteGroupHtml = byCompany.map(function(g) {
        var sites = {};
        g.items.forEach(function(h) { if (h.siteName) sites[h.siteName] = true; });
        return '<div class="cn-pick-badges" data-company="' + escHtml(g.key) + '" hidden>' +
            Object.keys(sites).map(function(s) {
                return '<button type="button" class="cn-pick-badge">' + escHtml(s) + '</button>';
            }).join('') +
        '</div>';
    }).join('');
    siteGroupsNodes.forEach(function(n) { n.innerHTML = siteGroupHtml; });

    var users = {};
    historyItems.forEach(function(h) { if (h.user) users[h.user] = true; });
    var userList = Object.keys(users);
    var accHtml = userList.length
        ? userList.map(function(u) { return '<button type="button" class="cn-pick-badge">' + escHtml(u) + '</button>'; }).join('')
        : '<button type="button" class="cn-pick-badge" disabled>アカウントがありません</button>';
    accBadgeNodes.forEach(function(n) { n.innerHTML = accHtml; });
}

// 履歴/最新アイテム → セルへジャンプ
document.addEventListener('cn:jump', function(e) {
    var item = e.detail && e.detail.item;
    if (!item) return;
    if (!item.closest('.qa-cn-panel')) return;
    var nid = item.dataset && item.dataset.nid;
    if (!nid) return;
    qaCnCardClick(parseInt(nid, 10));
});

// QA登録現場かどうか判定
function qaCnIsRegisteredSite(siteName) {
    for (var i = 0; i < qaClients.length; i++) {
        for (var j = 0; j < qaClients[i].sites.length; j++) {
            if (qaClients[i].sites[j].name === siteName) return true;
        }
    }
    return false;
}

// 自分の操作を変更通知として送信
function qaCnSelfNotify(type, opts) {
    var n = {
        type: type,
        user: qaCurrentUser.name,
        clientId: opts.clientId || null,
        siteId: opts.siteId || null,
        siteName: opts.siteName || '',
        clientName: opts.clientName || '',
        category: opts.category || '',
        shift: opts.shift || '',
        branch: opts.branch || '',
        dayKey: opts.dayKey || null,
        dayLabel: opts.dayLabel || '',
        time: qaCnTimeNow(),
        diffs: opts.diffs || null,
        details: opts.details || null,
        _selfAction: true
    };
    // スナップショット（復元用）
    if (opts._snapshot) n._snapshot = opts._snapshot;
    if (opts._newSnapshot) n._newSnapshot = opts._newSnapshot;
    if (opts._addedKey) n._addedKey = opts._addedKey;
    if (opts._addedData) n._addedData = opts._addedData;
    if (opts._addedCalEntry) n._addedCalEntry = opts._addedCalEntry;
    if (opts._addedPlacementIdx !== undefined) n._addedPlacementIdx = opts._addedPlacementIdx;
    if (opts._deletedSnapshot) n._deletedSnapshot = opts._deletedSnapshot;
    // 契約先/現場の復元用
    if (opts._clientSnapshot) n._clientSnapshot = opts._clientSnapshot;
    if (opts._siteSnapshot) n._siteSnapshot = opts._siteSnapshot;
    qaCnReceive(n);
}

// 通知受信（QA登録現場のみ受信 — 自分の操作は常に受信）
function qaCnReceive(n) {
    if (!n._selfAction && !qaCnIsRegisteredSite(n.siteName)) {
        // QA未登録の現場 → 通知を無視
        return;
    }
    n.id = qaCnState.nextId++;
    n.reverted = false;
    n._read = false;
    n._approved = true;
    qaCnState.notifications.unshift(n);
    qaCnState.history.unshift({
        notificationId: n.id,
        type: n.type,
        user: n.user,
        time: n.time,
        siteName: n.siteName || '',
        clientName: n.clientName || '',
        branch: n.branch || '',
        dayLabel: n.dayLabel || '',
        summary: (n.type === 'modify' && n.diffs
            ? n.diffs.map(function(d) { return d.field; }).join('・')
            : '')
    });
    qaCnState.unreadCount++;
    qaCnUpdateBadge();
    qaCnShowToast(n);
    // カレンダー表示中ならセルハイライト
    if (n.dayKey && document.getElementById('qaCalendarScreen').classList.contains('active')) {
        qaRenderCalendar();
        setTimeout(function() { qaCnHighlightCell(n.dayKey, n.type); }, 100);
    }
}

// --- 元に戻す / やっぱり反映 ---

// スナップショットからカレンダー＋配置データを一括復元するヘルパー
function _qaCnRestoreSnapshot(snap) {
    if (!snap) return;
    // 新形式（自己通知）: placements オブジェクト + dayKey
    if (snap.placements) {
        var dayKey = snap.dayKey;
        // 該当日の既存配置データを削除してから復元
        Object.keys(qaPlacementData).forEach(function(k) {
            if (k.startsWith(dayKey + '-')) delete qaPlacementData[k];
        });
        Object.keys(snap.placements).forEach(function(k) {
            qaPlacementData[k] = JSON.parse(JSON.stringify(snap.placements[k]));
        });
        if (snap.calendarData) {
            qaCalendarData[dayKey] = JSON.parse(JSON.stringify(snap.calendarData));
        } else {
            delete qaCalendarData[dayKey];
        }
    }
    // 旧形式（デモ通知）: placementKey + placementEntry
    if (snap.placementKey !== undefined) {
        if (snap.placementEntry !== undefined) {
            qaPlacementData[snap.placementKey] = JSON.parse(JSON.stringify(snap.placementEntry));
        }
        if (snap.calendarData !== undefined) {
            if (snap.calendarData === null) {
                delete qaCalendarData[snap.dayKey];
            } else {
                qaCalendarData[snap.dayKey] = JSON.parse(JSON.stringify(snap.calendarData));
            }
        }
    }
}

function qaCnRevert(id) {
    var n = qaCnState.notifications.find(function(x) { return x.id === id; });
    if (!n || n.reverted) return;

    if (n.type === 'modify' && n._snapshot) {
        _qaCnRestoreSnapshot(n._snapshot);
        qaRenderCalendar();
    } else if (n.type === 'add' && n._addedKey) {
        // 追加されたデータを削除
        var dayKey = n.dayKey || n._addedKey;
        if (n._addedData && typeof n._addedData === 'object' && !Array.isArray(n._addedData)) {
            // 新形式: 複数配置キーを削除
            Object.keys(n._addedData).forEach(function(k) { delete qaPlacementData[k]; });
            delete qaCalendarData[dayKey];
        } else {
            // 旧形式: 単一キー
            delete qaPlacementData[n._addedKey];
            var calEntry = qaCalendarData[dayKey];
            if (calEntry && calEntry.entries) {
                var pIdx = n._addedPlacementIdx;
                calEntry.entries.splice(pIdx, 1);
                if (calEntry.entries.length === 0) delete qaCalendarData[dayKey];
            }
        }
        qaRenderCalendar();
    } else if (n.type === 'delete' && n._deletedSnapshot) {
        _qaCnRestoreSnapshot(n._deletedSnapshot);
        qaRenderCalendar();
    }

    n.reverted = true;
    n._approved = false;
    if (n._read) {
        n._read = false;
        qaCnState.unreadCount++;
        qaCnUpdateBadge();
    }
    qaCnRenderLatest();
}

function qaCnReapprove(id) {
    var n = qaCnState.notifications.find(function(x) { return x.id === id; });
    if (!n || !n.reverted) return;

    if (n.type === 'modify' && n._newSnapshot) {
        // 変更を再適用
        _qaCnRestoreSnapshot(n._newSnapshot);
        qaRenderCalendar();
    } else if (n.type === 'add' && n._addedData) {
        // 配置を再追加
        if (typeof n._addedData === 'object' && !Array.isArray(n._addedData) && n._addedCalEntry) {
            // 新形式: 複数配置キーを復元
            var dayKey = n.dayKey || n._addedKey;
            Object.keys(n._addedData).forEach(function(k) {
                qaPlacementData[k] = JSON.parse(JSON.stringify(n._addedData[k]));
            });
            qaCalendarData[dayKey] = JSON.parse(JSON.stringify(n._addedCalEntry));
        } else {
            // 旧形式
            qaPlacementData[n._addedKey] = JSON.parse(JSON.stringify(n._addedData));
            var dayKey = n.dayKey;
            if (!qaCalendarData[dayKey]) qaCalendarData[dayKey] = { entries: [] };
            qaCalendarData[dayKey].entries.push(JSON.parse(JSON.stringify(n._addedCalEntry)));
            n._addedPlacementIdx = qaCalendarData[dayKey].entries.length - 1;
        }
        qaRenderCalendar();
    } else if (n.type === 'delete' && n._deletedSnapshot) {
        // 配置を再削除
        var snap = n._deletedSnapshot;
        if (snap.placements) {
            // 新形式
            Object.keys(snap.placements).forEach(function(k) { delete qaPlacementData[k]; });
            delete qaCalendarData[snap.dayKey];
        } else {
            // 旧形式
            delete qaPlacementData[snap.placementKey];
            var calEntry = qaCalendarData[snap.dayKey];
            if (calEntry && calEntry.entries) {
                calEntry.entries.splice(snap.placementIdx, 1);
                if (calEntry.entries.length === 0) delete qaCalendarData[snap.dayKey];
            }
        }
        qaRenderCalendar();
    }

    n.reverted = false;
    n._approved = true;
    if (!n._read) {
        n._read = true;
        qaCnState.unreadCount = Math.max(0, qaCnState.unreadCount - 1);
        qaCnUpdateBadge();
    }
    qaCnRenderLatest();
}

// --- デモシミュレーション ---
var qaCnDemoInterval = null;
var qaCnDemoRunning = false;
var qaCnDemoIndex = 0;

// デモで使うサイト情報を取得するヘルパー
function qaCnGetSiteInfo(clientId, siteId) {
    var client = qaClients.find(function(c) { return c.id === clientId; });
    var site = client ? client.sites.find(function(s) { return s.id === siteId; }) : null;
    return { client: client, site: site, clientName: client ? client.name : '', siteName: site ? site.name : '', category: site ? site.category : '', shift: site ? site.shift : '', branch: site ? site.branch : '' };
}

// デモ: 特定日のkeyを生成
function qaCnDemoDayKey(day) {
    return qaCalendarYear + '-' + String(qaCalendarMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

var qaCnDemoSequence = [
    {
        type: 'modify', user: '山田（現場管理）', clientId: 1, siteId: 101, day: 5,
        diffs: [{ field: '人数', oldVal: '', newVal: '' }],
        apply: function() {
            var info = qaCnGetSiteInfo(this.clientId, this.siteId);
            var dayKey = qaCnDemoDayKey(this.day);
            var pKey = dayKey + '-0';
            // スナップショット保存
            var oldPlacement = qaPlacementData[pKey] ? JSON.parse(JSON.stringify(qaPlacementData[pKey])) : null;
            var oldCal = qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null;
            var oldCount = oldPlacement ? oldPlacement.count : '0';
            var newCount = '5';
            this.diffs[0].oldVal = oldCount + '名';
            this.diffs[0].newVal = newCount + '名';
            // データ変更
            if (!qaPlacementData[pKey]) qaPlacementData[pKey] = { count: '0', reliability: '確定', subTasks: [{ label: '工事名1', value: '' }], badges: [], startTime: '08:00', endTime: '17:00', supervisor: '', supervisorTel: '', meetingPlace: '', meetingTime: '', mapUrl: '', remarks: '' };
            qaPlacementData[pKey].count = newCount;
            if (!qaCalendarData[dayKey]) qaCalendarData[dayKey] = { entries: [{ count: parseInt(oldCount) || 0, reliability: '確定' }] };
            qaCalendarData[dayKey].entries[0].count = parseInt(newCount);
            var newPlacement = JSON.parse(JSON.stringify(qaPlacementData[pKey]));
            var newCal = JSON.parse(JSON.stringify(qaCalendarData[dayKey]));
            return {
                siteName: info.siteName, clientName: info.clientName, category: info.category, shift: info.shift, branch: info.branch,
                dayKey: dayKey, dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日',
                _snapshot: { placementKey: pKey, placementEntry: oldPlacement, dayKey: dayKey, calendarData: oldCal },
                _newSnapshot: { placementKey: pKey, placementEntry: newPlacement, dayKey: dayKey, calendarData: newCal }
            };
        }
    },
    {
        type: 'add', user: '鈴木（受注担当）', clientId: 1, siteId: 102, day: 12,
        details: [{ field: '現場', value: '東名高速 補修工事' }, { field: '区分', value: '高速（夜）' }, { field: '人数', value: '3名' }],
        apply: function() {
            var info = qaCnGetSiteInfo(this.clientId, this.siteId);
            var dayKey = qaCnDemoDayKey(this.day);
            // 新しい配置を追加
            if (!qaCalendarData[dayKey]) qaCalendarData[dayKey] = { entries: [] };
            var pIdx = qaCalendarData[dayKey].entries.length;
            var pKey = dayKey + '-' + pIdx;
            var newEntry = { count: 3, reliability: '確定' };
            var newPlacement = { count: '3', reliability: '確定', subTasks: [{ label: '工事名1', value: '補修工' }], badges: [], startTime: '20:00', endTime: '05:00', supervisor: '佐藤次郎', supervisorTel: '080-9876-5432', meetingPlace: '現場事務所前', meetingTime: '19:30', mapUrl: '', remarks: '' };
            qaCalendarData[dayKey].entries.push(newEntry);
            qaPlacementData[pKey] = newPlacement;
            return {
                siteName: info.siteName, clientName: info.clientName, category: info.category, shift: info.shift, branch: info.branch,
                dayKey: dayKey, dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日',
                _addedKey: pKey, _addedPlacementIdx: pIdx,
                _addedData: JSON.parse(JSON.stringify(newPlacement)),
                _addedCalEntry: JSON.parse(JSON.stringify(newEntry))
            };
        }
    },
    {
        type: 'modify', user: '田中 太郎（自分）', clientId: 2, siteId: 201, day: 8,
        diffs: [{ field: '開始時間', oldVal: '', newVal: '' }],
        apply: function() {
            var info = qaCnGetSiteInfo(this.clientId, this.siteId);
            var dayKey = qaCnDemoDayKey(this.day);
            var pKey = dayKey + '-0';
            var oldPlacement = qaPlacementData[pKey] ? JSON.parse(JSON.stringify(qaPlacementData[pKey])) : null;
            var oldCal = qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null;
            var oldTime = oldPlacement ? (oldPlacement.startTime || '09:00') : '09:00';
            var newTime = '10:30';
            this.diffs[0].oldVal = oldTime;
            this.diffs[0].newVal = newTime;
            if (!qaPlacementData[pKey]) qaPlacementData[pKey] = { count: '2', reliability: '確定', subTasks: [{ label: '工事名1', value: '' }], badges: [], startTime: oldTime, endTime: '18:00', supervisor: '', supervisorTel: '', meetingPlace: '', meetingTime: '', mapUrl: '', remarks: '' };
            qaPlacementData[pKey].startTime = newTime;
            if (!qaCalendarData[dayKey]) qaCalendarData[dayKey] = { entries: [{ count: 2, reliability: '確定' }] };
            var newPlacement = JSON.parse(JSON.stringify(qaPlacementData[pKey]));
            var newCal = JSON.parse(JSON.stringify(qaCalendarData[dayKey]));
            return {
                siteName: info.siteName, clientName: info.clientName, category: info.category, shift: info.shift, branch: info.branch,
                dayKey: dayKey, dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日',
                _snapshot: { placementKey: pKey, placementEntry: oldPlacement, dayKey: dayKey, calendarData: oldCal },
                _newSnapshot: { placementKey: pKey, placementEntry: newPlacement, dayKey: dayKey, calendarData: newCal }
            };
        }
    },
    {
        // QA未登録の現場 → qaCnReceive でフィルタされ通知されない
        type: 'modify', user: '佐藤（営業部）', clientId: null, siteId: null, day: 7,
        diffs: [{ field: '人数', oldVal: '2名', newVal: '4名' }],
        apply: function() {
            return {
                siteName: '△△工場 夜間巡回', clientName: '△△工業株式会社',
                category: '施設', shift: '夜', branch: '東央警備',
                dayKey: qaCnDemoDayKey(this.day), dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日'
            };
        }
    },
    {
        type: 'delete', user: '高橋（管理部）', clientId: 3, siteId: 301, day: 15,
        apply: function() {
            var info = qaCnGetSiteInfo(this.clientId, this.siteId);
            var dayKey = qaCnDemoDayKey(this.day);
            var pKey = dayKey + '-0';
            var oldPlacement = qaPlacementData[pKey] ? JSON.parse(JSON.stringify(qaPlacementData[pKey])) : { count: '2', reliability: '確定', subTasks: [{ label: '工事名1', value: '常駐警備' }], badges: [], startTime: '08:00', endTime: '17:00', supervisor: '山田太郎', supervisorTel: '090-1234-5678', meetingPlace: '正門前', meetingTime: '07:30', mapUrl: '', remarks: '' };
            var oldCal = qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : { entries: [{ count: 2, reliability: '確定' }] };
            // データ削除
            delete qaPlacementData[pKey];
            delete qaCalendarData[dayKey];
            return {
                siteName: info.siteName, clientName: info.clientName, category: info.category, shift: info.shift, branch: info.branch,
                dayKey: dayKey, dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日',
                _deletedSnapshot: { placementKey: pKey, placementEntry: oldPlacement, dayKey: dayKey, calendarData: oldCal, placementIdx: 0 }
            };
        }
    },
    {
        type: 'modify', user: '田中 太郎（自分）', clientId: 4, siteId: 401, day: 10,
        diffs: [{ field: '備考', oldVal: '', newVal: '' }],
        apply: function() {
            var info = qaCnGetSiteInfo(this.clientId, this.siteId);
            var dayKey = qaCnDemoDayKey(this.day);
            var pKey = dayKey + '-0';
            var oldPlacement = qaPlacementData[pKey] ? JSON.parse(JSON.stringify(qaPlacementData[pKey])) : null;
            var oldCal = qaCalendarData[dayKey] ? JSON.parse(JSON.stringify(qaCalendarData[dayKey])) : null;
            var oldRemarks = oldPlacement ? (oldPlacement.remarks || '(なし)') : '(なし)';
            var newRemarks = '夜間作業注意・安全帯必須';
            this.diffs[0].oldVal = oldRemarks;
            this.diffs[0].newVal = newRemarks;
            if (!qaPlacementData[pKey]) qaPlacementData[pKey] = { count: '3', reliability: '確定', subTasks: [{ label: '工事名1', value: '' }], badges: [], startTime: '20:00', endTime: '05:00', supervisor: '', supervisorTel: '', meetingPlace: '', meetingTime: '', mapUrl: '', remarks: '' };
            qaPlacementData[pKey].remarks = newRemarks;
            if (!qaCalendarData[dayKey]) qaCalendarData[dayKey] = { entries: [{ count: 3, reliability: '確定' }] };
            var newPlacement = JSON.parse(JSON.stringify(qaPlacementData[pKey]));
            var newCal = JSON.parse(JSON.stringify(qaCalendarData[dayKey]));
            return {
                siteName: info.siteName, clientName: info.clientName, category: info.category, shift: info.shift, branch: info.branch,
                dayKey: dayKey, dayLabel: (qaCalendarMonth + 1) + '月' + this.day + '日',
                _snapshot: { placementKey: pKey, placementEntry: oldPlacement, dayKey: dayKey, calendarData: oldCal },
                _newSnapshot: { placementKey: pKey, placementEntry: newPlacement, dayKey: dayKey, calendarData: newCal }
            };
        }
    }
];

function qaCnSendDemoNotification() {
    if (qaCnDemoIndex >= qaCnDemoSequence.length) {
        qaCnToggleDemo();
        return;
    }
    var item = qaCnDemoSequence[qaCnDemoIndex];
    qaCnDemoIndex++;
    var result = item.apply();
    if (!result) { qaCnSendDemoNotification(); return; }
    var n = {
        type: item.type,
        user: item.user,
        clientId: item.clientId,
        siteId: item.siteId,
        siteName: result.siteName,
        clientName: result.clientName,
        category: result.category,
        shift: result.shift,
        branch: result.branch,
        dayKey: result.dayKey,
        dayLabel: result.dayLabel,
        time: qaCnTimeNow(),
        diffs: item.diffs ? item.diffs.map(function(d) { return { field: d.field, oldVal: d.oldVal, newVal: d.newVal }; }) : null,
        details: item.details ? item.details.map(function(d) { return { field: d.field, value: d.value }; }) : null
    };
    // スナップショット保存
    if (item.type === 'modify') {
        n._snapshot = result._snapshot;
        n._newSnapshot = result._newSnapshot;
    } else if (item.type === 'add') {
        n._addedKey = result._addedKey;
        n._addedPlacementIdx = result._addedPlacementIdx;
        n._addedData = result._addedData;
        n._addedCalEntry = result._addedCalEntry;
    } else if (item.type === 'delete') {
        n._deletedSnapshot = result._deletedSnapshot;
    }
    qaCnReceive(n);
}

function qaCnToggleDemo() {
    var btn = document.getElementById('qaCnDemoBtn');
    if (qaCnDemoRunning) {
        clearInterval(qaCnDemoInterval);
        qaCnDemoInterval = null;
        qaCnDemoRunning = false;
        btn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-chevron-right"/></svg>デモ';
        btn.style.background = '';
        btn.style.color = '';
    } else {
        qaCnState.notifications = [];
        qaCnState.history = [];
        qaCnState.unreadCount = 0;
        qaCnState.nextId = 1;
        qaCnState.filterSite = '';
        qaCnUpdateBadge();
        qaCnDemoIndex = 0;
        qaCnDemoRunning = true;
        btn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#ui-icon-close"/></svg>停止';
        btn.style.background = '#DB577B';
        btn.style.color = '#fff';
        qaCnSendDemoNotification();
        qaCnDemoInterval = setInterval(qaCnSendDemoNotification, 3000);
    }
}
