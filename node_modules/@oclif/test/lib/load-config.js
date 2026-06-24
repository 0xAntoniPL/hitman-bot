"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const core_1 = require("@oclif/core");
/**
 * loads CLI plugin/multi config
 * @param {loadConfig.Options} opts options
 * @return {Promise<Interfaces.Config>} config
 */
function loadConfig(opts = {}) {
    return {
        async run(ctx) {
            ctx.config = await core_1.Config.load(opts.root || loadConfig.root);
            return ctx.config;
        },
    };
}
exports.loadConfig = loadConfig;
(function (loadConfig) {
})(loadConfig = exports.loadConfig || (exports.loadConfig = {}));
