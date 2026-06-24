import { Interfaces } from '@oclif/core';
export default class Yarn {
    config: Interfaces.Config;
    constructor({ config }: {
        config: Interfaces.Config;
    });
    get bin(): string;
    fork(modulePath: string, args?: string[], options?: any): Promise<void>;
    exec(args: string[] | undefined, opts: {
        cwd: string;
        verbose: boolean;
    }): Promise<void>;
}
