# QA Assessment Scoring Rubric

**Total: 100 points.** Score evidence in the submitted automation and report, not framework choice. Partial credit is expected. A candidate does not need to identify every edge case to score well.

| Area | Points | Evidence to look for |
|---|---:|---|
| Framework ownership and runnable setup | 15 | Candidate independently configures a suitable framework; clean install, browser setup, base URL, and test command are documented; environment/config is not tied to the candidate's machine. |
| Test strategy and prioritization | 15 | Clear risk-based choices, meaningful regression boundaries, a sensible test pyramid, and rationale; identifies important auth/session/data-loss risks. |
| Functional and lifecycle coverage | 20 | Signup → OTP → sign-in, protected session/sign-out, task create/read/update/status/filter/delete; includes empty and populated states and checks user-visible outcomes. |
| Validation, boundaries, and negative cases | 15 | Required/malformed fields, input length and status boundaries, invalid OTP/credentials/session, duplicate/repeated actions, API errors, and useful assertions. |
| Tenant/user isolation and data management | 10 | Exercises separate accounts or equivalent ownership boundaries; uses unique/disposable test data and reliable setup/cleanup without relying on fixed preexisting records. |
| Defect discovery and regression | 10 | Finds the seeded issue, supplies a stable automated reproduction, distinguishes expected/actual results, explains impact/severity, and identifies a regression test. |
| Maintainability and diagnostics | 10 | Readable tests/helpers, sensible selectors/waits, deterministic assertions, actionable failure output, and avoidance of sleeps or brittle implementation-dependent checks. |
| Accessibility, responsive, and browser considerations | 5 | At least targeted keyboard/accessibility and narrow-viewport coverage or a reasoned explanation of scope. |
| **Total** | **100** | |

## Scoring anchors

- **90–100 — Strong:** Thoughtful, independent structure; repeatable tests cover end-to-end value and key failures; defect report is precise; setup works from a clean environment.
- **75–89 — Good:** Useful runnable suite and sound core coverage, with a few gaps in edge conditions, isolation, or diagnostics.
- **60–74 — Developing:** Some valuable automated scenarios, but setup/repeatability, assertions, or coverage are uneven; bug evidence may be incomplete.
- **Below 60 — Needs substantial improvement:** Suite is not reproducibly runnable, largely manual or happy-path-only, lacks clear expected/actual assertions, or provides insufficient evidence.

## Evaluator guidance

- Do not award or deduct points based on whether the candidate selects Playwright vs Cypress (or another appropriate tool).
- Prefer robust observable outcomes over test count. A few well-designed cases are better than many duplicate assertions.
- The seeded defect is in the task-delete contract. The assessor should verify the expected and actual behavior locally before scoring; do not tell candidates the defect location in advance.
- Do not penalize a candidate for acknowledging that security and production email delivery are out of scope for this local fixture, but do reward appropriately testing the simulated OTP flow.
- A candidate may describe a defect correctly even if a platform issue prevents local automation; award evidence and reasoning proportionally.

## Suggested assessor notes

Record the candidate's chosen framework, how a fresh test account/database is obtained, suite command/result, highest-risk scenarios covered, one example assertion quality, defect reproduction reliability, and any setup friction. Keep the raw score and a short justification for each category for consistent comparisons across candidates.
