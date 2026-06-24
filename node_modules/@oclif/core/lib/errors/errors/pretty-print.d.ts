import { PrettyPrintableError } from '../../interfaces/errors';
declare type CLIErrorDisplayOptions = {
    name?: string;
    bang?: string;
};
export declare function applyPrettyPrintOptions(error: Error, options: PrettyPrintableError): PrettyPrintableError;
export default function prettyPrint(error: Error & PrettyPrintableError & CLIErrorDisplayOptions): string | undefined;
export {};
