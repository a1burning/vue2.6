/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 * 判断参数是字符串还是DOM元素，如果是DOM元素直接返回，
 * 如果是字符串这说明是选择器，要通过querySelector找到对应的DOM元素
 */
export function query (el: string | Element): Element {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    // 如果这个DOM对象不存在就判断是开发环境就在控制台打印找不到元素，并返回一个空的div对象
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}
