"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const Generator = require("yeoman-generator");
const yosay = require("yosay");
const { version } = require('../../package.json');
class Command extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.options = {
            name: opts.name,
            defaults: opts.defaults,
            force: opts.force,
        };
    }
    hasMocha() {
        var _a;
        return Boolean((_a = this.pjson.devDependencies) === null || _a === void 0 ? void 0 : _a.mocha);
    }
    async prompting() {
        this.pjson = this.fs.readJSON('package.json');
        if (!this.pjson)
            throw new Error('not in a project directory');
        this.pjson.oclif = this.pjson.oclif || {};
        this.log(yosay(`Adding a command to ${this.pjson.name} Version: ${version}`));
    }
    writing() {
        const cmdPath = this.options.name.split(':').join('/');
        this.sourceRoot(path.join(__dirname, '../../templates'));
        let bin = this.pjson.oclif.bin || this.pjson.oclif.dirname || this.pjson.name;
        if (bin.includes('/'))
            bin = bin.split('/').pop();
        const cmd = `${bin} ${this.options.name}`;
        const commandPath = this.destinationPath(`src/commands/${cmdPath}.ts`);
        const opts = Object.assign(Object.assign({}, this.options), { bin, cmd, _, type: 'command', path: commandPath });
        this.fs.copyTpl(this.templatePath('src/command.ts.ejs'), commandPath, opts);
        if (this.hasMocha()) {
            this.fs.copyTpl(this.templatePath('test/command.test.ts.ejs'), this.destinationPath(`test/commands/${cmdPath}.test.ts`), opts);
        }
    }
}
exports.default = Command;
