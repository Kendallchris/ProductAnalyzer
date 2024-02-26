"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentShippingApiClient = void 0;
const vendor_direct_fulfillment_shipping_api_model_1 = require("../api-models/vendor-direct-fulfillment-shipping-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentShippingApiClient extends vendor_direct_fulfillment_shipping_api_model_1.CustomerInvoicesApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_shipping_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentShippingApiClient = VendorDirectFulfillmentShippingApiClient;
(0, helpers_1.applyMixins)(VendorDirectFulfillmentShippingApiClient, [
    vendor_direct_fulfillment_shipping_api_model_1.CustomerInvoicesApi,
    vendor_direct_fulfillment_shipping_api_model_1.VendorShippingApi,
    vendor_direct_fulfillment_shipping_api_model_1.VendorShippingLabelsApi,
]);
//# sourceMappingURL=vendor-direct-fulfillment-shipping-api-client.js.map