"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsApiClient = void 0;
const notifications_api_model_1 = require("../api-models/notifications-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class NotificationsApiClient extends notifications_api_model_1.NotificationsApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new notifications_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.NotificationsApiClient = NotificationsApiClient;
//# sourceMappingURL=notifications-api-client.js.map