/* @flow */
/* globals MutationObserver */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = []
let pending = false

function flushCallbacks () {
  // 先将pending设置为false，表示处理已经结束
  pending = false
  // 将callbacks数据备份一份之后将callbacks数组清空
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 然后将备份的callbacks数组进行遍历调用
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// ios大于等于9.3.3是不会使用promise，会存在潜在的问题，所以会降级成setTimeout
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */

// 如果Promise对象存在就调用timerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 定义一个promise对象，让promise对象去处理flushCallbacks，使用微任务的形式去处理，是在本次同步任务循环之后开始执行微任务
  // nextTick的作用是获取DOM上最新的数据，当微任务执行的时候，DOM元素还没有渲染到浏览器上，此时如何获取值的呢?
  // 当nextTick里的回调函数执行之前，数据已经被改变了，当重新改变这个数据的时候，其实会立即发送通知，通知watcher渲染视图.在watcher中会先把DOM上的数据进行更新，即更改DOM树
  // 至于这个DOM什么时候更新到浏览器，是在当前这次事件循环结束之后才会执行DOM的更新操作
  // nextTick内部如果使用promise的话，即微任务的话，其实在获取微任务的时候，是从DOM树上直接获取数据的，此时的DOM还没有渲染到浏览器上
  // nextTick中优先使用微任务
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    // ios大于等于9.3.3是不会使用promise，会存在潜在的问题，所以会降级成setTimeout
    if (isIOS) setTimeout(noop)
  }
  // 标记nextTick使用的是微任务
  isUsingMicroTask = true
// 判断当前不是IE浏览器并且支持MutationObserver
// MutationObserver对象的作用是监听DOM对象的改变，如果改变之后会执行一个回调函数，这个函数也是以微任务的形式执行
// MutationObserver这个对象在IE10和IE11中才支持，并在11中又不是完全支持，有些小问题
// 这里兼容的是PhantomJS, iOS7, Android 4.4这些浏览器
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
// 如果不支持Pormise也不支持MutationObserver，就会降级成setImmediate
// 类似定时器，与setTimeout的区别在于这个只有两个地方支持，一个是IE浏览器，一个是nodejs
// 那为啥不用优先用setImmediate，因为他的性能比setTimeout好，setTimeout虽然写的是0，最快也要等4毫秒才去执行，而setImmediate会立即执行
// 在nodejs中打印，setImmediate始终在setTimeout之前执行
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  // 虽然这里写的是0，最快也要等4毫秒才去执行setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 第一个是回调函数，可选
// 第二个是上下文，就是Vue实例，可选
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // callback是数组，里面存了所有的回调函数，往数组中push了回调函数的调用
  callbacks.push(() => {
    // 如果用户传了cb回调函数，因为用户传递的要进行错误判断
    // 如果没有传递cb就判断_resolve，_resolve有值就直接调用_resolve，这个_resolve就是下面的代码中，接收promise传进来的resolve
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 判断队列是否正在被处理，如果没有被处理，就进入
  if (!pending) {
    // 设置当前队列正在被处理
    pending = true
    // 这个函数就是遍历所有的callback数组，然后执行每一个callback函数
    timerFunc()
  }
  // $flow-disable-line
  // 如果没有cb且Promise对象存在就将返回的reslove设置给_resolve
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
