const YeomanNamespace = require('./util/namespace');

module.exports = cls => class extends cls {
  /**
   * Parse an namespace
   *
   * @private
   * @param  {String} namespace
   * @return {Object} parsed
   * @return {String} parsed.complete - Complete namespace
   * @return {String} parsed.namespace - Namespace with format @scope/namespace:generator
   * @return {String} parsed.generatorHint - Package name
   * @return {String} parsed.id - Id of the instance.
   * @return {String} parsed.instanceId - Instance id with format @scope/namespace:generator#id
   * @return {String} parsed.method - Method id with format @scope/namespace:generator+foo+bar
   * @return {String} parsed.scope - Scope name
   * @return {String} parsed.packageNamespace - Package namespace with format @scope/namespace
   * @return {String} parsed.generator - Original namespace
   * @return {String} parsed.flags - Original namespace
   */
  parseNamespace(complete) {
    if (typeof complete !== 'string') {
      return null;
    }
    const parsed = YeomanNamespace.parse(complete);
    return parsed ? new YeomanNamespace(parsed) : null;
  }

  /**
   * Convert a namespace to a namespace object
   *
   * @private
   * @param  {String | YeomanNamespace} namespace
   * @return {YeomanNamespace}
   */
  toNamespace(namespace) {
    return this.isNamespace(namespace) ? namespace : this.parseNamespace(namespace);
  }

  /**
   * Convert a package name to a namespace object
   *
   * @private
   * @param  {String} packageName
   * @return {YeomanNamespace}
   */
  namespaceFromPackageName(packageName) {
    const namespace = this.parseNamespace(packageName);
    if (!namespace.unscoped.startsWith('generator-')) {
      throw new Error(`${packageName} is not a valid generator package name`);
    }
    namespace.unscoped = namespace.unscoped.replace(/^generator-/, '');
    return namespace;
  }

  /**
   * Convert a namespace to a namespace object
   *
   * @private
   * @param  {String | YeomanNamespace} namespace
   * @return {YeomanNamespace}
   */
  requireNamespace(namespace) {
    const parsed = this.toNamespace(namespace);
    if (!parsed) {
      throw new Error(`Error parsing namespace ${namespace}`);
    }
    return parsed;
  }

  /**
   * Test if the object is an Namespace instance.
   *
   * @private
   * @param  {Object} namespace
   * @return {Boolean} True if namespace is a YeomanNamespace
   */
  isNamespace(namespace) {
    return namespace && namespace.constructor && namespace.constructor.name === 'YeomanNamespace';
  }
};
