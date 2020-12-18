/* @flow */

/**
 * Runtime helper for rendering static trees.
 */
export function renderStatic (
  index: number,
  isInFor: boolean
): VNode | Array<VNode> {
  const cached = this._staticTrees || (this._staticTrees = [])
  // 首先从缓存中获取静态根节点对应的代码
  let tree = cached[index]
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  // 如果没有的话就去staticRenderFns数组中获取静态根节点对应的render函数，然后调用，此时就生成了vnode节点，然后把结果缓存
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  )
  // 调用markStatic，作用是把当前返回的vnode节点标记为静态的
  markStatic(tree, `__static__${index}`, false)
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
export function markOnce (
  tree: VNode | Array<VNode>,
  index: number,
  key: string
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true)
  return tree
}

function markStatic (
  tree: VNode | Array<VNode>,
  key: string,
  isOnce: boolean
) {
  // 作用是把当前返回的vnode节点标记为静态的
  // 如果当前的tree是数组的话，会遍历数组中所有的vnode，然后调用markStaticNode，否则直接调用markStaticNode标记为静态的
  // vnode被标记为静态之后，将来调用patch函数的时候，他内部会判断，如果当前vnode是静态的，不再对比节点的差异，直接返回.因为静态节点不再发生变化，不需要进行处理，这是对静态节点的优化，如果静态节点已经渲染到了文档上，那此时它不需要重新被渲染
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce)
      }
    }
  } else {
    markStaticNode(tree, key, isOnce)
  }
}

function markStaticNode (node, key, isOnce) {
  // 这个把vnode节点设置为静态的
  node.isStatic = true
  // 记录key和isOnce
  node.key = key
  node.isOnce = isOnce
}
