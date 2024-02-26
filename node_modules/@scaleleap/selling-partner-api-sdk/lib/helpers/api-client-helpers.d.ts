import { AxiosInstance } from 'axios';
import { APIConfigurationParameters } from '../types';
export declare const ApiClientHelpers: {
    getAxiosInstance(parameters: APIConfigurationParameters): AxiosInstance;
    extractRegion(basePath: string): string;
    validateRegion(parameters: APIConfigurationParameters): APIConfigurationParameters;
};
