"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendToIndex = void 0;
const fs = require("fs-extra");
const path = require("path");
const aws_1 = require("./aws");
const log_1 = require("./log");
const debug = log_1.debug.new('version-indexes');
const sortVersionsObjectByKeysDesc = (input, keyLimit) => {
    const keys = Reflect.ownKeys(input).sort((a, b) => {
        const splitA = a.split('.').map(part => Number.parseInt(part, 10));
        const splitB = b.split('.').map(part => Number.parseInt(part, 10));
        // sort by major
        if (splitA[0] < splitB[0])
            return 1;
        if (splitA[0] > splitB[0])
            return -1;
        // sort by minor
        if (splitA[1] < splitB[1])
            return 1;
        if (splitA[1] > splitB[1])
            return -1;
        // sort by patch
        if (splitA[2] < splitB[2])
            return 1;
        if (splitA[2] > splitB[2])
            return -1;
        return 0;
    }).slice(0, keyLimit); // undefined keyLimit returns the entire array
    const result = {};
    for (const key of keys) {
        result[key] = input[key];
    }
    return result;
};
// appends to an existing file (or writes a new one) with the versions in descending order, with an optional limit from the pjson file
const appendToIndex = async (input) => {
    var _a;
    const { version, originalUrl, filename, maxAge, s3Config } = input;
    // these checks are both nice for users AND helpful for TS
    if (!s3Config.bucket)
        throw new Error('[package.json].oclif.s3.bucket is required for indexes');
    if (!s3Config.host)
        throw new Error('[package.json].oclif.s3.host is required for indexes');
    // json-friendly filenames like sfdx-linux-x64-tar-gz
    const jsonFileName = `${filename.replace(/\./g, '-')}.json`;
    const key = path.join(s3Config.folder, 'versions', jsonFileName);
    // retrieve existing index file
    let existing = {};
    try {
        existing = JSON.parse((_a = (await aws_1.default.s3.getObject({
            Bucket: s3Config.bucket,
            Key: key,
        })).Body) === null || _a === void 0 ? void 0 : _a.toString());
        debug('appending to existing index file');
    }
    catch (error) {
        debug(`error on ${key}`, error);
    }
    // appends new version from this promotion if not already present (idempotent)
    await fs.writeJSON(jsonFileName, sortVersionsObjectByKeysDesc(Object.assign(Object.assign({}, existing), { [version]: originalUrl.replace(s3Config.bucket, s3Config.host) }), s3Config.indexVersionLimit), { spaces: 2 });
    // put the file back in the same place
    await aws_1.default.s3.uploadFile(jsonFileName, {
        Bucket: s3Config.bucket,
        Key: key,
        CacheControl: maxAge,
    });
    // cleans up local fs
    await fs.remove(jsonFileName);
};
exports.appendToIndex = appendToIndex;
