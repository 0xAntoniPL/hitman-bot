"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsPath = void 0;
const fs = require("fs");
const path = require("path");
const settings_1 = require("../settings");
const util_1 = require("../util");
const util_2 = require("./util");
// eslint-disable-next-line new-cap
const debug = (0, util_2.Debug)('ts-node');
function loadTSConfig(root) {
    const tsconfigPath = path.join(root, 'tsconfig.json');
    let typescript;
    try {
        typescript = require('typescript');
    }
    catch {
        try {
            typescript = require(root + '/node_modules/typescript');
        }
        catch { }
    }
    if (fs.existsSync(tsconfigPath) && typescript) {
        const tsconfig = typescript.parseConfigFileTextToJson(tsconfigPath, fs.readFileSync(tsconfigPath, 'utf8')).config;
        if (!tsconfig || !tsconfig.compilerOptions) {
            throw new Error(`Could not read and parse tsconfig.json at ${tsconfigPath}, or it ` +
                'did not contain a "compilerOptions" section.');
        }
        return tsconfig;
    }
}
function tsPath(root, orig) {
    if (!orig)
        return orig;
    orig = path.join(root, orig);
    const skipTSNode = 
    // the CLI specifically turned it off
    (settings_1.settings.tsnodeEnabled === false) ||
        // the CLI didn't specify ts-node and it is production
        (settings_1.settings.tsnodeEnabled === undefined && (0, util_1.isProd)());
    if (skipTSNode)
        return orig;
    try {
        const tsconfig = loadTSConfig(root);
        if (!tsconfig)
            return orig;
        const { rootDir, rootDirs, outDir } = tsconfig.compilerOptions;
        const rootDirPath = rootDir || (rootDirs || [])[0];
        if (!rootDirPath || !outDir)
            return orig;
        // rewrite path from ./lib/foo to ./src/foo
        const lib = path.join(root, outDir); // ./lib
        const src = path.join(root, rootDirPath); // ./src
        const relative = path.relative(lib, orig); // ./commands
        // For hooks, it might point to a js file, not a module. Something like "./hooks/myhook.js" which doesn't need the js.
        const out = path.join(src, relative).replace(/\.js$/, ''); // ./src/commands
        // this can be a directory of commands or point to a hook file
        // if it's a directory, we check if the path exists. If so, return the path to the directory.
        // For hooks, it might point to a module, not a file. Something like "./hooks/myhook"
        // That file doesn't exist, and the real file is "./hooks/myhook.ts"
        // In that case we attempt to resolve to the filename. If it fails it will revert back to the lib path
        if (fs.existsSync(out) || fs.existsSync(out + '.ts'))
            return out;
        return orig;
    }
    catch (error) {
        debug(error);
        return orig;
    }
}
exports.tsPath = tsPath;
