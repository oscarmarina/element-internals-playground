import {expect, userEvent} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-input/blk-input.js';

const meta: Meta = {
  title: 'blk-input/blk-input',
  component: 'blk-input',
  args: {label: 'Name'},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Required: Story = {
  args: {label: 'Email', type: 'email', required: true, 'error-message-text': 'Enter an email'},
  // The error is shown only when the field is user-invalid: a committed change, then blur.
  play: async ({canvasElement}) => {
    const host = canvasElement.querySelector('blk-input')!;
    const control = host.shadowRoot!.querySelector('input') as HTMLInputElement;
    await expect(host.invalid).toBe(false);
    await userEvent.click(control);
    await userEvent.keyboard('not-an-email');
    await expect(host.invalid).toBe(false);
    await userEvent.tab();
    await expect(host.invalid).toBe(true);
  },
};

export const Textarea: Story = {
  args: {label: 'Comments', type: 'textarea', rows: 3},
};
