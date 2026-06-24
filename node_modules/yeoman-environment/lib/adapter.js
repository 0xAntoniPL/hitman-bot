const inquirer = require('inquirer');
const diff = require('diff');
const chalk = require('chalk');

const logger = require('./util/log');

class TerminalAdapter {
  /**
   * `TerminalAdapter` is the default implementation of `Adapter`, an abstraction
   * layer that defines the I/O interactions.
   *
   * It provides a CLI interaction
   *
   * @constructor
   * @param {Object}          [options]
   * @param {Console} [options.console]
   */
  constructor(options = {}) {
    const stdout = options.stdout || process.stdout;
    const stderr = options.stderr || options.stdout || process.stderr;
    this.promptModule = inquirer.createPromptModule({skipTTYChecks: true, input: options.stdin, output: stdout});
    this.console = options.console || new console.Console(stdout, stderr);

    this.log = logger({console: this.console, stdout: options.stdout});
    this.tracker = logger.tracker;
  }

  get _colorDiffAdded() {
    return chalk.black.bgGreen;
  }

  get _colorDiffRemoved() {
    return chalk.bgRed;
  }

  _colorLines(name, string) {
    return string.split('\n').map(line => this[`_colorDiff${name}`](line)).join('\n');
  }

  /**
   * Prompt a user for one or more questions and pass
   * the answer(s) to the provided callback.
   *
   * It shares its interface with `Base.prompt`
   *
   * (Defined inside the constructor to keep interfaces separated between
   * instances)
   *
   * @param {Object|Object[]} questions
   * @param {Object} [answers] Answers to be passed to inquirer
   * @param {Function} [cb] Deprecated: callback for backward compatibility.
   * @return {Object} promise answers
   */
  prompt(questions, answers, cb) {
    if (typeof answers === 'function') {
      cb = answers;
      answers = undefined;
    }
    const promise = this.promptModule(questions, answers);
    if (typeof cb === 'function') {
      promise.then(answers => cb(answers));
    }
    return promise;
  }

  /**
   * Shows a color-based diff of two strings
   *
   * @param {string} actual
   * @param {string} expected
   * @param {Array} changes returned by diff.
   */
  diff(actual, expected, changes) {
    if (Array.isArray(actual)) {
      changes = actual;
    }
    changes = changes || diff.diffLines(actual, expected);
    let message = changes.map(string => {
      if (string.added) {
        return this._colorLines('Added', string.value);
      }

      if (string.removed) {
        return this._colorLines('Removed', string.value);
      }

      return string.value;
    }).join('');

    // Legend
    message = '\n' +
      this._colorDiffRemoved('removed') +
      ' ' +
      this._colorDiffAdded('added') +
      '\n\n' +
      message +
      '\n';

    this.console.log(message);
    return message;
  }
}

module.exports = TerminalAdapter;
