"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const qq = require("qqjs");
const aws_1 = require("../../aws");
const log_1 = require("../../log");
const Tarballs = require("../../tarballs");
const upload_util_1 = require("../../upload-util");
class UploadTarballs extends core_1.Command {
    async run() {
        var _a;
        const { flags } = await this.parse(UploadTarballs);
        if (process.platform === 'win32')
            throw new Error('upload does not function on windows');
        const buildConfig = await Tarballs.buildConfig(flags.root, { xz: flags.xz, targets: (_a = flags === null || flags === void 0 ? void 0 : flags.targets) === null || _a === void 0 ? void 0 : _a.split(',') });
        const { s3Config, dist, config, xz } = buildConfig;
        // fail early if targets are not built
        for (const target of buildConfig.targets) {
            const tarball = dist((0, upload_util_1.templateShortKey)('versioned', Object.assign({ ext: '.tar.gz', bin: config.bin, version: config.version, sha: buildConfig.gitSha }, target)));
            // eslint-disable-next-line no-await-in-loop
            if (!await qq.exists(tarball))
                this.error(`Cannot find a tarball ${tarball} for ${target.platform}-${target.arch}`, {
                    suggestions: [`Run "oclif pack --target ${target.platform}-${target.arch}" before uploading`],
                });
        }
        const S3Options = {
            Bucket: s3Config.bucket,
            ACL: s3Config.acl || 'public-read',
        };
        const uploadTarball = async (options) => {
            const TarballS3Options = Object.assign(Object.assign({}, S3Options), { CacheControl: 'max-age=604800' });
            const releaseTarballs = async (ext) => {
                const localKey = (0, upload_util_1.templateShortKey)('versioned', ext, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    arch: options === null || options === void 0 ? void 0 : options.arch,
                    bin: config.bin,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    platform: options === null || options === void 0 ? void 0 : options.platform,
                    sha: buildConfig.gitSha,
                    version: config.version,
                });
                const cloudKey = `${(0, upload_util_1.commitAWSDir)(config.version, buildConfig.gitSha, s3Config)}/${localKey}`;
                await aws_1.default.s3.uploadFile(dist(localKey), Object.assign(Object.assign({}, TarballS3Options), { ContentType: 'application/gzip', Key: cloudKey }));
            };
            await releaseTarballs('.tar.gz');
            if (xz)
                await releaseTarballs('.tar.xz');
            const ManifestS3Options = Object.assign(Object.assign({}, S3Options), { CacheControl: 'max-age=86400', ContentType: 'application/json' });
            const manifest = (0, upload_util_1.templateShortKey)('manifest', {
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                arch: options === null || options === void 0 ? void 0 : options.arch,
                bin: config.bin,
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                platform: options === null || options === void 0 ? void 0 : options.platform,
                sha: buildConfig.gitSha,
                version: config.version,
            });
            const cloudKey = `${(0, upload_util_1.commitAWSDir)(config.version, buildConfig.gitSha, s3Config)}/${manifest}`;
            await aws_1.default.s3.uploadFile(dist(manifest), Object.assign(Object.assign({}, ManifestS3Options), { Key: cloudKey }));
        };
        if (buildConfig.targets.length > 0)
            (0, log_1.log)('uploading targets');
        // eslint-disable-next-line no-await-in-loop
        for (const target of buildConfig.targets)
            await uploadTarball(target);
        (0, log_1.log)(`done uploading tarballs & manifests for v${config.version}-${buildConfig.gitSha}`);
    }
}
exports.default = UploadTarballs;
UploadTarballs.description = `upload an oclif CLI to S3

"aws-sdk" will need to be installed as a devDependency to upload.
`;
UploadTarballs.flags = {
    root: core_1.Flags.string({ char: 'r', description: 'path to oclif CLI root', default: '.', required: true }),
    targets: core_1.Flags.string({ char: 't', description: 'comma-separated targets to upload (e.g.: linux-arm,win32-x64)' }),
    xz: core_1.Flags.boolean({ description: 'also upload xz', allowNo: true }),
};
