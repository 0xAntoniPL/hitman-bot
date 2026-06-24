const fs = require('fs');
const path = require('path');
const {WError} = require('error');
const findUp = require('find-up');
const minimatch = require('minimatch');
const {transform, passthrough, filter} = require('p-transform');
const OOOTransform = require('./out-of-order-transform');

const {Minimatch} = minimatch;

class YoResolveError extends WError {}

/**
 * @deprecated
 *
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Creates a out of order transform.
 *
 * @param {Function} transform - transform function.
 * @param {Object}   options   - additional options passed to transform
 * @return {Stream} a transform stream.
 */
function createFileTransform(
  transform = (file, _enc, cb) => cb(null, file),
  options = {}
) {
  return new OOOTransform({
    ...options,
    transform(...args) {
      return transform.call(this, ...args);
    }
  });
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Detect if the file is modified
 * See https://github.com/SBoudrias/mem-fs-editor/blob/3ff18e26c52dc30d8f371bcc72c1884f2ea706d6/lib/actions/commit.js#L38
 *
 * @param {Object} field - vinyl file
 */
function fileIsModified(file) {
  // New files (don't exists in the disc) that have been deleted won't be committed and is considered unmodified file.
  return (file.state === 'modified' || (file.state === 'deleted' && !file.isNew));
}

/**
 * @deprecated
 *
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Create a for each file stream transform.
 * @param {Function} forEach - Function to execute for each file
 * @param {Object} options - Options
 * @param {boolean} [options.autoForward = true] - Set false to don't add a file to the stream, the function must do it.
 * @param {boolean} [options.executeUnmodified = false] - Set true to execute the forEach function with a not modified file.
 * @param {boolean} [options.forwardUmodified = true] - Set false to don't add a not modified file to the stream.
 * @return {Transform} A Transform https://nodejs.org/api/stream.html#stream_class_stream_transform
 */
function createEachFileTransform(forEach, options = {}) {
  if (typeof forEach !== 'function') {
    options = forEach;
    forEach = () => {};
  }
  const {forwardUmodified = true, executeUnmodified = false, autoForward = true} = options;
  return createFileTransform(function (file, enc, cb) {
    const forward = () => {
      if (autoForward && (forwardUmodified || fileIsModified(file))) {
        this.push(file);
      }
    };
    if (!executeUnmodified && !fileIsModified(file)) {
      forward();
      return;
    }
    return Promise
      .resolve(forEach.call(this, file, enc))
      .then(() => forward())
      .catch(error => cb(error));
  }, options);
}

function parseYoAttributesFile(yoAttributeFileName) {
  let overridesContent;
  try {
    overridesContent = fs.readFileSync(yoAttributeFileName, 'utf-8');
  } catch (error) {
    throw YoResolveError.wrap('Error loading yo attributes file {yoAttributeFileName}', error, {yoAttributeFileName});
  }
  const absoluteDir = path.dirname(yoAttributeFileName);
  return Object.fromEntries(
    overridesContent
      .split(/\r?\n/)
      .map(override => override.trim())
      .map(override => override.split('#')[0].trim())
      .filter(override => override)
      .map(override => override.split(/[\s+=]/))
      .map(([pattern, status = 'skip']) => [path.join(absoluteDir, pattern), status])
  );
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 */
function createConflicterCheckTransform(conflicter, conflicterStatus) {
  return passthrough(file => conflicter.checkForCollision(file, conflicterStatus), 'environment:conflicter-check');
}

/**
 * @private
 */
function getConflicterStatusForFile(conflicter, filePath, yoAttributeFileName = '.yo-resolve') {
  const fileDir = path.dirname(filePath);
  conflicter.yoResolveByFile = conflicter.yoResolveByFile || {};
  const yoResolveFiles = [];
  let foundYoAttributesFile = findUp.sync([yoAttributeFileName], {cwd: fileDir});
  while (foundYoAttributesFile) {
    yoResolveFiles.push(foundYoAttributesFile);
    foundYoAttributesFile = findUp.sync([yoAttributeFileName], {cwd: path.join(path.dirname(foundYoAttributesFile), '..')});
  }

  let fileStatus;
  if (yoResolveFiles) {
    for (const yoResolveFile of yoResolveFiles) {
      if (conflicter.yoResolveByFile[yoResolveFile] === undefined) {
        conflicter.yoResolveByFile[yoResolveFile] = parseYoAttributesFile(yoResolveFile);
      }
    }
    yoResolveFiles
      .map(yoResolveFile => conflicter.yoResolveByFile[yoResolveFile])
      .map(attributes => attributes)
      .find(yoResolve => Object.entries(yoResolve).some(([pattern, status]) => {
        if (minimatch(filePath, pattern)) {
          fileStatus = status;
          return true;
        }
        return false;
      }));
  }
  return fileStatus;
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Create a yo-resolve transform stream.
 * Suports pre-defined conflicter actions action based on file glob.
 * @param {Conflicter} conflicter - Conflicter instance
 * @param {string} yoResolveFileName - .yo-resolve filename
 * @return {Transform} A Transform https://nodejs.org/api/stream.html#stream_class_stream_transform
 */
function createYoResolveTransform(conflicter, yoResolveFileName) {
  return passthrough(file => {
    file.conflicter = file.conflicter || getConflicterStatusForFile(conflicter, file.path, yoResolveFileName);
  }, 'environment:yo-resolve');
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Create a force yeoman configs transform stream.
 * @return {Transform} A Transform https://nodejs.org/api/stream.html#stream_class_stream_transform
 */
function createYoRcTransform() {
  // Config files should not be processed by the conflicter. Force override.
  return patternSpy(file => {
    file.conflicter = 'force';
  }, '**/{.yo-rc.json,.yo-resolve,.yo-rc-global.json}', 'environment:yo-rc');
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 *
 * Create a transform to apply conflicter status.
 * @param {Log} logger - Log reference. See log.js
 * @return {Transform} A Transform https://nodejs.org/api/stream.html#stream_class_stream_transform
 */
function createConflicterStatusTransform() {
  return transform(file => {
    const action = file.conflicter;

    delete file.conflicter;
    delete file.binary;
    delete file.conflicterChanges;
    delete file.conflicterLog;

    if (!action && file.state) {
      return file;
    }

    if (action === 'skip') {
      delete file.state;
      delete file.isNew;
      return undefined;
    }
    return file;
  }, 'environment:conflicter-status');
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 */
function createModifiedTransform() {
  return filter(file => fileIsModified(file), 'environment:modified');
}

/**
 * Transform api should be avoided by generators without a executable.
 * May break between major yo versions.
 */
function createCommitTransform(memFsEditor) {
  return transform(file => memFsEditor.commitFileAsync(file), 'environment:commit');
}

/**
 * Conditional filter on pattern.
 *
 * @param {String} pattern - Minimatch pattern.
 * @param {Object} options - Minimatch options.
 */
function patternFilter(pattern, options) {
  const minimatch = new Minimatch(pattern, options);
  return filter(file => minimatch.match(file.path));
}

/**
 * Conditional spy on pattern.
 *
 * @param {Function} spy.
 * @param {String} pattern - Minimatch pattern.
 * @param {Object} options - Minimatch options.
 */
function patternSpy(spy, pattern, options) {
  const minimatch = new Minimatch(pattern, options);
  return passthrough(file => (minimatch.match(file.path) ? spy(file) : undefined));
}

module.exports = {
  createFileTransform,
  fileIsModified,
  getConflicterStatusForFile,
  createEachFileTransform,
  createYoResolveTransform,
  createYoRcTransform,
  createModifiedTransform,
  createCommitTransform,
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  patternFilter,
  patternSpy
};
