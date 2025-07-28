console.log('Injected src/scripts/content-bridge.js into the web page context')


// Now listen in your content script for the posted messages:
window.addEventListener("message", (event) => {
  if (
    event.source === window &&
    event.data &&
    event.data.source === "event-monitor-extension" &&
    event.data.type === "app-event"
  ) {
    // You have access to event.data.payload here
    console.log("Received app-event from page:", event.data.payload);


      // console.warn('content-script: stationAdded', event.data.payload)
      // window.postMessage({
      //   source: "event-monitor-extension",
      //   type: "app-event",
      //   payload: event.data.payload,
      // }, "*");

    // Forward to background or DevTools panel as needed
    browser.runtime.sendMessage(event.data);
  }
});
