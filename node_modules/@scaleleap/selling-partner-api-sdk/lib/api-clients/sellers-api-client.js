"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellersApiClient = void 0;
const sellers_api_model_1 = require("../api-models/sellers-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class SellersApiClient extends sellers_api_model_1.SellersApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new sellers_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.SellersApiClient = SellersApiClient;
//# sourceMappingURL=sellers-api-client.js.map