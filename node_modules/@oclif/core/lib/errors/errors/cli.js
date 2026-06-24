"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIError = exports.addOclifExitCode = void 0;
const chalk = require("chalk");
const indent = require("indent-string");
const cs = require("clean-stack");
const wrap = require("wrap-ansi");
const screen = require("../../screen");
const config_1 = require("../config");
/**
 * properties specific to internal oclif error handling
 */
function addOclifExitCode(error, options) {
    if (!('oclif' in error)) {
        error.oclif = {};
    }
    error.oclif.exit = (options === null || options === void 0 ? void 0 : options.exit) === undefined ? 2 : options.exit;
    return error;
}
exports.addOclifExitCode = addOclifExitCode;
class CLIError extends Error {
    constructor(error, options = {}) {
        super(error instanceof Error ? error.message : error);
        this.oclif = {};
        addOclifExitCode(this, options);
        this.code = options.code;
    }
    get stack() {
        return cs(super.stack, { pretty: true });
    }
    /**
     * @deprecated `render` Errors display should be handled by display function, like pretty-print
     * @return {string} returns a string representing the dispay of the error
     */
    render() {
        if (config_1.config.debug) {
            return this.stack;
        }
        let output = `${this.name}: ${this.message}`;
        output = wrap(output, screen.errtermwidth - 6, { trim: false, hard: true });
        output = indent(output, 3);
        output = indent(output, 1, { indent: this.bang, includeEmptyLines: true });
        output = indent(output, 1);
        return output;
    }
    get bang() {
        try {
            return chalk.red(process.platform === 'win32' ? '»' : '›');
        }
        catch { }
    }
}
exports.CLIError = CLIError;
(function (CLIError) {
    class Warn extends CLIError {
        constructor(err) {
            super(err instanceof Error ? err.message : err);
            this.name = 'Warning';
        }
        get bang() {
            try {
                return chalk.yellow(process.platform === 'win32' ? '»' : '›');
            }
            catch { }
        }
    }
    CLIError.Warn = Warn;
})(CLIError = exports.CLIError || (exports.CLIError = {}));
