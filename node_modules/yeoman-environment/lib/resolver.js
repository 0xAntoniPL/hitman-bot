const path = require('path');
const fs = require('fs');
const arrify = require('arrify');
const _ = require('lodash');
const globby = require('globby');
const debug = require('debug')('yeoman:environment');
const slash = require('slash');

const {execaOutput} = require('./util/util');

const win32 = process.platform === 'win32';
const nvm = process.env.NVM_HOME;

const PROJECT_ROOT = path.join(__dirname, '..');

const PACKAGE_NAME_PATTERN = [require(path.join(PROJECT_ROOT, 'package.json')).name];

const packageLookup = {};

/**
 * @mixin
 * @alias env/resolver
 */
const resolver = module.exports;

/**
 * @private
 */
resolver.packageLookup = packageLookup;

/**
 * Search for generators and their sub generators.
 *
 * A generator is a `:lookup/:name/index.js` file placed inside an npm package.
 *
 * Defaults lookups are:
 *   - ./
 *   - generators/
 *   - lib/generators/
 *
 * So this index file `node_modules/generator-dummy/lib/generators/yo/index.js` would be
 * registered as `dummy:yo` generator.
 *
 * @param {boolean|Object} [options]
 * @param {boolean} [options.localOnly = false] - Set true to skip lookups of
 *                                               globally-installed generators.
 * @param {string|Array} [options.packagePaths] - Paths to look for generators.
 * @param {string|Array} [options.npmPaths] - Repository paths to look for generators packages.
 * @param {string|Array} [options.filePatterns='*\/index.js'] - File pattern to look for.
 * @param {string|Array} [options.packagePatterns='generator-*'] - Package pattern to look for.
 * @param {boolean}      [options.singleResult=false] - Set true to stop lookup on the first match.
 * @param {Number}       [options.globbyDeep] - Deep option to be passed to globby.
 * @return {Object[]} List of generators
 */
resolver.lookup = function (options) {
  // Resolve signature where options is omitted.
  if (typeof options === 'function') {
    throw new TypeError('Callback support have been removed.');
  // Resolve signature where options is boolean.
  } else if (typeof options === 'boolean') {
    options = {localOnly: options};
  } else {
    options = options || {localOnly: false};
  }

  const {registerToScope, lookups = this.lookups} = options;
  options = {
  // Js generators should be after, last will override registered one.
    filePatterns: lookups.flatMap(prefix => [`${prefix}/*/index.ts`, `${prefix}/*/index.js`, `${prefix}/*/index.cjs`, `${prefix}/*/index.mjs`]),
    filterPaths: false,
    packagePatterns: ['generator-*'],
    reverse: !options.singleResult,
    ...options
  };

  const generators = [];
  this.packageLookup.sync(options, module => {
    const {packagePath, filePath} = module;
    let repositoryPath = path.join(packagePath, '..');
    if (path.basename(repositoryPath).startsWith('@')) {
      // Scoped package
      repositoryPath = path.join(repositoryPath, '..');
    }
    let namespace = this.namespace(path.relative(repositoryPath, filePath), lookups);
    if (registerToScope && !namespace.startsWith('@')) {
      namespace = `@${registerToScope}/${namespace}`;
    }
    const registered = this._tryRegistering(filePath, packagePath, namespace);
    generators.push({generatorPath: filePath, packagePath, namespace, registered});
    return options.singleResult && registered;
  });

  return generators;
};

/**
 * Search for npm packages.
 *
 * @private
 * @method
 *
 * @param {boolean|Object} [options]
 * @param {boolean} [options.localOnly = false] - Set true to skip lookups of
 *                                               globally-installed generators.
 * @param {string|Array} [options.packagePaths] - Paths to look for generators.
 * @param {string|Array} [options.npmPaths] - Repository paths to look for generators packages.
 * @param {string|Array} [options.filePatterns='*\/index.js'] - File pattern to look for.
 * @param {string|Array} [options.packagePatterns='lookup'] - Package pattern to look for.
 * @param {boolean} [options.reverse = false] - Set true reverse npmPaths/packagePaths order
 * @param {function}     [find]  Executed for each match, return true to stop lookup.
 */
packageLookup.sync = function (options, find = module => module) {
  debug('Running lookup with options: %o', options);
  options = {...options};
  options.filePatterns = arrify(options.filePatterns || 'package.json').map(filePattern => slash(filePattern));

  if (options.packagePaths) {
    options.packagePaths = arrify(options.packagePaths);
    if (options.reverse) {
      options.packagePaths = options.packagePaths.reverse();
    }
  } else {
    options.npmPaths = options.npmPaths || this.getNpmPaths(options);
    if (options.reverse && Array.isArray(options.npmPaths)) {
      options.npmPaths = options.npmPaths.reverse();
    }
    options.packagePatterns = arrify(options.packagePatterns || PACKAGE_NAME_PATTERN).map(packagePattern => slash(packagePattern));
    options.packagePaths = this.findPackagesIn(options.npmPaths, options.packagePatterns);
  }

  debug('Lookup calculated options: %o', options);

  const modules = [];
  for (const packagePath of options.packagePaths) {
    if (!fs.existsSync(packagePath) || (!fs.lstatSync(packagePath).isDirectory() && !fs.lstatSync(packagePath).isSymbolicLink())) {
      continue;
    }
    for (const filePath of globby.sync(options.filePatterns, {cwd: packagePath, absolute: true, ...options.globbyOptions})) {
      const module = {filePath, packagePath};
      if (find(module)) {
        return [module];
      }
      modules.push(module);
    }
  }
  return modules;
};

/**
 * Search npm for every available generators.
 * Generators are npm packages who's name start with `generator-` and who're placed in the
 * top level `node_module` path. They can be installed globally or locally.
 *
 * @method
 * @private
 *
 * @param {String[]} searchPaths List of search paths
 * @param {String[]} packagePatterns Pattern of the packages
 * @param {Object}  [globbyOptions]
 * @return {Array} List of the generator modules path
 */
packageLookup.findPackagesIn = function (searchPaths, packagePatterns, globbyOptions) {
  searchPaths = arrify(searchPaths).filter(npmPath => npmPath).map(npmPath => path.resolve(npmPath));
  let modules = [];
  for (const root of searchPaths) {
    if (!fs.existsSync(root) || (!fs.lstatSync(root).isDirectory() && !fs.lstatSync(root).isSymbolicLink())) {
      continue;
    }
    // Some folders might not be readable to the current user. For those, we add a try
    // catch to handle the error gracefully as globby doesn't have an option to skip
    // restricted folders.
    try {
      modules = modules.concat(globby.sync(
        packagePatterns,
        {cwd: root, onlyDirectories: true, expandDirectories: false, absolute: true, deep: 0, ...globbyOptions}
      ));

      // To limit recursive lookups into non-namespace folders within globby,
      // fetch all namespaces in root, then search each namespace separately
      // for generator modules
      const scopes = globby.sync(
        ['@*'],
        {cwd: root, onlyDirectories: true, expandDirectories: false, absolute: true, deep: 0, ...globbyOptions}
      );

      for (const scope of scopes) {
        modules = modules.concat(globby.sync(
          packagePatterns,
          {cwd: scope, onlyDirectories: true, expandDirectories: false, absolute: true, deep: 0, ...globbyOptions}
        ));
      }
    } catch (error) {
      debug('Could not access %s (%s)', root, error);
    }
  }

  return modules;
};

/**
 * Try registering a Generator to this environment.
 *
 * @private
 *
 * @param  {String} generatorReference A generator reference, usually a file path.
 * @param  {String} [packagePath] - Generator's package path.
 * @param  {String} [namespace] - namespace of the generator.
 * @return {boolean} true if the generator have been registered.
 */
resolver._tryRegistering = function (generatorReference, packagePath, namespace) {
  const realPath = fs.realpathSync(generatorReference);

  try {
    debug('found %s, trying to register', generatorReference);

    if (!namespace && realPath !== generatorReference) {
      namespace = this.namespace(generatorReference);
    }

    this.register(realPath, namespace, packagePath);
    return true;
  } catch (error) {
    console.error('Unable to register %s (Error: %s)', generatorReference, error.message);
    return false;
  }
};

/**
 * Get the npm lookup directories (`node_modules/`)
 *
 * @deprecated
 *
 * @param {boolean|Object} [options]
 * @param {boolean} [options.localOnly = false] - Set true to skip lookups of
 *                                               globally-installed generators.
 * @param {boolean} [options.filterPaths = false] - Remove paths that don't ends
 *                       with a supported path (don't touch at NODE_PATH paths).
 * @return {Array} lookup paths
 */
resolver.getNpmPaths = function (options = {}) {
  // Resolve signature where options is boolean (localOnly).
  if (typeof options === 'boolean') {
    options = {localOnly: options};
  }

  // Backward compatibility
  options.filterPaths = options.filterPaths === undefined ? false : options.filterPaths;

  return this.packageLookup.getNpmPaths(options);
};

/**
 * Get the npm lookup directories (`node_modules/`)
 *
 * @method
 * @private
 *
 * @param {boolean|Object} [options]
 * @param {boolean} [options.localOnly = false] - Set true to skip lookups of
 *                                               globally-installed generators.
 * @param {boolean} [options.filterPaths = false] - Remove paths that don't ends
 *                       with a supported path (don't touch at NODE_PATH paths).
 * @return {Array} lookup paths
 */
packageLookup.getNpmPaths = function (options = {}) {
  // Resolve signature where options is boolean (localOnly).
  if (typeof options === 'boolean') {
    options = {localOnly: options};
  }
  // Start with the local paths.
  let paths = this._getLocalNpmPaths();

  // Append global paths, unless they should be excluded.
  if (!options.localOnly) {
    paths = paths.concat(this._getGlobalNpmPaths(options.filterPaths));
  }

  return _.uniq(paths);
};

/**
 * Get the local npm lookup directories
 * @private
 * @return {Array} lookup paths
 */
packageLookup._getLocalNpmPaths = function () {
  const paths = [];

  // Walk up the CWD and add `node_modules/` folder lookup on each level
  process.cwd().split(path.sep).forEach((part, i, parts) => {
    let lookup = path.join(...parts.slice(0, i + 1), 'node_modules');

    if (!win32) {
      lookup = `/${lookup}`;
    }

    paths.push(lookup);
  });

  return _.uniq(paths.reverse());
};

/**
 * Get the global npm lookup directories
 * Reference: https://nodejs.org/api/modules.html
 * @private
 * @return {Array} lookup paths
 */
packageLookup._getGlobalNpmPaths = function (filterPaths = true) {
  let paths = [];

  // Node.js will search in the following list of GLOBAL_FOLDERS:
  // 1: $HOME/.node_modules
  // 2: $HOME/.node_libraries
  // 3: $PREFIX/lib/node
  const filterValidNpmPath = function (path, ignore = false) {
    return ignore ? path : (['/node_modules', '/.node_modules', '/.node_libraries', '/node'].some(dir => path.endsWith(dir)) ? path : undefined);
  };

  // Default paths for each system
  if (nvm) {
    paths.push(path.join(process.env.NVM_HOME, process.version, 'node_modules'));
  } else if (win32) {
    paths.push(path.join(process.env.APPDATA, 'npm/node_modules'));
  } else {
    paths.push('/usr/lib/node_modules', '/usr/local/lib/node_modules');
  }

  // Add NVM prefix directory
  if (process.env.NVM_PATH) {
    paths.push(path.join(path.dirname(process.env.NVM_PATH), 'node_modules'));
  }

  // Adding global npm directories
  // We tried using npm to get the global modules path, but it haven't work out
  // because of bugs in the parseable implementation of `ls` command and mostly
  // performance issues. So, we go with our best bet for now.
  if (process.env.NODE_PATH) {
    paths = _.compact(process.env.NODE_PATH.split(path.delimiter)).concat(paths);
  }

  // Global node_modules should be 4 or 2 directory up this one (most of the time)
  // Ex: /usr/another_global/node_modules/yeoman-denerator/node_modules/yeoman-environment/lib (1 level dependency)
  paths.push(filterValidNpmPath(path.join(PROJECT_ROOT, '../../..'), !filterPaths));
  // Ex: /usr/another_global/node_modules/yeoman-environment/lib (installed directly)
  paths.push(path.join(PROJECT_ROOT, '..'));

  // Get yarn global directory and infer the module paths from there
  const yarnBase = execaOutput('yarn', ['global', 'dir'], {encoding: 'utf8'});
  if (yarnBase) {
    paths.push(path.resolve(yarnBase, 'node_modules'));
    paths.push(path.resolve(yarnBase, '../link/'));
  }

  // Get npm global prefix and infer the module paths from there
  const globalInstall = execaOutput('npm', ['root', '-g'], {encoding: 'utf8'});
  if (globalInstall) {
    paths.push(path.resolve(globalInstall));
  }

  // Adds support for generator resolving when yeoman-generator has been linked
  if (process.argv[1]) {
    paths.push(filterValidNpmPath(path.join(path.dirname(process.argv[1]), '../..'), !filterPaths));
  }

  return _.uniq(paths.filter(path => path).reverse());
};

/**
 * Get or create an alias.
 *
 * Alias allows the `get()` and `lookup()` methods to search in alternate
 * filepath for a given namespaces. It's used for example to map `generator-*`
 * npm package to their namespace equivalent (without the generator- prefix),
 * or to default a single namespace like `angular` to `angular:app` or
 * `angular:all`.
 *
 * Given a single argument, this method acts as a getter. When both name and
 * value are provided, acts as a setter and registers that new alias.
 *
 * If multiple alias are defined, then the replacement is recursive, replacing
 * each alias in reverse order.
 *
 * An alias can be a single String or a Regular Expression. The finding is done
 * based on .match().
 *
 * @param {String|RegExp} match
 * @param {String} value
 *
 * @example
 *
 *     env.alias(/^([a-zA-Z0-9:\*]+)$/, 'generator-$1');
 *     env.alias(/^([^:]+)$/, '$1:app');
 *     env.alias(/^([^:]+)$/, '$1:all');
 *     env.alias('foo');
 *     // => generator-foo:all
 */
resolver.alias = function (match, value) {
  if (match && value) {
    this.aliases.push({
      match: match instanceof RegExp ? match : new RegExp(`^${match}$`),
      value
    });
    return this;
  }

  const aliases = [...this.aliases].reverse();

  return aliases.reduce((resolved, alias) => {
    if (!alias.match.test(resolved)) {
      return resolved;
    }

    return resolved.replace(alias.match, alias.value);
  }, match);
};
