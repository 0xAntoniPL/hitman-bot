"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const Generator = require("yeoman-generator");
const yosay = require("yosay");
const { version } = require('../../package.json');
class Hook extends Generator {
    constructor(args, options) {
        super(args, options);
        this.options = options;
    }
    hasMocha() {
        var _a;
        return Boolean((_a = this.pjson.devDependencies) === null || _a === void 0 ? void 0 : _a.mocha);
    }
    async prompting() {
        this.pjson = this.fs.readJSON('package.json');
        this.pjson.oclif = this.pjson.oclif || {};
        if (!this.pjson)
            throw new Error('not in a project directory');
        this.log(yosay(`Adding a ${this.options.event} hook to ${this.pjson.name} Version: ${version}`));
    }
    writing() {
        this.sourceRoot(path.join(__dirname, '../../templates'));
        this.fs.copyTpl(this.templatePath('src/hook.ts.ejs'), this.destinationPath(`src/hooks/${this.options.event}/${this.options.name}.ts`), this);
        if (this.hasMocha()) {
            this.fs.copyTpl(this.templatePath('test/hook.test.ts.ejs'), this.destinationPath(`test/hooks/${this.options.event}/${this.options.name}.test.ts`), this);
        }
        this.pjson.oclif = this.pjson.oclif || {};
        this.pjson.oclif.hooks = this.pjson.oclif.hooks || {};
        const hooks = this.pjson.oclif.hooks;
        const p = `./src/hooks/${this.options.event}/${this.options.name}`;
        if (hooks[this.options.event]) {
            hooks[this.options.event] = _.castArray(hooks[this.options.event]);
            hooks[this.options.event] = hooks[this.options.event].concat(p);
        }
        else {
            this.pjson.oclif.hooks[this.options.event] = p;
        }
        this.fs.writeJSON(this.destinationPath('./package.json'), this.pjson);
    }
}
exports.default = Hook;
