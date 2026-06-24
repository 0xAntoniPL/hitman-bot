import { AlphabetLowercase, AlphabetUppercase } from './alphabet';
import { Config } from './config';
export declare type ParseFn<T> = (input: string) => Promise<T>;
export interface Arg<T = string> {
    name: string;
    description?: string;
    required?: boolean;
    hidden?: boolean;
    parse?: ParseFn<T>;
    default?: T | (() => T);
    options?: string[];
    ignoreStdin?: boolean;
}
export interface ArgBase<T> {
    name?: string;
    description?: string;
    hidden?: boolean;
    parse: ParseFn<T>;
    default?: T | (() => Promise<T>);
    input?: string;
    options?: string[];
    ignoreStdin?: boolean;
}
export declare type RequiredArg<T> = ArgBase<T> & {
    required: true;
    value: T;
};
export declare type OptionalArg<T> = ArgBase<T> & {
    required: false;
    value?: T;
};
export declare type ParserArg<T> = RequiredArg<T> | OptionalArg<T>;
export interface FlagOutput {
    [name: string]: any;
}
export declare type ArgInput = Arg<any>[];
export interface CLIParseErrorOptions {
    parse: {
        input?: ParserInput;
        output?: ParserOutput<any, any>;
    };
}
export declare type OutputArgs = {
    [name: string]: any;
};
export declare type OutputFlags<T extends ParserInput['flags']> = {
    [P in keyof T]: any;
};
export declare type ParserOutput<TFlags extends OutputFlags<any>, TArgs extends OutputArgs> = {
    flags: TFlags & {
        json: boolean | undefined;
    };
    args: TArgs;
    argv: string[];
    raw: ParsingToken[];
    metadata: Metadata;
};
export declare type ArgToken = {
    type: 'arg';
    input: string;
};
export declare type FlagToken = {
    type: 'flag';
    flag: string;
    input: string;
};
export declare type ParsingToken = ArgToken | FlagToken;
export interface FlagUsageOptions {
    displayRequired?: boolean;
}
export declare type Metadata = {
    flags: {
        [key: string]: MetadataFlag;
    };
};
declare type MetadataFlag = {
    setFromDefault?: boolean;
};
export declare type ListItem = [string, string | undefined];
export declare type List = ListItem[];
export declare type DefaultContext<T> = {
    options: OptionFlag<T>;
    flags: {
        [k: string]: string;
    };
};
export declare type Default<T> = T | ((context: DefaultContext<T>) => Promise<T>);
export declare type DefaultHelp<T> = T | ((context: DefaultContext<T>) => Promise<string | undefined>);
export declare type FlagProps = {
    name: string;
    char?: AlphabetLowercase | AlphabetUppercase;
    /**
     * A short summary of flag usage to show in the flag list.
     * If not provided, description will be used.
     */
    summary?: string;
    /**
     * A description of flag usage. If summary is provided, the description
     * is assumed to be a longer description and will be shown in a separate
     * section within help.
     */
    description?: string;
    /**
     * The flag label to show in help. Defaults to "[-<char>] --<name>" where -<char> is
     * only displayed if the char is defined.
     */
    helpLabel?: string;
    /**
     * Shows this flag in a separate list in the help.
     */
    helpGroup?: string;
    hidden?: boolean;
    required?: boolean;
    dependsOn?: string[];
    exclusive?: string[];
};
export declare type BooleanFlagProps = FlagProps & {
    type: 'boolean';
    allowNo: boolean;
};
export declare type OptionFlagProps = FlagProps & {
    type: 'option';
    helpValue?: string;
    options?: string[];
    multiple: boolean;
};
export declare type FlagBase<T, I> = FlagProps & {
    exactlyOne?: string[];
    /**
     * also accept an environment variable as input
     */
    env?: string;
    parse(input: I, context: any): Promise<T>;
};
export declare type BooleanFlag<T> = FlagBase<T, boolean> & BooleanFlagProps & {
    /**
     * specifying a default of false is the same not specifying a default
     */
    default?: Default<boolean>;
};
export declare type OptionFlag<T> = FlagBase<T, string> & OptionFlagProps & {
    default?: Default<T | undefined>;
    defaultHelp?: DefaultHelp<T>;
    input: string[];
};
export declare type Definition<T> = {
    (options: {
        multiple: true;
    } & Partial<OptionFlag<T[]>>): OptionFlag<T[]>;
    (options: ({
        required: true;
    } | {
        default: Default<T>;
    }) & Partial<OptionFlag<T>>): OptionFlag<T>;
    (options?: Partial<OptionFlag<T>>): OptionFlag<T | undefined>;
};
export declare type EnumFlagOptions<T> = Partial<OptionFlag<T>> & {
    options: T[];
};
export declare type Flag<T> = BooleanFlag<T> | OptionFlag<T>;
export declare type Input<TFlags extends FlagOutput> = {
    flags?: FlagInput<TFlags>;
    args?: ArgInput;
    strict?: boolean;
    context?: any;
    '--'?: boolean;
};
export interface ParserInput {
    argv: string[];
    flags: FlagInput<any>;
    args: ParserArg<any>[];
    strict: boolean;
    context: any;
    '--'?: boolean;
}
export declare type CompletionContext = {
    args?: {
        [name: string]: string;
    };
    flags?: {
        [name: string]: string;
    };
    argv?: string[];
    config: Config;
};
export declare type Completion = {
    skipCache?: boolean;
    cacheDuration?: number;
    cacheKey?(ctx: CompletionContext): Promise<string>;
    options(ctx: CompletionContext): Promise<string[]>;
};
export declare type CompletableOptionFlag<T> = OptionFlag<T> & {
    completion?: Completion;
};
export declare type CompletableFlag<T> = BooleanFlag<T> | CompletableOptionFlag<T>;
export declare type FlagInput<T extends FlagOutput> = {
    [P in keyof T]: CompletableFlag<T[P]>;
};
export {};
