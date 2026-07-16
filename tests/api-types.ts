import MyPOSConnectDefault, {
  MyPOSConnect,
  type AuthTokensCreateResponse,
  type Customer,
  type CustomersCreateResponse,
  type CustomersGlobalUpdateResponse,
  type CustomersUpdateResponse,
  type Error as MyPOSConnectErrorBody,
  type GlobalCustomerListResponse,
  type InventoryCommitmentsCreateResponse,
  type InventoryCommitmentsRetrieveResponse,
  type Product,
  type ProductListResponse,
  type RewardsCommitmentsCreateResponse,
  type SaleRequestWritable,
  type SalesCreateResponse,
  type StoreListResponse,
} from '../src/index.js';

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsExactlyUnknown<T> = IsAny<T> extends true
  ? false
  : unknown extends T
    ? keyof T extends never
      ? true
      : false
    : false;
type Expect<T extends true> = T;

type _TokenResponseRemainsUnknown = Expect<IsExactlyUnknown<AuthTokensCreateResponse>>;
type _CustomerCreateResponseRemainsUnknown = Expect<
  IsExactlyUnknown<CustomersCreateResponse>
>;
type _CustomerUpdateResponseRemainsUnknown = Expect<
  IsExactlyUnknown<CustomersUpdateResponse>
>;
type _GlobalCustomerUpdateResponseRemainsUnknown = Expect<
  IsExactlyUnknown<CustomersGlobalUpdateResponse>
>;
type _InventoryCreateResponseRemainsUnknown = Expect<
  IsExactlyUnknown<InventoryCommitmentsCreateResponse>
>;
type _InventoryRetrieveResponseRemainsUnknown = Expect<
  IsExactlyUnknown<InventoryCommitmentsRetrieveResponse>
>;
type _RewardsResponseRemainsUnknown = Expect<
  IsExactlyUnknown<RewardsCommitmentsCreateResponse>
>;
type _SalesResponseRemainsUnknown = Expect<IsExactlyUnknown<SalesCreateResponse>>;
type _ErrorBodiesRemainUnknown = Expect<IsExactlyUnknown<MyPOSConnectErrorBody>>;

const namedConstructor: typeof MyPOSConnectDefault = MyPOSConnect;
const defaultConstructor: typeof MyPOSConnect = MyPOSConnectDefault;
void namedConstructor;
void defaultConstructor;

async function compilePublicApi(client: MyPOSConnect, signal: AbortSignal): Promise<void> {
  const token: unknown = await client.auth.tokens.create({ signal });
  const products: ProductListResponse = await client.products.list(
    {
      filt_active_bool: false,
      liPage: 1,
      liPageSize: 50,
      sFieldList: 'productCode,shortDescription',
    },
    { headers: { 'X-Correlation-ID': 'example' }, signal },
  );
  const product: Product = await client.products.retrieve({
    ProductCode: 'SKU-1',
  });
  await client.products.listChanged({ LastEditDate: '2026-07-16T12:30:45' });
  await client.products.listAlternate();
  await client.products.storeData.listChanged({
    LastEditDate: '2026-07-16T12:30:45',
    StoreCode: 'MAIN',
  });
  await client.products.storeData.retrieve({ ProductCode: 'SKU-1', StoreCode: 'MAIN' });
  await client.products.storeData.listChangedWithOnOrder({
    LastEditDate: '2026-07-16T12:30:45',
    StoreCode: 'MAIN',
  });
  await client.products.storeData.retrieveWithOnOrder({
    ProductCode: 'SKU-1',
    StoreCode: 'MAIN',
  });
  await client.products.serialNumbers.retrieveStatus({
    ProductCode: 'SKU-1',
    SerialNumber: 'SERIAL-1',
    StoreCode: 'MAIN',
  });

  await client.customers.create({
    Customers: [{ emailAddress: 'ada@example.com', firstName: 'Ada' }],
  });
  const customer: Customer = await client.customers.retrieve({ CustomerCode: 'CUST-1' });
  await client.customers.update({
    CustomerCode: 'CUST-1',
    Customers: [{ LastName: 'Lovelace', Region: 'BC' }],
  });
  const globalCustomers: GlobalCustomerListResponse = await client.customers.global.retrieve({
    EmailAddress: 'ada@example.com',
  });
  await client.customers.global.update({
    EmailAddress: 'ada@example.com',
    GlobalCustomers: [{ PhoneNumber: '+1 604 555 0123', firstName: 'Ada' }],
  });

  const stores: StoreListResponse = await client.stores.list({ liPage: 1, liPageSize: 50 });
  await client.inventory.commitments.create({
    OrderedQuantities: [
      {
        Items: [{ LineNumber: '10', ProductCode: 'SKU-1', Quantity: '-1.00' }],
        OrderNumber: 'ORDER-1',
        StoreCode: 'MAIN',
      },
    ],
  });
  const commitment: unknown = await client.inventory.commitments.retrieve({
    OrderNumber: 'ORDER-1',
  });
  await client.rewards.commitments.create({
    CommittedPoints: [
      {
        EmailAddress: 'ada@example.com',
        OrderNumber: 'ORDER-1',
        Points: -100,
        StoreCode: 'MAIN',
      },
    ],
  });

  const sale: SaleRequestWritable = {
    Sales: [
      {
        OrderNumber: 'ORDER-1',
        SaleDate: '2026-07-16',
        SaleTotal: '0.00',
        StoreCode: 'MAIN',
      },
    ],
  };
  const saleResult: unknown = await client.sales.create(sale);

  void token;
  void products;
  void product;
  void customer;
  void globalCustomers;
  void stores;
  void commitment;
  void saleResult;
}

void compilePublicApi;
