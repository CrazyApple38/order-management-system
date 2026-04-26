/* notify-compare.js — Before/After モード切替 */
(function () {
    'use strict';

    document.querySelectorAll('.cmp-mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.dataset.mode;
            document.querySelectorAll('.cmp-mode-btn').forEach(function (b) {
                b.classList.toggle('is-active', b === btn);
            });
            document.getElementById('cmpBefore').classList.toggle('cmp-hidden', mode !== 'before');
            document.getElementById('cmpAfter').classList.toggle('cmp-hidden', mode !== 'after');
        });
    });
})();
