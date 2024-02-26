"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsRestrictionsApiClient = void 0;
const listings_restrictions_api_model_1 = require("../api-models/listings-restrictions-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ListingsRestrictionsApiClient extends listings_restrictions_api_model_1.ListingsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new listings_restrictions_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ListingsRestrictionsApiClient = ListingsRestrictionsApiClient;
//# sourceMappingURL=listings-restrictions-api-client.js.map