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
let currentAccessToken = '';
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
const RoleArn = process.env.RoleArn;
const RoleSessionName = process.env.RoleSessionName;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Asynchronously retrieves the current access token to ensure the latest token is used for API calls.
 * @returns {Promise<String>} A promise that resolves to the current access token.
 */
async function getCurrentAccessToken() {
    // Logic here to ensure the returned token is the latest. This could be as simple as returning the currentAccessToken variable if it's always kept up-to-date.
    return currentAccessToken;
}

/**
 * Attempts to refresh the authentication token up to a maximum number of retries on failure. Logs the new token or error as appropriate.
 * @returns {Promise<void>} A promise that resolves when the token has been refreshed or rejects after failing retries.
 */
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

            currentAccessToken = tokenResponse.data.access_token;
            console.log("Access Token refreshed:", currentAccessToken);
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

/**
 * Creates a promise that resolves after a specified delay, effectively pausing execution for that duration.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Prompts the user for the path to their CSV file and returns it.
 * @returns {Promise<string>} A promise that resolves to the file path provided by the user.
 */
function promptForCSVFilePath() {
    return new Promise((resolve) => {
        rl.question('Enter the path to your CSV file: ', (filePath) => {
            resolve(filePath);
            rl.close();
        });
    });
}

/**
 * Normalizes CSV header names by removing Byte Order Marks (BOM) and trimming whitespace.
 * @param {string} header - The header name to normalize.
 * @returns {string} The normalized header name.
 */
function normalizeHeader(header) {
    return header.replace(/^\uFEFF/, '').trim(); // Remove BOM and trim whitespace
}

/**
 * Searches the first line of a CSV file to find the first header that matches any of the given options.
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} optionsList - A list of header name options to search for.
 * @returns {Promise<number>} A promise that resolves to the index of the first matching header, or -1 if none match.
 */
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

/**
 * Extracts data from a CSV file based on predefined headers for UPC, Item Number, and Price, handling missing values appropriately.
 * @returns {Promise<void>} A promise that resolves once the CSV file has been processed.
 */
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
                // look for data and handle empty string
                if ('UPC' in row && row['UPC'].trim() !== '') {
                    UPClist.push(row['UPC'].trim());
                } else {
                    console.log('No UPC found or UPC is empty - entering 0')
                    UPClist.push(0);
                }
                if ('Price' in row && row['Price'].trim() !== '') {
                    CostList.push(row['Price']);
                } else {
                    console.log('No Price found - entering 0')
                    CostList.push(0);
                }
                if ('ItemNo' in row && row['ItemNo'].trim() !== '') {
                    ItemNoList.push(row['ItemNo'].trim());
                } else {
                    console.log('No Item No. found - entering 0')
                    ItemNoList.push('0');
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

/**
 * Calculates profits for each item based on its cost, Amazon's offer price, and estimated fees. Results are stored in a global array.
 * @returns {void} Does not return a value.
 */
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

/**
 * Filters the calculated profits based on a minimum value and writes the filtered results to a new CSV file.
 * @returns {void} Does not return a value.
 */
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

/**
 * Retrieves an initial access token, assumes an AWS role, and then makes a series of API calls to Amazon's Selling Partner API for product information.
 * @returns {Promise<void>} A promise that resolves once all API calls have been made.
 */
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

        currentAccessToken = tokenResponse.data.access_token;
        console.log("Access Token:", currentAccessToken);

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
                RoleArn: RoleArn,
                RoleSessionName: RoleSessionName,
            })
        );

        // Step 3: Make API Calls using the SellersApiClient
        const client = new SellersApiClient({
            accessToken: currentAccessToken,
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

// CAN PASS AN ARRAY OF UPCS TO THE API CALL TO SPEED THINGS UP!!!! But need to figure out how to handle unfound UPCs in that case.
/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/catalogitemsapiclientv20220401#searchCatalogItems
 * Searches for catalog items by their UPC, handling cases where no UPC is found by setting default values. Results are stored in global arrays.
 * @returns {Promise<void>} A promise that resolves once all UPCs have been searched.
 */
async function searchCatalogItemsByUPC() {
    for (const UPC of UPClist) {
        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new CatalogItemsApiClientV20220401({
            accessToken: accessToken,
            region: 'us-east-1',
        });
        // catch if there was not UPC found and set default values
        if (UPC === 0) {
            ASINlist.push('0');
            RankList.push(0);
            continue;
        }
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

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/productpricingapiclient#getCompetitivePricing
 * Fetches competitive pricing for each ASIN in the global list, storing offer prices in a global array.
 * @returns {Promise<void>} A promise that resolves once all ASINs have been processed.
 */
async function getItemOffersForASIN() {
    for (const ASIN of ASINlist) {
        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new ProductPricingApiClient({
            accessToken: accessToken,
            region: 'us-east-1',
        });
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

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/productfeesapiclient#getMyFeesEstimateForASIN
 * Retrieves fees estimates for each ASIN in the global list, handling cases where no fees are found by setting default values.
 * @returns {Promise<void>} A promise that resolves once fees estimates for all ASINs have been retrieved.
 */
async function getFeesEstimateForASINList() {
    for (const offer of AMZoffer) {
        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new ProductFeesApiClient({
            accessToken: accessToken,
            region: 'us-east-1',
        });
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

/**
 * Initiates the overall process, including token refresh setup, data extraction from CSV, making API calls, calculating profits, and writing results to CSV.
 * @returns {Promise<void>} A promise that resolves once the entire process has completed successfully or rejects on error.
 */
async function startProcess() {
    try {
        // Now set up the token refresh every ~hour after initial token retrieval
        setInterval(getTokenRefresh, 3500000);
        await getDataFromCSV();
        await getTokenAndMakeApiCall(); // This should get the initial token
        calculateProfits();
        filterAndWriteToCSV();
    } catch (error) {
        console.error("Error during the process:", error);
        // Handle any errors that occurred during initialization
    }
}

startProcess().catch(error => {
    console.error("An error occurred during the process:", error);
    process.exit(1); // Exit the process with a failure code
});