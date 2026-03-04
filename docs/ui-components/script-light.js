/* ===========================
   Plaster UI Components
   Navigation & Interactions
   (Light Theme - Coastal Palette)
   =========================== */

(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    const links = sidebar.querySelectorAll('a');
    const sections = main.querySelectorAll('.comp-section');

    /* --- Smooth scroll on link click --- */
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* --- Active link on scroll (IntersectionObserver) --- */
    const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                links.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
                // Scroll sidebar to keep active link visible
                const activeLink = sidebar.querySelector('a.active');
                if (activeLink) {
                    activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    /* --- Platform header scroll tracking --- */
    const platformHeaders = main.querySelectorAll('.platform-header');
    const platformObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent.trim();
                const platform = text.includes('iOS') ? 'ios' : 'android';
                sidebar.querySelectorAll('.sidebar-section').forEach(sec => {
                    const h3 = sec.querySelector('h3');
                    if (h3) {
                        const secPlatform = h3.textContent.trim().toLowerCase();
                        sec.style.opacity = secPlatform === platform ? '1' : '0.5';
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    platformHeaders.forEach(h => platformObserver.observe(h));

    /* --- Toggle interactions --- */
    document.querySelectorAll('.md-checkbox, .md-radio, .md-switch, .ios-switch').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = toggle.querySelector('input');
            if (input && !input.disabled) {
                // Allow default checkbox/radio behavior
            }
        });
    });

    /* --- Segmented control click --- */
    document.querySelectorAll('.ios-segmented').forEach(seg => {
        seg.querySelectorAll('.seg-item').forEach(item => {
            item.addEventListener('click', () => {
                seg.querySelectorAll('.seg-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    });

    /* --- Tab click --- */
    document.querySelectorAll('.md-tabs').forEach(tabs => {
        tabs.querySelectorAll('.md-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.querySelectorAll('.md-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    });

    /* --- Bottom nav click --- */
    document.querySelectorAll('.bottom-nav').forEach(nav => {
        nav.querySelectorAll('.bnav-item').forEach(item => {
            item.addEventListener('click', () => {
                nav.querySelectorAll('.bnav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    });

    /* --- iOS Tab bar click --- */
    document.querySelectorAll('.ios-tabbar').forEach(bar => {
        bar.querySelectorAll('.ios-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                bar.querySelectorAll('.ios-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    });

    /* --- iOS Table View checkmark toggle --- */
    document.querySelectorAll('.ios-table.plain .ios-table-row').forEach(row => {
        if (row.closest('#ios-toggle')) {
            row.addEventListener('click', () => {
                const checkmark = row.querySelector('.ios-checkmark');
                if (checkmark) {
                    checkmark.remove();
                } else {
                    const span = document.createElement('span');
                    span.className = 'ios-checkmark';
                    span.textContent = '✓';
                    row.appendChild(span);
                }
            });
        }
    });

    /* --- Chip close --- */
    document.querySelectorAll('.chip-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chip = btn.closest('.md-chip, .chip-activated');
            if (chip) {
                chip.style.opacity = '0';
                chip.style.transform = 'scale(0.8)';
                chip.style.transition = 'all 0.2s';
                setTimeout(() => {
                    chip.style.display = 'none';
                }, 200);
            }
        });
    });

    /* --- Slider value visual update (fills left side) --- */
    function updateSliderFill(slider) {
        const val = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        const activeColor = '#44A6B5';
        const trackColor = '#D3D0C8';
        slider.style.background = `linear-gradient(to right, ${activeColor} ${val}%, ${trackColor} ${val}%)`;
    }

    document.querySelectorAll('.md-slider, .ios-slider').forEach(slider => {
        updateSliderFill(slider);
        slider.addEventListener('input', () => updateSliderFill(slider));
    });

})();
