"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.help = exports.version = exports.file = exports.directory = exports.url = exports.integer = exports.boolean = exports.string = exports.enum = exports.option = exports.build = void 0;
const Parser = require("./parser");
function build(defaults) {
    return Parser.flags.build(defaults);
}
exports.build = build;
function option(options) {
    return build(options)();
}
exports.option = option;
const _enum = (opts) => {
    return build({
        async parse(input) {
            if (!opts.options.includes(input))
                throw new Error(`Expected --${this.name}=${input} to be one of: ${opts.options.join(', ')}`);
            return input;
        },
        helpValue: `(${opts.options.join('|')})`,
        ...opts,
    })();
};
exports.enum = _enum;
const stringFlag = build({});
exports.string = stringFlag;
var parser_1 = require("./parser");
Object.defineProperty(exports, "boolean", { enumerable: true, get: function () { return parser_1.boolean; } });
Object.defineProperty(exports, "integer", { enumerable: true, get: function () { return parser_1.integer; } });
Object.defineProperty(exports, "url", { enumerable: true, get: function () { return parser_1.url; } });
Object.defineProperty(exports, "directory", { enumerable: true, get: function () { return parser_1.directory; } });
Object.defineProperty(exports, "file", { enumerable: true, get: function () { return parser_1.file; } });
const version = (opts = {}) => {
    return Parser.flags.boolean({
        description: 'Show CLI version.',
        ...opts,
        parse: async (_, cmd) => {
            cmd.log(cmd.config.userAgent);
            cmd.exit(0);
        },
    });
};
exports.version = version;
const help = (opts = {}) => {
    return Parser.flags.boolean({
        description: 'Show CLI help.',
        ...opts,
        parse: async (_, cmd) => {
            cmd._help();
        },
    });
};
exports.help = help;
