/* @flow */

import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import {
  warn,
  nextTick,
  devtools,
  inBrowser,
  isIE
} from '../util/index'

export const MAX_UPDATE_COUNT = 100

const queue: Array<Watcher> = []
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {}
let circular: { [key: number]: number } = {}
let waiting = false
let flushing = false
let index = 0

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
export let currentFlushTimestamp = 0

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  // 标记true，表示正在处理队列
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // This ensures that:
  // 为了保证下面三点内容：
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 组件被更新的顺序是从父组件到子组件，因为先创建的父组件，后创建的子组件
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 组建的用户watcher要在其对应的渲染watcher之前运行，因为用户watcher是在渲染watcher之前创建的
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 如果一个组件在父组件执行之前被销毁了，那应该跳过

  // 先对queue进行id的从小到大排序，即watcher的创建顺序
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 遍历queue中的所有watcher，不要缓存lenth，因为watcher在执行的过程中在队列中可能会加入新的watcher
  for (index = 0; index < queue.length; index++) {
    // 获取watcher，判断其是否有before函数，有before函数是在渲染watcher中才有的，触发钩子函数beforeUpdate
    watcher = queue[index]
    if (watcher.before) {
      watcher.before()
    }
    // 获取watcher的id，将其处理为null，下次调用的时候还能正常被运行
    id = watcher.id
    has[id] = null
    // 调用watcher的run方法
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()

  resetSchedulerState()

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
// 接收一个参数，watcher对象
export function queueWatcher (watcher: Watcher) {
  // 获取watcher对象的id
  const id = watcher.id
  // 判断has[id]，has是个对象，如果是null说明watcher没有被处理，防止重复处理
  if (has[id] == null) {
    // 标识已经处理过了
    has[id] = true
    // 这段代码的功能是将watcher对象添加到队列中

    // flushing是正在刷新的意思，如果其为true说明队列正在被处理，队列queue就是watcher对象，是watcher对象正在被处理
    // 判断队列没有被处理的时候，将watcher直接放到队列的末尾中
    if (!flushing) {
      queue.push(watcher)
    } else {
      // 如果这个队列正在被处理
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 获取队列的长度
      let i = queue.length - 1
      // index是处理到了队列的第几个元素，i > index 表示该队列还没有被处理完，就获取队列中的watcher对象，判断id是否大于当前正在处理的id，如果大于就将i--
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      // 这样就把处理的watcher放到了合适的位置中
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    // 判断当前队列是否被执行，如果没有被执行就进入
    if (!waiting) {
      waiting = true
      // 如果是开发环境的话，就直接执行flushSchedulerQueue函数，如果是生产环境，将flushSchedulerQueue传给nextTick
      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 这个函数会遍历所有的watcher，并调用watcher的run方法
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
