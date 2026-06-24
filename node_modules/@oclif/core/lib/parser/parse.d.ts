import { ParserInput, OutputFlags, ParsingToken, OutputArgs } from '../interfaces';
export declare class Parser<T extends ParserInput, TFlags extends OutputFlags<T['flags']>, TArgs extends OutputArgs> {
    private readonly input;
    private readonly argv;
    private readonly raw;
    private readonly booleanFlags;
    private readonly context;
    private readonly metaData;
    private currentFlag?;
    constructor(input: T);
    parse(): Promise<{
        args: TArgs;
        argv: any[];
        flags: TFlags;
        raw: ParsingToken[];
        metadata: any;
    }>;
    private _args;
    private _flags;
    private _argv;
    private _debugOutput;
    private _debugInput;
    private get _argTokens();
    private get _flagTokens();
    private _setNames;
}
