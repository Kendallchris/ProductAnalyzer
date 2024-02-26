"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsApiClient = void 0;
const reports_api_model_1 = require("../api-models/reports-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ReportsApiClient extends reports_api_model_1.ReportsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new reports_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ReportsApiClient = ReportsApiClient;
//# sourceMappingURL=reports-api-client.js.map