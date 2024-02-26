"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitationsApiClient = void 0;
const solicitations_api_model_1 = require("../api-models/solicitations-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class SolicitationsApiClient extends solicitations_api_model_1.SolicitationsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new solicitations_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.SolicitationsApiClient = SolicitationsApiClient;
//# sourceMappingURL=solicitations-api-client.js.map