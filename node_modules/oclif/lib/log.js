"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.debug = void 0;
const core_1 = require("@oclif/core");
const qq = require("qqjs");
const util = require("util");
exports.debug = require('debug')('oclif');
exports.debug.new = (name) => require('debug')(`oclif:${name}`);
function log(format, ...args) {
    args = args.map((arg) => qq.prettifyPaths(arg));
    exports.debug.enabled ? (0, exports.debug)(format, ...args) : core_1.CliUx.ux.log(`oclif: ${util.format(format, ...args)}`);
}
exports.log = log;
