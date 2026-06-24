import { ParserArg, Arg, ParseFn } from '../interfaces';
export declare function newArg<T>(arg: Arg & {
    Parse: ParseFn<T>;
}): ParserArg<T>;
export declare function newArg(arg: Arg): ParserArg<string>;
