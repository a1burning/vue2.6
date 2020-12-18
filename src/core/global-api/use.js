/* @flow */

import { toArray } from '../util/index'

/**
 * 
 * @param {*} Vue 传入Vue构造函数
 */
export function initUse (Vue: GlobalAPI) {
  // 定义了Vue.use的方法,接收了一个参数plugin(插件,可以是函数也可以是对象)
  Vue.use = function (plugin: Function | Object) {
    // 定义了一个常量,installedPlugins表示已经安装的插件
    // 这个地方的this只是的Vue的构造函数
    // 获取_installedPlugins属性如果有就返回,如果没有就初始化成一个空数组,这个里面记录了安装的插件.
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果注册的插件已经存在,则直接返回,如果没有注册,下面注册插件,注册插件其实就是调用传入的插件
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    
  // 这里整体的功能是调用插件的方法并传递相应的参数
    // additional parameters
    // 这里对调用此方法的其余参数做处理
    // use方法可以传一个参数,也可以传多个参数,如果传多个参数,那么第一个是插件,其余的都是调用时候传入的参数
    // toArray方法将arguments转换成数组,后面的1是把第一个参数去掉
    const args = toArray(arguments, 1)

    // 将Vue构造函数插入到参数数组的第一项中
    args.unshift(this)

    // 如果plugin.install有值的话说明plugin是一个对象,直接调用其install方法
    // 文档中说,如果要注册一个插件,其中必须要有一个install方法,这是对插件的要求
    if (typeof plugin.install === 'function') {
      // 使用apply方法改变其内部的this,第一个传plugin是plugin调用的方法,apply方法会将args数组展开,第一个参数是Vue,intall方法要求的第一个参数也是Vue
      plugin.install.apply(plugin, args)
    // 如果是函数那么直接调用这个函数
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 当注册好插件之后要将插件保存到已安装的插件数组中
    installedPlugins.push(plugin)
    // 返回Vue的构造函数
    return this
  }
}
