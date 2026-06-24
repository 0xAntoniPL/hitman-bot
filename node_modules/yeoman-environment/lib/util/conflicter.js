const fs = require('fs');
const path = require('path');
const jsdiff = require('diff');
const {SError} = require('error');
const GroupedQueue = require('grouped-queue');

const binaryDiff = require('./binary-diff');

class AbortedError extends SError {}

class ConflicterConflictError extends SError {}

/**
 * The Conflicter is a module that can be used to detect conflict between files. Each
 * Generator file system helpers pass files through this module to make sure they don't
 * break a user file.
 *
 * When a potential conflict is detected, we prompt the user and ask them for
 * confirmation before proceeding with the actual write.
 *
 * @constructor
 * @property {Boolean} force - same as the constructor argument
 *
 * @param  {TerminalAdapter} adapter - The generator adapter
 * @param  {Object} options - Conflicter options
 * @param  {Boolean} [options.force=false] - When set to true, we won't check for conflict. (the conflicter become a passthrough)
 * @param  {Boolean} [options.bail=false] - When set to true, we will abort on first conflict. (used for testing reproducibility)
 * @param  {Boolean} [options.ignoreWhitespace=false] - When set to true, whitespace changes should not generate a conflict.
 * @param  {Boolean} [options.regenerate=false] - When set to true, identical files should be written to disc.
 * @param  {Boolean} [options.dryRun=false] - When set to true, no write operation will be executed.
 * @param  {Boolean} [options.cwd=process.cwd()] - Path to be used as reference for relative path.
 * @param  {string} cwd - Set cwd for relative logs.
 */
class Conflicter {
  constructor(adapter, options = {}) {
    this.adapter = adapter;

    this.force = options.force;
    this.bail = options.bail;
    this.ignoreWhitespace = options.ignoreWhitespace;
    this.regenerate = options.regenerate;
    this.dryRun = options.dryRun;
    this.cwd = path.resolve(options.cwd || process.cwd());

    this.diffOptions = options.diffOptions;

    if (this.bail) {
      // Bail conflicts with force option, if bail set force to false.
      this.force = false;
    }

    this.queue = new GroupedQueue(['log', 'conflicts'], false);
  }

  log(file) {
    const logStatus = file.conflicterLog || file.conflicter;
    this._log(logStatus, path.relative(this.cwd, file.path));
  }

  _log(logStatus, ...args) {
    let log;
    if (typeof logStatus === 'function') {
      log = logStatus;
    } else {
      log = this.adapter.log[logStatus];
      if (log) {
        log = log.bind(this.adapter.log);
      }
    }
    if (log) {
      this.queue.add('log', done => {
        log(...args);
        done();
      });
      this.queue.start();
    }
  }

  /**
   * Print the file differences to console
   *
   * @param  {Object}   file File object respecting this interface: { path, contents }
   */
  _printDiff(file, queue = false) {
    if (file.binary === undefined) {
      file.binary = binaryDiff.isBinary(file.path, file.contents);
    }

    let args;
    let logFunction;
    if (file.binary) {
      logFunction = this.adapter.log.writeln.bind(this.adapter.log);
      args = [binaryDiff.diff(file.path, file.contents)];
    } else {
      const existing = fs.readFileSync(file.path);
      logFunction = this.adapter.diff.bind(this.adapter);
      args = [
        existing.toString(),
        (file.contents || '').toString(),
        file.conflicterChanges
      ];
    }
    if (queue) {
      this._log(logFunction, ...args);
    } else {
      logFunction(...args);
    }
  }

  /**
   * Detect conflicts between file contents at `filepath` with the `contents` passed to the
   * function
   *
   * If `filepath` points to a folder, we'll always return true.
   *
   * Based on detect-conflict module
   *
   * @param  {Object}   file File object respecting this interface: { path, contents }
   * @return {Boolean} `true` if there's a conflict, `false` otherwise.
   */
  _detectConflict(file) {
    let {contents} = file;
    const filepath = path.resolve(file.path);

    // If file path point to a directory, then it's not safe to write
    if (fs.statSync(filepath).isDirectory()) {
      return true;
    }

    if (file.binary === undefined) {
      file.binary = binaryDiff.isBinary(file.path, file.contents);
    }

    const actual = fs.readFileSync(path.resolve(filepath));

    if (!(contents instanceof Buffer)) {
      contents = Buffer.from(contents || '', 'utf8');
    }

    if (file.binary) {
      return actual.toString('hex') !== contents.toString('hex');
    }

    let modified;
    let changes;
    if (this.ignoreWhitespace) {
      changes = jsdiff.diffWords(
        actual.toString(),
        contents.toString(),
        this.diffOptions
      );
      modified = changes.some(change => change.value && change.value.trim() && (change.added || change.removed));
    } else {
      changes = jsdiff.diffLines(
        actual.toString(),
        contents.toString(),
        this.diffOptions
      );
      modified = changes.length > 1 || changes[0].added || changes[0].removed;
    }
    file.conflicterChanges = changes;
    return modified;
  }

  /**
   * Check if a file conflict with the current version on the user disk
   *
   * A basic check is done to see if the file exists, if it does:
   *
   *   1. Read its content from  `fs`
   *   2. Compare it with the provided content
   *   3. If identical, mark it as is and skip the check
   *   4. If diverged, prepare and show up the file collision menu
   *
   * @param {Object} file - Vinyl file
   * @param {Object} [conflicterStatus] - Conflicter status
   * @return  {Promise<Vinyl>} Promise the Vinyl file
   */
  checkForCollision(file, conflicterStatus) {
    const rfilepath = path.relative(this.cwd, file.path);
    if (file.conflicter) {
      this._log(file.conflicter, rfilepath);
      return Promise.resolve(file);
    }

    if (!fs.existsSync(file.path)) {
      if (this.bail) {
        this._log('writeln', 'Aborting ...');
        return Promise.reject(ConflicterConflictError.create(`Process aborted by conflict: ${rfilepath}`));
      }

      this._log('create', rfilepath);
      file.conflicter = this.dryRun ? 'skip' : 'create';
      file.conflicterLog = 'create';
      return Promise.resolve(file);
    }
    const isForce = () => this.force || (conflicterStatus && conflicterStatus.force);

    if (isForce()) {
      this._log('force', rfilepath);
      file.conflicter = 'force';
      return Promise.resolve(file);
    }

    if (this._detectConflict(file)) {
      if (this.bail) {
        this.adapter.log.conflict(rfilepath);
        this._printDiff(file);
        this.adapter.log.writeln('Aborting ...');
        const error = ConflicterConflictError.create(`Process aborted by conflict: ${rfilepath}`);
        error.file = file;
        return Promise.reject(error);
      }

      if (this.dryRun) {
        this._log('conflict', rfilepath);
        this._printDiff(file, true);
        file.conflicter = 'skip';
        file.conflicterLog = 'conflict';
        return Promise.resolve(file);
      }

      return new Promise((resolve, reject) => {
        this.queue.add('conflicts', next => {
          if (isForce()) {
            file.conflicter = 'force';
            this.adapter.log.force(rfilepath);
            resolve(file);
            next();
            return;
          }
          this.adapter.log.conflict(rfilepath);
          return this._ask(file, 1, conflicterStatus).then(action => {
            this.adapter.log[action || 'force'](rfilepath);
            file.conflicter = action;
            resolve(file);
            next();
          }).catch(reject);
        });
        this.queue.run();
      });
    }
    this._log('identical', rfilepath);
    if (!this.regenerate) {
      file.conflicter = 'skip';
      file.conflicterLog = 'identical';
      return Promise.resolve(file);
    }

    file.conflicter = 'identical';
    return Promise.resolve(file);
  }

  /**
   * Actual prompting logic
   * @private
   * @param {Object} file vinyl file object
   * @param {Number} counter prompts
   */
  _ask(file, counter, conflicterStatus) {
    if (file.conflicter) {
      return Promise.resolve(file.conflicter);
    }
    const rfilepath = path.relative(this.cwd, file.path);
    const prompt = {
      name: 'action',
      type: 'expand',
      message: `Overwrite ${rfilepath}?`,
      pageSize: 20,
      choices: [
        {
          key: 'y',
          name: 'overwrite',
          value: 'write'
        },
        {
          key: 'n',
          name: 'do not overwrite',
          value: 'skip'
        },
        {
          key: 'a',
          name: 'overwrite this and all others',
          value: 'force'
        },
        {
          key: 'r',
          name: 'reload file (experimental)',
          value: 'reload'
        },
        {
          key: 'x',
          name: 'abort',
          value: 'abort'
        }
      ]
    };

    // Only offer diff option for files
    if (fs.statSync(file.path).isFile()) {
      prompt.choices.push(
        {
          key: 'd',
          name: 'show the differences between the old and the new',
          value: 'diff'
        },
        {
          key: 'e',
          name: 'edit file (experimental)',
          value: 'edit'
        }
      );
      if (conflicterStatus && conflicterStatus.fileActions) {
        prompt.choices.push(...conflicterStatus.fileActions);
      }
    }

    return this.adapter.prompt([prompt]).then(result => {
      if (typeof result.action === 'function') {
        return result.action.call(this, {file, relativeFilePath: rfilepath});
      }

      if (result.action === 'abort') {
        this.adapter.log.writeln('Aborting ...');
        throw AbortedError.create('Process aborted by user');
      }

      if (result.action === 'diff') {
        this._printDiff(file);

        counter++;
        if (counter === 5) {
          throw new Error(`Recursive error ${prompt.message}`);
        }

        return this._ask(file, counter, conflicterStatus);
      }

      if (result.action === 'force') {
        if (conflicterStatus) {
          conflicterStatus.force = true;
        } else {
          this.force = true;
        }
      }

      if (result.action === 'write') {
        return 'force';
      }

      if (result.action === 'reload') {
        if (this._detectConflict(file)) {
          return this._ask(file, counter, conflicterStatus);
        }
        return 'identical';
      }

      if (result.action === 'edit') {
        return this.adapter.prompt([{
          name: 'content',
          type: 'editor',
          default: file.contents.toString(),
          postfix: `.${path.extname(file.path)}`,
          message: `Edit ${rfilepath}`
        }]).then(answers => {
          file.contents = Buffer.from(answers.content || '', 'utf8');
          if (this._detectConflict(file)) {
            return this._ask(file, counter, conflicterStatus);
          }
          return 'skip';
        });
      }

      return result.action;
    });
  }
}

module.exports = Conflicter;
