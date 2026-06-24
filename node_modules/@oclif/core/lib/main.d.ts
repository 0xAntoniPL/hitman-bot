import * as Interfaces from './interfaces';
import { Config } from './config';
export declare const helpAddition: (argv: string[], config: Interfaces.Config) => boolean;
export declare const versionAddition: (argv: string[], config?: Interfaces.Config | undefined) => boolean;
export declare function run(argv?: string[], options?: Interfaces.LoadOptions): Promise<unknown>;
