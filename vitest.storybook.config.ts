import {defineConfig} from 'vitest/config';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {playwright} from '@vitest/browser-playwright';

// Runs every story as a test (render + `play` + a11y checks) in Chromium and WebKit.
export default defineConfig({
  resolve: {
    conditions: ['workspaces', 'module', 'browser', 'development|production'],
  },
  optimizeDeps: {exclude: ['lit', 'lit-html']},
  plugins: [storybookTest({configDir: '.storybook'})],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      screenshotFailures: false,
      instances: [{browser: 'chromium'}, {browser: 'webkit'}],
    },
  },
});
