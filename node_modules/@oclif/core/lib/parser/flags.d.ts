/// <reference types="node" />
import { URL } from 'url';
import { Definition, OptionFlag, BooleanFlag } from '../interfaces';
export declare function build<T>(defaults: {
    parse: OptionFlag<T>['parse'];
} & Partial<OptionFlag<T>>): Definition<T>;
export declare function build(defaults: Partial<OptionFlag<string>>): Definition<string>;
export declare function boolean<T = boolean>(options?: Partial<BooleanFlag<T>>): BooleanFlag<T>;
export declare const integer: Definition<number>;
export declare const directory: (opts?: {
    exists?: boolean;
} & Partial<OptionFlag<string>>) => OptionFlag<string | undefined>;
export declare const file: (opts?: {
    exists?: boolean;
} & Partial<OptionFlag<string>>) => OptionFlag<string | undefined>;
/**
 * Initializes a string as a URL. Throws an error
 * if the string is not a valid URL.
 */
export declare const url: Definition<URL>;
export declare function option<T>(options: {
    parse: OptionFlag<T>['parse'];
} & Partial<OptionFlag<T>>): OptionFlag<T | undefined>;
declare const stringFlag: Definition<string>;
export { stringFlag as string };
export declare const defaultFlags: {
    color: BooleanFlag<boolean>;
};
