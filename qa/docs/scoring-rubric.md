# Automation Tester Technical Assessment — Scoring Rubric

**Total: 100 marks.** Score the submitted automation project, test design, defect report, and documentation. Playwright, Selenium, Cypress, or another suitable tool is acceptable; do not score candidates down for framework choice alone. Partial marks are available.

| Area | Marks | What to assess |
|---|---:|---|
| A. Functional Test Automation | 15 | OTP retrieval and verification, sign-in, validation, dashboard navigation, and CRUD. |
| B. Negative Testing | 15 | Invalid/missing/boundary inputs, errors, and graceful failure handling. |
| C. Automation Framework Structure | 30 | Independent, maintainable test architecture, reusable patterns, fixtures, configuration, test data, diagnostics, and reporting. |
| D. Multiple User & Session Handling | 15 | Separate users/roles/contexts, isolation, logout, and expiry. |
| E. Debugging & Defect Identification | 15 | Discovery, investigation, root-cause reasoning, reproducible bug report, and failure debugging evidence. |
| F. Documentation & Framework Usability | 10 | Another evaluator can independently install, run, debug, and understand the test suite. |
| **Total** | **100** | |

## A. Functional Test Automation — 15 marks

| Evidence | Marks |
|---|---:|
| Valid credentials complete sign-in and reach the dashboard | 3 |
| Invalid credentials, required fields, and basic input validation | 3 |
| Create a task and verify it appears | 2 |
| Update a task and verify the changed values | 2 |
| Delete a task and verify it is no longer available | 2 |
| Configure OTP retrieval (Mailpit API or local fallback), extract/submit the code to verify signup, and complete sign-in | 3 |
| **Subtotal** | **15** |

## B. Negative Testing — 15 marks

| Evidence | Marks |
|---|---:|
| Invalid and unexpected inputs | 4 |
| Missing mandatory fields | 3 |
| Useful assertions for validation/error messages and HTTP/application responses | 3 |
| Boundary conditions (lengths, status values, OTP/session expiry, etc.) | 2 |
| Graceful behavior during service/network/API failures | 3 |
| **Subtotal** | **15** |

## C. Automation Framework Structure — 30 marks

Candidates choose their own structure. Page Object Model, equivalent abstractions, or a simpler design are acceptable when justified.

| Evidence | Marks |
|---|---:|
| Clear test organization and reasoned architecture (POM where appropriate) | 6 |
| Reusable helpers, fixtures, hooks, and setup/teardown | 6 |
| Environment/configuration and isolated test-data management | 5 |
| Stable assertions, selectors, waits, and failure handling | 5 |
| Diagnostics: screenshots, traces, logs, and/or reports on failure | 5 |
| Readability, maintainability, and coding practices | 3 |
| **Subtotal** | **30** |

Candidates are not required to implement every pattern. They should explain why their selected patterns fit the scope and how test data is kept repeatable.

## D. Multiple User & Session Handling — 15 marks

| Evidence | Marks |
|---|---:|
| Log in as multiple users using isolated browser contexts (or equivalent isolation) | 4 |
| Validate ADMIN and VIEWER permissions, including denied writes | 4 |
| Verify session/data isolation while both users share the team task list | 3 |
| Verify logout revokes only the selected session and check expiry behavior | 4 |
| **Subtotal** | **15** |

The app assigns the first account in a fresh/reset database `ADMIN` and subsequent accounts `VIEWER`. The app also supports saved account sessions in the same browser; separate browser contexts should still remain isolated.

## E. Debugging & Defect Identification — 15 marks

| Evidence | Marks |
|---|---:|
| Finds the seeded failing feature and creates a reliable automated reproduction | 5 |
| Investigates and explains the probable root cause with supporting evidence | 3 |
| Bug report includes steps, preconditions, expected/actual behavior, severity, and evidence | 4 |
| Uses traces/screenshots/logs or equivalent to explain debugging of the failed test | 3 |
| **Subtotal** | **15** |

Do not share the location or exact reproduction of the seeded defect with candidates before assessment.

## F. Documentation & Framework Usability — 10 marks

Require a candidate README or equivalent that enables an evaluator on another machine to run the work.

| Documentation area | Marks | Expected content |
|---|---:|---|
| Framework setup and execution | 2 | Required software, clone/install/configuration steps, environment variables, all-tests and individual-test commands. |
| Third-party tools/dependencies | 2 | Tool list, purpose, setup/credentials if needed, and behavior when a dependency is unavailable. |
| Execution and debugging | 2 | Supported run modes, framework inspector/debug mode, screenshots/traces, reports, and troubleshooting commands. For Playwright, document Inspector, Trace Viewer, and report commands; other tools should document equivalents. |
| Implemented framework features | 2 | Brief explanation of chosen patterns/features (for example, POM, fixtures/hooks, API helpers, parallelism, retries, auth state, interception, and reporting) and what was actually implemented. |
| Coverage decisions | 2 | Feature-wise automated scenarios, scenarios not automated and why, limitations, and future opportunities. |
| **Subtotal** | **10** | |

For Playwright, document and tailor commands such as `npx playwright test`, `npx playwright test --ui`, `npx playwright test --debug`, `npx playwright show-trace <trace.zip>`, and `npx playwright show-report`. Candidates using another framework should document equivalent execution and debugging commands.

## Overall scoring anchors

- **90–100 — Strong:** Independent, repeatable suite; sound coverage and architecture; useful debugging evidence; actionable defect report; complete handoff documentation.
- **75–89 — Good:** Covers core flows and the seeded issue with a runnable suite; several edge cases, diagnostics, or documentation items could be stronger.
- **60–74 — Developing:** Some useful automated cases, but gaps in repeatability, role/session isolation, negative coverage, or defect evidence.
- **Below 60 — Needs substantial improvement:** Suite is not independently runnable, mostly happy-path, lacks useful assertions/diagnostics, or omits the defect report and setup guidance.

## Assessor notes

Record the selected framework, suite command/result, how test users and Mailpit messages are managed, role/session scenarios covered, the intentionally failing case reproduced, report quality, and setup friction. Give a short justification for each category so candidates are scored consistently.
