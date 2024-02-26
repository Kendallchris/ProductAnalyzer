"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsApiClient = void 0;
const feeds_api_model_1 = require("../api-models/feeds-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FeedsApiClient extends feeds_api_model_1.FeedsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new feeds_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FeedsApiClient = FeedsApiClient;
//# sourceMappingURL=feeds-api-client.js.map