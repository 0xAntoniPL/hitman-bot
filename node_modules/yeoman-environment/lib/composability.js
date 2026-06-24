const assert = require('assert');
const semver = require('semver');
const pacote = require('pacote');

/**
 * @mixin
 * @alias env/composability
 */
const composability = module.exports;

composability.requireGenerator = function (namespace) {
  if (namespace === undefined) {
    return require('yeoman-generator');
  }
  // Namespace is a version
  if (semver.valid(namespace)) {
    return this.repository.requireModule('yeoman-generator', namespace);
  }
  return this.get(namespace);
};

/**
 * Install generators at the custom local repository and register.
 *
 * @param  {Object} packages - packages to install key(packageName): value(versionRange).
 * @return  {Boolean} - true if the install succeeded.
 */
composability.installLocalGenerators = async function (packages) {
  const entries = Object.entries(packages).filter(([packageName, version]) => !this.repository.verifyInstalledVersion(packageName, version));
  if (entries.length === 0) {
    return true;
  }
  const toInstall = {};
  for (const [packageName, version] of entries) {
    toInstall[packageName] = version;
  }
  if (await this.repository.installPackages(toInstall)) {
    const packagesToLookup = entries.map(([packageName, _]) => packageName);
    this.lookupLocalPackages(packagesToLookup);
    return true;
  }
  return false;
};

/**
 * Lookup and register generators from the custom local repository.
 *
 * @param  {String[]} [packagesToLookup='generator-*'] - packages to lookup.
 */
composability.lookupLocalPackages = function (packagesToLookup = 'generator-*') {
  this.lookup({packagePatterns: packagesToLookup, npmPaths: this.repository.nodeModulesPath});
};

/**
 * Resolve a package name with version.
 *
 * @param  {string} packageName - package to resolve.
 * @param  {string} [packageVersion] - version or range to resolve.
 * @param  {string[]} Array of key, value pairs.
 */
composability.resolvePackage = async function (packageName, packageVersion) {
  assert(packageName, 'Parameter packageName is required');
  if (packageVersion) {
    packageName = `${packageName}@${packageVersion}`;
  }
  const manifest = await pacote.manifest(packageName);
  if (!manifest) {
    return undefined;
  }
  const from = manifest._from;
  const index = from.lastIndexOf('@');
  if (index > 1) {
    const resolvedVersion = from.slice(index + 1, from.length) || manifest.version;
    return [from.slice(0, Math.max(0, index)), resolvedVersion];
  }
  return [manifest.name, from || manifest.version];
};
