"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const core_1 = require("@oclif/core");
const chalk = require("chalk");
const fs = require("fs-extra");
const plugins_1 = require("../../plugins");
const util_1 = require("../../util");
function trimUntil(fsPath, part) {
    const parts = fsPath.split(path.sep);
    const indicies = parts.reduce((a, e, i) => (e === part) ? a.concat([i]) : a, []);
    const partIndex = Math.max(...indicies);
    if (partIndex === -1)
        return fsPath;
    return parts.slice(0, partIndex + 1).join(path.sep);
}
class PluginsInspect extends core_1.Command {
    constructor() {
        super(...arguments);
        this.plugins = new plugins_1.default(this.config);
    }
    // In this case we want these operations to happen
    // sequentially so the `no-await-in-loop` rule is ugnored
    /* eslint-disable no-await-in-loop */
    async run() {
        const { flags, argv } = await this.parse(PluginsInspect);
        if (flags.verbose)
            this.plugins.verbose = true;
        const aliases = this.config.pjson.oclif.aliases || {};
        for (let name of argv) {
            if (name === '.') {
                const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
                name = pkgJson.name;
            }
            if (aliases[name] === null)
                this.error(`${name} is blocked`);
            name = aliases[name] || name;
            const pluginName = await this.parsePluginName(name);
            try {
                await this.inspect(pluginName, flags.verbose);
            }
            catch (error) {
                this.log(chalk.bold.red('failed'));
                throw error;
            }
        }
    }
    /* eslint-enable no-await-in-loop */
    async parsePluginName(input) {
        if (input.includes('@') && input.includes('/')) {
            input = input.slice(1);
            const [name] = input.split('@');
            return '@' + name;
        }
        const [splitName] = input.split('@');
        const name = await this.plugins.maybeUnfriendlyName(splitName);
        return name;
    }
    findPlugin(pluginName) {
        const pluginConfig = this.config.plugins.find(plg => plg.name === pluginName);
        if (pluginConfig)
            return pluginConfig;
        throw new Error(`${pluginName} not installed`);
    }
    async inspect(pluginName, verbose = false) {
        var _a;
        const plugin = this.findPlugin(pluginName);
        const tree = core_1.CliUx.ux.tree();
        const pluginHeader = chalk.bold.cyan(plugin.name);
        tree.insert(pluginHeader);
        tree.nodes[pluginHeader].insert(`version ${plugin.version}`);
        if (plugin.tag)
            tree.nodes[pluginHeader].insert(`tag ${plugin.tag}`);
        if (plugin.pjson.homepage)
            tree.nodes[pluginHeader].insert(`homepage ${plugin.pjson.homepage}`);
        tree.nodes[pluginHeader].insert(`location ${plugin.root}`);
        tree.nodes[pluginHeader].insert('commands');
        const commands = (0, util_1.sortBy)(plugin.commandIDs, c => c);
        commands.forEach(cmd => tree.nodes[pluginHeader].nodes.commands.insert(cmd));
        const dependencies = Object.assign({}, plugin.pjson.dependencies);
        tree.nodes[pluginHeader].insert('dependencies');
        const deps = (0, util_1.sortBy)(Object.keys(dependencies), d => d);
        for (const dep of deps) {
            // eslint-disable-next-line no-await-in-loop
            const { version, pkgPath } = await this.findDep(plugin, dep);
            if (!version)
                continue;
            const from = (_a = dependencies[dep]) !== null && _a !== void 0 ? _a : null;
            const versionMsg = chalk.dim(from ? `${from} => ${version}` : version);
            const msg = verbose ? `${dep} ${versionMsg} ${pkgPath}` : `${dep} ${versionMsg}`;
            tree.nodes[pluginHeader].nodes.dependencies.insert(msg);
        }
        tree.display();
    }
    async findDep(plugin, dependency) {
        const dependencyPath = path.join(...dependency.split('/'));
        let start = path.join(plugin.root, 'node_modules');
        const paths = [start];
        while ((start.match(/node_modules/g) || []).length > 1) {
            start = trimUntil(path.dirname(start), 'node_modules');
            paths.push(start);
        }
        for (const p of paths) {
            const fullPath = path.join(p, dependencyPath);
            const pkgJsonPath = path.join(fullPath, 'package.json');
            try {
                // eslint-disable-next-line no-await-in-loop
                const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
                return { version: pkgJson.version, pkgPath: fullPath };
            }
            catch (_a) {
                // try the next path
            }
        }
        return { version: null, pkgPath: null };
    }
}
exports.default = PluginsInspect;
PluginsInspect.description = 'Displays installation properties of a plugin.';
PluginsInspect.usage = 'plugins:inspect PLUGIN...';
PluginsInspect.examples = [
    '$ <%= config.bin %> plugins:inspect <%- config.pjson.oclif.examplePlugin || "myplugin" %> ',
];
PluginsInspect.strict = false;
PluginsInspect.args = [
    { name: 'plugin', description: 'Plugin to inspect.', required: true, default: '.' },
];
PluginsInspect.flags = {
    help: core_1.Flags.help({ char: 'h' }),
    verbose: core_1.Flags.boolean({ char: 'v' }),
};
