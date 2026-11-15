/**
 * Checking a radio from script unchecks the other members of its native group without
 * firing any event on them, so their hosts never learn about it (a user click is
 * different: the `change` bubbles and every host hears it on the root).
 *
 * Hosts register a callback for their native input here, and whoever checks a radio
 * programmatically calls {@link syncRadioGroupSiblings} to let the siblings re-read
 * their input.
 */
const hosts = new WeakMap<HTMLInputElement, () => void>();

export const registerRadioHost = (input: HTMLInputElement, syncFromNative: () => void) => {
  hosts.set(input, syncFromNative);
};

export const unregisterRadioHost = (input: HTMLInputElement) => {
  hosts.delete(input);
};

/**
 * Whether `candidate` belongs to the native radio group of `input`: same name and same
 * form owner (both `null` for form-less radios in the same root).
 */
export const isRadioGroupSibling = (input: HTMLInputElement, candidate: HTMLInputElement) =>
  candidate !== input &&
  input.type === 'radio' &&
  !!input.name &&
  candidate.type === 'radio' &&
  candidate.name === input.name &&
  candidate.form === input.form;

export const syncRadioGroupSiblings = (input: HTMLInputElement) => {
  if (input.type !== 'radio' || !input.name) {
    return;
  }
  const scope: Iterable<Element> =
    input.form?.elements ??
    (input.getRootNode() as ParentNode).querySelectorAll('input[type="radio"]');
  for (const candidate of scope) {
    if (candidate instanceof HTMLInputElement && isRadioGroupSibling(input, candidate)) {
      hosts.get(candidate)?.();
    }
  }
};
