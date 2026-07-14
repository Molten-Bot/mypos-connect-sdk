declare const process: {
  readonly env: Readonly<Record<string, string | undefined>>;
};

declare module '@molten-ai/mypos-connect' {
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

  export default class MyPOSConnect {
    constructor(options?: MyPOSConnectOptions);

    readonly auth: {
      readonly tokens: {
        create(): Promise<{ token: string; expiresIn?: number }>;
      };
    };

    readonly products: {
      list(options?: ProductListOptions): Promise<unknown>;
    };

    readonly stores: {
      list(options?: PageOptions): Promise<unknown>;
    };
  }
}
