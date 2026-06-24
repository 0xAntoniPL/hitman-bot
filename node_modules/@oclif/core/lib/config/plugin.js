"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const errors_1 = require("../errors");
const path = require("path");
const util_1 = require("util");
const config_1 = require("./config");
const util_2 = require("./util");
const ts_node_1 = require("./ts-node");
const util_3 = require("./util");
const util_4 = require("../util");
const module_loader_1 = require("../module-loader");
const _pjson = require('../../package.json');
function topicsToArray(input, base) {
    if (!input)
        return [];
    base = base ? `${base}:` : '';
    if (Array.isArray(input)) {
        return input.concat((0, util_3.flatMap)(input, t => topicsToArray(t.subtopics, `${base}${t.name}`)));
    }
    return (0, util_3.flatMap)(Object.keys(input), k => {
        input[k].name = k;
        return [{ ...input[k], name: `${base}${k}` }].concat(topicsToArray(input[k].subtopics, `${base}${input[k].name}`));
    });
}
// essentially just "cd .."
function* up(from) {
    while (path.dirname(from) !== from) {
        yield from;
        from = path.dirname(from);
    }
    yield from;
}
async function findSourcesRoot(root) {
    for (const next of up(root)) {
        const cur = path.join(next, 'package.json');
        // eslint-disable-next-line no-await-in-loop
        if (await (0, util_3.exists)(cur))
            return path.dirname(cur);
    }
}
/**
 * @returns string
 * @param name string
 * @param root string
 * find package root
 * for packages installed into node_modules this will go up directories until
 * it finds a node_modules directory with the plugin installed into it
 *
 * This is needed because some oclif plugins do not declare the `main` field in their package.json
 * https://github.com/oclif/config/pull/289#issuecomment-983904051
 */
async function findRootLegacy(name, root) {
    for (const next of up(root)) {
        let cur;
        if (name) {
            cur = path.join(next, 'node_modules', name, 'package.json');
            // eslint-disable-next-line no-await-in-loop
            if (await (0, util_3.exists)(cur))
                return path.dirname(cur);
            try {
                // eslint-disable-next-line no-await-in-loop
                const pkg = await (0, util_3.loadJSON)(path.join(next, 'package.json'));
                if (pkg.name === name)
                    return next;
            }
            catch { }
        }
        else {
            cur = path.join(next, 'package.json');
            // eslint-disable-next-line no-await-in-loop
            if (await (0, util_3.exists)(cur))
                return path.dirname(cur);
        }
    }
}
async function findRoot(name, root) {
    if (name) {
        let pkgPath;
        try {
            pkgPath = (0, util_3.resolvePackage)(name, { paths: [root] });
        }
        catch { }
        return pkgPath ? findSourcesRoot(path.dirname(pkgPath)) : findRootLegacy(name, root);
    }
    return findSourcesRoot(root);
}
class Plugin {
    // eslint-disable-next-line no-useless-constructor
    constructor(options) {
        this.options = options;
        // static loadedPlugins: {[name: string]: Plugin} = {}
        this._base = `${_pjson.name}@${_pjson.version}`;
        this.valid = false;
        this.alreadyLoaded = false;
        this.children = [];
        // eslint-disable-next-line new-cap
        this._debug = (0, util_2.Debug)();
        this.warned = false;
    }
    async load() {
        var _a;
        this.type = this.options.type || 'core';
        this.tag = this.options.tag;
        const root = await findRoot(this.options.name, this.options.root);
        if (!root)
            throw new Error(`could not find package.json with ${(0, util_1.inspect)(this.options)}`);
        this.root = root;
        this._debug('reading %s plugin %s', this.type, root);
        this.pjson = await (0, util_3.loadJSON)(path.join(root, 'package.json'));
        this.name = this.pjson.name;
        this.alias = (_a = this.options.name) !== null && _a !== void 0 ? _a : this.pjson.name;
        const pjsonPath = path.join(root, 'package.json');
        if (!this.name)
            throw new Error(`no name in ${pjsonPath}`);
        if (!(0, util_4.isProd)() && !this.pjson.files)
            this.warn(`files attribute must be specified in ${pjsonPath}`);
        // eslint-disable-next-line new-cap
        this._debug = (0, util_2.Debug)(this.name);
        this.version = this.pjson.version;
        if (this.pjson.oclif) {
            this.valid = true;
        }
        else {
            this.pjson.oclif = this.pjson['cli-engine'] || {};
        }
        this.hooks = (0, util_3.mapValues)(this.pjson.oclif.hooks || {}, i => Array.isArray(i) ? i : [i]);
        this.manifest = await this._manifest(Boolean(this.options.ignoreManifest), Boolean(this.options.errorOnManifestCreate));
        this.commands = Object.entries(this.manifest.commands)
            .map(([id, c]) => ({ ...c, pluginAlias: this.alias, pluginType: this.type, load: async () => this.findCommand(id, { must: true }) }));
        this.commands.sort((a, b) => a.id.localeCompare(b.id));
    }
    get topics() {
        return topicsToArray(this.pjson.oclif.topics || {});
    }
    get commandsDir() {
        return (0, ts_node_1.tsPath)(this.root, this.pjson.oclif.commands);
    }
    get commandIDs() {
        if (!this.commandsDir)
            return [];
        let globby;
        try {
            const globbyPath = require.resolve('globby', { paths: [this.root, __dirname] });
            globby = require(globbyPath);
        }
        catch (error) {
            this.warn(error, 'not loading commands, globby not found');
            return [];
        }
        this._debug(`loading IDs from ${this.commandsDir}`);
        const patterns = [
            '**/*.+(js|cjs|mjs|ts|tsx)',
            '!**/*.+(d.ts|test.ts|test.js|spec.ts|spec.js)?(x)',
        ];
        const ids = globby.sync(patterns, { cwd: this.commandsDir })
            .map(file => {
            const p = path.parse(file);
            const topics = p.dir.split('/');
            const command = p.name !== 'index' && p.name;
            return [...topics, command].filter(f => f).join(':');
        });
        this._debug('found commands', ids);
        return ids;
    }
    async findCommand(id, opts = {}) {
        const fetch = async () => {
            if (!this.commandsDir)
                return;
            const search = (cmd) => {
                if (typeof cmd.run === 'function')
                    return cmd;
                if (cmd.default && cmd.default.run)
                    return cmd.default;
                return Object.values(cmd).find((cmd) => typeof cmd.run === 'function');
            };
            let m;
            try {
                const p = path.join(this.pjson.oclif.commands, ...id.split(':'));
                const { isESM, module, filePath } = await module_loader_1.default.loadWithData(this, p);
                this._debug(isESM ? '(import)' : '(require)', filePath);
                m = module;
            }
            catch (error) {
                if (!opts.must && error.code === 'MODULE_NOT_FOUND')
                    return;
                throw error;
            }
            const cmd = search(m);
            if (!cmd)
                return;
            cmd.id = id;
            cmd.plugin = this;
            return cmd;
        };
        const cmd = await fetch();
        if (!cmd && opts.must)
            (0, errors_1.error)(`command ${id} not found`);
        return cmd;
    }
    async _manifest(ignoreManifest, errorOnManifestCreate = false) {
        const readManifest = async (dotfile = false) => {
            try {
                const p = path.join(this.root, `${dotfile ? '.' : ''}oclif.manifest.json`);
                const manifest = await (0, util_3.loadJSON)(p);
                if (!process.env.OCLIF_NEXT_VERSION && manifest.version.split('-')[0] !== this.version.split('-')[0]) {
                    process.emitWarning(`Mismatched version in ${this.name} plugin manifest. Expected: ${this.version} Received: ${manifest.version}\nThis usually means you have an oclif.manifest.json file that should be deleted in development. This file should be automatically generated when publishing.`);
                }
                else {
                    this._debug('using manifest from', p);
                    return manifest;
                }
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    if (!dotfile)
                        return readManifest(true);
                }
                else {
                    this.warn(error, 'readManifest');
                }
            }
        };
        if (!ignoreManifest) {
            const manifest = await readManifest();
            if (manifest)
                return manifest;
        }
        return {
            version: this.version,
            commands: (await Promise.all(this.commandIDs.map(async (id) => {
                try {
                    return [id, await (0, config_1.toCached)(await this.findCommand(id, { must: true }), this)];
                }
                catch (error) {
                    const scope = 'toCached';
                    if (Boolean(errorOnManifestCreate) === false)
                        this.warn(error, scope);
                    else
                        throw this.addErrorScope(error, scope);
                }
            })))
                .filter((f) => Boolean(f))
                .reduce((commands, [id, c]) => {
                commands[id] = c;
                return commands;
            }, {}),
        };
    }
    warn(err, scope) {
        if (this.warned)
            return;
        if (typeof err === 'string')
            err = new Error(err);
        process.emitWarning(this.addErrorScope(err, scope));
    }
    addErrorScope(err, scope) {
        err.name = `${err.name} Plugin: ${this.name}`;
        err.detail = (0, util_3.compact)([err.detail, `module: ${this._base}`, scope && `task: ${scope}`, `plugin: ${this.name}`, `root: ${this.root}`, 'See more details with DEBUG=*']).join('\n');
        return err;
    }
}
exports.Plugin = Plugin;
