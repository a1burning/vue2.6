/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

import VNode, { cloneVNode } from './vnode'
import config from '../config'
import { SSR_ATTR } from 'shared/constants'
import { registerRef } from './modules/ref'
import { traverse } from '../observer/traverse'
import { activeInstance } from '../instance/lifecycle'
import { isTextInputType } from 'web/util/element'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  makeMap,
  isRegExp,
  isPrimitive
} from '../util/index'

export const emptyNode = new VNode('', {}, [])

const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

function sameVnode (a, b) {
  // 比snabbdom的复杂，判断了key，tag以及别的东西，这里不关心
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) map[key] = i
  }
  return map
}

// 这个类似snabbdom中的init函数，在最后返回了patch函数
// 高阶函数
export function createPatchFunction (backend) {
  let i, j
  // callbacks，这里面存储的模块定义的钩子函数
  const cbs = {}
  // 接收了两个属性，解构
  const { modules, nodeOps } = backend

  // 初始化cbs
  // 先遍历hooks数组，这里面都是生命周期钩子函数名称
  for (i = 0; i < hooks.length; ++i) {
    // 把这些名称作为cbs的属性，并把值初始化成一个数组(模块有很多，一个钩子函数会对应多个处理形式)
    // cbs['update'] = []
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      // 如果module函数里面定义对应的钩子函数，就取出来放到数组中
      if (isDef(modules[j][hooks[i]])) {
        // cbs['update'] = [updateAttrs, updateClass, update...]
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }

  // 返回一个VNode对象，获取标签名称及dom元素，
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove () {
      if (--remove.listeners === 0) {
        removeNode(childElm)
      }
    }
    remove.listeners = listeners
    return remove
  }

  function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  function isUnknownElement (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(ignore => {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  let creatingElmInVPre = 0

  function createElm (
    vnode,
    insertedVnodeQueue,
    // 第三个参数，是dom节点挂载到的父节点
    parentElm,
    // 如果不为空，就将转化的真实DOM插入这个DOM之前
    refElm,
    nested,
    ownerArray,
    index
  ) {
    // 判断vnode中是否有elm属性，如果有说明之前渲染过，
    // ownerArray代表vnode中有子节点
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      // 如果两个东西都有就把vnode克隆一份，子节点也会克隆一份
      // 这样做的原因是为了避免一些潜在的错误
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    vnode.isRootInsert = !nested // for transition enter check
    // 处理组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    // 获取属性
    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag

    // 下面的判断语句，判断了三种情况
    // 第一种情况判断vnode中是否有tag，tag是标签名称，即vnode是否是标签节点
    // 第二种情况判断vnode是否是注释节点
    // 第三种情况判断vnode是否是文本节点
    if (isDef(tag)) {
      // 是否是开发环境，
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          creatingElmInVPre++
        }
        // 判断标签是否是未知标签，即html中不存在的标签，自定义标签，会发送警告，是否注册了组件，但是不会影响程序的执行.
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }

      // 判断是否有命名空间，如果有就用createElementNS创建对应的DOM元素(这种情况是针对svg的情况)，如果没有就createElement创建DOM元素
      // 当创建好之后会存储到vnode的elm属性中，到这里DOM元素还没有完全处理好
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      
      // 这里会对vnode的DOM元素设置样式的作用域
      // 会给这个DOM元素设置一个scopeId
      setScope(vnode)

      /* istanbul ignore if */
      // 判断环境是否是__WEEX__，跳过直接看else
      if (__WEEX__) {
        // in Weex, the default insertion order is parent-first.
        // List items can be optimized to use children-first insertion
        // with append="tree".
        const appendAsTree = isDef(data) && isTrue(data.appendAsTree)
        if (!appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          // 这里会调用insert，将dom元素挂载到父节点中，如果parentElm传入的是空，就不做处理
          insert(parentElm, vnode.elm, refElm)
        }
        createChildren(vnode, children, insertedVnodeQueue)
        if (appendAsTree) {
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue)
          }
          insert(parentElm, vnode.elm, refElm)
        }
      } else {
        // 把vnode中所有的子元素或者文本节点转换成DOM对象
        createChildren(vnode, children, insertedVnodeQueue)
        // 判断data是否有值
        if (isDef(data)) {
          // 如果data有值就调用invokeCreateHooks触发钩子函数
          // 此时vnode已经创建好了对应的DOM对象，此时要去触发created钩子函数
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        // 到这里vnode对应的DOM对象就创建完毕了
        // 调用insert将vnode中创建好的DOM对象插入到parentElm中
        insert(parentElm, vnode.elm, refElm)
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        creatingElmInVPre--
      }
    } else if (isTrue(vnode.isComment)) {
      // 调用createComment创建注释节点并且放到elm中
      vnode.elm = nodeOps.createComment(vnode.text)
      // 插入到DOM树上来
      insert(parentElm, vnode.elm, refElm)
    } else {
      // 调用createTextNode创建文本节点并且放到elm中
      vnode.elm = nodeOps.createTextNode(vnode.text)
      // 插入到DOM树上来
      insert(parentElm, vnode.elm, refElm)
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    // 判断是否有data属性
    let i = vnode.data
    if (isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive
      // 获取data中的hook，获取init钩子函数
      // 调用了init钩子函数的时候，传递了两个参数，一个是vnode对象，一个是false
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */)
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue)
        insert(parentElm, vnode.elm, refElm)
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
      vnode.data.pendingInsert = null
    }
    vnode.elm = vnode.componentInstance.$el
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
      setScope(vnode)
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode)
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode)
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    let innerNode = vnode
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode)
        }
        insertedVnodeQueue.push(innerNode)
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm)
  }

  // 将DOM对象挂载到DOM树上
  function insert (parent, elm, ref) {
    // parent如果有值，就把dom元素挂载到父元素里面
    if (isDef(parent)) {
      // 判断有没有ref，如果有就判断ref的父节点是不是传入的parent，如果是就插入到ref之前
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      // 如果没有ref的话，就把elm插入到parent中
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  // 处理子元素和文本节点
  function createChildren (vnode, children, insertedVnodeQueue) {
    // 判断children是否是数组，
    if (Array.isArray(children)) {
      if (process.env.NODE_ENV !== 'production') {
        // 如果是开发环境判断子元素是否有相同的key
        checkDuplicateKeys(children)
      }
      // 遍历children，找到其vnode，通过createElm将其转换成真实DOM，并且挂载到DOM树上
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i)
      }
    // 如果vnode.text是原始值，通过String将其转换成字符串，调用createTextNode创建一个文本节点，将这个DOM元素挂载到vnode.elm中
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)))
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    // 调用cbs中的所有create钩子函数，这些是模块中的钩子函数
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    // vnode.data.hook这些是vnode上的钩子函数
    i = vnode.data.hook // Reuse variable
    // 判断是否有hook
    if (isDef(i)) {
      // 判断hook上面是否有create，如果有就触发create钩子函数
      if (isDef(i.create)) i.create(emptyNode, vnode)
      // 判断hook上面是否有insert钩子函数，如果有此处不去触发insert，以为此时只是创建了vnode还没有挂载到DOM树上，所以此时只是先添加到了insertedVnodeQueue上
      // 在patch函数最后会遍历insertedVnodeQueue中所有的vnode，触发他们的insert钩子函数
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    let i
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i)
    } else {
      let ancestor = vnode
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i)
        }
        ancestor = ancestor.parent
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i)
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    // 遍历新节点下的子节点，调用createElm将子节点转化成真实DOM挂载到DOM树上
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx)
    }
  }

  function invokeDestroyHook (vnode) {
    let i, j
    const data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode)
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j])
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    // 遍历所有的vnode节点，
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      // 判断这个节点是否存在，如果存在并且有tag说明是一个tag标签，此时将tag标签从DOM上移除，并且触发对应remove和destory的钩子函数
      // 如果没有tag说明是一个文本节点，直接将这个文本节点从DOM树上移除掉
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch)
          invokeDestroyHook(ch)
        } else { // Text node
          removeNode(ch.elm)
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i
      const listeners = cbs.remove.length + 1
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners)
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm)
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm)
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm)
      } else {
        rm()
      }
    } else {
      removeNode(vnode.elm)
    }
  }

  // 比较新老节点的子节点，更新差异
  // 接收参数：第一个是老节点的DOM元素，第二个是老节点的子节点，第三个是新节点的子节点
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // 新老节点的子节点传过来都是数组的形式，对比两个数组中的所有vnode，找到差异更新
    // 过程会进行优化，先对比两个数组中的开始和结束四个顶点
    // 新老节点的开始和结束索引，新老开始结束的节点本身
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    // 判断是否有重复的key，如果有重复的key会报警告
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(newCh)
    }

    // diff算法
    // 新老子节点都没有遍历完
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 先判断老开始节点是否有值
      if (isUndef(oldStartVnode)) {
        // 获取下一个老节点作为老开始节点
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      // 判断老结束节点是否有值  
      } else if (isUndef(oldEndVnode)) {
        // 没有就获取前一个节点作为老结束节点
        oldEndVnode = oldCh[--oldEndIdx]
      // 对比数组中的四个顶点 
      // 老开始和新开始比 
      // sameVnode值判断了key和tag是否相同，里面的内容是否具体相同并不知道，
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 如果这key和tag相同就用patchVnode继续比较这两个节点以及他们的子节点
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        // 当patch完成之后两个都移动到下一个节点
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      // 老结束和新结束比  
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      // 如果两个都不一样，可能进行了翻转操作  
      // 老开始和新结束比  
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        // 将老的开始节点移动到老的结束节点之后
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      // 老结束和新开始比  
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 如果上面四个都不满足，这个时候要拿着老节点的key去新节点的数组中一次找相同key的老节点
        // 这个找的过程做了优化：
        // 对象oldKeyToId这个变量在没有赋值的时候去调用createKeyToOldIdx函数
        // 他会把老节点的key和索引存储到对象oldKeyToIdx中
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        // 如果新开始节点有key，就用新开始节点的key来oldKeyToIdx中查找老节点的索引
        // 如果没key，就去老节点的数组中依次遍历找到相同老节点对应的索引
        // 这里也提现了，使用key的话会快一点
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

        // 如果没有找到老节点对应的索引  
        if (isUndef(idxInOld)) { // New element
          // 就调用createElm创建新开始节点对应的DOM对象并插入到老开始节点的前面
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          // 如果找到了老节点对应的索引
          // 把老节点取出来存到vnodeToMove里面，即将要移动的节点
          vnodeToMove = oldCh[idxInOld]
          // 如果找到的节点和新节点的key和tag相同，和之前一样的操作，比较当前两个节点和子节点
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            // 把老节点移动到老开始节点之前
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // 如果只是key相同，但是是不同的元素，那么创建新元素
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        // 新的开始节点向后移动
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // 当循环结束之后，判断新老节点是否遍历完成
    if (oldStartIdx > oldEndIdx) {
      // 老节点遍历完成新节点没遍历完，把剩下的新节点插入到老节点后面
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      // 新节点遍历完成老节点没有被遍历完，把剩下的老节点删除
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function checkDuplicateKeys (children) {
    // 定义了一个对象，在对象中存储了子元素的key
    const seenKeys = {}
    // 遍历子元素，每一个子元素都是一个vnode，获取其key属性，如果key有值就判断对象中是否有对应的key，如果有就说明有重复的key，此时会报警告，如果没有就在对象中记录下来key
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i]
      const key = vnode.key
      if (isDef(key)) {
        if (seenKeys[key]) {
          // 当前开发中有相同的key
          warn(
            `Duplicate keys detected: '${key}'. This may cause an update error.`,
            vnode.context
          )
        } else {
          seenKeys[key] = true
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }

  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode)
    }

    const elm = vnode.elm = oldVnode.elm

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    // 这里触发了用户传入的prepatch钩子函数
    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    // 获取新旧节点的子节点
    const oldCh = oldVnode.children
    const ch = vnode.children

    if (isDef(data) && isPatchable(vnode)) {
      // 先调用cbs中update中的钩子函数，就是模块中的，先更新样式属性事件等
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      // 获取用户自定义的钩子函数并执行
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // patchVnode的核心功能，核心核心
    // 对比新旧vnode
    // 先判断新vnode有没有text属性
    if (isUndef(vnode.text)) {
      // 是否新老节点的子节点是否都存在
      if (isDef(oldCh) && isDef(ch)) {
        // 如果子节点都存在且不相同，那么就调用updateChildren对比新老节点的子节点，把子节点的差异更新到DOM上
        // updateChildren 核心函数
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
        // 如果新节点有子节点，老节点没有子节点
      } else if (isDef(ch)) {
        if (process.env.NODE_ENV !== 'production') {
          // 去新节点的子节点中检查是否有重复的key，如果有重复的key在开发环境会报警告
          checkDuplicateKeys(ch)
        }
        // 判断老节点是否有text属性，如果有就把老节点的内容清空，再调用addVnodes函数
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // addVnodes这个函数的作用是将新节点中的子节点转换成DOM元素，并且添加到DOM树上
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
        // 判断如果老节点有子节点，新节点没有子节点，调用removeVnodes函数，把老节点的子节点删除，并且触发remove和destory钩子函数
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1)
      // 如果新老节点都没有子节点，判断老节点是否有text属性，如果有就清空文本内容
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果有text且新旧节点的text值不同
      // 将当前DOM对象中的内容设置为新vnode的text值
      nodeOps.setTextContent(elm, vnode.text)
    }
    // 操作完成之后会获取data中的hook里面的postpatch钩子函数并执行
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // 如果没有在DOM树上且有parent属性说明是一个延缓操作，等插入到DOM树上之后才会去触发对应的钩子函数
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue
    } else {
      // 否则就遍历触发对应的钩子函数
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  let hydrationBailed = false
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  const isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key')

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    let i
    const { tag, data, children } = vnode
    inVPre = inVPre || (data && data.pre)
    vnode.elm = elm

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true
      return true
    }
    // assert node match
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */)
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue)
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue)
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true
                console.warn('Parent: ', elm)
                console.warn('server innerHTML: ', i)
                console.warn('client innerHTML: ', elm.innerHTML)
              }
              return false
            }
          } else {
            // iterate and compare children lists
            let childrenMatch = true
            let childNode = elm.firstChild
            for (let i = 0; i < children.length; i++) {
              if (!childNode || !hydrate(childNode, children[i], insertedVnodeQueue, inVPre)) {
                childrenMatch = false
                break
              }
              childNode = childNode.nextSibling
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true
                console.warn('Parent: ', elm)
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children)
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        let fullInvoke = false
        for (const key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true
            invokeCreateHooks(vnode, insertedVnodeQueue)
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class'])
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }
  // 函数柯里化，让一个函数返回一个函数
  // modules和nodeOps是已经初始化好的两个相关数据
  // 接收两个函数，一个是oldVnode，一个是vnode(新vnode)
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    // 先判断新的vnode是否存在，如果不存在判断oldVnode是否存在，如果新的vnode不存在，oldVnode存在就调用invokeDestroyHook钩子函数，这种情况比较少见
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
      return
    }

    // 定义变量，初始化为false，如果标签没有挂载到DOM树上会修改为true
    let isInitialPatch = false
    // 常量，新插入vnode节点的队列，存储的目的是把这些新插入的节点对应的DOM元素挂载在DOM树上之后会去触发这些vnode的钩子函数
    const insertedVnodeQueue = []

    // 判断老的vnode是否存在，
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      // 不存在的情况，什么情况下会是undefined或者是null呢?
      // 在组件中的$mount方法，但是没有传入参数的时候，如果传入参数表示我们要把这个挂载到页面上的某个位置，如果没有传参数的话表示我们只是把组件创建出来但并不挂载到视图上
      
      // 这个时候将变量置为true，他vnode也创建好了，DOM元素也创建好了，但是仅仅存在内存中，没有挂到DOM树上来.
      isInitialPatch = true
      // 将vnode转换成真实DOM，但是仅仅存在内存中，没有挂到DOM树上
      createElm(vnode, insertedVnodeQueue)
    } else {
      // 如果oldVnode存在
      // 判断oldVnode的nodeType是否存在，如果存在说明老的vnode是一个真实dom，说明是首次渲染的时候，首次渲染和数据更改的处理情况是有区别的
      const isRealElement = isDef(oldVnode.nodeType)
      // 判断如果不是真实DOM且与新的vnode是相同节点，
      // snabbdom中的sameVnode判断了key和sel选择器是否相同
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        // 核心核心
        // 在这里patchVnode比较新老节点的差异，并且将差异更新到DOM上，里面会执行diff算法
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
      
      // 如果是真实DOM 或者 与新vnode不是相同节点走这里
      } else {
        // 如果是真实DOM，说明首次渲染，创建VNode
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          // 这的代码是与SSR相关的东西，
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR)
            hydrating = true
          }
          // 这的代码是与SSR相关的东西，
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // 将真实DOM转换成VNode对象存储到了oldVnode节点中
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        // 获取oldVnode的elm，真实DOM节点，获取这个的目的是找到其真实DOM的父元素，将来要挂载到这个节点下面
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        // 创建 DOM 节点，
        // 将vnode转换成真实dom挂载到parentElm里面，如果传了第四个参数，会将转换的真实dom插入到这个元素之前，并且会把vnode记录到insertedVnodeQueue这个队列中来
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          // 这个判断是如果当时正在执行一个过渡动画，并且是正在消失的话，就处理成null，不挂载
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )

        // update parent placeholder node element, recursively
        // 处理父节点的占位符的问题，与核心逻辑无关，跳过
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent
          const patchable = isPatchable(vnode)
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor)
            }
            ancestor.elm = vnode.elm
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor)
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]()
                }
              }
            } else {
              registerRef(ancestor)
            }
            ancestor = ancestor.parent
          }
        }

        // destroy old node
        // 判断parentElm是否存在，将oldVnode从界面上移除，并且触发相关的钩子函数
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0)
        // 如果没有父节点说明这个节点并不在DOM树上，判断其是否有tag属性，如果有就触发相关的钩子函数
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    // 下面invokeInsertHook就是去触发insertedVnodeQueue队列中的新插入的vnode的钩子函数
    // isInitialPatch这个变量是vnode对应的DOM元素并没有挂载到DOM树上，而是存在内存中，如果是这种情况，就不会触发insertedVnodeQueue里面的钩子函数insert
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    // 最后将新的vnode的DOM元素返回
    return vnode.elm
  }
}
