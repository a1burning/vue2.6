/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  // 注册get，set
  // 获取的时候是this._props[属性名称] or this._data[属性名称]返回值
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }   
  // target是Vue实例，将key注入到实例中
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  // 获取了实例中的$options
  // 判断props，methods，data，computed，watch这些属性，如果有就用init进行初始化
  const opts = vm.$options
  // initProps：把props数据转换成响应式数据并且注入到Vue实例中
  if (opts.props) initProps(vm, opts.props)
  // initMethods：初始化了选项中的methods，在注入之前判断了方法名称和值
  if (opts.methods) initMethods(vm, opts.methods)
  // 如果参数中有data就执行initData
  // 如果参数中没有data就在vm初始化一个_data并赋值一个空对象，并且进行响应式处理
  if (opts.data) {
    //initData：初始化选项中的data，注入到Vue实例中，注入之前进行重名判断.并且将data进行响应式处理
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  // 初始化计算属性和侦听器，注入到Vue实例中
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  // 定义了一个_props对象并存到props常量中
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  // 遍历propsOptions(vm.$options.props)的所有属性，将属性都通过defineReactive转换成 get\set 注入到props(vm._props)里面
  // 所有的成员都会再_props里面存储
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // vm.$options.props判断是否在Vue实例中存在，如果不存在通过proxy方法把属性注入到Vue实例中
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}

function initData (vm: Component) {
  // 获取options中的data选项
  let data = vm.$options.data
  // 判断data是否是function，如果是就调用getData，该函数内部核心数据是用call调用data
  // 当组件中初始化data的时候会设置成一个函数
  // 如果是Vue实例中的data是一个对象，并没有传入就初始化一个空对象
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  // 接下来获取了data中的所有属性，还获取了props和methods的所有属性，目的也是判断data中的成员是否与props和methods重名.如果有就发送警告.
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    // 如果不是_或者$开头，就会把属性注入到Vue实例中，
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 把data转化成响应式对象
  // 第一个参数是选项options中的data
  // 第二个参数是根数据
  observe(data, true /* asRootData */)
}

export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  pushTarget()
  try {
    // 此时的data是一个函数，通过call调用data
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}

const computedWatcherOptions = { lazy: true }

function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  // 定义了一个私有属性，里面存储的是一个键值对的形式，键是计算属性的名字，值就是计算属性对应的function
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  // 判断当前环境是否是服务端渲染的环境
  const isSSR = isServerRendering()
  // 遍历用户定义的计算属性 computed：{ a: function () {}, b: { get: ..., set: ...}}
  // 值可能是函数，也可能是对象
  for (const key in computed) {
    // 获取计算属性的值
    const userDef = computed[key]
    // 判断是不是function，如果不是就调用其get方法
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }
    // 如果不是服务端渲染，就会创建一个watcher对象，并且记录到刚才的vm._computedWatchers变量中
    if (!isSSR) {
      // create internal watcher for the computed property.
      // 第一个参数是Vue实例，第二个参数是计算属性对应的function，第三个参数侦听器里面用到的，第四个参数是开始的时候不立即执行
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions // { lazy: true }
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    // 如果vm上没有当前计算属性的名字，则在vm上定义该计算属性，否则如果是开发环境发送警告
    // 在初始化计算属性的时候，已经初始化了props，datas，methods，如果上面有key就已经发生了冲突
    if (!(key in vm)) {
      // 没有就执行这个函数，并把vue实例，key和值都传进去
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

// 把计算属性定义到vue的实例上
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  // 如果不是服务端渲染的环境，应该就是去缓存的
  const shouldCache = !isServerRendering()
  // 判断用户传入的是对象还是function，用于去设置当前属性的描述符，get和set的值
  if (typeof userDef === 'function') {
    // 核心函数
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  // 给vue实例增加计算属性的名字
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  return function computedGetter () {
    // 获取该计算属性对应的watcher对象
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // 这个位置起到缓存的作用
      // 第一次访问计算属性的时候，dirty为true执行evaluate获取计算属性的值，并把dirty设为false，
      /**
       *   evaluate () {
            this.value = this.get()
            this.dirty = false
          }
       */
      // 当再次访问计算属性，没有发生变化，dirty的值如果依然为false，不执行evaluate，直接返回watcher.value
      // 当数据改变之后会调用 watcher 的 update 方法，把dirty改变为true，下次访问就会访问新的值
      /**
       * update () {
            if (this.lazy) {
              this.dirty = true
            } else if (this.sync) {
              this.run()
            } else {
              queueWatcher(this)
            }
          }
       */
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm: Component, methods: Object) {
  // 获取选项中的$options.props，这里为什么要获取props是为了下面名称重复排查需要
  const props = vm.$options.props
  // 遍历methods中的所有属性(方法名称)
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      // 如果是开发环境判断methods值是否是function，如果不是function就会发送警告
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // 当前方法名称是否在props中存在，会警告此名称已经在props中存在，因为最终props和methods都要注入到Vue的实例上，所以他们不能有同名存在.
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // 判断方法名称是否在vue中存在，并且判断该名称是否以_或者$开头
      // 如果以下划线开头，那Vue认为这是一个私有属性，不建议这样命名
      // 如果以$开头，公认为Vue提供的成员，也不建议这样命名
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 最后将methods值注入到Vue实例中来，先判断这个值是否是function，如果不是就直接返回一个noop空函数，如果是就返回该函数的bind方法，bind方法是改变this指向
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm: Component, watch: Object) {
  // 遍历用户传入的watch的属性，这里是user
  for (const key in watch) {
    // 获取watch的值，可以是数组，也可以是对象，函数
    const handler = watch[key]
    // 如果是数组，就对元素进行遍历，每一个元素都创建watcher，当这个属性变化的时候，会执行多个回调
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    // 如果不是数组，直接执行createWatcher
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (
  // Vue实例，对应属性，和handler
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // 先判断handler是否是一个原生对象
  if (isPlainObject(handler)) {
    options = handler
    // 真正的handler，回调函数
    handler = handler.handler
  }
  // 判断handler是否是字符串，如果是字符串就会去实例对象上找，也就是methods中定义的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  // 将解析好的数据给$watch
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  // 定义描述符,get方法返回实例对象的_data,_props
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  // 如果是开发环境下,不允许给$data和$props赋值
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  // 通过Object.defineProperty给原型上添加$data,$props
  // 后面是两个对象的描述符,上面给描述符定义了get方法
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  // 在原型是挂载了$set和$delete,这个与Vue.set\Vue.delete是一模一样的
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  //原型上挂载了$watch,监视数据的变化，和在选项中配置watch是一样的
  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    // 获取当前实例，没有对应的静态方法，因为其用到了vue的实例
    const vm: Component = this
    // 判断回调函数是否是原生对象，如果是继续放到createWatcher中，这里要保证回调函数是函数
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 把当前watch的属性赋值，如果没有赋值空对象
    options = options || {}
    // 标记为用户watcher，侦听器
    options.user = true
    // 创建用户watcher对象，expOrFn是侦听器的名字，即监听的属性，cb就是handler
    // options里面传的就是deep和immediate
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // 判断选项中是否要立即执行
    if (options.immediate) {
      try {
        // 如果是就立刻调用回调函数，使用call改变其内部指向为vue实例，并将值返回
        // 使用try-catch是不确定我们传入的代码是否安全，不要阻塞之后的代码执行，
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    // 返回取消监听的方法
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
