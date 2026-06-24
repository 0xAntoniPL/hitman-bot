const debug = require('debug')('yeoman:environment:compose');
const EventEmitter = require('events');
const path = require('path');
const semver = require('semver');

/**
 * @mixin
 * @alias env/namespace-composability
 */
const composability = module.exports;

/**
 * Get a generator only by namespace.
 * @private
 * @param  {YeomanNamespace|String} namespace
 * @return {Generator|null} - the generator found at the location
 */
composability.getByNamespace = function (namespace) {
  const ns = this.requireNamespace(namespace).namespace;
  const maybeGenerator = this.store.get(ns) || this.store.get(this.alias(ns));
  if (maybeGenerator && maybeGenerator.then) {
    return maybeGenerator.then(Generator => this._findGeneratorClass(Generator));
  }
  return this._findGeneratorClass(maybeGenerator);
};

/**
 * Lookup and register generators from the custom local repository.
 *
 * @private
 * @param  {YeomanNamespace[]} namespacesToLookup - namespaces to lookup.
 * @return {Object[]} List of generators
 */
composability.lookupLocalNamespaces = function (namespacesToLookup) {
  if (!namespacesToLookup) {
    return [];
  }
  namespacesToLookup = Array.isArray(namespacesToLookup) ? namespacesToLookup : [namespacesToLookup];
  namespacesToLookup = namespacesToLookup.map(ns => this.requireNamespace(ns));
  // Keep only those packages that has a compatible version.
  namespacesToLookup = namespacesToLookup.filter(ns => this.repository.verifyInstalledVersion(ns.generatorHint, ns.semver) !== undefined);
  return this.lookupLocalPackages(namespacesToLookup.map(ns => ns.generatorHint));
};

/**
 * Search for generators or sub generators by namespace.
 *
 * @private
 * @param {boolean|Object} [options] options passed to lookup. Options singleResult,
 *                                   filePatterns and packagePatterns can be overridden
 * @return {Array|Object} List of generators
 */
composability.lookupNamespaces = function (namespaces, options = {}) {
  if (!namespaces) {
    return [];
  }
  namespaces = Array.isArray(namespaces) ? namespaces : [namespaces];
  namespaces = namespaces.map(ns => this.requireNamespace(ns));
  const options_ = namespaces.map(ns => {
    const nsOptions = {packagePatterns: ns.generatorHint};
    if (ns.generator) {
      // Build filePatterns to look specifically for the namespace.
      const genPath = ns.generator.split(':').join('/');
      let filePatterns = [`${genPath}/index.?s`, `${genPath}.?s`];
      const lookups = options.lookups || this.lookups;
      filePatterns = lookups.flatMap(prefix => filePatterns.map(pattern => path.join(prefix, pattern)));
      nsOptions.filePatterns = filePatterns;
      nsOptions.singleResult = true;
    }
    return nsOptions;
  });
  return options_.flatMap(opt => this.lookup({...opt, ...options}));
};

/**
 * Load or install namespaces based on the namespace flag
 *
 * @private
 * @param  {String|Array} - namespaces
 * @return  {boolean} - true if every required namespace was found.
 */
composability.prepareEnvironment = async function (namespaces) {
  debug('prepareEnvironment %o', namespaces);
  namespaces = Array.isArray(namespaces) ? namespaces : [namespaces];
  let missing = namespaces.map(ns => this.requireNamespace(ns));

  const updateMissing = () => {
    // Remove already loaded namespaces
    missing = missing.filter(ns => !this.getByNamespace(ns));
    return missing;
  };

  const assertMissing = missing => {
    if (missing.length > 0) {
      throw new Error(`Error preparing environment for ${missing.map(ns => ns.complete).join(',')}`);
    }
  };

  updateMissing();

  // Install missing
  const toInstall = {};

  const findPackage = async (packageName, packageRange = '*') => {
    try {
      const manifest = await this.resolvePackage(packageName, packageRange);
      toInstall[packageName] = manifest.version;
      return true;
    } catch {
      return false;
    }
  };

  debug('Looking for peer dependecies %o', namespaces);
  const toLookup = [];
  for (const ns of missing) {
    const packageName = ns.generatorHint;
    const packageRange = ns.semver;
    if (packageRange && !semver.validRange(packageRange)) {
      continue;
    }
    if (this.repository.verifyInstalledVersion(packageName, packageRange)) {
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    if (!await findPackage(packageName, packageRange)) {
      toLookup.push(ns);
    }
  }

  debug('Installing %o', toInstall);
  this.installLocalGenerators(toInstall);
  debug('done %o', toInstall);
  if (updateMissing().length === 0) {
    return true;
  }
  // At last, try to lookup if install failed.
  this.lookupLocalNamespaces([...missing, ...toLookup]);

  assertMissing(updateMissing());
  return true;
};

const multipleGeneratorProxyHandler = {
  get(target, prop) {
    // Testing if this is a promise.
    if (prop === 'then') {
      return undefined;
    }
    if (target.some(each => typeof each[prop] !== 'function')) {
      throw new Error(`Some generator doesn't implement ${prop} method.`);
    }
    return (...args) => Promise.all(target.map(each => each[prop](...args)));
  }
};

class YeomanCompose extends EventEmitter {
  constructor(env, options, sharedOptions) {
    super();

    if (typeof options === 'string') {
      options = {destinationRoot: options};
    }
    this.env = env;
    // Destination root for this context.
    this._destinationRoot = options.destinationRoot;

    // Options by namespace.
    this._namespaceOptions = {};
    // Default options to be passed to all generators.
    this._sharedOptions = {...sharedOptions, compose: this};
  }

  /**
   * @private
   * Get config from a namespace.
   *
   * @param {String} namespace - Namespace the get the configuration.
   * @param {Boolean} [generatorConfig] - Set true to get the generator config
   *                                      instead of package config
   * @return {Object} Config
   */
  getConfig(namespace, generatorConfig = false) {
    namespace = this.env.requireNamespace(namespace);
    const yoRc = path.join(this._destinationRoot, '.yo-rc.json');
    let configToReturn = this.env.fs.readJSON(yoRc, {})[namespace.generatorHint] || {};
    if (generatorConfig || namespace.instanceId) {
      configToReturn = configToReturn[namespace.generatorName] || {};
    }
    if (namespace.instanceId) {
      configToReturn = configToReturn[namespace.instanceName] || {};
    }
    return configToReturn;
  }

  /**
   * @private
   * Register the callback to be execute once the generator is instantiated.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Function} callback - Function to be executed once the generator is instantiated.
   * @return {Promise|undefined} Promise the generator api or undefined.
   */
  async once(namespace, callback) {
    namespace = this.env.requireNamespace(namespace);
    if (namespace.instanceId === '*') {
      throw new Error('Wildcard not supported');
    }
    return this.if(namespace, callback, () => {
      super.once(`load_${namespace.id}`, callback);
    });
  }

  /**
   * @private
   * If namespace is loaded then execute the callback else throws an error.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @return {Promise} Promise the generator api.
   */
  async get(namespace) {
    namespace = this.env.requireNamespace(namespace);
    if (namespace.instanceId === '*') {
      throw new Error(`Namespace must not be globby: ${namespace.complete}`);
    }
    if (namespace.complete !== namespace.id) {
      throw new Error(`Namespace ${namespace.complete} should be ${namespace.id}`);
    }
    const generator = this.env.getGenerator(namespace.id, this._destinationRoot);
    if (generator) {
      return generator;
    }
    throw new Error(`Generator ${namespace.complete} isn't loaded`);
  }

  /**
   * @private
   * Loads the generator if it isn't loaded.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Object} generatorOptions - Options to be passed to the generator
   * @return {Promise} Promise the generator api.
   */
  async require(namespace, generatorOptions) {
    return this.get(namespace).catch(() => this._queue(namespace, generatorOptions));
  }

  /**
   * @private
   * If namespace is loaded then execute the callback.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Function} callback - Callback executed when the generator exists
   * @param {Function} [elseCallback] - Callback executed when the generator don't exists
   * @return {Promise|undefined} Promise the generator api.
   */
  async if(namespace, callback, elseCallback = () => {}) {
    return this.get(namespace).then(callback, () => elseCallback());
  }

  /**
   * @private
   * Parse the namespace and route to the corresponding method.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Object} [generatorOptions] - Options to be passed to the generator
   * @param {Object} [callArgs] - Arguments to be passed to the methods.
   * @return {Promise} Promise YeomanWith
   */
  async with(namespace, generatorOptions, ...methodArgs) {
    let namespaces = [namespace].flat();
    debug(`Compose with generator ${namespace} at ${this._destinationRoot}`);
    namespaces = namespaces.map(namespace => this.env.requireNamespace(namespace));
    const brokenNamespace = namespaces.find(namespace => !namespace.generator);
    if (brokenNamespace) {
      throw new Error(`Generator part in namespace is missing: ${brokenNamespace.id}`);
    }
    const namespacesId = namespaces.flatMap(namespace => namespace.instanceId && namespace.instanceId === '*' ? this._getInstanceNames(namespace.namespace).map(instanceId => namespace.with({instanceId}).id) : [namespace.id]);

    const composedGenerators = await Promise.all(namespacesId.map(nsId => this.require(nsId, generatorOptions)));
    const composedProxy = new Proxy(composedGenerators, multipleGeneratorProxyHandler);
    if (namespace.methods && namespace.methods.length > 0) {
      debug(`Running methods ${namespace.methods}`);
      await Promise.all(namespace.methods.map(method => composedProxy[method](...methodArgs)));
    }
    return composedProxy;
  }

  /**
   * @private
   * Get the generator instances from config.
   *
   * @param {String} generatorNamespace - Namespace of the generator
   * @return {String[]} instances names.
   */
  _getInstanceNames(generatorNamespace) {
    const generatorConfig = this.getConfig(generatorNamespace, true);
    return Object.keys(generatorConfig)
      .filter(instanceName => instanceName.startsWith('#'))
      .map(instanceName => instanceName.slice(1));
  }

  /**
   * @private
   * Load the the generator into the YeomanCompose.
   *
   * @param {YeomanNamespace} namespace - Namespace object
   * @param {Object} generatorOptions - Options to be passed to the generator.
   * @return {Object} Generator api
   */
  _load(namespace, generatorOptions) {
    if (!namespace.generator) {
      throw new Error(`Namespace with generator is required: ${namespace.id}`);
    }
    if (namespace.complete !== namespace.id) {
      throw new Error(`Namespace ${namespace.complete} should be ${namespace.id}`);
    }

    debug(`Creating generator ${namespace} at ${this._destinationRoot}`);
    return this._composeWithGenerator(namespace, {...generatorOptions});
  }

  /**
   * @private
   * Instantiate the generator
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Object} generatorOptions - Options to be passed to the generator
   * @return {Generator} the instance of the generator.
   */
  _composeWithGenerator(namespace, generatorOptions) {
    return this.env.composeWith(namespace, {
      arguments: [namespace.instanceId],
      options: {
        destinationRoot: this._destinationRoot,
        ...this._sharedOptions,
        ...this._namespaceOptions[namespace.id],
        ...generatorOptions
      }
    });
  }

  /**
   * @private
   * Instantiate the generator and queue it's methods.
   *
   * @param {String|YeomanNamespace} namespace - Namespace
   * @param {Object} generatorOptions - Options to be passed to the generator.
   * @return {Object} generator composed api.
   */
  _queue(namespace, generatorOptions) {
    debug(`Queueing generator ${namespace} at ${this._destinationRoot}`);
    namespace = this.env.requireNamespace(namespace);
    return this._load(namespace, generatorOptions);
  }
}

composability.createCompose = function (destinationRoot, options = {}) {
  const compose = this._composeStore[destinationRoot];
  if (compose) {
    return compose;
  }
  const rootGenerator = this._rootGenerator;
  this._composeStore[destinationRoot] = new YeomanCompose(this, {destinationRoot, rootGenerator}, options);
  return this._composeStore[destinationRoot];
};
