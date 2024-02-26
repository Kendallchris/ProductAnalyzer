"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsApiClientV20210630 = void 0;
const reports_api_model_v20210630_1 = require("../api-models/reports-api-model-v20210630");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ReportsApiClientV20210630 extends reports_api_model_v20210630_1.ReportsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new reports_api_model_v20210630_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ReportsApiClientV20210630 = ReportsApiClientV20210630;
//# sourceMappingURL=reports-api-client-v20210630.js.map