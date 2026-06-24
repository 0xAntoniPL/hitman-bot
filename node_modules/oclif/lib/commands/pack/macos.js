"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const path = require("path");
const qq = require("qqjs");
const Tarballs = require("../../tarballs");
const upload_util_1 = require("../../upload-util");
const scripts = {
    preinstall: (config, additionalCLI) => `#!/usr/bin/env bash
sudo rm -rf /usr/local/lib/${config.dirname}
sudo rm -rf /usr/local/${config.bin}
sudo rm -rf /usr/local/bin/${config.bin}
${additionalCLI ?
        `sudo rm -rf /usr/local/${additionalCLI}
sudo rm -rf /usr/local/bin/${additionalCLI}` : ''}
`,
    postinstall: (config, additionalCLI) => `#!/usr/bin/env bash
set -x
sudo mkdir -p /usr/local/bin
sudo ln -sf /usr/local/lib/${config.dirname}/bin/${config.bin} /usr/local/bin/${config.bin}
${additionalCLI ? `sudo ln -sf /usr/local/lib/${config.dirname}/bin/${additionalCLI} /usr/local/bin/${additionalCLI}` : ''}
`,
    uninstall: (config, additionalCLI) => {
        const packageIdentifier = config.pjson.oclif.macos.identifier;
        return `#!/usr/bin/env bash

#Parameters
DATE=\`date +%Y-%m-%d\`
TIME=\`date +%H:%M:%S\`
LOG_PREFIX="[$DATE $TIME]"

#Functions
log_info() {
    echo "\${LOG_PREFIX}[INFO]" $1
}

log_warn() {
    echo "\${LOG_PREFIX}[WARN]" $1
}

log_error() {
    echo "\${LOG_PREFIX}[ERROR]" $1
}

#Check running user
if (( $EUID != 0 )); then
    echo "Please run as root."
    exit
fi

echo "Welcome to Application Uninstaller"
echo "The following packages will be REMOVED:"
echo "  ${config.dirname}"
while [ "$1" != "-y" ]; do
    read -p "Do you wish to continue [Y/n]?" answer
    [[ $answer == "y" || $answer == "Y" || $answer == "" ]] && break
    [[ $answer == "n" || $answer == "N" ]] && exit 0
    echo "Please answer with 'y' or 'n'"
done

echo "Application uninstalling process started"
# remove link to shorcut file
find "/usr/local/bin/" -name "${config.bin}" | xargs rm
${additionalCLI ? `find "/usr/local/bin/" -name "${additionalCLI}" | xargs rm` : ''}
if [ $? -eq 0 ]
then
  echo "[1/3] [DONE] Successfully deleted shortcut links"
else
  echo "[1/3] [ERROR] Could not delete shortcut links" >&2
fi

#forget from pkgutil
pkgutil --forget "${packageIdentifier}" > /dev/null 2>&1
if [ $? -eq 0 ]
then
  echo "[2/3] [DONE] Successfully deleted application informations"
else
  echo "[2/3] [ERROR] Could not delete application informations" >&2
fi

#remove application source distribution
[ -e "/usr/local/lib/${config.dirname}" ] && rm -rf "/usr/local/lib/${config.dirname}"

#remove application data directory
[ -e "${config.dataDir}" ] && rm -rf "${config.dataDir}"

#remove application cache directory
[ -e "${config.cacheDir}" ] && rm -rf "${config.cacheDir}"

#remove application config directory
[ -e "${config.configDir}" ] && rm -rf "${config.configDir}"

if [ $? -eq 0 ]
then
  echo "[3/3] [DONE] Successfully deleted application"
else
  echo "[3/3] [ERROR] Could not delete application" >&2
fi

echo "Application uninstall process finished"
exit 0
`;
    },
};
class PackMacos extends core_1.Command {
    async run() {
        if (process.platform !== 'darwin')
            this.error('must be run from macos');
        const { flags } = await this.parse(PackMacos);
        const buildConfig = await Tarballs.buildConfig(flags.root);
        const { config } = buildConfig;
        const c = config.pjson.oclif;
        if (!c.macos)
            this.error('package.json is missing an oclif.macos config');
        if (!c.macos.identifier)
            this.error('package.json must have oclif.macos.identifier set');
        const macos = c.macos;
        const packageIdentifier = macos.identifier;
        await Tarballs.build(buildConfig, { platform: 'darwin', pack: false, tarball: flags.tarball });
        const templateKey = (0, upload_util_1.templateShortKey)('macos', { bin: config.bin, version: config.version, sha: buildConfig.gitSha });
        const dist = buildConfig.dist(`macos/${templateKey}`);
        await qq.emptyDir(path.dirname(dist));
        const scriptsDir = qq.join(buildConfig.tmp, 'macos/scripts');
        const rootDir = buildConfig.workspace({ platform: 'darwin', arch: 'x64' });
        const writeScript = async (script) => {
            const path = script === 'uninstall' ? [rootDir, 'bin'] : [scriptsDir];
            path.push(script);
            await qq.write(path, scripts[script](config, flags['additional-cli']));
            await qq.chmod(path, 0o755);
        };
        await writeScript('preinstall');
        await writeScript('postinstall');
        await writeScript('uninstall');
        /* eslint-disable array-element-newline */
        const args = [
            '--root', rootDir,
            '--identifier', packageIdentifier,
            '--version', config.version,
            '--install-location', `/usr/local/lib/${config.dirname}`,
            '--scripts', scriptsDir,
        ];
        /* eslint-enable array-element-newline */
        if (macos.sign) {
            args.push('--sign', macos.sign);
        }
        else
            this.debug('Skipping macOS pkg signing');
        if (process.env.OSX_KEYCHAIN)
            args.push('--keychain', process.env.OSX_KEYCHAIN);
        args.push(dist);
        await qq.x('pkgbuild', args);
    }
}
exports.default = PackMacos;
PackMacos.description = 'pack CLI into macOS .pkg';
PackMacos.flags = {
    root: core_1.Flags.string({
        char: 'r',
        description: 'path to oclif CLI root',
        default: '.',
        required: true,
    }),
    'additional-cli': core_1.Flags.string({
        description: `an Oclif CLI other than the one listed in config.bin that should be made available to the user
the CLI should already exist in a directory named after the CLI that is the root of the tarball produced by "oclif pack:tarballs"`,
        hidden: true,
    }),
    tarball: core_1.Flags.string({
        char: 't',
        description: 'optionally specify a path to a tarball already generated by NPM',
        required: false,
    }),
};
