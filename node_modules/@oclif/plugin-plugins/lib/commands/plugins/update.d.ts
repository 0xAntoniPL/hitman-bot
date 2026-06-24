import { Command } from '@oclif/core';
import Plugins from '../../plugins';
export default class PluginsUpdate extends Command {
    static topic: string;
    static command: string;
    static description: string;
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    plugins: Plugins;
    run(): Promise<void>;
}
