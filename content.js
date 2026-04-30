let listsData = [];
let observerInstance = null;

// Snov.io использует разные селекторы на разных страницах:
// - .etr__email-text                       — All Domain Emails (.et__table)
// - .row__cell--email .pe__text-ellipsis   — Prospects (.pt__table)
// - .long-email-width                      — старый/легаси интерфейс
const EMAIL_SELECTORS = [
    '.etr__email-text',
    '.row__cell--email .pe__text-ellipsis',
    '.long-email-width'
];

const EMAIL_SELECTOR = EMAIL_SELECTORS.join(', ');
const EMAIL_SELECTOR_UNPROCESSED = EMAIL_SELECTORS
    .map(s => `${s}:not([data-colored="true"])`)
    .join(', ');

/**
 * Loads config from storage and rebuilds listsData Sets.
 * @param {object} config
 */
function buildListsData(config) {
    listsData = [];
    if (!config) return;
    ['list1', 'list2', 'list3', 'list4'].forEach(key => {
        const entry = config[key];
        if (entry?.emails?.length) {
            listsData.push({ emails: new Set(entry.emails), color: entry.color });
        }
    });
}

/**
 * Applies highlight styles to a single email element.
 * @param {Element} el
 */
function processElement(el) {
    if (el.dataset.colored === 'true') return;
    el.dataset.colored = 'true'; // mark early to prevent double-processing

    const emailText = el.textContent.trim().toLowerCase();
    if (!emailText.includes('@')) return;

    for (let i = 0; i < listsData.length; i++) {
        if (listsData[i].emails.has(emailText)) {
            el.style.cssText += `
                background-color:${listsData[i].color};
                color:#000000;
                font-weight:bold;
                padding:2px 5px;
                border-radius:4px;
            `.replace(/\s+/g, ' ').trim();
            return;
        }
    }
}

/**
 * Scans the document for unprocessed email elements.
 */
function highlightAll() {
    document.querySelectorAll(EMAIL_SELECTOR_UNPROCESSED)
        .forEach(processElement);
}

/**
 * Processes a MutationObserver batch.
 * Always re-scans the full document because Snov.io is an SPA:
 * navigating between Prospects / All Domain Emails replaces large
 * subtrees, and per-node matching can miss deeply nested emails.
 * The :not([data-colored]) filter keeps this cheap on repeated calls.
 */
function processMutations() {
    highlightAll();
}

/**
 * Starts (or restarts) the MutationObserver.
 * Observes document.body so SPA route changes don't break tracking.
 */
function initObserver() {
    if (observerInstance) {
        observerInstance.disconnect();
    }

    observerInstance = new MutationObserver(processMutations);

    observerInstance.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
    chrome.storage.local.get(['config'], result => {
        buildListsData(result.config);
        highlightAll();
        initObserver();
    });
}

if (document.body) {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
}

// Safety net: re-scan every 2s in case mutations were missed
// (e.g., heavy virtualized lists). Cheap due to :not([data-colored]) filter.
setInterval(highlightAll, 2000);

// ── Live reload when background updates the databases ─────────────────────────

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'reloadLists') {
        chrome.storage.local.get(['config'], result => {
            buildListsData(result.config);

            // Reset already-marked elements so they get re-evaluated
            document.querySelectorAll(EMAIL_SELECTOR).forEach(el => {
                if (el.dataset.colored !== 'true') return;
                el.dataset.colored = '';
                el.style.backgroundColor = '';
                el.style.color = '';
                el.style.fontWeight = '';
                el.style.padding = '';
                el.style.borderRadius = '';
            });

            highlightAll();
        });
    }
});