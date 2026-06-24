"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfig = exports.gitSha = exports.TARGETS = void 0;
const core_1 = require("@oclif/core");
const path = require("path");
const qq = require("qqjs");
const semver = require("semver");
const util_1 = require("../util");
const upload_util_1 = require("../upload-util");
exports.TARGETS = [
    'linux-x64',
    'linux-arm',
    'win32-x64',
    'win32-x86',
    'darwin-x64',
    'darwin-arm64',
];
async function gitSha(cwd, options = {}) {
    const args = options.short ? ['rev-parse', '--short', 'HEAD'] : ['rev-parse', 'HEAD'];
    return qq.x.stdout('git', args, { cwd });
}
exports.gitSha = gitSha;
async function Tmp(config) {
    const tmp = path.join(config.root, 'tmp');
    await qq.mkdirp(tmp);
    return tmp;
}
async function buildConfig(root, options = {}) {
    var _a, _b, _c;
    const config = await core_1.Config.load({ root: path.resolve(root), devPlugins: false, userPlugins: false });
    root = config.root;
    const _gitSha = await gitSha(root, { short: true });
    // eslint-disable-next-line new-cap
    const tmp = await Tmp(config);
    const updateConfig = config.pjson.oclif.update || {};
    updateConfig.s3 = updateConfig.s3 || {};
    const nodeVersion = updateConfig.node.version || process.versions.node;
    const targets = (0, util_1.compact)(options.targets || updateConfig.node.targets || exports.TARGETS)
        .filter(t => {
        if (t === 'darwin-arm64' && semver.lt(nodeVersion, '16.0.0')) {
            core_1.CliUx.ux.warn('darwin-arm64 is only supported for node >=16.0.0. Skipping...');
            return false;
        }
        return true;
    })
        .map(t => {
        const [platform, arch] = t.split('-');
        return { platform, arch };
    });
    return {
        root,
        gitSha: _gitSha,
        config,
        tmp,
        updateConfig,
        xz: (_c = (_a = options === null || options === void 0 ? void 0 : options.xz) !== null && _a !== void 0 ? _a : (_b = updateConfig === null || updateConfig === void 0 ? void 0 : updateConfig.s3) === null || _b === void 0 ? void 0 : _b.xz) !== null && _c !== void 0 ? _c : true,
        dist: (...args) => path.join(config.root, 'dist', ...args),
        s3Config: updateConfig.s3,
        nodeVersion,
        workspace(target) {
            const base = qq.join(config.root, 'tmp');
            if (target && target.platform)
                return qq.join(base, [target.platform, target.arch].join('-'), (0, upload_util_1.templateShortKey)('baseDir', { bin: config.bin }));
            return qq.join(base, (0, upload_util_1.templateShortKey)('baseDir', { bin: config.bin }));
        },
        targets,
    };
}
exports.buildConfig = buildConfig;
