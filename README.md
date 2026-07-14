# MyPOS Connect TypeScript SDK

This repository is the source of truth for the MyPOS Connect OpenAPI contract and
the Stainless configuration used to generate the TypeScript SDK.

The generated packages are intentionally **not published yet**. The source API
document omits several wire-level details, so the first public release is gated on
sanitized API fixtures or sandbox responses. See
[Contract validation](docs/contract-validation.md) for the outstanding evidence.

## Generated artifacts

Once the release gate is satisfied, Stainless will maintain these artifacts from
this repository:

- `@molten-ai/mypos-connect` — the server-side TypeScript SDK.
- `@molten-ai/mypos-connect-mcp` — a documentation-search-only MCP server for
  coding agents.
- `Molten-Bot/mypos-connect-typescript` — the generated SDK production
  repository.
- A stable, public copy of the validated OpenAPI contract and model-optimized SDK
  documentation.

The source contract is available at [openapi.yaml](openapi.yaml). The extracted
upstream API notes are retained in [sdk.md](sdk.md) for provenance; when the two
disagree, verified API behavior and `openapi.yaml` take precedence.

## Intended runtime

The SDK targets Node.js 22+, server-rendered applications, API routes, and edge
workers that provide the standard Fetch API. Direct browser use is disabled
because MyPOS Connect API-user credentials and bearer tokens are secrets.

The generated client uses native `fetch`, preserves the API's JSON property
casing, and offers a tree-shakable entry point for applications that only need a
subset of resources.

## Configuration

Connection details belong to each downstream application. Constructor values take
precedence over environment variables; only the base URL has a production
fallback.

| Client option | Environment variable | Default |
|---|---|---|
| `baseURL` | `MYPOS_CONNECT_BASE_URL` | `https://api.myposconnect.com/api/v2` |
| `accessToken` | `MYPOS_CONNECT_ACCESS_TOKEN` | None |
| `username` | `MYPOS_CONNECT_USERNAME` | None |
| `password` | `MYPOS_CONNECT_PASSWORD` | None |

Never prefix these variables with `NEXT_PUBLIC_`, `VITE_`, or another mechanism
that embeds values into browser JavaScript.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect';

const client = new MyPOSConnect({
  baseURL: process.env.MYPOS_CONNECT_BASE_URL,
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
});

const products = await client.products.list({
  liPageSize: 100,
  liPage: 1,
  filt_active_bool: true,
});
```

### Obtaining a bearer token

Token acquisition uses HTTP Basic authentication. The SDK deliberately does not
store the API username/password or refresh the 120-minute JWT automatically;
downstream code owns that lifecycle.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect';

const authClient = new MyPOSConnect({
  baseURL: process.env.MYPOS_CONNECT_BASE_URL,
  username: process.env.MYPOS_CONNECT_USERNAME,
  password: process.env.MYPOS_CONNECT_PASSWORD,
});

const { token } = await authClient.auth.tokens.create();

const client = new MyPOSConnect({
  baseURL: process.env.MYPOS_CONNECT_BASE_URL,
  accessToken: token,
});
```

The exact token payload and response must be confirmed before release. This
example reflects the current OpenAPI contract rather than a claim about an
unverified production response.

## SDK resources

| SDK surface | Purpose |
|---|---|
| `auth.tokens.create()` | Obtain a JWT using Basic authentication. |
| `products.list()`, `retrieve()`, `listChanged()`, `listAlternate()` | Read general product data. |
| `products.storeData.*` | Read store price, cost, quantity, tax, and on-order data. |
| `products.serialNumbers.retrieveStatus()` | Read a serial-number status. |
| `customers.create()`, `retrieve()`, `update()` | Manage local customers. |
| `customers.global.retrieve()`, `update()` | Manage supported global-customer fields. |
| `stores.list()` | List stores used by inventory and sale calls. |
| `inventory.commitments.create()`, `retrieve()` | Reserve or inspect order quantities. |
| `rewards.commitments.create()` | Reserve or reverse reward points. |
| `sales.create()` | Insert a sale or send the documented cancellation payload. |

Automatic retries are limited to safe read operations. Customer creation, sales,
quantity commitments, and reward-point commitments default to zero retries until
the API's idempotency behavior is documented. Timeouts, retries, cancellation,
and an alternate `fetch` implementation remain configurable per request.

## Framework usage

Call the SDK from a server-only boundary such as a Next.js Route Handler, server
action, worker, or backend service. A browser should call that boundary instead of
calling MyPOS Connect directly.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect';

export async function GET(): Promise<Response> {
  const client = new MyPOSConnect({
    accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
  });

  const stores = await client.stores.list({ liPageSize: 100, liPage: 1 });
  return Response.json(stores);
}
```

## Agent discovery

Agents will be able to install `@molten-ai/mypos-connect-mcp` and call its SDK
documentation-search tool. API code execution is disabled, so the MCP package
cannot create customers, reserve inventory, or submit sales. The MCP instructions
link to the exact hosted `openapi.yaml` used for generation.

No discovery route is added to `api.myposconnect.com`; this repository does not
control that service.

## Development

Prerequisites are Node.js 22+ and Corepack. The lockfile pins all validation
tooling.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm validate
```

Validation includes OpenAPI linting, contract invariants, documentation checks,
and a Stainless preview build in CI. Pull requests that change the contract also
run a breaking-change comparison against `main`.

Stainless owns generated runtime code in the production SDK repository. Changes
to generated behavior should begin in `openapi.yaml` or `stainless.yml`; custom
SDK tests and prose should be isolated as Stainless custom-code commits.

## Release flow

1. A pull request validates the contract and previews the generated SDK.
2. Merging to this repository's `main` updates Stainless.
3. Stainless updates the generated repository's `next` branch and release PR.
4. Generated lint, type, test, 100% coverage, package, and consumer checks pass.
5. After contract evidence is complete, a maintainer bootstraps npm with a
   validated `0.1.0` release and enables trusted OIDC publishing.
6. Stable `1.0.0` remains blocked until auth, pagination, sales, and error fixtures
   are verified.

## Support and security

Use GitHub issues for SDK or contract problems and follow
[SECURITY.md](SECURITY.md) for private vulnerability reports. API-account
provisioning and production-service incidents should be directed to the MyPOS
Connect service owner. Never include credentials, bearer tokens, customer data,
or real order data in an issue or fixture. Contributions should follow
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

The SDK source is available under the [MIT License](LICENSE). MyPOS Connect is a
third-party service; this license does not grant rights to its trademarks or API
data.
