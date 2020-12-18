/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
export function createElement (
  // 传入的是vue实例
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 处理参数，如果data是数组或者是原始值，其实data是children
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    // 将data赋值给children，将自己变成undefined
    children = data
    data = undefined
  }
  // 用户传入的render函数，这个值是false
  // 用来处理children参数
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE // 常量 2
  }
  // 这个函数中创建了VNode
  return _createElement(context, tag, data, children, normalizationType)
}

// 创建VNode
// 这里和snabbdom有所不同，因为里面处理了组件和其他的内容
export function _createElement (
  // Vue实例或者组件实例
  context: Component,
  // 可以是标签名臣个，可以是组件、函数、对象
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // 如果是data存在且是响应式数据会警告避免使用响应式数据，并且返回一个空的VNode
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // 如果data中有is属性，会记录到tag中
  // 这个会把is后面的组件名称，找到对应组件渲染到component中
  // <component v-bind:is="currentTabComponent"></component>
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  // tag变量如果是false，is指令就是false，会返回一个空的VNode节点
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // 判断是否有key，或者key不是原始值就会报警告，key应该是字符串和数字
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  // 这里处理作用域插槽，跳过
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }

  // 判断render函数类型，分别将多维数组转化为一维数组
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 如果是用户传递的render函数就调用normalizeChildren，对children变量进行处理
    children = normalizeChildren(children)
    // 如果是渲染器生成的render就调用simpleNormalizeChildren
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  // 核心 创建VNode对象
  let vnode, ns
  // 1. 判断tag是否是字符串
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 1.1 判断是否是html的保留标签，直接创建VNode
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      // 创建VNode
      // config.parsePlatformTagName(tag)是tag标签
      // context是vue实例
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    // 1.2 如果tag存在，是字符串，且不是html保留标签
    //     就判断data是否存在，或者data的pre是否存在，如果存在，就通过一个函数获取对应的组件
    //     会获取选项中的components，所有组件，通过组件的名称取得当前组件
    //     调用这个函数的目的是对当前组件的，名称进行处理
    //     这里主要是判断是否是自定义组件，这里先跳过
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 获取组件，通过createComponent创建组件对应的VNode对象
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
    // 1.3 如果tag不是html保留标签，其实是自定义标签，直接创建其VNode对象
    // unknown or unlisted namespaced elements
    // check at runtime because it may get assigned a namespace when its
    // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // 2. 如果tag不是字符串，那他应该是一个组件，通过createComponent创建组件对应的VNode对象
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }

  // 判断VNode是否是数组，是的话直接返回VNode对象
  if (Array.isArray(vnode)) {
    return vnode
  // 如果不是数组且定义好了，就对VNode进行简单的初始化处理  
  } else if (isDef(vnode)) {
    // 处理VNode的命名空间
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    // 如果上面都不满足，就返回一个空的注释节点
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
