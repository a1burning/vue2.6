/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
// 与平台无关的模块，里面是指令和ref模块
import baseModules from 'core/vdom/modules/index'
// 与平台相关的模块，与snabbdom一致，这些模块的作用是操作属性、样式和事件等，与snabbdom不一样的就是transition，过渡动画，那些个模块中都导出了生命周期钩子函数
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
// modules拼接了两个数组，一个是platformModules，一个是baseModules
const modules = platformModules.concat(baseModules)

// 这个函数是通过createPatchFunction函数生成的，这个函数是一个高阶函数，也是一个柯里化函数
// 需要一个对象参数，一个nodeOps，一个modules
export const patch: Function = createPatchFunction({ nodeOps, modules })
