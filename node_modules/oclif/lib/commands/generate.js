"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_base_1 = require("./../command-base");
class Generate extends command_base_1.default {
    async run() {
        const { args } = await this.parse(Generate);
        super.generate('cli', {
            name: args.name,
            force: true,
        });
    }
}
exports.default = Generate;
Generate.description = `generate a new CLI
This will clone the template repo 'oclif/hello-world' and update package properties`;
Generate.flags = {};
Generate.args = [
    { name: 'name', required: true, description: 'directory name of new project' },
];
