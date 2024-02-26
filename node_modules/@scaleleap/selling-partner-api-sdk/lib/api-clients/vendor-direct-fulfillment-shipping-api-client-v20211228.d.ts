import { CustomerInvoicesApi, VendorShippingApi, VendorShippingLabelsApi } from '../api-models/vendor-direct-fulfillment-shipping-api-model-v20211228';
import { APIConfigurationParameters } from '../types/api-clients/api-configuration-parameters';
export declare class VendorDirectFulfillmentShippingApiClientV20211228 extends CustomerInvoicesApi {
    constructor(parameters: APIConfigurationParameters);
}
export interface VendorDirectFulfillmentShippingApiClientV20211228 extends CustomerInvoicesApi, VendorShippingApi, VendorShippingLabelsApi {
}
