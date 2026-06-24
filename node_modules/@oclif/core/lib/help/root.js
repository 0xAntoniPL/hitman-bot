"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stripAnsi = require("strip-ansi");
const util_1 = require("../util");
const formatter_1 = require("./formatter");
class RootHelp extends formatter_1.HelpFormatter {
    constructor(config, opts) {
        super(config, opts);
        this.config = config;
        this.opts = opts;
    }
    root() {
        let description = this.config.pjson.oclif.description || this.config.pjson.description || '';
        description = this.render(description);
        description = description.split('\n')[0];
        let output = (0, util_1.compact)([
            description,
            this.version(),
            this.usage(),
            this.description(),
        ]).join('\n\n');
        if (this.opts.stripAnsi)
            output = stripAnsi(output);
        return output;
    }
    usage() {
        return this.section(this.opts.usageHeader || 'USAGE', this.wrap(`$ ${this.config.bin} [COMMAND]`));
    }
    description() {
        let description = this.config.pjson.oclif.description || this.config.pjson.description || '';
        description = this.render(description);
        description = description.split('\n').slice(1).join('\n');
        if (!description)
            return;
        return this.section('DESCRIPTION', this.wrap(description));
    }
    version() {
        return this.section('VERSION', this.wrap(this.config.userAgent));
    }
}
exports.default = RootHelp;
