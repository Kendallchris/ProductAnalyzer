"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellingPartnerNotFoundRegionError = void 0;
const ts_error_1 = require("ts-error");
class SellingPartnerNotFoundRegionError extends ts_error_1.ExtendableError {
    constructor(basePath) {
        super(`Region cannot be found in ${basePath}, needs to be added!`);
        this.basePath = basePath;
    }
}
exports.SellingPartnerNotFoundRegionError = SellingPartnerNotFoundRegionError;
//# sourceMappingURL=selling-partner-not-found-region-error.js.map