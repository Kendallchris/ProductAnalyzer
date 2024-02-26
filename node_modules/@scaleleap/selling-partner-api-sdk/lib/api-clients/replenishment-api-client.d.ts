import { OffersApi, SellingpartnersApi } from '../api-models/replenishment-api-model';
import { APIConfigurationParameters } from '../types/api-clients/api-configuration-parameters';
export declare class ReplenishmentApiClient extends OffersApi {
    constructor(parameters: APIConfigurationParameters);
}
export interface ReplenishmentApiClient extends OffersApi, SellingpartnersApi {
}
