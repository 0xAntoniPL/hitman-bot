"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Generator = require("yeoman-generator");
const yosay = require("yosay");
const debug = require('debug')('generator-oclif');
const { version } = require('../../package.json');
let hasYarn = false;
try {
    (0, child_process_1.execSync)('yarn -v', { stdio: 'ignore' });
    hasYarn = true;
}
catch (_a) { }
class CLI extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.name = opts.name;
        this.options = {
            defaults: opts.defaults,
            force: opts.force,
            yarn: hasYarn,
        };
    }
    async prompting() {
        const msg = 'Time to build an oclif CLI!';
        this.log(yosay(`${msg} Version: ${version}`));
        (0, child_process_1.execSync)(`git clone https://github.com/oclif/hello-world.git "${path.resolve(this.name)}"`);
        fs.rmSync(`${path.resolve(this.name, '.git')}`, { recursive: true });
        this.destinationRoot(path.resolve(this.name));
        this.env.cwd = this.destinationPath();
        this.githubUser = await this.user.github.username().catch(debug);
        // establish order of properties in the resulting package.json
        this.pjson = Object.assign({ name: '', version: '', description: '', author: '', bin: {}, homepage: '', license: '', main: '', repository: '', files: [], dependencies: {}, devDependencies: {}, oclif: {}, scripts: {}, engines: {} }, this.fs.readJSON(path.join(this.env.cwd, 'package.json'), {}));
        let repository = this.destinationRoot().split(path.sep).slice(-2).join('/');
        if (this.githubUser)
            repository = `${this.githubUser}/${repository.split('/')[1]}`;
        const defaults = Object.assign(Object.assign({}, this.pjson), { name: this.name ? this.name.replace(/ /g, '-') : this.determineAppname().replace(/ /g, '-'), version: '0.0.0', license: 'MIT', author: this.githubUser ? `${this.user.git.name()} @${this.githubUser}` : this.user.git.name(), dependencies: {}, repository, engines: Object.assign({ node: '>=12.0.0' }, this.pjson.engines), options: this.options });
        this.repository = defaults.repository;
        if (this.repository && this.repository.url) {
            this.repository = this.repository.url;
        }
        if (this.options.defaults) {
            this.answers = defaults;
        }
        else {
            this.answers = await this.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'npm package name',
                    default: defaults.name,
                },
                {
                    type: 'input',
                    name: 'bin',
                    message: 'command bin name the CLI will export',
                    default: (answers) => answers.name,
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'description',
                    default: defaults.description,
                },
                {
                    type: 'input',
                    name: 'author',
                    message: 'author',
                    default: defaults.author,
                },
                {
                    type: 'input',
                    name: 'version',
                    message: 'version',
                    default: defaults.version,
                    when: !this.pjson.version,
                },
                {
                    type: 'input',
                    name: 'license',
                    message: 'license',
                    default: defaults.license,
                },
                {
                    type: 'input',
                    name: 'github.user',
                    message: 'Who is the GitHub owner of repository (https://github.com/OWNER/repo)',
                    default: repository.split('/').slice(0, -1).pop(),
                },
                {
                    type: 'input',
                    name: 'github.repo',
                    message: 'What is the GitHub name of repository (https://github.com/owner/REPO)',
                    default: (answers) => (this.pjson.repository || answers.name || this.pjson.name).split('/').pop(),
                },
                {
                    type: 'list',
                    name: 'pkg',
                    message: 'Select a package manager',
                    choices: [
                        { name: 'npm', value: 'npm' },
                        { name: 'yarn', value: 'yarn' },
                    ],
                    default: () => this.options.yarn || hasYarn ? 1 : 0,
                },
            ]);
        }
        debug(this.answers);
        if (!this.options.defaults) {
            this.options = Object.assign(Object.assign({}, this.answers.ci), { yarn: this.answers.pkg === 'yarn', force: true });
        }
        this.yarn = this.options.yarn;
        this.env.options.nodePackageManager = this.yarn ? 'yarn' : 'npm';
        this.pjson.name = this.answers.name || defaults.name;
        this.pjson.description = this.answers.description || defaults.description;
        this.pjson.version = this.answers.version || defaults.version;
        this.pjson.engines.node = defaults.engines.node;
        this.pjson.author = this.answers.author || defaults.author;
        this.pjson.files = this.answers.files || defaults.files || '/lib';
        this.pjson.license = this.answers.license || defaults.license;
        // eslint-disable-next-line no-multi-assign
        this.repository = this.pjson.repository = this.answers.github ? `${this.answers.github.user}/${this.answers.github.repo}` : defaults.repository;
        this.pjson.homepage = `https://github.com/${this.repository}`;
        this.pjson.bugs = `https://github.com/${this.repository}/issues`;
        this.pjson.oclif.bin = this.answers.bin;
        this.pjson.oclif.dirname = this.answers.bin;
        this.pjson.bin = {};
        this.pjson.bin[this.pjson.oclif.bin] = './bin/run';
    }
    writing() {
        if (this.pjson.oclif && Array.isArray(this.pjson.oclif.plugins)) {
            this.pjson.oclif.plugins.sort();
        }
        if (_.isEmpty(this.pjson.oclif))
            delete this.pjson.oclif;
        this.pjson.files = _.uniq((this.pjson.files || []).sort());
        this.fs.writeJSON(this.destinationPath('./package.json'), this.pjson);
        this.fs.write(this.destinationPath('.gitignore'), this._gitignore());
    }
    end() {
        this.spawnCommandSync(this.env.options.nodePackageManager, ['run', 'build']);
        this.spawnCommandSync(path.join(this.env.cwd, 'node_modules', '.bin', 'oclif'), ['readme'], { cwd: this.env.cwd });
        console.log(`\nCreated ${this.pjson.name} in ${this.destinationRoot()}`);
    }
    _gitignore() {
        const existing = this.fs.exists(this.destinationPath('.gitignore')) ? this.fs.read(this.destinationPath('.gitignore')).split('\n') : [];
        return _([
            '*-debug.log',
            '*-error.log',
            'node_modules',
            '/tmp',
            '/dist',
            this.yarn ? '/package-lock.json' : '/yarn.lock',
            '/lib',
        ])
            .concat(existing)
            .compact()
            .uniq()
            .sort()
            .join('\n') + '\n';
    }
}
exports.default = CLI;
