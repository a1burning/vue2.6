/* @flow */

import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  // 传入参数,
  Vue.mixin = function (mixin: Object) {
    // 这里的this指的是Vue构造函数
    // 把mixin对象的成员拷贝到Vue.options中,所以mixin注册的是全局选项,官网上有
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
