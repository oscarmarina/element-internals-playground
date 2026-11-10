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
};

export const Textarea: Story = {
  args: {label: 'Comments', type: 'textarea', rows: 3},
};
