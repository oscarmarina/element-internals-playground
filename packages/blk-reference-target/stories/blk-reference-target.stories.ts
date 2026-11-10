import {html} from 'lit';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-reference-target/blk-reference-target.js';

const meta: Meta = {
  title: 'blk-reference-target/blk-reference-target',
  component: 'blk-reference-target',
  args: {'default-slot': '<p>This modal dialog has a groovy backdrop!</p>'},
  // The element wraps a <dialog>: the button opens it through `commandfor` (needs `referenceTarget`).
  decorators: [
    (story) => html`
      <button commandfor="settings-dialog" command="show-modal">Open dialog</button>
      ${story()}
    `,
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <blk-reference-target id="settings-dialog">
      <div .innerHTML=${args['default-slot'] ?? ''}></div>
    </blk-reference-target>
  `,
};
