"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancesApiClient = void 0;
const finances_api_model_1 = require("../api-models/finances-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FinancesApiClient extends finances_api_model_1.DefaultApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new finances_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FinancesApiClient = FinancesApiClient;
//# sourceMappingURL=finances-api-client.js.map