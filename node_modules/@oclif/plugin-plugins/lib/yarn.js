"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const path = require("path");
const debug = require('debug')('cli:yarn');
class Yarn {
    constructor({ config }) {
        this.config = config;
    }
    get bin() {
        return require.resolve('yarn/bin/yarn.js');
    }
    fork(modulePath, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            const { fork } = require('child_process');
            const forked = fork(modulePath, args, options);
            forked.stderr.on('data', (d) => process.stderr.write(d));
            forked.stdout.setEncoding('utf8');
            forked.stdout.on('data', (d) => {
                if (options.verbose)
                    process.stdout.write(d);
                else
                    core_1.CliUx.ux.action.status = d.replace(/\n$/, '').split('\n').pop();
            });
            forked.on('error', reject);
            forked.on('exit', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`yarn ${args.join(' ')} exited with code ${code}`));
                }
            });
            // Fix windows bug with node-gyp hanging for input forever
            // if (this.config.windows) {
            //   forked.stdin.write('\n')
            // }
        });
    }
    // eslint-disable-next-line default-param-last
    async exec(args = [], opts) {
        const cwd = opts.cwd;
        if (args[0] !== 'run') {
            const cacheDir = path.join(this.config.cacheDir, 'yarn');
            args = [
                ...args,
                '--non-interactive',
                `--mutex=file:${path.join(cwd, 'yarn.lock')}`,
                `--preferred-cache-folder=${cacheDir}`,
                '--check-files',
            ];
            if (opts.verbose) {
                args.push('--verbose');
            }
            if (this.config.npmRegistry) {
                args.push(`--registry=${this.config.npmRegistry}`);
            }
        }
        const npmRunPath = require('npm-run-path');
        const options = Object.assign(Object.assign({}, opts), { cwd, stdio: [0, null, null, 'ipc'], env: npmRunPath.env({ cwd, env: process.env }) });
        if (opts.verbose) {
            process.stderr.write(`${cwd}: ${this.bin} ${args.join(' ')}`);
        }
        debug(`${cwd}: ${this.bin} ${args.join(' ')}`);
        try {
            await this.fork(this.bin, args, options);
            debug('done');
        }
        catch (error) {
            // to-do: https://github.com/yarnpkg/yarn/issues/2191
            const networkConcurrency = '--network-concurrency=1';
            if (error.message.includes('EAI_AGAIN') && !args.includes(networkConcurrency)) {
                debug('EAI_AGAIN');
                return this.exec([...args, networkConcurrency], opts);
            }
            throw error;
        }
    }
}
exports.default = Yarn;
