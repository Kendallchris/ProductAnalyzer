"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokensApiClient = void 0;
const tokens_api_model_1 = require("../api-models/tokens-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class TokensApiClient extends tokens_api_model_1.TokensApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new tokens_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.TokensApiClient = TokensApiClient;
//# sourceMappingURL=tokens-api-client.js.map