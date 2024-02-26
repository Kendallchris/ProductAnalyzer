"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsItemsApiClientV20210801 = void 0;
const listings_items_api_model_v20210801_1 = require("../api-models/listings-items-api-model-v20210801");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ListingsItemsApiClientV20210801 extends listings_items_api_model_v20210801_1.ListingsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new listings_items_api_model_v20210801_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ListingsItemsApiClientV20210801 = ListingsItemsApiClientV20210801;
//# sourceMappingURL=listings-items-api-client-v20210801.js.map