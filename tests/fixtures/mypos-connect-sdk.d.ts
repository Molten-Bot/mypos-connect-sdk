declare const process: {
  readonly env: Readonly<Record<string, string | undefined>>;
};

declare module '@molten-ai/mypos-connect-sdk' {
  export interface MyPOSConnectOptions {
    baseURL?: string;
    accessToken?: string;
    username?: string;
    password?: string;
  }

  export interface PageOptions {
    liPageSize?: number;
    liPage?: number;
  }

  export interface ProductListOptions extends PageOptions {
    filt_active_bool?: boolean;
    filt_webproduct_bool?: boolean;
    filt_stylecode_str?: string;
    sFieldList?: string;
    sSortKey?: string;
  }

  export interface RequestOptions {
    maxRetries?: number;
    signal?: AbortSignal;
    timeout?: number;
  }

  export interface Product {
    liTotalCount?: number;
    productCode?: string;
  }

  export class APIError extends Error {
    readonly requestID?: string;
    readonly status?: number;
  }

  export default class MyPOSConnect {
    static readonly APIError: typeof APIError;

    constructor(options?: MyPOSConnectOptions);

    readonly auth: {
      readonly tokens: {
        create(): Promise<unknown>;
      };
    };

    readonly products: {
      list(options?: ProductListOptions, requestOptions?: RequestOptions): Promise<Product[]>;
      retrieve(productCode: string, requestOptions?: RequestOptions): Promise<Product>;
    };

    readonly stores: {
      list(options?: PageOptions): Promise<unknown>;
    };
  }
}

declare module '@molten-ai/mypos-connect-sdk/tree-shakable' {
  import type { MyPOSConnectOptions } from '@molten-ai/mypos-connect-sdk';

  interface PartialClient {
    withResources<T>(resources: T): T extends { stores: unknown }
      ? {
          stores: {
            list(options?: { liPageSize?: number; liPage?: number }): Promise<unknown>;
          };
        }
      : never;
  }

  export function createClient(options?: MyPOSConnectOptions): PartialClient;
}

declare module '@molten-ai/mypos-connect-sdk/resources/stores' {
  export class StoresResource {}
}

declare module '@molten-ai/mypos-connect-sdk/discovery' {
  export const OPENAPI_SPEC_URL: string;
}
