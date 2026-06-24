import { Command } from '@oclif/core';
import Plugins from '../../plugins';
export default class PluginsIndex extends Command {
    static flags: {
        core: import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
    };
    static description: string;
    static examples: string[];
    plugins: Plugins;
    run(): Promise<void>;
    private display;
    private createTree;
    private formatPlugin;
}
