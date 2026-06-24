"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const yeoman_environment_1 = require("yeoman-environment");
class CommandBase extends core_1.Command {
    generate(type, generatorOptions = {}) {
        const env = (0, yeoman_environment_1.createEnv)();
        env.register(require.resolve(`./generators/${type}`), `oclif:${type}`);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        env.run(`oclif:${type}`, generatorOptions);
    }
}
exports.default = CommandBase;
