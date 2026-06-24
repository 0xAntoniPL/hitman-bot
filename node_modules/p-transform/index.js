const debug = require('debug');
const { default: PQueue } = require('p-queue');

const { promisify } = require('util');
const { pipeline: _pipeline, Transform } = require('stream');

/**
 * Promisified pipeline
 */
const pipeline = promisify(_pipeline);

class PTransform extends Transform {
  /**
   * PTransform
   *
   * @param {Object} [options] - Options object forwarded to Transform.
   * @param {String} [options.logName] - Custom name for logger.
   * @param {Function} [options.transform] - Transform function.
   * @param {Object} [options.queueOptions] - Options forwarded to PQueue instance.
   */
  constructor(options = {}) {
    // transform is used locally, forward undefined to prevent conflicts.
    super({ objectMode: true, ...options });

    const {
      logPrefix,
      logName = `${logPrefix ? logPrefix + '-' : ''}${Math.random().toString(36).slice(7)}`,
      queueOptions,
    } = options;

    this.logName = logName;
    this.queue = new PQueue(queueOptions);
  }

  /**
   * Set log name.
   *
   * @param {String} name
   * @return {PTransform} this
   */
  name(name) {
    if (this._debug) throw new Error(`debug already initialized with name ${this.logName}`);
    this.logName = name;
    return this;
  }

  get debug() {
    if (this._debug) return this._debug;
    this._debug = debug(`p-transform:${this.logName}`);

    if (this._debug.enabled) {
      this._debug('New PTransform');
      this.on('end', () => this._debug('event:end'));
      this.on('error', (error) => this._debug('event:error', error));
      this.on('finish', () => this._debug('event:finish'));
      this.on('drain', () => this._debug('event:drain'));
      this.on('close', () => this._debug('event:close'));
      this.on('unpipe', () => this._debug('event:unpipe'));
      this.on('pipe', () => this._debug('event:pipe'));
      this.queue.on('add', () =>
        this._debug('++ task: queue size %d, pending %d', this.queue.size, this.queue.pending)
      );
      this.queue.on('next', () =>
        this._debug('-- task: queue size %d, pending %d', this.queue.size, this.queue.pending)
      );
    }
    return this._debug;
  }

  /**
   * Wait for queue idle.
   *
   * @return Promise<void>
   */
  flushQueue() {
    return this.queue.onIdle();
  }

  /**
   * Queued transform operation.
   *
   * @param {Object} chunk
   * @param {String} encoding
   * @return Promise
   */
  async queuedTransform(chunk, encoding) {
    try {
      const maybeChunk = await this._transform(chunk, encoding);
      if (maybeChunk) {
        this.push(maybeChunk);
      }
    } catch (error) {
      this.debug('destroying %s', error);
      this.destroy(error);
    }
  }

  _write(chunk, enc, callback) {
    this.debug('_transform %s', chunk.path);
    this.queue.add(() => this.queuedTransform(chunk, enc));
    setTimeout(() => callback());
  }

  _flush(callback) {
    this.debug('_flush');
    this.flushQueue().then(() => callback());
  }
}

/**
 * Shortcut to create a PTransform with transform and logName.
 *
 * @param {Function} transform
 * @param {String} logName
 */
const transform = (transform, logName) => new PTransform({ transform, logName, logPrefix: 'transform' });

/**
 * Shortcut to create a passthrough PTransform with spy and logName.
 *
 * @param {Function} spy
 * @param {String} logName
 */
const passthrough = (spy = () => {}, logName) =>
  new PTransform({
    transform: async function (chunk, encoding) {
      await spy.call(this, chunk, encoding);
      return chunk;
    },
    logName,
    logPrefix: 'passthrough',
  });

/**
 * Shortcut to create a filter PTransform with filter and logName.
 *
 * @param {Function} filter
 * @param {String} logName
 */
const filter = (filter = () => {}, logName) =>
  new PTransform({
    transform: async function (chunk, encoding) {
      return (await filter.call(this, chunk, encoding)) ? chunk : undefined;
    },
    logName,
    logPrefix: 'filter',
  });

module.exports = {
  PTransform,
  pipeline,
  transform,
  passthrough,
  filter,
};
