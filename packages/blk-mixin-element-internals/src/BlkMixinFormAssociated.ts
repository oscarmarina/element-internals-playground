import {dedupeMixin} from '@open-wc/dedupe-mixin';
import {BlkMixinInternalsBase, internals} from './BlkMixinInternalsBase.js';

export type FormValue = File | string | FormData | null;
export type FormState = File | string | FormData | null;

export interface FormAssociated {
  readonly form: HTMLFormElement | null;
  readonly labels: NodeList;
  readonly role: string | null;
  readonly shadowRoot: ShadowRoot | null;
  readonly states: CustomStateSet;
  get isDisabled(): boolean;
  get isReadOnly(): boolean;
  get internals(): ElementInternals;
  get labelText(): string;
  get validationMessage(): string;
  get validity(): ValidityState;
  get willValidate(): boolean;
  requestSubmit(submitter?: HTMLElement | null): void;
  reset(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setFormValue(value: FormValue, state?: FormState): void;
  setValidity(validity: ValidityState, message?: string, anchor?: HTMLElement): void;
}

export interface FormAssociatedConstructor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): FormAssociated;
  formAssociated: boolean;
}

const FormAssociatedBase = <T extends CustomElementConstructor>(
  Base: T
): T & FormAssociatedConstructor =>
  class FormAssociatedMixin extends BlkMixinInternalsBase(Base) implements FormAssociated {
    static formAssociated = true;
    /**
     * The form read-only property of the ElementInternals interface returns the HTMLFormElement associated with this element.
     */
    get form() {
      return this[internals].form;
    }

    /**
     * The labels read-only property of the ElementInternals interface returns the labels associated with the element.
     */
    get labels() {
      return this[internals].labels;
    }

    /** A best-attempt based on observed behaviour in FireFox 115 on fedora 38 */
    get labelText(): string {
      return (
        this.internals.ariaLabel ||
        Array.from(this.labels as NodeListOf<HTMLElement>).reduce(
          (acc, label) => `${acc}${label.textContent}`,
          ''
        )
      );
    }

    /**
     * The role read-only property of the ElementInternals interface returns the WAI-ARIA role for the element.
     */
    override get role() {
      return this[internals].role;
    }

    /**
     * The shadowRoot read-only property of the ElementInternals interface returns the ShadowRoot for this element.
     */
    override get shadowRoot() {
      return this[internals].shadowRoot;
    }

    /**
     * The states read-only property of the ElementInternals interface returns a CustomStateSet representing the possible states of the custom element.
     */
    get states() {
      return this[internals].states;
    }

    /**
     * Returns whether the host element is currently disabled.
     */
    get isDisabled() {
      return this.matches(':disabled');
    }

    /**
     * Returns whether the host element is currently read-only.
     */
    get isReadOnly() {
      return this.matches(':read-only');
    }

    /**
     * Exposes the ElementInternals instance attached to this element.
     */
    get internals(): ElementInternals {
      return this[internals];
    }

    /**
     * The validationMessage read-only property of the ElementInternals interface returns the validation message for the element.
     */
    get validationMessage() {
      return this[internals].validationMessage;
    }

    /**
     * The validity read-only property of the ElementInternals interface returns a ValidityState object which represents the different validity states the element can be in, with respect to constraint validation
     */
    get validity() {
      return this[internals].validity;
    }

    /**
     * The willValidate read-only property of the ElementInternals interface returns true if the element is a submittable element that is a candidate for constraint validation.
     */
    get willValidate() {
      return this[internals].willValidate;
    }

    /**
     * The checkValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.
     */
    checkValidity() {
      return this[internals].checkValidity();
    }

    /**
     * The reportValidity() method of the ElementInternals interface checks if the element meets any constraint validation rules applied to it.
     */
    reportValidity() {
      return this[internals].reportValidity();
    }

    /**
     * The setFormValue() method of the ElementInternals interface sets the element's submission value and state, communicating these to the user agent.
     */
    setFormValue(value: FormValue, state?: FormState) {
      this[internals].setFormValue(value, state);
    }

    /**
     * The setValidity() method of the ElementInternals interface sets the validity of the element.
     */
    setValidity(validity: ValidityState, message?: string, anchor?: HTMLElement) {
      this[internals].setValidity(validity, message, anchor);
    }

    requestSubmit(submitter?: HTMLElement | null) {
      this.form?.requestSubmit(submitter);
    }

    reset() {
      this.form?.reset();
    }
  };

export const BlkMixinFormAssociated = dedupeMixin(FormAssociatedBase);
