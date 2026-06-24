import { PrettyPrintableError, OclifError } from '../../interfaces/errors';
/**
 * properties specific to internal oclif error handling
 */
export declare function addOclifExitCode(error: Record<string, any>, options?: {
    exit?: number | false;
}): OclifError;
export declare class CLIError extends Error implements OclifError {
    oclif: OclifError['oclif'];
    code?: string;
    constructor(error: string | Error, options?: {
        exit?: number | false;
    } & PrettyPrintableError);
    get stack(): string;
    /**
     * @deprecated `render` Errors display should be handled by display function, like pretty-print
     * @return {string} returns a string representing the dispay of the error
     */
    render(): string;
    get bang(): string | undefined;
}
export declare namespace CLIError {
    class Warn extends CLIError {
        constructor(err: string | Error);
        get bang(): string | undefined;
    }
}
