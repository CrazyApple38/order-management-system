/* ============================================================
   会社名入力フォーム: 略称→正式名称 自動変換 共通ユーティリティ

   対象フィールド: 属性 data-co-company-input を持つ <input type="text">

   - 略称（(株)、（株）、㈱ など）を検知して即時に正式名称へ変換
   - IME 変換中は処理しない（compositionstart/end で抑制）
   - キャレット位置を保持して入力作業を継続できるよう調整
   - 変換時にフォーム右上に吹き出しポップアップを表示（2.5秒で自動消滅）
   - 変換後 'input' イベントを再ディスパッチし、後続のサジェスト等を更新
   ============================================================ */
(function () {
    'use strict';

    // [regex, 正式名称, 表示用略称]
    // 順序: 長いパターン優先（特非 > 一社/一財 > 株/有 など）
    var PATTERNS = [
        // 環境依存の単一合字（U+3231 など）
        [/㈱/g, '株式会社', '㈱'],
        [/㈲/g, '有限会社', '㈲'],
        [/㈳/g, '一般社団法人', '㈳'],
        [/㈶/g, '一般財団法人', '㈶'],
        [/㈴/g, '合名会社', '㈴'],
        [/㈾/g, '合資会社', '㈾'],
        // NPO 法人 (半角/全角・大小文字)
        [/[NＮnｎ][PＰpｐ][OＯoｏ][\s　]*法人/g, '特定非営利活動法人', 'NPO法人'],
        // 括弧囲み（半角/全角/混在を網羅）
        [/[(（]特非[)）]/g, '特定非営利活動法人', '(特非)'],
        [/[(（]一社[)）]/g, '一般社団法人', '(一社)'],
        [/[(（]一財[)）]/g, '一般財団法人', '(一財)'],
        [/[(（]公社[)）]/g, '公益社団法人', '(公社)'],
        [/[(（]公財[)）]/g, '公益財団法人', '(公財)'],
        [/[(（]株[)）]/g, '株式会社', '(株)'],
        [/[(（]有[)）]/g, '有限会社', '(有)'],
        [/[(（]合[)）]/g, '合同会社', '(合)'],
        [/[(（]資[)）]/g, '合資会社', '(資)'],
        [/[(（]名[)）]/g, '合名会社', '(名)']
    ];

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    // 文字列 s 内の略称を検出して正式名称に置換。{ value, hits } を返す。
    function normalize(s) {
        if (!s) return { value: s, hits: [] };
        var hits = [];
        var result = s;
        for (var i = 0; i < PATTERNS.length; i++) {
            var rule = PATTERNS[i];
            rule[0].lastIndex = 0;
            if (rule[0].test(result)) {
                hits.push({ from: rule[2], to: rule[1] });
                rule[0].lastIndex = 0;
                result = result.replace(rule[0], rule[1]);
            }
        }
        return { value: result, hits: hits };
    }

    function showPopup(input, hits) {
        // 既存のポップアップを破棄
        if (input._coCompanyPopup) {
            clearTimeout(input._coCompanyPopup._timer);
            input._coCompanyPopup.remove();
            input._coCompanyPopup = null;
        }

        var popup = document.createElement('div');
        popup.className = 'co-company-popup';
        var inner = '<div class="co-company-popup-title">略称を正式名称に変換しました</div>';
        // 重複除去
        var seen = {};
        hits.forEach(function (h) {
            var key = h.from + '' + h.to;
            if (seen[key]) return;
            seen[key] = true;
            inner += '<div class="co-company-popup-item">'
                  + escapeHtml(h.from)
                  + '<span class="co-company-popup-arrow">→</span>'
                  + '<span class="co-company-popup-formal">' + escapeHtml(h.to) + '</span>'
                  + '</div>';
        });
        popup.innerHTML = inner;
        document.body.appendChild(popup);

        // 位置決定: フォーム右上を基準に、上端より上に配置
        var rect = input.getBoundingClientRect();
        var pw = popup.offsetWidth;
        var ph = popup.offsetHeight;
        var top = rect.top - ph - 10;
        var left = rect.right - pw;
        // 画面外に出ないようクランプ
        if (top < 8) top = rect.bottom + 10;
        if (left < 8) left = 8;
        if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
        popup.style.top = top + 'px';
        popup.style.left = left + 'px';

        requestAnimationFrame(function () {
            popup.classList.add('co-company-popup-show');
        });

        input._coCompanyPopup = popup;
        popup._timer = setTimeout(function () {
            popup.classList.remove('co-company-popup-show');
            setTimeout(function () {
                if (popup.parentNode) popup.remove();
                if (input._coCompanyPopup === popup) input._coCompanyPopup = null;
            }, 250);
        }, 2500);
    }

    function process(input) {
        if (input._coCompanyComposing) return;
        if (input._coCompanyInternal) return;

        var value = input.value;
        // 高速判定: いずれのパターンも含まないなら早期return
        var hasAny = false;
        for (var i = 0; i < PATTERNS.length; i++) {
            PATTERNS[i][0].lastIndex = 0;
            if (PATTERNS[i][0].test(value)) { hasAny = true; break; }
        }
        if (!hasAny) return;

        // キャレット位置（数値が取れない場合は末尾とみなす）
        var caret = (typeof input.selectionStart === 'number') ? input.selectionStart : value.length;

        // 前半・後半を別々に正規化することでキャレット位置を保持
        var before = value.substring(0, caret);
        var after = value.substring(caret);
        var nb = normalize(before);
        var na = normalize(after);

        if (nb.hits.length === 0 && na.hits.length === 0) return;

        var newValue = nb.value + na.value;
        var newCaret = nb.value.length;

        input._coCompanyInternal = true;
        try {
            input.value = newValue;
            try { input.setSelectionRange(newCaret, newCaret); } catch (e) { /* noop */ }
            // 後続の oninput リスナ（サジェスト等）に新しい値を伝達
            var ev;
            try {
                ev = new Event('input', { bubbles: true });
            } catch (e) {
                ev = document.createEvent('Event');
                ev.initEvent('input', true, true);
            }
            input.dispatchEvent(ev);
        } finally {
            input._coCompanyInternal = false;
        }

        showPopup(input, nb.hits.concat(na.hits));
    }

    function attach(input) {
        if (!input || input._coCompanyBound) return;
        input._coCompanyBound = true;

        input.addEventListener('compositionstart', function () {
            input._coCompanyComposing = true;
        });
        input.addEventListener('compositionend', function () {
            input._coCompanyComposing = false;
            process(input);
        });
        input.addEventListener('input', function () {
            process(input);
        });
        // フォーカスを失う時にもう一度チェック（貼り付け等の保険）
        input.addEventListener('blur', function () {
            process(input);
        });
    }

    function autoBind(root) {
        var scope = root || document;
        var nodes = scope.querySelectorAll('[data-co-company-input]');
        for (var i = 0; i < nodes.length; i++) attach(nodes[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { autoBind(); });
    } else {
        autoBind();
    }

    window.CoCompanyInput = {
        attach: attach,
        autoBind: autoBind,
        normalize: normalize
    };
})();
