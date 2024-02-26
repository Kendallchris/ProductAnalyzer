"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentOrdersApiClient = void 0;
const vendor_direct_fulfillment_orders_api_model_1 = require("../api-models/vendor-direct-fulfillment-orders-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentOrdersApiClient extends vendor_direct_fulfillment_orders_api_model_1.VendorOrdersApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_orders_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentOrdersApiClient = VendorDirectFulfillmentOrdersApiClient;
//# sourceMappingURL=vendor-direct-fulfillment-orders-api-client.js.map