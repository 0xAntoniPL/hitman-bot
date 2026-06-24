"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const util_1 = require("util");
const index_1 = require("./index");
const config_1 = require("./config");
const Errors = require("./errors");
const Parser = require("./parser");
const Flags = require("./flags");
const pjson = require('../package.json');
/**
 * swallows stdout epipe errors
 * this occurs when stdout closes such as when piping to head
 */
process.stdout.on('error', (err) => {
    if (err && err.code === 'EPIPE')
        return;
    throw err;
});
const jsonFlag = {
    json: Flags.boolean({
        description: 'Format output as json.',
        helpGroup: 'GLOBAL',
    }),
};
/**
 * An abstract class which acts as the base for each command
 * in your project.
 */
class Command {
    constructor(argv, config) {
        this.argv = argv;
        this.config = config;
        this.id = this.ctor.id;
        try {
            this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin);
        }
        catch {
            this.debug = () => { };
        }
    }
    static get globalFlags() {
        return this._globalFlags;
    }
    static set globalFlags(flags) {
        this._globalFlags = this.enableJsonFlag ?
            Object.assign({}, jsonFlag, this.globalFlags, flags) :
            Object.assign({}, this.globalFlags, flags);
    }
    static get flags() {
        return this._flags;
    }
    static set flags(flags) {
        this.globalFlags = {};
        this._flags = Object.assign({}, this.globalFlags, flags);
    }
    get ctor() {
        return this.constructor;
    }
    async _run() {
        let err;
        let result;
        try {
            // remove redirected env var to allow subsessions to run autoupdated client
            delete process.env[this.config.scopedEnvVarKey('REDIRECTED')];
            await this.init();
            result = await this.run();
        }
        catch (error) {
            err = error;
            await this.catch(error);
        }
        finally {
            await this.finally(err);
        }
        if (result && this.jsonEnabled()) {
            index_1.CliUx.ux.styledJSON(this.toSuccessJson(result));
        }
        return result;
    }
    exit(code = 0) {
        return Errors.exit(code);
    }
    warn(input) {
        if (!this.jsonEnabled())
            Errors.warn(input);
        return input;
    }
    error(input, options = {}) {
        return Errors.error(input, options);
    }
    log(message = '', ...args) {
        if (!this.jsonEnabled()) {
            // tslint:disable-next-line strict-type-predicates
            message = typeof message === 'string' ? message : (0, util_1.inspect)(message);
            process.stdout.write((0, util_1.format)(message, ...args) + '\n');
        }
    }
    jsonEnabled() {
        return this.ctor.enableJsonFlag && this.argv.includes('--json');
    }
    async init() {
        this.debug('init version: %s argv: %o', this.ctor._base, this.argv);
        if (this.config.debug)
            Errors.config.debug = true;
        if (this.config.errlog)
            Errors.config.errlog = this.config.errlog;
        // global['cli-ux'].context = global['cli-ux'].context || {
        //   command: compact([this.id, ...this.argv]).join(' '),
        //   version: this.config.userAgent,
        // }
        const g = global;
        g['http-call'] = g['http-call'] || {};
        g['http-call'].userAgent = this.config.userAgent;
    }
    async parse(options, argv = this.argv) {
        if (!options)
            options = this.constructor;
        const opts = { context: this, ...options };
        // the spread operator doesn't work with getters so we have to manually add it here
        opts.flags = options === null || options === void 0 ? void 0 : options.flags;
        return Parser.parse(argv, opts);
    }
    async catch(err) {
        var _a, _b;
        process.exitCode = (_b = (_a = process.exitCode) !== null && _a !== void 0 ? _a : err.exitCode) !== null && _b !== void 0 ? _b : 1;
        if (this.jsonEnabled()) {
            index_1.CliUx.ux.styledJSON(this.toErrorJson(err));
        }
        else {
            if (!err.message)
                throw err;
            try {
                const chalk = require('chalk');
                index_1.CliUx.ux.action.stop(chalk.bold.red('!'));
            }
            catch { }
            throw err;
        }
    }
    async finally(_) {
        try {
            const config = Errors.config;
            if (config.errorLogger)
                await config.errorLogger.flush();
            // tslint:disable-next-line no-console
        }
        catch (error) {
            console.error(error);
        }
    }
    toSuccessJson(result) {
        return result;
    }
    toErrorJson(err) {
        return { error: err };
    }
}
exports.default = Command;
Command._base = `${pjson.name}@${pjson.version}`;
/** An array of aliases for this command. */
Command.aliases = [];
/** When set to false, allows a variable amount of arguments */
Command.strict = true;
Command.parse = true;
Command.parserOptions = {};
Command.enableJsonFlag = false;
// eslint-disable-next-line valid-jsdoc
/**
 * instantiate and run the command
 * @param {Interfaces.Command.Class} this Class
 * @param {string[]} argv argv
 * @param {Interfaces.LoadOptions} opts options
 */
Command.run = async function (argv, opts) {
    if (!argv)
        argv = process.argv.slice(2);
    // Handle the case when a file URL string is passed in such as 'import.meta.url'; covert to file path.
    if (typeof opts === 'string' && opts.startsWith('file://')) {
        opts = (0, url_1.fileURLToPath)(opts);
    }
    // to-do: update in node-14 to module.main
    const config = await config_1.Config.load(opts || (module.parent && module.parent.parent && module.parent.parent.filename) || __dirname);
    const cmd = new this(argv, config);
    return cmd._run(argv);
};
