"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplenishmentApiClient = void 0;
const replenishment_api_model_1 = require("../api-models/replenishment-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ReplenishmentApiClient extends replenishment_api_model_1.OffersApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new replenishment_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ReplenishmentApiClient = ReplenishmentApiClient;
(0, helpers_1.applyMixins)(ReplenishmentApiClient, [replenishment_api_model_1.OffersApi, replenishment_api_model_1.SellingpartnersApi]);
//# sourceMappingURL=replenishment-api-client.js.map