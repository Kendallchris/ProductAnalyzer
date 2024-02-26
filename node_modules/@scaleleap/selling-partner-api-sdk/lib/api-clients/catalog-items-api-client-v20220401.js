"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogItemsApiClientV20220401 = void 0;
const catalog_items_api_model_v20220401_1 = require("../api-models/catalog-items-api-model-v20220401");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class CatalogItemsApiClientV20220401 extends catalog_items_api_model_v20220401_1.CatalogApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new catalog_items_api_model_v20220401_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.CatalogItemsApiClientV20220401 = CatalogItemsApiClientV20220401;
//# sourceMappingURL=catalog-items-api-client-v20220401.js.map