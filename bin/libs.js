const chalk = require("chalk");
const fs = require('fs');
const path = require('path');

const config = require('./config');

const log = console.log;

const templatePath = `${__dirname}/template`;
const currentPath = process.cwd();

const errorMessage = {
  repositoryPathError: `${chalk.red('请切换到组件库根目录下执行')}`,
  componentNameFormatError: `${chalk.red('组件命名不符合规范，请按照规范进行命名')}`,
  componentNameDuplicated: `${chalk.yellow('组件名称重复，请更换其他名称')}`,
};

const checkRepository = () => {
  if (config.repositoryCheckItems.some((t) => !fs.existsSync(`${currentPath}/${t}`))) {
    throw 'repositoryPathError';
  }
  return true;
};

const getComponentNames = () => {
  return fs.readdirSync(path.join(currentPath, config.sourceDirectory));
};

const checkComponentName = (componentName) => {
  if (!config.componentNameRegex.test(componentName)) {
    throw 'componentNameFormatError';
  }
  const componentsList = getComponentNames();
  if (componentsList.includes(componentName)) {
    throw 'componentNameDuplicated'
  }
  return true;
};

const copyTemplateToRepository = (componentName) => {
  const templateFiles = fs.readdirSync(templatePath);
  const componentPath = path.join(currentPath, config.sourceDirectory, componentName);
  try {
    fs.mkdirSync(componentPath);
    templateFiles.forEach(file => {
      const srcFile = path.join(templatePath, file);
      const destFile = path.join(componentPath, file);
      fs.copyFileSync(srcFile, destFile, fs.constants.COPYFILE_EXCL);
    });
  } catch (error) {
    if (fs.existsSync(componentPath)) {
      fs.rmSync(componentPath);
    }
    throw error;
  }
};

// {key} will be replaced by params: { key: value }
const mapReplace = (template, params) => {
  return template.replace(/\{(.+?)\}/g, (result, key) => {
    return params[key] || result || '';
  })
}

const rewriteComponentReadme = (filePath, componentName, componentOtherInfo) => {
  const fileText = fs.readFileSync(filePath, { encoding: 'utf8' });
  const fileTextModified = mapReplace(fileText, {
    componentName,
    ...componentOtherInfo,
  });
  fs.writeFileSync(filePath, fileTextModified, { encoding: 'utf8' });
};
const rewriteComponentJs = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentJson = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentWxml = (filePath, componentName, componentOtherInfo) => {};
const rewriteComponentLess = (filePath, componentName, componentOtherInfo) => {};

const rewriteComponent = (componentName, componentOtherInfo) => {
  const componentPath = path.join(currentPath, config.sourceDirectory, componentName);
  const componentFiles = fs.readdirSync(componentPath);
  componentFiles.forEach(file => {
    const filePath = path.join(componentPath, file);
    switch (file.split('.').pop().toLowerCase()) {
      case 'md': {
        rewriteComponentReadme(filePath, componentName, componentOtherInfo);
        break;
      }
      case 'js': {
        rewriteComponentJs(filePath, componentName, componentOtherInfo);
        break;
      }
      case 'json': {
        rewriteComponentJson(filePath, componentName, componentOtherInfo);
        break;
      }
      case 'wxml': {
        rewriteComponentWxml(filePath, componentName, componentOtherInfo);
        break;
      }
      case 'less': {
        rewriteComponentLess(filePath, componentName, componentOtherInfo);
        break;
      }
      default: break;
    }
  });
};


module.exports = {
  errorMessage,
  checkRepository, // 校验当前项目是否为微信组件库项目
  getComponentNames, // 获取已有组件名称列表
  checkComponentName, // 校验组件名称是否合法
  copyTemplateToRepository, // 复制组件模板到项目
  rewriteComponent, // 修改复制后的内容
}