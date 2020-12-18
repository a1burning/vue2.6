/* @flow */

import { noop, extend } from 'shared/util'
import { warn as baseWarn, tip } from 'core/util/debug'
import { generateCodeFrame } from './codeframe'

type CompiledFunctionResult = {
  render: Function;
  staticRenderFns: Array<Function>;
};

function createFunction (code, errors) {
  // 通过new Function的形式把字符串代码转换成函数形式
  // 如果失败就把错误进行收集并且返回一个空函数
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}

export function createCompileToFunctionFn (compile: Function): Function {
  // 创建了没有原型的对象，目的为了通过闭包缓存编译之后的结果
  const cache = Object.create(null)

  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    // 将options克隆了一份，是vue实例化传入的options
    options = extend({}, options)
    // 开发环境中在控制台发送警告
    const warn = options.warn || baseWarn
    delete options.warn

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      // detect possible CSP restriction
      try {
        new Function('return 1')
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          )
        }
      }
    }

    // check cache
    // 1. 是否有编译的结果，如果有直接把编译的结果返回，不需要重新编译
    // 这里是用空间换时间，这里的key是把模板作为key
    // options的这个属性只有完整版的才有，只有编译的时候才会使用到
    // 其作用是改变插值表达式使用的符号，插值表达式默认的是使用{{}}
    // 通过这个属性可以把插值表达式所使用的符号改成任意的内容
    // 例如es6的模板字符串，官方文档中有相应的解释
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    // 2. 开始进行编译，把模板和用户传入的选项作为参数
    // 编译结束compiled：{ render, staticRenderFns }，此时的render中存储的是js的字符串形式
    // 这个对象中还有两个辅助的属性，compiled.errors和compiled.tips
    // 在编译模板的过程中，会收集模板中遇到的错误和一些信息
    const compiled = compile(template, options)

    // check compilation errors/tips
    // 在开发环境中，把compiled.errors和compiled.tips遇到的错误和一些信息打印出来
    if (process.env.NODE_ENV !== 'production') {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(e => {
            warn(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            )
          })
        } else {
          warn(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
            vm
          )
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm))
        } else {
          compiled.tips.forEach(msg => tip(msg, vm))
        }
      }
    }

    // turn code into functions
    const res = {}
    const fnGenErrors = []

    // 3. 把字符串形式的js代码转换成js方法
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    // 检查把错误信息打印出来
    if (process.env.NODE_ENV !== 'production') {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        )
      }
    }

    //4. 缓存并返回res对象(render, staticRenderFns)
    return (cache[key] = res)
  }
}
