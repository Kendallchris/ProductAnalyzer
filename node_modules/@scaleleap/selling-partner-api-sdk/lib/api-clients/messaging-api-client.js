"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingApiClient = void 0;
const messaging_api_model_1 = require("../api-models/messaging-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class MessagingApiClient extends messaging_api_model_1.MessagingApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new messaging_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.MessagingApiClient = MessagingApiClient;
//# sourceMappingURL=messaging-api-client.js.map