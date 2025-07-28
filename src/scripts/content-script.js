// // Injected into the web page context

console.log('Injected src/scripts/content-script.js into the web page context', globalThis.window.name );
// console.log('Injected src/scripts/content-script.js into the web page context', globalThis.window.app );


// (function() {
// console.log('Injected into the web page context')
//   // Ensure globalThis.app and addListener exist
//   if (globalThis.app && typeof globalThis.app.on === "function") {
//     globalThis.app.on("stationAdded", (eventData) => {
//       console.warn('content-script: stationAdded', eventData)
//       window.postMessage({
//         source: "event-monitor-extension",
//         type: "app-event",
//         payload: eventData,
//       }, "*");
//     });
//   }
// })();









// This runs in the extension context (sandbox)
// To access the page's globalThis, inject a script tag

function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

// Example: Listen to events on globalThis.app from the page context
const scriptToInject = `
  if (globalThis.app && typeof globalThis.app.on === "function") {
    globalThis.app.on("stationAdded", function(eventData) {
    console.log('window.postMessage', 'stationAdded', eventData)
      window.postMessage({
        source: "event-monitor-extension",
        type: "app-event",
        payload: eventData.serialize()
      }, "*");
    });
  }
`;

// Inject the script into the page
injectScript(scriptToInject);
