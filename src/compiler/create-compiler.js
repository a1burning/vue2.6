/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  // baseCompile 平台相关options
  // 这个函数返回了一个createCompiler函数
  return function createCompiler (baseOptions: CompilerOptions) {
    // createCompiler在中定义了一个compile函数，用来接收模板和用户传递的选项两个参数
    // 在这个函数中会把与平台相关的选项和用于传入的选项参数进行合并
    // 再调用baseCompile把合并后的选项传递给它
    // 这是通过函数，返回函数的一个目的
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 原型指向了baseOptions，作用是合并baseOptions和compile参数options
      const finalOptions = Object.create(baseOptions)
      // 存储编译过程中存储的错误和信息
      const errors = []
      const tips = []
      //把消息放到对应的数组中
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }

      // 如果options存在的话，开始合并baseOptions和optinos
      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn
      
      //调用baseCompile，传入template和合并之后的选项，
      // 里面将template转化成ast语法树，优化语法树之后将语法树转化成js代码
      // 返回的值是
      /**
       * compiled ： 
       * return {
          ast,
          render: code.render,(js字符串形式的代码)
          staticRenderFns: code.staticRenderFns
        }
       */
      const compiled = baseCompile(template.trim(), finalOptions)
      
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      // 会将errors和tips数组的信息赋值给compiled的属性errors和tips
      compiled.errors = errors
      compiled.tips = tips
      // 将编译好的对象返回
      return compiled
    }

    // 最后返回了compile和compileToFunctions
    // compileToFunctions是createCompileToFunctionFn返回的，这个函数是模板编译的入口
    /**
     * compiled ： 
     * return {
        ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
      }
      */
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
