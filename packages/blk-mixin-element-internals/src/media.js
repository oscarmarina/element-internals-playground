import {dedupeMixin} from '@open-wc/dedupe-mixin';

/**
`AcmeCoreMediaQueryMixin` adds media query observing capabilities to a component. It allows to pair component boolean properties with media queries, so the property will be true when the media query matches, and false otherwise.

A component using this mixin must define a `_mediaQueries` static getter which returns an object containing pairs of property and media queries. These properties will get their values updated when the media queries change.

```js
class DemoComponent extends AcmeCoreMediaQueryMixin(LitElement) {
  static get properties() {
    return {
      _desktop: {
        attribute: false
      },
      _print: {
        attribute: false
      }
    }
  }

  static get _mediaQueries() {
    return {
      _desktop: '(min-width: 62rem)',
      _print: 'print'
    }
  }

  render() {
    return html`
      ${this._desktop ? html`
        <p>This text is only visible in desktop-sized viewports</p>
      ` : ''}

      ${this._print ? html`
        <p>This text is only visible when page is printed</p>
      ` : ''}
    `;
  }
  }
```

The mixin uses the modern `matchMedia` interface and its `MediaQueryList` object. Changes are listened for using the modern `addEventListener` and `removeEventListener` methods with the 'change' event, providing better performance and following current web standards.

Remember that media features (as min-width, for example) need to be surrounded by parentheses. Check [documentation on media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) for more info.
 */
const AcmeCoreMediaQueryMixinImpl = (Base) =>
  class AcmeCoreMediaQueryMixin extends Base {
    #mqs;
    #mqHandlers;

    static get _mediaQueries() {
      return {};
    }

    constructor() {
      super();
      this.constructor.__mqs ??= this.constructor.__generateMQs();
      this.#mqs = this.constructor.__mqs;
      this.#mqHandlers = new Map();
    }

    static __generateMQs = () => {
      return Object.entries(this._mediaQueries).map(([prop, query]) => ({
        prop,
        mq: window.matchMedia(query),
      }));
    }

    connectedCallback() {
      super.connectedCallback?.();
      this.#observeMediaQueries();
    }

    disconnectedCallback() {
      super.disconnectedCallback?.();
      this.#unobserveMediaQueries();
    }

    getBreakpointClasses() {
      return Object.keys(this.#mqs)
        .filter((key) => this[key])
        .map((key) => key.replace(/^_/, ''))
        .join(' ');
    }

    #observeMediaQueries() {
      this.#unobserveMediaQueries();

      for (const {prop, mq} of this.#mqs) {
        const handler = (event) => this.#mediaQueryHandler(prop, event.matches);
        this.#mqHandlers.set(prop, handler);

        // Use modern addEventListener with 'change' event
        mq.addEventListener('change', handler);

        // Set initial state
        this.#mediaQueryHandler(prop, mq.matches);
      }
    }

    #unobserveMediaQueries() {
      for (const [prop, handler] of this.#mqHandlers) {
        const mqItem = this.#mqs.find((item) => item.prop === prop);
        if (mqItem) {
          mqItem.mq.removeEventListener('change', handler);
        }
      }
      this.#mqHandlers.clear();
    }

    #mediaQueryHandler(key, matches) {
      this[key] = matches;
    }
  };

export const AcmeCoreMediaQueryMixin = dedupeMixin(AcmeCoreMediaQueryMixinImpl);
