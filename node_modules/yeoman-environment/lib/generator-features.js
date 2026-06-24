const debug = require('debug')('yeoman:environment:features');

module.exports = cls => class extends cls {
  /**
   * @private
   * Get generators features.
   * @return {Object} Namespace, features map.
   */
  getGeneratorsFeatures() {
    return Object.fromEntries(Object.entries(this.getAllGenerators()).map(([namespace, generator]) => (
      [namespace, (generator.getFeatures ? generator.getFeatures() : {}) || {}]
    )));
  }

  /**
   * @private
   * Get generators feature.
   * @param {string} featureName.
   * @return {Object} Namespace, features map.
   */
  getGeneratorsFeature(featureName) {
    return Object.fromEntries(Object.entries(
      this.getGeneratorsFeatures())
      .map(([namespace, features]) => ([namespace, features[featureName]]))
      .filter(([_namespace, customFeature]) => customFeature !== undefined
      )
    );
  }

  /**
   * @private
   * Find for commit tasks.
   * @param {string} featureName.
   * @return {boolean | Function}
   */
  getGeneratorUniqueFunctionFeature(featureName) {
    const customFeatures = Object.entries(this.getGeneratorsFeature(featureName));
    if (customFeatures.length === 0) {
      debug(`Feature ${featureName} not found.`);
      return false;
    }
    if (customFeatures.length > 1) {
      debug(`Multiple ${featureName} found. They may conflict with each other.`);
    }

    const customFunctions = customFeatures.filter(([_namespace, customFeature]) => typeof customFeature === 'function');

    if (customFunctions.length > 0) {
      if (customFeatures.length > 1) {
        this.adapter.log.info(`Multiple ${featureName} tasks found. Using the first.`);
      }
      debug(`Using ${customFunctions} from ${customFunctions[0][0]}`);
      return customFunctions[0][1];
    }
    return true;
  }

  /**
   * @private
   * Find for commit tasks.
   * @return {boolean | Function}
   */
  findGeneratorCustomCommitTask() {
    return this.getGeneratorUniqueFunctionFeature('customCommitTask');
  }

  /**
   * @private
   * Find for commit tasks.
   * @return {boolean | Function}
   */
  findGeneratorCustomInstallTask() {
    return this.getGeneratorUniqueFunctionFeature('customInstallTask');
  }
};
