/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  //html相关
  expectHTML: true,
  // 模块
  modules,
  // 指令
  directives,
  // 是否是pre标签
  isPreTag,
  // 是否是自闭合标签
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  // 是否是html中的保留标签
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
