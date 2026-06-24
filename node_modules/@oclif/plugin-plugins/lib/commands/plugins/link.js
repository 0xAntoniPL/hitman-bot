"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const chalk = require("chalk");
const plugins_1 = require("../../plugins");
class PluginsLink extends core_1.Command {
    constructor() {
        super(...arguments);
        this.plugins = new plugins_1.default(this.config);
    }
    async run() {
        const { flags, args } = await this.parse(PluginsLink);
        this.plugins.verbose = flags.verbose;
        core_1.CliUx.ux.action.start(`Linking plugin ${chalk.cyan(args.path)}`);
        await this.plugins.link(args.path);
        core_1.CliUx.ux.action.stop();
    }
}
exports.default = PluginsLink;
PluginsLink.description = `Links a plugin into the CLI for development.
Installation of a linked plugin will override a user-installed or core plugin.

e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello' command will override the user-installed or core plugin implementation. This is useful for development work.
`;
PluginsLink.usage = 'plugins:link PLUGIN';
PluginsLink.examples = ['$ <%= config.bin %> plugins:link <%- config.pjson.oclif.examplePlugin || "myplugin" %> '];
PluginsLink.args = [{ name: 'path', description: 'path to plugin', required: true, default: '.' }];
PluginsLink.flags = {
    help: core_1.Flags.help({ char: 'h' }),
    verbose: core_1.Flags.boolean({ char: 'v' }),
};
