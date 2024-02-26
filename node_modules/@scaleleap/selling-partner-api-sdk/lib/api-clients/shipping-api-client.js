"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingApiClient = void 0;
const shipping_api_model_1 = require("../api-models/shipping-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ShippingApiClient extends shipping_api_model_1.ShippingApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new shipping_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ShippingApiClient = ShippingApiClient;
//# sourceMappingURL=shipping-api-client.js.map