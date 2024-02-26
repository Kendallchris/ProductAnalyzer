"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyShipClient = void 0;
const easy_ship_model_1 = require("../api-models/easy-ship-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class EasyShipClient extends easy_ship_model_1.EasyShipApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new easy_ship_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.EasyShipClient = EasyShipClient;
//# sourceMappingURL=easy-ship-client.js.map