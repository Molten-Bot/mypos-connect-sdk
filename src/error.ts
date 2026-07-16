export interface MyPOSConnectErrorOptions {
  body: unknown;
  headers: Headers;
  request?: Request | undefined;
  status: number;
  statusText?: string | undefined;
}

/** An HTTP error returned by the MyPOS Connect API. */
export class MyPOSConnectError extends Error {
  readonly body: unknown;
  readonly headers: Headers;
  readonly request: Request | undefined;
  readonly status: number;

  constructor(options: MyPOSConnectErrorOptions) {
    const suffix = options.statusText ? ` ${options.statusText}` : '';
    super(`MyPOS Connect API request failed with status ${options.status}${suffix}`);
    this.name = 'MyPOSConnectError';
    this.body = options.body;
    this.headers = new Headers(options.headers);
    this.request = options.request;
    this.status = options.status;
  }
}
