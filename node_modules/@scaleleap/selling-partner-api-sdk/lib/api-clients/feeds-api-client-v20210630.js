"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedsApiClientV20210630 = void 0;
const feeds_api_model_v20210630_1 = require("../api-models/feeds-api-model-v20210630");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FeedsApiClientV20210630 extends feeds_api_model_v20210630_1.FeedsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new feeds_api_model_v20210630_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FeedsApiClientV20210630 = FeedsApiClientV20210630;
//# sourceMappingURL=feeds-api-client-v20210630.js.map