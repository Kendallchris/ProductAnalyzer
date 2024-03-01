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
            resolve([]); // Resolve with an empty array if no input is provided
        } else {
            const companies = trimmedAnswer.split(',').map(company => company.trim().toLowerCase()); // Convert to array and normalize
            resolve(companies);
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
    const ignoreCompanies = await promptForData("Enter comma-separated companies to ignore:"); // Prompt user
    //const ignoreCompanies = ignoreCompaniesInput.split(",").map(company => company.trim().toLowerCase()); // Convert to array and normalize
    const UPCOptions = ['UPC', 'Upc'];
    const itemNoOptions = ['Item No.', 'Item Number', 'SKU'];
    const priceOptions = ['FIRST_PricePerPiece', 'Price', 'Price Per Piece'];
    const companyOptions = ['Company', 'COMPANY']; // Add company options

    const firstUPCHeaderIndex = await findFirstMatchingHeader(filePath, UPCOptions);
    const firstItemNoHeaderIndex = await findFirstMatchingHeader(filePath, itemNoOptions);
    const firstPriceHeaderIndex = await findFirstMatchingHeader(filePath, priceOptions);
    const firstCompanyHeaderIndex = await findFirstMatchingHeader(filePath, companyOptions); // Find the company header index

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ index }) => {
                    if (index === firstUPCHeaderIndex) return 'UPC';
                    if (index === firstItemNoHeaderIndex) return 'ItemNo';
                    if (index === firstPriceHeaderIndex) return 'Price';
                    if (index === firstCompanyHeaderIndex) return 'Company'; // Map the company column
                    return null; // Ignore other columns
                }
            }))
            .on('data', (row) => {
                if (!ignoreCompanies.includes(row['Company'].trim().toLowerCase())) { // Check if company is not in the ignore list
                    // Process and add product to ProductData if company is not ignored
                    const product = {
                        UPC: row['UPC'] && row['UPC'].trim() !== '' ? row['UPC'].trim() : '0', // Use default value '0' if UPC is empty
                        Cost: row['Price'] && row['Price'].trim() !== '' ? row['Price'].trim() : '0', // Use default value '0' if Price is empty
                        ItemNo: row['ItemNo'] && row['ItemNo'].trim() !== '' ? row['ItemNo'].trim() : '0', // Use default value '0' if ItemNo is empty
                        Company: row['Company'] && row['Company'].trim() !== '' ? row['Company'].trim() : 'Unknown' // Default value 'Unknown' if Company is empty
                    };
                    ProductData.push(product); // Add the product object to the ProductData array
                } else {
                    // Optionally handle ignored companies, such as logging
                    console.log(`Ignoring product from company: ${row.company}`);
                }
            })
            .on('end', () => {
                console.log('CSV file successfully processed:', ProductData);
                resolve(ProductData); // Resolve the promise with the ProductData array
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
            product.SalesRank = -1;
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
    numericValue = 5;
    // Filter for profits greater than or equal to the specified value
    let filteredProfits = ProductData.filter(product => product.Profit >= numericValue);

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
            { id: 'Company', title: 'Company' },
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
    for (let product of ProductData) { // Iterate over the global `ProductData` array
        const UPC = product.UPC;
        const accessToken = await getCurrentAccessToken(); // Ensure you have the latest token
        const client = new CatalogItemsApiClientV20220401({
            accessToken: accessToken,
            region: 'us-east-1',
        });

        if (UPC === '0') { // Check for default UPC value
            product.ASIN = '0';
            product.Rank = 0;
            console.log(`Dummy UPC value - adding 0 for ASIN and Rank.`);
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
                    identifiers: [UPC],
                    includedData: ['salesRanks'],
                });

                if (response.data && response.data.items && response.data.items.length > 0) {
                    const item = response.data.items[0]; // Assuming we're interested in the first item
                    product.ASIN = item.asin ? item.asin : '0'; // Update the product with ASIN
                    console.log(`Added ASIN: ${product.ASIN} for UPC: ${product.UPC}`);
                    const salesRank = item.salesRanks && item.salesRanks.length > 0 && item.salesRanks[0].displayGroupRanks.length > 0
                        ? item.salesRanks[0].displayGroupRanks[0].rank : 0;
                    product.Rank = salesRank; // Update the product with Rank
                    console.log(`Rank: ${salesRank}`);
                } else {
                    product.ASIN = '0';
                    product.Rank = 0;
                    console.log(`ASIN not found for UPC: ${product.UPC}. Setting ASIN and Rank to 0.`);
                }
                break; // Break from retry loop on success
            } catch (error) {
                if (error.name === 'SellingPartnerTooManyRequestsError') {
                    console.log(`Rate limited on UPC ${UPC}, retrying after ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    retryCount++;
                } else {
                    console.error(`Error searching UPC ${UPC}. Setting ASIN and Rank to 0:`, error);
                    product.ASIN = '0';
                    product.Rank = 0;
                    break;
                }
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay before making the next API call
    }
    console.log('Updated ProductData with ASIN and Rank:', ProductData);
}

/**
 * https://selling-partner-api-sdk.scaleleap.org/classes/productpricingapiclient#getCompetitivePricing
 * Fetches competitive pricing for each ASIN in the global list, storing offer prices in a global array.
 * @returns {Promise<void>} A promise that resolves once all ASINs have been processed.
 */
async function getItemOffersForASIN() {
    for (let product of ProductData) {
        const ASIN = product.ASIN;
        if (ASIN === '0') {
            console.log(`Skipping API call for placeholder ASIN: ${ASIN}`);
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
        if (product.ASIN === '0') {
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
        await new Promise(resolve => setTimeout(resolve, 3000));
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