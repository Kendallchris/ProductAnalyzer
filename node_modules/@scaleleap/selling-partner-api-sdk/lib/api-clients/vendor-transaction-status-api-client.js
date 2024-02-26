"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorTransactionStatusApiClient = void 0;
const vendor_transaction_status_api_model_1 = require("../api-models/vendor-transaction-status-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorTransactionStatusApiClient extends vendor_transaction_status_api_model_1.VendorTransactionApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_transaction_status_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorTransactionStatusApiClient = VendorTransactionStatusApiClient;
//# sourceMappingURL=vendor-transaction-status-api-client.js.map