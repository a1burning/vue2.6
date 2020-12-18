import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'
// 为什么不用类创建而用构造函数创建Vue
// 此处不用 class 的原因是因为方便后续给Vue实例混入实例成员,如果用了class再用原型,很不搭.

// 定义Vue构造函数,接收一个参数options
function Vue (options) {
  // 判断环境,如果是开发环境,且this不是Vue的实例,说明没有用new Vue去调用构造函数,会报出警告
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init() 方法
  this._init(options)
}
// 注册 vm  的 _init()方法, 初始化vm
initMixin(Vue)
// 继续混入 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 初始化事件相关方法
eventsMixin(Vue)
// 混入生命周期相关的方法
// _update/$forceUpdate/$destory
lifecycleMixin(Vue)
// 混入 render
// $nextTick/_render
renderMixin(Vue)

export default Vue
