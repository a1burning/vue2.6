/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  // 根据id获取DOM元素并返回其innerHTML
  const el = query(id)
  return el && el.innerHTML
})

// 将原来的$mount函数存到一个变量中，对原来的$mount方法进行template转化成render函数的操作
const mount = Vue.prototype.$mount
// 这个方法是挂载，把DOM挂载到页面上
Vue.prototype.$mount = function (
  el?: string | Element,
  // 非 ssr 情况下为 false，ssr 时候为 true
  hydrating?: boolean
): Component {
  // 获取 el 对象
  el = el && query(el)

  /* istanbul ignore if */
  // 判断el不能是body或者html DOM元素，只能是普通元素进行挂载，并返回这个元素
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 判断选项中是否有render，如果没有render，就取template选项，进行转化
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 把 template 转换成 redner 函数
      // staticRenderFns是一个数组
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      // 将render和staticRenderFns记录到对应的options属性中
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 如果有render选项就调用mount方法
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  // 如果el里面有outerHTML属性就直接返回作为模板
  if (el.outerHTML) {
    return el.outerHTML
  // 如果不是的话可能不是一个DOM元素，可能是一个文本节点或者一个注释节点
  } else {
    // 创建一个div，将el克隆一份放到div里面，最终把其innerHTML返回作为模板
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

// 定义了一个新的静态方法compile，将html字符串编译成render函数
Vue.compile = compileToFunctions
// 最终将其导出
export default Vue
