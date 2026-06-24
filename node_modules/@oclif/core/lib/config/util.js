"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = exports.uniq = exports.compact = exports.loadJSON = exports.resolvePackage = exports.exists = exports.mapValues = exports.flatMap = void 0;
const fs = require("fs");
const debug = require('debug');
function flatMap(arr, fn) {
    return arr.reduce((arr, i) => arr.concat(fn(i)), []);
}
exports.flatMap = flatMap;
function mapValues(obj, fn) {
    return Object.entries(obj)
        .reduce((o, [k, v]) => {
        o[k] = fn(v, k);
        return o;
    }, {});
}
exports.mapValues = mapValues;
function exists(path) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => resolve(fs.existsSync(path)));
}
exports.exists = exists;
function resolvePackage(id, paths) {
    return require.resolve(id, paths);
}
exports.resolvePackage = resolvePackage;
function loadJSON(path) {
    debug('config')('loadJSON %s', path);
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, d) => {
            try {
                if (err)
                    reject(err);
                else
                    resolve(JSON.parse(d));
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
exports.loadJSON = loadJSON;
function compact(a) {
    return a.filter((a) => Boolean(a));
}
exports.compact = compact;
function uniq(arr) {
    return arr.filter((a, i) => {
        return !arr.find((b, j) => j > i && b === a);
    });
}
exports.uniq = uniq;
function displayWarnings() {
    if (process.listenerCount('warning') > 1)
        return;
    process.on('warning', (warning) => {
        console.error(warning.stack);
        if (warning.detail)
            console.error(warning.detail);
    });
}
function Debug(...scope) {
    if (!debug)
        return (..._) => { };
    const d = debug(['config', ...scope].join(':'));
    if (d.enabled)
        displayWarnings();
    return (...args) => d(...args);
}
exports.Debug = Debug;
