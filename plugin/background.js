browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg.action === "getSelectedText") {
        return Promise.resolve({ text: window._lastSelectedText || "" });
    }
});
