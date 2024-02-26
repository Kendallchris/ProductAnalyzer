"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FbaSmallAndLightApiClient = void 0;
const fba_small_and_light_api_model_1 = require("../api-models/fba-small-and-light-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FbaSmallAndLightApiClient extends fba_small_and_light_api_model_1.SmallAndLightApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new fba_small_and_light_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FbaSmallAndLightApiClient = FbaSmallAndLightApiClient;
//# sourceMappingURL=fba-small-and-light-api-client.js.map