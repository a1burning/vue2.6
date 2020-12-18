/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

//参数是Vue构造函数
export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   * 没有直接定义而是遍历数组,里面其实就是'component','directive','filter'
   */
  ASSET_TYPES.forEach(type => {
    // 给每个值分别设置一个function
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      // 没有传定义的话会找到之前options中定义的方法直接返回
      // id就是组件名称 or 指令名称
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        // 验证名称是否合法，不合法的话就直接报警告
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        // 判断类型是否是组件,并且定义是否是原始的object
        /**
         * 判断类型是否是组件,且定义是否是原始的Object,判断其转换成字符串是不是'[object Object]'
         */
        if (type === 'component' && isPlainObject(definition)) {
          // 如果设置了组件名称name就用name,如果没有就用id作为组件名称
          definition.name = definition.name || id
          // this.options._base就是Vue构造函数
          // Vue.extend()就是把普通对象转换成了VueComponent构造函数
          // 官方文档中也可以直接传一个Vue.extend构造函数,如果第二个参数definition是Vue.extend的构造函数,那么就直接执行return的最后一句话
          definition = this.options._base.extend(definition)
        }
        // 如果是指令,且是函数的话,会把定义赋值给bind和update两个方法
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // 所有的内容处理之后够会直接挂载到this.options下面去,通过这个注册的是全局的组件\指令等
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
