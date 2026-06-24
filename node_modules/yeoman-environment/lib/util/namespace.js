const debug = require('debug')('yeoman:environment:namespace');

// ============ | == @ ======== scope ========== | ====== unscoped ====== | = : ========== generator ========== | = @ ===== semver ====== @  | = # ========= instanceId ========== | == + =========== method ============== |= flags = |
const regexp = /^(?:(@[a-z\d-~][a-z\d-._~]*)\/)?([a-z\d-~][a-z\d-._~]*)(?::((?:[a-z\d-~][a-z\d-._~]*:?)*))?(?:@([a-z\d-.~><+=^* ]*)@?)?(?:#((?:[a-z\d-~][a-z\d-._~]*|\*)))?(?:\+((?:[a-zA-Z\d]\w*\+?)*))?(\?)?$/;

const groups = {complete: 0, scope: 1, unscoped: 2, generator: 3, semver: 4, instanceId: 5, method: 6, flags: 7};
const flags = {optional: '?'};

module.exports = class YeomanNamespace {
  constructor(parsed) {
    this._original = parsed.complete;
    this.scope = parsed.scope;
    this.unscoped = parsed.unscoped;
    this.generator = parsed.generator;
    this.instanceId = parsed.instanceId;
    this.semver = parsed.semver;
    this.methods = parsed.method ? parsed.method.split('+') : parsed.methods;
    this.flags = parsed.flags;

    // Populate flags
    if (this.flags) {
      for (const [name, value] of Object.entries(flags)) {
        if (this.flags === value) {
          this[name] = true;
        } else {
          delete this[name];
        }
      }
    }

    debug('Parsed namespace %o', this);
  }

  static parse(complete) {
    const result = regexp.exec(complete);
    if (!result) {
      debug('Namespace failed RegExp parse %s, using fallback', complete);
      return null;
    }

    const parsed = {complete};
    // Populate fields
    for (const [name, value] of Object.entries(groups)) {
      if (result[value]) {
        parsed[name] = result[value];
      }
    }
    return parsed;
  }

  _update(parsed) {
    this.scope = parsed.scope || this.scope;
    this.unscoped = parsed.unscoped || this.unscoped;
    this.generator = parsed.generator || this.generator;
    this.instanceId = parsed.instanceId || this.instanceId;
    this.command = parsed.command || this.command;
    this.flags = parsed.flags || this.flags;
  }

  get _scopeAddition() {
    return this.scope ? `${this.scope}/` : '';
  }

  get generatorName() {
    return this.generator ? `:${this.generator}` : '';
  }

  _semverAddition(post) {
    if (!this.semver) {
      return post ? post : '';
    }
    if (post) {
      return `@${this.semver}@${post}`;
    }
    return `@${this.semver}`;
  }

  get instanceName() {
    return this.instanceId ? `#${this.instanceId}` : '';
  }

  get complete() {
    let methods = '';
    if (this.methods && this.methods.length > 0) {
      methods = '+' + this.methods.join('+');
    }
    const postSemver = `${this.instanceName}${methods}${this.flags || ''}`;
    return `${this.namespace}${this._semverAddition(postSemver)}`;
  }

  get packageNamespace() {
    return `${this._scopeAddition}${this.unscoped}`;
  }

  get namespace() {
    return `${this.packageNamespace}${this.generatorName}`;
  }

  set namespace(namespace) {
    this._update(YeomanNamespace.parse(namespace));
  }

  get unscopedNamespace() {
    return `${this.unscoped}${this.generatorName}`;
  }

  get id() {
    return `${this.namespace}${this.instanceName}`;
  }

  get generatorHint() {
    return `${this._scopeAddition}generator-${this.unscoped}`;
  }

  get versionedHint() {
    return this.semver ? `${this.generatorHint}@"${this.semver}"` : this.generatorHint;
  }

  with(newValues) {
    const self = this;
    return new YeomanNamespace({
      ...self,
      ...newValues
    });
  }

  toString() {
    return this.complete;
  }
};
