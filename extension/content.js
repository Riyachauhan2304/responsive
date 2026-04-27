console.log("MindGuard Active 🚀");

function isYouTube(domain) {
    return domain.includes("youtube.com");
}

let isRedirecting = false;

function applyBlocking(res) {

    const blockingEnabled = res.blocking === true;
    if (!blockingEnabled) return;

    const currentDomain = window.location.hostname;

    if (window.location.protocol === "chrome-extension:") return;

    const settings = res.settings || {};
    const focusStart = settings.focusStart || null;
    const focusEnd   = settings.focusEnd   || null;

    function isWithinFocusHours() {
        if (!focusStart || !focusEnd) return true; // 👈 IMPORTANT FIX
        const now = new Date();
        const [sh, sm] = focusStart.split(":").map(Number);
        const [eh, em] = focusEnd.split(":").map(Number);
        const nowMins   = now.getHours() * 60 + now.getMinutes();
        const startMins = sh * 60 + sm;
        const endMins   = eh * 60 + em;
        return nowMins >= startMins && nowMins < endMins;
    }

    // 🔥 TIME CHECK (SAFE)
    if (!isWithinFocusHours()) {
        console.log("Outside focus time → skip block");
        return;
    }

    // 🔥 YOUTUBE LOGIC
    if (isYouTube(currentDomain)) {

        if (isRedirecting) return;

        chrome.storage.local.get(["ytUnlocked"], (data) => {

            if (data.ytUnlocked === true) {
                console.log("YouTube unlocked ✅");
                return;
            }

            isRedirecting = true;

            const extUrl = chrome.runtime.getURL("quiz.html");
            const targetUrl = encodeURIComponent(window.location.href);

            window.location.replace(`${extUrl}?url=${targetUrl}&domain=${currentDomain}`);
        });

        return;
    }

    // 🔥 OTHER SITES BLOCK
    const rules = res.rules || [];

    const shouldBlock = rules.some(rule => {
        if (rule.action !== "block") return false;
        return currentDomain === rule.domain || currentDomain.endsWith("." + rule.domain);
    });

    if (!shouldBlock) return;

    showBlockedScreen(currentDomain);
}

// 🚫 BLOCK UI
function showBlockedScreen(domain) {
    if (document.getElementById('mg-blocked-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mg-blocked-overlay';

    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #111;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
    `;

    overlay.innerHTML = `<h1>🚫 ${domain} is blocked</h1>`;
    document.body.appendChild(overlay);
}

// 🔥 INIT
chrome.storage.local.get(["blocking", "rules", "settings"], applyBlocking);

// 🔥 PAGE LOAD FIX
window.addEventListener("load", () => {
    chrome.storage.local.get(["blocking", "rules", "settings"], applyBlocking);
});

// 🔥 SPA FIX
let lastUrl = location.href;

const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        isRedirecting = false;
        chrome.storage.local.get(["blocking", "rules", "settings"], applyBlocking);
    }
});

observer.observe(document, { childList: true, subtree: true });

// 🔥 STORAGE CHANGE FIX
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        console.log("Storage changed → re-check");
        chrome.storage.local.get(["blocking", "rules", "settings"], applyBlocking);
    }
});