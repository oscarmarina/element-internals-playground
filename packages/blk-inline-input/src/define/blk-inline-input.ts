import {BlkInlineInput} from '../BlkInlineInput.js';

// @ts-expect-error -- DOM lib types `autocorrect` as boolean, but BlkInput (base class) types it as string.
window.customElements.define('blk-inline-input', BlkInlineInput);
