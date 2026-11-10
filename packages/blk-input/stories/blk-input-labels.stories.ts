import {html} from 'lit';
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-input/blk-input.js';
import '@blockquote-playground/blk-input/blk-input-reference-target.js';

/**
 * How the inner control gets its accessible name. Open the **Accessibility** panel on each story:
 * `blk-input` copies the label text into `aria-label` (or references the label with
 * `ariaLabelledByElements`), `blk-input-reference-target` lets the platform forward the label
 * through `referenceTarget`. axe computes names in JS and ignores `referenceTarget`; avoid a text
 * `placeholder` here, axe accepts it as a name and hides a missing label.
 */
const meta: Meta = {
  title: 'blk-input/Labels',
};

export default meta;
type Story = StoryObj;

export const InternalLabel: Story = {
  render: () => html`<blk-input label="Name" required></blk-input>`,
};

export const ExternalLabel: Story = {
  render: () => html`
    <label for="name">Name</label>
    <blk-input id="name" required></blk-input>
  `,
};

export const ReferenceTargetInternalLabel: Story = {
  render: () => html`
    <blk-input-reference-target label="Name" required></blk-input-reference-target>
  `,
};

export const ReferenceTargetExternalLabel: Story = {
  // False positive: axe does not follow `referenceTarget`, so it reports the control as unlabeled.
  // In Chromium's real accessibility tree the name is "Name". Keep the other rules on.
  parameters: {a11y: {config: {rules: [{id: 'label', enabled: false}]}}},
  render: () => html`
    <label for="name">Name</label>
    <blk-input-reference-target id="name" required></blk-input-reference-target>
  `,
};

/** Expected violation: the Accessibility panel must report it. Keeps the audit honest. */
export const MissingLabel: Story = {
  render: () => html`<blk-input required></blk-input>`,
};

/** The hover border comes from `:host(:hover)`; `pseudo` forces it, even inside the shadow root. */
export const Hover: Story = {
  parameters: {pseudo: {hover: true}},
  render: () => html`<blk-input label="Name"></blk-input>`,
};
