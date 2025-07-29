import { Plugin } from '../../Plugin.js';

// import { installShowOpenFilePicker } from './window/showOpenFilePicker.js';
// import { installShowSaveFilePicker } from './window/showSaveFilePicker.js';

export class PolyfillManagerPlugin extends Plugin {
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
    console.log('Initialized Polyfills')
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

} // class
