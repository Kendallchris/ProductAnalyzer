"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogItemsApiClient = void 0;
const catalog_items_api_model_1 = require("../api-models/catalog-items-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class CatalogItemsApiClient extends catalog_items_api_model_1.CatalogApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new catalog_items_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.CatalogItemsApiClient = CatalogItemsApiClient;
//# sourceMappingURL=catalog-items-api-client.js.map