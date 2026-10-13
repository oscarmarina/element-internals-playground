# element-internals-playground

Lerna monorepo of Lit custom elements exploring `ElementInternals`. Packages in `packages/*`, scope `@blockquote-playground/*`.

## Commands

- Tests of one package: `npx lerna run test --scope @blockquote-playground/<pkg> -- --run`
- Tests of everything changed vs main (includes dependents): `npx lerna run test --stream --concurrency 1 --since origin/main -- --run`
- Lint (writes fixes): `npm run lint`
- Regenerate `custom-elements.json`: `npm run analyze` — never hand-edit it.

Tests run in Vitest browser mode on **chromium and webkit**, with `chai-a11y-axe` (`assert.isAccessible`). Coverage threshold is 80% — a failing threshold is a failing test. Playwright `getByRole` and axe compute names in JS and ignore `referenceTarget` / `ariaLabelledByElements`; only Chromium's AX tree (CDP) shows the real name.

## Invariants (breaking one is a bug)

- Errors are shown and announced only when the field is *user-invalid*, mirroring native user validity: a committed change (`input`/`change`) then blur, or an `invalid` event (form submission). Never on first render, programmatic value changes, or key presses that don't edit. In `blk-input` the gate is `__userValidity`, not `touched`.
- The native control lives in the shadow root. Its accessible name comes from `labelText`: host `aria-label` > `internals.ariaLabel` > associated `<label>` text, copied into `aria-label` at render time. When the shadow root has a `referenceTarget`, labels are **not** copied (the platform forwards them).
- Where `ariaLabelledByElements` is supported (and no `referenceTarget` or explicit aria-label applies), `blk-input` also points the control at its associated labels **once, when the control is created** (`_syncLabelReferences`), and again when the host `aria-label` changes. While the control references its labels, no `aria-label` is rendered (`_controlAriaLabel`), so translating a label's text updates the name without a render. Changes to *which* labels are associated are not observed — accepted limitation: a label associated later falls back to the copied text on the next render. Keep it simple: no observers, no per-update sync.
- `BlkInputReferenceTarget` sets `referenceTarget` in `willUpdate` from `_controlId`, before the first render; `hasReferenceTarget` must stay true as soon as it is set, even before the target exists. Never `requestUpdate()` from `updated()` to fix it up.
- `formDisabledCallback()` receives the *combined* disabled state; derive the fieldset part with `isFieldsetDisabled`, and recompute it in `willUpdate` when `disabled` changes.
- The reset value is captured once (first connect) or from the `value` attribute — moving the element in the DOM must not change it.
- `focus`/`blur` are composed: do not re-dispatch them.
- Platform behaviors: declare `static internalsBehaviors` and read them with `getBehavior()`. Never store them in class fields from `createBehaviors()` (runs inside `super()`, fields reset after).
- `blk-control-ssr` never creates its control; browser-only code is guarded by `isServer`.

## Agents

Reviewers live in `.claude/agents/`; the `/review-changes` skill decides which ones run. After a fix, re-verify with tests, not with another review.
