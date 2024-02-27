// Using scaleleap SDK ('npm i -s @scaleleap/selling-partner-api-sdk'): https://www.npmjs.com/package/@scaleleap/selling-partner-api-sdk?activeTab=readme
// Using axios ('npm install axios')
// Using qs ('npm install qs')
// Using CSV Parser ('npm install csv-parser')
// Using CSV Writer ('npm install csv-writer')
// Using dotenv ('npm install dotenv')

require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const csv = require('csv-parser');
const readline = require('readline');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { SellersApiClient, CatalogItemsApiClientV20220401, ProductPricingApiClient, ProductFeesApiClient } = require('@scaleleap/selling-partner-api-sdk');

// Global Variables
let accessToken = ''; // Global variable to store the access token
let ASINlist = [];
let AMZoffer = [];
let UPClist = [];
let CostList = [];
let feesEstimates = [];
let RankList = [];
let profits = [];
let ItemNoList = [];
const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
const clientId = process.env.AMAZON_CLIENT_ID;
const clientSecret = process.env.AMAZON_CLIENT_SECRET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptForCSVFilePath() {
    return new Promise((resolve) => {
        rl.question('Enter the path to your CSV file: ', (filePath) => {
            resolve(filePath);
            rl.close();
        });
    });
}
// COULD ADD THIS TO REPLACE *******************************************************
// class CSVDataProcessor {
//     constructor(filePath) {
//         this.filePath = filePath;
//         this.UPClist = [];
//         this.CostList = [];
//         this.ItemNoList = [];
//     }

//     normalizeHeader(header) {
//         return header.replace(/^\uFEFF/, '').trim();
//     }

//     async findFirstMatchingHeader(optionsList) {
//         const fileStream = fs.createReadStream(this.filePath);
//         const rl = readline.createInterface({
//             input: fileStream,
//             crlfDelay: Infinity
//         });

//         for await (const line of rl) {
//             const headers = line.split(',').map(header => this.normalizeHeader(header));
//             for (const option of optionsList) {
//                 const index = headers.findIndex(header => header === this.normalizeHeader(option));
//                 if (index !== -1) {
//                     rl.close();
//                     await new Promise(resolve => fileStream.on('close', resolve));
//                     return index;
//                 }
//             }
//             break;
//         }

//         rl.close();
//         await new Promise(resolve => fileStream.on('close', resolve));
//         return -1;
//     }

//     async getDataFromCSV() {
//         try {
//             const UPCOptions = ['UPC', 'Upc'];
//             const itemNoOptions = ['Item No.', 'Item Number', 'SKU'];
//             const priceOptions = ['FIRST_PricePerPiece', 'Price', 'Price Per Piece'];

//             const firstUPCHeaderIndex = await this.findFirstMatchingHeader(UPCOptions);
//             const firstItemNoHeaderIndex = await this.findFirstMatchingHeader(itemNoOptions);
//             const firstPriceHeaderIndex = await this.findFirstMatchingHeader(priceOptions);

//             await new Promise((resolve, reject) => {
//                 fs.createReadStream(this.filePath)
//                     .pipe(csv({
//                         mapHeaders: ({ index }) => {
//                             if (index === firstUPCHeaderIndex) return 'UPC';
//                             if (index === firstItemNoHeaderIndex) return 'ItemNo';
//                             if (index === firstPriceHeaderIndex) return 'Price';
//                             return null;
//                         }
//                     }))
//                     .on('data', row => {
//                         if ('UPC' in row) this.UPClist.push(row['UPC']);
//                         if ('Price' in row) this.CostList.push(row['Price']);
//                         if ('ItemNo' in row) this.ItemNoList.push(row['ItemNo']);
//                     })
//                     .on('end', () => {
//                         console.log('CSV file successfully processed:');
//                         console.log('UPC List:', this.UPClist);
//                         console.log('Cost List:', this.CostList);
//                         console.log('Item No List:', this.ItemNoList);
//                         resolve();
//                     })
//                     .on('error', reject);
//             });
//         } catch (error) {
//             console.error('Error processing CSV file:', error);
//         }
//     }
// }

// // Usage
// async function processCSVFile(filePath) {
//     const processor = new CSVDataProcessor(filePath);
//     await processor.getDataFromCSV();
//     // Processed data is now within the processor instance, e.g., processor.UPClist
// }

function normalizeHeader(header) {
    return header.replace(/^\uFEFF/, '').trim(); // Remove BOM and trim whitespace
}

async function findFirstMatchingHeader(filePath, optionsList) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const headers = line.split(',').map(normalizeHeader); // Assuming comma-separated values; adjust according to your file's actual delimiter
        for (const option of optionsList) {
            const index = headers.findIndex(header => header === normalizeHeader(option));
            if (index !== -1) {
                rl.close();
                fileStream.close();
                return index; // Return the index of the first matching header
            }
        }
        break; // Only process the first line
    }
}

async function getDataFromCSV() {
    const filePath = await promptForCSVFilePath();
    const UPCOptions = ['UPC', 'Upc'];
    const itemNoOptions = ['Item No.', 'Item Number', 'SKU'];
    const priceOptions = ['FIRST_PricePerPiece', 'Price', 'Price Per Piece'];

    const firstUPCHeaderIndex = await findFirstMatchingHeader(filePath, UPCOptions);
    const firstItemNoHeaderIndex = await findFirstMatchingHeader(filePath, itemNoOptions);
    const firstPriceHeaderIndex = await findFirstMatchingHeader(filePath, priceOptions);

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ index }) => {
                    if (index === firstUPCHeaderIndex) return 'UPC';
                    if (index === firstItemNoHeaderIndex) return 'ItemNo';
                    if (index === firstPriceHeaderIndex) return 'Price';
                    return null; // Ignore other columns
                }
            }))
            .on('data', (row) => {
                if ('UPC' in row) {
                    UPClist.push(row['UPC']);
                }
                if ('Price' in row) {
                    CostList.push(row['Price']);
                }
                if ('ItemNo' in row) {
                    ItemNoList.push(row['ItemNo']);
                }
            })
            .on('end', () => {
                console.log('CSV file successfully processed:');
                console.log('UPC List:', UPClist);
                console.log('Cost List:', CostList);
                console.log('Item No List:', ItemNoList);
                resolve();
            })
            .on('error', reject);
    });
}

// THIS *******************************************************************************************************

function calculateProfits() {
    // Ensure that CostList contains numeric values
    const numericCostList = CostList.map(cost => parseFloat(cost.replace(/[^\d.-]/g, '')) || 0);

    for (let i = 0; i < ASINlist.length; i++) {
        const asin = ASINlist[i] || 'Unknown';
        const offer = AMZoffer.find(offer => offer.ASIN === asin);
        const feesEstimate = feesEstimates.find(fee => fee.ASIN === asin);
        const cost = numericCostList[i]; // Use the numeric cost from the updated list

        // Calculate profit only if we have a valid offer and fees estimate
        let profit = offer && feesEstimate ? offer.OfferPrice - (feesEstimate.FeesEstimate + cost) : 0;

        profits.push({
            ItemNo: ItemNoList[i],
            UPC: UPClist[i] || 'Unknown', // Use Unknown if UPC is missing
            ASIN: asin,
            SalesRank: RankList[i] || -1, // Use -1 if SalesRank is missing
            ListPrice: offer ? offer.OfferPrice : 0,
            Fees: feesEstimate ? feesEstimate.FeesEstimate : 0,
            Cost: cost,
            Profit: profit
        });
    }

    console.log(profits);
    return profits;
}

function filterAndWriteToCSV() {
    value = 5; // in the future get value from user
    // Filter for profits greater than or equal to the specified value
    const filteredProfits = profits.filter(item => item.Profit >= value);

    // Define the path and headers for the CSV file
    const csvWriter = createCsvWriter({
        path: 'Research.csv',
        header: [
            { id: 'ItemNo', title: 'Item No.' },
            { id: 'UPC', title: 'UPC' },
            { id: 'ASIN', title: 'ASIN' },
            { id: 'SalesRank', title: 'SalesRank' },
            { id: 'ListPrice', title: 'ListPrice' },
            { id: 'Fees', title: 'Fees' },
            { id: 'Cost', title: 'Cost' },
            { id: 'Profit', title: 'Profit' },
        ]
    });

    // Write the filtered data to the CSV file
    csvWriter.writeRecords(filteredProfits)
        .then(() => {
            console.log('The CSV file was written successfully');
            process.exit(0); // Exit the process after writing the file successfully
        })
        .catch((error) => {
            console.error('Error writing CSV file:', error);
            process.exit(1); // Exit with an error code if writing the file fails
        });
}

async function getTokenAndMakeApiCall() {
    // Step 1: Obtain the Access Token
    try {
        // Obtain the Access Token
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://api.amazon.com/auth/o2/token',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            data: qs.stringify({
                'grant_type': 'refresh_token',
                'refresh_token': refreshToken,
                'client_id': clientId,
                'client_secret': clientSecret
            })
        });

        accessToken = tokenResponse.data.access_token;
        console.log("Access Token:", accessToken);

        // Step 2: Assume an AWS Role using STS
        const stsClient = new STSClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });

        const { Credentials } = await stsClient.send(
            new AssumeRoleCommand({
                RoleArn: 'arn:aws:iam::851725415836:role/SellingPartnerAPIRole',
                RoleSessionName: 'SellingPartnerAPIRole',
            })
        );

        // Step 3: Make API Calls using the SellersApiClient
        const client = new SellersApiClient({
            accessToken: accessToken,
            basePath: 'https://sellingpartnerapi-na.amazon.com',
            region: 'us-east-1',
            credentials: {
                accessKeyId: Credentials.AccessKeyId,
                secretAccessKey: Credentials.SecretAccessKey,
                sessionToken: Credentials.SessionToken,
            }
        });

        await searchCatalogItemsByUPC();
        await getItemOffersForASIN();
        await getFeesEstimateForASINList();

        // Additional API calls can be made here using the `client`
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

// Function to refresh the token
async function getTokenRefresh() {
    let retryCount = 0;
    const maxRetries = 3; // Maximum number of retries
    const retryDelay = 10000; // Delay between retries in milliseconds
    while (retryCount < maxRetries) {
        try {
            const tokenResponse = await axios({
                method: 'post',
                url: 'https://api.amazon.com/auth/o2/token',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                data: qs.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId,
                    client_secret: clientSecret,
                }),
            });

            accessToken = tokenResponse.data.access_token;
            console.log("Access Token refreshed:", accessToken);
            return; // Token refreshed successfully, exit the function
        } catch (error) {
            console.error("Error refreshing token:", error.response ? error.response.data : error.message);
            retryCount++;
            if (retryCount >= maxRetries) {
                throw new Error("Failed to refresh access token after maximum retry attempts.");
            }
            await delay(retryDelay);
        }
    }
}

/*  
    https://selling-partner-api-sdk.scaleleap.org/classes/catalogitemsapiclientv20220401#searchCatalogItems
    This function traverses through the array of UPC's and gets their sales rank and ASIN. If they are not found this is handled by
    putting a '-1' into the slot the data would have gone. 
*/
// CAN PASS AN ARRAY OF UPCS TO THE API CALL TO SPEED THINGS UP!!!! But need to figure out how to handle unfound UPCs in that case. 
async function searchCatalogItemsByUPC() {
    const client = new CatalogItemsApiClientV20220401({
        accessToken: accessToken,
        region: 'us-east-1', // Make sure to set the appropriate region
    });

    for (const UPC of UPClist) {
        let retryCount = 0;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 3000; // Delay between retries in milliseconds
        while (retryCount < maxRetries) {
            try {
                const response = await client.searchCatalogItems({
                    marketplaceIds: ['ATVPDKIKX0DER'],
                    identifiersType: "UPC",
                    identifiers: [UPC.toString()],
                    includedData: ['salesRanks'],
                });

                // Assuming the response has an `items` array
                if (response.data && response.data.items && response.data.items.length > 0) {
                    const item = response.data.items[0]; // Assuming we're interested in the first item
                    const salesRanks = item.salesRanks;
                    const ASIN = item?.asin;
                    if (ASIN) {
                        ASINlist.push(ASIN); // Add the ASIN to the list
                        console.log(`Added ASIN: ${ASIN} for UPC: ${UPC}`);
                    } else {
                        ASINlist.push('0');
                        console.log(`ASIN not found for UPC: ${UPC}`);
                    }

                    // Check if there are sales ranks and display group ranks
                    if (salesRanks.length > 0 && salesRanks[0].displayGroupRanks.length > 0) {
                        const displayGroupRank = salesRanks[0].displayGroupRanks[0]; // Accessing the first display group rank
                        console.log(`Rank: ${displayGroupRank.rank}`);
                        RankList.push(displayGroupRank.rank);
                    } else {
                        console.log('No display group ranks available.');
                        RankList.push(0);
                    }
                } else {
                    console.log(`No results found for the UPC.`);
                    ASINlist.push('0');
                    RankList.push(0);
                }

                break; // Break from retry loop on success
            } catch (error) {
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on UPC ${UPC}, retrying after ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryCount++; // Increment the retry counter
                } else {
                    // If the error is not a rate limit error, log it and stop retrying
                    console.error(`Error searching UPC ${UPC}. Setting value to 0:`, error);
                    ASINlist.push('0');
                    RankList.push(0);
                    break;
                }
            }
        }
        // Delay for .5 seconds before making the next API call
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(RankList);
}

// https://selling-partner-api-sdk.scaleleap.org/classes/productpricingapiclient#getCompetitivePricing
// This function fetches competitive pricing for ASINs and stores offer prices in AMZoffer array
async function getItemOffersForASIN() {
    const client = new ProductPricingApiClient({
        accessToken: accessToken,
        region: 'us-east-1', // Make sure to set the appropriate region
    });

    for (const ASIN of ASINlist) {
        let retryCount = 0;
        let response;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 3000; // Delay between retries in milliseconds

        while (retryCount < maxRetries) {
            try {
                // Check if ASIN is '0' and handle accordingly
                if (ASIN === '0') {
                    console.log(`ASIN is '0', setting offer price to 0 for ASIN: ${ASIN}`);
                    AMZoffer.push({
                        ASIN: ASIN,
                        OfferPrice: 0,
                    });
                    break; // Exit the loop if ASIN is '0'
                }
                // The getItemOffers call for each ASIN in the list
                response = await client.getItemOffers({
                    itemCondition: 'New',
                    marketplaceId: 'ATVPDKIKX0DER',
                    customerType: 'Consumer',
                    asin: ASIN.toString(),
                });

                // Extracting the lowest new price from the response
                // Access the payload for the structured response
                if (response.data && response.data.payload && response.data.payload.Summary && response.data.payload.Summary.LowestPrices && response.data.payload.Summary.LowestPrices.length > 0) {
                    // Find the lowest new price across all fulfillment channels
                    const lowestNewPrice = response.data.payload.Summary.LowestPrices.reduce((lowest, current) => {
                        return (!lowest || current.LandedPrice.Amount < lowest.LandedPrice.Amount) ? current : lowest;
                    });

                    if (lowestNewPrice && lowestNewPrice.LandedPrice && lowestNewPrice.LandedPrice.Amount) {
                        const lowestPriceAmount = lowestNewPrice.LandedPrice.Amount;

                        AMZoffer.push({
                            ASIN: ASIN,
                            OfferPrice: lowestPriceAmount,
                        });

                        console.log(`Added lowest offer price for ASIN: ${ASIN} - $${lowestPriceAmount}`);
                    } else {
                        console.log(`Lowest new price information not found for ASIN: ${ASIN}`);
                        AMZoffer.push({
                            ASIN: ASIN,
                            OfferPrice: 0,
                        });
                    }
                } else {
                    console.log(`No offers found for ASIN: ${ASIN}`);
                    AMZoffer.push({
                        ASIN: ASIN,
                        OfferPrice: 0,
                    });
                }

                break; // Break from retry loop on success
            } catch (error) {
                // Check for the specific SellingPartnerTooManyRequestsError
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on ASIN ${ASIN}, retrying after ${retryDelay}ms...`);
                    await delay(retryDelay); // Wait for retryDelay milliseconds before retrying
                    retryCount++; // Increment the retry counter
                } else {
                    // If the error is not a rate limit error, log it and break out of the loop
                    console.error(`Error fetching item offers for ASIN ${ASIN}:`, error);
                    AMZoffer.push({
                        ASIN: ASIN,
                        OfferPrice: 0,
                    });
                    break;
                }
            }
        }

        // Delay for 1 seconds before making the next API call
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Debugging
    for (const ASIN of ASINlist) {
        console.log(ASIN);
    }
    for (const offer of AMZoffer) {
        console.log(offer);
    }
}

// https://selling-partner-api-sdk.scaleleap.org/classes/productfeesapiclient#getMyFeesEstimateForASIN
async function getFeesEstimateForASINList() {
    const client = new ProductFeesApiClient({
        accessToken: accessToken,
        region: 'us-east-1',
    });

    for (const offer of AMZoffer) {
        if (offer.ASIN === '0') {
            feesEstimates.push({ ASIN: offer.ASIN, FeesEstimate: 0 });
            continue;
        }

        let retryCount = 0;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 3000; // Delay between retries in milliseconds
        let response;

        while (retryCount < maxRetries) {
            try {
                response = await client.getMyFeesEstimateForASIN({
                    asin: offer.ASIN,
                    body: {
                        FeesEstimateRequest: {
                            MarketplaceId: 'ATVPDKIKX0DER',
                            IdType: 'ASIN',
                            IdValue: offer.ASIN,
                            IsAmazonFulfilled: true,
                            PriceToEstimateFees: {
                                ListingPrice: { CurrencyCode: 'USD', Amount: offer.OfferPrice },
                                Shipping: { CurrencyCode: 'USD', Amount: 0 },
                            },
                            Identifier: `request_${offer.ASIN}`,
                        }
                    }
                });

                if (response && response.status !== 429) {
                    // If the request was successful or did not return 429, process the response
                    if (response.data && response.data.payload && response.data.payload.FeesEstimateResult && response.data.payload.FeesEstimateResult.FeesEstimate && response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate && response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate.Amount) {
                        feesEstimates.push({
                            ASIN: offer.ASIN,
                            FeesEstimate: response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate.Amount,
                        });
                        console.log(`Retrieved Fee Estimate for ASIN: ${offer.ASIN} - ${response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate.Amount}`);
                    } else {
                        console.log(`Fees not found for ASIN ${offer.ASIN}. Inputting 0.`);
                        feesEstimates.push({
                            ASIN: offer.ASIN,
                            FeesEstimate: 0,
                        });
                    }
                    break; // Break out of the loop on success
                }
                // Handle the case if response status is 429 without throwing an error
                if (response && response.status === 429) {
                    throw new Error('Rate limited');
                }
            } catch (error) {
                // Check for the specific SellingPartnerTooManyRequestsError
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on ASIN ${offer.ASIN}, retrying after ${retryDelay}ms...`);
                    await delay(retryDelay); // Wait for retryDelay milliseconds before retrying
                    retryCount++; // Increment the retry counter
                } else {
                    // If the error is not a rate limit error, log it and break out of the loop
                    console.error(`Error fetching fees estiate for ASIN ${offer.ASIN}:`, error);
                    feesEstimates.push({
                        ASIN: offer.ASIN,
                        FeesEstimate: 0,
                    });
                    break;
                }
            }
        }
        // Delay for 3 seconds before making the next API call
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log(feesEstimates); // Log the fees estimates for debugging
}

// Function to start the process
async function startProcess() {
    try {
        await getDataFromCSV();
        await getTokenAndMakeApiCall(); // This should get the initial token
        calculateProfits();
        await filterAndWriteToCSV();

        // Now set up the token refresh every ~hour after initial token retrieval
        setInterval(getTokenRefresh, 3500000);
    } catch (error) {
        console.error("Error during the process:", error);
        // Handle any errors that occurred during initialization
    }
}

startProcess().catch(error => {
    console.error("An error occurred during the process:", error);
    process.exit(1); // Exit the process with a failure code
});