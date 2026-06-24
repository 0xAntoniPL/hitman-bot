"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const index_1 = require("../../index");
function styledHeader(header) {
    index_1.CliUx.ux.info(chalk.dim('=== ') + chalk.bold(header) + '\n');
}
exports.default = styledHeader;
