"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_base_1 = require("./../../command-base");
const core_1 = require("@oclif/core");
class GenerateHook extends command_base_1.default {
    async run() {
        const { args, flags } = await this.parse(GenerateHook);
        super.generate('hook', {
            name: args.name,
            event: flags.event,
            force: flags.force,
        });
    }
}
exports.default = GenerateHook;
GenerateHook.description = 'add a hook to an existing CLI or plugin';
GenerateHook.flags = {
    force: core_1.Flags.boolean({ description: 'overwrite existing files' }),
    event: core_1.Flags.string({ description: 'event to run hook on', default: 'init' }),
};
GenerateHook.args = [
    { name: 'name', description: 'name of hook (snake_case)', required: true },
];
