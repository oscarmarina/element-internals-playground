import {expect, fn, userEvent} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-control/blk-control.js';

const meta: Meta = {
  title: 'blk-control/blk-control',
  component: 'blk-control',
  args: {type: 'checkbox', label: 'Accept', 'change-event': fn(), 'validation-event': fn()},
};

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {
  play: async ({canvasElement, args}) => {
    const input = canvasElement.querySelector('blk-control input') as HTMLInputElement;
    await expect(input.checked).toBe(false);
    await userEvent.click(input);
    await expect(input.checked).toBe(true);
    await expect(args['change-event']).toHaveBeenCalledOnce();
  },
};

export const Radio: Story = {
  args: {type: 'radio', label: 'Option', name: 'group'},
};

export const Required: Story = {
  args: {required: true},
};
