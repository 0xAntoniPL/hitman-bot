'use strict';
var util = require('util');
var events = require('events');
var SubQueue = require('./subqueue');

module.exports = Queue;

/**
 * Queue constructor
 * @param {String[]} [subQueue] The order of the sub-queues. First one will be runned first.
 */

function Queue( subQueues, runOnAdd = true ) {
  subQueues = subQueues || [];
  if ( !subQueues.includes('default') ) {
    subQueues = subQueues.concat(['default']);
  }
  subQueues = Array.from(new Set(subQueues));

  this.queueNames = subQueues;
  this.__queues__ = {};
  this.runOnAdd = runOnAdd;

  subQueues.forEach(function( name ) {
    this.__queues__[name] = new SubQueue();
  }.bind(this));
}

util.inherits( Queue, events.EventEmitter );

/**
 * Create a new sub-queue.
 * @param {String}   name  The sub-queue to create
 * @param {String}   [before]  Add the new sub-queue before the this sub-queue.
 *                             Otherwise the new sub-queue will be added last. 
 */

Queue.prototype.addSubQueue = function( name, before ) {
  if ( this.__queues__[name] ) {
    // Sub-queue already exists
    return;
  }

  if ( !before ) {
    // Add at last place.
    this.queueNames.push( name );
    this.__queues__[name] = new SubQueue();
    return;
  }

  if ( !this.__queues__[before] || this.queueNames.indexOf(before) === -1 ) {
    throw new Error('sub-queue ' + before + ' not found');
  }

  // Add new sub-queue into the array.
  this.queueNames.splice(this.queueNames.indexOf(before), 0, name);
  this.__queues__[name] = new SubQueue();
};

/**
 * Add a task to a queue.
 * @param {String}   [name='default']  The sub-queue to append the task
 * @param {Function} task
 * @param {Object}   [opt]             Options hash
 * @param {String}   [opt.once]        If a task with the same `once` value is inside the
 *                                     queue, don't add this task.
 * @param {Boolean}  [opt.run]         If `run` is false, don't run the task.
 */

Queue.prototype.add = function( name, task, opt ) {
  if ( typeof name !== 'string' ) {
    opt = task;
    task = name;
    name = 'default';
  }

  this.__queues__[name].push( task, opt );

  // don't run the tasks if `opt.run` is false
  var run = (opt || {}).run;
  run = run === undefined ? this.runOnAdd : run;
  if (!run) return;
  this.start();
};

/**
 * Schedule run() to be executed.
 */

Queue.prototype.start = function() {
  if ( this.running ) return;

  setImmediate(this.run.bind(this));
}

/**
 * Start emptying the queues
 * Tasks are always run from the higher priority queue down to the lowest. After each
 * task complete, the process is re-runned from the first queue until a task is found.
 *
 * Tasks are passed a `callback` method which should be called once the task is over.
 */

Queue.prototype.run = function() {
  if ( this.running ) return;

  this.running = true;
  this._exec(function() {
    this.running = false;
    if (Object.values(this.__queues__).find(queue => queue.__queue__.length > 0) === undefined) {
      this.emit('end');
    } else {
      this.emit('paused');
    }
  }.bind(this),
  function(error) {
    this.running = false;
    if (error) {
      this.emit('error', error);
    } else {
      this.running = false;
      this.emit('paused');
    }
  }.bind(this));
};

/**
 * Pause the queue
 */

Queue.prototype.pause = function() {
  this.running = false;
};

Queue.prototype._exec = function( done, stop ) {
  var pointer = -1;
  var names = this.queueNames;

  var next = function next() {
    if ( !this.running ) return done();

    pointer++;
    if ( pointer >= names.length ) return done();
    this.__queues__[ names[pointer] ].run( next.bind(this), this._exec.bind(this, done, stop), stop );
  }.bind(this);

  next();
};
