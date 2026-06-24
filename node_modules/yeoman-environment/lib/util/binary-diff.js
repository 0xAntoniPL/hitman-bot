const fs = require('fs');
const path = require('path');
const Table = require('cli-table');
const dateFormat = require('dateformat');
const prettyBytes = require('pretty-bytes');

const {isBinaryFileSync} = require('isbinaryfile');
const {default: textextensions} = require('textextensions');
const {default: binaryextensions} = require('binaryextensions');

exports.isBinary = (filePath, newFileContents) => {
  const extension = path.extname(filePath).replace(/^\./, '') || path.basename(filePath);
  if (binaryextensions.includes(extension)) {
    return true;
  }

  if (textextensions.includes(extension)) {
    return false;
  }

  return (
    (fs.existsSync(filePath) && isBinaryFileSync(filePath)) ||
    (newFileContents && isBinaryFileSync(Buffer.isBuffer(newFileContents) ? newFileContents : Buffer.from(newFileContents)))
  );
};

exports.diff = (existingFilePath, newFileContents) => {
  const existingStat = fs.statSync(existingFilePath);
  const table = new Table({
    head: ['', 'Existing', 'Replacement', 'Diff']
  });

  let sizeDiff;

  if (!newFileContents) {
    newFileContents = Buffer.from([]);
  }

  sizeDiff = existingStat.size > newFileContents.length ? '-' : '+';

  sizeDiff += prettyBytes(Math.abs(existingStat.size - newFileContents.length));

  table.push(
    [
      'Size',
      prettyBytes(existingStat.size),
      prettyBytes(newFileContents.length),
      sizeDiff
    ],
    ['Last modified', dateFormat(existingStat.mtime), '', '']
  );

  return table.toString();
};
