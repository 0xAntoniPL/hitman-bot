import { Config as IConfig, HelpOptions } from '../interfaces';
import { HelpBase } from '.';
interface HelpBaseDerived {
    new (config: IConfig, opts?: Partial<HelpOptions>): HelpBase;
}
export declare function loadHelpClass(config: IConfig): Promise<HelpBaseDerived>;
export declare function template(context: any): (t: string) => string;
export declare function toStandardizedId(commandID: string, config: IConfig): string;
export declare function toConfiguredId(commandID: string, config: IConfig): string;
export declare function standardizeIDFromArgv(argv: string[], config: IConfig): string[];
export {};
