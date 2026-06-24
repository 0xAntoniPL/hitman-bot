import { CLIError } from './cli';
import { OclifError } from '../../interfaces';
export declare class ModuleLoadError extends CLIError implements OclifError {
    oclif: {
        exit: number;
    };
    code: string;
    constructor(message: string);
}
