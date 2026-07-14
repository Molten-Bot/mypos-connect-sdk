MyPOS Connect
API V2
Document version 1.4
Contents
Overview ................................................................................................................................................. 2
Obtaining an API User Account ................................................................................................................ 2
API URL ................................................................................................................................................... 3
Get an API Token ..................................................................................................................................... 3
API Calls - Products .................................................................................................................................. 4
Pagination Option ................................................................................................................................ 4
Filtered Product Data........................................................................................................................... 5
General Product Data: ......................................................................................................................... 5
General Data Field List Option.......................................................................................................... 5
General Data Field List Examples...................................................................................................... 6
Store Specific Product Data.................................................................................................................. 7
Product Serial Number Status .............................................................................................................. 8
API Calls - Customers ............................................................................................................................... 9
Customers ........................................................................................................................................... 9
Global Customers ................................................................................................................................ 9
API Calls - Stores .................................................................................................................................... 10
API Calls - Sales Order ............................................................................................................................ 11
Committed Quantities ....................................................................................................................... 11
Sales .................................................................................................................................................. 12
Paying for Sales with Reward Points .................................................................................................. 13
Overview
The MyPOS Connect API is most commonly used to develop connections to websites to enable sharing
of product and inventory data from MyPOS Connect to the website as well as inserting sales along with
customer information in order to record the revenue and decrement the inventory in MyPOS Connect.
When an order is places on the website, the products can be committed in inventory in MyPOS Connect.
Once the pick-pack-ship process is completed on the website, the order can be sent to MyPOS Connect
where a sale will be created and the committed inventory released and the actual inventory will be
decremented. If the store has rewards enabled, customer rewards will be earned.
The MyPOS Connect API includes calls related to Products, Customers and Sales. The API uses JSON Web Tokens
(JWT) for authentication/authorization. All POST and PUT commands require that the body be in JSON format.
This document is intended to be accompanied by “MyPOS Connect API Sample Calls V2.xlsx”.
In order to get started you will need to setup an API User Account (see “Obtaining an API User Account” in this
document) and also, if the development is aimed at a single database and will be retrieving and/or updating
customers, decide if the email address or customer code will be used to reference the customer. For multiple
databases using Global Customers, email address is the only option.
Obtaining an API User Account
An API User Account is required to retrieve a token from the server to perform API calls. The owner of the
database can email to request an API user account. In the email requesting API access
they must provide the email they would like associated with the API user account.
support@tricityretail.com MyPOS Connect API v2 dv1.4 2
API URL
https://api.myposconnect.com/api/v2/{APICALL}
Get an API Token
You will be required to send your authorization token with every API call you make. Tokens are valid for 120
minutes so new tokens must be requested on a regular basis.
Getting an API Token requires email and password authentication.
POST https://api.myposconnect.com/api/v2/auth/token
It is recommended that Postman be installed to facilitate your setup and testing of the MyPOS Connect API.
Download Postman from this URL https://www.getpostman.com/downloads/
Follow the steps below to obtain a token in Postman
Click the + to create a new request (or copy your existing request to include your authorization)
Choose “Post” from the dropdown menu
Copy the following URL into the input box beside “Post” https://api.myposconnect.com/api/v2/auth/token
Next, choose “Authorization” (below “Post”) and provide the email and password you used in the “Create an API
User Account” step.
Lastly, choose “Body” in Postman, select “Raw” from the radio buttons and “JSON (application/json)” from the
drop down. Edit and paste the body from “Figure 1” into Postman. Click SEND and your token will be returned.
MyPOS Connect API v2 dv1.4 3
API Calls - Products
All Product API calls require Bearer Token authentication.
There are two sets of calls for products – General and Store Specific. The General calls get “static” detail about the
products such as Description, Notes, Classification, etc. The data returned from the General calls doesn’t usually
change on a product once it’s been setup. Store specific data calls gets Price, Cost, On Hand Quantity and Tax
Group which in the case of price, cost and on hand can change regularly. Calls can include options for pagination,
specific fields and specific filters.
Pagination Option
You can specify a page size (liPageSize) and page number (liPage) when requesting products. Each result will
include the total product count (liTotalCount) but you can also request it with the call below. Use a “?” to provide
the first option and use & for subsequent options.
Request total product count
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=1&sFieldList=liTotalCount
Request product count of all “Active” products
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=1&sFieldList=liTotalCount&filt_active_bool=true
Sort Order
The default sort order of the product list is by Long Description. Results can be sorted by the columns listed below.
ASC or DESC must be specified.
Active
CreationDate
CreationDeviceName
CreationUserName
LastEditDate
LastEditDeviceName
LastEditUserName
LongDescription
Price01
ProductCode
ProductReportingClass
ProductType
ShortDescription
StockControl
GET https://api.myposconnect.com/api/V2/naproducts
/~2020-11-16?sFieldList=productcode,longdescription&sSortKey=productCodeASC
GET https://api.myposconnect.com/api/v2/naproducts
?sSortKey=productCodeASC&liPageSize=100&liPage=136&filt_webproduct_bool=true
&filt_active_bool=true&sFieldList=productcode,longdescription
MyPOS Connect API v2 dv1.4 4
Filtered Product Data
Product can be filtered by either “Web Product” and/or “Active”
To get all products where Web Product = True
GET https://api.myposconnect.com/api/v2/naproducts?filt_webproduct_bool=true
To get all products where Active = True
GET https://api.myposconnect.com/api/v2/products?filt_active_bool=true
To get all products where Web Product = True and Active = True
https://api.myposconnect.com/api/v2/naproducts?filt_webproduct_bool=true&filt_active_bool=true
General Product Data:
https://api.myposconnect.com/api/v2/naproducts
To get all products:
GET ** Warning, this may return a lot of data, it is recommended that you use the pagination options
described in this document
To get all products using pagination (100 products per page in this example)
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=100&liPage=1
To get general details for a single product
GET https://api.myposconnect.com/api/v2/naproducts/{ProductCode}
To get general product details changed since YYYY-MM-DD
GET https://api.myposconnect.com/api/v2/naproducts/~YYYY-MM-DD
To get general product details changed since YYYY-MM-DD with pagination
GET https://api.myposconnect.com/api/v2/naproducts/~YYYY-MM-DD?liPageSize=10&liPage=1
To get general details for all products for a specific style
GET https://api.myposconnect.com/api/v2/naproducts?filt_stylecode_str=STY001
General Data Field List Option
It is possible to request specific column data in a column separated list following “sFieldList”. Any of the columns
returned from this call can be used in your request. Use a “?” to provide the first option and use & for subsequent
options.
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=1
MyPOS Connect API v2 dv1.4 5
General Data Field List Examples
Get Product Code and Description for all products
GET https://api.myposconnect.com/api/v2/naproducts?sFieldList=productCode,longDescription
Get Product Code and Description for all products with pagination
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=10&liPage=1&sFieldList=productCode,longDescription
Get Product Code, Description, Size and Colour
GET
https://api.myposconnect.com/api/v2/naproducts?liPageSize=10&liPage=1&sFieldList=productCode,longDescription,
productSize,productColour
See “MyPOS Connect API Sample Calls V2.xlsx” for additional examples.
MyPOS Connect API v2 dv1.4 6
https://api.myposconnect.com/api/v2/productspq/~{StoreCode}~{LastEditDate}?liPageSize=10&liPage=1
Store Specific Product Data
To get price, cost, quantity available and tax for all products modified after a specified date (UTC)
GET https://api.myposconnect.com/api/v2/productspq/~{StoreCode}~{LastEditDate}
Date must be UTC and military format (24 hour clock)
Note that two ~ are used
To get price, cost, quantity available and tax for all products modified after a specified date (UTC) with pagination
GET Date must be UTC and military format (24 hour clock)
Note that two ~ are used
To get price and quantity available for a specific product
GET https://api.myposconnect.com/api/v2/productspq/{StoreCode}~{ProductCode}
Note that only one ~ is used
To get price, quantity available, tax and quantity on order for a specific product
GET https://api.myposconnect.com/api/v2/productspqo/{StoreCode}~{ProductCode}
Note if quantity on order is not require, it is recommended that the call below is used
GET https://api.myposconnect.com/api/v2/productspq/{StoreCode}~{ProductCode}
To get price, cost, quantity available, tax and quantity on order for all products modified after a specified date
(UTC)
GET https://api.myposconnect.com/api/v2/productspqo/~{StoreCode}~{LastEditDate}
Date must be UTC and military format (24 hour clock)
Note that two ~ are used
Note if quantity on order is not require, it is recommended that the call below is used
GET https://api.myposconnect.com/api/v2/productspq/~{StoreCode}~{LastEditDate}
See “MyPOS Connect API Sample Calls V2.xlsx” for additional examples.
MyPOS Connect API v2 dv1.4 7
Product Serial Number Status
Note: Serial Numbers are not available in all databases. Check with the database users to find out if they’re using
the Serial Number plug in.
The Serial Number Status API calls require Bearer Token authentication.
Possible Values:
-1 Not Found
0 Available
1 Sold
2 Transferred Out
3 Returned
4 Deleted
5 In Limbo
To get the status
See “MyPOS Connect API Sample Calls V2.xlsx” for additional examples.
GET https://api.myposconnect.com/api/v2/ProductSerial/{StoreCode}~{ProductCode}~{SerialNumber}
MyPOS Connect API v2 dv1.4 8
API Calls - Customers
All Customer API calls require Bearer Token authentication.
New customers are automatically created when a sales order is posted (see “Sales Order” under “Sales” in this
document).
Customers will be looked up based on their email (or optionally by customer code for single databases) and any
update to customer name and/or address will be updated.
Customers
**By default, customers are looked up by {CustomerCode} but, the system can also be configured to lookup by
{EmailAddress} instead
To get a single customer
GET https://api.myposconnect.com/api/v2/naCustomers/{CustomerCode}
To update a single customer
PUT https://api.myposconnect.com/api/v2/naCustomers/{CustomerCode}
To create a single customer
POST https://api.myposconnect.com/api/v2/naCustomers
See “MyPOS Connect API Sample Calls V2.xlsx” for an example.
Global Customers
Note: Global Customers are not available in all databases. Check with the database users to find out if they’re
using the Global Customer plug in. Global Customers are for installations with multiple databases that are setup
with Global Customers.
Global Customers only offer a limited number for fields for update so fully updating a customer may require calls
to “Global Customers” and “Customers”.
To get a single customer
GET https://api.myposconnect.com/api/v2/globalcustomers/{EmailAddress}
To update a single customer
PUT https://api.myposconnect.com/api/v2/globalcustomers/{EmailAddress}
See “MyPOS Connect API Sample Calls V2.xlsx” for an example.
MyPOS Connect API v2 dv1.4 9
API Calls - Stores
The Stores API calls require Bearer Token authentication.
Store codes are required for some Product GET calls and also for all Sales POST calls.
To get the stores list
GET https://api.myposconnect.com/api/v2/Stores
To get the stores list with pagination
GET https://api.myposconnect.com/api/v2/Stores?liPageSize=10&liPage=1
MyPOS Connect API v2 dv1.4 10
API Calls - Sales Order
All Sales Order API calls require Bearer Token authentication.
Committed Quantities
For optimal inventory, order quantities can be committed after an order is placed but before an order is finalized.
This will “reserve” the inventory and reduce the available quantity. Committed quantities are sent to MyPOS
Connect with the web order number and later, when the same web order is processed the committed quantity will
be relieved and the actual inventory will be decremented. IMPORTANT: If an order is cancelled, you have two
options: 1) Cancel all committed quantities (see below) or 2) Reverse the individual committed quantities by
sending negative commit values.
To insert committed quantities:
POST To view committed quantities:
https://api.myposconnect.com/api/v2/CommitQty
GET https://api.myposconnect.com/api/v2/CommitQty/{OrderNumber}
To Cancel all committed quantities associated with a sale
Cancellation of committed quantities is required when the sale will not be processed.
Cancel committed
quantities example:
POST https://api.myposconnect.com/api/v2/Sale
"Sales": [
{
"SaleDate": "2020-11-19",
"OrderNumber": "1008",
"StoreCode": "001",
"SaleTotal":"0.00"
}
See “MyPOS Connect API Sample Calls V2.xlsx” for examples on Committed Quantities
MyPOS Connect API v2 dv1.4 11
Sales
Sales include CustomerBillTo, CustomerShipTo, Items, Taxes and optional Discount blocks. Customers are located
by email address. If the “CustomerBillTo” customer does not already exist in MyPOS Connect, it will be inserted. If
the customer email already exists but the name or address information differs, it will be updated.
To insert a sale
POST https://api.myposconnect.com/api/v2/Sale
See “MyPOS Connect API Sample Calls V2.xlsx” for examples.
MyPOS Connect API v2 dv1.4 12
Paying for Sales with Reward Points
Step 1: Verify that the customer has the points
Sales can be paid for with customer rewards. IMPORTANT: You must verify with the owner of the database the
value of a point. 100 points is NOT necessarily worth $1.00. Before any point value is accepted, the point value
must first be verified using the GET Customer call below:
GET https://api.myposconnect.com/api/v2/naCustomers/{emailaddress}
Step 2: Commit the Points
It is advisable that the points be reserved using the POST CommitPts call below. The reason this step is important
is to ensure that the customers points are not spent elsewhere between the finalization of the web transaction
and the POST to the MyPOS Connect database after the pick-pack-ship has taken place.
POST https://api.myposconnect.com/api/v2/CommitPts
Commit Points Example:
POST https://api.myposconnect.com/api/v2/CommitPts
{
"CommittedPoints":
[
{
"StoreCode":"1",
"OrderNumber": "801",
"EmailAddress":"lucy@test.com",
"Points": -400
}
]
}
Committed points will automatically be reversed when final sale is sent, however if sale is cancelled, a
reversal to the committed points must be sent
Reverse
Commit Points Example:
POST https://api.myposconnect.com/api/v2/CommitPts
{
"CommittedPoints":
[
{
"StoreCode":"1",
"OrderNumber": "801",
"EmailAddress": "lucy@test.com",
"Points": 400
}
]
}
MyPOS Connect API v2 dv1.4 13
Step 3: Send the Reward Points Spent with the Sale
To insert a sale
POST https://api.myposconnect.com/api/v2/Sale
Use Reward Points Example:
POST https://api.myposconnect.com/api/v2/Sale
{
"Sales": [
{
"SaleDate": "2020-07-30T18:00:00",
"OrderNumber": "801",
"StoreCode": "1",
"OrderComment": "Order Comments go here",
"RewardPointsSpent":400,
"CustomerBillTo": {
"FirstName": "Lucy",
"LastName": "Smyth",
"CompanyName": ""
,
"Address": "13168 Spruce St",
"City": "Toronto",
(etc)…
Note: Do not include the “RewardPointsSpent” when no rewards points are spent.
See “MyPOS Connect API Sample Calls V2.xlsx” for examples.
MyPOS Connect API v2 dv1.4 14
