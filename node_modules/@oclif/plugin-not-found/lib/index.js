"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_1 = require("@oclif/color");
const core_1 = require("@oclif/core");
const Levenshtein = require("fast-levenshtein");
const _ = require("lodash");
const hook = async function (opts) {
    const hiddenCommandIds = new Set(opts.config.commands.filter(c => c.hidden).map(c => c.id));
    const commandIDs = [
        ...opts.config.commandIDs,
        ...opts.config.commands.flatMap(c => c.aliases),
    ].filter(c => !hiddenCommandIds.has(c));
    if (commandIDs.length === 0)
        return;
    function closest(cmd) {
        return _.minBy(commandIDs, c => Levenshtein.get(cmd, c));
    }
    let binHelp = `${opts.config.bin} help`;
    const idSplit = opts.id.split(':');
    if (opts.config.findTopic(idSplit[0])) {
        // if valid topic, update binHelp with topic
        binHelp = `${binHelp} ${idSplit[0]}`;
    }
    const suggestion = closest(opts.id);
    const readableSuggestion = (0, core_1.toConfiguredId)(suggestion, this.config);
    const originalCmd = (0, core_1.toConfiguredId)(opts.id, this.config);
    this.warn(`${color_1.color.yellow(originalCmd)} is not a ${opts.config.bin} command.`);
    let response = '';
    try {
        response = await core_1.CliUx.ux.prompt(`Did you mean ${color_1.color.blueBright(readableSuggestion)}? [y/n]`, { timeout: 4900 });
    }
    catch (error) {
        this.log('');
        this.debug(error);
    }
    if (response === 'y') {
        const argv = opts.argv || process.argv.slice(3, process.argv.length);
        return this.config.runCommand(suggestion, argv);
    }
    this.error(`Run ${color_1.color.cmd(binHelp)} for a list of available commands.`, { exit: 127 });
};
exports.default = hook;
