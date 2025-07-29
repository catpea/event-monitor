import { Plugin } from '../../Plugin.js';
import { Plugin } from 'lib/timeline-utils.js';

export class PlotterPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();

    // installShowOpenFilePicker();
    // installShowSaveFilePicker();

  }

  init(app) {
    this.app = app;

    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === "devtools-app-event") {


      const group = this.makeGroup()
      this.renderMarker(station, group);
      this.renderLabel(station);

      }
    });


  }

  makeGroup(){
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "station");
      group.setAttribute("data-id", station.id);

      // this.renderStationLabel(station);
      // this.renderStationPorts(station, group);

      this.app.layers.stations.appendChild(group);
      return group;
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

} // class
