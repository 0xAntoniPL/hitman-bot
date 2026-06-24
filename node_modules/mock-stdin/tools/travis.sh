#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# FIXME: jscoverage fails to exclude the type definition file, which is breaking coverage.
# Re-enable coverage after https://github.com/fishbar/jscoverage/pull/45 is merged
#node_modules/.bin/jscoverage lib

# TODO: Only run tests once, and use a custom reporter which outputs both LCOV and text,
# for Travis.
node_modules/.bin/mocha test
STATUS=$?

#COVERAGE=1 node_modules/.bin/mocha -R mocha-lcov-reporter test > .lcov

#cat .lcov | node_modules/.bin/coveralls

exit $STATUS
