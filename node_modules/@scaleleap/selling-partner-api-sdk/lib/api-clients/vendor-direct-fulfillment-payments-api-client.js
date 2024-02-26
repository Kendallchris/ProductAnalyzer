"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentPaymentsApiClient = void 0;
const vendor_direct_fulfillment_payments_api_model_1 = require("../api-models/vendor-direct-fulfillment-payments-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentPaymentsApiClient extends vendor_direct_fulfillment_payments_api_model_1.VendorInvoiceApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_payments_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentPaymentsApiClient = VendorDirectFulfillmentPaymentsApiClient;
//# sourceMappingURL=vendor-direct-fulfillment-payments-api-client.js.map