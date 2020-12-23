/* @flow */

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError,
  noop
} from '../util/index'

import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import type { SimpleSet } from '../util/index'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    // 是否是渲染Watcher，有三种Watcher
    /**
     * watcher有三种
     * - 第一种是渲染Watcher，当前的Watcher
     * - 计算属性的Watcher
     * - 侦听器的Watcher
     */
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    // 判断是不是渲染watcher，如果是就把当前watcher记录到实例的_watcher中
    if (isRenderWatcher) {
      vm._watcher = this
    }
    // 记录到_watchers中，这里面的watcher不仅仅是渲染watcher，还有计算属性watcher和侦听器的watcher
    vm._watchers.push(this)
    // options
    // 这些选项都与渲染watcher无关，默认这些值都是false，非渲染的watcher会传入一些选项
    if (options) {
      this.deep = !!options.deep
      // 用户的user会将这个设置为true
      this.user = !!options.user
      // lazy 延迟执行，watcher要更新视图，那lazy就是是否延迟更新视图，当前是首次渲染要立即更新所以值是false，如果是计算属性的话是true，当数据发生变化之后才去更新视图
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      // 传入的before函数，会触发生命周期的beforeUpdate
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    // cb是构造函数的第三个参数，渲染参数是noop空函数，当用watcher的时候会传入一个回调，会对比新旧两个值
    this.cb = cb
    // watcher唯一标识
    this.id = ++uid // uid for batching
    // 标识当前watcher是否是活动的
    this.active = true
    // 开始让lazy的值给dirty
    this.dirty = this.lazy // for lazy watchers
    // 记录与watcher相关的dep对象
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    // 第二个参数如果是function就直接把变量赋值给getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      // 如果是字符串的话要进一步处理，如何处理先不关注，如果是侦听器的话第二个参数传入的就是字符串
      // 例如：watch:{ 'person': function ...}
      // parsePath这个函数的作用是生成一个函数来获取属性的值，将这个函数返回的新函数记录到getter中
      // 此时的getter是一个函数，这个函数的作用是返回属性结果，获取属性 person 的值，触发了这个属性的getter，触发 getter 的时候会去收集依赖
      // 此时并没有执行而是记录下来了
      this.getter = parsePath(expOrFn)
      // 做了一些错误的处理，开发环境getter不存在就会有警告
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // 给this.value赋值，先判断this.lazy，如果当前不要求延迟执行就立即执行get方法
    // this.lazy如果是计算属性的watcher是true，延迟执行，其他watcher是false立即执行
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    // 调用pushTarget，将当前的Watcher对象放入栈中
    // 每个组件对应一个Watcher，Watcher会去渲染视图，如果组件有嵌套的话会先渲染内部的组件，所以要将父组件的Watcher先保存起来，这是这个pushTarget的作用
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 最关键的一句话
      // 这句话调用了getter，getter存储的是传入的第二个参数，且是函数，首次渲染是updateComponent，所以在get方法的内部调用了updateComponent，并且改变了函数内部的this指向到Vue实例vm，并且传入了vm
      // 这里将虚拟DOM转化成了真实DOM并更新到页面中

      // 如果是用户watcher的话，这个getter是获取属性的，如果在获取属性的时候有异常，下面会处理异常，这里不看
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
      // 执行完毕之后会进行清理工作
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      // 将watcher从栈中弹出
      popTarget()
      // 会把当前watcher会从dep.subs数组中移除，把watcher里面的dep也移除
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  // 接收参数dep对象
  addDep (dep: Dep) {
    // 获取Dep的id，每创建一个dep都会让id++，是唯一标识
    const id = dep.id
    // 当前是否已经存储了Dep对象，如果没有就将id和其对应的dep对象存储到内部的集合中
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        // 最后会将watcher对象添加到dep对象的sub中
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    // 渲染watcher中，lazy和sync是false，会执行queueWatcher
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    // 标记当前watcher是否是存活的状态，默认为true，可处理
    if (this.active) {
      // 调用其get方法，如果是渲染watcher会调用getter，执行updateComponent方法渲染DOM更新页面
      // 之后用value记录返回结果，如果是渲染watcher没有返回结果，value是undefined，渲染函数的cb是noop空函数.
      // 如果是用户watcher，继续执行，获取旧值记录新值，调用cb回调函数，侦听器的function就是回调函数，
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          // 如果是用户watcher，添加异常处理
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          // 如果是其他watcher，直接调用
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
