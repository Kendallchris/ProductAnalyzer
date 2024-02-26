"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesApiClient = void 0;
const services_api_model_1 = require("../api-models/services-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ServicesApiClient extends services_api_model_1.ServiceApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new services_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ServicesApiClient = ServicesApiClient;
//# sourceMappingURL=services-api-client.js.map