"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
class HelpCommand extends core_1.Command {
    async run() {
        const { flags, argv } = await this.parse(HelpCommand);
        const help = new core_1.Help(this.config, { all: flags['nested-commands'] });
        await help.showHelp(argv);
    }
}
exports.default = HelpCommand;
HelpCommand.description = 'Display help for <%= config.bin %>.';
HelpCommand.flags = {
    'nested-commands': core_1.Flags.boolean({
        description: 'Include all nested commands in the output.',
        char: 'n',
    }),
};
HelpCommand.args = [
    { name: 'command', required: false, description: 'Command to show help for.' },
];
HelpCommand.strict = false;
