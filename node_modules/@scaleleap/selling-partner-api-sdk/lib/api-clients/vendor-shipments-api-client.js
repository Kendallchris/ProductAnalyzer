"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorShipmentsApiClient = void 0;
const vendor_shipments_api_model_1 = require("../api-models/vendor-shipments-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorShipmentsApiClient extends vendor_shipments_api_model_1.VendorShippingApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_shipments_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorShipmentsApiClient = VendorShipmentsApiClient;
//# sourceMappingURL=vendor-shipments-api-client.js.map