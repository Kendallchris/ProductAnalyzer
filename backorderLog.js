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
// list of companies that do not allow Amazon sales: Youtooz, Gamago

// Global Variables
let currentAccessToken = '';
let ProductData = [];
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
            //rl.close();
        });
    });
}

/**
 * Prompts the user for input using a provided query and returns the input as a promise.
 * If the user does not enter any data and hits enter, an empty array is returned to signify no companies to ignore.
 * @param {string} query The question or prompt to display to the user.
 * @returns {Promise<string[]>} A promise that resolves with an array of company names, or an empty array if no input was provided.
 */
function promptForData(query) {
    return new Promise(resolve => rl.question(query, (answer) => {
        const trimmedAnswer = answer.trim();
        if (trimmedAnswer === '') {
            resolve(''); // Resolve with an empty string if no input is provided for single value prompts
        } else {
            // For non-array responses, return the answer directly
            resolve(trimmedAnswer);
        }
    }));
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
    const itemNoOptions = ['Item No.', 'Item Number', 'SKU', 'Number'];
    const priceOptions = ['FIRST_PricePerPiece', 'Price', 'Price Per Piece', 'sale_price'];
    const nameOptions = ['Item Name'];
    const statusOptions = ['Status'];

    const firstUPCHeaderIndex = await findFirstMatchingHeader(filePath, UPCOptions);
    const firstItemNoHeaderIndex = await findFirstMatchingHeader(filePath, itemNoOptions);
    const firstPriceHeaderIndex = await findFirstMatchingHeader(filePath, priceOptions);
    const firstItemNameIndex = await findFirstMatchingHeader(filePath, nameOptions);
    const firstStatusIndex = await findFirstMatchingHeader(filePath, statusOptions);

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ index }) => {
                    if (index === firstUPCHeaderIndex) return 'UPC';
                    if (index === firstItemNoHeaderIndex) return 'ItemNo';
                    if (index === firstPriceHeaderIndex) return 'Price';
                    if (index === firstItemNameIndex) return 'Item Name'; // Map the company column
                    if (index === firstStatusIndex) return 'Order Status'; // ************ Implement order status stuff
                    return null; // Ignore other columns
                }
            }))
            .on('data', (row) => {
                // Check if 'Item Name' column exists and is not empty, otherwise set a default value
                const itemName = row['Item Name'] ? row['Item Name'].trim() : 'Unknown';

                const product = {
                    UPC: row['UPC'] && row['UPC'].trim() !== '' ? row['UPC'].trim() : '0',
                    Cost: row['Price'] && row['Price'].trim() !== '' ? row['Price'].trim() : '0',
                    ItemNo: row['ItemNo'] && row['ItemNo'].trim() !== '' ? row['ItemNo'].trim() : '0',
                    ItemName: itemName
                };
                ProductData.push(product); // Add the product object to the ProductData array

            })

            .on('end', () => {
                console.log('CSV file successfully processed:', ProductData);
                resolve({ ProductData });
            })
            .on('error', reject);
    });
}

/**
 * Calculates profits for each item based on its cost, Amazon's offer price, and estimated fees. Results are stored in a global array.
 * @returns {void} Does not return a value.
 */
function calculateProfits() {
    // Iterate over the ProductData array to calculate and update profits
    ProductData.forEach(product => {
        if (product.ASIN === '0') {
            console.log(`Skipping profit calculation for placeholder ASIN: ${product.ASIN}`);
            // Update the product object with default profit calculation values
            product.SalesRank = 0;
            product.ListPrice = 0;
            product.Fees = 0;
            product.Cost = parseFloat(product.Cost) || 0;
            product.Profit = 0;
            return; // Continue to the next product
        }

        // Ensure that product.Cost is a numeric value
        const cost = parseFloat(String(product.Cost).replace(/[^\d.-]/g, '')) || 0;
        product.Cost = cost; // Update the product with the numeric cost value

        // Calculate profit using product properties
        let profit = product.OfferPrice && product.FeesEstimate ? product.OfferPrice - (product.FeesEstimate + cost) : 0;
        product.Profit = profit; // Update the product with the calculated profit

        // Log the updated product for debugging
        console.log(`Profit calculated for ASIN: ${product.ASIN} - Profit: ${product.Profit}`);
    });

    // Return the updated ProductData with profits
    console.log('Updated ProductData with profits:', ProductData);
    return ProductData;
}

/**
 * Filters the calculated profits based on a minimum value and writes the filtered results to a new CSV file.
 * @returns {void} Does not return a value.
 */
function filterAndWriteToCSV() {
    // const value = await promptForData("Enter the minimum profit value to filter by:"); // Get value from user
    // Convert value to a number
    // const numericValue = Number(value);
    numericValue = 1;
    // Filter for profits greater than or equal to the specified value
    let filteredProfits = ProductData.filter(product => product.Profit <= numericValue);

    // Filter out entries with default values in key fields
    filteredProfits = filteredProfits.filter(product => {
        // Adjust these conditions based on what constitutes a 'default value' in your context
        return product.ASIN !== '0' && product.UPC !== '0' && product.ItemNo !== '0';
    });

    // Define the path and headers for the CSV file
    const csvWriter = createCsvWriter({
        path: 'Research.csv',
        header: [
            { id: 'ItemNo', title: 'Item No.' },
            { id: 'UPC', title: 'UPC' },
            { id: 'ASIN', title: 'ASIN' },
            { id: 'ItemName', title: 'Item Name' },
            { id: 'Rank', title: 'SalesRank' },
            { id: 'OfferPrice', title: 'ListPrice' },
            { id: 'FeesEstimate', title: 'Fees' },
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
async function getTokenAndMakeApiCall(rankFilter, ignoreNoRank) {
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

        await searchCatalogItemsByUPC(rankFilter, ignoreNoRank);
        await getItemOffersForASIN();
        await getFeesEstimateForASINList();

        // Additional API calls can be made here using the `client`
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/catalogitemsapiclientv20220401#searchCatalogItems
 * Searches the Amazon catalog for items using their UPCs, with support for handling missing UPCs and applying filters based on sales rank.
 * 
 * This function iterates over a global array of products (`ProductData`), sending batched requests to Amazon's Selling Partner API
 * to retrieve catalog items by their UPCs. If a product's UPC is not found or if the product's sales rank does not meet specified criteria,
 * default values are assigned to the product's ASIN and Rank properties. The function supports filtering based on a specified sales rank threshold
 * and can optionally ignore products without a sales rank.
 * 
 * The Selling Partner API's searchCatalogItems endpoint is used to retrieve catalog item information, including sales ranks and identifiers
 * (both UPC and EAN). For each item in the response, if it matches a product in the `ProductData` array by UPC (or EAN if UPC is not available),
 * the product's ASIN and sales rank are updated accordingly. Products that do not match the filter criteria have their ASIN set to '0'.
 * 
 * @param {number} rankFilter - The maximum sales rank to include. Products with a sales rank above this value will have their ASIN set to '0'.
 * @param {string} ignoreNoRank - If set to 'yes', products without a sales rank will have their ASIN set to '0'.
 * @returns {Promise<void>} - A promise that resolves once all products in `ProductData` have been processed. Products that do not meet
 *                             the criteria specified by `rankFilter` and `ignoreNoRank`, or are not found in the API response, will have their
 *                             ASINs set to '0'. The global `ProductData` array is updated in place.
 */

async function searchCatalogItemsByUPC(rankFilter, ignoreNoRank) {
    for (let i = 0; i < ProductData.length; i += 20) {
        let batchUPCs = ProductData.slice(i, i + 20).map(product => product.UPC).filter(upc => upc !== '0');
        console.log(`Batch UPCs: ${batchUPCs}`);

        if (batchUPCs.length === 0) continue;

        const accessToken = await getCurrentAccessToken();
        const client = new CatalogItemsApiClientV20220401({ accessToken: accessToken, region: 'us-east-1', });

        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 3000;
        while (retryCount < maxRetries) {
            try {
                const response = await client.searchCatalogItems({
                    marketplaceIds: ['ATVPDKIKX0DER'],
                    identifiersType: "UPC",
                    identifiers: batchUPCs,
                    includedData: ['salesRanks', 'identifiers'],
                });

                let foundIdentifiers = new Set();

                if (response.data && response.data.items && response.data.items.length > 0) {
                    response.data.items.forEach(item => {
                        let preferredIdentifier = null;
                        let foundUPC = false;
                        item.identifiers.forEach(identifiersByMarketplace => {
                            identifiersByMarketplace.identifiers.forEach(identifier => {
                                if (identifier.identifierType === 'UPC' || (!preferredIdentifier && identifier.identifierType === 'EAN')) {
                                    preferredIdentifier = identifier.identifier;
                                    if (identifier.identifierType === 'UPC') {
                                        foundUPC = true;
                                    }
                                }
                            });
                        });

                        if (!preferredIdentifier) return;

                        const productIndex = ProductData.findIndex(product => product.UPC === preferredIdentifier || (!foundUPC && product.EAN === preferredIdentifier));
                        if (productIndex === -1) return;

                        const product = ProductData[productIndex];
                        const salesRank = item.salesRanks?.[0]?.displayGroupRanks?.[0]?.rank || 0;

                        // Implementing rankFilter and ignoreNoRank logic
                        if (salesRank === 0 && ignoreNoRank === 'yes') {
                            console.log(`Ignoring item with identifier ${preferredIdentifier} due to missing sales rank.`);
                            product.ASIN = '0';
                        } else if (salesRank > rankFilter) {
                            console.log(`Too high rank for identifier ${preferredIdentifier}, setting ASIN to 0.`);
                            product.ASIN = '0';
                        } else {
                            product.ASIN = item.asin || '0';
                            product.Rank = salesRank;
                            console.log(`Updated ProductData for ${preferredIdentifier} with ASIN: ${product.ASIN} and Rank: ${product.Rank}`);
                        }

                        foundIdentifiers.add(preferredIdentifier);
                    });
                }

                ProductData.slice(i, i + 20).forEach(product => {
                    if (!foundIdentifiers.has(product.UPC) && !foundIdentifiers.has(product.EAN)) {
                        console.log(`Identifier ${product.UPC} not found in API response, setting ASIN to '0'`);
                        product.ASIN = '0';
                    }
                });

                break;
            } catch (error) {
                console.error(`Error processing batch starting at index ${i}:`, error);
                retryCount++;
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Updated ProductData:', ProductData);
}

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/productpricingapiclient#getCompetitivePricing
 * Fetches competitive pricing for each ASIN in the global list, storing offer prices in a global array.
 * @returns {Promise<void>} A promise that resolves once all ASINs have been processed.
 */
async function getItemOffersForASIN() {
    for (let product of ProductData) {
        const ASIN = product.ASIN;

        // redundant but debugging
        if (ASIN === undefined) {
            console.log(`Undefined ASIN found. Skipping OffersAPI call.`);
            product.ASIN = '0';
            product.OfferPrice = 0; // Update directly in ProductData.
            continue;
        }
        // 

        if (!ASIN || ASIN === '0') {
            console.log(`Skipping API call for placeholder ASIN`);
            product.OfferPrice = 0; // Update directly in ProductData
            continue; // Skip the rest of the loop for this iteration
        }

        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new ProductPricingApiClient({
            accessToken: accessToken,
            region: 'us-east-1',
        });

        let retryCount = 0;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 3000; // Delay between retries in milliseconds

        while (retryCount < maxRetries) {
            try {
                // The getItemOffers call for each ASIN in ProductData
                let response = await client.getItemOffers({
                    itemCondition: 'New',
                    marketplaceId: 'ATVPDKIKX0DER',
                    customerType: 'Consumer',
                    asin: ASIN.toString(),
                });

                if (response.data && response.data.payload && response.data.payload.Summary &&
                    response.data.payload.Summary.LowestPrices && response.data.payload.Summary.LowestPrices.length > 0) {
                    const lowestNewPrice = response.data.payload.Summary.LowestPrices.reduce((lowest, current) => {
                        return (!lowest || current.LandedPrice.Amount < lowest.LandedPrice.Amount) ? current : lowest;
                    });

                    if (lowestNewPrice && lowestNewPrice.LandedPrice && lowestNewPrice.LandedPrice.Amount) {
                        product.OfferPrice = lowestNewPrice.LandedPrice.Amount; // Update directly in ProductData
                        console.log(`Added lowest offer price for ASIN: ${ASIN} - $${product.OfferPrice}`);
                    } else {
                        console.log(`Lowest new price information not found for ASIN: ${ASIN}`);
                        product.OfferPrice = 0; // Update directly in ProductData
                    }
                } else {
                    console.log(`No offers found for ASIN: ${ASIN}`);
                    product.OfferPrice = 0; // Update directly in ProductData
                }

                break; // Break from retry loop on success
            } catch (error) {
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on ASIN ${ASIN}, retrying after ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryCount++;
                } else {
                    console.error(`Error fetching item offers for ASIN ${ASIN}:`, error);
                    product.OfferPrice = 0; // Update directly in ProductData
                    break;
                }
            }
        }
        // Delay for 1 second before making the next API call
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Debugging output of ProductData to verify updates
    console.log('Updated ProductData with offer prices:', ProductData);
}

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/productfeesapiclient#getMyFeesEstimateForASIN
 * Retrieves fees estimates for each ASIN in the global list, handling cases where no fees are found by setting default values.
 * @returns {Promise<void>} A promise that resolves once fees estimates for all ASINs have been retrieved.
 */
async function getFeesEstimateForASINList() {
    for (let product of ProductData) {
        if (!product.ASIN || product.ASIN === '0') {
            console.log(`Skipping fee estimate for placeholder ASIN: ${product.ASIN}`);
            product.FeesEstimate = 0; // Set directly in ProductData
            continue; // Move to the next iteration without making API calls
        }
        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new ProductFeesApiClient({
            accessToken: accessToken,
            region: 'us-east-1',
        });

        let retryCount = 0;
        const maxRetries = 3; // Maximum number of retries
        const retryDelay = 3000; // Delay between retries in milliseconds
        let response;

        while (retryCount < maxRetries) {
            try {
                response = await client.getMyFeesEstimateForASIN({
                    asin: product.ASIN,
                    body: {
                        FeesEstimateRequest: {
                            MarketplaceId: 'ATVPDKIKX0DER',
                            IdType: 'ASIN',
                            IdValue: product.ASIN,
                            IsAmazonFulfilled: true,
                            PriceToEstimateFees: {
                                ListingPrice: { CurrencyCode: 'USD', Amount: product.OfferPrice },
                                Shipping: { CurrencyCode: 'USD', Amount: 0 },
                            },
                            Identifier: `request_${product.ASIN}`,
                        }
                    }
                });

                if (response && response.data && response.data.payload && response.data.payload.FeesEstimateResult && response.data.payload.FeesEstimateResult.FeesEstimate && response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate && response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate.Amount) {
                    product.FeesEstimate = response.data.payload.FeesEstimateResult.FeesEstimate.TotalFeesEstimate.Amount;
                    console.log(`Retrieved Fee Estimate for ASIN: ${product.ASIN} - ${product.FeesEstimate}`);
                } else {
                    console.log(`Fees not found for ASIN ${product.ASIN}. Inputting 0.`);
                    product.FeesEstimate = 0; // Set directly in ProductData
                }
                break; // Break out of the loop on success
            } catch (error) {
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on ASIN ${product.ASIN}, retrying after ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryCount++; // Increment the retry counter
                } else {
                    console.error(`Error fetching fees estimate for ASIN ${product.ASIN}:`, error);
                    product.FeesEstimate = 0; // Set directly in ProductData
                    break;
                }
            }
        }
        // Delay for 3 seconds before making the next API call
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Log the updated ProductData for debugging
    console.log('Updated ProductData with fees estimates:', ProductData);
}

/**
 * Initiates the overall process, including token refresh setup, data extraction from CSV, making API calls, calculating profits, and writing results to CSV.
 * @returns {Promise<void>} A promise that resolves once the entire process has completed successfully or rejects on error.
 */
async function startProcess() {
    try {
        // Now set up the token refresh every ~hour after initial token retrieval
        setInterval(getTokenRefresh, 3500000);
        const { rankFilter, ignoreNoRank } = await getDataFromCSV();
        await getTokenAndMakeApiCall(rankFilter, ignoreNoRank); // This gets the initial token
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