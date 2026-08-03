// DesignOS Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("DesignOS Extension Installed.");
});

// Pass messages between popup and content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'run_checks') {
    // Analytics/logging could go here
    sendResponse({ status: "checks_initiated" });
  }
});
