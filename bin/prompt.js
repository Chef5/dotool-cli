const inquirer = require('inquirer');
const config = require('./config');

const questions = {
  componentName: {
    name: 'componentName',
    type: 'input',
    message: '组件命名（kebab-case）:',
    validate: (t) => config.componentNameRegex.test(t) || '组件命名不符合规范，请按照规范进行命名',
  },
  componentTitle: {
    name: 'componentTitle',
    type: 'input',
    default: '组件名称',
    message: '组件中文名称:',
  },
  componentDescription: {
    name: 'componentDescription',
    type: 'input',
    default: '组件简介',
    message: '请组件简介:',
  },
  componentTheme: {
    name: 'componentTheme',
    type: 'confirm',
    default: false,
    message: '是否支持主题切换:',
  },
};

const getAnswerName = async () => {
  const { componentName } = await inquirer.prompt([questions.componentName]);
  return componentName;
}

const getAnswerComponentOtherInfo = async () => {
  return await inquirer.prompt([
    questions.componentTitle,
    questions.componentDescription,
    questions.componentTheme,
  ]);
}

module.exports = {
  getAnswerName,
  getAnswerComponentOtherInfo,
}