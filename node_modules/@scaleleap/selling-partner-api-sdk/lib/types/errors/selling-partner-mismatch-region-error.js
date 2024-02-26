"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellingPartnerMismatchRegionError = void 0;
const ts_error_1 = require("ts-error");
class SellingPartnerMismatchRegionError extends ts_error_1.ExtendableError {
    constructor(defaultRegion, region) {
        super(`There is a mismatch between region parameter and region in default base path!
      Default Region: ${defaultRegion}
      Region: ${region}
    `);
        this.defaultRegion = defaultRegion;
        this.region = region;
    }
}
exports.SellingPartnerMismatchRegionError = SellingPartnerMismatchRegionError;
//# sourceMappingURL=selling-partner-mismatch-region-error.js.map