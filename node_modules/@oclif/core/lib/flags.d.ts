import { OptionFlag, Definition, BooleanFlag, EnumFlagOptions } from './interfaces';
export declare function build<T>(defaults: {
    parse: OptionFlag<T>['parse'];
} & Partial<OptionFlag<T>>): Definition<T>;
export declare function build(defaults: Partial<OptionFlag<string>>): Definition<string>;
export declare function option<T>(options: {
    parse: OptionFlag<T>['parse'];
} & Partial<OptionFlag<T>>): OptionFlag<T | undefined>;
declare const _enum: <T = string>(opts: EnumFlagOptions<T>) => OptionFlag<T>;
export { _enum as enum };
declare const stringFlag: Definition<string>;
export { stringFlag as string };
export { boolean, integer, url, directory, file } from './parser';
export declare const version: (opts?: Partial<BooleanFlag<boolean>>) => BooleanFlag<void>;
export declare const help: (opts?: Partial<BooleanFlag<boolean>>) => BooleanFlag<void>;
