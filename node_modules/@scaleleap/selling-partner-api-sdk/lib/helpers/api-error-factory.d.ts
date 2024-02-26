import { AxiosError } from 'axios';
import { ExtendableError } from 'ts-error';
export declare function apiErrorFactory(error: AxiosError): ExtendableError;
