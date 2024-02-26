import { CustomerInvoicesApi, VendorShippingApi, VendorShippingLabelsApi } from '../api-models/vendor-direct-fulfillment-shipping-api-model';
import { APIConfigurationParameters } from '../types/api-clients/api-configuration-parameters';
export declare class VendorDirectFulfillmentShippingApiClient extends CustomerInvoicesApi {
    constructor(parameters: APIConfigurationParameters);
}
export interface VendorDirectFulfillmentShippingApiClient extends CustomerInvoicesApi, VendorShippingApi, VendorShippingLabelsApi {
}
