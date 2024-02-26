"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentInboundApiClient = void 0;
const fulfillment_inbound_api_model_1 = require("../api-models/fulfillment-inbound-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FulfillmentInboundApiClient extends fulfillment_inbound_api_model_1.FbaInboundApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new fulfillment_inbound_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FulfillmentInboundApiClient = FulfillmentInboundApiClient;
//# sourceMappingURL=fulfillment-inbound-api-client.js.map