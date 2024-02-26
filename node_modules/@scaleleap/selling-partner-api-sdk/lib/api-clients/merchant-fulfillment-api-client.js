"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantFulfillmentApiClient = void 0;
const merchant_fulfillment_api_model_1 = require("../api-models/merchant-fulfillment-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class MerchantFulfillmentApiClient extends merchant_fulfillment_api_model_1.MerchantFulfillmentApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new merchant_fulfillment_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.MerchantFulfillmentApiClient = MerchantFulfillmentApiClient;
//# sourceMappingURL=merchant-fulfillment-api-client.js.map