"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentOutboundApiClient = void 0;
const fulfillment_outbound_api_model_1 = require("../api-models/fulfillment-outbound-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FulfillmentOutboundApiClient extends fulfillment_outbound_api_model_1.FbaOutboundApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new fulfillment_outbound_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FulfillmentOutboundApiClient = FulfillmentOutboundApiClient;
//# sourceMappingURL=fulfillment-outbound-api-client.js.map