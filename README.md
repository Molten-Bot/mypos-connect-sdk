# MyPOS Connect TypeScript SDK

An unofficial, server-side TypeScript client for the MyPOS Connect API v2.

The SDK requires Node.js 22 or newer, uses the standard Fetch API, and ships
both ESM and CommonJS entry points. It preserves the API's path, query, and JSON
property casing exactly as documented.

## Install

```sh
npm install @molten-ai/mypos-connect-sdk
```

## Use a bearer token

Most operations require a JWT bearer token. The API documentation says tokens
are valid for 120 minutes; this SDK does not refresh them automatically.

```ts
import MyPOSConnect from '@molten-ai/mypos-connect-sdk';

const client = new MyPOSConnect({
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
});

const products = await client.products.list({
  liPageSize: 100,
  liPage: 1,
  filt_active_bool: true,
});
console.log(products);
```

The default API URL is `https://api.myposconnect.com/api/v2`. Override it when
using another endpoint:

```ts
import { MyPOSConnect } from '@molten-ai/mypos-connect-sdk';

const client = new MyPOSConnect({
  baseURL: 'https://example.test/api/v2',
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
  fetch: globalThis.fetch,
});
```

`fetch` is optional and is useful for supported runtime adapters and tests.

## Obtain a token with Basic authentication

Token creation uses the API user email and password as HTTP Basic credentials.
The available API documentation does not define the token response shape, so
the result is intentionally typed as `unknown`. Validate it against the response
contract supplied for your account before extracting and storing the JWT.

```ts
import { MyPOSConnect } from '@molten-ai/mypos-connect-sdk';

const auth = new MyPOSConnect({
  username: process.env.MYPOS_CONNECT_USERNAME,
  password: process.env.MYPOS_CONNECT_PASSWORD,
});

const tokenResponse: unknown = await auth.auth.tokens.create();
// Validate tokenResponse before extracting its bearer token.
```

Basic credentials are used only by `auth.tokens.create()`. An `accessToken` is
required for every other operation. Missing required credentials fail before a
network request is made.

> Keep API-user credentials and bearer tokens on the server. Do not expose them
> in browser bundles, public environment variables, logs, or client-side code.

## Resources

Methods return the successful response body directly. Path, query, and body
fields are flattened into one generated typed parameter object—for example,
`products.retrieve({ ProductCode: 'SKU-001' })`. Optional per-request settings
support custom headers and an `AbortSignal`. The SDK does not transform property
names, retry requests, refresh tokens, validate response bodies at runtime, or
automatically paginate results.

| Method | API operation |
| --- | --- |
| `auth.tokens.create()` | Obtain a short-lived JWT with Basic authentication. |
| `products.list()` | List general product data from `/naproducts`. |
| `products.retrieve()` | Retrieve general details for one product. |
| `products.listChanged()` | List general products changed since a date. |
| `products.listAlternate()` | List products from the documented `/products` endpoint. |
| `products.storeData.listChanged()` | List changed store price, cost, quantity, and tax data. |
| `products.storeData.retrieve()` | Retrieve store price and quantity for one product. |
| `products.storeData.listChangedWithOnOrder()` | List changed store data including quantity on order. |
| `products.storeData.retrieveWithOnOrder()` | Retrieve store data including quantity on order for one product. |
| `products.serialNumbers.retrieveStatus()` | Retrieve a product serial-number status. |
| `customers.create()` | Create a local customer. |
| `customers.retrieve()` | Retrieve a local customer by the configured lookup value. |
| `customers.update()` | Update a local customer. |
| `customers.global.retrieve()` | Retrieve a global customer by email address. |
| `customers.global.update()` | Update supported global-customer fields. |
| `stores.list()` | List stores, with optional pagination. |
| `inventory.commitments.create()` | Reserve inventory or reverse individual committed quantities. |
| `inventory.commitments.retrieve()` | Retrieve committed quantities for an order. |
| `rewards.commitments.create()` | Commit or reverse customer reward points. |
| `sales.create()` | Insert a sale or cancel all committed quantities for an order. |

Generated types for operation inputs, verified response bodies, and API models
are exported from the package. Refer to your editor's TypeScript hints for each
method's exact path, query, and body fields.

## Errors and incomplete response schemas

Non-2xx responses throw `MyPOSConnectError`. The error contains the HTTP
`status`, response `headers`, and parsed response `body` when available.

```ts
import {
  MyPOSConnect,
  MyPOSConnectError,
} from '@molten-ai/mypos-connect-sdk';

const client = new MyPOSConnect({
  accessToken: process.env.MYPOS_CONNECT_ACCESS_TOKEN,
});

try {
  await client.stores.list();
} catch (error: unknown) {
  if (error instanceof MyPOSConnectError) {
    console.error('MyPOS Connect request failed', error.status);
  }
  throw error;
}
```

`openapi.yaml` is intentionally conservative where the available MyPOS Connect
material omits a response schema. Those success bodies—and all documented error
bodies—remain `unknown` instead of claiming an unverified structure. This
currently includes token creation, customer mutations, global-customer updates,
inventory commitment writes and reads, reward commitments, and sales. Validate
such values in application code before using them.

## API contract

[`openapi.yaml`](openapi.yaml) is the executable source of truth for wire
behavior and generated types. [`sdk.md`](sdk.md) is the supporting MyPOS Connect
API guide. If they conflict, `openapi.yaml` controls the SDK.

## License and status

The SDK implementation is available under the [MIT License](LICENSE). MyPOS
Connect is a third-party service: this project is unofficial, does not operate
or own that API, and the MIT license does not grant rights to the service or its
documentation.
