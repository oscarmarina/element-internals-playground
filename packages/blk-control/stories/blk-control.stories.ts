import {fn} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-control/blk-control.js';

const meta: Meta = {
  title: 'blk-control/blk-control',
  component: 'blk-control',
  args: {type: 'checkbox', label: 'Accept', 'change-event': fn(), 'validation-event': fn()},
};

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {};

export const Radio: Story = {
  args: {type: 'radio', label: 'Option', name: 'group'},
};

export const Required: Story = {
  args: {required: true},
};
