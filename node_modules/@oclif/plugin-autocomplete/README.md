@oclif/plugin-autocomplete
==========================

autocomplete plugin for oclif (bash & zsh)

[![Version](https://img.shields.io/npm/v/@oclif/plugin-autocomplete.svg)](https://npmjs.org/package/@oclif/plugin-autocomplete)
[![CircleCI](https://circleci.com/gh/oclif/plugin-autocomplete/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/plugin-autocomplete/tree/main)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/oclif/plugin-autocomplete?branch=main&svg=true)](https://ci.appveyor.com/project/oclif/plugin-autocomplete/branch/main)
[![Downloads/week](https://img.shields.io/npm/dw/@oclif/plugin-autocomplete.svg)](https://npmjs.org/package/@oclif/plugin-autocomplete)
[![License](https://img.shields.io/npm/l/@oclif/plugin-autocomplete.svg)](https://github.com/oclif/plugin-autocomplete/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
See https://oclif.io/docs/plugins.html
# Commands
<!-- commands -->
* [`oclif-example autocomplete [SHELL]`](#oclif-example-autocomplete-shell)

## `oclif-example autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ oclif-example autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ oclif-example autocomplete

  $ oclif-example autocomplete bash

  $ oclif-example autocomplete zsh

  $ oclif-example autocomplete --refresh-cache
```

_See code: [src/commands/autocomplete/index.ts](https://github.com/oclif/plugin-autocomplete/blob/v1.2.0/src/commands/autocomplete/index.ts)_
<!-- commandsstop -->
