'use strict';
const scopedRegex = require('scoped-regex');

const isScoped = input => scopedRegex({exact: true}).test(input);

module.exports = isScoped;
// TODO: Remove this for the next major release
module.exports.default = isScoped;
