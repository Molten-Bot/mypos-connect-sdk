# Contract validation and release gate

`openapi.yaml` was derived from the MyPOS Connect API V2 document version 1.4 and
the v1.3 sample-call export in [`testing.md`](../testing.md). The sample material
provides concrete request bodies and selected GET results, but not authentication,
mutation success responses, or representative failures. Some schemas therefore
remain the safest known envelope rather than a verified production wire contract.

When sources disagree, the newer v1.4 documentation wins unless a sanitized live
capture or an API-provider clarification establishes current behavior. For
example, the v1.3 and v1.4 documents describe opposite signs for committing versus
reversing reward points; the contract retains the v1.4 semantics pending live
confirmation.

## What the sample export establishes

The v1.3 export is sufficient to model the observed lower-camel response fields
for general products, store products, customers, global customers, stores, and
serial-number status. It also establishes the request wrappers `Customers`,
`GlobalCustomers`, `OrderedQuantities`, `CommittedPoints`, and `Sales`; the known
sale, refund, cancellation, tax, and singular `Discount` structures; and the fact
that many request decimals are JSON strings while read-side quantities and prices
are numbers.

Those observations are encoded without property-name conversion. Unobserved
response values remain unconstrained, and related operations without their own
capture are explicitly treated as inferences rather than new evidence.

## Evidence required before a stable release

Provide sanitized request/response captures or sandbox results for every item
below. Fixtures must contain invented customers, products, orders, emails, and
credentials.

- `POST /auth/token`: Basic-auth behavior, request body, success body, expiry
  representation, and failed-auth response.
- Product and store-product lists: page termination, empty results, and
  confirmation that the direct array and per-item `liTotalCount` shown in the
  samples apply to `/products`, changed-product calls, and every store-product
  list variant. The exact JSON name and type of the documented cost field also
  remain unknown.
- Customer create/get/update and global customers: required and read-only fields,
  not-found behavior, and validation failures.
- Store list and serial-number status: confirmation that the array envelopes and
  serial status fields shown in v1.3 remain current.
- Quantity and point commitments: complete request/response fields, sign
  semantics, validation failures, and duplicate-request behavior.
- Sales: complete bill-to/ship-to, item, tax, discount, totals, reward-point, and
  cancellation payloads and responses.
- Cross-cutting errors: status codes, response bodies, request identifiers,
  rate-limit headers, retry guidance, timeouts, and server failures.
- Representation rules: decimal precision, currency, rounding, UTC semantics for
  timestamps that omit an offset, and non-null types for values shown only as
  `null` in the export.
- Optional capabilities: behavior when serial numbers or global customers are not
  enabled for a database.

The older spreadsheet also shows global-customer URL variants that omit `/v2` or
use a `TRSglobalcustomers` prefix. The newer v1.4 path remains authoritative until
the provider confirms whether those variants are obsolete.

## How to capture fixtures

1. Use a sandbox or test database; never probe production with destructive calls.
2. Replace credentials, JWTs, names, emails, addresses, product codes, store
   codes, order numbers, and comments with deterministic synthetic values.
3. Preserve JSON types, field names, missing/null fields, headers relevant to
   errors or limits, and HTTP status codes.
4. Store one request and response per scenario in the generated SDK's test fixture
   directory.
5. Add a short provenance note containing the API document version and capture
   date, but no tenant or person identifiers.

## Contract changes after evidence arrives

- Replace `UnverifiedJSONResponse` and the unconstrained `Error` schema with the
  observed token, mutation, committed-quantity, and failure payloads.
- Complete customer/global-customer writable fields, casing, requirements, and
  the truncated global-customer response wrapper.
- Narrow fields currently unconstrained because every sample value is `null`.
- Reconcile inferred list variants with their own captures and close response
  objects only when custom/dynamic fields are ruled out.
- Configure page-number pagination only after its termination behavior is known.
- Add verified date, timezone, money, precision, and rounding formats without
  transforming JSON at runtime.
- Add observed response statuses, content types, request IDs, and rate-limit
  headers while retaining a safe fallback error.
- Keep automatic retries disabled for side-effecting operations unless the API
  documents idempotency and duplicate-request behavior.

## Release criteria

A `0.1.0` bootstrap release may be created only after the evidence above has been
reviewed and all generated tests pass. A stable `1.0.0` additionally requires:

- every one of the 20 operations is represented by a deterministic SDK method;
- all four coverage metrics are 100% for shipped runtime code;
- package and framework consumer tests pass from packed tarballs;
- the public OpenAPI document and MCP documentation search match the release;
- no unresolved Stainless diagnostics or known contract guesses remain; and
- npm trusted publishing produces provenance for both packages.
