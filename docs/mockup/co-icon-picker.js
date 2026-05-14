/* ============================================================
   co-icon-picker.js — 汎用アイコンピッカー（モーダル）
   - docs/assets/icons/ 配下のアイコンライブラリから検索選択
   - SVG / PNG 両対応
   - カテゴリ・キーワード・フォーマット で絞り込み
   - 初回 index.json ロード時は進捗表示
   - 結果は段階表示（100件ずつ「もっと読み込む」）

   公開API:
     IconPicker.open({
       onPick:     function(file) {...}      // 必須
       accept:     ['svg','png']             // 任意（デフォルト['svg','png']）
       initialCat: 'sign-mark'               // 任意
       initialQ:   'check'                   // 任意
       basePath:   '../assets/icons/'        // 任意（デフォルト推測）
       indexUrl:   '../assets/icons/index.json'  // 任意
       title:      'アイコンを選択'           // 任意
     });
     IconPicker.close();
   ============================================================ */
(function () {
    'use strict';

    var DEFAULTS = {
        accept: ['svg', 'png'],
        basePath: '../assets/icons/',
        indexUrl: '../assets/icons/index.json',
        indexJsUrl: '../assets/icons/index.js',   // file:// フォールバック用 JSラッパー
        title: 'アイコンを選択',
        pageSize: 100
    };

    // 27カテゴリ（ライブラリ実態と一致）
    var CATEGORIES = [
        'animal-plant', 'art-music', 'bug', 'building', 'business', 'education',
        'electrical', 'event', 'fashion', 'fish', 'food', 'fukidashi', 'game',
        'health', 'life', 'machinery', 'money', 'nenga', 'other', 'outdoor',
        'pc-tech', 'person', 'plant', 'sign-mark', 'sports-game', 'stationery', 'transport'
    ];

    // ---------- 状態 ----------
    var indexCache = null;          // 全アイコン配列（一度ロードしたら再利用）
    var indexLoading = null;        // ロード中Promise
    var modal = null;               // モーダルDOM（使い回し）
    var currentOpts = null;         // open()時のオプションスナップショット
    var currentResults = [];        // 検索結果（全件）
    var currentRendered = 0;        // 現在描画済み件数

    // ---------- ユーティリティ ----------
    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'class') node.className = attrs[k];
                else if (k === 'html') node.innerHTML = attrs[k];
                else if (k.indexOf('on') === 0) node.addEventListener(k.slice(2), attrs[k]);
                else if (k === 'dataset') {
                    Object.keys(attrs[k]).forEach(function (dk) { node.dataset[dk] = attrs[k][dk]; });
                } else node.setAttribute(k, attrs[k]);
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (c) {
                if (c == null) return;
                node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return node;
    }

    function debounce(fn, ms) {
        var t = null;
        return function () {
            var args = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, args); }, ms);
        };
    }

    // ---------- インデックスロード ----------
    // file:// プロトコルでも動くよう、fetch失敗時に <script> タグ注入にフォールバック
    function loadIndex(indexUrl, indexJsUrl, onProgress) {
        if (indexCache) return Promise.resolve(indexCache);
        if (indexLoading) return indexLoading;

        var isFileProtocol = (location.protocol === 'file:');

        indexLoading = new Promise(function (resolve, reject) {
            // 既に <script> 経由でロード済みなら即解決
            if (window.__ICON_INDEX && window.__ICON_INDEX.icons) {
                indexCache = window.__ICON_INDEX.icons;
                if (onProgress) onProgress('done');
                resolve(indexCache);
                return;
            }

            // file:// では fetch をスキップして直接 <script> 注入
            if (isFileProtocol) {
                if (onProgress) onProgress('script');
                loadViaScript(indexJsUrl).then(function (data) {
                    indexCache = (data && data.icons) ? data.icons : [];
                    if (onProgress) onProgress('done');
                    resolve(indexCache);
                }).catch(function (err) {
                    indexLoading = null;
                    reject(err);
                });
                return;
            }

            // http:// では fetch を試行 → 失敗時 <script> フォールバック
            if (onProgress) onProgress('fetch');
            fetch(indexUrl)
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    if (onProgress) onProgress('parse');
                    return r.json();
                })
                .then(function (json) {
                    indexCache = (json && json.icons) ? json.icons : [];
                    if (onProgress) onProgress('done');
                    resolve(indexCache);
                })
                .catch(function (err) {
                    // fetch 失敗 → <script> 注入フォールバック
                    if (onProgress) onProgress('script');
                    loadViaScript(indexJsUrl).then(function (data) {
                        indexCache = (data && data.icons) ? data.icons : [];
                        if (onProgress) onProgress('done');
                        resolve(indexCache);
                    }).catch(function (err2) {
                        indexLoading = null;
                        reject(new Error('fetch失敗: ' + err.message + ' / script注入失敗: ' + err2.message));
                    });
                });
        });
        return indexLoading;
    }

    // <script> タグ動的注入で index.js (window.__ICON_INDEX = {...}) をロード
    function loadViaScript(url) {
        return new Promise(function (resolve, reject) {
            // 既存スクリプトがあれば削除
            var existing = document.getElementById('coIconIndexScript');
            if (existing) existing.parentNode.removeChild(existing);

            var s = document.createElement('script');
            s.id = 'coIconIndexScript';
            s.src = url;
            s.onload = function () {
                if (window.__ICON_INDEX) resolve(window.__ICON_INDEX);
                else reject(new Error('window.__ICON_INDEX が定義されていません (' + url + ')'));
            };
            s.onerror = function () {
                reject(new Error('スクリプト読み込み失敗: ' + url));
            };
            document.head.appendChild(s);
        });
    }

    // ---------- 検索ロジック ----------
    function search(opts) {
        if (!indexCache) return [];
        var accept = opts.accept || DEFAULTS.accept;
        var cat = opts.cat || '';
        var q = (opts.q || '').toLowerCase().trim();

        var results = indexCache;
        if (accept.length && accept.length < 2) {
            results = results.filter(function (it) { return accept.indexOf(it.fmt) !== -1; });
        }
        if (cat) results = results.filter(function (it) { return it.cat === cat; });
        if (q) {
            results = results.filter(function (it) {
                return (it.title || '').toLowerCase().indexOf(q) !== -1
                    || (it.id || '').toLowerCase().indexOf(q) !== -1
                    || (it.file || '').toLowerCase().indexOf(q) !== -1;
            });
        }
        return results;
    }

    // ---------- モーダル構築 ----------
    function buildModal() {
        var m = el('div', { class: 'ip-modal', id: 'coIconPickerModal' });

        var overlay = el('div', { class: 'ip-overlay', onclick: close });

        var dialog = el('div', { class: 'ip-dialog' });

        var head = el('header', { class: 'ip-head' }, [
            el('h3', { class: 'ip-title', id: 'ipTitle' }, 'アイコンを選択'),
            el('span', { class: 'ip-status', id: 'ipStatus' }, ''),
            el('button', { class: 'ip-close', type: 'button', onclick: close, 'aria-label': '閉じる' }, '✕')
        ]);

        var filters = el('div', { class: 'ip-filters' }, [
            el('select', { class: 'ip-cat', id: 'ipCat', onchange: onFilterChange },
                [el('option', { value: '' }, '— 全カテゴリ —')]
                    .concat(CATEGORIES.map(function (c) { return el('option', { value: c }, c); }))
            ),
            el('select', { class: 'ip-fmt', id: 'ipFmt', onchange: onFilterChange }, [
                el('option', { value: 'both' }, 'SVG+PNG'),
                el('option', { value: 'svg' }, 'SVGのみ'),
                el('option', { value: 'png' }, 'PNGのみ')
            ]),
            el('input', {
                class: 'ip-q', id: 'ipQ', type: 'text',
                placeholder: 'タイトル / ID / パスで検索',
                oninput: debounce(onFilterChange, 200)
            }),
            el('span', { class: 'ip-count', id: 'ipCount' }, '')
        ]);

        var body = el('div', { class: 'ip-body' }, [
            el('div', { class: 'ip-loading', id: 'ipLoading' }, [
                el('div', { class: 'ip-spinner' }),
                el('div', { class: 'ip-loading-text', id: 'ipLoadingText' }, 'インデックスを読み込み中…')
            ]),
            el('div', { class: 'ip-grid', id: 'ipGrid' }),
            el('div', { class: 'ip-more', id: 'ipMore' }, [
                el('button', { class: 'ip-more-btn', type: 'button', onclick: loadMore }, 'さらに 100件 を表示')
            ])
        ]);

        var foot = el('footer', { class: 'ip-foot' }, [
            el('span', { class: 'ip-hint' }, 'クリックで選択 / ESC で閉じる')
        ]);

        dialog.appendChild(head);
        dialog.appendChild(filters);
        dialog.appendChild(body);
        dialog.appendChild(foot);

        m.appendChild(overlay);
        m.appendChild(dialog);
        document.body.appendChild(m);

        // ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && m.classList.contains('is-open')) close();
        });

        return m;
    }

    // ---------- フィルタ変更 ----------
    function onFilterChange() {
        var cat = document.getElementById('ipCat').value;
        var fmtSel = document.getElementById('ipFmt').value;
        var q = document.getElementById('ipQ').value;

        var accept = ['svg', 'png'];
        if (fmtSel === 'svg') accept = ['svg'];
        else if (fmtSel === 'png') accept = ['png'];

        // opts.accept が制限されている場合はそれを優先
        if (currentOpts && currentOpts.accept && currentOpts.accept.length < 2) {
            accept = currentOpts.accept;
        }

        currentResults = search({ cat: cat, q: q, accept: accept });
        currentRendered = 0;
        renderResults(true);
    }

    // ---------- 結果描画 ----------
    function renderResults(reset) {
        var grid = document.getElementById('ipGrid');
        var more = document.getElementById('ipMore');
        var count = document.getElementById('ipCount');
        if (!grid) return;

        if (reset) grid.innerHTML = '';

        var page = (currentOpts && currentOpts.pageSize) || DEFAULTS.pageSize;
        var nextEnd = Math.min(currentRendered + page, currentResults.length);
        var basePath = (currentOpts && currentOpts.basePath) || DEFAULTS.basePath;

        var frag = document.createDocumentFragment();
        for (var i = currentRendered; i < nextEnd; i++) {
            var it = currentResults[i];
            (function (item) {
                var card = el('button', {
                    class: 'ip-card', type: 'button',
                    title: item.title + '\n' + item.file,
                    dataset: { file: item.file, fmt: item.fmt },
                    onclick: function () { onPick(item); }
                }, [
                    el('div', { class: 'ip-card-thumb ip-fmt-' + item.fmt }, [
                        el('img', { src: basePath + item.file, class: 'ip-card-img', alt: '', loading: 'lazy' })
                    ]),
                    el('div', { class: 'ip-card-label' }, item.title || item.id),
                    el('div', { class: 'ip-card-meta' }, [
                        el('span', { class: 'ip-card-fmt-tag' }, item.fmt.toUpperCase()),
                        ' ',
                        el('span', { class: 'ip-card-cat-tag' }, item.cat)
                    ])
                ]);
                frag.appendChild(card);
            })(it);
        }
        grid.appendChild(frag);
        currentRendered = nextEnd;

        // 件数表示
        if (count) {
            count.textContent = currentResults.length + ' 件 ／ 表示 ' + currentRendered + ' 件';
        }
        // 「もっと読み込む」表示制御
        if (more) {
            if (currentRendered < currentResults.length) {
                more.classList.remove('is-hidden');
                var btn = more.querySelector('.ip-more-btn');
                var remain = currentResults.length - currentRendered;
                btn.textContent = 'さらに ' + Math.min(page, remain) + '件 を表示（残 ' + remain + '件）';
            } else {
                more.classList.add('is-hidden');
            }
        }
    }

    function loadMore() { renderResults(false); }

    // ---------- 選択 ----------
    function onPick(item) {
        if (currentOpts && typeof currentOpts.onPick === 'function') {
            currentOpts.onPick(item.file, item);
        }
        close();
    }

    // ---------- 開閉 ----------
    function open(opts) {
        currentOpts = Object.assign({}, DEFAULTS, opts || {});
        if (!modal) modal = buildModal();
        modal.classList.add('is-open');

        // タイトル
        var title = modal.querySelector('#ipTitle');
        if (title) title.textContent = currentOpts.title || DEFAULTS.title;

        // 初期値
        var catSel = modal.querySelector('#ipCat');
        var fmtSel = modal.querySelector('#ipFmt');
        var qInput = modal.querySelector('#ipQ');
        if (catSel) catSel.value = currentOpts.initialCat || '';
        if (qInput) qInput.value = currentOpts.initialQ || '';
        if (fmtSel) {
            if (currentOpts.accept.length === 1 && currentOpts.accept[0] === 'svg') fmtSel.value = 'svg';
            else if (currentOpts.accept.length === 1 && currentOpts.accept[0] === 'png') fmtSel.value = 'png';
            else fmtSel.value = 'both';
            fmtSel.disabled = (currentOpts.accept.length === 1);
        }

        var loading = modal.querySelector('#ipLoading');
        var grid = modal.querySelector('#ipGrid');
        var more = modal.querySelector('#ipMore');
        var loadingText = modal.querySelector('#ipLoadingText');

        // ロード表示開始
        loading.classList.remove('is-hidden');
        grid.innerHTML = '';
        more.classList.add('is-hidden');

        loadIndex(currentOpts.indexUrl, currentOpts.indexJsUrl, function (phase) {
            if (loadingText) {
                loadingText.textContent = phase === 'fetch' ? 'インデックスをダウンロード中…'
                    : phase === 'parse' ? 'インデックスを解析中…'
                    : phase === 'script' ? 'インデックスを読み込み中…(file://モード)'
                    : '完了';
            }
        }).then(function () {
            loading.classList.add('is-hidden');
            onFilterChange(); // 初期検索を実行
            if (qInput) qInput.focus();
        }).catch(function (err) {
            loading.innerHTML = '';
            loading.appendChild(el('div', { class: 'ip-error' }, 'インデックスの読み込みに失敗しました: ' + err.message));
        });
    }

    function close() {
        if (modal) modal.classList.remove('is-open');
        currentOpts = null;
    }

    // ---------- 公開 ----------
    window.IconPicker = {
        open: open,
        close: close,
        // テスト用: キャッシュをクリア
        _clearCache: function () { indexCache = null; indexLoading = null; }
    };
})();
