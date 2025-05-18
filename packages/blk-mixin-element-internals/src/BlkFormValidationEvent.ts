export class BlkFormValidationEvent extends Event {
  readonly valid: boolean;
  readonly validityResult: ValidityState;

  constructor(validityResult: ValidityState) {
    super('validation', {bubbles: true});
    this.valid = validityResult.valid;
    this.validityResult = validityResult;
  }
}

declare global {
  interface GlobalEventHandlersEventMap {
    validation: BlkFormValidationEvent;
  }
}
