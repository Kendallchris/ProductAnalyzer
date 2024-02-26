"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsApiClient = void 0;
const uploads_api_model_1 = require("../api-models/uploads-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class UploadsApiClient extends uploads_api_model_1.UploadsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new uploads_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.UploadsApiClient = UploadsApiClient;
//# sourceMappingURL=uploads-api-client.js.map