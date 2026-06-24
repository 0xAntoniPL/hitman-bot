import { Command, Plugin } from '@oclif/core';
import Plugins from '../../plugins';
export default class PluginsInspect extends Command {
    static description: string;
    static usage: string;
    static examples: string[];
    static strict: boolean;
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
    parsePluginName(input: string): Promise<string>;
    findPlugin(pluginName: string): Plugin;
    inspect(pluginName: string, verbose?: boolean): Promise<void>;
    findDep(plugin: Plugin, dependency: string): Promise<{
        version: string | null;
        pkgPath: string | null;
    }>;
}
