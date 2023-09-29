
const fs = require('fs');
const path = require('path');

const config = require('../config');
const tools = require('../tools');

const rewriteFileByMapReplace = (filePath, componentName, componentOtherInfo) => {
  try {
    const fileText = fs.readFileSync(filePath, { encoding: 'utf8' });
    const fileTextModified = tools.mapReplace(fileText, {
      componentName,
      ...componentOtherInfo,
    });
    fs.writeFileSync(filePath, fileTextModified, { encoding: 'utf8' });
  } catch (error) {
    throw error;
  }
};

const rewriteExampleJs = (filePath, componentName, componentOtherInfo) => {
  rewriteFileByMapReplace(filePath, componentName, componentOtherInfo);
};
const rewriteExampleJson = (filePath, componentName, componentOtherInfo) => {
  rewriteFileByMapReplace(filePath, componentName, componentOtherInfo);
};
const rewriteExampleWxml = (filePath, componentName, componentOtherInfo) => {
  rewriteFileByMapReplace(filePath, componentName, componentOtherInfo);
};
const rewriteExampleWxss = (filePath, componentName, componentOtherInfo) => {};

module.exports = {
  rewriteExampleJs,
  rewriteExampleJson,
  rewriteExampleWxml,
  rewriteExampleWxss,
}