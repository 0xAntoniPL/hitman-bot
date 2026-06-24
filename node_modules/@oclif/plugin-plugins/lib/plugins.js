"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const fs = require("fs");
const load_json_file_1 = require("load-json-file");
const path = require("path");
const semver = require("semver");
const child_process_1 = require("child_process");
const util_1 = require("./util");
const yarn_1 = require("./yarn");
const initPJSON = { private: true, oclif: { schema: 1, plugins: [] }, dependencies: {} };
class Plugins {
    constructor(config) {
        this.config = config;
        this.verbose = false;
        this.yarn = new yarn_1.default({ config });
        this.debug = require('debug')('@oclif/plugins');
    }
    async pjson() {
        try {
            const pjson = await (0, load_json_file_1.default)(this.pjsonPath);
            return Object.assign(Object.assign(Object.assign({}, initPJSON), { dependencies: {} }), pjson);
        }
        catch (error) {
            this.debug(error);
            if (error.code !== 'ENOENT')
                process.emitWarning(error);
            return initPJSON;
        }
    }
    async list() {
        const pjson = await this.pjson();
        return this.normalizePlugins(pjson.oclif.plugins);
    }
    async install(name, { tag = 'latest', force = false } = {}) {
        try {
            const yarnOpts = { cwd: this.config.dataDir, verbose: this.verbose };
            await this.createPJSON();
            let plugin;
            const add = force ? ['add', '--force'] : ['add'];
            const invalidPluginError = new core_1.Errors.CLIError('plugin is invalid', {
                suggestions: [
                    'Plugin failed to install because it does not appear to be a valid CLI plugin.\nIf you are sure it is, contact the CLI developer noting this error.',
                ],
            });
            if (name.includes(':')) {
                // url
                const url = name;
                await this.yarn.exec([...add, url], yarnOpts);
                name = Object.entries((await this.pjson()).dependencies || {}).find(([, u]) => u === url)[0];
                plugin = await core_1.Config.load({ devPlugins: false, userPlugins: false, root: path.join(this.config.dataDir, 'node_modules', name), name });
                await this.refresh(plugin.root);
                if (!plugin.valid && !this.config.plugins.find(p => p.name === '@oclif/plugin-legacy')) {
                    throw invalidPluginError;
                }
                await this.add({ name, url, type: 'user' });
            }
            else {
                // npm
                const range = semver.validRange(tag);
                const unfriendly = this.unfriendlyName(name);
                if (unfriendly && await this.npmHasPackage(unfriendly)) {
                    name = unfriendly;
                }
                await this.yarn.exec([...add, `${name}@${tag}`], yarnOpts);
                plugin = await core_1.Config.load({ devPlugins: false, userPlugins: false, root: path.join(this.config.dataDir, 'node_modules', name), name });
                if (!plugin.valid && !this.config.plugins.find(p => p.name === '@oclif/plugin-legacy')) {
                    throw invalidPluginError;
                }
                await this.refresh(plugin.root);
                await this.add({ name, tag: range || tag, type: 'user' });
            }
            return plugin;
        }
        catch (error) {
            await this.uninstall(name).catch(error => this.debug(error));
            if (String(error).includes('EACCES')) {
                throw new core_1.Errors.CLIError(error, {
                    suggestions: [
                        `Plugin failed to install because of a permissions error.\nDoes your current user own the directory ${this.config.dataDir}?`,
                    ],
                });
            }
            throw error;
        }
    }
    // if yarn.lock exists, fetch locked dependencies
    async refresh(root, { prod = true } = {}) {
        if (fs.existsSync(path.join(root, 'yarn.lock'))) {
            // use yarn.lock to fetch dependencies
            await this.yarn.exec(prod ? ['--prod'] : [], { cwd: root, verbose: this.verbose });
        }
    }
    async link(p) {
        const c = await core_1.Config.load(path.resolve(p));
        core_1.CliUx.ux.action.start(`${this.config.name}: linking plugin ${c.name}`);
        if (!c.valid && !this.config.plugins.find(p => p.name === '@oclif/plugin-legacy')) {
            throw new core_1.Errors.CLIError('plugin is not a valid oclif plugin');
        }
        await this.refresh(c.root, { prod: false });
        await this.add({ type: 'link', name: c.name, root: c.root });
    }
    async add(plugin) {
        const pjson = await this.pjson();
        pjson.oclif.plugins = (0, util_1.uniq)([...pjson.oclif.plugins || [], plugin]);
        await this.savePJSON(pjson);
    }
    async remove(name) {
        const pjson = await this.pjson();
        if (pjson.dependencies)
            delete pjson.dependencies[name];
        pjson.oclif.plugins = this.normalizePlugins(pjson.oclif.plugins)
            .filter(p => p.name !== name);
        await this.savePJSON(pjson);
    }
    async uninstall(name) {
        try {
            const pjson = await this.pjson();
            if ((pjson.oclif.plugins || []).find(p => typeof p === 'object' && p.type === 'user' && p.name === name)) {
                await this.yarn.exec(['remove', name], { cwd: this.config.dataDir, verbose: this.verbose });
            }
        }
        catch (error) {
            core_1.CliUx.ux.warn(error);
        }
        finally {
            await this.remove(name);
        }
    }
    // In this case we want these operations to happen
    // sequentially so the `no-await-in-loop` rule is ugnored
    /* eslint-disable no-await-in-loop */
    async update() {
        let plugins = (await this.list()).filter((p) => p.type === 'user');
        if (plugins.length === 0)
            return;
        core_1.CliUx.ux.action.start(`${this.config.name}: Updating plugins`);
        // migrate deprecated plugins
        const aliases = this.config.pjson.oclif.aliases || {};
        for (const [name, to] of Object.entries(aliases)) {
            const plugin = plugins.find(p => p.name === name);
            if (!plugin)
                continue;
            if (to)
                await this.install(to);
            await this.uninstall(name);
            plugins = plugins.filter(p => p.name !== name);
        }
        if (plugins.find(p => Boolean(p.url))) {
            await this.yarn.exec(['upgrade'], { cwd: this.config.dataDir, verbose: this.verbose });
        }
        const npmPlugins = plugins.filter(p => !p.url);
        if (npmPlugins.length > 0) {
            await this.yarn.exec(['add', ...npmPlugins.map(p => `${p.name}@${p.tag}`)], { cwd: this.config.dataDir, verbose: this.verbose });
        }
        for (const p of plugins) {
            await this.refresh(path.join(this.config.dataDir, 'node_modules', p.name));
        }
        core_1.CliUx.ux.action.stop();
    }
    /* eslint-enable no-await-in-loop */
    async hasPlugin(name) {
        var _a, _b;
        const list = await this.list();
        const friendly = list.find(p => this.friendlyName(p.name) === this.friendlyName(name));
        const unfriendly = list.find(p => this.unfriendlyName(p.name) === this.unfriendlyName(name));
        const link = list.find(p => p.type === 'link' && path.resolve(p.root) === path.resolve(name));
        return ((_b = (_a = friendly !== null && friendly !== void 0 ? friendly : unfriendly) !== null && _a !== void 0 ? _a : link) !== null && _b !== void 0 ? _b : false);
    }
    async yarnNodeVersion() {
        try {
            const f = await (0, load_json_file_1.default)(path.join(this.config.dataDir, 'node_modules', '.yarn-integrity'));
            return f.nodeVersion;
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                core_1.CliUx.ux.warn(error);
        }
    }
    unfriendlyName(name) {
        if (name.includes('@'))
            return;
        const scope = this.config.pjson.oclif.scope;
        if (!scope)
            return;
        return `@${scope}/plugin-${name}`;
    }
    async maybeUnfriendlyName(name) {
        const unfriendly = this.unfriendlyName(name);
        this.debug(`checking registry for expanded package name ${unfriendly}`);
        if (unfriendly && await this.npmHasPackage(unfriendly)) {
            return unfriendly;
        }
        this.debug(`expanded package name ${unfriendly} not found, using given package name ${name}`);
        return name;
    }
    friendlyName(name) {
        const scope = this.config.pjson.oclif.scope;
        if (!scope)
            return name;
        const match = name.match(`@${scope}/plugin-(.+)`);
        if (!match)
            return name;
        return match[1];
    }
    // private async loadPlugin(plugin: Config.PJSON.PluginTypes) {
    //   return Config.load({...plugin as any, root: this.config.dataDir})
    // }
    async createPJSON() {
        if (!fs.existsSync(this.pjsonPath)) {
            await this.savePJSON(initPJSON);
        }
    }
    get pjsonPath() {
        return path.join(this.config.dataDir, 'package.json');
    }
    get npmRegistry() {
        return this.config.npmRegistry || 'https://registry.npmjs.org';
    }
    async npmHasPackage(name) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`npm show ${name} dist-tags`, {
                encoding: 'utf-8',
                maxBuffer: 2048 * 2048,
            }, error => {
                if (error) {
                    try {
                        return resolve(false);
                    }
                    catch (_a) {
                        reject(new Error(`Could not run npm show for ${name}`));
                    }
                }
                else {
                    return resolve(true);
                }
            });
        });
    }
    async savePJSON(pjson) {
        pjson.oclif.plugins = this.normalizePlugins(pjson.oclif.plugins);
        const fs = require('fs-extra');
        await fs.outputJSON(this.pjsonPath, pjson, { spaces: 2 });
    }
    normalizePlugins(input) {
        let plugins = (input || []).map(p => {
            if (typeof p === 'string') {
                return { name: p, type: 'user', tag: 'latest' };
            }
            return p;
        });
        plugins = (0, util_1.uniqWith)(plugins, (a, b) => a.name === b.name || (a.type === 'link' && b.type === 'link' && a.root === b.root));
        return plugins;
    }
}
exports.default = Plugins;
