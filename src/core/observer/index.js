/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

// 获取arrayMethods中'push','pop','shift','unshift','splice','sort','reverse'等改变原数组的方法名称，是个数组
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * Observer类被附加到每一个被观察的对象
 * object. Once attached, the observer converts the target
 * 一旦附加，会转换对象的所有属性
 * object's property keys into getter/setters that
 * 将其转换成getter和setter
 * collect dependencies and dispatch updates.
 * 用来收集依赖和派发更新
 */
export class Observer {
  // flow的语法，把属性定义在类的最上面
  // 观测对象
  value: any;
  // 依赖对象
  dep: Dep;
  // 实例计算器
  vmCount: number; // number of vms that have this object as root $data

  constructor (value: any) {
    // 被观察的对象
    this.value = value
    //Observer对象都有一个dep属性，里面的值是Dep对象
    this.dep = new Dep()
    this.vmCount = 0
    // 使用def函数，给value对象设置了__ob__属性，把Observer对象记录下来
    // 在observe中函数中判断的__ob__就是在这里定义的
    // def是对Object.defineProperty做了一个封装
    def(value, '__ob__', this)
    // 核心核心核心
    // 判断是否是数组
    if (Array.isArray(value)) {
      /**
       * 这里是处理浏览器的兼容性问题，判断当前对象中是否有__proto__，即当前浏览器是否支持对象原型属性
       * export const hasProto = '__proto__' in {}
       */
      if (hasProto) {
        /**
         * 这个函数接收两个参数，第一个参数value是当前对象，第二个参数是数组对应的方法
         * 这个函数的作用是重新设置数组的原型属性等于第二个参数，修补了一些数组的方法(新增对象的响应式转换，让其dep对象发送通知)
         * 其原型指向了数组Array构造函数的原型
         */
        protoAugment(value, arrayMethods)
      } else {
        /**
         * 前两个参数一样
         * 第三个参数arrayKeys获取arrayMethods中改变原数组的方法名称，是个数组
         * const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
         */
        copyAugment(value, arrayMethods, arrayKeys)
      }
      //
      this.observeArray(value)
    // 如果是对象就调用其walk  
    /**
     *  walk (obj: Object) {
          const keys = Object.keys(obj)
          for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
          }
        }
     */
    // 遍历对象中的的每一个属性，用defineReactive方法转换成哼setter和getter
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   * 对数组做响应式处理
   */
  observeArray (items: Array<any>) {
    // 便利数组中的所有成员，如果成员是对象的话就转化成响应式对象
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 * 重新设置数组的原型属性等于第二个参数
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
// 先去遍历之前拿到的修改数组的名称keys，找到keys对应的函数，调用def给当前对象定义之前修改的方法
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * 试图为value创建一个observer对象
 * returns the new observer if successfully observed,
 * 如果创建成功会把observe对象返回
 * or the existing observer if the value already has one.
 * 或者返回一个已存在的observe对象
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 判断value是否是一个对象或者是否是VNode的实例
  // 如果不是对象或者是VNode的实例，就不需要进行响应式处理，会直接返回
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  // ob 是 Observer的实例
  let ob: Observer | void
  // 判断value中是否有__ob__这个属性
  // 如果有的话还要判断__ob__是否是Observer的实例
  // 如果条件成立就把那个赋值给ob变量
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // 判断是否可以进行响应式处理
    // 判断value是否是数组或者是一个纯object对象
    // 判断value是否是Vue实例!value._isVue，如果是vue实例那么不需要进行响应式处理
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 最最最核心
    // 如果可以进行响应式处理，就创建一个Observer对象，就把value的所有属性转换成setter和getter
    ob = new Observer(value)
  }
  // 如果传入的是根数据，那么vmCount要进行++，计数
  if (asRootData && ob) {
    ob.vmCount++
  }
  // 最终将Observer实例对象返回
  return ob
}

/**
 * Define a reactive property on an Object.
 * 为一个对象定义一个响应式的属性
 */
export function defineReactive (
  obj: Object, // 目标对象
  key: string, // 设置的属性
  val: any, // 值
  // 下面都是可选参数
    // 用户自定义的setter函数，很少会用到 
    customSetter?: ?Function,
    // 浅的意思，如果为true则只监听其第一层的属性
    // 如果是false，那就要深度监听
    shallow?: boolean
) {
  // 创建Dep对象，负责为当前属性收集依赖，也就是收集观察当前属性的所有Watcher
  const dep = new Dep()
  // 获取当前对象的属性描述符，在属性描述符中可以定义set，get和configurable(是否可配置)
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 如果当前属性能获取到，还不可配置，就返回
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 获取属性描述符中的set和get，因为这个属性是用户传入的，可能用户在传入之前已经设置了get和set，
  // 所以要把用户设置的get和set取出来，后来有取重写get和set方法，给get和set增加依赖收集和派发更新的功能.
  const getter = property && property.get
  const setter = property && property.set
  // 特殊情况的判断，如果传递的参数个数是两个，那么value就是obj[key]去获取
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 如果shallow是false，是深度监听，此时会调用observe
  // 如果当前属性的值val是对象的话，会通过observe去监听val对象的所有属性，去转换getter和setter
  let childOb = !shallow && observe(val)
  // 调用 Object.defineProperty 将对象转换成getter和setter
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举
    configurable: true, // 可配置
    get: function reactiveGetter () {
      // 首先去调用了用户传入的getter获取值，如果没有就直接获取值
      const value = getter ? getter.call(obj) : val
      // 收集依赖
      // 当我们访问这个值的时候会进行依赖收集，依赖收集就是将依赖该属性的 Watcher 对象添加到Dep对象的sub数组中，将来数据发生变化的时候，通知所有的Watcher
      // 先判断这个Dep中是否有target静态属性，target这个属性中存储的是Watcher对象
      if (Dep.target) {
        // 核心核心
        // 如果有的话就调用dep的depend方法，这个depend方法的作用就是进行依赖收集，就是把当前的Watcher对象添加到dep的subs数组中
        dep.depend()
        // 判断 childOb 子对象是否存在，childOb是Observer对象
        if (childOb) {
          // 每一个Observer对象都有一个dep的属性，这里用dep的depend方法，让子对象收集依赖

          // 这里有两个dep，一个是当前函数中创建的dep对象，作用是为了给当前对象的属性收集依赖，还有一个dep是Observer对象中的属性dep，是为当前子对象收集依赖
          /**
           * 当属性变化的时候要发送通知，为什么这里要给子对象添加依赖?
           *  当子对象中添加成员或者删除成员的时候也需要发送通知去更新视图，这句话的目的是给子对象添加依赖，当子对象的成员发生添加或者删除的时候，可以发送通知
           * 
           * childOb什么时候发送通知呢?将来看$set和$delete的时候再解释
           */
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // 如果预定义 getter 存在就让 value 等于 getter 调用的返回值，否则直接赋予属性值
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 判断新值和旧值是否相等，|| 后面的其实是针对NaN的情况即新旧值都不为NaN
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      // 如果没有setter直接返回，说明是只读的
      if (getter && !setter) return
      // 如果setter存在就调用setter给属性赋值
      if (setter) {
        setter.call(obj, newVal)
      } else {
      // getter和setter都不存在的时候，直接把新值赋值给旧值  
        val = newVal
      }
      // 如果是深度监听，就调用observe方法，其内部会判断如果新值是对象的话，把新值的属性转化成getter和setter
      // childOb是Observer对象，是observe方法返回的
      childOb = !shallow && observe(newVal)
      // 派发更新(发布更改通知)
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 判断传入的目标对象是否是undefined或者是原始值，不允许给undefined或者原始值添加响应式属性，会发送警告
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 判断target对象是否是数组，并且key是合法的索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 比较key和数组的length属性谁大，然后赋值给length属性，调用$set的时候数组可能会超过length属性
    target.length = Math.max(target.length, key)
    // 调用splice方法进行替换，这个不是数组的原生方法，是之前修改过的splice方法
    target.splice(key, 1, val)
    return val
  }
  // 处理对象属性
  // 判断处理的属性在对象中已经存在，并且这个属性不是Object原型上的成员，就直接赋值，不需要进行响应式处理
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取target的__ob__属性，判断其是不是vm或者是$data，是的话抛出警告
  // $data的话ob.vmCount是1
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 判断ob对象是否存在，如果不存在说明target不是响应式对象，如果target不是响应式对象，那么传入的属性也不必做响应式处理，直接赋值返回
  if (!ob) {
    target[key] = val
    return val
  }

  // 如果ob存在，就把属性设置成响应式属性，ob.value即target
  defineReactive(ob.value, key, val)
  // 还要发送通知
  // 可以这么做是我们在收集依赖的时候，给每一个子对象都创建了childObj，并且给childObj的dep也收集了依赖
  // 因为那个收集了依赖，所以这里可以发送通知
  ob.dep.notify()
  // 最后将值返回
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  // 判断当前target是否是undefined或者是原始值，如果是就发出警告
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 判断target是否是数组，索引是否有效
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 使用splice方法修改，不传第三个方法就是删除指定元素
    // 里面会去更新通知
    target.splice(key, 1)
    return
  }
  // 如果target是对象就会获取ob对象
  const ob = (target: any).__ob__
  // 判断是不是vue是和$data对象，是就会发送警告
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  // 判断当前对象中是否有key属性，key不能是继承来的，如果没有直接返回
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性
  delete target[key]
  // 如果ob不存在，说明不是响应式数据，直接返回
  if (!ob) {
    return
  }
  // 发送通知更新视图
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
