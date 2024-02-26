import { OrdersV0Api, ShipmentApi } from '../api-models/orders-api-model';
import { APIConfigurationParameters } from '../types/api-clients/api-configuration-parameters';
export declare class OrdersApiClient extends OrdersV0Api {
    constructor(parameters: APIConfigurationParameters);
}
export interface OrdersApiClient extends OrdersV0Api, ShipmentApi {
}
