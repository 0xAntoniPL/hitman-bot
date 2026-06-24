"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@oclif/color");
const core_1 = require("@oclif/core");
const plugins_1 = require("../../plugins");
const util_1 = require("../../util");
class PluginsIndex extends core_1.Command {
    constructor() {
        super(...arguments);
        this.plugins = new plugins_1.default(this.config);
    }
    async run() {
        const { flags } = await this.parse(PluginsIndex);
        let plugins = this.config.plugins;
        (0, util_1.sortBy)(plugins, p => this.plugins.friendlyName(p.name));
        if (!flags.core) {
            plugins = plugins.filter(p => p.type !== 'core' && p.type !== 'dev');
        }
        if (plugins.length === 0) {
            this.log('No plugins installed.');
            return;
        }
        this.display(plugins);
    }
    display(plugins) {
        for (const plugin of plugins.filter((p) => !p.parent)) {
            this.log(this.formatPlugin(plugin));
            if (plugin.children && plugin.children.length > 0) {
                const tree = this.createTree(plugin);
                tree.display();
            }
        }
    }
    createTree(plugin) {
        const tree = core_1.CliUx.ux.tree();
        for (const p of plugin.children) {
            const name = this.formatPlugin(p);
            tree.insert(name, this.createTree(p));
        }
        return tree;
    }
    formatPlugin(plugin) {
        let output = `${this.plugins.friendlyName(plugin.name)} ${color_1.default.dim(plugin.version)}`;
        if (plugin.type !== 'user')
            output += color_1.default.dim(` (${plugin.type})`);
        if (plugin.type === 'link')
            output += ` ${plugin.root}`;
        else if (plugin.tag && plugin.tag !== 'latest')
            output += color_1.default.dim(` (${String(plugin.tag)})`);
        return output;
    }
}
exports.default = PluginsIndex;
PluginsIndex.flags = {
    core: core_1.Flags.boolean({ description: 'Show core plugins.' }),
};
PluginsIndex.description = 'List installed plugins.';
PluginsIndex.examples = ['$ <%- config.bin %> plugins'];
