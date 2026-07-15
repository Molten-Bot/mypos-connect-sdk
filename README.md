# Unofficial MyPOS Connect TypeScript SDK

This repository maintains an independently authored OpenAPI description and the
Stainless configuration used to generate a TypeScript client for the third-party
MyPOS Connect API. It is not an official MyPOS Connect repository, does not
operate the API, and does not claim ownership of the service or its specification.

The generated packages are intentionally **not published yet**. The API notes and
sample-call export establish much of the request surface, but still omit important
authentication, success-response, and error details. The first public release is
therefore gated on sanitized API fixtures or sandbox responses. See
[Contract validation](docs/contract-validation.md) for the outstanding evidence.

## Generated artifacts

Once the release gate is satisfied, Stainless will maintain these artifacts from
this repository:

- `@molten-ai/mypos-connect-sdk` — the server-side TypeScript SDK.
- `@molten-ai/mypos-connect-mcp` — a documentation-search-only MCP server for
  coding agents.
- `Molten-Bot/mypos-connect-typescript` — the generated SDK production
  repository.
- A stable, public copy of the reviewed OpenAPI description and model-optimized SDK
  documentation.

The API description is available at [openapi.yaml](openapi.yaml). The extracted
upstream API notes are retained in [sdk.md](sdk.md), and the supplied v1.3 sample
calls/results are retained in [testing.md](testing.md), for provenance. Newer
documentation and verified API behavior take precedence over older examples;
`openapi.yaml` records the reviewed result.

## Installation

After the contract gate clears and the first release is published, install the
server SDK with your package manager:

```sh
pnpm add @molten-ai/mypos-connect-sdk
# or: npm install @molten-ai/mypos-connect-sdk
```

The package requires Node.js 22 or newer. It ships ESM and CommonJS entry points,
uses the runtime's native `fetch`, and does not install a model-validation or JSON
transformation runtime.

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

Passing a constructor value wins over its environment variable. Omitting a value
allows the SDK to read the environment; omitting `baseURL` as well selects the
documented production URL. Credentials have no default. Before release, the
generated-client tests must confirm that a missing endpoint credential fails
before any network request instead of sending an empty authorization header.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

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

Token acquisition uses HTTP Basic authentication. The SDK does not exchange those
credentials into managed session state or refresh the 120-minute JWT
automatically; downstream code owns that lifecycle. Use a dedicated, short-lived
auth client instead of retaining the username/password client in application
state.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

function requireToken(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'token' in value &&
    typeof value.token === 'string'
  ) {
    return value.token;
  }
  throw new Error('MyPOS Connect returned an unexpected token payload');
}

async function obtainAccessToken(): Promise<string> {
  const authClient = new MyPOSConnect({
    baseURL: process.env.MYPOS_CONNECT_BASE_URL,
    username: process.env.MYPOS_CONNECT_USERNAME,
    password: process.env.MYPOS_CONNECT_PASSWORD,
  });

  return requireToken(await authClient.auth.tokens.create());
}

const token = await obtainAccessToken();

const client = new MyPOSConnect({
  baseURL: process.env.MYPOS_CONNECT_BASE_URL,
  accessToken: token,
});
```

The exact token payload and response must be confirmed before release. The small
guard above keeps that uncertainty explicit; it can be removed once a sanitized
token response establishes the generated response type.

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
the API's idempotency behavior is documented. Timeouts, retries, and cancellation
remain configurable per request, while a custom `fetch` implementation can be
injected into the client for testing or a supported runtime adapter.

The SDK keeps the API's property names exactly as they appear on the wire. That
includes mixed conventions such as `liPageSize`, `filt_active_bool`, and `Sales`;
there is no hidden casing conversion in either direction.

## Pagination

MyPOS Connect uses one-based `liPage` and `liPageSize` query parameters. Sample
responses put the total row count in each item's `liTotalCount` field. Until a
sandbox capture confirms empty-page and concurrent-update behavior, pagination is
explicit rather than an automatic iterator:

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

const client = new MyPOSConnect();

async function* listAllProducts(pageSize = 100) {
  for (let liPage = 1; ; liPage += 1) {
    const products = await client.products.list({ liPage, liPageSize: pageSize });
    if (products.length === 0) return;

    yield* products;

    const total = products[0]?.liTotalCount;
    const isLastPage =
      total === undefined ? products.length < pageSize : liPage * pageSize >= total;
    if (isLastPage) return;
  }
}

for await (const product of listAllProducts()) {
  console.log(product.productCode);
}
```

Always choose a stable `sSortKey` while walking a changing product catalog. If an
application needs snapshot semantics, coordinate that behavior with the service
owner rather than assuming page-number pagination provides it.

## Errors, retries, timeouts, and cancellation

Non-2xx responses become typed `APIError` instances containing the HTTP status,
response headers, and parsed response body when available. Connection failures
and timeouts use the generated SDK's connection error subclasses. Do not log the
client, request headers, token body, or raw error object without applying your own
redaction policy.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

const client = new MyPOSConnect({
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
});

const abortController = new AbortController();

try {
  await client.products.retrieve('PRODUCT / 42', {
    maxRetries: 1,
    signal: abortController.signal,
    timeout: 10_000,
  });
} catch (error: unknown) {
  if (error instanceof MyPOSConnect.APIError) {
    console.error('MyPOS Connect request failed', {
      requestID: error.requestID,
      status: error.status,
    });
  }
  throw error;
}
```

GET methods retry twice by default. A per-request override may reduce that count;
increase it only after considering latency and upstream rate limits. Mutations use
zero retries because the API has not yet documented idempotency keys or duplicate
request handling.

## Framework usage

Call the SDK from a server-only boundary such as a Next.js Route Handler, server
action, worker, or backend service. A browser should call that boundary instead of
calling MyPOS Connect directly.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

export async function GET(): Promise<Response> {
  const client = new MyPOSConnect({
    accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
  });

  const stores = await client.stores.list({ liPageSize: 100, liPage: 1 });
  return Response.json(stores);
}
```

For a Next.js Edge Route Handler, add `export const runtime = 'edge'` and keep the
same handler body. The client uses Web Platform primitives, so it does not require
Node.js compatibility mode. Keep the credential in the platform's server-side
secret store.

Tree-shakable imports let an edge or server bundle include only the resources it
uses:

```ts
import { createClient } from '@molten-ai/mypos-connect-sdk/tree-shakable';
import { StoresResource } from '@molten-ai/mypos-connect-sdk/resources/stores';

const client = createClient({
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
}).withResources({ stores: StoresResource });

const stores = await client.stores.list({ liPageSize: 100, liPage: 1 });
```

## Agent discovery

Agents will be able to install `@molten-ai/mypos-connect-mcp` and call its SDK
documentation-search tool. API code execution is disabled, so the MCP package
cannot create customers, reserve inventory, or submit sales. The MCP instructions
and search index are generated from the same `openapi.yaml` and `stainless.yml` as
the SDK. The release-pinned hosted URL is added during the first custom-code pass,
after Stainless assigns it.

After publication, stdio-based MCP clients can use this configuration without API
credentials:

```json
{
  "mcpServers": {
    "mypos-connect": {
      "command": "npx",
      "args": ["-y", "@molten-ai/mypos-connect-mcp@latest"]
    }
  }
}
```

Applications that only need machine-readable discovery can opt into the small
discovery entry point instead of importing the client runtime:

```ts
import { OPENAPI_SPEC_URL } from '@molten-ai/mypos-connect-sdk/discovery';

const response = await fetch(OPENAPI_SPEC_URL);
if (!response.ok) throw new Error(`OpenAPI discovery failed: ${response.status}`);
const openapi = await response.text();
```

`OPENAPI_SPEC_URL` will be fixed to Stainless's public copy of the exact release
contract during the first generated-repository custom-code pass. The source copy
remains available at this repository's `openapi.yaml` in the meantime.

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

Validation includes OpenAPI linting, contract invariants, and documentation
checks. Pull requests that change the contract also run a breaking-change
comparison against `main`. After the Stainless project and GitHub App are
connected, setting `STAINLESS_ENABLED=true` activates the official preview build
on pull requests and pushes.

Stainless owns generated runtime code in the production SDK repository. Changes
to generated behavior should begin in `openapi.yaml` or `stainless.yml`; custom
SDK tests and prose should be isolated as Stainless custom-code commits.

The TypeScript blocks in this pre-release README are compiled against a declaration
of the intended public surface as part of `pnpm validate`. Once the generated
repository exists, its CI compiles the examples against the packed SDK itself.
This guide is also the baseline for its custom README commit; generated API
reference tables remain generator-owned.

## Release flow

After the Stainless project and GitHub App are activated:

1. A pull request validates the contract and previews the generated SDK.
2. Merging to this repository's `main` updates Stainless.
3. Stainless updates the generated repository's `next` branch and release PR.
4. Generated lint, type, test, 100% coverage, package, and consumer checks pass.
5. After contract evidence is complete, a maintainer bootstraps npm with a
   validated `0.1.0` release and enables trusted OIDC publishing.
6. Stable `1.0.0` remains blocked until auth, pagination, sales, and error fixtures
   are verified.

This source repository is private to npm and has no npm-publish workflow. Only
the generated package from `Molten-Bot/mypos-connect-typescript` may be published
as `@molten-ai/mypos-connect-sdk`.

The exact hosted activation, custom-code, trusted-publishing, and protection
sequence is documented in the [SDK launch runbook](docs/launch-runbook.md).

Versions follow semantic versioning. Until `1.0.0`, a minor release may contain a
breaking correction to an inferred contract; release notes will call it out. At
and after `1.0.0`, removals, required-field additions, resource renames, and type
narrowing require a major release. Additive endpoints and optional fields are
minor releases, while documentation and compatible corrections are patches.

## Support and security

Use GitHub issues for SDK or contract problems and follow
[SECURITY.md](SECURITY.md) for private vulnerability reports. API-account
provisioning and production-service incidents should be directed to the MyPOS
Connect service owner. Never include credentials, bearer tokens, customer data,
or real order data in an issue or fixture. Contributions should follow
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

Original material in this repository is available under the
[MIT License](LICENSE). MyPOS Connect is a third-party service; that license does
not license the service, the provider's documentation, trademarks, API behavior,
or API data. The `info` object in `openapi.yaml` intentionally makes no API-license
assertion.
