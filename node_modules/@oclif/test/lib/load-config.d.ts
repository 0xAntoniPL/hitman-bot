import { Interfaces } from '@oclif/core';
/**
 * loads CLI plugin/multi config
 * @param {loadConfig.Options} opts options
 * @return {Promise<Interfaces.Config>} config
 */
export declare function loadConfig(opts?: loadConfig.Options): {
    run(ctx: {
        config: Interfaces.Config;
    }): Promise<Interfaces.Config>;
};
export declare namespace loadConfig {
    let root: string;
    interface Options {
        root?: string;
        reset?: boolean;
    }
}
