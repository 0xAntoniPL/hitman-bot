const path = require('path');
const debug = require('debug')('yeoman:environment:package-manager');
const preferredPm = require('preferred-pm');

module.exports = cls => class extends cls {
  /**
   * @private
   * Get the destination package.json file.
   * @return {Vinyl | undefined} a Vinyl file.
   */
  getDestinationPackageJson() {
    return this.sharedFs.get(path.resolve(this.cwd, 'package.json'));
  }

  /**
   * @private
   * Get the destination package.json commit status.
   * @return {boolean} package.json commit status.
   */
  isDestinationPackageJsonCommitted() {
    const file = this.getDestinationPackageJson();
    return file && file.committed;
  }

  /**
   * @private
   * Detect the package manager based on files or use the passed one.
   * @return {string} package manager.
   */
  async detectPackageManager() {
    if (this.options.nodePackageManager) {
      return this.options.nodePackageManager;
    }
    const pm = await preferredPm(this.cwd);
    return pm && pm.name;
  }

  /**
   * Executes package manager install.
   * - checks if package.json was committed.
   * - uses a preferred package manager or try to detect.
   * @return {Promise<boolean>} Promise true if the install execution suceeded.
   */
  async packageManagerInstallTask() {
    if (!this.getDestinationPackageJson()) {
      return Promise.resolve(false);
    }

    if (this.compatibilityMode === 'v4') {
      debug('Running in generator < 5 compatibility. Package manager install is done by the generator.');
      return Promise.resolve(false);
    }
    const customInstallTask = this.findGeneratorCustomInstallTask();
    if (customInstallTask && typeof customInstallTask !== 'function') {
      debug('Install disabled by customInstallTask');
      return Promise.resolve(false);
    }

    if (!this.isDestinationPackageJsonCommitted()) {
      this.adapter.log(`
No change to package.json was detected. No package manager install will be executed.`);
      return Promise.resolve(false);
    }

    this.adapter.log(`
Changes to package.json were detected.`);

    if (this.options.skipInstall) {
      this.adapter.log(`Skipping package manager install.
`);
      return Promise.resolve(false);
    }

    let packageManagerName = await this.detectPackageManager();

    const execPackageManager = () => {
      if (!packageManagerName) {
        packageManagerName = 'npm';
        this.adapter.log('Error detecting the package manager. Falling back to npm.');
      }

      if (!['npm', 'yarn', 'pnpm'].includes(packageManagerName)) {
        this.adapter.log(`${packageManagerName} is not a supported package manager. Run it by yourself.`);
        return Promise.resolve(false);
      }

      this.adapter.log(`
Running ${packageManagerName} install for you to install the required dependencies.`);
      return this.spawnCommand(packageManagerName, ['install']).then(() => true);
    };

    if (customInstallTask) {
      const result = customInstallTask(packageManagerName, execPackageManager);
      if (!result || !result.then) {
        return Promise.resolve(true);
      }
      return result;
    }

    return execPackageManager();
  }
};
