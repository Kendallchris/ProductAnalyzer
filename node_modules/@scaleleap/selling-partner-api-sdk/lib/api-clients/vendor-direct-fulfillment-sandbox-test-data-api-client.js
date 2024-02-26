"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentSandboxTestDataApiClient = void 0;
const vendor_direct_fulfillment_sandbox_test_data_api_model_1 = require("../api-models/vendor-direct-fulfillment-sandbox-test-data-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentSandboxTestDataApiClient extends vendor_direct_fulfillment_sandbox_test_data_api_model_1.VendorDFSandboxApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_sandbox_test_data_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentSandboxTestDataApiClient = VendorDirectFulfillmentSandboxTestDataApiClient;
(0, helpers_1.applyMixins)(VendorDirectFulfillmentSandboxTestDataApiClient, [
    vendor_direct_fulfillment_sandbox_test_data_api_model_1.VendorDFSandboxApi,
    vendor_direct_fulfillment_sandbox_test_data_api_model_1.VendorDFSandboxtransactionstatusApi,
]);
//# sourceMappingURL=vendor-direct-fulfillment-sandbox-test-data-api-client.js.map