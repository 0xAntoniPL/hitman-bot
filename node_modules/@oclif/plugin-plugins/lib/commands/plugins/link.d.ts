import { Command } from '@oclif/core';
import Plugins from '../../plugins';
export default class PluginsLink extends Command {
    static description: string;
    static usage: string;
    static examples: string[];
    static args: {
        name: string;
        description: string;
        required: boolean;
        default: string;
    }[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        verbose: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    plugins: Plugins;
    run(): Promise<void>;
}
