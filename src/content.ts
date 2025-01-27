// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'formatMarkdown') {
    // Handle markdown formatting request
    sendResponse({ success: true });
  }
});

// Export empty object to satisfy module requirements
export {};