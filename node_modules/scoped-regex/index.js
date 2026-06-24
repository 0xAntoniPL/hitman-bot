'use strict';

const regex = '@[a-z\\d][\\w-.]+/[a-z\\d][\\w-.]*';

const scopedRegex = options =>
	options && options.exact ?
		new RegExp(`^${regex}$`, 'i') :
		new RegExp(regex, 'gi');

module.exports = scopedRegex;
// TODO: Remove this for the next major release
module.exports.default = scopedRegex;
