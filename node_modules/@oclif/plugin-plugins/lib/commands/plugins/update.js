"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const plugins_1 = require("../../plugins");
class PluginsUpdate extends core_1.Command {
    constructor() {
        super(...arguments);
        this.plugins = new plugins_1.default(this.config);
    }
    async run() {
        const { flags } = await this.parse(PluginsUpdate);
        this.plugins.verbose = flags.verbose;
        await this.plugins.update();
    }
}
exports.default = PluginsUpdate;
PluginsUpdate.topic = 'plugins';
PluginsUpdate.command = 'update';
PluginsUpdate.description = 'Update installed plugins.';
PluginsUpdate.flags = {
    help: core_1.Flags.help({ char: 'h' }),
    verbose: core_1.Flags.boolean({ char: 'v' }),
};
