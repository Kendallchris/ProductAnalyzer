"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentTransactionsApiClient = void 0;
const vendor_direct_fulfillment_transactions_api_model_1 = require("../api-models/vendor-direct-fulfillment-transactions-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentTransactionsApiClient extends vendor_direct_fulfillment_transactions_api_model_1.VendorTransactionApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_transactions_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentTransactionsApiClient = VendorDirectFulfillmentTransactionsApiClient;
//# sourceMappingURL=vendor-direct-fulfillment-transactions-api-client.js.map