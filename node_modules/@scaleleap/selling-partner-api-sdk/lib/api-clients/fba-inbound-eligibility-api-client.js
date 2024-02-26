"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FbaInboundEligibilityApiClient = void 0;
const fba_inbound_eligibility_api_model_1 = require("../api-models/fba-inbound-eligibility-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FbaInboundEligibilityApiClient extends fba_inbound_eligibility_api_model_1.FbaInboundApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new fba_inbound_eligibility_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FbaInboundEligibilityApiClient = FbaInboundEligibilityApiClient;
//# sourceMappingURL=fba-inbound-eligibility-api-client.js.map