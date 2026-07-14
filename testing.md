MyPOS Connect API v2 		
Document Version 1.3		
Table of Contents		
	Title (click to link)	Tab
Customers	GET Customer (Single Database)	9
Customers	PUT Customer (Single Database) (Update) 	10
Customers	POST Customer (Single Database) (New) 	11
Customers	GET Global Customer (Multiple Databases)	12
Customers	PUT Global Customer (Multiple Databases)	13
Products	GET Product Info (Static data - name, classification etc.)	7
Products	GET Product Info (Dynamic - quantity, price, tax etc.)	8
Products	GET Product Info (Dynamic - quantity, price, tax, quantity on order etc.)	19
Products	GET Serial Number	15
Products	GET Product Info for Style (Static data - name, classification etc.)	21
Products	Pagination	16
Reward Points	POST Sale Example with Reward Points Payment	1
Reward Points	POST Commited Reward Points Example	18
Sales	POST Sale Example 1	1
Sales	POST Sale Example 2 with Serial Number	2
Sales	POST Sale Example 3	3
Sales	POST Sale Example 4	4
Sales	POST Sale Example 5	5
Sales	POST Cancel Sale Example	20
Sales	POST Commited Product Quantities Example	6
Sales	POST Refund Example	17
Stores	GET Stores	14

POST Sale Example 1		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	One Product, one tax, ship to address, rewards points spent,
Example	{	discount
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is in military format (24 hour clock)
	            "OrderNumber": "123",	
	            "StoreCode": "1",	
	            "RewardPointsSpent":200,	Optional (should only be included when points are spent)
	            "OrderComment": "Order Comments go here",	Optional
	            "CustomerBillTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smith",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com",	
	                "EmailVerified": "1",	
	                "OKToEmail": "1"	
	            },	
	            "CustomerShipTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smith",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "100010",	
	                    "Quantity": "1",	
	                    "Description": "Pure-Castile Liquid Soap Lavendar",	
	                    "UnitPrice": "10.00",	"UnitPrice" should be the discounted value if applicable
	                    "TaxName": "HST",	Discrepancies will be identified and marked as discounts
	                    "TaxRate": "13.00",	
	                    "TaxAmount": "1.30",	
	                    "LineNumber": "1",	
	                    "SerialNumber": "123456789"	
	                }	
	            ],	
	            "Subtotal": "10.00",	
	            "Discount": {	This discount type works as a payment and simply removes a 
	                 "Amount": -1.00,	value from the total sale.  This discount does not impact taxes
	                 "Name": "General Discount"	Name is any descriptive text
	                },	
	            "Taxes": [	
	                {	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxTotal": "1.30"	
	                }	
	            ],	
	            "TaxTotal": "1.30",	
	            "SaleTotal": "10.30"	
	        }	
	    ]	
	}	<img width="702" height="1027" alt="image" src="https://github.com/user-attachments/assets/ae6bda34-c419-4a03-83b5-0a83f3c2c925" />


POST Sale Example 2		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	Two Products, one tax, ship to address, rewards points
Example	{	spent
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is in military format (24 hour clock)
	            "OrderNumber": "124",	
	            "StoreCode": "1",	
	            "RewardPointsSpent":200,	Optional (should only be included when points are spent)
	            "OrderComment": "Order Comments go here",	Optional
	            "CustomerBillTo": {	
	                "FirstName": "Lucy",	Note the customer last name change from Post Sale 1
	                "LastName": "Smyth",	"Smith" to "Smyth"
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com",	
	                "EmailVerified": "1",	
	                "OKToEmail": "1"	
	            },	
	            "CustomerShipTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smyth",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "100057",	
	                    "Quantity": "3",	
	                    "Description": "Jameson Vitamin E",	
	                    "UnitPrice": "10.00",	Non-Taxable products have "NONE" as the TaxName
	                    "TaxName": "NONE",	Non-Taxable products have "0" as the TaxRate
	                    "TaxRate": "0",	Non-Taxable products have "0" as the TaxAmount
	                    "TaxAmount": "0",	
	                    "LineNumber": "1",	
	                    "SerialNumber": "123456788"	Optional
	                },	
	                {	
	                    "ProductCode": "100010",	
	                    "Quantity": "1",	
	                    "Description": "Pure-Castile Liquid Soap Lavender",	
	                    "UnitPrice": "10.00",	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxAmount": "1.30",	
	                    "LineNumber": "2",	
	                    "SerialNumber": "123456787"	Optional
	                }	
	            ],	
	            "Subtotal": "40.00",	
	            "Taxes": [	
	                {	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxTotal": "1.30"	
	                }	
	            ],	
	            "TaxTotal": "1.30",	
	            "SaleTotal": "41.30"	
	        }	
	    ]	
	}	<img width="685" height="1132" alt="image" src="https://github.com/user-attachments/assets/8a3f1685-177e-4a94-b204-a2e9c029e315" />


  POST Sale Example 3		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	Two Products, two taxes, rewards points spent
Example	{	
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is in military format (24 hour clock)
	            "OrderNumber": "125",	
	            "StoreCode": "1",	
	            "RewardPointsSpent":100,	Optional (should only be included when points are spent)
	            "OrderComment": "",	Optional
	            "CustomerBillTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smyth",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com",	
	                "EmailVerified": "1",	
	                "OKToEmail": "1"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "110026",	
	                    "Quantity": "2",	
	                    "Description": "Goodvibes Kombucha",	
	                    "UnitPrice": "6.5",	
	                    "TaxName": "GST",	
	                    "TaxRate": "5",	
	                    "TaxAmount": ".65",	
	                    "LineNumber": "1",	
	                    "SerialNumber": ""	Optional
	                },	
	                {	
	                    "ProductCode": "100010",	
	                    "Quantity": "1",	
	                    "Description": "Pure-Castile Liquid Soap Lavender",	
	                    "UnitPrice": "10",	
	                    "TaxName": "HST",	
	                    "TaxRate": "13",	
	                    "TaxAmount": "1.3",	
	                    "LineNumber": "2",	
	                    "SerialNumber": ""	Optional
	                }	
	            ],	
	            "Subtotal": "16.50",	
	            "Taxes": [	
	                {	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxTotal": "1.30"	
	                },	
	                {	
	                    "TaxName": "GST",	
	                    "TaxRate": "5",	
	                    "TaxTotal": ".65"	
	                }	
	            ],	
	            "TaxTotal": "1.95",	
	            "SaleTotal": "18.45"	
	        }	
	    ]	
	}	<img width="694" height="1012" alt="image" src="https://github.com/user-attachments/assets/5b0e29ba-b49d-4c8b-a40c-85d32b4f6541" />


  POST Sale Example 4		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	One Product, tax rounding, unused fields eliminated
Example	{	
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is in military format (24 hour clock)
	            "OrderNumber": "128",	
	            "StoreCode": "1",	
	            "RewardPointsSpent":200,	Optional (should only be included when points are spent)
	            "OrderComment": "Order Comments go here",	Optional
	            "CustomerBillTo": {	
	                "FirstName": "Bill",	
	                "LastName": "Brown",	
	                "CompanyName": "",	
	                "Address": "99-100 Webb St.",	
	                "City": "Cambridge",	
	                "Region": "Ontario",	
	                "PostalCode": "N2W 2R4",	
	                "PhoneNumber": "(519) 222-6000",	
	                "EmailAddress": "bbrown@hotmail.com"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "110026",	
	                    "Quantity": "1",	
	                    "Description": "Goodvibes Kombucha",	
	                    "UnitPrice": "6.5",	
	                    "TaxName": "GST",	
	                    "TaxRate": "5",	
	                    "TaxAmount": ".325",	Note "TaxAmount" is NOT rounded
	                    "LineNumber": "1",	
	                }	
	            ],	
	            "Subtotal": "6.50",	
	            "Taxes": [	
	                {	
	                    "TaxName": "GST",	
	                    "TaxRate": "5",	
	                    "TaxTotal": ".33"	Note TaxTotal is rounded to two decimal places
	                }	
	            ],	
	            "TaxTotal": ".33",	
	            "SaleTotal": "6.85"	
	        }	
	    ]	
	}	<img width="694" height="697" alt="image" src="https://github.com/user-attachments/assets/4587bdd9-38da-4661-abcc-d1fa9825cba4" />

  POST Sale Example 5		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	One Product, no tax, bare minimum fields
Example	{	
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is in military format (24 hour clock)
	            "OrderNumber": "133",	
	            "StoreCode": "1",	
	            "CustomerBillTo": {	
	                "EmailAddress": "testAA@gmail.com"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "110026",	
	                    "Quantity": "1",	
	                    "Description": "Goodvibes Kombucha",	
	                    "UnitPrice": "6.5",	
	                    "TaxName": "NONE",	
	                    "TaxRate": "0",	
	                    "TaxAmount": "0",	
	                    "LineNumber": "1",	
	                }	
	            ],	
	            "Taxes": [	
	            ],	
	            "SaleTotal": "6.50"	
	        }	
	    ]	
	}	<img width="669" height="442" alt="image" src="https://github.com/user-attachments/assets/70eccbc6-e214-4c7b-9742-9a8e50a5eb41" />


  POST Product Committed Quantity Example		Notes
Command	POST https://api.myposconnect.com/api/v2/CommitQty	
Example	{	IMPORTANT:  If the order is cancelled there are 
	OrderedQuantities: 	two ways to reverse the committed quantities
	[	1) POST a zero value sale (see tab 20)
	{	2) POST the Committed Quantitys as negative values
	        "StoreCode": "1",	to relieve the quantity already committed
	        "OrderNumber": "135",	
	        "Items": [	
	{	
	ProductCode: "100010",	
	Quantity: "1",	
	LineNumber: "1"	
	                    },	
	                    {	
	                    "ProductCode": "100010",	
	                    "Quantity": "2",	
	                    "LineNumber": "2"	
	                    }	
	                  ]	
	    },	
	    {	
	        "StoreCode": "1",	
	        "OrderNumber": "136",	
	        "Items": [	
	                   {	
	                    "ProductCode": "100014",	
	                    "Quantity": "1",	
	                    "LineNumber": "1"	
	                }                       	
	                 ]       	
	        }	
	]	
	}	<img width="656" height="517" alt="image" src="https://github.com/user-attachments/assets/72575f6c-1000-4473-9660-81b08af8214d" />

  Get General Product Data Example		Notes
Command	GET https://api.myposconnect.com/api/v2/naproducts/100010	All static data from single product
Result	{	
	    "productId": "93f9153b-9aa4-4f09-a5ca-12a5f25afe55",	
	    "productCode": "100010",	
	    "shortDescription": "Pure-Castile Liquid ",	
	    "longDescription": "Pure-Castile Liquid Soap Lavendar",	
	    "buttonText": "Pure-Castile Liquid Soap Lavendar",	
	    "brand": "Dr. Bronner",	
	    "fullDescription": "Scented with pure lavender and lavandin oils to calm the mind and soothe the body! Dr. Bronner's Pure-Castile Lavender Liquid Soap is concentrated, biodegradable, versatile and effective. Made with organic and certified fair trade ingredients, packaged in a 100% post-consumer recycled bottle. All-One!",	 
	    "barcode": "100010",	
	    "productSize": "",	
	    "styleCode": "1000",	
	    "styleDescription": "1000",	.
	    "productColour": "",	
	    "productType": "S",	"A = Serial Number Item
B = Barcode Price
E = Gift Voucher Price Special
H = Gift Voucher Standard Item
K = Ticket
M = Modifier 
Q = Modifier with Edit Description 
S = Standard Item
U = Bundle
W = Weighed Item
Z = Memo"
	    "rewardPoints": 0,	Use for additional reward points
	    "allowDiscounts": true,	
	    "productNotes": "",	
	    "stockControl": "Y",	
	    "active": true,	
	    "binLocation": "",	
	    "imageFilename": "",	
	    "productClass1": "Cleaning Supplies",	
	    "productClass2": "Soap",	
	    "productClass3": "",	
	    "productClass4": "",	
	    "supplierName": "ABC Importers",	
	    "productTitle": null,	
	    "productWeight": null,	
	    "webHoldback": 0.0,	
	    "webOrders": false,	
	    "lastModified": null,	
	    "unpackedFrom": null,	Will display the "Parent" product and unpack quantity
	    "packedInto": null,	Will display the "Child" product components
	    "otherProductClasses": [	
	        "Environmentally Friendly",	
	        "Natural"	
	    ],	
	    "cC_001": null,	
	    "cC_002": null,	
	    "cC_003": null,	
	    "cC_004": null,	
	    "cC_005": null,	
	    "cC_006": null,	
	    "cC_007": null,	
	    "cC_008": null,	
	    "cC_009": null,	
	    "cC_010": null,	
	    "lastEditUser": "99-IMPORT",	
	    "creationUser": "99-IMPORT",	
	    "lastEditDevice": "TRS-IMPORT",	
	    "creationDevice": "TRS-IMPORT",	
	    "lastEditDate": "2020-08-25T13:02:16.967",	
	    "creationDate": "2020-08-25T13:02:16.96"	
	}	<img width="827" height="1008" alt="image" src="https://github.com/user-attachments/assets/0a30c45d-ddd9-4887-a173-1f43812fcd1d" />


  Get Product Data (Dynamic) Example		Notes
Command	GET  https://api.myposconnect.com/api/v2/productspq/1~100010	
Result	[	
	    {	All dynamic data from single product
	        "customSortRowNumber": 1,	https://api.myposconnect.com/api/v2/productspq/{StoreCode}~{ProductCode}
	        "liTotalCount": 1,	
	        "storeCode": "1",	
	        "productCode": "100010",	All dynamic data for all products change since UTC time
	        "quantity": 0.00000,	https://api.myposconnect.com/api/v2/productspq/~{StoreCode}~YYYY-MM-DD HH:MM:SS.000
	        "webPrice": 20.0000,	Note the two ~s
	        "price01": 20.0000,	Must use military time format UTC time
	        "price02": 0.0000,	
	        "price03": 0.0000,	"WebPrice" = "Price01" and is only included for backward compatibility
	        "price04": 0.0000,	
	        "price05": 0.0000,	
	        "price06": 0.0000,	
	        "price07": 0.0000,	
	        "price08": 0.0000,	
	        "price09": 0.0000,	
	        "price10": 0.0000,	
	        "taxGroup": "Sales Tax",	
	        "saleEnabled1": false,	
	        "salePrice1": null,	
	        "saleStartDate1": null,	
	        "saleEndDate1": null,	
	        "saleEnabled2": false,	
	        "salePrice2": null,	
	        "saleStartDate2": null,	
	        "saleEndDate2": null,	
	        "webHoldback": 0.00000	
	    }	
	]	<img width="989" height="487" alt="image" src="https://github.com/user-attachments/assets/bd4913ff-c85a-494a-bcc2-04fa99f9ef05" />




Get Customer Example (Single Database)		Notes
Command	GET https://api.myposconnect.com/api/v2/naCustomers/lucy@test.com	Customers are retreived using customer code 
Result	{	or email address. 
	    "customerId": "f092097a-82a8-41a3-9a61-48cf174de612",	Global Customers can only be retrieved by email address
	    "customerCode": "1000070",	
	    "customerName": "",	
	    "address": "13168 Spruce St",	
	    "city": "Toronto",	
	    "region": "Ontario",	
	    "postalCode": "M4W 1R5",	
	    "country": "Canada",	
	    "phoneNumber": "(416) 877-6000",	
	    "faxNumber": "(416) 877-6000",	
	    "emailAddress": "lucy@test.com",	
	    "webSite": "",	
	    "creditLimit": 0.00000,	
	    "notes": "",	
	    "active": true,	
	    "customerType": "Adult",	
	    "rewardsCollector": false,	
	    "rewardsNumber": "",	
	    "rewardsValue": 65.00000,	
	    "firstSaledate": null,	
	    "lastSaledate": null,	Total Points
	    "allowMailing": true,	
	    "allowDataShare": false,	
	    "firstName": "Lucy",	
	    "lastName": "Smyth",	
	    "bankSortCode": null,	
	    "bankAccount": null,	
	    "bankAccountName": null,	
	    "correspondenceEmail": false,	
	    "correspondencePaper": false,	
	    "discountPercent": 0.00000,	
	    "priceBand": 1,	
	    "balance": 0.0000,	
	    "cC_001": null,	
	    "cC_002": null,	
	    "cC_003": null,	
	    "cC_004": null,	
	    "cC_005": null,	
	    "cC_006": null,	
	    "cC_007": null,	
	    "cC_008": null,	
	    "cC_009": null,	
	    "cC_010": null,	
	    "lastEditUser": "WEB",	
	    "creationUser": "WEB",	
	    "lastEditDevice": "Web",	
	    "creationDevice": "Web",	
	    "lastEditDate": "2020-08-21T12:47:18.177",	
	    "creationDate": "2020-07-28T12:31:47.417"	
	}	<img width="788" height="802" alt="image" src="https://github.com/user-attachments/assets/2f42efc5-40d5-4967-91b0-1c3be5e987cd" />

Update Customer Example (Single Database) 		Notes
Command	PUT https://api.myposconnect.com/api/v2/naCustomers/email@email.com	
Example	{	To obtain a list of available fields, 
	            "Customers": [	utilize the GET Customer
	                                {	
	                                               "LastName": "Brown",	
	                                               "Region": "NY",	
	                                }	
	                ]	
	}	<img width="759" height="157" alt="image" src="https://github.com/user-attachments/assets/7225a08e-1c30-4583-bb9d-cdca5a5b56a6" />


  POST Customer Example (Single Database) (New)		Notes
Command	POST https://api.myposconnect.com/api/v2/naCustomers	When customer are sent with Sales records they
Example	{	will be inserted or updated as required so this call 
	        "Customers": [	is not required in those cases
	            {	
	                "customerName": "Test Company Name",	Customers are updated via email address.
	                "firstName": "Charlie",	
	                "lastName": "Brown",	Customer Code cannot be inserted via the API.  
	                "address": "550 Parkside Drive Unit B9",	
	                "city": "Waterloo",	
	                "region": "ON",	
	                "postalCode": "N2L 5V4",	
	                "country": "Canada",	
	                "phoneNumber": "519-578-8667",	
	                "faxNumber": "519-578-0176",	
	                "emailAddress": "CharlieBrown@email.com",	
	                "webSite": "",	
	                "rewardsCollector": true,	
	                "allowMailing": true,	
	                "allowDataShare": true,	
	                "firstName": "Charlie",	
	                "lastName": "Brown",	
	                "discountPercent": 10.00000,	
	                "notes": ""	
	            }	
	        ]	
	    }	<img width="683" height="412" alt="image" src="https://github.com/user-attachments/assets/a26aba51-1d44-4846-9db6-5119557fe9aa" />


Get Global Customer Example		Notes
Command	GET https://api.myposconnect.com/api/globalcustomers/email@email.com	Global Customers are retreived using email address 
Result	[	
	{	
	"value": [	
	{	
	"active": true,	
	"companyName": "",	
	"address": "550 Parkside Drive Unit B9",	
	"city": "Waterloo",	
	"region": "Ontario",	
	"postalCode": "N2L 5V4",	
	"country": "",	
	"phoneNumber": "",	
	"mobileNumber": "5195788667",	
	"emailAddress": "email@email.com",	
	"rewardsValue": 656.00000,	
	"firstName": "Heidi",	
	"lastName": "Stieh",	
	"totalGlobalSpend":  656.00000,	
	"creationDate": "2018-11-20T11:50:34.727",	
	"creationDateUTC": "2018-11-20T16:50:30.61",	
	"lastEditDate": "2019-06-11T09:42:41.873",	
	"lastEditDateUTC": "2019-06-11T14:00:00.473"	
	}	
	]	<img width="748" height="397" alt="image" src="https://github.com/user-attachments/assets/7bc0cbca-fecb-43c5-896d-2756dbc7f47d" />
Update Global Customer Example	
Command	PUT https://api.myposconnect.com/api/TRSglobalcustomers/heidis@tricityretail.com
Example	{
	            "GlobalCustomers": [
	                                {
	                                     "PhoneNumber": " 416-578-8667",
	                                     "firstName": "Charlie",
	                                     "lastName": "Brown",
	                                     "Region": "ON",
	                                     "FaxNumber": ""
	                                }
	                ]<img width="556" height="187" alt="image" src="https://github.com/user-attachments/assets/3868f307-1b93-4c00-8074-42a2d0239d82" />


GET Stores Example		Notes
Command	GET https://api.myposconnect.com/api/v2/Stores	StoreID and StoreCode are unique
Results	[	
	{	
	"value": [	
	{	
	"storeId": "25c60b77-80f7-4772-8ef1-75b308cd2e4c",	
	"storeCode": "1",	
	"storeName": "Green Daisy #101",	
	"address": "550 Parkside Drive Unit B9",	
	"city": "Waterloo",	
	"region": "ON",	
	"postalCode": "N2L 5E7",	
	"country": "Canada",	
	"phoneNumber": "1-877-877-4767",	
	"faxNumber": "",	
	"emailAddress": "store1@greendaisy.com",	
	"webSite": "www.greendaisy.com",	
	"taxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"vatTaxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"currencyId": "955322d7-dcd8-4b2e-9a5d-f88865bab7f0",	
	"priceListId": null,	
	"active": true,	
	"zoneAreaId": "209f8915-1679-47fa-83ec-48a1f94ac8e1",	
	"cC_001": null,	
	"cC_002": null,	
	"cC_003": null,	
	"cC_004": "352466297904852802033382",	
	"cC_005": null,	
	"cC_006": null,	
	"cC_007": null,	
	"cC_008": null,	
	"cC_009": null,	
	"cC_010": null,	
	"lastEditUser": "99",	
	"creationUser": "99",	
	"lastEditDevice": "1",	
	"creationDevice": "1",	
	"lastEditDate": "2018-07-25T11:52:19.533",	
	"creationDate": "2014-03-10T08:08:13.633",	
	"creationDateUTC": null,	
	"lastEditDateUTC": "2018-07-25T15:52:19.53",	
	"visibilityId": null	
	},	
	{	
	"storeId": "a2e4f846-059d-42a6-8a9a-efa6fafb7360",	
	"storeCode": "3",	
	"storeName": "Green Daisy #103",	
	"address": "550 Parkside Drive Unit B9",	
	"city": "Waterloo",	
	"region": "",	
	"postalCode": "",	
	"country": "",	
	"phoneNumber": "",	
	"faxNumber": "",	
	"emailAddress": "store3@greendaisy.com",	
	"webSite": "www.greendaisy.com",	
	"taxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"vatTaxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"currencyId": "955322d7-dcd8-4b2e-9a5d-f88865bab7f0",	
	"priceListId": null,	
	"active": true,	
	"zoneAreaId": null,	
	"cC_001": "25c60b77-80f7-4772-8ef1-75b308cd2e4c",	
	"cC_002": null,	
	"cC_003": null,	
	"cC_004": null,	
	"cC_005": null,	
	"cC_006": null,	
	"cC_007": null,	
	"cC_008": null,	
	"cC_009": null,	
	"cC_010": null,	
	"lastEditUser": "99",	
	"creationUser": "99",	
	"lastEditDevice": "1",	
	"creationDevice": "1",	
	"lastEditDate": "2018-07-25T11:52:19.533",	
	"creationDate": "2017-10-11T09:29:13.713",	
	"creationDateUTC": "2017-10-11T13:29:03.15",	
	"lastEditDateUTC": "2018-07-25T15:52:19.53",	
	"visibilityId": null	
	},	
	{	
	"storeId": "3388d77f-2569-4190-9ddb-f8a97a96159d",	
	"storeCode": "2",	
	"storeName": "Green Daisy #102",	
	"address": "550 Parkside Drive Unit B9",	
	"city": "Waterloo",	
	"region": "",	
	"postalCode": "",	
	"country": "",	
	"phoneNumber": "",	
	"faxNumber": "",	
	"emailAddress": "store2@greendaisy.com",	
	"webSite": "www.greendaisy.com",	
	"taxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"vatTaxRateId": "3402d8fd-6362-e311-bb77-d4ae52b94eec",	
	"currencyId": "955322d7-dcd8-4b2e-9a5d-f88865bab7f0",	
	"priceListId": null,	
	"active": true,	
	"zoneAreaId": null,	
	"cC_001": null,	
	"cC_002": null,	
	"cC_003": null,	
	"cC_004": "266331262152626694064960",	
	"cC_005": null,	
	"cC_006": null,	
	"cC_007": null,	
	"cC_008": null,	
	"cC_009": null,	
	"cC_010": null,	
	"lastEditUser": "99",	
	"creationUser": "99",	
	"lastEditDevice": "1",	
	"creationDevice": "TRS",	
	"lastEditDate": "2018-07-25T11:52:19.533",	
	"creationDate": "2016-03-30T11:19:29.61",	
	"creationDateUTC": "2016-03-30T15:18:57.01",	
	"lastEditDateUTC": "2018-07-25T15:52:19.53",	
	"visibilityId": null	
	}	
	],	
	"formatters": [],	
	"contentTypes": [],	
	"declaredType": null,	
	"statusCode": 200	
	}	
	]	<img width="677" height="1942" alt="image" src="https://github.com/user-attachments/assets/565dd640-1d82-47e8-aa55-ddc5436c197f" />



GET Serial Number Example		Notes
Command	GET https://api.myposconnect.com/api/v2/ProductSerial/1~AB85654~559977	Check Store 1 for Product Code AB85654, serial number 559977 
Results	[	
	    {	Status "0" indicaes "Available"
	        "serialNumberStatus": 0	Status "1" indicaes "Sold"
	    }	
	]	<img width="992" height="112" alt="image" src="https://github.com/user-attachments/assets/457be3e7-b483-49c2-ac0c-275428ff01db" />


  PAGINATION

Your page size will dictate how many pages you need to request.  For example:  Assume that you have 100 products.  You can use the following set of calls to obtain 100 products:

Request all the products
GET https://api.myposconnect.com/api/v2/naproducts

One way to get 100 products
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=100&liPage=1

Another way to get 100 products
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=50&liPage=1
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=50&liPage=2

Yet another way to get 100 products
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=25&liPage=1
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=25&liPage=2
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=25&liPage=3
GET https://api.myposconnect.com/api/v2/naproducts?liPageSize=25&liPage=4

To get the stores list with pagination
GET https://api.myposconnect.com/api/v2/Stores?liPageSize=10&liPage=1<img width="856" height="337" alt="image" src="https://github.com/user-attachments/assets/e7fe4aee-ecbc-4dc2-a8c8-8ae09e9ad3d8" />


POST Refund Example		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	Important:  Refunds must have a unique order number.  An "R" can be added to the original order number to make it unique
Example	{	
	    "Sales": [	
	        {	
	            "SaleDate": "2019-08-07T18:00:00",	Time is UTC and in military format (24 hour clock)
	            "OrderNumber": "123R",	Order number must not match existing order
	            "StoreCode": "1",	
	            "OrderComment": "Order Comments go here",	
	            "RewardPointsSpent":-400	Must be negative to refund
	            "CustomerBillTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smith",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com",	
	                "EmailVerified": "1",	
	                "OKToEmail": "1"	
	            },	
	            "CustomerShipTo": {	
	                "FirstName": "Lucy",	
	                "LastName": "Smith",	
	                "CompanyName": "",	
	                "Address": "13168 Maple Street",	
	                "City": "Toronto",	
	                "Region": "Ontario",	
	                "Country": "Canada",	
	                "PostalCode": "M4W 1R5",	
	                "PhoneNumber": "(416) 877-6000",	
	                "FaxNumber": "(416) 877-6000",	
	                "EmailAddress": "lucy@test.com"	
	            },	
	            "Items": [	
	                {	
	                    "ProductCode": "100010",	
	                    "Quantity": "-1",	Must be negative to refund
	                    "Description": "Pure-Castile Liquid Soap Lavendar",	
	                    "UnitPrice": "10.00",	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxAmount": "-1.30",	Must be negative to refund
	                    "LineNumber": "1",	
	                    "SerialNumber": "123456789"	
	                }	
	            ],	
	            "Subtotal": "-10.00",	Must be negative to refund
	            "Taxes": [	
	                {	
	                    "TaxName": "HST",	
	                    "TaxRate": "13.00",	
	                    "TaxTotal": "-1.30"	Must be negative to refund
	                }	
	            ],	
	            "TaxTotal": "-1.30",	Must be negative to refund
	            "SaleTotal": "-11.30"	Must be negative to refund
	        }	
	    ]	
	}	<img width="1101" height="967" alt="image" src="https://github.com/user-attachments/assets/a0fee884-dc5e-498e-b114-20ca11c87a3c" />


POST Commit Reward Points Example		Notes
Command	POST https://api.myposconnect.com/api/v2/CommitPts	
Example	{	To obtain current points value ("rewardsValue")
	    "CommittedPoints": 	utilize GET Customer
	    [	
	        {	
	            "StoreCode":"1",	Commited points can be reversed by sending a
	            "OrderNumber": "806",	negative "Points" value
	            "EmailAddress": "lucy@test.com",	
	            "Points": 100	
	        }	
	    ]	
	}	<img width="701" height="202" alt="image" src="https://github.com/user-attachments/assets/de408a21-e58b-4cbb-812e-478ae733a039" />


Get Product Data with Quantity Ordered (Dynamic) Example		Notes
Command	https://api.myposconnect.com/api/v2/productspqo/001~100010	
Results	[	** This call is identical to the "GET  https://api.myposconnect.com/api/v2/productspq/..."
	    {	call except includes "Quanitty On Order".  If you do not need Quantity On Order, it is recommnended 
	        "customSortRowNumber": 1,	that you use the other call
	        "liTotalCount": 1,	
	        "storeCode": "001",	
	        "productCode": "100010",	All dynamic data from single product
	        "quantity": 4.00000,	https://api.myposconnect.com/api/v2/productspo/{StoreCode}~{ProductCode}
	        "webPrice": 20.0000,	
	        "price01": 20.0000,	
	        "price02": 0.0000,	All dynamic data for all products change since UTC time
	        "price03": 0.0000,	https://api.myposconnect.com/api/v2/productspo/~{StoreCode}~YYYY-MM-DD HH:MM:SS.000
	        "price04": 0.0000,	Note the two ~s
	        "price05": 0.0000,	Must use military time format UTC time
	        "price06": 0.0000,	
	        "price07": 0.0000,	
	        "price08": 0.0000,	"WebPrice" = "Price01" and is only included for backward compatibilty
	        "price09": 0.0000,	
	        "price10": 0.0000,	
	        "taxGroup": "Sales Tax",	
	        "saleEnabled1": false,	
	        "salePrice1": null,	
	        "saleStartDate1": null,	
	        "saleEndDate1": null,	
	        "saleEnabled2": false,	
	        "salePrice2": null,	
	        "saleStartDate2": null,	
	        "saleEndDate2": null,	
	        "quantityOnOrder": 0.00000	
	        "webHoldback": 0.00000	
	    }	
	]	<img width="1008" height="502" alt="image" src="https://github.com/user-attachments/assets/bcd1d82c-889a-428b-b752-a42f8a2be484" />

  POST Cancel Sale Example		Notes
Command	POST https://api.myposconnect.com/api/v2/Sale	
Example	{	
	    "Sales": [	
	        {	
	            "SaleDate": "2020-11-19",	Any date 
	            "OrderNumber": "1008",	Order number you wish to cancel
	            "StoreCode": "001",	Store number associated with store
	            "SaleTotal":"0.00"	0.00
	        }	
	    ]	
	}	<img width="593" height="187" alt="image" src="https://github.com/user-attachments/assets/a5fc2fc2-5707-42f3-bf8a-913633e61fa6" />



Get Product Data by Style Code Example		Notes
Command	GET https://api.myposconnect.com/api/v2/naproducts?filt_stylecode_str=STY001	All static data from product with the style specified (STY001)
Result	[	
	    {	
	        "customSortRowNumber": 1,	First of records
	        "liTotalCount": 2,	Number of total records
	        "productId": "D0D6ADBE-7974-4C3E-9C22-3489789C8D39",	
	        "productCode": "STYLE02",	
	        "shortDescription": "STYLE 02",	
	        "longDescription": "STYLE 02",	 
	        "buttontext": "STYLE 02",	
	        "brand": "",	
	        "fullDescription": "STYLE 02",	
	        "barcode": "STYLE02",	.
	        "productSize": "XS",	
	        "styleCode": "STY001",	
	        "styleDescription": "STYLE 001",	
	        "productColour": "GREEN",	
	        "productType": "S",	
	        "rewardPoints": 0,	
	        "allowDiscounts": true,	
	        "productNotes": "STYLE 02",	
	        "stockControl": "Y",	
	        "active": true,	
	        "binLocation": "",	
	        "imageFilename": "",	
	        "productClass1": "GIFT SHOP",	
	        "productClass2": null,	
	        "productClass3": null,	
	        "productClass4": null,	
	        "supplierName": "ABBOTT",	
	        "productTitle": null,	
	        "productWeight": null,	
	        "webHoldback": 0.00000,	Will display the "Parent" product and unpack quantity
	        "webOrders": true,	Will display the "Child" product components
	        "cC_001": "",	
	        "cC_002": "",	
	        "cC_003": "",	
	        "cC_004": "",	
	        "cC_005": "",	
	        "cC_006": "",	
	        "cC_007": null,	
	        "cC_008": null,	
	        "cC_009": null,	
	        "cC_010": null,	
	        "lastModified": "2020-09-30T20:43:09.457",	
	        "lastEditUser": "CashierName",	
	        "creationUser": "Copy",	
	        "lastEditDevice": "Lane 1",	
	        "creationDevice": "Copy",	
	        "lastEditDate": "2020-09-30T16:44:51.2",	
	        "creationDate": "2018-09-07T17:13:15.58"	
	    },	
	    {	
	        "customSortRowNumber": 2,	Second of 2
	        "liTotalCount": 2,	
	        "productId": "B6380EE4-4C75-404D-A5BF-2416987EA922",	
	        "productCode": "STYLE03",	
	        "shortDescription": "STYLE 03",	
	        "longDescription": "STYLE 03",	
	        "buttontext": "STYLE 03",	
	        "brand": "",	
	        "fullDescription": "STYLE 03",	
	        "barcode": "STYLE03",	
	        "productSize": "S",	
	        "styleCode": "STY001",	
	        "styleDescription": "STYLE 001",	
	        "productColour": "GREEN",	
	        "productType": "S",	
	        "rewardPoints": 0,	
	        "allowDiscounts": true,	
	        "productNotes": "STYLE 03",	
	        "stockControl": "Y",	
	        "active": true,	
	        "binLocation": "",	
	        "imageFilename": "Canada.png",	
	        "productClass1": "GIFT SHOP",	
	        "productClass2": null,	
	        "productClass3": null,	
	        "productClass4": null,	
	        "supplierName": "ABBOTT",	
	        "productTitle": null,	
	        "productWeight": null,	
	        "webHoldback": 0.00000,	
	        "webOrders": true,	
	        "cC_001": "",	
	        "cC_002": "",	
	        "cC_003": "",	
	        "cC_004": "",	
	        "cC_005": "",	
	        "cC_006": "",	
	        "cC_007": null,	
	        "cC_008": null,	
	        "cC_009": null,	
	        "cC_010": null,	
	        "lastModified": "2020-09-30T20:45:01.707",	
	        "lastEditUser": "CashierName",	
	        "creationUser": "Copy",	
	        "lastEditDevice": "Lane 1",	
	        "creationDevice": "Copy",	
	        "lastEditDate": "2020-09-30T16:45:05.89",	
	        "creationDate": "2018-09-07T17:14:11.33"	
	    }	
	]	<img width="863" height="1567" alt="image" src="https://github.com/user-attachments/assets/aa54d670-45e2-4765-b92b-4e8b721d9713" />

