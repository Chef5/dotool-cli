const fs = require('fs');
const esprima = require('esprima');
const estraverse = require('estraverse');

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

/**
 * @description {key} will be replaced by params: { key: value }
 * @param template
 * @param params
 * @returns {*} 
 */
const mapReplace = (template, params) => {
  return template.replace(/\{(.+?)\}/g, (result, key) => {
    return params[key] || result || '';
  })
}

module.exports = {
  getNodeExpression,
  mapReplace,
}