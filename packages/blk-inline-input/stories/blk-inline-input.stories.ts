import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-inline-input/blk-inline-input.js';

/** `blk-input` with its styles replaced by a minimal stylesheet. The API is inherited. */
const meta: Meta = {
  title: 'blk-inline-input/blk-inline-input',
  component: 'blk-inline-input',
  args: {label: 'Name'},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Required: Story = {
  args: {label: 'Email', type: 'email', required: true, 'error-message-text': 'Enter an email'},
};
