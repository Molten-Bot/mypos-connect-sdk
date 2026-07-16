import { createClient, type Client, type Config } from './generated/client/index.js';
import {
  authTokensCreate as generatedAuthTokensCreate,
  customersCreate as generatedCustomersCreate,
  customersGlobalRetrieve as generatedCustomersGlobalRetrieve,
  customersGlobalUpdate as generatedCustomersGlobalUpdate,
  customersRetrieve as generatedCustomersRetrieve,
  customersUpdate as generatedCustomersUpdate,
  inventoryCommitmentsCreate as generatedInventoryCommitmentsCreate,
  inventoryCommitmentsRetrieve as generatedInventoryCommitmentsRetrieve,
  type Options as GeneratedOptions,
  productsList as generatedProductsList,
  productsListAlternate as generatedProductsListAlternate,
  productsListChanged as generatedProductsListChanged,
  productsRetrieve as generatedProductsRetrieve,
  productsSerialNumbersRetrieveStatus as generatedProductsSerialNumbersRetrieveStatus,
  productsStoreDataListChanged as generatedProductsStoreDataListChanged,
  productsStoreDataListChangedWithOnOrder as generatedProductsStoreDataListChangedWithOnOrder,
  productsStoreDataRetrieve as generatedProductsStoreDataRetrieve,
  productsStoreDataRetrieveWithOnOrder as generatedProductsStoreDataRetrieveWithOnOrder,
  rewardsCommitmentsCreate as generatedRewardsCommitmentsCreate,
  salesCreate as generatedSalesCreate,
  storesList as generatedStoresList,
} from './generated/sdk.gen.js';
import type {
  AuthTokensCreateResponse,
  CommitPointsRequestWritable,
  CommitQuantityRequestWritable,
  CustomerCreateRequestWritable,
  CustomersCreateResponse,
  CustomersGlobalRetrieveResponse,
  CustomersGlobalUpdateResponse,
  CustomersRetrieveResponse,
  CustomersUpdateResponse,
  CustomerUpdateRequestWritable,
  GlobalCustomerUpdateRequestWritable,
  InventoryCommitmentsCreateResponse,
  InventoryCommitmentsRetrieveResponse,
  ProductsListAlternateResponse,
  ProductsListChangedResponse,
  ProductsListResponse,
  ProductsRetrieveResponse,
  ProductsSerialNumbersRetrieveStatusResponse,
  ProductsStoreDataListChangedResponse,
  ProductsStoreDataListChangedWithOnOrderResponse,
  ProductsStoreDataRetrieveResponse,
  ProductsStoreDataRetrieveWithOnOrderResponse,
  RewardsCommitmentsCreateResponse,
  SaleRequestWritable,
  SalesCreateResponse,
  StoresListResponse,
} from './generated/types.gen.js';
import { MyPOSConnectError } from './error.js';

export const DEFAULT_BASE_URL = 'https://api.myposconnect.com/api/v2';

export interface MyPOSConnectOptions {
  /** JWT used by every operation except `auth.tokens.create()`. */
  accessToken?: string | undefined;
  /** API root URL. Defaults to the documented production endpoint. */
  baseURL?: string | undefined;
  /** Custom Fetch implementation for supported runtimes and tests. */
  fetch?: typeof globalThis.fetch | undefined;
  /** API-user password used only by `auth.tokens.create()`. */
  password?: string | undefined;
  /** API-user email/username used only by `auth.tokens.create()`. */
  username?: string | undefined;
}

export interface RequestOptions {
  /** Additional request headers. `Authorization` must be configured on the client. */
  headers?: HeadersInit | undefined;
  /** AbortSignal used to cancel this request. */
  signal?: AbortSignal | undefined;
}

type GeneratedResult<T> = Promise<{
  data: T;
  request: Request;
  response: Response;
}>;

class Transport {
  readonly client: Client;

  constructor(options: MyPOSConnectOptions) {
    const baseURL = normalizeBaseURL(options.baseURL ?? DEFAULT_BASE_URL);
    const config: Config = {
      auth: (auth) => {
        if (auth.scheme === 'basic') {
          if (!options.username || !options.password) {
            throw new Error(
              'MyPOS Connect Basic authentication requires both username and password',
            );
          }
          return `${options.username}:${options.password}`;
        }

        if (auth.scheme === 'bearer') {
          if (!options.accessToken) {
            throw new Error('MyPOS Connect bearer authentication requires accessToken');
          }
          return options.accessToken;
        }

        throw new Error('MyPOS Connect requested an unsupported authentication scheme');
      },
      baseUrl: baseURL,
      parseAs: 'json',
      responseStyle: 'fields',
      throwOnError: true,
    };

    if (options.fetch) {
      config.fetch = options.fetch;
    }

    this.client = createClient(config);
    this.client.interceptors.error.use((error, response, request) => {
      if (!response || response.ok) {
        return error;
      }

      return new MyPOSConnectError({
        body: error,
        headers: response.headers,
        request,
        status: response.status,
        statusText: response.statusText,
      });
    });
  }

  async data<T>(result: GeneratedResult<T>): Promise<T> {
    return (await result).data;
  }

  options(options?: RequestOptions): GeneratedOptions<never, true> {
    const generated: GeneratedOptions<never, true> = {
      client: this.client,
      throwOnError: true,
    };

    if (options?.headers) {
      const headers = new Headers(options.headers);
      if (headers.has('Authorization')) {
        throw new Error(
          'Set MyPOS Connect credentials on the client instead of overriding Authorization',
        );
      }

      // The generated body operations merge request headers with object spread,
      // which does not enumerate a Headers instance. Use a plain record so custom
      // headers are preserved consistently for GET, POST, and PUT operations.
      generated.headers = Object.fromEntries(headers.entries());
    }

    if (options?.signal) {
      generated.signal = options.signal;
    }

    return generated;
  }
}

function normalizeBaseURL(value: string): string {
  const normalized = value.replace(/\/+$/, '');
  if (!normalized) {
    throw new TypeError('MyPOS Connect baseURL must not be empty');
  }
  return normalized;
}

type ParametersOf<T extends (...args: never[]) => unknown> = NonNullable<Parameters<T>[0]>;

export type ProductsListParameters = ParametersOf<typeof generatedProductsList>;
export type ProductsRetrieveParameters = ParametersOf<typeof generatedProductsRetrieve>;
export type ProductsListChangedParameters = ParametersOf<typeof generatedProductsListChanged>;
export type ProductsListAlternateParameters = ParametersOf<typeof generatedProductsListAlternate>;
export type ProductsStoreDataListChangedParameters = ParametersOf<
  typeof generatedProductsStoreDataListChanged
>;
export type ProductsStoreDataRetrieveParameters = ParametersOf<
  typeof generatedProductsStoreDataRetrieve
>;
export type ProductsStoreDataListChangedWithOnOrderParameters = ParametersOf<
  typeof generatedProductsStoreDataListChangedWithOnOrder
>;
export type ProductsStoreDataRetrieveWithOnOrderParameters = ParametersOf<
  typeof generatedProductsStoreDataRetrieveWithOnOrder
>;
export type ProductsSerialNumbersRetrieveStatusParameters = ParametersOf<
  typeof generatedProductsSerialNumbersRetrieveStatus
>;
export type CustomersRetrieveParameters = ParametersOf<typeof generatedCustomersRetrieve>;
export type CustomersGlobalRetrieveParameters = ParametersOf<
  typeof generatedCustomersGlobalRetrieve
>;
export type StoresListParameters = ParametersOf<typeof generatedStoresList>;
export type InventoryCommitmentsRetrieveParameters = ParametersOf<
  typeof generatedInventoryCommitmentsRetrieve
>;

export type CustomersUpdateParameters = CustomerUpdateRequestWritable & {
  CustomerCode: string;
};

export type CustomersGlobalUpdateParameters = GlobalCustomerUpdateRequestWritable & {
  EmailAddress: string;
};

class AuthTokensResource {
  constructor(private readonly transport: Transport) {}

  create(options?: RequestOptions): Promise<AuthTokensCreateResponse> {
    return this.transport.data(
      generatedAuthTokensCreate(this.transport.options(options)),
    );
  }
}

class AuthResource {
  readonly tokens: AuthTokensResource;

  constructor(transport: Transport) {
    this.tokens = new AuthTokensResource(transport);
  }
}

class ProductsStoreDataResource {
  constructor(private readonly transport: Transport) {}

  listChanged(
    parameters: ProductsStoreDataListChangedParameters,
    options?: RequestOptions,
  ): Promise<ProductsStoreDataListChangedResponse> {
    return this.transport.data(
      generatedProductsStoreDataListChanged(parameters, this.transport.options(options)),
    );
  }

  retrieve(
    parameters: ProductsStoreDataRetrieveParameters,
    options?: RequestOptions,
  ): Promise<ProductsStoreDataRetrieveResponse> {
    return this.transport.data(
      generatedProductsStoreDataRetrieve(parameters, this.transport.options(options)),
    );
  }

  listChangedWithOnOrder(
    parameters: ProductsStoreDataListChangedWithOnOrderParameters,
    options?: RequestOptions,
  ): Promise<ProductsStoreDataListChangedWithOnOrderResponse> {
    return this.transport.data(
      generatedProductsStoreDataListChangedWithOnOrder(
        parameters,
        this.transport.options(options),
      ),
    );
  }

  retrieveWithOnOrder(
    parameters: ProductsStoreDataRetrieveWithOnOrderParameters,
    options?: RequestOptions,
  ): Promise<ProductsStoreDataRetrieveWithOnOrderResponse> {
    return this.transport.data(
      generatedProductsStoreDataRetrieveWithOnOrder(
        parameters,
        this.transport.options(options),
      ),
    );
  }
}

class ProductsSerialNumbersResource {
  constructor(private readonly transport: Transport) {}

  retrieveStatus(
    parameters: ProductsSerialNumbersRetrieveStatusParameters,
    options?: RequestOptions,
  ): Promise<ProductsSerialNumbersRetrieveStatusResponse> {
    return this.transport.data(
      generatedProductsSerialNumbersRetrieveStatus(
        parameters,
        this.transport.options(options),
      ),
    );
  }
}

class ProductsResource {
  readonly serialNumbers: ProductsSerialNumbersResource;
  readonly storeData: ProductsStoreDataResource;

  constructor(private readonly transport: Transport) {
    this.serialNumbers = new ProductsSerialNumbersResource(transport);
    this.storeData = new ProductsStoreDataResource(transport);
  }

  list(
    parameters: ProductsListParameters = {},
    options?: RequestOptions,
  ): Promise<ProductsListResponse> {
    return this.transport.data(
      generatedProductsList(parameters, this.transport.options(options)),
    );
  }

  retrieve(
    parameters: ProductsRetrieveParameters,
    options?: RequestOptions,
  ): Promise<ProductsRetrieveResponse> {
    return this.transport.data(
      generatedProductsRetrieve(parameters, this.transport.options(options)),
    );
  }

  listChanged(
    parameters: ProductsListChangedParameters,
    options?: RequestOptions,
  ): Promise<ProductsListChangedResponse> {
    return this.transport.data(
      generatedProductsListChanged(parameters, this.transport.options(options)),
    );
  }

  listAlternate(
    parameters: ProductsListAlternateParameters = {},
    options?: RequestOptions,
  ): Promise<ProductsListAlternateResponse> {
    return this.transport.data(
      generatedProductsListAlternate(parameters, this.transport.options(options)),
    );
  }
}

class CustomersGlobalResource {
  constructor(private readonly transport: Transport) {}

  retrieve(
    parameters: CustomersGlobalRetrieveParameters,
    options?: RequestOptions,
  ): Promise<CustomersGlobalRetrieveResponse> {
    return this.transport.data(
      generatedCustomersGlobalRetrieve(parameters, this.transport.options(options)),
    );
  }

  update(
    parameters: CustomersGlobalUpdateParameters,
    options?: RequestOptions,
  ): Promise<CustomersGlobalUpdateResponse> {
    return this.transport.data(
      generatedCustomersGlobalUpdate(
        {
          EmailAddress: parameters.EmailAddress,
          globalCustomerUpdateRequestWritable: {
            GlobalCustomers: parameters.GlobalCustomers,
          },
        },
        this.transport.options(options),
      ),
    );
  }
}

class CustomersResource {
  readonly global: CustomersGlobalResource;

  constructor(private readonly transport: Transport) {
    this.global = new CustomersGlobalResource(transport);
  }

  create(
    parameters: CustomerCreateRequestWritable,
    options?: RequestOptions,
  ): Promise<CustomersCreateResponse> {
    return this.transport.data(
      generatedCustomersCreate(
        { customerCreateRequestWritable: parameters },
        this.transport.options(options),
      ),
    );
  }

  retrieve(
    parameters: CustomersRetrieveParameters,
    options?: RequestOptions,
  ): Promise<CustomersRetrieveResponse> {
    return this.transport.data(
      generatedCustomersRetrieve(parameters, this.transport.options(options)),
    );
  }

  update(
    parameters: CustomersUpdateParameters,
    options?: RequestOptions,
  ): Promise<CustomersUpdateResponse> {
    return this.transport.data(
      generatedCustomersUpdate(
        {
          CustomerCode: parameters.CustomerCode,
          customerUpdateRequestWritable: { Customers: parameters.Customers },
        },
        this.transport.options(options),
      ),
    );
  }
}

class StoresResource {
  constructor(private readonly transport: Transport) {}

  list(
    parameters: StoresListParameters = {},
    options?: RequestOptions,
  ): Promise<StoresListResponse> {
    return this.transport.data(
      generatedStoresList(parameters, this.transport.options(options)),
    );
  }
}

class InventoryCommitmentsResource {
  constructor(private readonly transport: Transport) {}

  create(
    parameters: CommitQuantityRequestWritable,
    options?: RequestOptions,
  ): Promise<InventoryCommitmentsCreateResponse> {
    return this.transport.data(
      generatedInventoryCommitmentsCreate(
        { commitQuantityRequestWritable: parameters },
        this.transport.options(options),
      ),
    );
  }

  retrieve(
    parameters: InventoryCommitmentsRetrieveParameters,
    options?: RequestOptions,
  ): Promise<InventoryCommitmentsRetrieveResponse> {
    return this.transport.data(
      generatedInventoryCommitmentsRetrieve(parameters, this.transport.options(options)),
    );
  }
}

class InventoryResource {
  readonly commitments: InventoryCommitmentsResource;

  constructor(transport: Transport) {
    this.commitments = new InventoryCommitmentsResource(transport);
  }
}

class RewardsCommitmentsResource {
  constructor(private readonly transport: Transport) {}

  create(
    parameters: CommitPointsRequestWritable,
    options?: RequestOptions,
  ): Promise<RewardsCommitmentsCreateResponse> {
    return this.transport.data(
      generatedRewardsCommitmentsCreate(
        { commitPointsRequestWritable: parameters },
        this.transport.options(options),
      ),
    );
  }
}

class RewardsResource {
  readonly commitments: RewardsCommitmentsResource;

  constructor(transport: Transport) {
    this.commitments = new RewardsCommitmentsResource(transport);
  }
}

class SalesResource {
  constructor(private readonly transport: Transport) {}

  create(
    parameters: SaleRequestWritable,
    options?: RequestOptions,
  ): Promise<SalesCreateResponse> {
    return this.transport.data(
      generatedSalesCreate(
        { saleRequestWritable: parameters },
        this.transport.options(options),
      ),
    );
  }
}

export class MyPOSConnect {
  readonly auth: AuthResource;
  readonly customers: CustomersResource;
  readonly inventory: InventoryResource;
  readonly products: ProductsResource;
  readonly rewards: RewardsResource;
  readonly sales: SalesResource;
  readonly stores: StoresResource;

  constructor(options: MyPOSConnectOptions = {}) {
    const transport = new Transport(options);
    this.auth = new AuthResource(transport);
    this.customers = new CustomersResource(transport);
    this.inventory = new InventoryResource(transport);
    this.products = new ProductsResource(transport);
    this.rewards = new RewardsResource(transport);
    this.sales = new SalesResource(transport);
    this.stores = new StoresResource(transport);
  }
}
