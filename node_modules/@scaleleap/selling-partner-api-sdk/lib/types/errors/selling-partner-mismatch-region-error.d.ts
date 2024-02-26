import { ExtendableError } from 'ts-error';
export declare class SellingPartnerMismatchRegionError extends ExtendableError {
    defaultRegion: string;
    region: string;
    constructor(defaultRegion: string, region: string);
}
