"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogItemsApiClientV20201201 = void 0;
const catalog_items_api_model_v20201201_1 = require("../api-models/catalog-items-api-model-v20201201");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class CatalogItemsApiClientV20201201 extends catalog_items_api_model_v20201201_1.CatalogApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new catalog_items_api_model_v20201201_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.CatalogItemsApiClientV20201201 = CatalogItemsApiClientV20201201;
//# sourceMappingURL=catalog-items-api-client-v20201201.js.map