"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPricingApiClientV20220501 = void 0;
const product_pricing_api_model_v20220501_1 = require("../api-models/product-pricing-api-model-v20220501");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ProductPricingApiClientV20220501 extends product_pricing_api_model_v20220501_1.ProductPricingApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new product_pricing_api_model_v20220501_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ProductPricingApiClientV20220501 = ProductPricingApiClientV20220501;
//# sourceMappingURL=product-pricing-api-client-v20220501.js.map