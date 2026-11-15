import {html} from 'lit';
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

export const WithValue: Story = {
  args: {value: 'Ada Lovelace'},
};

export const InfoMessage: Story = {
  args: {label: 'Email', type: 'email', 'info-message-text': 'We only use it to reply to you'},
};

/**
 * The error as the user sees it after a failed edit or submit. In real use `invalid` is set by
 * the element (only once the field is *user-invalid*); here it is forced to audit that state.
 */
export const Invalid: Story = {
  args: {
    label: 'Email',
    type: 'email',
    required: true,
    invalid: true,
    'error-message-text': 'Enter an email',
  },
};

export const InvalidWithInfoMessage: Story = {
  args: {...Invalid.args, 'info-message-text': 'We only use it to reply to you'},
};

export const InvalidTextarea: Story = {
  args: {
    label: 'Comments',
    type: 'textarea',
    required: true,
    invalid: true,
    'error-message-text': 'Tell us something',
  },
};

/** No inline error: on submit the browser shows its own bubble with `errorMessageText`. */
export const NativeValidationMessage: Story = {
  args: {
    label: 'Email',
    type: 'email',
    required: true,
    'native-validation-message': true,
    'error-message-text': 'Enter an email',
  },
  render: (args) => html`
    <form @submit=${(ev: Event) => ev.preventDefault()}>
      <blk-input
        label=${args['label']}
        type=${args['type']}
        required
        native-validation-message
        error-message-text=${args['error-message-text']}></blk-input>
      <button>Submit</button>
    </form>
  `,
};

export const Disabled: Story = {
  args: {value: 'Ada Lovelace', disabled: true},
};

export const ReadOnly: Story = {
  args: {value: 'Ada Lovelace', readOnly: true},
};

/** Disabled by an ancestor, not by its own attribute (`formDisabledCallback`). */
export const FieldsetDisabled: Story = {
  render: () => html`
    <fieldset disabled>
      <legend>Shipping address</legend>
      <blk-input label="Street" value="12 Analytical Row"></blk-input>
    </fieldset>
  `,
};
