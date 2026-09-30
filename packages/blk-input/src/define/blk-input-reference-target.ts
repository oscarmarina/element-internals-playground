import {BlkInputReferenceTarget} from '../BlkInputReferenceTarget.js';

// @ts-expect-error -- DOM lib types `autocorrect` as boolean, but BlkInput types it as string.
window.customElements.define('blk-input-reference-target', BlkInputReferenceTarget);
