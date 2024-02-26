"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FbaInventoryApiClient = void 0;
const fba_inventory_api_model_1 = require("../api-models/fba-inventory-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class FbaInventoryApiClient extends fba_inventory_api_model_1.FbaInventoryApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new fba_inventory_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.FbaInventoryApiClient = FbaInventoryApiClient;
//# sourceMappingURL=fba-inventory-api-client.js.map