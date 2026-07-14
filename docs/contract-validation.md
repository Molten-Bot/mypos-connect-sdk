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

## Evidence required before a stable release

Provide sanitized request/response captures or sandbox results for every item
below. Fixtures must contain invented customers, products, orders, emails, and
credentials.

- `POST /auth/token`: Basic-auth behavior, request body, success body, expiry
  representation, and failed-auth response.
- Product and store-product lists: page termination, complete-field consistency,
  empty results, and confirmation that the array response and per-item
  `liTotalCount` shown in the samples are current for every list variant.
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
- Optional capabilities: behavior when serial numbers or global customers are not
  enabled for a database.

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

- Split create/update parameter schemas from response schemas.
- Mark observed required properties and `readOnly`/`writeOnly` fields.
- Replace array-or-envelope unions and scalar-or-object unions with the observed
  shape.
- Configure page-number pagination only after its termination behavior is known.
- Normalize dates and numeric formats in the schema without transforming JSON at
  runtime.
- Keep `additionalProperties: true` only for intentionally extensible or dynamic
  objects.
- Add observed error statuses and headers while retaining a safe fallback error.
- Keep automatic retries disabled for side-effecting operations unless the API
  documents idempotency.

## Release criteria

A `0.1.0` bootstrap release may be created only after the evidence above has been
reviewed and all generated tests pass. A stable `1.0.0` additionally requires:

- every one of the 20 operations is represented by a deterministic SDK method;
- all four coverage metrics are 100% for shipped runtime code;
- package and framework consumer tests pass from packed tarballs;
- the public OpenAPI document and MCP documentation search match the release;
- no unresolved Stainless diagnostics or known contract guesses remain; and
- npm trusted publishing produces provenance for both packages.
