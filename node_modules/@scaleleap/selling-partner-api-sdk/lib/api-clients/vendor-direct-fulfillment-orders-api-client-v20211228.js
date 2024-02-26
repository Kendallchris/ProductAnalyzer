"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentOrdersApiClientV20211228 = void 0;
const vendor_direct_fulfillment_orders_api_model_v20211228_1 = require("../api-models/vendor-direct-fulfillment-orders-api-model-v20211228");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentOrdersApiClientV20211228 extends vendor_direct_fulfillment_orders_api_model_v20211228_1.VendorOrdersApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_orders_api_model_v20211228_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentOrdersApiClientV20211228 = VendorDirectFulfillmentOrdersApiClientV20211228;
//# sourceMappingURL=vendor-direct-fulfillment-orders-api-client-v20211228.js.map