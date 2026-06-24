"use strict";
// tslint:disable restrict-plus-operands
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const supportsColor = require("supports-color");
const spinner_1 = require("./spinner");
function color(s, frameIndex) {
    const prideColors = [
        chalk.keyword('pink'),
        chalk.red,
        chalk.keyword('orange'),
        chalk.yellow,
        chalk.green,
        chalk.cyan,
        chalk.blue,
        chalk.magenta,
    ];
    if (!supportsColor)
        return s;
    const has256 = supportsColor.stdout ? supportsColor.stdout.has256 : (process.env.TERM || '').includes('256');
    const prideColor = prideColors[frameIndex] || prideColors[0];
    return has256 ? prideColor(s) : chalk.magenta(s);
}
class PrideSpinnerAction extends spinner_1.default {
    _frame() {
        const frame = this.frames[this.frameIndex];
        this.frameIndex = ++this.frameIndex % this.frames.length;
        return color(frame, this.frameIndex);
    }
}
exports.default = PrideSpinnerAction;
