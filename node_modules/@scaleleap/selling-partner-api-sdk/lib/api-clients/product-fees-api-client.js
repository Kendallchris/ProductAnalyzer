"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFeesApiClient = void 0;
const product_fees_api_model_1 = require("../api-models/product-fees-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ProductFeesApiClient extends product_fees_api_model_1.FeesApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new product_fees_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ProductFeesApiClient = ProductFeesApiClient;
//# sourceMappingURL=product-fees-api-client.js.map