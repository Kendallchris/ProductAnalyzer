import { VendorDFSandboxApi, VendorDFSandboxtransactionstatusApi } from '../api-models/vendor-direct-fulfillment-sandbox-test-data-api-model';
import { APIConfigurationParameters } from '../types/api-clients/api-configuration-parameters';
export declare class VendorDirectFulfillmentSandboxTestDataApiClient extends VendorDFSandboxApi {
    constructor(parameters: APIConfigurationParameters);
}
export interface VendorDirectFulfillmentSandboxTestDataApiClient extends VendorDFSandboxApi, VendorDFSandboxtransactionstatusApi {
}
