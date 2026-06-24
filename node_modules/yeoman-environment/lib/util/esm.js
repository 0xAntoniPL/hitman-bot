const path = require('path');
const {pathToFileURL} = require('url');

module.exports = {
  requireOrImport(fileToImport) {
    if (path.extname(fileToImport) === '.cjs') {
      return require(fileToImport);
    }
    if (path.extname(fileToImport) === '.mjs') {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      return import(pathToFileURL(fileToImport));
    }
    try {
      return require(fileToImport);
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error;
      }
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      return import(pathToFileURL(fileToImport));
    }
  }
};
