import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-tanstack-playground/blk-tanstack-playground.js';

const meta: Meta = {
  title: 'blk-tanstack-playground/blk-tanstack-playground',
  component: 'blk-tanstack-playground',
  parameters: {layout: 'padded'},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
