/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0
// 初始化了Vue实例的成员，并且触发了beforeCreate和created钩子函数，触发$mount渲染整个页面
// 不同的初始化在不同的模块中，结构很清晰，这些代码不需要记住，用到哪些成员回头看即可
export function initMixin (Vue: Class<Component>) {
  // 给 Vue 实例增加 _init()方法
  Vue.prototype._init = function (options?: Object) {
    // 定义一个vm常量指代Vue的实例
    const vm: Component = this
    // 定义uid，唯一标识
    vm._uid = uid++

    // 开发环境下的性能检测，略过
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 标识当前实例是Vue实例，之后做响应式数据的时候不对其进行处理
    vm._isVue = true
    // merge options
    // 合并options，这两个相似的是把用户传入的options和构造函数中的options进行合并
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // 渲染时候的代理对象，实际设置成了Vue实例
    // 在渲染过程的时候会看到这个属性的使用
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化的函数
    // 初始化和生命周期相关的内容
    // $children/$parent/$root/$refs
    // 这个函数中记录了组件之间的父子关系
    initLifecycle(vm)
    // 初始化当前组件的事件
    initEvents(vm)
    // 初始化render中所使用的h函数，初始化了几个属性$slots/$scopedSlots/_c/$createElement/$attrs/$listeners
    initRender(vm)
    // 触发声明周期的钩子函数beforeCreate
    callHook(vm, 'beforeCreate')
    // initInjections与initProvide是一对，实现依赖注入
    initInjections(vm) // resolve injections before data/props
    // 初始化 vm 的 _props/methods/_data/computed/watch
    initState(vm)
    // initProvide函数中，会把父组件提供的成员存储到_provided里面中
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 挂载整个页面
    // 组件中没有el属性，所以组件这里是不执行$mount的
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 基于vue实例vm构造函数中的的options创建当前vm实例的options
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 获取options._parentVnode，即刚才占位的vnode对象
  const parentVnode = options._parentVnode
  // 获取当前子组件的父组件对象
  // 把parent和parentVnode都记录到当前options中
  opts.parent = options.parent
  opts._parentVnode = parentVnode
 
  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
