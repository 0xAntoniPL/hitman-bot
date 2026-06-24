/** @module env/repository */
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const debug = require('debug')('yeoman:environment:repository');
const Arborist = require('@npmcli/arborist');

const logger = require('./log');
const {requireOrImport} = require('./esm');

const REPOSITORY_FOLDER = '.yo-repository';

/**
 * @private
 */
class YeomanRepository {
  constructor(repositoryPath = REPOSITORY_FOLDER) {
    this.log = logger();
    this.tracker = logger.tracker;

    this.repositoryPath = repositoryPath;
  }

  /**
   * @private
   * @property
   * Repository absolute path (npm --prefix).
   */
  get repositoryPath() {
    return this._repositoryPath;
  }

  set repositoryPath(repositoryPath) {
    this._repositoryPath = path.resolve(repositoryPath);
    this._nodeModulesPath = path.join(this._repositoryPath, 'node_modules');
  }

  /**
   * @private
   * @property nodeModulesPath
   * Path to the repository's node_modules.
   */
  get nodeModulesPath() {
    return this._nodeModulesPath;
  }

  /**
   * @private
   * @method
   * Create the repositoryPath if it doesn't exists.
   */
  createRepositoryFolder() {
    if (!fs.existsSync(this.repositoryPath)) {
      fs.mkdirSync(this.repositoryPath);
    }
  }

  /**
   * @private
   * @method
   * Resolve the package name module path inside the [repository path]{@link repository.repositoryPath}
   * @param {String} packageName - Package name. If packageName is a absolute path then modulePath is joined to it.
   * @param {String} [modulePath] - Path to a module inside the package path.
   * @returns {String} Absolute module path.
   */
  resolvePackagePath(packageName = '', modulePath = '') {
    if (path.isAbsolute(packageName)) {
      return path.join(packageName, modulePath);
    }
    return path.join(this.nodeModulesPath, packageName, modulePath);
  }

  /**
   * @private
   * @method
   * Remove the package from node's cache, necessary for a reinstallation.
   * Removes only package.json by default, it's used to version verification.
   * Removes only cache of the repository's packages.
   * @param {String} packageName - Package name.
   * @param {Boolean} [force=false] - If true removes every cache the package.
   * @throw Error if force === false and any file other the package.json is loaded.
   */
  cleanupPackageCache(packageName, force = false) {
    if (!packageName) {
      throw new Error('You must provide a packageName');
    }
    debug('Cleaning cache of %s', packageName);
    const packagePath = this.resolvePackagePath(packageName);
    const toCleanup = Object.keys(require.cache).filter(cache => cache.startsWith(packagePath));
    if (!force && toCleanup.some(cache => !cache.endsWith('package.json'))) {
      throw new Error(`Package ${packageName} already loaded`);
    }

    for (const cache of toCleanup) {
      delete require.cache[cache];
    }
  }

  /**
   * @private
   * @param {Object} options - options to be passed to arborist reify eg: {add: { dependencies: [ pkgSpec ] }, rm: [ pkgName ]}
   */
  async reifyRepository(options) {
    this.arb = this.arb || new Arborist({
      path: this.repositoryPath,
      globalStyle: true,
      log: this.tracker
    });
    return this.arb.reify(options);
  }

  /**
   * @private
   * @method
   * Verify if the package is installed and matches the version range.
   * @param {String} packageName - Package name.
   * @param {String} versionRange - Version range of the package.
   * @returns {Boolean} True if the package is installed and matches the version.
   * @throws Error.
   */
  verifyInstalledVersion(packageName, versionRange) {
    const packagePath = this.resolvePackagePath(packageName);
    const installedVersion = this.getPackageVersion(packagePath);
    if (!versionRange || !installedVersion) {
      return installedVersion;
    }
    if (semver.validRange(versionRange) && !semver.satisfies(installedVersion, versionRange)) {
      return false;
    }
    return installedVersion;
  }

  /**
   * @private
   * @method
   * Install a package into the repository.
   * @param {String} packageName - Package name.
   * @param {String} versionRange - range Version of the package.
   * @returns {String} Package path.
   * @throws Error.
   */
  async installPackage(packageName, versionRange) {
    const pkgs = {};
    if (packageName === 'yeoman-environment' && versionRange && (!semver.validRange(versionRange) || semver.lt(semver.minVersion(versionRange), '2.9.0'))) {
      // Workaround buggy dependencies.
      pkgs['rxjs-compat'] = '^6.0.0';
    }

    pkgs[packageName] = versionRange;
    if (!await this.installPackages(pkgs)) {
      throw new Error(`Error installing package ${packageName}, version ${versionRange}.`);
    }
    debug(`Package ${packageName} sucessfully installed`);
    return this.resolvePackagePath(packageName);
  }

  /**
   * @private
   * @method
   * Install packages.
   * @param {Object} packages - Packages to be installed.
   * @returns {Boolean}
   * @example
   * repository.installPackages({ 'yeoman-environment': '2.3.0' });
   */
  async installPackages(packages) {
    this.createRepositoryFolder();
    debug('Installing packages %o', packages);
    const packagesArgs = Object
      .entries(packages)
      .filter(([packageName, _]) => {
        this.cleanupPackageCache(packageName);
        return true;
      })
      .map(([packageName, version]) => version ? (semver.validRange(version) ? `${packageName}@${version}` : version) : packageName);
    try {
      await this.reifyRepository({add: [...packagesArgs]});
    } catch (error) {
      for (const packageName of Object.keys(packages)) {
        this.log.error(`${packageName} cannot be installed. ${error}`);
      }
      return false;
    }
    for (const packageName of Object.keys(packages)) {
      this.log.ok(`${packageName} installed.`);
    }
    return true;
  }

  /**
   * @private
   * @method
   * Get the installed package version.
   * @param {String} packageName - Package name.
   * @returns {String|undefined} Package version or undefined.
   */
  getPackageVersion(packageName) {
    try {
      const packageJson = this.resolvePackagePath(packageName, 'package.json');
      return require(packageJson).version;
    } catch {
      return undefined;
    }
  }

  /**
   * @private
   * @method
   * Require a module from the repository.
   * @param {String} packageName - Package name.
   * @param {String} versionRange - Version range of the package.
   * @param {String} modulePath - Package name.
   * @returns {Object} Module.
   * @throws Error.
   */
  requireModule(packageName, versionRange, modulePath = '') {
    const installedVersion = this.verifyInstalledVersion(packageName, versionRange);
    if (installedVersion) {
      debug(`Using ${packageName} installed version ${installedVersion}`);
    } else {
      // Installs the package if no version is installed or the version is provided and don't match the installed version.
      throw new Error(`Found ${packageName} version ${installedVersion} but requires version ${versionRange}`);
    }
    const absolutePath = this.resolvePackagePath(packageName, modulePath);
    debug('Loading module at %s', absolutePath);
    return requireOrImport(absolutePath);
  }
}

module.exports = YeomanRepository;
