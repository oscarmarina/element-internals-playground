import type {Preview} from '@storybook/web-components-vite';

// No `setCustomElementsManifest()`: deprecated in Storybook 11, the manifest is read by the server.
const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
};

export default preview;
