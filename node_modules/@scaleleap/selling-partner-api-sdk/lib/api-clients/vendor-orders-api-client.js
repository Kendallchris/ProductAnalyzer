"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorOrdersApiClient = void 0;
const vendor_orders_api_model_1 = require("../api-models/vendor-orders-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorOrdersApiClient extends vendor_orders_api_model_1.VendorOrdersApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_orders_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorOrdersApiClient = VendorOrdersApiClient;
//# sourceMappingURL=vendor-orders-api-client.js.map