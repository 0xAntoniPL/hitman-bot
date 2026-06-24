const {Transform} = require('stream');
const debug = require('debug');
const {default: PQueue} = require('p-queue');

module.exports = class OOOTransform extends Transform {
  /**
   * @private
   * @deprecated
   * Out Of Order Transform
   */
  constructor(options) {
    // Out of order only makes sense for objectMode.
    // transform is used locally, forward undefined to prevent conflicts.
    super({...options, objectMode: true, transform: undefined});

    this.logName = options.logName || Math.random().toString(36).slice(7);
    this.queue = new PQueue();
    this.oooTransform = options.transform;

    this.debug = debug(`ooo-transform:${this.logName}`);
    this.debug('New Transform');

    if (this.debug.enabled) {
      this.on('end', () => this.debug('event:end'));
      this.on('finish', () => this.debug('event:finish'));
      this.on('drain', () => this.debug('event:drain'));
      this.on('close', () => this.debug('event:close'));
      this.on('unpipe', () => this.debug('event:unpipe'));
      this.on('unpipe', () => this.debug('event:unpipe'));
      this.queue.on('add', () => this.debug('++ task: queue size %d, pending %d', this.queue.size, this.queue.pending));
      this.queue.on('next', () => this.debug('-- task: queue size %d, pending %d', this.queue.size, this.queue.pending));
    }
  }

  _final(cb) {
    this.finalized = true;
    this.debug('_flush');
    this.queue.onIdle().then(() => cb());
  }

  _executeTransform(chunk, enc) {
    return Promise.resolve(this.oooTransform(chunk, enc, (error, chunk) => {
      if (error) {
        this.destroy(error);
      } else if (chunk) {
        this.push(chunk);
      }
    })).catch(error => this.destroy(error));
  }

  _transform(chunk, enc, cb) {
    if (this.finalized) {
      cb(new Error('Transform already finalized'));
      return;
    }
    this.debug('_transform %s', chunk.path);
    this.queue.add(() => this._executeTransform(chunk, enc));

    setTimeout(() => cb());
  }

  _destroy(error, cb) {
    this.debug('_destroy %s', error);
    this.queue.onIdle().then(() => cb(error));
  }
};
