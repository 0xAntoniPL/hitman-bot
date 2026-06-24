"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const chalk = require("chalk");
const plugins_1 = require("../../plugins");
class PluginsUninstall extends core_1.Command {
    constructor() {
        super(...arguments);
        this.plugins = new plugins_1.default(this.config);
    }
    // In this case we want these operations to happen
    // sequentially so the `no-await-in-loop` rule is ugnored
    /* eslint-disable no-await-in-loop */
    async run() {
        const { flags, argv } = await this.parse(PluginsUninstall);
        this.plugins = new plugins_1.default(this.config);
        if (flags.verbose)
            this.plugins.verbose = true;
        if (argv.length === 0)
            argv.push('.');
        for (const plugin of argv) {
            const friendly = this.removeTags(this.plugins.friendlyName(plugin));
            core_1.CliUx.ux.action.start(`Uninstalling ${friendly}`);
            const unfriendly = await this.plugins.hasPlugin(this.removeTags(plugin));
            if (!unfriendly) {
                const p = this.config.plugins.find(p => p.name === plugin);
                if (p) {
                    if (p && p.parent)
                        return this.error(`${friendly} is installed via plugin ${p.parent.name}, uninstall ${p.parent.name} instead`);
                }
                return this.error(`${friendly} is not installed`);
            }
            try {
                const { name } = unfriendly;
                await this.plugins.uninstall(name);
            }
            catch (error) {
                core_1.CliUx.ux.action.stop(chalk.bold.red('failed'));
                throw error;
            }
            core_1.CliUx.ux.action.stop();
        }
    }
    /* eslint-enable no-await-in-loop */
    removeTags(plugin) {
        if (plugin.includes('@')) {
            const chunked = plugin.split('@');
            const last = chunked[chunked.length - 1];
            if (!last.includes('/') && chunked.length > 1) {
                chunked.pop();
            }
            return chunked.join('@');
        }
        return plugin;
    }
}
exports.default = PluginsUninstall;
PluginsUninstall.description = 'Removes a plugin from the CLI.';
PluginsUninstall.usage = 'plugins:uninstall PLUGIN...';
PluginsUninstall.help = `
  Example:
    $ <%- config.bin %> plugins:uninstall <%- config.pjson.oclif.examplePlugin || "myplugin" %>
  `;
PluginsUninstall.variableArgs = true;
PluginsUninstall.args = [{ name: 'plugin', description: 'plugin to uninstall' }];
PluginsUninstall.flags = {
    help: core_1.Flags.help({ char: 'h' }),
    verbose: core_1.Flags.boolean({ char: 'v' }),
};
PluginsUninstall.aliases = ['plugins:unlink', 'plugins:remove'];
