/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   * 定义唯一cid的目的，是保证创建一个包裹的子构造函数，通过原型继承，并且能够缓存他们
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   * 参数是组件的选项,对象
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    // Super是this是Vue构造函数，或者是组件的构造函数
    const Super = this
    const SuperId = Super.cid
    // 从缓存中加载组件的构造函数，如果有就直接返回，没有就初始化成一个空对象{}
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // 获取组件名称，开发环境验证组件名称是否合法
    // 在Vue.component中已经验证过一次，但是Vue.extend在外部可以直接使用，所以这里再验证一次
    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // 如果是开发环境验证组件的名称
      validateComponentName(name)
    }

    // ----------核心代码-------------
    // 创建一个构造函数 VueComponent ,组件对应的构造函数
    const Sub = function VueComponent (options) {
      // 调用_init()初始化
      this._init(options)
    }
    // 改变了构造函数的原型,让其继承自Vue,故所有的组件都继承自Vue
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    //设置cid，后面缓存的时候用
    Sub.cid = cid++
    // 合并 options 选项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 把Super中的成员拷贝到VueComponent构造函数中来
    // 初始化子组件的props，computed
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 静态方法继承
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // 注册Vue.component\Vue.filter\Vue.directive方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 在选项的components中记录自己
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 把组件的构造函数缓存到options._Ctor中
    cachedCtors[SuperId] = Sub
    // 最后返回组件的构造函数VueComponent
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
