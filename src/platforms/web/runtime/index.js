/* @flow */
// 导入了一些模块
import Vue from 'core/index'
import config from 'core/config'
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
// 与平台无关的代码
import { devtools, inBrowser } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

// 导入了patch模块
import { patch } from './patch'

// 导入平台相关的指令和组件
// 导入的是v-model和v-show两个指令
import platformDirectives from './directives/index'
// 导入的是 v-transitiom 和 v-transitionGroup 两个组件
import platformComponents from './components/index'

// install platform specific utils
// 给Vue.config中注册了一些方法，这些方法是与平台相关的特定的通用的方法
// 这些方法是在Vue内部使用的，在外部很少去使用
// 感兴趣的话可以看一下下面的模块，里面导入了这些方法
/**
 * import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'
 */
Vue.config.mustUseProp = mustUseProp
// 是否是保留的标签
Vue.config.isReservedTag = isReservedTag
// 是否是保留的属性（传入的参数是否是html中特有的属性）
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
// 通过extend方法注册了一些与平台相关的全局的指令和组件
// extend的作用是把第二个对象的方法成员拷贝到第一个对象的方法成员上

// 注册指令（通过上面导入的模块可以看出是v-model，v-show）
extend(Vue.options.directives, platformDirectives)
// 注册组件（通过上面导入的模块可以看出是v-transition，v-transition-group）
// 这个组件是web平台特有的，并且是全局的
// 我们在全局注册的组件（Vue.components()）都会放到Vue.options.components里面
extend(Vue.options.components, platformComponents)

// install platform patch function
// 在Vue的原型对象上注册了一个patch函数，虚拟DOM中patch函数的功能是把虚拟DOM转换成真实DOM
// 赋值的时候会判断是否是浏览器,inBrowser是判断window类型是否为undefined
// 如果是就直接返回patch函数，如果不是就返回noop函数，noop是一个空函数
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
// 给vue实例增加了一个$mount的方法
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // 内部调用了mountComponent方法,作用是渲染DOM
  return mountComponent(this, el, hydrating)
}

// devtools global hook
// 与调试相关的代码,不关心
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test'
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}
// 最终导出Vue
export default Vue
