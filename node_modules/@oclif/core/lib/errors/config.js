"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const settings_1 = require("../settings");
const logger_1 = require("./logger");
function displayWarnings() {
    if (process.listenerCount('warning') > 1)
        return;
    process.on('warning', (warning) => {
        console.error(warning.stack);
        if (warning.detail)
            console.error(warning.detail);
    });
}
exports.config = {
    errorLogger: undefined,
    get debug() {
        return Boolean(settings_1.settings.debug);
    },
    set debug(enabled) {
        settings_1.settings.debug = enabled;
        if (enabled)
            displayWarnings();
    },
    get errlog() {
        return settings_1.settings.errlog;
    },
    set errlog(errlog) {
        if (errlog) {
            this.errorLogger = new logger_1.Logger(errlog);
            settings_1.settings.errlog = errlog;
        }
        else {
            delete this.errorLogger;
            delete settings_1.settings.errlog;
        }
    },
};
