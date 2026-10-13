# Element Internals Playground

Explore the [ElementInternals API](https://developer.mozilla.org/docs/Web/API/ElementInternals) using reusable mixins.

- [blk-input](./packages/blk-input/README.md) & **blk-inline-input**: Simple custom input elements demonstrating internal messaging and validity control.
- **BlkMixinElementInternals**: Core mixin to attach `ElementInternals` to any custom element.
- [BlkMixinFormAssociated](./packages/blk-mixin-element-internals/README.md): Extension of the core mixin enabling form-associated custom elements.
- **BlkFormValidationEvent**: Custom event for validation state changes.

## AI-assisted review (Claude Code)

`CLAUDE.md` is what Claude always knows about this repo. The agents are specialized reviewers that only run when a change calls for them. Scripts decide which ones run without spending tokens, and every run is logged to judge whether each reviewer is worth its cost.

| Piece                            | What it is                                                                                                                                                                                                 | When it acts                            | Cost                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------- |
| `CLAUDE.md`                      | Project memory: commands and the invariants that must not break (when errors show, how the accessible name is resolved, `referenceTarget` set in `willUpdate`…)                                            | Every session                           | Low, fixed (~30 lines) |
| `.claude/agents/`                | Three reviewers with a clean context that only see the diff: **forms-a11y** (ARIA, validity, form callbacks), **lit-correctness** (lifecycle, mixins, events, SSR), **api-contract** (breaking public API) | Only when the orchestrator calls them   | ~8k–14k tokens each    |
| `.claude/skills/review-changes/` | The `/review-changes` orchestrator                                                                                                                                                                         | On demand, before committing/publishing | —                      |
| `route.sh`                       | Picks checks and at most 2 reviewers from the changed files                                                                                                                                                | First step                              | 0 tokens               |
| `api-diff.sh`                    | Diffs the public API (manifests, `index.ts` exports, `package.json` exports) against the base; calls the API reviewer only when something is removed or renamed                                            | After `npm run analyze`                 | 0 tokens               |
| `.claude/review-log.md`          | One line per run: reviewers, findings, what was real                                                                                                                                                       | End of each review                      | —                      |

### Flow

```
change code
     │
/review-changes
     │
     ├─ route.sh ──► what changed?                (0 tokens)
     │                ├─ styles/demo/deps → tools, no LLM
     │                └─ src/ → up to 2 reviewers
     │
     ├─ tests + lint + analyze + api-diff         (0 tokens)
     │     └─ anything fails → stop
     │
     ├─ reviewers in parallel, clean context      (diff + intent only)
     │
     ├─ each finding checked → Fix now / Defer / Noise table
     │
     └─ fix → re-verified with TESTS, not another review
```

### Why it is built this way

1. **Independence.** The author doesn't see their own mistakes; a reviewer with a clean context does.
2. **Tools before LLMs.** Tests (Chromium + WebKit with axe), lint and the API diff run first. If a tool can answer, no model is asked.
3. **At most 2 reviewers per run.** Not everyone goes to every meeting: a typical review costs ~25k tokens.
4. **Every real bug becomes a test.** Once tested, it no longer depends on a reviewer.
5. **Decisions are written down.** Accepted limitations are listed in the reviewers as "do not report", so they don't come back as noise.

### What it does not do

- It doesn't replace the tests or the `pre-push` hook; it covers what tests miss.
- It isn't automatic: use it before changes to form logic, accessibility or public API.
- Its value is still being measured in `.claude/review-log.md`. A reviewer that only produces noise for ~5 runs gets rewritten or removed.

---

**References and related projects:**

- [Lookwe69 - lit-mixins](https://github.com/Lookwe69/lit-mixins/tree/main/src/internal)
- [@lit-labs/forms](https://github.com/lit/lit/tree/form-associated/packages/labs/forms)
- [Playground](https://lit.dev/playground/#gist=31460b33459d68e87f07cceb16ffb1f1)
  - [adoptedStylesheets](https://github.com/w3c/csswg-drafts/issues/11403)
- [Webcomponents cg](https://github.com/w3c/webcomponents-cg/issues/104#issuecomment-2518809518)
- [Ionic Input Component](https://github.com/ionic-team/ionic-framework/blob/main/core/src/components/input/input.tsx#L373)
- [Calcite Input Component](https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/src/components/input/input.tsx)
- [Material Web Text Field](https://github.com/material-components/material-web/blob/main/textfield/internal/text-field.ts)
- [PatternFly Text Input](https://github.com/patternfly/patternfly-elements/blob/main/elements/pf-text-input/pf-text-input.ts#L232)
- [Custom forms with Web Components and ElementInternals (dev.to)](https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj)
- [Form validation using JavaScript's Constraint Validation API (medium.com)](https://medium.com/stackanatomy/form-validation-using-javascripts-constraint-validation-api-fd4b70720288)
- [MUI Joy UI Input](https://mui.com/joy-ui/react-input/)
- [ElementInternalsType Explainer (Microsoft Edge)](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/ElementInternalsType/explainer.md)
- [Reference Target (Igalia)](https://blogs.igalia.com/alice/reference-target-having-your-encapsulation-and-eating-it-too/)
- [Reference Target Demo (Microsoft Edge)](https://microsoftedge.github.io/Demos/reference-target/)
- [Platform-provided behaviors for custom elements (Microsoft Edge)](https://microsoftedge.github.io/Demos/platform-provided-behaviors-for-custom-elements/)
