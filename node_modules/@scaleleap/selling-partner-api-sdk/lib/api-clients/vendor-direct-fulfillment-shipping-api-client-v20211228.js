"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorDirectFulfillmentShippingApiClientV20211228 = void 0;
const vendor_direct_fulfillment_shipping_api_model_v20211228_1 = require("../api-models/vendor-direct-fulfillment-shipping-api-model-v20211228");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class VendorDirectFulfillmentShippingApiClientV20211228 extends vendor_direct_fulfillment_shipping_api_model_v20211228_1.CustomerInvoicesApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new vendor_direct_fulfillment_shipping_api_model_v20211228_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.VendorDirectFulfillmentShippingApiClientV20211228 = VendorDirectFulfillmentShippingApiClientV20211228;
(0, helpers_1.applyMixins)(VendorDirectFulfillmentShippingApiClientV20211228, [
    vendor_direct_fulfillment_shipping_api_model_v20211228_1.CustomerInvoicesApi,
    vendor_direct_fulfillment_shipping_api_model_v20211228_1.VendorShippingApi,
    vendor_direct_fulfillment_shipping_api_model_v20211228_1.VendorShippingLabelsApi,
]);
//# sourceMappingURL=vendor-direct-fulfillment-shipping-api-client-v20211228.js.map