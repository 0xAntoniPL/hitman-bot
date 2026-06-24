"use strict";
// tslint:disable restrict-plus-operands
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const index_1 = require("../../index");
function styledJSON(obj) {
    const json = JSON.stringify(obj, null, 2);
    if (!chalk.level) {
        index_1.CliUx.ux.info(json);
        return;
    }
    const cardinal = require('cardinal');
    const theme = require('cardinal/themes/jq');
    index_1.CliUx.ux.info(cardinal.highlight(json, { json: true, theme }));
}
exports.default = styledJSON;
