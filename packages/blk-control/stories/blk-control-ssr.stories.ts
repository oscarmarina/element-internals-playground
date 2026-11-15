import {html} from 'lit';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-control/blk-control.js';

/**
 * The declarative variant: the author provides the native `<input>` and `<label>` as slotted
 * children, so every story writes its own markup instead of relying on args.
 */
const meta: Meta = {
  title: 'blk-control/blk-control-ssr',
  component: 'blk-control-ssr',
};

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {
  render: () => html`
    <blk-control-ssr>
      <input slot="embedded" aria-invalid="false" id="ssr-terms" type="checkbox" name="terms" />
      <label slot="embedded" for="ssr-terms">Accept the terms</label>
    </blk-control-ssr>
  `,
};

export const Checked: Story = {
  render: () => html`
    <blk-control-ssr>
      <input
        slot="embedded"
        aria-invalid="false"
        id="ssr-checked"
        type="checkbox"
        name="news"
        checked
      />
      <label slot="embedded" for="ssr-checked">Send me the newsletter</label>
    </blk-control-ssr>
  `,
};

export const RadioGroup: Story = {
  render: () => html`
    <fieldset>
      <legend>Delivery</legend>
      <blk-control-ssr>
        <input
          slot="embedded"
          aria-invalid="false"
          id="ssr-standard"
          type="radio"
          name="ssr-delivery"
          checked
        />
        <label slot="embedded" for="ssr-standard">Standard</label>
      </blk-control-ssr>
      <blk-control-ssr>
        <input
          slot="embedded"
          aria-invalid="false"
          id="ssr-express"
          type="radio"
          name="ssr-delivery"
        />
        <label slot="embedded" for="ssr-express">Express</label>
      </blk-control-ssr>
    </fieldset>
  `,
};

/** Submit without checking it: the error state appears only after that attempt. */
export const Required: Story = {
  render: () => html`
    <form @submit=${(ev: Event) => ev.preventDefault()}>
      <blk-control-ssr>
        <input
          slot="embedded"
          aria-invalid="false"
          id="ssr-required"
          type="checkbox"
          name="terms"
          required
        />
        <label slot="embedded" for="ssr-required">Accept the terms</label>
      </blk-control-ssr>
      <button>Submit</button>
    </form>
  `,
};

export const LabelAtStart: Story = {
  render: () => html`
    <blk-control-ssr label-position="start">
      <input slot="embedded" aria-invalid="false" id="ssr-start" type="checkbox" name="start" />
      <label slot="embedded" for="ssr-start">Label before the control</label>
    </blk-control-ssr>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <blk-control-ssr>
      <input
        slot="embedded"
        aria-invalid="false"
        id="ssr-disabled"
        type="checkbox"
        name="off"
        disabled
        checked
      />
      <label slot="embedded" for="ssr-disabled">Not available</label>
    </blk-control-ssr>
  `,
};
