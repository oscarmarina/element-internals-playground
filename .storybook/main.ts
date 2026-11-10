import type {StorybookConfig} from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../packages/*/stories/**/*.stories.ts'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {
      // Paths are relative to this directory. Regenerate them with `npm run analyze`.
      customElementsManifest: [
        '../packages/blk-control/custom-elements.json',
        '../packages/blk-inline-input/custom-elements.json',
        '../packages/blk-input/custom-elements.json',
        '../packages/blk-mixin-element-internals/custom-elements.json',
        '../packages/blk-reference-target/custom-elements.json',
        '../packages/blk-tanstack-playground/custom-elements.json',
      ],
    },
  },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    resolve: {
      ...viteConfig.resolve,
      // The packages expose their TypeScript sources under the `workspaces` condition.
      conditions: ['workspaces', 'module', 'browser', 'development|production'],
    },
    optimizeDeps: {...viteConfig.optimizeDeps, exclude: ['lit', 'lit-html']},
  }),
};

export default config;
