const {groupBy} = require('lodash');
const debug = require('debug')('yeoman:yoe');

const Env = require('..');

const printGroupedGenerator = (generators, env) => {
  const grouped = groupBy(generators, 'packagePath');
  for (const [packagePath, group] of Object.entries(grouped)) {
    const namespace = env.toNamespace(group[0].namespace);
    console.log(`  ${namespace.packageNamespace} at ${packagePath}`);
    for (const generator of group) {
      const generatorNamespace = env.toNamespace(generator.namespace);
      console.log(`    :${generatorNamespace.generator || 'app'}`);
    }
    console.log('');
  }
  console.log(`${generators.length} generators`);
};

const environmentAction = async function (generatorNamespace, options, command) {
  debug('Handling operands %o', generatorNamespace);
  if (!generatorNamespace) {
    return;
  }

  this.env = Env.createEnv([], {...options, command: this});
  this.env.lookupLocalPackages();

  return this.env.execute(generatorNamespace, command.args.splice(1));
};

module.exports = {printGroupedGenerator, environmentAction};
