"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoadError = void 0;
const cli_1 = require("./cli");
class ModuleLoadError extends cli_1.CLIError {
    constructor(message) {
        super(`[MODULE_NOT_FOUND] ${message}`, { exit: 1 });
        this.code = 'MODULE_NOT_FOUND';
        this.name = 'ModuleLoadError';
    }
}
exports.ModuleLoadError = ModuleLoadError;
