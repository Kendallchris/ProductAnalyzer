import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import { ExtendableError } from 'ts-error';
export interface ModelErrorContainer {
    errors: ModelError[];
}
export interface ModelError {
    /**
     * An error code that identifies the type of error that occurred.
     * @type {string}
     * @memberof ModelError
     */
    code: string;
    /**
     * A message that describes the error condition in a human-readable form.
     * @type {string}
     * @memberof ModelError
     */
    message: string;
    /**
     * Additional details that can help the caller understand or fix the issue.
     * @type {string}
     * @memberof ModelError
     */
    details?: string;
}
export interface SellingPartnerErrorParameters {
    modelError: ModelError;
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    cause: Error;
}
export declare class SellingPartnerGenericError extends ExtendableError {
    code: string;
    message: string;
    details?: string;
    requestId: string;
    cause: Error;
    constructor({ modelError, headers, cause }: SellingPartnerErrorParameters);
}
export declare class SellingPartnerBadRequestError extends SellingPartnerGenericError {
}
export declare class SellingPartnerForbiddenError extends SellingPartnerGenericError {
}
export declare class SellingPartnerNotFoundError extends SellingPartnerGenericError {
}
export declare class SellingPartnerRequestTooLongError extends SellingPartnerGenericError {
}
export declare class SellingPartnerUnsupportedMediaTypeError extends SellingPartnerGenericError {
}
export declare class SellingPartnerTooManyRequestsError extends SellingPartnerGenericError {
    rateLimit?: number;
    constructor(parameters: SellingPartnerErrorParameters);
}
export declare class SellingPartnerInternalServerError extends SellingPartnerGenericError {
}
export declare class SellingPartnerServiceUnavailableError extends SellingPartnerGenericError {
}
export declare class SellingPartnerUnknownError extends SellingPartnerGenericError {
}
