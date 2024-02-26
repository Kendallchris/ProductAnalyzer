"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsItemsApiClient = void 0;
const listings_items_api_model_1 = require("../api-models/listings-items-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ListingsItemsApiClient extends listings_items_api_model_1.ListingsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new listings_items_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ListingsItemsApiClient = ListingsItemsApiClient;
//# sourceMappingURL=listings-items-api-client.js.map