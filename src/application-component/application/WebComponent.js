import { Application } from './Application.js';
import { PolyfillManagerPlugin } from "./plug-ins/polyfills/PolyfillManagerPlugin.js";

export class WebComponent extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
        <svg id="main-svg" class="start-0 top-0 w-100 h-100 position-fixed" style="background-color: var(--bs-body-bg);">
          <defs>
          </defs>
          <g id="viewport">
          </g>
        </svg>
    `;

    // const svg = this.querySelector('#svg-container');
    const svg = this.querySelector("#main-svg");
    const app = new Application(svg);

    app.timeline


    window.name = "peepee";
    globalThis.app = app;
    Object.freeze(app);

    app.use(new PolyfillManagerPlugin());

    app.init();

  }
}
