"use strict";
// tslint:disable
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderList = void 0;
const maxBy_1 = require("lodash/maxBy");
const deps_1 = require("./deps");
function linewrap(length, s) {
    const lw = require('@oclif/linewrap');
    return lw(length, deps_1.default.screen.stdtermwidth, {
        skipScheme: 'ansi-color',
    })(s).trim();
}
function renderList(items) {
    if (items.length === 0) {
        return '';
    }
    const maxLength = (0, maxBy_1.default)(items, '[0].length')[0].length;
    const lines = items.map(i => {
        let left = i[0];
        let right = i[1];
        if (!right) {
            return left;
        }
        left = left.padEnd(maxLength);
        right = linewrap(maxLength + 2, right);
        return `${left}  ${right}`;
    });
    return lines.join('\n');
}
exports.renderList = renderList;
