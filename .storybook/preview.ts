import type {Preview} from '@storybook/web-components-vite';
import {MINIMAL_VIEWPORTS} from 'storybook/viewport';

// No `setCustomElementsManifest()`: deprecated in Storybook 11, the manifest is read by the server.
const preview: Preview = {
  parameters: {
    layout: 'centered',
    // Core addons: pick a size from the toolbar (Viewport) or a color (Backgrounds).
    viewport: {options: MINIMAL_VIEWPORTS},
    backgrounds: {
      options: {
        light: {name: 'Light', value: '#ffffff'},
        dark: {name: 'Dark', value: '#1d1b20'},
      },
    },
    // @storybook/addon-a11y runs axe-core. The default is WCAG 2.0/2.1 A + AA; this adds 2.2 AA.
    a11y: {
      options: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
    },
  },
};

export default preview;
