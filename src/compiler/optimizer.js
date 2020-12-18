/* @flow */

import { makeMap, isBuiltInTag, cached, no } from 'shared/util'

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCached = cached(genStaticKeys)

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 * 优化的目的是为了标记抽象语法树中的静态节点
 * 静态节点对应的DOM子树永远不会发生变化，比如一个纯文本的div，就不会发生变化
 * 以后就不会重新渲染，之后编译的时候就会跳过静态子树
 * 
 */
export function optimize (root: ?ASTElement, options: CompilerOptions) {
  // 判断root，是否传递了ast对象，如果没有直接返回
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no
  // first pass: mark all non-static nodes.
  // 标记静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 标记静态根节点
  markStaticRoots(root, false)
}

function genStaticKeys (keys: string): Function {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic (node: ASTNode) {
  // 判断当前 astNode 是否是静态的
  node.static = isStatic(node)
  // 元素节点
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    // 判断是不是保留标签，如果不是保留标签，那就是组件
    // 如果是组件，不会把组件中的slot标记成静态节点，如果组件中的slot被标记为静态的
    // 那他将来就没有办法改变
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    // 遍历ast对象的所有子节点
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      // 递归调用markStatic标记静态
      markStatic(child)
      if (!child.static) {
        // 如果有一个 child 不是 static，当前 node 不是 static
        node.static = false
      }
    }
    // 处理条件渲染中的AST对象，与上一步处理相同
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block
        markStatic(block)
        if (!block.static) {
          node.static = false
        }
      }
    }
  }
}

function markStaticRoots (node: ASTNode, isInFor: boolean) {
  // 判断当前根节点是否是元素节点
  if (node.type === 1) {
    // 判断该节点是否是静态的或者只渲染一次，来标记该节点在循环中是否是静态的
    if (node.static || node.once) {
      node.staticInFor = isInFor
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    
    // 标记静态根节点，首先是静态的并且有子节点
    // 并且这个节点中不能只有文本类型的子节点，
    // 如果一个元素内只有文本节点，这个元素不是静态的Root
    // Vue认为这种这种优化成本大于收益
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true
      return
    } else {
      node.staticRoot = false
    }
    // 检测当前节点的子节点中是否有静态的Root，递归调用markStaticRoots
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for)
      }
    }
    // 遍历条件渲染的子节点，递归调用markStaticRoots
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor)
      }
    }
  }
}

function isStatic (node: ASTNode): boolean {
  // 首先判断node中的type属性，如果是2的话说明是表达式，不是静态节点
  if (node.type === 2) { // expression
    return false
  }
  // 如果是3说明是文本节点，是静态节点，返回true
  if (node.type === 3) { // text
    return true
  }
  // 如果下面的条件都满足，说明是静态节点，返回true
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in 不能是内置组件
    isPlatformReservedTag(node.tag) && // not a component 不能是组件
    !isDirectChildOfTemplateFor(node) && // 不能是v-for下的直接子节点
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node: ASTElement): boolean {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}
