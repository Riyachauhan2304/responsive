document.addEventListener("DOMContentLoaded", () => {
    const statusEl = document.getElementById("status");
    const btn = document.getElementById("toggleBtn");
    const syncBtn = document.getElementById("syncBtn");

    // 🔥 SYNC FROM JSONBIN
    async function syncData() {
        try {
            // Show loading state on button
            const originalText = syncBtn.innerText;
            syncBtn.innerText = "Syncing...";
            syncBtn.disabled = true;

            const res = await fetch("https://api.jsonbin.io/v3/b/69cfddf0856a682189f80ea9/latest", {
                headers: {
                    "X-Master-Key": "$2a$10$gqdaj19DJxBqXw.9bFdHAOIUirymKNuOQVxjqju1zvjhHN8hgRZTG"
                }
            });

            const data = await res.json();
            const rules = data.record?.rules || [];
            const settings = data.record?.settings || {};

            chrome.storage.local.set({
                rules: rules,
                settings: settings
            }, () => {
                syncBtn.innerText = "Synced! ✅";
                setTimeout(() => {
                    syncBtn.innerText = originalText;
                    syncBtn.disabled = false;
                }, 2000);
            });
        } catch (e) {
            console.log("Sync error:", e);
            syncBtn.innerText = "Error ❌";
            setTimeout(() => {
                syncBtn.innerText = "Sync Rules";
                syncBtn.disabled = false;
            }, 2000);
        }
    }

    // GET
    function getBlocking(cb) {
        chrome.storage.local.get(["blocking"], (res) => {
            cb(res.blocking === true);
        });
    }

    // SET
    function setBlocking(val, cb) {
        chrome.storage.local.set({ blocking: val }, cb);
    }

    // UI
    function updateUI() {
        getBlocking((state) => {
            statusEl.innerText = state ? "🟢 Blocking ON" : "🔴 Blocking OFF";
            btn.innerText = state ? "Turn OFF" : "Turn ON";
        });
    }

    // TOGGLE
    btn.addEventListener("click", () => {
        getBlocking((state) => {
            setBlocking(!state, updateUI);
        });
    });

    // LISTENER
    syncBtn.addEventListener("click", syncData);

    // INIT
    chrome.storage.local.get(["blocking"], (res) => {
        if (res.blocking === undefined) {
            chrome.storage.local.set({ blocking: false }, updateUI);
        } else {
            updateUI();
        }
    });
});