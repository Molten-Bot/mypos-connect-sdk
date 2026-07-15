# SDK launch runbook

This runbook covers the one-time hosted setup that cannot be completed from the
API-description repository alone. It is intentionally ordered so that no package
can be published before the contract evidence in
[`contract-validation.md`](contract-validation.md) is accepted.

The source repository `Molten-Bot/mypos-connect-sdk` must remain private to npm.
All npm publication happens from the generated production repository
`Molten-Bot/mypos-connect-typescript`.

## 1. Connect Stainless

1. Create or select the Stainless project `molten-ai/mypos-connect`.
2. Install the Stainless GitHub App for `Molten-Bot/mypos-connect-sdk` and the
   production repository `Molten-Bot/mypos-connect-typescript`.
3. Point the project at `openapi.yaml` and `stainless.yml` from this repository.
4. Enable the project's public SDK documentation-search API; the docs-only MCP
   package cannot start successfully without it.
5. Set the source-repository variable `STAINLESS_ENABLED` to `true`.
6. Manually run **Build Stainless SDKs** and require a build with no warnings.
7. Record and verify Stainless's stable public URL for the exact uploaded input
   spec, then add it to the MCP instructions and `./discovery` custom export.
8. Confirm that the generated repository's integrated branch is `next` and that
   release pull requests target `main`.

Do not add a long-lived Stainless API token when GitHub App/OIDC authentication is
available. The source workflow requests only `contents: read`, `id-token: write`,
and pull-request write access.

## 2. Verify generated artifacts

The first preview must contain all 20 resource methods mapped in `stainless.yml`,
the default `MyPOSConnect` client, ESM and CommonJS builds, the tree-shakable
entry point, and `packages/mcp-server`. Confirm that browser construction is
rejected while Node.js, Next.js Edge, and a worker build succeed.

Keep these additions as conventional custom-code commits on `next` so Stainless
replays them after regeneration:

- the human README prose from this repository, with every example compiled
  against the packed generated SDK rather than the source declaration fixture;
- a generated-package `engines.node` requirement for Node.js 22 or newer;
- a `./discovery` export containing only `OPENAPI_SPEC_URL`, fixed to the public
  Stainless copy of the release's exact OpenAPI input;
- fake-`fetch` tests for auth isolation, constructor/environment precedence,
  URL/query encoding, tilde-delimited paths, parsing, aborts, timeouts, retries,
  pagination, and credential redaction;
- package-consumer fixtures for ESM, CommonJS, Next.js server, Next.js Edge, and
  a worker bundler; and
- package-quality, MCP startup, discovery-link, and bundle-budget checks.

The generated CI matrix must cover Node.js 22 and 24 and run formatting, lint,
type checking, build, generated-code consistency, Jest, and all package checks.
Coverage thresholds for statements, branches, functions, and lines are 100% over
shipped SDK and MCP runtime code. Only declarations, tests, build scripts, and
generated documentation may be excluded.

The handwritten declaration in this source repository checks pre-release example
syntax only. Do not copy it into the generated repository or use it to satisfy the
consumer/typecheck gate.

Record the minified tree-shaken bundle containing one resource as the baseline.
Reject later increases greater than 10% unless a reviewed pull request updates
the baseline with an explanation.

## 3. Clear the contract gate

Collect and review the sanitized fixtures listed in
[`contract-validation.md`](contract-validation.md). Regenerate after every
contract correction and run both generated required-only and all-parameter tests
for each operation. Do not treat the Stainless mock server as evidence of the
upstream service's behavior.

The first release is blocked until auth, pagination termination, mutation
responses, errors, sales, and reward-point sign behavior are verified. The same
gate blocks the trusted-publisher setup because npm requires the package entry to
exist before it can be selected.

## 4. Bootstrap npm and trusted publishing

1. In `Molten-Bot/mypos-connect-typescript`, review and merge the Stainless
   release pull request to generated `main`. Do not publish from this source
   repository.
2. Clone the generated repository at the reviewed release commit, then run its
   full CI suite, `pnpm install`, and `pnpm build`.
3. Change into the generated repository's `dist` directory. Confirm that
   `npm pkg get name version repository` identifies
   `@molten-ai/mypos-connect-sdk`, the intended first version, and
   `Molten-Bot/mypos-connect-typescript`.
4. Run `npm pack --dry-run` and inspect the manifest. It must contain the built
   ESM/CommonJS client and declarations, and must not contain this source
   repository's tests, workflows, or API-source notes.
5. Authenticate interactively with `npm login`, then bootstrap the package with
   `pnpm publish --access public`. npm requires the package to exist before a
   trusted publisher can be configured.
6. In npm, configure the package's trusted publisher for GitHub organization
   `Molten-Bot`, repository `mypos-connect-typescript`, workflow
   `publish-npm.yml`, environment `npm-release`, and allowed action `npm publish`.
7. In the generated GitHub repository, create the approval-protected environment
   `npm-release`. Verify its release workflow uses a GitHub-hosted runner, Node
   22.14 or newer, npm 11.5.1 or newer, and `id-token: write`.
8. Run the next patch release through the generated repository's Stainless
   release PR and `publish-npm.yml`. Confirm npm shows provenance from
   `Molten-Bot/mypos-connect-typescript`, then set npm publishing access to
   require 2FA and disallow traditional tokens.
9. Delete the misplaced `NPM_TOKEN` secret from the source repository and revoke
   any bootstrap token that is no longer required.

Never publish from `Molten-Bot/mypos-connect-sdk`, with `--ignore-scripts`, from
an unreviewed generated `next` branch, or while the contract gate is open.

## 5. Protect both repositories

Protect source `main` with pull requests, conversation resolution, and the
validation, secret-scan, breaking-change, and Stainless-preview checks. Protect
generated `main` with the Node matrices, four-metric coverage, package consumer,
MCP, discovery, and bundle checks. Disable force pushes and branch deletion.

Require a reviewed Stainless release pull request to promote generated `next` to
`main`; Stainless should never publish directly from `next`.

## 6. Final release audit

Before each release, verify:

- `pnpm validate` passes in this source repository;
- the public OpenAPI URL returns the same contract used by the build;
- all 20 methods appear in SDK docs and MCP documentation search;
- both packed artifacts pass `publint` and Are the Types Wrong;
- clean ESM/CommonJS consumers and framework fixtures build from the tarball;
- the MCP process starts and has documentation search but no code tool;
- four-metric runtime coverage remains 100%; and
- the npm release attestation names the expected repository, workflow, commit,
  package, and version.
