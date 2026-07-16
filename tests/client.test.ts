import { Buffer } from 'node:buffer';

import { describe, expect, it, vi } from 'vitest';

import MyPOSConnect, { MyPOSConnectError } from '../src/index.js';

const DEFAULT_ROOT = 'https://api.myposconnect.com/api/v2';
const USERNAME = 'api-user@example.com';
const PASSWORD = 'p@ss:word';
const ACCESS_TOKEN = 'jwt-token';

interface CapturedRequest {
  body: string;
  request: Request;
}

type Responder = Response | ((request: Request) => Promise<Response> | Response);

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return new Response(JSON.stringify(body), { ...init, headers });
}

function createFakeFetch(responders: Responder[] = []) {
  const requests: CapturedRequest[] = [];
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const request = new Request(input, init);
      const body = await request.clone().text();
      requests.push({ body, request });

      const responder = responders.shift();
      if (!responder) {
        return jsonResponse({ ok: true });
      }

      return typeof responder === 'function' ? responder(request) : responder;
    },
  );

  return {
    fetch: fetchMock as unknown as typeof globalThis.fetch,
    fetchMock,
    requests,
  };
}

function createClient(fetch: typeof globalThis.fetch): MyPOSConnect {
  return new MyPOSConnect({
    accessToken: ACCESS_TOKEN,
    fetch,
    password: PASSWORD,
    username: USERNAME,
  });
}

interface OperationCase {
  auth: 'basic' | 'bearer';
  body?: unknown;
  invoke: (client: MyPOSConnect) => Promise<unknown>;
  method: string;
  name: string;
  path: string;
  query?: Record<string, string>;
}

const customerCreateBody = {
  Customers: [
    {
      allowDataShare: false,
      customerName: 'Analytical Engines Ltd',
      discountPercent: 12.5,
      emailAddress: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    },
  ],
};

const customerUpdateBody = {
  Customers: [{ LastName: 'Lovelace', LoyaltyTier: 0, Region: 'BC' }],
};

const globalCustomerUpdateBody = {
  GlobalCustomers: [
    {
      PhoneNumber: '+1 604 555 0123',
      Region: 'BC',
      firstName: 'Ada',
      lastName: 'Lovelace',
    },
  ],
};

const commitmentBody = {
  OrderedQuantities: [
    {
      Items: [
        {
          LineNumber: '10',
          ProductCode: 'SKU-1',
          Quantity: '-2.50',
        },
      ],
      OrderNumber: 'ORDER-100',
      StoreCode: 'MAIN',
    },
  ],
};

const rewardsBody = {
  CommittedPoints: [
    {
      EmailAddress: 'ada@example.com',
      OrderNumber: 'ORDER-100',
      Points: -125,
      StoreCode: 'MAIN',
    },
  ],
};

const saleBody = {
  Sales: [
    {
      CustomerBillTo: {
        EmailAddress: 'ada@example.com',
        FirstName: 'Ada',
        LastName: 'Lovelace',
      },
      Discount: { Amount: 5.25, Name: 'Launch offer' },
      Items: [
        {
          Description: 'Mechanical keyboard',
          LineNumber: '10',
          ProductCode: 'SKU-1',
          Quantity: '1.00',
          TaxAmount: '5.9500',
          TaxName: 'GST',
          TaxRate: '0.0500',
          UnitPrice: '119.00',
        },
      ],
      OrderNumber: 'ORDER-100',
      SaleDate: '2026-07-16 12:30',
      SaleTotal: '119.70',
      StoreCode: 'MAIN',
      Subtotal: '119.00',
      TaxTotal: '5.95',
      Taxes: [{ TaxName: 'GST', TaxRate: '0.0500', TaxTotal: '5.95' }],
    },
  ],
};

const operationCases: OperationCase[] = [
  {
    auth: 'basic',
    invoke: (client) => client.auth.tokens.create(),
    method: 'POST',
    name: 'auth.tokens.create',
    path: '/api/v2/auth/token',
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.list({
        filt_active_bool: false,
        filt_stylecode_str: 'A&B / blue',
        filt_webproduct_bool: true,
        liPage: 2,
        liPageSize: 50,
        sFieldList: 'productCode,shortDescription',
        sSortKey: 'productCode ASC',
      }),
    method: 'GET',
    name: 'products.list',
    path: '/api/v2/naproducts',
    query: {
      filt_active_bool: 'false',
      filt_stylecode_str: 'A&B / blue',
      filt_webproduct_bool: 'true',
      liPage: '2',
      liPageSize: '50',
      sFieldList: 'productCode,shortDescription',
      sSortKey: 'productCode ASC',
    },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.retrieve({
        ProductCode: 'SKU-1',
        sFieldList: 'productCode,buttonText',
      }),
    method: 'GET',
    name: 'products.retrieve',
    path: '/api/v2/naproducts/SKU-1',
    query: { sFieldList: 'productCode,buttonText' },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.listChanged({
        LastEditDate: '2026-07-16T12:30:45',
        liPage: 3,
        liPageSize: 25,
        sFieldList: 'productCode,lastEditDate',
        sSortKey: 'lastEditDate DESC',
      }),
    method: 'GET',
    name: 'products.listChanged',
    path: '/api/v2/naproducts/~2026-07-16T12%3A30%3A45',
    query: {
      liPage: '3',
      liPageSize: '25',
      sFieldList: 'productCode,lastEditDate',
      sSortKey: 'lastEditDate DESC',
    },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.listAlternate({
        filt_active_bool: true,
        filt_stylecode_str: 'STYLE-1',
        filt_webproduct_bool: false,
        liPage: 1,
        liPageSize: 10,
        sFieldList: 'productCode,active',
        sSortKey: 'productCode DESC',
      }),
    method: 'GET',
    name: 'products.listAlternate',
    path: '/api/v2/products',
    query: {
      filt_active_bool: 'true',
      filt_stylecode_str: 'STYLE-1',
      filt_webproduct_bool: 'false',
      liPage: '1',
      liPageSize: '10',
      sFieldList: 'productCode,active',
      sSortKey: 'productCode DESC',
    },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.storeData.listChanged({
        LastEditDate: '2026-07-16T12:30:45',
        StoreCode: 'MAIN',
        liPage: 4,
        liPageSize: 20,
      }),
    method: 'GET',
    name: 'products.storeData.listChanged',
    path: '/api/v2/productspq/~MAIN~2026-07-16T12%3A30%3A45',
    query: { liPage: '4', liPageSize: '20' },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.storeData.retrieve({ ProductCode: 'SKU-1', StoreCode: 'MAIN' }),
    method: 'GET',
    name: 'products.storeData.retrieve',
    path: '/api/v2/productspq/MAIN~SKU-1',
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.storeData.listChangedWithOnOrder({
        LastEditDate: '2026-07-16T12:30:45',
        StoreCode: 'MAIN',
        liPage: 5,
        liPageSize: 15,
      }),
    method: 'GET',
    name: 'products.storeData.listChangedWithOnOrder',
    path: '/api/v2/productspqo/~MAIN~2026-07-16T12%3A30%3A45',
    query: { liPage: '5', liPageSize: '15' },
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.storeData.retrieveWithOnOrder({
        ProductCode: 'SKU-1',
        StoreCode: 'MAIN',
      }),
    method: 'GET',
    name: 'products.storeData.retrieveWithOnOrder',
    path: '/api/v2/productspqo/MAIN~SKU-1',
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.products.serialNumbers.retrieveStatus({
        ProductCode: 'SKU-1',
        SerialNumber: 'SERIAL-9',
        StoreCode: 'MAIN',
      }),
    method: 'GET',
    name: 'products.serialNumbers.retrieveStatus',
    path: '/api/v2/ProductSerial/MAIN~SKU-1~SERIAL-9',
  },
  {
    auth: 'bearer',
    body: customerCreateBody,
    invoke: (client) => client.customers.create(customerCreateBody),
    method: 'POST',
    name: 'customers.create',
    path: '/api/v2/naCustomers',
  },
  {
    auth: 'bearer',
    invoke: (client) => client.customers.retrieve({ CustomerCode: 'CUST-1' }),
    method: 'GET',
    name: 'customers.retrieve',
    path: '/api/v2/naCustomers/CUST-1',
  },
  {
    auth: 'bearer',
    body: customerUpdateBody,
    invoke: (client) =>
      client.customers.update({ CustomerCode: 'CUST-1', ...customerUpdateBody }),
    method: 'PUT',
    name: 'customers.update',
    path: '/api/v2/naCustomers/CUST-1',
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.customers.global.retrieve({ EmailAddress: 'ada@example.com' }),
    method: 'GET',
    name: 'customers.global.retrieve',
    path: '/api/v2/globalcustomers/ada%40example.com',
  },
  {
    auth: 'bearer',
    body: globalCustomerUpdateBody,
    invoke: (client) =>
      client.customers.global.update({
        EmailAddress: 'ada@example.com',
        ...globalCustomerUpdateBody,
      }),
    method: 'PUT',
    name: 'customers.global.update',
    path: '/api/v2/globalcustomers/ada%40example.com',
  },
  {
    auth: 'bearer',
    invoke: (client) => client.stores.list({ liPage: 2, liPageSize: 100 }),
    method: 'GET',
    name: 'stores.list',
    path: '/api/v2/Stores',
    query: { liPage: '2', liPageSize: '100' },
  },
  {
    auth: 'bearer',
    body: commitmentBody,
    invoke: (client) => client.inventory.commitments.create(commitmentBody),
    method: 'POST',
    name: 'inventory.commitments.create',
    path: '/api/v2/CommitQty',
  },
  {
    auth: 'bearer',
    invoke: (client) =>
      client.inventory.commitments.retrieve({ OrderNumber: 'ORDER-100' }),
    method: 'GET',
    name: 'inventory.commitments.retrieve',
    path: '/api/v2/CommitQty/ORDER-100',
  },
  {
    auth: 'bearer',
    body: rewardsBody,
    invoke: (client) => client.rewards.commitments.create(rewardsBody),
    method: 'POST',
    name: 'rewards.commitments.create',
    path: '/api/v2/CommitPts',
  },
  {
    auth: 'bearer',
    body: saleBody,
    invoke: (client) => client.sales.create(saleBody),
    method: 'POST',
    name: 'sales.create',
    path: '/api/v2/Sale',
  },
];

describe('operation wire contract', () => {
  it.each(operationCases)(
    '$name sends the documented request and returns its JSON body',
    async (testCase) => {
      const successBody = { operation: testCase.name, wire_case: 'preserved' };
      const fake = createFakeFetch([jsonResponse(successBody)]);
      const result = await testCase.invoke(createClient(fake.fetch));

      expect(result).toEqual(successBody);
      expect(fake.fetchMock).toHaveBeenCalledTimes(1);

      const captured = fake.requests[0];
      expect(captured).toBeDefined();
      if (!captured) {
        throw new Error('Expected one captured request');
      }

      const url = new URL(captured.request.url);
      expect(url.origin).toBe(new URL(DEFAULT_ROOT).origin);
      expect(url.pathname).toBe(testCase.path);
      expect(captured.request.method).toBe(testCase.method);
      expect(Object.fromEntries(url.searchParams)).toEqual(testCase.query ?? {});

      const expectedAuthorization =
        testCase.auth === 'basic'
          ? `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`
          : `Bearer ${ACCESS_TOKEN}`;
      expect(captured.request.headers.get('authorization')).toBe(expectedAuthorization);

      if ('body' in testCase) {
        expect(captured.request.headers.get('content-type')).toContain('application/json');
        expect(JSON.parse(captured.body)).toEqual(testCase.body);
      } else {
        expect(captured.body).toBe('');
        expect(captured.request.headers.has('content-type')).toBe(false);
      }
    },
  );

  it('percent-encodes path parameters while retaining literal route tildes', async () => {
    const fake = createFakeFetch([jsonResponse([{ serialNumberStatus: 0 }])]);
    const client = createClient(fake.fetch);

    await client.products.serialNumbers.retrieveStatus({
      ProductCode: 'SKU @+:#',
      SerialNumber: 'SN/1+2',
      StoreCode: 'North/West',
    });

    expect(new URL(fake.requests[0]?.request.url ?? '').pathname).toBe(
      '/api/v2/ProductSerial/North%2FWest~SKU%20%40%2B%3A%23~SN%2F1%2B2',
    );
  });

  it('encodes query values, preserves false, and omits undefined values', async () => {
    const fake = createFakeFetch([jsonResponse([])]);
    const client = createClient(fake.fetch);

    await client.products.list({
      filt_active_bool: false,
      filt_stylecode_str: 'A&B / blue',
      liPage: undefined,
      sFieldList: 'productCode,shortDescription',
    });

    const url = new URL(fake.requests[0]?.request.url ?? '');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      filt_active_bool: 'false',
      filt_stylecode_str: 'A&B / blue',
      sFieldList: 'productCode,shortDescription',
    });
    expect(url.search).toContain('filt_stylecode_str=A%26B%20%2F%20blue');
    expect(url.search).toContain('sFieldList=productCode%2CshortDescription');
    expect(url.searchParams.has('liPage')).toBe(false);
  });
});

describe('configuration and authentication', () => {
  it.each([
    {},
    { username: USERNAME },
    { password: PASSWORD },
    { accessToken: ACCESS_TOKEN },
  ])('requires both Basic credentials before token creation (%o)', async (credentials) => {
    const fake = createFakeFetch();
    const client = new MyPOSConnect({ fetch: fake.fetch, ...credentials });

    await expect(client.auth.tokens.create()).rejects.toThrow(
      'Basic authentication requires both username and password',
    );
    expect(fake.fetchMock).not.toHaveBeenCalled();
  });

  it('requires a bearer token before non-token requests and never falls back to Basic', async () => {
    const fake = createFakeFetch();
    const client = new MyPOSConnect({
      fetch: fake.fetch,
      password: PASSWORD,
      username: USERNAME,
    });

    await expect(client.products.list()).rejects.toThrow(
      'bearer authentication requires accessToken',
    );
    expect(fake.fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [
      'token',
      (client: MyPOSConnect) =>
        client.auth.tokens.create({ headers: { Authorization: 'Bearer override' } }),
    ],
    [
      'bearer',
      (client: MyPOSConnect) =>
        client.products.list({}, { headers: { Authorization: 'Bearer override' } }),
    ],
  ])('rejects per-request Authorization overrides for %s operations', async (_name, invoke) => {
    const fake = createFakeFetch();
    const client = createClient(fake.fetch);

    expect(() => invoke(client)).toThrow('instead of overriding Authorization');
    expect(fake.fetchMock).not.toHaveBeenCalled();
  });

  it('uses a normalized custom base URL including its path prefix', async () => {
    const fake = createFakeFetch([jsonResponse([])]);
    const client = new MyPOSConnect({
      accessToken: ACCESS_TOKEN,
      baseURL: 'https://sandbox.example.test/tenant/root///',
      fetch: fake.fetch,
    });

    await client.stores.list();

    expect(fake.requests[0]?.request.url).toBe(
      'https://sandbox.example.test/tenant/root/Stores',
    );
  });

  it('rejects an empty base URL during construction', () => {
    const fake = createFakeFetch();
    expect(() => new MyPOSConnect({ baseURL: '///', fetch: fake.fetch })).toThrow(
      'baseURL must not be empty',
    );
    expect(fake.fetchMock).not.toHaveBeenCalled();
  });
});

describe('request options and failures', () => {
  it('forwards custom headers and an AbortSignal', async () => {
    const fake = createFakeFetch([jsonResponse([])]);
    const client = createClient(fake.fetch);
    const controller = new AbortController();

    await client.customers.create(
      customerCreateBody,
      {
        headers: { 'X-Correlation-ID': 'correlation-123' },
        signal: controller.signal,
      },
    );

    const request = fake.requests[0]?.request;
    expect(request?.headers.get('x-correlation-id')).toBe('correlation-123');
    expect(request?.signal.aborted).toBe(false);

    controller.abort();
    expect(request?.signal.aborted).toBe(true);
  });

  it('passes cancellation failures through without HTTP wrapping', async () => {
    const abortError = new DOMException('request cancelled', 'AbortError');
    const fake = createFakeFetch([
      (request) =>
        new Promise<Response>((_resolve, reject) => {
          if (request.signal.aborted) {
            reject(request.signal.reason);
            return;
          }
          request.signal.addEventListener('abort', () => reject(request.signal.reason), {
            once: true,
          });
        }),
    ]);
    const client = createClient(fake.fetch);
    const controller = new AbortController();

    const pending = client.products.list({}, { signal: controller.signal });
    await vi.waitFor(() => expect(fake.fetchMock).toHaveBeenCalledTimes(1));
    controller.abort(abortError);

    await expect(pending).rejects.toBe(abortError);
    expect(fake.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws MyPOSConnectError with a parsed JSON body for HTTP errors', async () => {
    const errorBody = { ErrorCode: 'INVALID_FILTER', Message: 'Filter was rejected' };
    const fake = createFakeFetch([
      jsonResponse(errorBody, {
        headers: { 'X-Request-ID': 'request-422' },
        status: 422,
        statusText: 'Unprocessable Entity',
      }),
    ]);
    const client = createClient(fake.fetch);

    let caught: unknown;
    try {
      await client.products.list();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MyPOSConnectError);
    if (!(caught instanceof MyPOSConnectError)) {
      throw new Error('Expected MyPOSConnectError');
    }
    expect(caught.name).toBe('MyPOSConnectError');
    expect(caught.message).toContain('422 Unprocessable Entity');
    expect(caught.status).toBe(422);
    expect(caught.headers.get('x-request-id')).toBe('request-422');
    expect(caught.body).toEqual(errorBody);
    expect(caught.request?.method).toBe('GET');
    expect(caught.request?.url).toBe(`${DEFAULT_ROOT}/naproducts`);
    expect(fake.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws MyPOSConnectError with an unmodified text body and does not retry', async () => {
    const fake = createFakeFetch([
      new Response('temporarily unavailable', {
        headers: { 'content-type': 'text/plain', 'retry-after': '60' },
        status: 503,
        statusText: 'Service Unavailable',
      }),
    ]);
    const client = createClient(fake.fetch);

    let caught: unknown;
    try {
      await client.stores.list();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(MyPOSConnectError);
    if (!(caught instanceof MyPOSConnectError)) {
      throw new Error('Expected MyPOSConnectError');
    }
    expect(caught.status).toBe(503);
    expect(caught.body).toBe('temporarily unavailable');
    expect(caught.headers.get('retry-after')).toBe('60');
    expect(fake.fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes network errors through without HTTP wrapping or retries', async () => {
    const networkError = new TypeError('socket closed');
    const fake = createFakeFetch([() => Promise.reject(networkError)]);
    const client = createClient(fake.fetch);

    await expect(client.products.list()).rejects.toBe(networkError);
    expect(networkError).not.toBeInstanceOf(MyPOSConnectError);
    expect(fake.fetchMock).toHaveBeenCalledTimes(1);
  });
});
