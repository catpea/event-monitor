/**
This script is run whenever the devtools are open.
In here, we can create our panel.
*/



async function handleShown() {


  console.log("panel is being shown");


  // browser.runtime.sendMessage({
  //   tabId: browser.devtools.inspectedWindow.tabId,
  //   script: scriptToAttach
  // });

  // const result = await browser.devtools.inspectedWindow.eval('globalThis.app');
  // console.info(result);

// try {
//   const resultScript = browser.tabs.executeScript(browser.devtools.inspectedWindow.tabId, {
//     file: "/scripts/content-script.js"
//   });
//   const resultBridge = browser.tabs.executeScript(browser.devtools.inspectedWindow.tabId, {
//     file: "/scripts/content-bridge.js"
//   });

//   console.log(resultScript, resultBridge);
// } catch(e){
//   console.log(e)
// }


browser.runtime.sendMessage({
  action: "injectContentScripts",
  tabId: browser.devtools.inspectedWindow.tabId
});

}

function handleHidden() {
  console.log("panel is being hidden");
}

/**
Create a panel, and add listeners for panel show/hide events.
*/
browser.devtools.panels.create(
  "Event Monitor",
  "/icons/icon-48.png",
  "/devtools/panel/panel.html"
).then((newPanel) => {
  newPanel.onShown.addListener(handleShown);
  newPanel.onHidden.addListener(handleHidden);
});
