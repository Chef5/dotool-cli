const chalk = require("chalk");
const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const escodegen = require('escodegen');
const estraverse = require('estraverse');

const config = require('./config');

const log = console.log;

const templateComponentPath = `${__dirname}/template/component`;
const templateExamplePath = `${__dirname}/template/example`;
const currentPath = process.cwd();

const errorMessage = {
  repositoryPathError: `${chalk.red('请切换到组件库根目录下执行')}`,
  componentNameFormatError: `${chalk.red('组件命名不符合规范，请按照规范进行命名')}`,
  componentNameDuplicated: `${chalk.yellow('组件名称重复，请更换其他名称')}`,
  vuePressConfigPathError: `${chalk.red('vuepress配置文件路径错误')}`,
};

/**
 * @description get ast node Expression
 * @param obj object|array
 * @param [type='ObjectExpression'] ObjectExpression|ArrayExpression
 * @returns {*} 
 */
const getNodeExpression = (obj, type = 'ObjectExpression') => {
  const getValue = (val) => {
    // TODO: check Object or other types
    return typeof val === 'string' ? `'${val}'` : val;
  };
  const objStr = Object.entries(obj).reduce((s, [key, val]) => {
    return `${s} ${key}: ${getValue(val)},`
  }, '{') + '}';
  if (objStr.length < 2) {
    throw new Error('getNodeExpression transform obj to objStr fail');
  }
  const ast = esprima.parseScript(`const obj = ${objStr}`);
  let expression = null;
  estraverse.traverse(ast, {
    enter: function (node) {
      if (node?.type === type) {
        expression = node;
        this.break();
      }
    }
  });
  return expression;
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
  const templateFiles = fs.readdirSync(templateComponentPath);
  const componentPath = path.join(currentPath, config.sourceDirectory, componentName);
  try {
    fs.mkdirSync(componentPath);
    templateFiles.forEach(file => {
      const srcFile = path.join(templateComponentPath, file);
      const destFile = path.join(componentPath, file);
      fs.copyFileSync(srcFile, destFile, fs.constants.COPYFILE_EXCL);
    });
  } catch (error) {
    if (fs.existsSync(componentPath)) {
      fs.rmdirSync(componentPath, { force: true });
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
  // TODO: 主题代码
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


const setVuePress = (componentName) => {
  const filePath = path.join(currentPath, config.vuePressConfigPath);
  if (!fs.existsSync(filePath)) {
    throw 'vuePressConfigPathError';
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = esprima.parseScript(code, {
    comment: true,
    tokens: true,
  });
  estraverse.traverse(ast, {
    enter: function (node) {
      if (
        node?.type === 'Property'
        && node?.key.name === 'children'
        && node?.value.type === 'ArrayExpression') {
        node.value.elements = [
          ...node.value.elements,
          {
            type: 'Literal',
            value: `${componentName}/`,
            raw: `"'${componentName}/'"`,
          },
        ];
      }
    }
  });
  const modifiedCode = escodegen.generate(ast, {
    format: {
      indent: { style: '  ' },
      adjustMultilineComment: true,
    },
    comment: true,
  });
  fs.writeFileSync(filePath, modifiedCode, 'utf8');
};

const copyExamplePageToExample = (componentName) => {
  const templateFiles = fs.readdirSync(templateExamplePath);
  const examplePagePath = path.join(currentPath, config.examplePageDirectory, componentName);
  try {
    fs.mkdirSync(examplePagePath);
    templateFiles.forEach(file => {
      const srcFile = path.join(templateExamplePath, file);
      const destFile = path.join(examplePagePath, file);
      fs.copyFileSync(srcFile, destFile, fs.constants.COPYFILE_EXCL);
    });
  } catch (error) {
    if (fs.existsSync(examplePagePath)) {
      fs.rmdirSync(examplePagePath, { force: true });
    }
    throw error;
  }
}
const setExampleAppJson = (componentName) => {
  const filePath = path.join(currentPath, config.exampleRootDirectory, 'app.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`读取 ${filePath} 失败！`);
  }
  const appJson = require(filePath);
  appJson.pages.push(`pages/${componentName}/index`);
  fs.writeFileSync(filePath, JSON.stringify(appJson, null, 2), 'utf8');
};
const setExampleIndexRoute = (componentName, componentOtherInfo) => {
  const filePath = path.join(currentPath, config.examplePageIndexDirectory, 'index.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`读取 ${filePath} 失败！`);
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = esprima.parseScript(code, {
    comment: true,
    tokens: true,
  });
  estraverse.traverse(ast, {
    enter: function (node) {
      if (
        node?.type === 'Property'
        && node?.key.name === 'list'
        && node?.value.type === 'ArrayExpression') {
        node.value.elements = [
          ...node.value.elements,
          getNodeExpression({
            label: componentName,
            value: componentOtherInfo.componentTitle,
            theme: componentOtherInfo.componentTheme,
            path: `/pages/${componentName}/index`,
          })
        ];

      }
    }
  });
  const modifiedCode = escodegen.generate(ast, {
    format: {
      indent: { style: '  ' },
      adjustMultilineComment: true,
    },
    comment: true,
  });
  fs.writeFileSync(filePath, modifiedCode, 'utf8');
};

const rewriteExample = (componentName) => {
  // TODO: 修改js、json、wxml、wxss
  // TODO: 主题示例代码
};
const addExample = (componentName, componentOtherInfo) => {
  // 复制示例代码
  copyExamplePageToExample(componentName);
  // TODO: 修改示例代码
  rewriteExample(componentName);
  // app.json 添加配置
  setExampleAppJson(componentName);
  // pages/index.js 添加跳转路由
  setExampleIndexRoute(componentName, componentOtherInfo);
};


module.exports = {
  errorMessage,
  checkRepository, // 校验当前项目是否为微信组件库项目
  getComponentNames, // 获取已有组件名称列表
  checkComponentName, // 校验组件名称是否合法
  copyTemplateToRepository, // 复制组件模板到项目
  rewriteComponent, // 修改复制后的内容
  setVuePress, // 修改vuepress配置
  addExample, // 添加小程序example预览示例
}