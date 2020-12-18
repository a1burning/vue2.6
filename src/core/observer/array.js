/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
// 创建一个对象，将原型的对象指向Array.prototype
export const arrayMethods = Object.create(arrayProto)
// 下面的方法都是修改数组元素的方法，当数组进行修改的时候，我们要通知Dep，修改了数组要对视图进行更新，但是原生方法不知道要通知Dep，所以要进行修补
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
// 遍历数组的每一个元素
methodsToPatch.forEach(function (method) {
  // cache original method
  // 从数组原型上获取数组对应的原始方法
  const original = arrayProto[method]
  // 调用Object.defineProperty() 重新定义修改数组的方法
  // 第一个是目标对象arrayMethods，第二个是键method，第三个是值，调用pop/push 的时候传入的参数
  def(arrayMethods, method, function mutator (...args) {
    // 首先会调用数组中原始的方法，并且通过apply改变其内部指向，传入参数args
    const result = original.apply(this, args)
    // 上面因为改变了原数组，所以还需要进行特殊的处理
    // 获取数组对象的 ob 对象，数组关联的Observer对象
    const ob = this.__ob__
    // 定义这个变量用来存储数组中新增的元素
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        // 如果是push和unshift，传入的参数就是新增的元素，直接赋值
        inserted = args
        break
      case 'splice':
        // 如果是splice，其第三个元素是新增的元素，把第三个值存储到inserted中
        inserted = args.slice(2)
        break
    }
    // 如果新增元素存在，就调用observeArray
    // 遍历数组，并把每一个数组的元素，如果是对象的话就转换成响应式对象，
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 找到Observer的dep对象发送通知
    ob.dep.notify()
    return result
  })
})
