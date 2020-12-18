/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// createCompiler也是通过一个函数返回，传入baseCompile函数，这个是核心函数
// createCompiler内部return了
/**
 *
  compiled ： 
    return {
      ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  createCompileToFunctionFn：compileToFunctions
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
 */
export const createCompiler = createCompilerCreator(function baseCompile (
  //baseCompile接收模板和合并后的选项参数
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 里面做了三件事情
  // 1.把模板转换成 ast 抽象语法树
  // 抽象语法树，用树形的方式描述代码结构

    //parse函数接收两个参数，一个是模板字符串，去除了前后空格，和合并后的选项，返回一个ast对象
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // 2.优化抽象语法树
    optimize(ast, options)
  }
  // 3.把抽象语法树生成字符串形式的js代码
  const code = generate(ast, options)
  // 将render和staticRenderFns返回
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
