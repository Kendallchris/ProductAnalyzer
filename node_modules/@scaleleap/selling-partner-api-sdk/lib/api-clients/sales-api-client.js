"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesApiClient = void 0;
const sales_api_model_1 = require("../api-models/sales-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class SalesApiClient extends sales_api_model_1.SalesApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new sales_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.SalesApiClient = SalesApiClient;
//# sourceMappingURL=sales-api-client.js.map