"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersApiClient = void 0;
const orders_api_model_1 = require("../api-models/orders-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class OrdersApiClient extends orders_api_model_1.OrdersV0Api {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new orders_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.OrdersApiClient = OrdersApiClient;
(0, helpers_1.applyMixins)(OrdersApiClient, [orders_api_model_1.OrdersV0Api, orders_api_model_1.ShipmentApi]);
//# sourceMappingURL=orders-api-client.js.map