"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationApiClient = void 0;
const authorization_api_model_1 = require("../api-models/authorization-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class AuthorizationApiClient extends authorization_api_model_1.AuthorizationApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new authorization_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.AuthorizationApiClient = AuthorizationApiClient;
//# sourceMappingURL=authorization-api-client.js.map