"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPricingApiClient = void 0;
const product_pricing_api_model_1 = require("../api-models/product-pricing-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ProductPricingApiClient extends product_pricing_api_model_1.ProductPricingApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new product_pricing_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ProductPricingApiClient = ProductPricingApiClient;
//# sourceMappingURL=product-pricing-api-client.js.map