"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentInventoryApiClient = void 0;
const vendor_direct_fulfillment_inventory_api_model_1 = require("../api-models/vendor-direct-fulfillment-inventory-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentInventoryApiClient extends vendor_direct_fulfillment_inventory_api_model_1.UpdateInventoryApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_inventory_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentInventoryApiClient = VendorDirectFulfillmentInventoryApiClient;
//# sourceMappingURL=vendor-direct-fulfillment-inventory-api-client.js.map