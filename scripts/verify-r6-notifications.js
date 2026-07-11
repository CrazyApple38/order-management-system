'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let failures = 0;
let checks = 0;

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function check(label, condition) {
    checks += 1;
    if (condition) {
        console.log(`PASS ${label}`);
        return;
    }
    failures += 1;
    console.error(`FAIL ${label}`);
}

function hasCall(source, functionName, firstArg, secondArg) {
    const args = secondArg === undefined
        ? `'${firstArg}'`
        : `'${firstArg}'\\s*,\\s*'${secondArg}'`;
    return new RegExp(`\\b${functionName}\\(\\s*${args}`).test(source);
}

const sources = {
    ob: read('docs/mockup/order-book.js'),
    sl: read('docs/mockup/screen-layout.js'),
    ws: read('docs/mockup/weekly-schedule.js'),
    la: read('docs/mockup/leave-application.js'),
    qa: read('docs/mockup/quick-access.js'),
    navbar: read('docs/mockup/co-navbar.js'),
    panel: read('docs/mockup/co-notify-panel.js'),
    center: read('docs/preview/change-notification-center-mockup.html'),
    database: read('docs/03_データベース設計.md')
};
const panelCode = sources.panel.replace(/^\s*\/\/.*$/gm, '');

const literalMatrix = [
    ['OB row add', 'ob', 'obCnSelfNotify', 'row', 'add'],
    ['OB row modify', 'ob', 'obCnSelfNotify', 'row', 'modify'],
    ['OB site add', 'ob', 'obCnSelfNotify', 'site', 'add'],
    ['OB site delete', 'ob', 'obCnSelfNotify', 'site', 'delete'],
    ['OB badge add', 'ob', 'obCnSelfNotify', 'badge', 'add'],
    ['OB badge delete', 'ob', 'obCnSelfNotify', 'badge', 'delete'],
    ['SL row modify', 'sl', 'slCnSelfNotify', 'row', 'modify'],
    ['SL site add', 'sl', 'slCnSelfNotify', 'site', 'add'],
    ['SL site modify', 'sl', 'slCnSelfNotify', 'site', 'modify'],
    ['SL site delete', 'sl', 'slCnSelfNotify', 'site', 'delete'],
    ['SL employee place', 'sl', 'slCnSelfNotify', 'employee', 'place'],
    ['SL employee remove', 'sl', 'slCnSelfNotify', 'employee', 'remove'],
    ['SL vehicle place', 'sl', 'slCnSelfNotify', 'vehicle', 'place'],
    ['SL vehicle remove', 'sl', 'slCnSelfNotify', 'vehicle', 'remove'],
    ['SL support place', 'sl', 'slCnSelfNotify', 'support', 'place'],
    ['SL support remove', 'sl', 'slCnSelfNotify', 'support', 'remove'],
    ['SL reservation add', 'sl', 'slCnSelfNotify', 'reservation', 'add'],
    ['WS schedule add', 'ws', 'wsCnSelfNotify', 'schedule', 'add'],
    ['WS schedule modify', 'ws', 'wsCnSelfNotify', 'schedule', 'modify'],
    ['WS schedule delete', 'ws', 'wsCnSelfNotify', 'schedule', 'delete'],
    ['WS reservation add', 'ws', 'wsCnSelfNotify', 'reservation', 'add'],
    ['WS reservation modify', 'ws', 'wsCnSelfNotify', 'reservation', 'modify'],
    ['WS reservation delete', 'ws', 'wsCnSelfNotify', 'reservation', 'delete'],
    ['LA add', 'la', 'laCnSelfNotify', 'add'],
    ['LA modify', 'la', 'laCnSelfNotify', 'modify'],
    ['LA delete', 'la', 'laCnSelfNotify', 'delete'],
    ['LA approve', 'la', 'laCnSelfNotify', 'approve'],
    ['LA reject', 'la', 'laCnSelfNotify', 'reject'],
    ['QA add', 'qa', 'qaCnSelfNotify', 'add'],
    ['QA modify', 'qa', 'qaCnSelfNotify', 'modify'],
    ['QA delete', 'qa', 'qaCnSelfNotify', 'delete']
];

for (const [label, sourceKey, functionName, firstArg, secondArg] of literalMatrix) {
    check(label, hasCall(sources[sourceKey], functionName, firstArg, secondArg));
}

check('OB row delete is represented by the common seed',
    /scope:\s*'row',\s*op:\s*'delete'/.test(sources.navbar));
check('SL reservation modify/delete dynamic branch remains wired',
    /slCnSelfNotify\('reservation',\s*count === 0[\s\S]{0,160}'delete'[\s\S]{0,160}'modify'/.test(sources.sl));

check('Category derivation uses domain', /function deriveCategory[\s\S]{0,400}CN_DOMAIN_CATEGORY\[domain\]/.test(sources.panel));
check('All four assignment subtags are defined',
    ['own', 'support', 'partner', 'vehicle'].every((tag) => new RegExp(`${tag}:\\s*'`).test(sources.panel)));
check('Target date supports single dates and ranges',
    /typeof item\.targetDate === 'string'/.test(sources.panel) && /item\.targetDate\.end/.test(sources.panel));
check('Cross-screen jumps stay in the same tab',
    /window\.location\.href = url/.test(panelCode) && !/window\.open\s*\(/.test(panelCode));
check('cnJump is removed after arrival',
    /searchParams\.delete\('cnJump'\)/.test(sources.panel) && /history\.replaceState/.test(sources.panel));
check('Notification card links to the center',
    /CN_CENTER_URL = 'preview\/change-notification-center-mockup\.html'/.test(sources.panel));

const standardPages = ['order-book', 'screen-layout', 'weekly-schedule', 'leave-application'];
for (const page of standardPages) {
    const html = read(`docs/${page}.html`);
    const pageScript = sources[page === 'order-book' ? 'ob' : page === 'screen-layout' ? 'sl' : page === 'weekly-schedule' ? 'ws' : 'la'];
    check(`${page} loads the notification panel`, html.includes('mockup/co-notify-panel.js'));
    check(`${page} loads the mock store before the navbar`,
        html.indexOf('mockup/co-mock-store.js') < html.indexOf('mockup/co-navbar.js'));
    check(`${page} receives cn:jump`, pageScript.includes("cn:jump"));
}

const quickAccessHtml = read('docs/quick-access.html');
check('quick-access loads the notification panel', quickAccessHtml.includes('mockup/co-notify-panel.js'));
check('quick-access receives cn:jump', sources.qa.includes("cn:jump"));

const centerTargets = [...sources.center.matchAll(/targetPage:\s*"([^"]+)"/g)].map((match) => match[1]);
check('Center fixtures all have target dates',
    (sources.center.match(/targetDate:\s*"/g) || []).length === 11);
check('Center fixtures cover all assignment subtags',
    ['own', 'support', 'partner', 'vehicle'].every((tag) => sources.center.includes(`subTag: "${tag}"`)));
check('Center fixtures all have actual-screen destinations', centerTargets.length === 11);
check('Center destinations cover OB, SL, WS, and LA',
    ['order-book', 'screen-layout', 'weekly-schedule', 'leave-application'].every((page) => centerTargets.includes(page)));
check('Center actual-screen button is wired for same-tab navigation',
    /data-target-page=/.test(sources.center) && /window\.location\.href = url/.test(sources.center));

check('Database allows notifications without a specific target date',
    /target_date DATE,/.test(sources.database) && !/target_date DATE NOT NULL/.test(sources.database));
check('Database prevents an end date without a start date',
    /target_date_end IS NULL OR \(target_date IS NOT NULL AND target_date_end >= target_date\)/.test(sources.database));

if (failures > 0) {
    console.error(`\nR-6 static verification failed: ${failures} check(s)`);
    process.exit(1);
}

console.log(`\nR-6 static verification passed: ${checks} checks`);
