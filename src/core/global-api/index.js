/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

// 定义了一个initGlobalAPI函数
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  // 初始化Vue.config静态成员,定义了config属性的描述符
  const configDef = {}
  configDef.get = () => config
  // 如果是开发环境,给config设置值的时候会触发set方法,触发警告不要给Vue.config重新赋值,可以在上面挂载方法
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 利用Object.defineProperty定义Vue.config属性
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // Vue.util里面增加了一些方法
  // 上面给了NOTE:这些方法不能被视作全局API的一部分,除非你已经意识到某些风险,否则不要去依赖他们
  // 意思是我们在调用这些方法的时候可能会出现意外,所以要避免去调用这些方法,vue这么做是其内部要进行使用
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  // 静态方法set/delete/nextTick的定义
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 静态方法observable,这个方法是让对象变成可响应的,设置响应式数据
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }
  
  // 初始化Vue.options中的一些属性
  // 初始化了components/directives/filters
  // 先设置一个空对象,创建改对象的同时设置原型等于null,说明当前不需要原型,可以提高性能
  Vue.options = Object.create(null)
  /**
   * 
   * export const ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ]
   * 遍历数组的名字加s之后挂载到Vue.options下面,这三个属性对应的值都是一个空对象,它们的作用分别是存储全局的组件\指令和过滤器
   * 我们通过Vue.component,Vue.directive,Vue.filter注册的全局组件\指令和过滤器都会存储到Vue.options对应的属性上
   */
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // Vue的构造函数放到了options._base中
  Vue.options._base = Vue

  /**
   * 注册全局组件keep-alive
   * extend
   * 在shared/util.js目录下,extend是实现了浅拷贝,第二个参数的成员拷贝给了第一个参数的成员
   * export function extend (to: Object, _from: ?Object): Object {
      for (const key in _from) {
        to[key] = _from[key]
      }
      return to
    }

    builtInComponents
    名字可以看出来这是一个内置组件,在core/components/index.js目录下,导出的组件其实是KeepAlive
    所以在还注册了内置组件keep-alive
   */
  extend(Vue.options.components, builtInComponents)
  
  /**
   * 方法在core/global-api/use.js
   * 注册 Vue.use() 用来注册插件
   */
  initUse(Vue)
  // 注册 Vue.mixin() 实现混入
  initMixin(Vue)
  // 注册 Vue.extend() 基于传入的options返回一个组件的构造函数
  initExtend(Vue)
  // 注册 Vue.directive()\Vue.component()\Vue.filter()
  initAssetRegisters(Vue)
}
