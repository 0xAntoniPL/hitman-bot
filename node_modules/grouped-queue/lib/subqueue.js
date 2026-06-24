'use strict';
module.exports = SubQueue;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function SubQueue() {
  this.__queue__ = [];
}

/**
 * Add a task to this queue
 * @param  {Function} task
 */

SubQueue.prototype.push = function( task, opt ) {
  opt = opt || {};

  // Don't register named task if they're already planned
  if ( opt.once && this.__queue__.find(queue => queue.name === opt.once) ) {
    return;
  }

  this.__queue__.push({ task: task, name: opt.once });
};

/**
 * Return the first entry of this queue
 * @return {Function} The first task
 */

SubQueue.prototype.shift = function() {
  return this.__queue__.shift();
};

/**
 * Run task
 * @param  {Function} skip  Callback if no task is available
 * @param  {Function} done  Callback once the task is completed
 */

SubQueue.prototype.run = function( skip, done, stop ) {
  if ( this.__queue__.length === 0 ) return skip();
  setImmediate(() => {
    var result;
    try {
      result = this.shift().task.call(null, done, stop);
    } catch(error) {
      stop(error);
    }
    if (isPromise(result)) {
      result.catch(error => stop(error));
    }
  });
};
