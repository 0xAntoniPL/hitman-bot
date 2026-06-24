"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_base_1 = require("./../../command-base");
const core_1 = require("@oclif/core");
class GenerateCommand extends command_base_1.default {
    async run() {
        const { args, flags } = await this.parse(GenerateCommand);
        super.generate('command', {
            name: args.name,
            force: flags.force,
        });
    }
}
exports.default = GenerateCommand;
GenerateCommand.description = 'add a command to an existing CLI or plugin';
GenerateCommand.flags = {
    force: core_1.Flags.boolean({ description: 'overwrite existing files' }),
};
GenerateCommand.args = [
    { name: 'name', description: 'name of command', required: true },
];
