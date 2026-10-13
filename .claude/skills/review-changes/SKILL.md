---
name: review-changes
description: Review the current changes before committing or pushing — runs deterministic checks first, then at most 2 independent reviewer subagents chosen by a script from the diff. Use when the user asks to review changes, check before publish/push, or runs /review-changes [base-ref].
---

# Review changes

Goal: catch real bugs with the fewest tokens. Tools first, LLM reviewers only for what tools cannot judge, never more than 2.

## 1. Route (0 tokens)

Run `bash .claude/skills/review-changes/route.sh $ARGUMENTS` (empty = against `origin/main`). Its output is the plan. Do not add reviewers it did not select, and do not run the ones listed as `DROPPED_BY_CAP` — mention them to the user instead.

- `NO_CHANGES` → stop.
- `WARNING=large diff` → stop and propose splitting the review per package (`route.sh` with a narrower base, or reviewing one package's files at a time). Ask before continuing with the whole diff.

## 2. Deterministic checks

Run every command under "Deterministic checks". If tests or lint fail, report the raw failure and stop: reviewing code that does not pass its own tests wastes the reviewers.

`api-diff.sh` exits 0 when the public API only grew (show the additions to the user, no reviewer needed) and 2 when something public was removed or renamed. On exit 2, add `api-contract-reviewer` to step 3 — it does not count against the cap — and pass it the "BREAKING" lines as its file list context.

## 3. Reviewers (in parallel)

Launch every selected reviewer in a **single message** with the Agent tool (`subagent_type` = reviewer name). Prompt each one with only:

```
Base ref: <BASE>
Changed files: <the files from "Files for reviewers"; for api-contract-reviewer, the BREAKING lines from api-diff.sh>
Intent of the change (one or two sentences): <from the user or the commit messages>
```

Do not paste the diff, your reasoning, or the conversation — the reviewer gets the diff itself, and the independence is the point.

## 4. Arbitrate

For each finding, check the cited `file:line` yourself and classify it:

- **Fix now** — Blocking and the scenario reproduces when you read the code.
- **Defer** — real but non-blocking.
- **Noise** — no reproducible scenario, already covered by a test, or style.

Show the user one table: reviewer, finding, your classification, why. Do not fix anything until the user agrees.

## 5. After fixing

Re-verify with the deterministic checks from step 2 (and the browser for visual changes). **Do not run the reviewers again** on the same change. If a Fix-now finding had a "Test idea", write that test first and see it fail.

## 6. Log the run

Append one line to `.claude/review-log.md` (create it with a header if missing):

```
| date | base | reviewers | findings | fix-now | noise | notes |
```

This log is how you find out whether each reviewer earns its cost. A reviewer that only produces noise for ~5 runs gets rewritten or removed.
