"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const qq = require("qqjs");
const aws_1 = require("../../aws");
const log_1 = require("../../log");
const Tarballs = require("../../tarballs");
const upload_util_1 = require("../../upload-util");
class UploadWin extends core_1.Command {
    async run() {
        const { flags } = await this.parse(UploadWin);
        const buildConfig = await Tarballs.buildConfig(flags.root);
        const { s3Config, config, dist } = buildConfig;
        const S3Options = {
            Bucket: s3Config.bucket,
            ACL: s3Config.acl || 'public-read',
        };
        const archs = buildConfig.targets.filter(t => t.platform === 'win32').map(t => t.arch);
        for (const arch of archs) {
            const templateKey = (0, upload_util_1.templateShortKey)('win32', { bin: config.bin, version: config.version, sha: buildConfig.gitSha, arch });
            const localKey = dist(`win32/${templateKey}`);
            // eslint-disable-next-line no-await-in-loop
            if (!await qq.exists(localKey))
                this.error(`Cannot find Windows exe for ${arch}`, {
                    suggestions: ['Run "oclif pack win" before uploading'],
                });
        }
        const cloudKeyBase = (0, upload_util_1.commitAWSDir)(config.pjson.version, buildConfig.gitSha, s3Config);
        const uploadWin = async (arch) => {
            const templateKey = (0, upload_util_1.templateShortKey)('win32', { bin: config.bin, version: config.version, sha: buildConfig.gitSha, arch });
            const localExe = dist(`win32/${templateKey}`);
            const cloudKey = `${cloudKeyBase}/${templateKey}`;
            if (await qq.exists(localExe))
                await aws_1.default.s3.uploadFile(localExe, Object.assign(Object.assign({}, S3Options), { CacheControl: 'max-age=86400', Key: cloudKey }));
        };
        await uploadWin('x64');
        await uploadWin('x86');
        (0, log_1.log)(`done uploading windows executables for v${config.version}-${buildConfig.gitSha}`);
    }
}
exports.default = UploadWin;
UploadWin.description = 'upload windows installers built with pack:win';
UploadWin.flags = {
    root: core_1.Flags.string({ char: 'r', description: 'path to oclif CLI root', default: '.', required: true }),
};
