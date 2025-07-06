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
    #mediaQueryMap = new Map();

    static get _mediaQueries() {
      return {};
    }

    constructor() {
      super();
      this.#initializeMediaQueries();
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
      const activeBreakpoints = [];

      for (const [prop] of this.#mediaQueryMap) {
        if (this[prop]) {
          activeBreakpoints.push(prop.replace(/^_/, ''));
        }
      }

      return activeBreakpoints.join(' ');
    }

    #initializeMediaQueries() {
      const queries = /** @type {typeof AcmeCoreMediaQueryMixin} */ (this.constructor)._mediaQueries;

      for (const [prop, query] of Object.entries(queries)) {
        const mq = window.matchMedia(query);
        const handler = (event) => {
          this[prop] = event.matches;
        };

        this.#mediaQueryMap.set(prop, { mq, handler });
      }
    }

    #observeMediaQueries() {
      for (const [prop, { mq, handler }] of this.#mediaQueryMap) {
        mq.addEventListener('change', handler);
        // Set initial state
        this[prop] = mq.matches;
      }
    }

    #unobserveMediaQueries() {
      for (const [, { mq, handler }] of this.#mediaQueryMap) {
        mq.removeEventListener('change', handler);
      }
    }
  };

export const AcmeCoreMediaQueryMixin = dedupeMixin(AcmeCoreMediaQueryMixinImpl);