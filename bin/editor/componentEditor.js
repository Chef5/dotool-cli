
const fs = require('fs');
const path = require('path');

const config = require('../config');
const tools = require('../tools');

const rewriteComponentJs = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentJson = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentWxml = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentLess = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentReadme = (filePath, componentName, componentOtherInfo) => {
  const fileText = fs.readFileSync(filePath, { encoding: 'utf8' });
  const fileTextModified = tools.mapReplace(fileText, {
    componentName,
    ...componentOtherInfo,
  });
  fs.writeFileSync(filePath, fileTextModified, { encoding: 'utf8' });
};

module.exports = {
  rewriteComponentJs,
  rewriteComponentJson,
  rewriteComponentWxml,
  rewriteComponentLess,
  rewriteComponentReadme,
}