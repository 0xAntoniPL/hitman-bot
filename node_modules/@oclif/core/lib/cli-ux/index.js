"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = exports.ExitError = exports.Config = exports.ActionBase = exports.config = exports.ux = void 0;
const Errors = require("../errors");
const util = require("util");
const base_1 = require("./action/base");
Object.defineProperty(exports, "ActionBase", { enumerable: true, get: function () { return base_1.ActionBase; } });
const config_1 = require("./config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_1.config; } });
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.Config; } });
const deps_1 = require("./deps");
const exit_1 = require("./exit");
Object.defineProperty(exports, "ExitError", { enumerable: true, get: function () { return exit_1.ExitError; } });
const Table = require("./styled/table");
exports.Table = Table;
const hyperlinker = require('hyperlinker');
function timeout(p, ms) {
    function wait(ms, unref = false) {
        return new Promise(resolve => {
            const t = setTimeout(() => resolve(null), ms);
            if (unref)
                t.unref();
        });
    }
    return Promise.race([p, wait(ms, true).then(() => exports.ux.error('timed out'))]);
}
async function flush() {
    const p = new Promise(resolve => {
        process.stdout.once('drain', () => resolve(null));
    });
    process.stdout.write('');
    return p;
}
exports.ux = {
    config: config_1.config,
    warn: Errors.warn,
    error: Errors.error,
    exit: Errors.exit,
    get prompt() {
        return deps_1.default.prompt.prompt;
    },
    /**
     * "press anykey to continue"
     */
    get anykey() {
        return deps_1.default.prompt.anykey;
    },
    get confirm() {
        return deps_1.default.prompt.confirm;
    },
    get action() {
        return config_1.config.action;
    },
    get prideAction() {
        return config_1.config.prideAction;
    },
    styledObject(obj, keys) {
        exports.ux.info(deps_1.default.styledObject(obj, keys));
    },
    get styledHeader() {
        return deps_1.default.styledHeader;
    },
    get styledJSON() {
        return deps_1.default.styledJSON;
    },
    get table() {
        return deps_1.default.table;
    },
    get tree() {
        return deps_1.default.tree;
    },
    get open() {
        return deps_1.default.open;
    },
    get wait() {
        return deps_1.default.wait;
    },
    get progress() {
        return deps_1.default.progress;
    },
    async done() {
        config_1.config.action.stop();
        // await flushStdout()
    },
    trace(format, ...args) {
        if (this.config.outputLevel === 'trace') {
            process.stdout.write(util.format(format, ...args) + '\n');
        }
    },
    debug(format, ...args) {
        if (['trace', 'debug'].includes(this.config.outputLevel)) {
            process.stdout.write(util.format(format, ...args) + '\n');
        }
    },
    info(format, ...args) {
        process.stdout.write(util.format(format, ...args) + '\n');
    },
    log(format, ...args) {
        this.info(format || '', ...args);
    },
    url(text, uri, params = {}) {
        const supports = require('supports-hyperlinks');
        if (supports.stdout) {
            this.log(hyperlinker(text, uri, params));
        }
        else {
            this.log(uri);
        }
    },
    annotation(text, annotation) {
        const supports = require('supports-hyperlinks');
        if (supports.stdout) {
            // \u001b]8;;https://google.com\u0007sometext\u001b]8;;\u0007
            this.log(`\u001B]1337;AddAnnotation=${text.length}|${annotation}\u0007${text}`);
        }
        else {
            this.log(text);
        }
    },
    async flush() {
        await timeout(flush(), 10000);
    },
};
const cliuxProcessExitHandler = async () => {
    try {
        await exports.ux.done();
    }
    catch (error) {
        // tslint:disable no-console
        console.error(error);
        process.exitCode = 1;
    }
};
// to avoid MaxListenersExceededWarning
// only attach named listener once
const cliuxListener = process.listeners('exit').find(fn => fn.name === cliuxProcessExitHandler.name);
if (!cliuxListener) {
    process.once('exit', cliuxProcessExitHandler);
}
