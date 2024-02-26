"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentInvoicingApiClient = void 0;
const shipment_invoicing_api_model_1 = require("../api-models/shipment-invoicing-api-model");
const helpers_1 = require("../helpers");
const types_1 = require("../types");
class ShipmentInvoicingApiClient extends shipment_invoicing_api_model_1.ShipmentInvoiceApi {
    constructor(parameters) {
        const axios = helpers_1.ApiClientHelpers.getAxiosInstance(parameters);
        const configuration = new shipment_invoicing_api_model_1.Configuration(parameters);
        super(configuration, types_1.DEFAULT_API_BASE_PATH, axios);
    }
}
exports.ShipmentInvoicingApiClient = ShipmentInvoicingApiClient;
//# sourceMappingURL=shipment-invoicing-api-client.js.map