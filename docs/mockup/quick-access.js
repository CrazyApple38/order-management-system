/* ===========================
   Quick Access モックアップ JS
   =========================== */

// --- モックデータ ---
const qaCurrentUser = { name: '田中 太郎', email: 'tanaka@example.com', initials: '田', branch: '東央警備' };

const qaClients = [
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
const qaCategoryList = ['施設', 'イベント', '高速', '交通', '応援交通'];
const qaShiftList = ['昼', '夜'];

// カレンダー用モックデータ（セルに入った受注データ）
let qaCalendarData = {};

// --- 状態 ---
let qaActiveTab = 'すべて';
let qaExpandedClientId = null;
let qaCalendarYear = 2026;
let qaCalendarMonth = 3; // 0-indexed → April = 3
let qaSelectedDay = null;
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
    document.getElementById('qaHomeScreen').style.display = 'none';
    document.getElementById('qaCalendarScreen').classList.remove('active');
    document.getElementById('qaLoginScreen').style.display = 'flex';
    document.getElementById('qaEmail').value = '';
    document.getElementById('qaPassword').value = '';
}

// --- ホーム画面 ---
function qaRenderHome() {
    document.getElementById('qaUserName').textContent = qaCurrentUser.name;
    document.getElementById('qaUserInitials').textContent = qaCurrentUser.initials;
    qaRenderTabs();
    qaRenderClients();
}

function qaRenderTabs() {
    const container = document.getElementById('qaTabs');
    container.innerHTML = qaCategories.map(cat =>
        `<div class="qa-tab${qaActiveTab === cat ? ' active' : ''}" onclick="qaSelectTab('${cat}')">${cat}</div>`
    ).join('');
}

function qaSelectTab(cat) {
    qaActiveTab = cat;
    qaExpandedClientId = null;
    qaRenderTabs();
    qaRenderClients();
}

function qaRenderClients() {
    const container = document.getElementById('qaClientList');
    const filtered = qaActiveTab === 'すべて'
        ? qaClients
        : qaClients.filter(c =>
            c.categories.includes(qaActiveTab) ||
            c.sites.some(s => s.category === qaActiveTab)
        );

    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:32px 0;font-size:13px;">該当する契約先がありません</div>';
        return;
    }

    container.innerHTML = filtered.map(client => {
        const expanded = qaExpandedClientId === client.id;
        const initials = client.name.charAt(0);
        // タブに応じて現場をフィルタ（「すべて」は全件表示）
        const visibleSites = qaActiveTab === 'すべて'
            ? client.sites
            : client.sites.filter(s => s.category === qaActiveTab || (!s.category && client.categories.includes(qaActiveTab)));
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
                <span class="qa-client-arrow">▶</span>
            </div>
            <div class="qa-site-list">
                <div class="qa-add-site-row" onclick="qaAddSiteModal(${client.id})">
                    <div class="qa-add-site-icon">＋</div>
                    <span class="qa-add-site-label">新規現場を追加</span>
                </div>
                ${visibleSites.map(site => `
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
                        <span class="qa-site-go">▶</span>
                    </div>
                    <div class="qa-site-actions">
                        <button class="qa-site-action-btn qa-site-edit" onclick="event.stopPropagation(); qaEditSite(${client.id}, ${site.id})" title="修正">修正</button>
                        <button class="qa-site-action-btn qa-site-delete" onclick="event.stopPropagation(); qaDeleteSite(${client.id}, ${site.id})" title="削除">削除</button>
                    </div>
                </div>
                `).join('')}
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
}

function qaSubmitNewClient() {
    const name = document.getElementById('qaNewClientName').value.trim();
    if (!name) return;
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
    document.getElementById('qaSiteModalName').value = site ? site.name : '';

    // チップレンダリング
    qaRenderSiteModalChips('qaSiteModalBranch', qaBranchList, qaSiteModalState.branch, 'branch');
    qaRenderSiteModalChips('qaSiteModalCategory', qaCategoryList, qaSiteModalState.category, 'category');
    qaRenderSiteModalChips('qaSiteModalShift', qaShiftList, qaSiteModalState.shift, 'shift');

    // タイムセレクト初期化
    qaInitModalTimeSelects();
    qaSetTimeValue('qaSiteModalStart', site?.presetStart || '');
    qaSetTimeValue('qaSiteModalEnd', site?.presetEnd || '');

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

function qaSaveSiteModal() {
    const nameInput = document.getElementById('qaSiteModalName').value.trim();
    const name = nameInput || '(個別業務)';

    const { clientId, siteId } = qaSiteModalState;
    const client = qaClients.find(c => c.id === clientId);
    if (!client) return;

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
        if (!confirm(`現場情報を保存します。よろしいですか？`)) return;
        const site = client.sites.find(s => s.id === siteId);
        if (site) Object.assign(site, siteData);
        qaShowToast('現場情報を更新しました');
    } else {
        // 新規追加
        const newSiteId = Math.floor(Math.random() * 10000) + 1000;
        client.sites.unshift({ id: newSiteId, lastOrderDate: '—', ...siteData });
        qaShowToast(`${name} を追加しました`);
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
            mapUrl: '',
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
                mapUrl: '',
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
    if (qaWeekMode) {
        prevBtn.textContent = '◀ 前週';
        nextBtn.textContent = '次週 ▶';
    } else {
        prevBtn.textContent = '◀ 前月';
        nextBtn.textContent = '次月 ▶';
    }
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
        qaShowToast('配置先が1つしかないため削除できません');
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
    qaRenderPlacementTabs();
    qaLoadPlacementData();
    qaShowToast('配置先を削除しました');
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
        mapUrl: document.getElementById('qaEditMapUrl').value,
        remarks: document.getElementById('qaEditRemarks').value
    };
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
    document.getElementById('qaEditMapUrl').value = data?.mapUrl || '';
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
}

// --- 業務詳細サブタスク ---
function qaRenderSubTasks(tasks) {
    const container = document.getElementById('qaSubTaskList');
    container.innerHTML = tasks.map((t, i) => `
        <div class="qa-sub-task-row" data-idx="${i}">
            <input type="text" class="qa-sub-label" placeholder="ラベル" value="${escHtml(t.label)}">
            <input type="text" class="qa-sub-value" placeholder="内容を入力…" value="${escHtml(t.value)}" oninput="qaUpdateDailyTaskName()">
            <button type="button" class="qa-sub-delete" onclick="qaRemoveSubTask(this)" title="削除">✕</button>
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
        <button type="button" class="qa-sub-delete" onclick="qaRemoveSubTask(this)" title="削除">✕</button>
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

// --- 地図プレビュー ---
function qaPreviewMap() {
    const url = document.getElementById('qaEditMapUrl').value.trim();
    if (!url) {
        qaShowToast('URLを入力してください');
        return;
    }
    window.open(url, '_blank');
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

// --- セル選択 ---
function qaSelectDay(day, initialSiteIdx) {
    // 切り替え前に現在のデータを保存
    if (qaSelectedDay) {
        qaSavePlacementData();
    }

    qaSelectedDay = day;
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

    // 既存の配置先タブを復元
    const dayKey = `${qaCalendarYear}-${String(qaCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let maxPlacement = 0;
    Object.keys(qaPlacementData).forEach(k => {
        if (k.startsWith(dayKey + '-')) {
            const idx = parseInt(k.split('-').pop());
            if (idx > maxPlacement) maxPlacement = idx;
        }
    });
    if (maxPlacement > 0) {
        for (let i = 1; i <= maxPlacement; i++) {
            qaAddPlacement();
        }
    }

    // 指定された配置先タブを選択
    const targetIdx = (typeof initialSiteIdx === 'number' && initialSiteIdx < qaPlacementCount) ? initialSiteIdx : 0;
    qaSelectPlacement(targetIdx);
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
    // 該当日の全配置先データを削除
    Object.keys(qaPlacementData).forEach(k => {
        if (k.startsWith(dayKey + '-')) delete qaPlacementData[k];
    });
    delete qaCalendarData[dayKey];
    qaCloseEditPanel();
    qaShowToast('削除しました');
}

function qaSaveEntry() {
    if (!qaSelectedDay) return;
    const count = parseInt(document.getElementById('qaEditCount').value);
    if (!count || count <= 0) {
        qaShowToast('人数を入力してください');
        return;
    }

    // 現在の配置先データを保存
    qaSavePlacementData();

    // カレンダー表示用 — 配置先ごとのエントリ配列を保存
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
    // アコーディオンを折りたたむ
    document.getElementById('qaCalEditPanel').classList.add('collapsed');
    qaExitWeekMode();
    qaRenderCalendar();
    document.getElementById('qaCalendarScreen').scrollTop = 0;
    qaShowToast('保存しました');
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
});
