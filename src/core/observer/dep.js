/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  // 定义了一个静态属性target，其类型是一个Watcher对象
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    // 将Watcher对象添加到Dep的subs数组中
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  // 将观察对象和 watcher 建立依赖
  depend () {
    if (Dep.target) {
      // 如果 target 存在，把 dep 对象添加到 watcher 的依赖中
      // Dep.target就是Watcher对象，要找到Watcher的addDep
      Dep.target.addDep(this)
    }
  }

  // 发布通知
  notify () {
    // stabilize the subscriber list first
    // subs数组是watcher对象数组，这里要进行克隆，下面要进行排序，按照id从小到大进行排序
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      // 按照watcher的创建顺序进行排序，保证执行watcher的顺序是正确的
      subs.sort((a, b) => a.id - b.id)
    }
    // 循环subs数组，
    for (let i = 0, l = subs.length; i < l; i++) {
      // 会调用watcher中的update方法
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// Dep.target 用来存放目前正在使用的watcher对象
// This is globally unique because only one watcher
// 全局唯一，并且同一时间只能有一个watcher被使用
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  // 先把watcher对象存入一个栈中
  // 这个代码的目的是：在Vue2.0以后，每一个组件对应一个watcher对象，因为每个组件都有一个mountComponent函数，每个mountComponent都会创建一个watcher对象，所以每个组件对应一个watcher对象. 如果组件有嵌套的话，如果A组件嵌套了B组件，当渲染A组件的时候，A组件发现还有子组件，于是要先去渲染子组件，此时A组件的渲染就被挂载起来了，所以A组件对应的watcher对象也应该被存储起来，就被存储到targetStack栈中. 当子组件渲染完毕之后，会把他从对应的栈中弹出继续执行父组件的渲染
  targetStack.push(target)
  //target就是传入的Watcher对象
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
