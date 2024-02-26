"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellingPartnerUnknownError = exports.SellingPartnerServiceUnavailableError = exports.SellingPartnerInternalServerError = exports.SellingPartnerTooManyRequestsError = exports.SellingPartnerUnsupportedMediaTypeError = exports.SellingPartnerRequestTooLongError = exports.SellingPartnerNotFoundError = exports.SellingPartnerForbiddenError = exports.SellingPartnerBadRequestError = exports.SellingPartnerGenericError = void 0;
const ts_error_1 = require("ts-error");
class SellingPartnerGenericError extends ts_error_1.ExtendableError {
    constructor({ modelError, headers, cause }) {
        super(modelError.details);
        this.code = modelError.code;
        this.message = modelError.message;
        this.details = modelError.details;
        this.requestId = headers['x-amzn-RequestId'] || headers['x-amzn-requestid'] || '';
        this.cause = cause;
    }
}
exports.SellingPartnerGenericError = SellingPartnerGenericError;
class SellingPartnerBadRequestError extends SellingPartnerGenericError {
}
exports.SellingPartnerBadRequestError = SellingPartnerBadRequestError;
class SellingPartnerForbiddenError extends SellingPartnerGenericError {
}
exports.SellingPartnerForbiddenError = SellingPartnerForbiddenError;
class SellingPartnerNotFoundError extends SellingPartnerGenericError {
}
exports.SellingPartnerNotFoundError = SellingPartnerNotFoundError;
class SellingPartnerRequestTooLongError extends SellingPartnerGenericError {
}
exports.SellingPartnerRequestTooLongError = SellingPartnerRequestTooLongError;
class SellingPartnerUnsupportedMediaTypeError extends SellingPartnerGenericError {
}
exports.SellingPartnerUnsupportedMediaTypeError = SellingPartnerUnsupportedMediaTypeError;
class SellingPartnerTooManyRequestsError extends SellingPartnerGenericError {
    constructor(parameters) {
        super(parameters);
        this.rateLimit =
            Number(parameters.headers['x-amzn-RateLimit-Limit']) ||
                Number(parameters.headers['x-amzn-ratelimit-limit']) ||
                undefined;
    }
}
exports.SellingPartnerTooManyRequestsError = SellingPartnerTooManyRequestsError;
class SellingPartnerInternalServerError extends SellingPartnerGenericError {
}
exports.SellingPartnerInternalServerError = SellingPartnerInternalServerError;
class SellingPartnerServiceUnavailableError extends SellingPartnerGenericError {
}
exports.SellingPartnerServiceUnavailableError = SellingPartnerServiceUnavailableError;
class SellingPartnerUnknownError extends SellingPartnerGenericError {
}
exports.SellingPartnerUnknownError = SellingPartnerUnknownError;
/* eslint-enable max-classes-per-file */
//# sourceMappingURL=selling-partner-api-errors.js.map