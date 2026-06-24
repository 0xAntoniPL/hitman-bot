const {Command, Option} = require('commander');

class YeomanCommand extends Command {
  createCommand(name) {
    return new YeomanCommand(name);
  }

  /**
   * Override addOption to register a negative alternative for every option.
   * @param {Option} option
   * @return {YeomanCommand} this;
   */
  addOption(option) {
    if (!option.long || option.required || option.optional) {
      return super.addOption(option);
    }
    if (option.negate) {
      // Add a affirmative option for negative boolean options.
      // Should be done before, because commander adds a non working affirmative by itself.
      super.addOption(new Option(option.long.replace(/^--no-/, '--')).hideHelp());
    }
    const result = super.addOption(option);
    if (!option.negate) {
      // Add a hidden negative option for affirmative boolean options.
      super.addOption(new Option(option.long.replace(/^--/, '--no-')).hideHelp());
    }
    return result;
  }

  /**
   * Register arguments using generator._arguments structure.
   * @param {object[]} generatorArgs
   * @return {YeomanCommand} this;
   */
  addGeneratorArguments(generatorArgs = []) {
    if (!generatorArgs) {
      return this;
    }
    const args = generatorArgs
      .map(argument => {
        const argName = argument.type === Array ? `${argument.name}...` : argument.name;
        return argument.required ? `<${argName}>` : `[${argName}]`;
      })
      .join(' ');
    this.arguments(args);
    return this;
  }

  /**
   * Register options using generator._options structure.
   * @param {object} options
   * @param {string} blueprintOptionDescription - description of the blueprint that adds the option
   * @return {YeomanCommand} this;
   */
  addGeneratorOptions(options) {
    options = options || {};
    for (const [key, value] of Object.entries(options)) {
      this._addGeneratorOption(key, value);
    }
    return this;
  }

  _addGeneratorOption(optionName, optionDefinition, additionalDescription = '') {
    if (optionName === 'help') {
      return undefined;
    }
    const longOption = `--${optionName}`;
    const existingOption = this._findOption(longOption);
    if (this._findOption(longOption)) {
      return existingOption;
    }

    let cmdString = '';
    if (optionDefinition.alias) {
      cmdString = `-${optionDefinition.alias}, `;
    }
    cmdString = `${cmdString}${longOption}`;
    if (optionDefinition.type === String) {
      cmdString = optionDefinition.required === false ? `${cmdString} [value]` : `${cmdString} <value>`;
    } else if (optionDefinition.type === Array) {
      cmdString = optionDefinition.required === false ? `${cmdString} [value...]` : `${cmdString} <value...>`;
    }
    return this.addOption(
      new Option(cmdString, optionDefinition.description + additionalDescription)
        .default(optionDefinition.default)
        .hideHelp(optionDefinition.hide)
    );
  }

  /**
   * Override to reject errors instead of throwing and add command to error.
   * @return promise this
   */
  parseAsync(argv, parseOptions) {
    try {
      this.parse(argv, parseOptions);
    } catch (commanderError) {
      commanderError.command = this;
      return Promise.reject(commanderError);
    }
    return Promise.all(this._actionResults).then(() => this);
  }
}

module.exports = {YeomanCommand};
