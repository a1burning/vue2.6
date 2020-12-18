// 设置服务端渲染的相应属性,如果标签中有这个属性说明是服务端渲染来的
export const SSR_ATTR = 'data-server-rendered'
//Vue.component Vue.directive Vue.filter 的方法名称
export const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
// 声明周期的所有函数名称
export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
]
