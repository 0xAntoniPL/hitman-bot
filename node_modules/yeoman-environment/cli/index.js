#!/usr/bin/env node
const {YeomanCommand} = require('../lib/util/command');
const packageJson = require('../package.json');
const Env = require('..');
const {printGroupedGenerator, environmentAction} = require('./utils');

const program = new YeomanCommand();

program
  .version(packageJson.version)
  .allowExcessArguments(false)
  .enablePositionalOptions();

Env.addEnvironmentOptions(program
  .command('run <namespace>')
  .description('Run a generator', {namespace: 'Generator to run'})
  .passThroughOptions()
  .allowUnknownOption()
  .allowExcessArguments(true)
  .action(environmentAction)
  .usage('[environment options] <namespace> [generator-options]')
);

program.command('find')
  .description('Find installed generators')
  .action(() => {
    const env = Env.createEnv();
    const generators = env.lookup();
    printGroupedGenerator(generators, env);
  });

program.command('list')
  .description('List generators available to be used')
  .action(() => {
    const env = Env.createEnv();
    env.lookup();
    printGroupedGenerator(Object.values(env.getGeneratorsMeta()), env);
  });

program.parseAsync(process.argv)
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
