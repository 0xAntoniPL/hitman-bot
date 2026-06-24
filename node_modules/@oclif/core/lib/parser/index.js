"use strict";
// tslint:disable interface-over-type-literal
Object.defineProperty(exports, "__esModule", { value: true });
exports.file = exports.directory = exports.url = exports.integer = exports.boolean = exports.parse = exports.flagUsages = exports.flags = exports.args = void 0;
const args = require("./args");
exports.args = args;
const deps_1 = require("./deps");
const flags = require("./flags");
exports.flags = flags;
const parse_1 = require("./parse");
var help_1 = require("./help");
Object.defineProperty(exports, "flagUsages", { enumerable: true, get: function () { return help_1.flagUsages; } });
// eslint-disable-next-line new-cap
const m = (0, deps_1.default)()
    // eslint-disable-next-line node/no-missing-require
    .add('validate', () => require('./validate').validate);
async function parse(argv, options) {
    const input = {
        argv,
        context: options.context,
        args: (options.args || []).map((a) => args.newArg(a)),
        '--': options['--'],
        flags: {
            color: flags.defaultFlags.color,
            ...((options.flags || {})),
        },
        strict: options.strict !== false,
    };
    const parser = new parse_1.Parser(input);
    const output = await parser.parse();
    m.validate({ input, output });
    return output;
}
exports.parse = parse;
const { boolean, integer, url, directory, file } = flags;
exports.boolean = boolean;
exports.integer = integer;
exports.url = url;
exports.directory = directory;
exports.file = file;
