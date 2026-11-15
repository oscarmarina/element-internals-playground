import {html} from 'lit';
import {fn} from 'storybook/test';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-control/blk-control.js';

const meta: Meta = {
  title: 'blk-control/blk-control',
  component: 'blk-control',
  // `fn()` is only the spy that feeds the Actions panel; there are no tests in Storybook.
  args: {type: 'checkbox', label: 'Accept', 'change-event': fn(), 'validation-event': fn()},
};

export default meta;
type Story = StoryObj;

export const Checkbox: Story = {};

export const Checked: Story = {
  args: {checked: true},
};

export const Indeterminate: Story = {
  args: {label: 'Select all', indeterminate: true},
};

export const Radio: Story = {
  args: {type: 'radio', label: 'Option', name: 'group'},
};

/** Same-name radios form a native group: arrow keys move the selection, one tab stop. */
export const RadioGroup: Story = {
  render: () => html`
    <fieldset>
      <legend>Delivery</legend>
      <blk-control type="radio" name="delivery" value="standard" label="Standard" checked>
      </blk-control>
      <blk-control type="radio" name="delivery" value="express" label="Express"></blk-control>
      <blk-control type="radio" name="delivery" value="pickup" label="Pick up"></blk-control>
    </fieldset>
  `,
};

export const Required: Story = {
  args: {required: true},
};

/** Forced here to audit the state; in real use the element sets it after interaction or submit. */
export const Invalid: Story = {
  args: {required: true, invalid: true},
};

export const LabelAtStart: Story = {
  args: {'label-position': 'start'},
};

export const Disabled: Story = {
  args: {disabled: true},
};

export const DisabledChecked: Story = {
  args: {disabled: true, checked: true},
};

/** Disabled by an ancestor, not by its own attribute (`formDisabledCallback`). */
export const FieldsetDisabled: Story = {
  render: () => html`
    <fieldset disabled>
      <legend>Notifications</legend>
      <blk-control name="email" label="Email" checked></blk-control>
      <blk-control name="sms" label="SMS"></blk-control>
    </fieldset>
  `,
};
