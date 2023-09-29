#!/usr/bin/env node
const package = require('../package');
const program = require('commander');
const chalk = require("chalk");
const ora = require('ora');
const libs = require('./libs');

const prompt = require('./prompt');

const log = console.log;

// TODO: use dependencies
// small
const verStr = [
    `    _     _            _      _ _ `,
    ` __| |___| |_ ___  ___| |  __| (_)`,
    `/ _\` / _ \\  _/ _ \\/ _ \\ | / _| | |`,
    `\\__,_\\___/\\__\\___/\\___/_| \\__|_|_|`,
    '',
    package.description,
    '',
    `version: ${chalk.green(package.version)}`
  ].join('\n')

program
  .name('dotool')
  .usage('[command]')
  .description(`${package.description}`)
  .helpOption('-h, --help', '显示帮助')
  .addHelpCommand('help [command]', '显示帮助')
  .addHelpText('after', `\nExamples: 
  dotool create componentName 新建组件
  dotool -n componentName`)
  .version(verStr, '-V,--version', '查看版本')

program.command('create', { isDefault: true })
  .description('新建组件')
  .option('-n, --name <char>', '组件命名', '')
  .action(async (options) => {
    let { name } = options;
    try {
      // 校验当前项目是否为微信组件库项目
      libs.checkRepository();
      // 校验需要创建的组件名称是否合法
      if (!name) {
        name = await prompt.getAnswerName();
      }
      libs.checkComponentName(name);
      // 获取其他组件信息
      const componentOtherInfo = await prompt.getAnswerComponentOtherInfo();
      // 复制模板到项目
      libs.copyTemplateToRepository(name);
      // 修改复制后的内容
      libs.rewriteComponent(name, componentOtherInfo);
      // 修改.vuepress/config 配置
      libs.setVuePress(name);
      // 添加小程序示例代码
      libs.addExample(name, componentOtherInfo);
      log(`create ${name} success`)
    } catch (error) {
      log(libs.errorMessage[error] || error);
    }
  });

program.parse();
