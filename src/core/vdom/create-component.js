/* @flow */

import VNode from './vnode'
import { resolveConstructorOptions } from 'core/instance/init'
import { queueActivatedComponent } from 'core/observer/scheduler'
import { createFunctionalComponent } from './create-functional-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject
} from '../util/index'

import {
  resolveAsyncComponent,
  createAsyncPlaceholder,
  extractPropsFromVNodeData
} from './helpers/index'

import {
  callHook,
  activeInstance,
  updateChildComponent,
  activateChildComponent,
  deactivateChildComponent
} from '../instance/lifecycle'

import {
  isRecyclableComponent,
  renderRecyclableComponentTemplate
} from 'weex/runtime/recycle-list/render-component-template'

// inline hooks to be invoked on component VNodes during patch
const componentVNodeHooks = {
  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
    // 首先处理keep-alive的情况，跳过
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 创建组件的实例
      // activeInstance是激活的实例，是当前组件对象的父组件对象
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      )
      // 创建完组件对象之后调用$mount方法
      // 创建dom，但是没有挂载到dom树上，挂载是在vdom/patch.js中
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

  prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },

  insert (vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },

  destroy (vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy()
      } else {
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)
/**
 * 
 * @param {*} Ctor 
 * @param {*} data 
 * @param {*} context 
 * @param {*} children 
 * @param {*} tag 
 * 
 * 初始化了四个钩子函数，在init钩子函数中创建了组件对象
 * init钩子函数在什么时候调用的?
 * 在patch中调用
 */
export function createComponent (
  // 组件类，构造函数，函数，对象
  Ctor: Class<Component> | Function | Object | void,
  // 创建vnode需要的数据
  data: ?VNodeData,
  // 创建上下文，Vue实例或者当前组件实例
  context: Component,
  // 子节点数组
  children: ?Array<VNode>,
  // 标签名称
  tag?: string
  // 返回值是创建好的VNode对象
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }

  // 通过实例的选项获取Vue构造函数
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  // 如果 Ctor 是选项对象的话
  // 就调用extend，把选项对象转换成组件的构造函数
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  // 处理异步组件，如果Ctor上没有cid，就是异步组件
  // 组件的构造函数中设置了cid，这里跳过
  let asyncFactory
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // 当组件构造函数创建完毕后，合并当前组件选项和通过Vue.mixins混入的选项
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  // 处理组件上的v-model指令
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  // install component management hooks onto the placeholder node
  // 创建组件vnode的核心位置
  // 安装组件的钩子函数 默认钩子函数init/prepatch/insert/destory
  installComponentHooks(data)

  // return a placeholder vnode
  // 获取组件的名称
  const name = Ctor.options.name || tag
  // 核心核心核心
  // 创建组件对应的VNode对象
  // { Ctor, propsData, listeners, tag, children }，componentOptions有这些属性
  // 注意：Ctor在init钩子函数内部通过new VNode.componentOptions.Ctor创建了组件的对象
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )

  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  // 最后返回vnode对象
  return vnode
}

export function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode: any,
  // activeInstance in lifecycle state
  parent: any
): Component {
  // 创建了options对象
  // _isComponent 当前是否是组件
  // _parentVnode 父组件cnode
  // parent 传入的父组件对象，vue实例
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  // check inline-template render functions
  // 处理inlineTemplate，跳过
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  // 通过new调用组件的构造函数，创建组件对象，
  // 在组件的vue的构造函数内部又会调用Vue中的_init方法，
  // 传入了options
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data: VNodeData) {
  //获取data.hook，用户传入的组件钩子函数
  const hooks = data.hook || (data.hook = {})
  // 这里遍历hooksToMerge中的名字，init/prepatch/insert/destory
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    // 获取用户传入的钩子函数
    const existing = hooks[key]
    // componentVNodeHooks的钩子函数
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      // 用mergeHook把两者的钩子函数合并到一起
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function mergeHook (f1: any, f2: any): Function {
  // 创建一个函数，内部先调用内部钩子函数，再调用用户传入的钩子函数，然后将这个函数返回，作为新的钩子函数
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data: any) {
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value
  const on = data.on || (data.on = {})
  const existing = on[event]
  const callback = data.model.callback
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing)
    }
  } else {
    on[event] = callback
  }
}
