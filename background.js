// background.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the browser level activities (e.g. tab management, etc.)
// License: MIT

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProblemMessages") {
        const { problemId } = request;
        chrome.storage.local.get([problemId], (result) => {
            sendResponse({ messages: result[problemId] || [] });
        });
        return true; // Keep the message channel open for async response
    }
});