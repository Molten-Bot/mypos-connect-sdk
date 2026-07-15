# Contributing

This repository maintains an unofficial description of the third-party MyPOS
Connect API and the Stainless configuration used to generate a client. It does
not own or operate the API. The generated TypeScript runtime lives in a separate
production repository.

## Before opening a pull request

1. Use Node.js 22 or newer and enable Corepack.
2. Install the pinned dependencies with `pnpm install --frozen-lockfile`.
3. Run `pnpm validate`.
4. Review the Stainless preview and generated SDK diff attached to the pull
   request.

Do not commit generated SDK runtime files here. Contract behavior belongs in
`openapi.yaml`; SDK naming, client configuration, and generation behavior belong
in `stainless.yml`.

## Contract changes

- Preserve the upstream path, query, and JSON property casing exactly.
- Give every operation a stable, unique `operationId` and a deterministic
  Stainless resource mapping.
- Do not mark a property required, narrow an extensible object, add automatic
  pagination, or change a scalar type without a sanitized fixture or upstream
  documentation.
- Describe unknown client and server failures with the shared fallback responses
  instead of inventing status-specific response bodies.
- Treat removals, required-field additions, and type narrowing as breaking
  changes.
- Update README examples and contract tests when public behavior changes.

The evidence needed to strengthen currently loose schemas is listed in
[`docs/contract-validation.md`](docs/contract-validation.md).

## Fixtures and secrets

Fixtures must be synthetic and deterministic. Never commit API usernames,
passwords, JWTs, customer information, addresses, real products, store codes,
orders, or request headers containing secrets. See [SECURITY.md](SECURITY.md) for
private reporting instructions.

## Generated SDK custom code

Prefer OpenAPI or Stainless configuration changes over editing generated code.
When custom code is necessary, add new isolated files and tests on the generated
repository's integrated branch, use a conventional commit message, and avoid
moving generated files. Stainless will replay those commits across regeneration.

Generated runtime changes must keep all four coverage metrics at 100%, pass ESM
and CommonJS package checks, and compile the documented framework examples.

## Commit messages

Use conventional commits so Stainless can produce useful release notes:

- `feat(api): ...` for additive API changes;
- `fix(api): ...` for contract corrections;
- `docs: ...` for documentation-only changes;
- `chore(ci): ...` for validation and automation; and
- an exclamation mark, such as `feat(api)!: ...`, for breaking changes.
