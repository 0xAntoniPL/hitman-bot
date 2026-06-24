"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliUx = exports.flush = exports.settings = exports.toConfiguredId = exports.toStandardizedId = exports.tsPath = exports.toCached = exports.run = exports.Plugin = exports.Parser = exports.Interfaces = exports.HelpBase = exports.Help = exports.loadHelpClass = exports.Flags = exports.Errors = exports.Config = exports.CommandHelp = exports.Command = void 0;
const path = require("path");
const semver = require("semver");
const command_1 = require("./command");
exports.Command = command_1.default;
const main_1 = require("./main");
Object.defineProperty(exports, "run", { enumerable: true, get: function () { return main_1.run; } });
const config_1 = require("./config");
Object.defineProperty(exports, "Config", { enumerable: true, get: function () { return config_1.Config; } });
Object.defineProperty(exports, "Plugin", { enumerable: true, get: function () { return config_1.Plugin; } });
Object.defineProperty(exports, "tsPath", { enumerable: true, get: function () { return config_1.tsPath; } });
Object.defineProperty(exports, "toCached", { enumerable: true, get: function () { return config_1.toCached; } });
const Interfaces = require("./interfaces");
exports.Interfaces = Interfaces;
const Errors = require("./errors");
exports.Errors = Errors;
const Flags = require("./flags");
exports.Flags = Flags;
const help_1 = require("./help");
Object.defineProperty(exports, "CommandHelp", { enumerable: true, get: function () { return help_1.CommandHelp; } });
Object.defineProperty(exports, "HelpBase", { enumerable: true, get: function () { return help_1.HelpBase; } });
Object.defineProperty(exports, "Help", { enumerable: true, get: function () { return help_1.Help; } });
Object.defineProperty(exports, "loadHelpClass", { enumerable: true, get: function () { return help_1.loadHelpClass; } });
const util_1 = require("./help/util");
Object.defineProperty(exports, "toStandardizedId", { enumerable: true, get: function () { return util_1.toStandardizedId; } });
Object.defineProperty(exports, "toConfiguredId", { enumerable: true, get: function () { return util_1.toConfiguredId; } });
const Parser = require("./parser");
exports.Parser = Parser;
const settings_1 = require("./settings");
Object.defineProperty(exports, "settings", { enumerable: true, get: function () { return settings_1.settings; } });
const cliUx = require("./cli-ux");
exports.CliUx = cliUx;
const flush = require('../flush');
exports.flush = flush;
function checkCWD() {
    try {
        process.cwd();
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            process.stderr.write('WARNING: current directory does not exist\n');
        }
    }
}
function checkNodeVersion() {
    const root = path.join(__dirname, '..');
    const pjson = require(path.join(root, 'package.json'));
    if (!semver.satisfies(process.versions.node, pjson.engines.node)) {
        process.stderr.write(`WARNING\nWARNING Node version must be ${pjson.engines.node} to use this CLI\nWARNING Current node version: ${process.versions.node}\nWARNING\n`);
    }
}
checkCWD();
checkNodeVersion();
