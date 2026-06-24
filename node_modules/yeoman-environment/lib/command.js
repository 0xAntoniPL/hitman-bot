const debug = require('debug')('yeoman:environment:command');
const {Option} = require('commander');

const {YeomanCommand} = require('./util/command');

module.exports = cls => class EnvironmentCommand extends cls {
  static addEnvironmentOptions(command = new YeomanCommand()) {
    /* Environment options */
    return command.option('--cwd', 'Path to use as current dir')
      /* Environment/Legacy generator options */
      .option('--skip-install', 'Do not automatically install dependencies', false)
      /* Generator options */
      .option('--skip-cache', 'Do not remember prompt answers', false)
      .option('--local-config-only', 'Generate .yo-rc-global.json locally', false)
      .option('--ask-answered', 'Show prompts for already configured options', false)
      /* Conflicter options */
      .option('--force', 'Override every file', false)
      .option('--dry-run', 'Print conflicts', false)
      .option('--whitespace', 'Whitespace changes will not trigger conflicts', false)
      .option('--bail', 'Fail on first conflict', false)
      .option('--skip-yo-resolve', 'Ignore .yo-resolve files', false)
      /* Hidden options, used for api */
      .addOption(new Option('--skip-local-cache', 'Skip local answers cache').default(true).hideHelp())
      .addOption(new Option('--skip-parse-options', 'Skip legacy options parsing').default(false).hideHelp())
      .addOption(new Option('--experimental', 'Experimental features').default(false).hideHelp())
      .addOption(new Option('--log-cwd', 'Path for log purpose').hideHelp());
  }

  /**
   * Load Generator options into a commander instance.
   *
   * @param {Command} command - Command to load options
   * @param {Generator} generator - Generator
   * @return {Command} return command
   */
  static addGeneratorOptions(command, generator) {
    command.addGeneratorOptions(generator._options);
    command.addGeneratorArguments(generator._arguments);
    return command;
  }

  /**
   * Generate a command for the generator and execute.
   *
   * @param {string} generatorNamespace
   * @param {string[]} args
   */
  async execute(generatorNamespace, args = []) {
    const env = this;
    const namespace = this.requireNamespace(generatorNamespace);
    if (!this.get(namespace.namespace)) {
      this.lookup({packagePatterns: namespace.generatorHint, singleResult: true});
    }
    if (!this.get(namespace.namespace)) {
      await this.installLocalGenerators({[namespace.generatorHint]: namespace.semver});
    }

    const namespaceCommand =
      this.command ? this.command.command(namespace.namespace) : new YeomanCommand();
    namespaceCommand.usage('[generator-options]');

    // Instantiate the generator for options
    const generator = await this.create(namespace.namespace, {help: true});
    EnvironmentCommand.addGeneratorOptions(namespaceCommand, generator);

    namespaceCommand._parseCommand([], args);
    debug('Running generator with arguments %o, options %o', namespaceCommand.args, namespaceCommand.opts());
    return env.run([namespace.namespace, ...namespaceCommand.args], {...namespaceCommand.opts()});
  }
};
