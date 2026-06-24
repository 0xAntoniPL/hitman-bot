const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const crypto = require('crypto');
const chalk = require('chalk');
const _ = require('lodash');
const GroupedQueue = require('grouped-queue');
const escapeStrRe = require('escape-string-regexp');
const untildify = require('untildify');
const memFs = require('mem-fs');
const FileEditor = require('mem-fs-editor');
const debug = require('debug')('yeoman:environment');
const isScoped = require('is-scoped');
const npmlog = require('npmlog');
const semver = require('semver');
const slash = require('slash');
const {TrackerGroup} = require('are-we-there-yet');
const {pipeline, transform} = require('p-transform');

const ENVIRONMENT_VERSION = require('../package.json').version;
const Store = require('./store');
const composability = require('./composability');
const resolver = require('./resolver');
const TerminalAdapter = require('./adapter');
const YeomanRepository = require('./util/repository');
const Conflicter = require('./util/conflicter');
const {YeomanCommand} = require('./util/command');
const {
  createCommitTransform,
  createConflicterCheckTransform,
  createConflicterStatusTransform,
  createModifiedTransform,
  createYoRcTransform,
  createYoResolveTransform
} = require('./util/transform');

/**
 * Two-step argument splitting function that first splits arguments in quotes,
 * and then splits up the remaining arguments if they are not part of a quote.
 */
function splitArgsFromString(argsString) {
  let result = [];
  if (!argsString) {
    return result;
  }
  const quoteSeparatedArgs = argsString.split(/("[^"]*")/).filter(x => x);
  for (const arg of quoteSeparatedArgs) {
    if (arg.match('\x22')) {
      result.push(arg.replace(/"/g, ''));
    } else {
      result = result.concat(arg.trim().split(' '));
    }
  }
  return result;
}

/**
 * Hint of generator module name
 */
function getGeneratorHint(namespace) {
  if (isScoped(namespace)) {
    const splitName = namespace.split('/');
    return `${splitName[0]}/generator-${splitName[1]}`;
  }
  return `generator-${namespace}`;
}

const mixins = [
  require('./command.js'),
  require('./generator-features.js'),
  require('./namespace'),
  require('./package-manager.js')
];

const Base = mixins.reduce((a, b) => b(a), EventEmitter);

class Environment extends Base {
  static get UNKNOWN_NAMESPACE() {
    return 'unknownnamespace';
  }

  static get UNKNOWN_RESOLVED() {
    return 'unknown';
  }

  static get queues() {
    return [
      'environment:run',
      'initializing',
      'prompting',
      'configuring',
      'default',
      'writing',
      'transform',
      'conflicts',
      'environment:conflicts',
      'install',
      'end'
    ];
  }

  static get lookups() {
    return ['.', 'generators', 'lib/generators', 'dist/generators'];
  }

  /**
   * Make sure the Environment present expected methods if an old version is
   * passed to a Generator.
   * @param  {Environment} env
   * @return {Environment} The updated env
   */
  static enforceUpdate(env) {
    if (!env.adapter) {
      env.adapter = new TerminalAdapter();
    }

    if (!env.runLoop) {
      env.runLoop = new GroupedQueue(Environment.queues, false);
    }

    if (!env.sharedFs) {
      env.sharedFs = memFs.create();
    }

    if (!env.fs) {
      env.fs = FileEditor.create(env.sharedFs);
    }

    return env;
  }

  /**
   * Prepare a commander instance for cli support.
   *
   * @param {Class} GeneratorClass - Generator to create Command
   * @return {Command} Return a Command instance
   */
  static prepareCommand(GeneratorClass, command = new YeomanCommand()) {
    command = Base.addEnvironmentOptions(command);
    return Environment.prepareGeneratorCommand(command, GeneratorClass);
  }

  /**
   * Prepare a commander instance for cli support.
   *
   * @param {Command} command - Command to be prepared
   * @param {Class} GeneratorClass - Generator to create Command
   * @return {Command} return command
   */
  static prepareGeneratorCommand(command, GeneratorClass, namespace) {
    const generator = new GeneratorClass([], {help: true, env: {}});
    Base.addGeneratorOptions(command, generator);

    command.action(async function () {
      let rootCommand = this;
      while (rootCommand.parent) {
        rootCommand = rootCommand.parent;
      }
      command.env = Environment.createEnv(rootCommand.opts());

      rootCommand.emit('yeoman:environment', command.env);

      if (namespace) {
        return command.env.run([namespace, ...(this.args || [])], this.opts()).then(() => command.env);
      }
      const generator = command.env.instantiate(GeneratorClass, this.args, this.opts());
      await command.env.queueGenerator(generator);
      return command.env.start().then(() => command.env);
    });
    return command;
  }

  /**
   * Factory method to create an environment instance. Take same parameters as the
   * Environment constructor.
   *
   * @deprecated @param {string[]} [args] - arguments.
   * @param {object} [options] - Environment options.
   * @param {Adapter} [adapter] - Terminal adapter.
   *
   * @return {Environment} a new Environment instance
   */
  static createEnv(args, options, adapter) {
    if (args && !Array.isArray(args)) {
      options = args;
    }
    options = options || {};
    return new Environment(options, adapter);
  }

  /**
   * Factory method to create an environment instance. Take same parameters as the
   * Environment constructor.
   *
   * @param {String} version - Version of the Environment
   * @param {...any} args - Same arguments as {@link Environment}#createEnv.
   * @return {Environment} a new Environment instance
   */
  static async createEnvWithVersion(version, ...args) {
    const repository = new YeomanRepository();
    const installedVersion = repository.verifyInstalledVersion('yeoman-environment', version);
    if (!installedVersion) {
      await repository.installPackage('yeoman-environment', version);
    }
    const VersionedEnvironment = repository.requireModule('yeoman-environment', version);
    return VersionedEnvironment.createEnv(...args);
  }

  /**
   * Convert a generators namespace to its name
   *
   * @param  {String} namespace
   * @return {String}
   */
  static namespaceToName(namespace) {
    return namespace.split(':')[0];
  }

  /**
   * Lookup for a specific generator.
   *
   * @param  {String} namespace
   * @param  {Object} [options]
   * @param {Boolean} [options.localOnly=false] - Set true to skip lookups of
   *                                                     globally-installed generators.
   * @param {Boolean} [options.packagePath=false] - Set true to return the package
   *                                                       path instead of generators file.
   * @param {Boolean} [options.singleResult=true] - Set false to return multiple values.
   * @return {String} generator
   */
  static lookupGenerator(namespace, options) {
    options = typeof options === 'boolean' ? {singleResult: true, localOnly: options} : {singleResult: !(options && options.multiple), ...options};

    options.filePatterns = options.filePatterns || Environment.lookups.map(prefix => path.join(prefix, '*/index.{js,ts}'));

    const name = Environment.namespaceToName(namespace);
    options.packagePatterns = options.packagePatterns || getGeneratorHint(name);
    const envProt = Environment.prototype;

    options.npmPaths = options.npmPaths || envProt.getNpmPaths(options.localOnly).reverse();
    options.packagePatterns = options.packagePatterns || 'generator-*';
    options.packagePaths = options.packagePaths || resolver.packageLookup.findPackagesIn(options.npmPaths, options.packagePatterns);

    let paths = options.singleResult ? undefined : [];
    resolver.packageLookup.sync(options, module => {
      const filename = module.filePath;
      const fileNS = envProt.namespace(filename, Environment.lookups);
      if (namespace === fileNS || (options.packagePath && namespace === Environment.namespaceToName(fileNS))) {
        // Version 2.6.0 returned pattern instead of modulePath for options.packagePath
        const returnPath = options.packagePath ? module.packagePath : (options.generatorPath ? path.posix.join(filename, '../../') : filename);
        if (options.singleResult) {
          paths = returnPath;
          return true;
        }
        paths.push(returnPath);
      }
      return false;
    });

    return paths;
  }

  /**
   * @classdesc `Environment` object is responsible of handling the lifecyle and bootstrap
   * of generators in a specific environment (your app).
   *
   * It provides a high-level API to create and run generators, as well as further
   * tuning where and how a generator is resolved.
   *
   * An environment is created using a list of `arguments` and a Hash of
   * `options`. Usually, this is the list of arguments you get back from your CLI
   * options parser.
   *
   * An optional adapter can be passed to provide interaction in non-CLI environment
   * (e.g. IDE plugins), otherwise a `TerminalAdapter` is instantiated by default
   *
   * @constructor
   * @mixes env/resolver
   * @mixes env/composability
   * @param {String|Array}          args
   * @param {Object}                opts
   * @param {Boolean} [opts.experimental]
   * @param {Object} [opts.sharedOptions]
   * @param {Console}      [opts.console]
   * @param {Stream}         [opts.stdin]
   * @param {Stream}        [opts.stdout]
   * @param {Stream}        [opts.stderr]
   * @param {TerminalAdapter} [adapter] - A TerminalAdapter instance or another object
   *                                     implementing this adapter interface. This is how
   *                                     you'd interface Yeoman with a GUI or an editor.
   */
  constructor(options, adapter) {
    super();

    this.setMaxListeners(100);

    this.options = options || {};
    this.adapter = adapter || new TerminalAdapter({console: this.options.console, stdin: this.options.stdin, stderr: this.options.stderr});
    this.cwd = this.options.cwd || process.cwd();
    this.cwd = path.resolve(this.cwd);
    this.logCwd = this.options.logCwd || this.cwd;
    this.store = new Store();
    this.command = this.options.command;

    this.runLoop = new GroupedQueue(Environment.queues, false);
    this.sharedFs = memFs.create();

    // Each composed generator might set listeners on these shared resources. Let's make sure
    // Node won't complain about event listeners leaks.
    this.runLoop.setMaxListeners(0);
    this.sharedFs.setMaxListeners(0);

    // Create a shared mem-fs-editor instance.
    this.fs = FileEditor.create(this.sharedFs);

    this.lookups = Environment.lookups;
    this.aliases = [];

    this.alias(/^([^:]+)$/, '$1:app');

    // Used sharedOptions from options if exists.
    this.sharedOptions = this.options.sharedOptions || {};
    // Remove Unecessary sharedOptions from options
    delete this.options.sharedOptions;

    // Create a default sharedData.
    this.sharedOptions.sharedData = this.sharedOptions.sharedData || {};

    // Pass forwardErrorToEnvironment to generators.
    this.sharedOptions.forwardErrorToEnvironment = false;

    this.repository = new YeomanRepository(this.options.yeomanRepository);

    if (!this.options.experimental) {
      for (const value of process.argv) {
        if (value === '--experimental') {
          this.options.experimental = true;
          debug('Set environment as experimental');
        }
      }
    }

    this.loadSharedOptions(this.options);
    if (this.sharedOptions.skipLocalCache === undefined) {
      this.sharedOptions.skipLocalCache = true;
    }

    // Store the generators by paths and uniqueBy feature.
    this._generatorsForPath = {};
    this._generators = {};

    // Store the YeomanCompose by paths and uniqueBy feature.
    this._composeStore = {};

    this.enableConflicterIgnore = semver.satisfies(this.getVersion('mem-fs-editor'), '>= 9.2.0');
  }

  /**
   * Load options passed to the Generator that should be used by the Environment.
   *
   * @param {Object} options
   */
  loadEnvironmentOptions(options) {
    const environmentOptions = _.pick(options, [
      'skipInstall',
      'nodePackageManager'
    ]);
    _.defaults(this.options, environmentOptions);
    return environmentOptions;
  }

  /**
   * Load options passed to the Environment that should be forwarded to the Generator.
   *
   * @param {Object} options
   */
  loadSharedOptions(options) {
    const optionsToShare = _.pick(options, [
      'skipInstall',
      'forceInstall',
      'skipCache',
      'skipLocalCache',
      'skipParseOptions',
      'localConfigOnly',
      'askAnswered'
    ]);
    Object.assign(this.sharedOptions, optionsToShare);
    return optionsToShare;
  }

  /**
   * @deprecated
   * Error handler taking `err` instance of Error.
   *
   * The `error` event is emitted with the error object, if no `error` listener
   * is registered, then we throw the error.
   *
   * @param  {Object} err
   * @return {Error}  err
   */
  error(error) {
    throw error instanceof Error ? error : new Error(error);
  }

  /**
   * Outputs the general help and usage. Optionally, if generators have been
   * registered, the list of available generators is also displayed.
   *
   * @param {String} name
   */
  help(name = 'init') {
    const out = [
      'Usage: :binary: GENERATOR [args] [options]',
      '',
      'General options:',
      '  --help       # Print generator\'s options and usage',
      '  -f, --force  # Overwrite files that already exist',
      '',
      'Please choose a generator below.',
      ''
    ];

    const ns = this.namespaces();

    const groups = {};
    for (const namespace of ns) {
      const base = namespace.split(':')[0];

      if (!groups[base]) {
        groups[base] = [];
      }

      groups[base].push(namespace);
    }

    for (const key of Object.keys(groups).sort()) {
      const group = groups[key];

      if (group.length > 0) {
        out.push('', key.charAt(0).toUpperCase() + key.slice(1));
      }

      for (const ns of groups[key]) {
        out.push(`  ${ns}`);
      }
    }

    return out.join('\n').replace(/:binary:/g, name);
  }

  /**
   * Registers a specific `generator` to this environment. This generator is stored under
   * provided namespace, or a default namespace format if none if available.
   *
   * @param  {String} name      - Filepath to the a generator or a npm package name
   * @param  {String} namespace - Namespace under which register the generator (optional)
   * @param  {String} packagePath - PackagePath to the generator npm package (optional)
   * @return {Object} environment - This environment
   */
  register(name, namespace, packagePath) {
    if (typeof name !== 'string') {
      throw new TypeError('You must provide a generator name to register.');
    }

    const modulePath = this.resolveModulePath(name);
    namespace = namespace || this.namespace(modulePath);

    if (!namespace) {
      throw new Error('Unable to determine namespace.');
    }

    // Generator is already registered and matches the current namespace.
    if (this.store._meta[namespace] && this.store._meta[namespace].resolved === modulePath) {
      return this;
    }

    this.store.add(namespace, modulePath, modulePath, packagePath);
    const packageNS = Environment.namespaceToName(namespace);
    this.store.addPackageNS(packageNS);
    if (packagePath) {
      this.store.addPackage(packageNS, packagePath);
    }

    debug('Registered %s (%s) on package %s (%s)', namespace, modulePath, packageNS, packagePath);
    return this;
  }

  /**
   * Register a stubbed generator to this environment. This method allow to register raw
   * functions under the provided namespace. `registerStub` will enforce the function passed
   * to extend the Base generator automatically.
   *
   * @param  {Function} Generator  - A Generator constructor or a simple function
   * @param  {String}   namespace  - Namespace under which register the generator
   * @param  {String}   [resolved] - The file path to the generator
   * @param  {String} [packagePath] - The generator's package path
   * @return {this}
   */
  registerStub(Generator, namespace, resolved = Environment.UNKNOWN_RESOLVED, packagePath = undefined) {
    if (typeof Generator !== 'function' && typeof Generator.createGenerator !== 'function') {
      throw new TypeError('You must provide a stub function to register.');
    }

    if (typeof namespace !== 'string') {
      throw new TypeError('You must provide a namespace to register.');
    }

    this.store.add(namespace, Generator, resolved, packagePath);
    const packageNS = Environment.namespaceToName(namespace);
    this.store.addPackageNS(packageNS);
    if (packagePath) {
      this.store.addPackage(packageNS, packagePath);
    }

    debug('Registered %s (%s) on package (%s)', namespace, resolved, packagePath);
    return this;
  }

  /**
   * Returns the list of registered namespace.
   * @return {Array}
   */
  namespaces() {
    return this.store.namespaces();
  }

  /**
   * Returns the environment or dependency version.
   * @param  {String} packageName - Module to get version.
   * @return {String} Environment version.
   */
  getVersion(packageName) {
    if (packageName && packageName !== 'yeoman-environment') {
      try {
        return require(`${packageName}/package.json`).version;
      } catch {
        return undefined;
      }
    }
    return ENVIRONMENT_VERSION;
  }

  /**
   * Returns stored generators meta
   * @return {Object}
   */
  getGeneratorsMeta() {
    return this.store.getGeneratorsMeta();
  }

  /**
   * Get registered generators names
   *
   * @return {Array}
   */
  getGeneratorNames() {
    return _.uniq(Object.keys(this.getGeneratorsMeta()).map(namespace => Environment.namespaceToName(namespace)));
  }

  /**
   * Verify if a package namespace already have been registered.
   *
   * @param  {String} [packageNS] - namespace of the package.
   * @return {boolean} - true if any generator of the package has been registered
   */
  isPackageRegistered(packageNS) {
    return this.getRegisteredPackages().includes(packageNS);
  }

  /**
   * Get all registered packages namespaces.
   *
   * @return {Array} - array of namespaces.
   */
  getRegisteredPackages() {
    return this.store.getPackagesNS();
  }

  /**
   * Get last added path for a namespace
   *
   * @param  {String} - namespace
   * @return {String} - path of the package
   */
  getPackagePath(namespace) {
    if (namespace.includes(':')) {
      const generator = this.get(namespace) || {};
      if (generator.then) {
        return generator.then(generator => generator.packagePath);
      }
      return generator.packagePath;
    }
    const packagePaths = this.getPackagePaths(namespace) || [];
    return packagePaths[0];
  }

  /**
   * Get paths for a namespace
   *
   * @param  {String} - namespace
   * @return  {Array} - array of paths.
   */
  getPackagePaths(namespace) {
    return this.store.getPackagesPaths()[namespace] ||
      this.store.getPackagesPaths()[Environment.namespaceToName(this.alias(namespace))];
  }

  /**
   * Get a single generator from the registered list of generators. The lookup is
   * based on generator's namespace, "walking up" the namespaces until a matching
   * is found. Eg. if an `angular:common` namespace is registered, and we try to
   * get `angular:common:all` then we get `angular:common` as a fallback (unless
   * an `angular:common:all` generator is registered).
   *
   * @param  {String} namespaceOrPath
   * @return {Generator|null} - the generator registered under the namespace
   */
  get(namespaceOrPath) {
    // Stop the recursive search if nothing is left
    if (!namespaceOrPath) {
      return;
    }

    const parsed = this.toNamespace ? this.toNamespace(namespaceOrPath) : undefined;
    if (parsed && this.getByNamespace) {
      return this.getByNamespace(parsed);
    }

    let namespace = namespaceOrPath;

    // Legacy yeoman-generator `#hookFor()` function is passing the generator path as part
    // of the namespace. If we find a path delimiter in the namespace, then ignore the
    // last part of the namespace.
    const parts = namespaceOrPath.split(':');
    const maybePath = _.last(parts);
    if (parts.length > 1 && /[/\\]/.test(maybePath)) {
      parts.pop();

      // We also want to remove the drive letter on windows
      if (maybePath.includes('\\') && _.last(parts).length === 1) {
        parts.pop();
      }

      namespace = parts.join(':');
    }

    const maybeGenerator = this.store.get(namespace) ||
      this.store.get(this.alias(namespace)) ||
      // Namespace is empty if namespaceOrPath contains a win32 absolute path of the form 'C:\path\to\generator'.
      // for this reason we pass namespaceOrPath to the getByPath function.
      this.getByPath(namespaceOrPath);
    if (maybeGenerator && maybeGenerator.then) {
      return maybeGenerator.then(Generator => this._findGeneratorClass(Generator));
    }
    return this._findGeneratorClass(maybeGenerator);
  }

  /**
   * Get a generator by path instead of namespace.
   * @param  {String} path
   * @return {Generator|null} - the generator found at the location
   */
  getByPath(path) {
    if (fs.existsSync(path)) {
      const namespace = this.namespace(path);
      this.register(path, namespace);

      return this.get(namespace);
    }
  }

  /**
   * Find generator's class constructor.
   * @private
   * @param  {Object} Generator - Object containing the class.
   * @return {Function} Generator's constructor.
   */
  _findGeneratorClass(Generator) {
    if (!Generator) {
      return Generator;
    }
    let meta = Generator;
    if (Array.isArray(Generator)) {
      meta = Generator[1];
      Generator = Generator[0];
    }
    if (typeof Generator.default === 'function') {
      Generator.default.resolved = meta.resolved;
      Generator.default.namespace = meta.namespace;
      return Generator.default;
    }
    if (typeof Generator.createGenerator === 'function') {
      const maybeGenerator = Generator.createGenerator(this);
      if (maybeGenerator.then) {
        return maybeGenerator.then(Gen => {
          Gen.resolved = meta.resolved;
          Gen.namespace = meta.namespace;
          return Gen;
        });
      }
      maybeGenerator.resolved = meta.resolved;
      maybeGenerator.namespace = meta.namespace;
      return maybeGenerator;
    }
    if (typeof Generator !== 'function') {
      throw new TypeError('The generator doesn\'t provides a constructor.');
    }
    return Generator;
  }

  /**
   * Create is the Generator factory. It takes a namespace to lookup and optional
   * hash of options, that lets you define `arguments` and `options` to
   * instantiate the generator with.
   *
   * An error is raised on invalid namespace.
   *
   * @param {String} namespaceOrPath
   * @param {Array} [args]
   * @param {Object} [options]
   * @return {Generator} The instantiated generator
   */
  create(namespaceOrPath, args, options) {
    if (!Array.isArray(args) && typeof args === 'object') {
      options = args.options || args;
      args = args.arguments || args.args || [];
    } else {
      args = Array.isArray(args) ? args : splitArgsFromString(args);
      options = options || {};
    }

    const namespace = this.toNamespace ? this.toNamespace(namespaceOrPath) : undefined;

    let maybeGenerator;
    if (namespace && this.getByNamespace) {
      maybeGenerator = this.getByNamespace(namespace);
      if (!maybeGenerator) {
        this.lookupLocalNamespaces(namespace);
        maybeGenerator = this.getByNamespace(namespace);
      }
    }

    const checkGenerator = Generator => {
      if (namespace && Generator && Generator.namespace && Generator.namespace !== Environment.UNKNOWN_NAMESPACE) {
      // Update namespace object in case of aliased namespace.
        namespace.namespace = Generator.namespace;
      }

      if (typeof Generator !== 'function') {
        const generatorHint = namespace ? namespace.generatorHint : getGeneratorHint(namespaceOrPath);

        throw new Error(
          chalk.red('You don\'t seem to have a generator with the name “' + namespaceOrPath + '” installed.') + '\n' +
          'But help is on the way:\n\n' +
          'You can see available generators via ' +
          chalk.yellow('npm search yeoman-generator') + ' or via ' + chalk.yellow('http://yeoman.io/generators/') + '. \n' +
          'Install them with ' + chalk.yellow(`npm install ${generatorHint}`) + '.\n\n' +
          'To see all your installed generators run ' + chalk.yellow('yo --generators') + '. ' +
          'Adding the ' + chalk.yellow('--help') + ' option will also show subgenerators. \n\n' +
          'If ' + chalk.yellow('yo') + ' cannot find the generator, run ' + chalk.yellow('yo doctor') + ' to troubleshoot your system.'
        );
      }
      return Generator;
    };

    maybeGenerator = maybeGenerator || this.get(namespaceOrPath);
    if (maybeGenerator && maybeGenerator.then) {
      return Promise.resolve(maybeGenerator)
        .then(Generator => checkGenerator(Generator))
        .then(Generator => this.instantiate(Generator, args, options));
    }

    return this.instantiate(checkGenerator(maybeGenerator), args, options);
  }

  /**
   * Instantiate a Generator with metadatas
   *
   * @param {Class<Generator>} generator   Generator class
   * @param {Array}            [args]      Arguments to pass the instance
   * @param {Object}           [options]   Options to pass the instance
   * @return {Generator}       The instantiated generator
   */
  instantiate(Generator, args, options) {
    if (!Array.isArray(args) && typeof args === 'object') {
      options = args.options || args;
      args = args.arguments || args.args || [];
    } else {
      args = Array.isArray(args) ? args : splitArgsFromString(args);
      options = options || {};
    }

    const {namespace} = Generator;

    const environmentOptions = {
      env: this,
      resolved: Generator.resolved || Environment.UNKNOWN_RESOLVED,
      namespace
    };

    const generator = new Generator(args, {
      ...this.sharedOptions,
      ...options,
      ...environmentOptions
    });

    generator._environmentOptions = {
      ...this.options,
      ...this.sharedOptions,
      ...environmentOptions
    };

    if (!options.help && generator._postConstruct) {
      return Promise.resolve(generator._postConstruct()).then(() => generator);
    }

    return generator;
  }

  /**
   * Compose with the generator.
   *
   * @param {String} namespaceOrPath
   * @param {Array} [args]
   * @param {Object} [options]
   * @param {Boolean} [schedule]
   * @return {Generator} The instantiated generator or the singleton instance.
   */
  composeWith(generator, args, options, schedule = true) {
    if (typeof args === 'boolean') {
      schedule = args;
      args = undefined;
      options = undefined;
    } else if (typeof options === 'boolean') {
      schedule = options;
      options = undefined;
    }
    const generatorInstance = this.create(generator, args, options);
    if (generatorInstance.then) {
      return generatorInstance.then(generatorInstance => this.queueGenerator(generatorInstance, schedule));
    }
    return this.queueGenerator(generatorInstance, schedule);
  }

  /**
   * @private
   */
  getGeneratorsForPath(generatorRoot = this.cwd) {
    this._generatorsForPath[generatorRoot] = this._generatorsForPath[generatorRoot] || {};
    return this._generatorsForPath[generatorRoot];
  }

  /**
   * @private
   */
  getGenerator(uniqueBy, generatorRoot = this.cwd) {
    if (this._generators[uniqueBy]) {
      return this._generators[uniqueBy];
    }
    return this.getGeneratorsForPath(generatorRoot)[uniqueBy];
  }

  /**
   * @private
   */
  getAllGenerators() {
    return Object.fromEntries([
      ...Object.entries(this._generators),
      ...Object.entries(this._generatorsForPath).flatMap(([root, generatorStore]) => Object.entries(generatorStore).map(([namespace, generator]) => ([`${root}#${namespace}`, generator])))
    ]);
  }

  /**
   * @private
   */
  setGenerator(uniqueBy, generator) {
    if (generator.features && generator.features.uniqueGlobally) {
      this._generators[uniqueBy] = generator;
    } else {
      this.getGeneratorsForPath(generator.destinationRoot())[uniqueBy] = generator;
    }
    return generator;
  }

  /**
   * Queue generator run (queue itself tasks).
   *
   * @param {Generator} generator Generator instance
   * @param {boolean} [schedule=false] Whether to schedule the generator run.
   * @return {Generator} The generator or singleton instance.
   */
  queueGenerator(generator, schedule = false) {
    const generatorFeatures = generator.getFeatures ? generator.getFeatures() : {};
    let uniqueBy;
    let rootUniqueBy;
    let namespaceToEmit;
    if (generatorFeatures) {
      uniqueBy = generatorFeatures.uniqueBy;
      namespaceToEmit = uniqueBy;
      if (!generatorFeatures.uniqueGlobally) {
        rootUniqueBy = generator.destinationRoot();
      }
    }

    if (!uniqueBy) {
      const {namespace} = generator.options;
      const instanceId = crypto.randomBytes(20).toString('hex');
      let namespaceDefinition = this.toNamespace(namespace);
      if (namespaceDefinition) {
        namespaceDefinition = namespaceDefinition.with({instanceId});
        uniqueBy = namespaceDefinition.id;
        namespaceToEmit = namespaceDefinition.namespace;
      } else {
        uniqueBy = `${namespace}#${instanceId}`;
        namespaceToEmit = namespace;
      }
    }

    const existing = this.getGenerator(uniqueBy, rootUniqueBy);
    if (existing) {
      debug(`Using existing generator for namespace ${uniqueBy}`);
      return existing;
    }

    this.setGenerator(uniqueBy, generator);
    this.emit('compose', namespaceToEmit, generator);
    this.emit(`compose:${namespaceToEmit}`, generator);

    const runGenerator = () => {
      if (generator.queueTasks) {
        // Generator > 5
        this.once('run', () => generator.emit('run'));
        this.once('end', () => generator.emit('end'));
        return generator.queueTasks();
      }
      if (!generator.options.forwardErrorToEnvironment) {
        generator.on('error', error => this.emit('error', error));
      }
      generator.promise = generator.run();
    };

    if (schedule) {
      this.runLoop.add(
        'environment:run',
        async (done, stop) => {
          try {
            await runGenerator();
            done();
          } catch (error) {
            stop(error);
          }
        }
      );
    } else {
      const maybePromise = runGenerator();
      if (maybePromise && maybePromise.then) {
        return maybePromise.then(() => generator);
      }
    }
    return generator;
  }

  /**
   * Tries to locate and run a specific generator. The lookup is done depending
   * on the provided arguments, options and the list of registered generators.
   *
   * When the environment was unable to resolve a generator, an error is raised.
   *
   * @param {String|Array} args
   * @param {Object}       [options]
   */
  async run(args, options, done) {
    if (done || typeof options === 'function' || typeof args === 'function') {
      throw new Error('Callback support have been removed.');
    }

    args = Array.isArray(args) ? args : splitArgsFromString(args);
    options = {...options};

    const name = args.shift();
    if (!name) {
      throw new Error('Must provide at least one argument, the generator namespace to invoke.');
    }

    this.loadEnvironmentOptions(options);

    const instantiateAndRun = async () => {
      const generator = await this.create(name, args, {
        ...options,
        initialGenerator: true
      });
      if (options.help) {
        console.log(generator.help());
        return undefined;
      }

      return this.runGenerator(generator);
    };

    if (this.options.experimental && !this.get(name)) {
      debug(`Generator ${name} was not found, trying to install it`);
      return this.prepareEnvironment(name).then(() => instantiateAndRun(), () => instantiateAndRun());
    }

    return instantiateAndRun();
  }

  /**
   * Start Environment queue
   * @param {Object} options - Conflicter options.
   */
  start(options) {
    return new Promise((resolve, reject) => {
      if (this.conflicter === undefined) {
        const conflicterOptions = _.pick(
          _.defaults({}, this.options, options),
          ['force', 'bail', 'ignoreWhitespace', 'dryRun', 'skipYoResolve', 'logCwd']
        );
        conflicterOptions.cwd = conflicterOptions.logCwd;

        this.conflicter = new Conflicter(this.adapter, conflicterOptions);

        this.queueConflicter();
        this.queuePackageManagerInstall();
      }

      /*
       * Listen to errors and reject if emmited.
       * Some cases the generator relied at the behavior that the running process
       * would be killed if an error is thrown to environment.
       * Make sure to not rely on that behavior.
       */
      this.on('error', error => {
        reject(error);
      });

      /*
       * For backward compatibility
       */
      this.on('generator:reject', error => {
        reject(error);
      });

      this.on('generator:resolve', error => {
        resolve(error);
      });

      this.runLoop.on('error', error => {
        this.emit('error', error);
      });

      this.runLoop.on('paused', () => {
        this.emit('paused');
      });

      this.once('end', () => {
        resolve();
      });

      /* If runLoop has ended, the environment has ended too. */
      this.runLoop.once('end', () => {
        this.emit('end');
      });

      this.emit('run');
      this.runLoop.start();
    });
  }

  /**
   * Convenience method to run the generator with callbackWrapper.
   * See https://github.com/yeoman/environment/pull/101
   *
   * @param {Object}       generator
   */
  async runGenerator(generator) {
    try {
      generator = await generator;
      generator = await this.queueGenerator(generator);
    } catch (error) {
      return Promise.reject(error);
    }

    this.compatibilityMode = generator.queueTasks ? false : 'v4';
    this._rootGenerator = this._rootGenerator || generator;

    return this.start(generator.options);
  }

  /**
   * Get the first generator that was queued to run in this environment.
   *
   * @return {Generator} generator queued to run in this environment.
   */
  rootGenerator() {
    return this._rootGenerator;
  }

  /**
   * Given a String `filepath`, tries to figure out the relative namespace.
   *
   * ### Examples:
   *
   *     this.namespace('backbone/all/index.js');
   *     // => backbone:all
   *
   *     this.namespace('generator-backbone/model');
   *     // => backbone:model
   *
   *     this.namespace('backbone.js');
   *     // => backbone
   *
   *     this.namespace('generator-mocha/backbone/model/index.js');
   *     // => mocha:backbone:model
   *
   * @param {String} filepath
   * @param {Array} lookups paths
   */
  namespace(filepath, lookups = this.lookups) {
    if (!filepath) {
      throw new Error('Missing namespace');
    }

    // Normalize path
    let ns = slash(filepath);

    // Ignore path before latest node_modules
    const REPOSITORY_PATH = '/node_modules/';
    if (ns.includes(REPOSITORY_PATH)) {
      ns = ns.slice(ns.lastIndexOf(REPOSITORY_PATH) + REPOSITORY_PATH.length, ns.length);
    }

    // Cleanup extension and normalize path for differents OS
    const parsed = path.parse(ns);
    ns = parsed.dir ? `${parsed.dir}/${parsed.name}` : parsed.name;

    // Sort lookups by length so biggest are removed first
    const nsLookups = _([...lookups, '..']).map(found => slash(found)).sortBy('length').value().reverse();

    // If `ns` contains a lookup dir in its path, remove it.
    for (let lookup of nsLookups) {
      // Only match full directory (begin with leading slash or start of input, end with trailing slash)
      lookup = new RegExp(`(?:/|^)${escapeStrRe(lookup)}(?=/)`, 'g');
      ns = ns.replace(lookup, '');
    }

    const folders = ns.split('/');
    const scope = _.findLast(folders, folder => folder.indexOf('@') === 0);

    // Cleanup `ns` from unwanted parts and then normalize slashes to `:`
    ns = ns
      .replace(/\/\//g, '') // Remove double `/`
      .replace(/(.*generator-)/, '') // Remove before `generator-`
      .replace(/\/(index|main)$/, '') // Remove `/index` or `/main`
      .replace(/^\//, '') // Remove leading `/`
      .replace(/\/+/g, ':'); // Replace slashes by `:`

    if (scope) {
      ns = `${scope}/${ns}`;
    }

    debug('Resolve namespaces for %s: %s', filepath, ns);

    return ns;
  }

  /**
   * Resolve a module path
   * @param  {String} moduleId - Filepath or module name
   * @return {String}          - The resolved path leading to the module
   */
  resolveModulePath(moduleId) {
    if (moduleId[0] === '.') {
      moduleId = path.resolve(moduleId);
    }

    moduleId = untildify(moduleId);
    moduleId = path.normalize(moduleId);

    if (path.extname(moduleId) === '') {
      moduleId += path.sep;
    }

    let resolved;
    // Win32: moduleId is resolving as moduleId.js or moduleId.json instead of moduleId/index.js, workaround it.
    if (process.platform === 'win32' && path.extname(moduleId) === '') {
      try {
        resolved = require.resolve(path.join(moduleId, 'index'));
      } catch {}
    }

    return resolved || require.resolve(moduleId);
  }

  /**
   * Apply transform streams to file in MemFs.
   * @param {Transform[]} transformStreams - transform streams to be applied.
   * @param {Stream} [stream] - files stream, defaults to this.sharedFs.stream().
   * @return {Promise}
   */
  applyTransforms(transformStreams, options = {}) {
    const {
      stream = this.sharedFs.stream(),
      name = 'Tranforming'
    } = options;

    let {log = true} = options;

    if (log) {
      npmlog.tracker = new TrackerGroup();
      npmlog.enableProgress();
      log = npmlog.newItem(name);
    }

    if (!Array.isArray(transformStreams)) {
      transformStreams = [transformStreams];
    }
    return pipeline(
      stream,
      createModifiedTransform(),
      ...transformStreams,
      transform(file => {
        if (log) {
          log.completeWork(10);
          npmlog.info('Completed', path.relative(this.logCwd, file.path));
        }
      }, 'environment:log')
    ).then(() => {
      if (log) {
        log.finish();
        npmlog.disableProgress();
      }
    });
  }

  /**
   * Commits the MemFs to the disc.
   * @param {Stream} [stream] - files stream, defaults to this.sharedFs.stream().
   * @return {Promise}
   */
  commitSharedFs(stream = this.sharedFs.stream()) {
    return new Promise((resolve, reject) => {
      debug('committing files');

      const conflicterStatus = {};
      if (this.enableConflicterIgnore) {
        conflicterStatus.fileActions = [{
          key: 'i',
          name: 'ignore, do not overwrite and remember (experimental)',
          value: ({relativeFilePath}) => {
            this.fs.append(`${this.cwd}/.yo-resolve`, `${relativeFilePath} skip`, {create: true});
            return 'skip';
          }
        }];
      }

      this.fs.commit([
        createYoResolveTransform(this.conflicter),
        createYoRcTransform(),
        createConflicterCheckTransform(this.conflicter, conflicterStatus),
        createConflicterStatusTransform(),
        // Use custom commit transform due to out of order transform.
        createCommitTransform(this.fs)
      ],
      stream,
      (error, value) => {
        debug('committing finished');
        if (error) {
          reject(error);
          return;
        }
        resolve(value);
      });
    });
  }

  /**
   * Queue environment's commit task.
   */
  queueConflicter() {
    const queueCommit = () => {
      debug('Queueing conflicts task');
      this.runLoop.add('environment:conflicts', (done, stop) => {
        let customCommitTask = this.findGeneratorCustomCommitTask();
        if (customCommitTask !== undefined && customCommitTask) {
          if (typeof customCommitTask !== 'function') {
            done();
            return;
          }
        } else {
          customCommitTask = this.commitSharedFs.bind(this);
        }

        if (this.enableConflicterIgnore) {
          debug('Adding queueCommit event listener');
          this.sharedFs.once('change', queueCommit);
        }
        const result = customCommitTask();
        if (!result || !result.then) {
          done();
          return;
        }
        return result.then(() => {
          if (!this.enableConflicterIgnore) {
            debug('Adding queueCommit event listener');
            this.sharedFs.once('change', queueCommit);
          }
          done();
        }
        , stop);
      }
      , {
        once: 'write memory fs to disk'
      });
    };

    queueCommit();
  }

  /**
   * Queue environment's package manager install task.
   */
  queuePackageManagerInstall() {
    this.runLoop.add(
      'install',
      (done, stop) => this.packageManagerInstallTask().then(done, stop),
      {once: 'package manager install'}
    );
  }
}

Object.assign(Environment.prototype, resolver);
Object.assign(Environment.prototype, composability);
Object.assign(Environment.prototype, require('./package-manager'));
Object.assign(Environment.prototype, require('./spawn-command'));
Object.assign(Environment.prototype, require('./namespace-composability'));

/**
 * Expose the utilities on the module
 * @see {@link env/util}
 */
Environment.util = require('./util/util');

module.exports = Environment;
