browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "injectContentScripts" && msg.tabId) {
    // Inject content-script.js
    console.info('Inject content-script.js');
    browser.scripting.executeScript({
      target: { tabId: msg.tabId },
      files: ["/scripts/content-script.js"]
    });
    // Inject content-bridge.js
    console.info('Inject content-bridge.js');
    browser.scripting.executeScript({
      target: { tabId: msg.tabId },
      files: ["/scripts/content-bridge.js"]
    });
  }
});





browser.runtime.onMessage.addListener((msg, sender) => {
  // Forward events from the content script to the devtools panel
  if (msg.type === "app-event") {
    // Broadcast to all connected panels (consider tracking panels if needed)
    browser.runtime.sendMessage({
      type: "devtools-app-event",
      payload: msg.payload,
      tabId: sender.tab.id,
    });
  }
  // Optionally, handle script injection requests from devtools
  if (msg.script && msg.tabId) {
    browser.tabs.executeScript(msg.tabId, { code: msg.script });
  }
});





/**
When we receive the message, execute the given script in the given
tab.
*/
function handleMessage(request, sender, sendResponse) {
  if (sender.url != browser.runtime.getURL("/devtools/panel/panel.html")) {
    return;
  }
  browser.tabs.executeScript(
    request.tabId,
    {
      code: request.script
    });
}

/**
Listen for messages from our devtools panel.
*/
browser.runtime.onMessage.addListener(handleMessage);


browser.runtime.onMessage.addListener((msg, sender) => {
  // Forward events from the content script to the devtools panel
  if (msg.type === "app-event") {
    // Broadcast to all connected panels (consider tracking panels if needed)
    browser.runtime.sendMessage({
      type: "devtools-app-event",
      payload: msg.payload,
      tabId: sender.tab.id,
    });
  }
  // Optionally, handle script injection requests from devtools
  if (msg.script && msg.tabId) {
    browser.tabs.executeScript(msg.tabId, { code: msg.script });
  }
});
