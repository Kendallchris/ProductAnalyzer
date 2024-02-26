"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorInvoicesApiClient = void 0;
const vendor_invoices_api_model_1 = require("../api-models/vendor-invoices-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorInvoicesApiClient extends vendor_invoices_api_model_1.VendorPaymentsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_invoices_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorInvoicesApiClient = VendorInvoicesApiClient;
//# sourceMappingURL=vendor-invoices-api-client.js.map