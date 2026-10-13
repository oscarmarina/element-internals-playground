# Review log

| date | base | reviewers | findings | fix-now | noise | notes |
|---|---|---|---|---|---|---|
| 2026-10-12 | HEAD (eval: bug A planted in `_onBlur`) | forms-a11y, lit-correctness | 2 (same bug) + 1 doc | 1 | 0 | Both caught the planted bug, which passes all 182 tests. Duplicate finding = overlap. Extra: `touched` doc says "losing focus" but blur doesn't mark it. Router v1 missed forms-a11y (fixed: per-file rule). |
| 2026-10-13 | e3ce437 (pending: user-validity fix + referenceTarget willUpdate) | forms-a11y, lit-correctness | 0 | 0 | 0 | Both NONE (~12.6k + ~13.6k tokens). Gaps they declared (single-render test, formStateRestoreCallback) checked by orchestrator: covered / correct. api-diff: no breaking. Caveat: code already tested + intent was descriptive, so NONE is weak evidence. |
