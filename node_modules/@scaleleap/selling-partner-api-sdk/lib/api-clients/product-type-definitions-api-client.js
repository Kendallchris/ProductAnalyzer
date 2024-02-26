"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductTypeDefinitionsApiClient = void 0;
const product_type_definitions_api_model_1 = require("../api-models/product-type-definitions-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ProductTypeDefinitionsApiClient extends product_type_definitions_api_model_1.DefinitionsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new product_type_definitions_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ProductTypeDefinitionsApiClient = ProductTypeDefinitionsApiClient;
//# sourceMappingURL=product-type-definitions-api-client.js.map