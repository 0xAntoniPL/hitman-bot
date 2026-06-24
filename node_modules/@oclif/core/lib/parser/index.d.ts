/// <reference types="node" />
import * as args from './args';
import * as flags from './flags';
import { Input, ParserOutput } from '../interfaces';
export { args };
export { flags };
export { flagUsages } from './help';
export declare function parse<TFlags, TArgs extends {
    [name: string]: string;
}>(argv: string[], options: Input<TFlags>): Promise<ParserOutput<TFlags, TArgs>>;
declare const boolean: typeof flags.boolean, integer: import("../interfaces").Definition<number>, url: import("../interfaces").Definition<import("url").URL>, directory: (opts?: {
    exists?: boolean | undefined;
} & Partial<import("../interfaces").OptionFlag<string>>) => import("../interfaces").OptionFlag<string | undefined>, file: (opts?: {
    exists?: boolean | undefined;
} & Partial<import("../interfaces").OptionFlag<string>>) => import("../interfaces").OptionFlag<string | undefined>;
export { boolean, integer, url, directory, file };
