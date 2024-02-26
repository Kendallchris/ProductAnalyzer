"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AplusContentApiClient = void 0;
const aplus_content_api_model_1 = require("../api-models/aplus-content-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class AplusContentApiClient extends aplus_content_api_model_1.AplusContentApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new aplus_content_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.AplusContentApiClient = AplusContentApiClient;
//# sourceMappingURL=aplus-content-api-client.js.map