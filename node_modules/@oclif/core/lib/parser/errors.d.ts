import { CLIError } from '../errors';
import { ParserArg, CLIParseErrorOptions, OptionFlag, Flag } from '../interfaces';
export { CLIError } from '../errors';
export declare class CLIParseError extends CLIError {
    parse: CLIParseErrorOptions['parse'];
    constructor(options: CLIParseErrorOptions & {
        message: string;
    });
}
export declare class InvalidArgsSpecError extends CLIParseError {
    args: ParserArg<any>[];
    constructor({ args, parse }: CLIParseErrorOptions & {
        args: ParserArg<any>[];
    });
}
export declare class RequiredArgsError extends CLIParseError {
    args: ParserArg<any>[];
    constructor({ args, parse }: CLIParseErrorOptions & {
        args: ParserArg<any>[];
    });
}
export declare class RequiredFlagError extends CLIParseError {
    flag: Flag<any>;
    constructor({ flag, parse }: CLIParseErrorOptions & {
        flag: Flag<any>;
    });
}
export declare class UnexpectedArgsError extends CLIParseError {
    args: string[];
    constructor({ parse, args }: CLIParseErrorOptions & {
        args: string[];
    });
}
export declare class FlagInvalidOptionError extends CLIParseError {
    constructor(flag: OptionFlag<any>, input: string);
}
export declare class ArgInvalidOptionError extends CLIParseError {
    constructor(arg: ParserArg<any>, input: string);
}
