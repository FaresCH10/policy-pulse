# Production readiness — September 16, 2026

## Delivered

- Explicit server-side `APP_MODE=demo|live`, strict configuration checks and separate local storage. Existing demo storage remains compatible.
- Live mode works without credentials using a curated Washington, DC carryout bag fee record backed by DC Council and DOEE sources. Review date and limited coverage are visible. This is not an automatic government feed.
- Optional HTTPS JSON provider with complete record validation, matching scenarios, safe source links, scoped jurisdiction lookups, response-size limits and timeout. Failures never substitute demo data.
- Mode-aware location setup, navigation, provenance, policy details, notes, action checklists, editable copy-only drafts and printable summaries. Unavailable scenarios are excluded from the pickers.
- Error and 404 screens, `/api/health`, security headers, disabled unused public AI proxy, patched runtime/test dependencies and a reproducible lockfile.
- Storage access and malformed data fail safely. Hydration no longer risks writing defaults before stored data is loaded.
- Fixed bag-fee and composting first-year calculation traces so their signs agree with the headline totals. Added regression tests.
- Netlify build configuration and CI checks for both modes; deployment and maintenance instructions in README.md.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Unit tests: 62 passed across five files.
- Dependency installation/audit: zero known vulnerabilities reported.
- Production builds: demo and live passed.
- HTTP checks: demo and live health endpoints return the expected mode, provider and counts (5 demo / 1 live). Failed external feed returns 503. Retired AI POST returns 410. Unknown page returns 404. Security headers verified.
- Browser checks against production servers: demo selection; unsupported live location; DC selection and official citations; simulator updates and settings persistence; checklist and private-note persistence across reloads; copy action success feedback; source-labelled printable summary; mobile navigation/reflow; feed failure screen without demo content.
- Clipboard feedback was observed in the browser; the automation clipboard reader did not expose the copied content, so clipboard contents were not independently verified.

## Deployment boundary

The app is configured and validated locally for Netlify. No Netlify site was provisioned or deployed during this task. Follow README.md to connect the repository, set APP_MODE in Builds and Functions, and run post-deployment checks on the real URL.

Live coverage is intentionally small and maintained manually. Community notes are device-local, not a public community service. There are no accounts or cross-device backups. Keep official records reviewed and dependencies patched.

## Local tooling note

The machine's PowerShell npm launcher pointed at a missing roaming npm installation. Validation used the installed npm CLI under `C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js` and the package binaries directly. An npm resolver error was worked around when regenerating the lockfile; the resulting lockfile installed successfully with `npm ci`. No global npm settings were changed.
