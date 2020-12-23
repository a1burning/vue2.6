/*!
 * Vue.js v2.6.12
 * (c) 2014-2020 Evan You
 * Released under the MIT License.
 */
/*  */

const emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  // 判断参数是否为null，是就返回空字符串
  // 判断参数是否是数组或者对象，是就调用JSON.stringify转换成字符串
  // 否则就直接转换成字符串
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  const n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  const map = Object.create(null);
  const list = str.split(',');
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 */
const isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  const cache = Object.create(null);
  return (function cachedFn (str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g;
const camelize = cached((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
});

/**
 * Capitalize a string.
 */
const capitalize = cached((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cached((str) => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    const l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

const bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  let i = list.length - start;
  const ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  const res = {};
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
const no = (a, b, c) => false;

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
const identity = (_) => _;

/**
 * Generate a string containing static keys from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) return true
  const isObjectA = isObject(a);
  const isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a);
      const isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  let called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

// 设置服务端渲染的相应属性,如果标签中有这个属性说明是服务端渲染来的
const SSR_ATTR = 'data-server-rendered';
//Vue.component Vue.directive Vue.filter 的方法名称
const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];
// 声明周期的所有函数名称
const LIFECYCLE_HOOKS = [
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
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 * 最后一个参数是可枚举参数，不传这个参数enumerable的值就是undefined，!!enumerable就是false，不可枚举.这么做的目的是，将来要去遍历这个属性给其设置getter和setter，如果不可枚举就是不设置getter和setter，例如那个__ob__
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`);
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.');
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
// 判断当前对象中是否有__proto__，即当前浏览器是否支持对象原型属性
const hasProto = '__proto__' in {};

// Browser environment sniffing
// 判断window类型是否等于undefined，如果不是就是浏览器环境
const inBrowser = typeof window !== 'undefined';
const inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
const weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
const UA = inBrowser && window.navigator.userAgent.toLowerCase();
const isIE = UA && /msie|trident/.test(UA);
const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
const isEdge = UA && UA.indexOf('edge/') > 0;
const isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
const isPhantomJS = UA && /phantomjs/.test(UA);
const isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
const nativeWatch = ({}).watch;

let supportsPassive = false;
if (inBrowser) {
  try {
    const opts = {};
    Object.defineProperty(opts, 'passive', ({
      get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
let _isServer;
const isServerRendering = () => {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
const devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

const hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

let _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set   {
    
    constructor () {
      this.set = Object.create(null);
    }
    has (key) {
      return this.set[key] === true
    }
    add (key) {
      this.set[key] = true;
    }
    clear () {
      this.set = Object.create(null);
    }
  };
}

/*  */

let warn = noop;
let tip = noop;
let generateComponentTrace = (noop); // work around flow check
let formatComponentName = (noop);

{
  const hasConsole = typeof console !== 'undefined';
  const classifyRE = /(?:^|[-_])(\w)/g;
  const classify = str => str
    .replace(classifyRE, c => c.toUpperCase())
    .replace(/[-_]/g, '');

  warn = (msg, vm) => {
    const trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(`[Vue warn]: ${msg}${trace}`);
    }
  };

  tip = (msg, vm) => {
    if (hasConsole && (!config.silent)) {
      console.warn(`[Vue tip]: ${msg}` + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = (vm, includeFile) => {
    if (vm.$root === vm) {
      return '<Root>'
    }
    const options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;
    let name = options.name || options._componentTag;
    const file = options.__file;
    if (!name && file) {
      const match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? `<${classify(name)}>` : `<Anonymous>`) +
      (file && includeFile !== false ? ` at ${file}` : '')
    )
  };

  const repeat = (str, n) => {
    let res = '';
    while (n) {
      if (n % 2 === 1) res += str;
      if (n > 1) str += str;
      n >>= 1;
    }
    return res
  };

  generateComponentTrace = vm => {
    if (vm._isVue && vm.$parent) {
      const tree = [];
      let currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          const last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map((vm, i) => `${
          i === 0 ? '---> ' : repeat(' ', 5 + i * 2)
        }${
          Array.isArray(vm)
            ? `${formatComponentName(vm[0])}... (${vm[1]} recursive calls)`
            : formatComponentName(vm)
        }`)
        .join('\n')
    } else {
      return `\n\n(found in ${formatComponentName(vm)})`
    }
  };
}

/*  */

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
class Dep {
  // 定义了一个静态属性target，其类型是一个Watcher对象
  
  
  

  constructor () {
    this.id = uid++;
    this.subs = [];
  }

  addSub (sub) {
    // 将Watcher对象添加到Dep的subs数组中
    this.subs.push(sub);
  }

  removeSub (sub) {
    remove(this.subs, sub);
  }

  // 将观察对象和 watcher 建立依赖
  depend () {
    if (Dep.target) {
      // 如果 target 存在，把 dep 对象添加到 watcher 的依赖中
      // Dep.target就是Watcher对象，要找到Watcher的addDep
      Dep.target.addDep(this);
    }
  }

  // 发布通知
  notify () {
    // stabilize the subscriber list first
    // subs数组是watcher对象数组，这里要进行克隆，下面要进行排序，按照id从小到大进行排序
    const subs = this.subs.slice();
    if ( !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      // 按照watcher的创建顺序进行排序，保证执行watcher的顺序是正确的
      subs.sort((a, b) => a.id - b.id);
    }
    // 循环subs数组，
    for (let i = 0, l = subs.length; i < l; i++) {
      // 会调用watcher中的update方法
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// Dep.target 用来存放目前正在使用的watcher对象
// This is globally unique because only one watcher
// 全局唯一，并且同一时间只能有一个watcher被使用
// can be evaluated at a time.
Dep.target = null;
const targetStack = [];

function pushTarget (target) {
  // 先把watcher对象存入一个栈中
  // 这个代码的目的是：在Vue2.0以后，每一个组件对应一个watcher对象，因为每个组件都有一个mountComponent函数，每个mountComponent都会创建一个watcher对象，所以每个组件对应一个watcher对象. 如果组件有嵌套的话，如果A组件嵌套了B组件，当渲染A组件的时候，A组件发现还有子组件，于是要先去渲染子组件，此时A组件的渲染就被挂载起来了，所以A组件对应的watcher对象也应该被存储起来，就被存储到targetStack栈中. 当子组件渲染完毕之后，会把他从对应的栈中弹出继续执行父组件的渲染
  targetStack.push(target);
  //target就是传入的Watcher对象
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

class VNode {
  
  
  
  
  
  
   // rendered in this component's scope
  
  
   // component instance
   // component placeholder node

  // strictly internal
   // contains raw HTML? (server only)
   // hoisted static node
   // necessary for enter transition check
   // empty comment placeholder?
   // is a cloned node?
   // is a v-once node?
   // async component factory function
  
  
  
   // real context vm for functional nodes
   // for SSR caching
   // used to store functional render context for devtools
   // functional scope id support

  constructor (
    tag,
    data,
    // 组件VNode的children，text，elm是undefined
    children,
    text,
    elm,
    // Vue实例或者组件实例
    context,
    // 刚刚在init钩子函数中曾经看到过这个属性，这个选项还有一个Ctor属性，去记录组件的构造函数
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    // 通过data传递的key
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child () {
    return this.componentInstance
  }
}

const createEmptyVNode = (text = '') => {
  // 设置VNode对象
  const node = new VNode();
  node.text = text;
  // 标识这个节点是注释节点
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  // 返回一个VNode，里面只创建了一个text属性，代表文本节点
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

const arrayProto = Array.prototype;
// 创建一个对象，将原型的对象指向Array.prototype
const arrayMethods = Object.create(arrayProto);
// 下面的方法都是修改数组元素的方法，当数组进行修改的时候，我们要通知Dep，修改了数组要对视图进行更新，但是原生方法不知道要通知Dep，所以要进行修补
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
// 遍历数组的每一个元素
methodsToPatch.forEach(function (method) {
  // cache original method
  // 从数组原型上获取数组对应的原始方法
  const original = arrayProto[method];
  // 调用Object.defineProperty() 重新定义修改数组的方法
  // 第一个是目标对象arrayMethods，第二个是键method，第三个是值，调用pop/push 的时候传入的参数
  def(arrayMethods, method, function mutator (...args) {
    // 首先会调用数组中原始的方法，并且通过apply改变其内部指向，传入参数args
    const result = original.apply(this, args);
    // 上面因为改变了原数组，所以还需要进行特殊的处理
    // 获取数组对象的 ob 对象，数组关联的Observer对象
    const ob = this.__ob__;
    // 定义这个变量用来存储数组中新增的元素
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        // 如果是push和unshift，传入的参数就是新增的元素，直接赋值
        inserted = args;
        break
      case 'splice':
        // 如果是splice，其第三个元素是新增的元素，把第三个值存储到inserted中
        inserted = args.slice(2);
        break
    }
    // 如果新增元素存在，就调用observeArray
    // 遍历数组，并把每一个数组的元素，如果是对象的话就转换成响应式对象，
    if (inserted) ob.observeArray(inserted);
    // notify change
    // 找到Observer的dep对象发送通知
    ob.dep.notify();
    return result
  });
});

/*  */

// 获取arrayMethods中'push','pop','shift','unshift','splice','sort','reverse'等改变原数组的方法名称，是个数组
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
let shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * Observer类被附加到每一个被观察的对象
 * object. Once attached, the observer converts the target
 * 一旦附加，会转换对象的所有属性
 * object's property keys into getter/setters that
 * 将其转换成getter和setter
 * collect dependencies and dispatch updates.
 * 用来收集依赖和派发更新
 */
class Observer {
  // flow的语法，把属性定义在类的最上面
  // 观测对象
  
  // 依赖对象
  
  // 实例计算器
   // number of vms that have this object as root $data

  constructor (value) {
    // 被观察的对象
    this.value = value;
    //Observer对象都有一个dep属性，里面的值是Dep对象
    this.dep = new Dep();
    this.vmCount = 0;
    // 使用def函数，给value对象设置了__ob__属性，把Observer对象记录下来
    // 在observe中函数中判断的__ob__就是在这里定义的
    // def是对Object.defineProperty做了一个封装
    def(value, '__ob__', this);
    // 核心核心核心
    // 判断是否是数组
    if (Array.isArray(value)) {
      /**
       * 这里是处理浏览器的兼容性问题，判断当前对象中是否有__proto__，即当前浏览器是否支持对象原型属性
       * export const hasProto = '__proto__' in {}
       */
      if (hasProto) {
        /**
         * 这个函数接收两个参数，第一个参数value是当前对象，第二个参数是数组对应的方法
         * 这个函数的作用是重新设置数组的原型属性等于第二个参数，修补了一些数组的方法(新增对象的响应式转换，让其dep对象发送通知)
         * 其原型指向了数组Array构造函数的原型
         */
        protoAugment(value, arrayMethods);
      } else {
        /**
         * 前两个参数一样
         * 第三个参数arrayKeys获取arrayMethods中改变原数组的方法名称，是个数组
         * const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
         */
        copyAugment(value, arrayMethods, arrayKeys);
      }
      //
      this.observeArray(value);
    // 如果是对象就调用其walk  
    /**
     *  walk (obj: Object) {
          const keys = Object.keys(obj)
          for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
          }
        }
     */
    // 遍历对象中的的每一个属性，用defineReactive方法转换成哼setter和getter
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }

  /**
   * Observe a list of Array items.
   * 对数组做响应式处理
   */
  observeArray (items) {
    // 便利数组中的所有成员，如果成员是对象的话就转化成响应式对象
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 * 重新设置数组的原型属性等于第二个参数
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
// 先去遍历之前拿到的修改数组的名称keys，找到keys对应的函数，调用def给当前对象定义之前修改的方法
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * 试图为value创建一个observer对象
 * returns the new observer if successfully observed,
 * 如果创建成功会把observe对象返回
 * or the existing observer if the value already has one.
 * 或者返回一个已存在的observe对象
 */
function observe (value, asRootData) {
  // 判断value是否是一个对象或者是否是VNode的实例
  // 如果不是对象或者是VNode的实例，就不需要进行响应式处理，会直接返回
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  // ob 是 Observer的实例
  let ob;
  // 判断value中是否有__ob__这个属性
  // 如果有的话还要判断__ob__是否是Observer的实例
  // 如果条件成立就把那个赋值给ob变量
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    // 判断是否可以进行响应式处理
    // 判断value是否是数组或者是一个纯object对象
    // 判断value是否是Vue实例!value._isVue，如果是vue实例那么不需要进行响应式处理
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // 最最最核心
    // 如果可以进行响应式处理，就创建一个Observer对象，就把value的所有属性转换成setter和getter
    ob = new Observer(value);
  }
  // 如果传入的是根数据，那么vmCount要进行++，计数
  if (asRootData && ob) {
    ob.vmCount++;
  }
  // 最终将Observer实例对象返回
  return ob
}

/**
 * Define a reactive property on an Object.
 * 为一个对象定义一个响应式的属性
 */
function defineReactive (
  obj, // 目标对象
  key, // 设置的属性
  val, // 值
  // 下面都是可选参数
    // 用户自定义的setter函数，很少会用到 
    customSetter,
    // 浅的意思，如果为true则只监听其第一层的属性
    // 如果是false，那就要深度监听
    shallow
) {
  // 创建Dep对象，负责为当前属性收集依赖，也就是收集观察当前属性的所有Watcher
  const dep = new Dep();
  // 获取当前对象的属性描述符，在属性描述符中可以定义set，get和configurable(是否可配置)
  const property = Object.getOwnPropertyDescriptor(obj, key);
  // 如果当前属性能获取到，还不可配置，就返回
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 获取属性描述符中的set和get，因为这个属性是用户传入的，可能用户在传入之前已经设置了get和set，
  // 所以要把用户设置的get和set取出来，后来有取重写get和set方法，给get和set增加依赖收集和派发更新的功能.
  const getter = property && property.get;
  const setter = property && property.set;
  // 特殊情况的判断，如果传递的参数个数是两个，那么value就是obj[key]去获取
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }
  // 如果shallow是false，是深度监听，此时会调用observe
  // 如果当前属性的值val是对象的话，会通过observe去监听val对象的所有属性，去转换getter和setter
  let childOb = !shallow && observe(val);
  // 调用 Object.defineProperty 将对象转换成getter和setter
  Object.defineProperty(obj, key, {
    enumerable: true, // 可枚举
    configurable: true, // 可配置
    get: function reactiveGetter () {
      // 首先去调用了用户传入的getter获取值，如果没有就直接获取值
      const value = getter ? getter.call(obj) : val;
      // 收集依赖
      // 当我们访问这个值的时候会进行依赖收集，依赖收集就是将依赖该属性的 Watcher 对象添加到Dep对象的sub数组中，将来数据发生变化的时候，通知所有的Watcher
      // 先判断这个Dep中是否有target静态属性，target这个属性中存储的是Watcher对象
      if (Dep.target) {
        // 核心核心
        // 如果有的话就调用dep的depend方法，这个depend方法的作用就是进行依赖收集，就是把当前的Watcher对象添加到dep的subs数组中
        dep.depend();
        // 判断 childOb 子对象是否存在，childOb是Observer对象
        if (childOb) {
          // 每一个Observer对象都有一个dep的属性，这里用dep的depend方法，让子对象收集依赖

          // 这里有两个dep，一个是当前函数中创建的dep对象，作用是为了给当前对象的属性收集依赖，还有一个dep是Observer对象中的属性dep，是为当前子对象收集依赖
          /**
           * 当属性变化的时候要发送通知，为什么这里要给子对象添加依赖?
           *  当子对象中添加成员或者删除成员的时候也需要发送通知去更新视图，这句话的目的是给子对象添加依赖，当子对象的成员发生添加或者删除的时候，可以发送通知
           * 
           * childOb什么时候发送通知呢?将来看$set和$delete的时候再解释
           */
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // 如果预定义 getter 存在就让 value 等于 getter 调用的返回值，否则直接赋予属性值
      const value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      // 判断新值和旧值是否相等，|| 后面的其实是针对NaN的情况即新旧值都不为NaN
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ( customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      // 如果没有setter直接返回，说明是只读的
      if (getter && !setter) return
      // 如果setter存在就调用setter给属性赋值
      if (setter) {
        setter.call(obj, newVal);
      } else {
      // getter和setter都不存在的时候，直接把新值赋值给旧值  
        val = newVal;
      }
      // 如果是深度监听，就调用observe方法，其内部会判断如果新值是对象的话，把新值的属性转化成getter和setter
      // childOb是Observer对象，是observe方法返回的
      childOb = !shallow && observe(newVal);
      // 派发更新(发布更改通知)
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  // 判断传入的目标对象是否是undefined或者是原始值，不允许给undefined或者原始值添加响应式属性，会发送警告
  if (
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target)}`);
  }
  // 判断target对象是否是数组，并且key是合法的索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 比较key和数组的length属性谁大，然后赋值给length属性，调用$set的时候数组可能会超过length属性
    target.length = Math.max(target.length, key);
    // 调用splice方法进行替换，这个不是数组的原生方法，是之前修改过的splice方法
    target.splice(key, 1, val);
    return val
  }
  // 处理对象属性
  // 判断处理的属性在对象中已经存在，并且这个属性不是Object原型上的成员，就直接赋值，不需要进行响应式处理
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  // 获取target的__ob__属性，判断其是不是vm或者是$data，是的话抛出警告
  // $data的话ob.vmCount是1
  const ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  // 判断ob对象是否存在，如果不存在说明target不是响应式对象，如果target不是响应式对象，那么传入的属性也不必做响应式处理，直接赋值返回
  if (!ob) {
    target[key] = val;
    return val
  }

  // 如果ob存在，就把属性设置成响应式属性，ob.value即target
  defineReactive(ob.value, key, val);
  // 还要发送通知
  // 可以这么做是我们在收集依赖的时候，给每一个子对象都创建了childObj，并且给childObj的dep也收集了依赖
  // 因为那个收集了依赖，所以这里可以发送通知
  ob.dep.notify();
  // 最后将值返回
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  // 判断当前target是否是undefined或者是原始值，如果是就发出警告
  if (
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target)}`);
  }
  // 判断target是否是数组，索引是否有效
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 使用splice方法修改，不传第三个方法就是删除指定元素
    // 里面会去更新通知
    target.splice(key, 1);
    return
  }
  // 如果target是对象就会获取ob对象
  const ob = (target).__ob__;
  // 判断是不是vue是和$data对象，是就会发送警告
  if (target._isVue || (ob && ob.vmCount)) {
     warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  // 判断当前对象中是否有key属性，key不能是继承来的，如果没有直接返回
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性
  delete target[key];
  // 如果ob不存在，说明不是响应式数据，直接返回
  if (!ob) {
    return
  }
  // 发送通知更新视图
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
{
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) return to
  let key, toVal, fromVal;

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  const res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  const res = [];
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  const res = Object.create(parentVal || null);
  if (childVal) {
     assertObjectType(key, childVal, vm);
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined;
  if (childVal === nativeWatch) childVal = undefined;
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) return childVal
  const ret = {};
  extend(ret, parentVal);
  for (const key in childVal) {
    let parent = ret[key];
    const child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) return childVal
  const ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) extend(ret, childVal);
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (const key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  const props = options.props;
  if (!props) return
  const res = {};
  let i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  const inject = options.inject;
  if (!inject) return
  const normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  const dirs = options.directives;
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  const options = {};
  let key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ( warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  const prop = propOptions[key];
  const absent = !hasOwn(propsData, key);
  let value = propsData[key];
  // boolean casting
  const booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      const stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    const prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  const def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ( isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  let type = prop.type;
  let valid = !type || type === true;
  const expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (let i = 0; i < type.length && !valid; i++) {
      const assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  const validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  let valid;
  const expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    const t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid,
    expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (let i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  let message = `Invalid prop: type check failed for prop "${name}".` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}`;
  const expectedType = expectedTypes[0];
  const receivedType = toRawType(value);
  // check if we need to specify expected value
  if (
    expectedTypes.length === 1 &&
    isExplicable(expectedType) &&
    isExplicable(typeof value) &&
    !isBoolean(expectedType, receivedType)
  ) {
    message += ` with value ${styleValue(value, expectedType)}`;
  }
  message += `, got ${receivedType} `;
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += `with value ${styleValue(value, receivedType)}.`;
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return `"${value}"`
  } else if (type === 'Number') {
    return `${Number(value)}`
  } else {
    return `${value}`
  }
}

const EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
function isExplicable (value) {
  return EXPLICABLE_TYPES.some(elem => value.toLowerCase() === elem)
}

function isBoolean (...args) {
  return args.some(elem => elem.toLowerCase() === 'boolean')
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      let cur = vm;
      while ((cur = cur.$parent)) {
        const hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (let i = 0; i < hooks.length; i++) {
            try {
              const capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) return
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  let res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(e => handleError(e, vm, info + ` (Promise/async)`));
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  {
    warn(`Error in ${info}: "${err.toString()}"`, vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

let isUsingMicroTask = false;

const callbacks = [];
let pending = false;

function flushCallbacks () {
  // 先将pending设置为false，表示处理已经结束
  pending = false;
  // 将callbacks数据备份一份之后将callbacks数组清空
  const copies = callbacks.slice(0);
  callbacks.length = 0;
  // 然后将备份的callbacks数组进行遍历调用
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
let timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// ios大于等于9.3.3是不会使用promise，会存在潜在的问题，所以会降级成setTimeout
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */

// 如果Promise对象存在就调用timerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 定义一个promise对象，让promise对象去处理flushCallbacks，使用微任务的形式去处理，是在本次同步任务循环之后开始执行微任务
  // nextTick的作用是获取DOM上最新的数据，当微任务执行的时候，DOM元素还没有渲染到浏览器上，此时如何获取值的呢?
  // 当nextTick里的回调函数执行之前，数据已经被改变了，当重新改变这个数据的时候，其实会立即发送通知，通知watcher渲染视图.在watcher中会先把DOM上的数据进行更新，即更改DOM树
  // 至于这个DOM什么时候更新到浏览器，是在当前这次事件循环结束之后才会执行DOM的更新操作
  // nextTick内部如果使用promise的话，即微任务的话，其实在获取微任务的时候，是从DOM树上直接获取数据的，此时的DOM还没有渲染到浏览器上
  // nextTick中优先使用微任务
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    // ios大于等于9.3.3是不会使用promise，会存在潜在的问题，所以会降级成setTimeout
    if (isIOS) setTimeout(noop);
  };
  // 标记nextTick使用的是微任务
  isUsingMicroTask = true;
// 判断当前不是IE浏览器并且支持MutationObserver
// MutationObserver对象的作用是监听DOM对象的改变，如果改变之后会执行一个回调函数，这个函数也是以微任务的形式执行
// MutationObserver这个对象在IE10和IE11中才支持，并在11中又不是完全支持，有些小问题
// 这里兼容的是PhantomJS, iOS7, Android 4.4这些浏览器
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
// 如果不支持Pormise也不支持MutationObserver，就会降级成setImmediate
// 类似定时器，与setTimeout的区别在于这个只有两个地方支持，一个是IE浏览器，一个是nodejs
// 那为啥不用优先用setImmediate，因为他的性能比setTimeout好，setTimeout虽然写的是0，最快也要等4毫秒才去执行，而setImmediate会立即执行
// 在nodejs中打印，setImmediate始终在setTimeout之前执行
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  // 虽然这里写的是0，最快也要等4毫秒才去执行setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0);
  };
}

// 第一个是回调函数，可选
// 第二个是上下文，就是Vue实例，可选
function nextTick (cb, ctx) {
  let _resolve;
  // callback是数组，里面存了所有的回调函数，往数组中push了回调函数的调用
  callbacks.push(() => {
    // 如果用户传了cb回调函数，因为用户传递的要进行错误判断
    // 如果没有传递cb就判断_resolve，_resolve有值就直接调用_resolve，这个_resolve就是下面的代码中，接收promise传进来的resolve
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  // 判断队列是否正在被处理，如果没有被处理，就进入
  if (!pending) {
    // 设置当前队列正在被处理
    pending = true;
    // 这个函数就是遍历所有的callback数组，然后执行每一个callback函数
    timerFunc();
  }
  // $flow-disable-line
  // 如果没有cb且Promise对象存在就将返回的reslove设置给_resolve
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve;
    })
  }
}

let mark;
let measure;

{
  const perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = tag => perf.mark(tag);
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

let initProxy;

{
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    );
  };

  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    );
  };

  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`);
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  const hasHandler = {
    has (target, key) {
      const has = key in target;
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key);
        else warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key);
        else warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    // 首先判断该环境下是否有proxy对象
    // 如果有代理对象就用new Proxy初始化，否则就把_renderProxy设置成Vue实例
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options;
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

const seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  let i, keys;
  const isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}

/*  */

const normalizeEvent = cached((name) => {
  const passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  const once = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once ? name.slice(1) : name;
  const capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name,
    once,
    capture,
    passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    const fns = invoker.fns;
    if (Array.isArray(fns)) {
      const cloned = fns.slice();
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`);
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove,
  createOnceHandler,
  vm
) {
  let name, def, cur, old, event;
  for (name in on) {
    def = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
       warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  let invoker;
  const oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  const propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  const res = {};
  const { attrs, props } = data;
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key);
      {
        const keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            `Prop "${keyInLowerCase}" is passed to component ` +
            `${formatComponentName(tag || Ctor)}, but the declared prop name is` +
            ` "${key}". ` +
            `Note that HTML attributes are case-insensitive and camelCased ` +
            `props need to use their kebab-case equivalents when using in-DOM ` +
            `templates. You should probably use "${altKey}" instead of "${key}".`
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  // 将二维数组转换成一维数组，如果children中有组件，并且组件是函数组件(二维数组)的话就会做这样的处理
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      // concat将两个数组转化成一个数组，还有一个作用是如果children是一个二维数组，那么就会将其展开成一维数组合并到前面的数组中
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  // 如果children是原始值，就调用createTextVNode创建文本VNode节点，并包装成数组形式
  // 如果childrend是数组，那么就要将children降维成一维数组，方便后续处理
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  const res = [];
  let i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`);
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = `__vlist${nestedIndex}_${i}__`;
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  // 找到$options.provide对象(也可能是函数)，将这个成员存储到vm._provided中(如果是函数，就调用改变其this，如果是对象直接存储)
  // 这个属性在initInject中会使用到
  const provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

// 依赖注入的实现原理
function initInjections (vm) {
  // 将inject对象的所有属性，判断这些属性如果在vm._provided属性中存在就提取出来放到result
  const result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    // 遍历属性将其注入到Vue实例并设置成响应式数据
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      // 生产环境下如果直接给inject环境赋值会发送警告
      {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          );
        });
      }
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null);
    // 核心代码，重点看
    // 先拿到inject里面所有的keys
    const keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);
    // 这些keys是inject中的所有属性，判断keys是否在source._provided里面，source就是vm实例
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from;
      let source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          // 如果这个属性在source._provided中，就放到result里面
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else {
          warn(`Injection "${key}" not found`, vm);
        }
      }
    }
    // 最终返回result
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  const slots = {};
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i];
    const data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      const name = data.slot;
      const slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (const name in slots) {
    if (slots[name].every(isWhitespace)) {
      delete slots[name];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  let res;
  const hasNormalSlots = Object.keys(normalSlots).length > 0;
  const isStable = slots ? !!slots.$stable : !hasNormalSlots;
  const key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (const key in slots) {
      if (slots[key] && key[0] !== '$') {
        res[key] = normalizeScopedSlot(normalSlots, key, slots[key]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (const key in normalSlots) {
    if (!(key in res)) {
      res[key] = proxyNormalSlot(normalSlots, key);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  const normalized = function () {
    let res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return () => slots[key]
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  let ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      const iterator = val[Symbol.iterator]();
      let result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  // vnode数组
  fallback,
  props,
  bindObject
) {
  const scopedSlotFn = this.$scopedSlots[name];
  let nodes;
  // 作用域插槽
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      if ( !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        );
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    // 根据插槽的名字获取值，如果没有值就使用fallback，fallback的值就是slot定义时候的默认值
    nodes = this.$slots[name] || fallback;
  }

  const target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  const mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
       warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      let hash;
      for (const key in value) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          const type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        const camelizedKey = camelize(key);
        const hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            const on = data.on || (data.on = {});
            on[`update:${key}`] = function ($event) {
              value[key] = $event;
            };
          }
        }
      }
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  const cached = this._staticTrees || (this._staticTrees = []);
  // 首先从缓存中获取静态根节点对应的代码
  let tree = cached[index];
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
  );
  // 调用markStatic，作用是把当前返回的vnode节点标记为静态的
  markStatic(tree, `__static__${index}`, false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ``}`, true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  // 作用是把当前返回的vnode节点标记为静态的
  // 如果当前的tree是数组的话，会遍历数组中所有的vnode，然后调用markStaticNode，否则直接调用markStaticNode标记为静态的
  // vnode被标记为静态之后，将来调用patch函数的时候，他内部会判断，如果当前vnode是静态的，不再对比节点的差异，直接返回.因为静态节点不再发生变化，不需要进行处理，这是对静态节点的优化，如果静态节点已经渲染到了文档上，那此时它不需要重新被渲染
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  // 这个把vnode节点设置为静态的
  node.isStatic = true;
  // 记录key和isOnce
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      const on = data.on = data.on ? extend({}, data.on) : {};
      for (const key in value) {
        const existing = on[key];
        const ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (let i = 0; i < fns.length; i++) {
    const slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (let i = 0; i < values.length; i += 2) {
    const key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ( key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        `Invalid value for dynamic directive argument (expected string or null): ${key}`,
        this
      );
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  // 参数target是vue实例
  // 这些方法在编译的时候会使用到,这些方法都是和渲染相关的
  target._o = markOnce;
  target._n = toNumber;
  // 转化成字符串的方法
  target._s = toString;
  target._l = renderList;
  // 渲染插槽
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  // 用来处理静态内容
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  // 创建了文本的虚拟节点
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  const options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  let contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  const isCompiled = isTrue(options._compiled);
  const needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = () => {
    if (!this.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this.$slots = resolveSlots(children, parent)
      );
    }
    return this.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = (a, b, c, d) => {
      const vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d, needNormalization);
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  const options = Ctor.options;
  const props = {};
  const propOptions = options.props;
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) mergeProps(props, data.attrs);
    if (isDef(data.props)) mergeProps(props, data.props);
  }

  const renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  const vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    const vnodes = normalizeChildren(vnode) || [];
    const res = new Array(vnodes.length);
    for (let i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  const clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

// inline hooks to be invoked on component VNodes during patch
const componentVNodeHooks = {
  init (vnode, hydrating) {
    // 首先处理keep-alive的情况，跳过
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      // 创建组件的实例
      // activeInstance是激活的实例，是当前组件对象的父组件对象
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      // 创建完组件对象之后调用$mount方法
      // 创建dom，但是没有挂载到dom树上，挂载是在vdom/patch.js中
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch (oldVnode, vnode) {
    const options = vnode.componentOptions;
    const child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert (vnode) {
    const { context, componentInstance } = vnode;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy (vnode) {
    const { componentInstance } = vnode;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

const hooksToMerge = Object.keys(componentVNodeHooks);
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
function createComponent (
  // 组件类，构造函数，函数，对象
  Ctor,
  // 创建vnode需要的数据
  data,
  // 创建上下文，Vue实例或者当前组件实例
  context,
  // 子节点数组
  children,
  // 标签名称
  tag
  // 返回值是创建好的VNode对象
) {
  if (isUndef(Ctor)) {
    return
  }

  // 通过实例的选项获取Vue构造函数
  const baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  // 如果 Ctor 是选项对象的话
  // 就调用extend，把选项对象转换成组件的构造函数
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    {
      warn(`Invalid Component definition: ${String(Ctor)}`, context);
    }
    return
  }

  // async component
  // 处理异步组件，如果Ctor上没有cid，就是异步组件
  // 组件的构造函数中设置了cid，这里跳过
  let asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
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

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // 当组件构造函数创建完毕后，合并当前组件选项和通过Vue.mixins混入的选项
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  // 处理组件上的v-model指令
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  // 创建组件vnode的核心位置
  // 安装组件的钩子函数 默认钩子函数init/prepatch/insert/destory
  installComponentHooks(data);

  // return a placeholder vnode
  // 获取组件的名称
  const name = Ctor.options.name || tag;
  // 核心核心核心
  // 创建组件对应的VNode对象
  // { Ctor, propsData, listeners, tag, children }，componentOptions有这些属性
  // 注意：Ctor在init钩子函数内部通过new VNode.componentOptions.Ctor创建了组件的对象
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  );

  // 最后返回vnode对象
  return vnode
}

function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode,
  // activeInstance in lifecycle state
  parent
) {
  // 创建了options对象
  // _isComponent 当前是否是组件
  // _parentVnode 父组件cnode
  // parent 传入的父组件对象，vue实例
  const options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  };
  // check inline-template render functions
  // 处理inlineTemplate，跳过
  const inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  // 通过new调用组件的构造函数，创建组件对象，
  // 在组件的vue的构造函数内部又会调用Vue中的_init方法，
  // 传入了options
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  //获取data.hook，用户传入的组件钩子函数
  const hooks = data.hook || (data.hook = {});
  // 这里遍历hooksToMerge中的名字，init/prepatch/insert/destory
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i];
    // 获取用户传入的钩子函数
    const existing = hooks[key];
    // componentVNodeHooks的钩子函数
    const toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      // 用mergeHook把两者的钩子函数合并到一起
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  // 创建一个函数，内部先调用内部钩子函数，再调用用户传入的钩子函数，然后将这个函数返回，作为新的钩子函数
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  const prop = (options.model && options.model.prop) || 'value';
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  const on = data.on || (data.on = {});
  const existing = on[event];
  const callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

const SIMPLE_NORMALIZE = 1;
const ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  // 传入的是vue实例
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  // 处理参数，如果data是数组或者是原始值，其实data是children
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    // 将data赋值给children，将自己变成undefined
    children = data;
    data = undefined;
  }
  // 用户传入的render函数，这个值是false
  // 用来处理children参数
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE; // 常量 2
  }
  // 这个函数中创建了VNode
  return _createElement(context, tag, data, children, normalizationType)
}

// 创建VNode
// 这里和snabbdom有所不同，因为里面处理了组件和其他的内容
function _createElement (
  // Vue实例或者组件实例
  context,
  // 可以是标签名臣个，可以是组件、函数、对象
  tag,
  data,
  children,
  normalizationType
) {
  // 如果是data存在且是响应式数据会警告避免使用响应式数据，并且返回一个空的VNode
  if (isDef(data) && isDef((data).__ob__)) {
     warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // 如果data中有is属性，会记录到tag中
  // 这个会把is后面的组件名称，找到对应组件渲染到component中
  // <component v-bind:is="currentTabComponent"></component>
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  // tag变量如果是false，is指令就是false，会返回一个空的VNode节点
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // 判断是否有key，或者key不是原始值就会报警告，key应该是字符串和数字
  if (
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      );
    }
  }
  // support single function children as default scoped slot
  // 这里处理作用域插槽，跳过
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }

  // 判断render函数类型，分别将多维数组转化为一维数组
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 如果是用户传递的render函数就调用normalizeChildren，对children变量进行处理
    children = normalizeChildren(children);
    // 如果是渲染器生成的render就调用simpleNormalizeChildren
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  // 核心 创建VNode对象
  let vnode, ns;
  // 1. 判断tag是否是字符串
  if (typeof tag === 'string') {
    let Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    // 1.1 判断是否是html的保留标签，直接创建VNode
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if ( isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        );
      }
      // 创建VNode
      // config.parsePlatformTagName(tag)是tag标签
      // context是vue实例
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    // 1.2 如果tag存在，是字符串，且不是html保留标签
    //     就判断data是否存在，或者data的pre是否存在，如果存在，就通过一个函数获取对应的组件
    //     会获取选项中的components，所有组件，通过组件的名称取得当前组件
    //     调用这个函数的目的是对当前组件的，名称进行处理
    //     这里主要是判断是否是自定义组件，这里先跳过
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      // 获取组件，通过createComponent创建组件对应的VNode对象
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
    // 1.3 如果tag不是html保留标签，其实是自定义标签，直接创建其VNode对象
    // unknown or unlisted namespaced elements
    // check at runtime because it may get assigned a namespace when its
    // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // 2. 如果tag不是字符串，那他应该是一个组件，通过createComponent创建组件对应的VNode对象
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }

  // 判断VNode是否是数组，是的话直接返回VNode对象
  if (Array.isArray(vnode)) {
    return vnode
  // 如果不是数组且定义好了，就对VNode进行简单的初始化处理  
  } else if (isDef(vnode)) {
    // 处理VNode的命名空间
    if (isDef(ns)) applyNS(vnode, ns);
    if (isDef(data)) registerDeepBindings(data);
    return vnode
  } else {
    // 如果上面都不满足，就返回一个空的注释节点
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  const options = vm.$options;
  const parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context;
  // 初始化$slots/$scopedSlots两个与插槽相关的属性
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  // 重点方法 _c/$createElement
  // 对手动传入template属性，其编译生成的 render 进行渲染的方法，其调用的也是createElement，最后一个参数不一样
  // 当把template编译成render函数的时候，其内部会调用_c
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false);
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // 对手动传入的 render 函数进行渲染的方法
  // $createElement就是new Vue的时候传入render(h)的h函数，作用是把虚拟DOM转换成真实DOM
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true);

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  // 定义$attrs和$listeners属性，用defineReactive是定义响应式数据，这些数据是只读的，开发环境不允许赋值
  {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm);
    }, true);
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm);
    }, true);
  }
}

let currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  // 安装了渲染相关的一些帮助方法,将Vue原型传入
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    const vm = this;
    // 从options中获取了render,这个render是用户定义的render,或者是模板渲染的render
    const { render, _parentVnode } = vm.$options;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    let vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      // 核心,在_render中调用了传入的渲染函数
      // 通过call方法调用,第一个方法是改变其内部的this
      // render(h),这个$createElement就是h,生成虚拟DOM
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, `render`);
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if ( vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, `renderError`);
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ( Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  const node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data, context, children, tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  const owner = currentRenderingInstance;
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    const owners = factory.owners = [owner];
    let sync = true;
    let timerLoading = null;
    let timerTimeout = null

    ;(owner).$on('hook:destroyed', () => remove(owners, owner));

    const forceRender = (renderCompleted) => {
      for (let i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    const resolve = once((res) => {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    const reject = once(reason => {
       warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });

    const res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(() => {
              timerLoading = null;
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(() => {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                 `timeout (${res.timeout}ms)`
                  
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

function initEvents (vm) {
  // 给vm添加了属性_events，这个属性是用来存储事件名称以及对应的处理函数，键就是事件名称，值就是事件处理函数
  // 值是数组形式，因为一个事件名称对应多个事件处理函数，发布订阅模式中曾经模拟过这种形式
  // 在下面的$on中可以看到其使用
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  // 获取父元素上附加的事件，注册到当前组件中
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

let target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  const _target = target;
  return function onceHandler () {
    const res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  const hookRE = /^hook:/;
  // 注册事件
  Vue.prototype.$on = function (event, fn) {
    const vm = this;
    // 判断事件是否是数组,如果是数组就遍历数组给多个事件注册处理函数
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    // 如果是字符串就调用_events,events是一个对象  
    } else {
      // vm._events = Object.create(null)
      // 对象属性就是事件的名称,根据对象属性找事件存储的内容,如果没有找到就初始化成数组
      // 最终的结果将处理函数添加到数组中
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    const vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    const vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn);
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    const vm = this;
    {
      const lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        );
      }
    }
    let cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      const args = toArray(arguments, 1);
      const info = `event handler for "${event}"`;
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

let activeInstance = null;
let isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  // 把当前的activeInstance记录到一个常量中
  const prevActiveInstance = activeInstance;
  // 然后将vm是父组件对象，记录到activeInstance
  activeInstance = vm;
  // 返回父组件对象，之前赋值的常量，这么做的目的是解决组件嵌套的问题
  // activeInstance，之后在创建子组件的过程中，他就是parent，组组件对象
  return () => {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  const options = vm.$options;

  // locate first non-abstract parent
  // 找到当前Vue实例的父组件，将其添加到父组件的$children里面去，即在父组件中添加子组件
  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  // 把parent记录到$parent中
  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};
  // _开头的都是私有成员
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  // 更新,最最核心的是里面调用了patch方法
  // patch的作用是把虚拟DOM转换成真实DOM挂载到$el中
  Vue.prototype._update = function (vnode, hydrating) {
    const vm = this;
    const prevEl = vm.$el;
    // 从实例vm中获取_vnode，_vnode是之前处理过的对象
    const prevVnode = vm._vnode;
    // 将当前vm实例存储起来，存储到activeInstance中
    const restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    // 判断是不是第一次调用,如果prevVnode不存在就是首次调用，如果是就调用上面的patch,如果不是就调用下面的patch
    if (!prevVnode) {
      // initial render
      // 调用vm.__patch__方法
      // 第一个参数：传入真实DOM，vm.$el
      // 第二个参数：刚才创建好的vnode
      // 这个方法是将真实dom转换成虚拟dom然后和vnode进行比较，将比较后的结果转换成真实DOM，更新给vm.$el
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      // 如果不是首次调用，将老的vnode和新的vnode进行比较，新的vnode转换成真实DOM，更新给vm.$el
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    // 调用完patch之后，调用restoreActiveInstance还原之前的activeInstance
    // 这个过程解决的是多层组件嵌套，找父子组件的问题
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  // 强制更新,会调用_watcher的update
  Vue.prototype.$forceUpdate = function () {
    const vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };
  // 销毁Vue实例
  Vue.prototype.$destroy = function () {
    const vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    const parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    let i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  // 判断如果没有render选项，且还有template选项就发出警告，要么使用运行时版本，要么就用render函数
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  // 触发挂载前的生命周期钩子函数
  callHook(vm, 'beforeMount');
  // 这个函数是更新组件\挂载的函数
  let updateComponent;
  /* istanbul ignore if */
  // 如果是开发环境且启用了性能检测，下面是性能检测的代码，可忽略
  if ( config.performance && mark) {
    updateComponent = () => {
      const name = vm._name;
      const id = vm._uid;
      const startTag = `vue-perf-start:${id}`;
      const endTag = `vue-perf-end:${id}`;

      mark(startTag);
      const vnode = vm._render();
      mark(endTag);
      measure(`vue ${name} render`, startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(`vue ${name} patch`, startTag, endTag);
    };
  } else {
    // 定义updateComponent
    updateComponent = () => {
      // _render的作用是调用用户传入的render函数或者编译器生成的render，最终会返回虚拟DOM，把虚拟DOM传给_update
      // _update方法会将虚拟DOM转化成真实DOM，最后更新到界面上，调用vm.__patch__
      // 这句话执行完毕之后就会看到模板被渲染到了界面上
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 创建了一个Watcher对象，并把updateComponent传入，所以其执行是在Watcher中调用的
  // 第三个参数是noop空函数，第三个参数对用户和计算属性watcher是有用的，渲染watcher没有用
  // 第四个参数是对象，里面定义了before函数，触发生命周期钩子函数
  // 最后一个参数是true，标记这个watcher是渲染watcher
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  // 最后触发了mounted生命周期钩子函数，表示已经挂载完成
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots;
  const oldScopedSlots = vm.$scopedSlots;
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    const props = vm._props;
    const propKeys = vm.$options._propKeys || [];
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i];
      const propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  const oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  const handlers = vm.$options[hook];
  const info = `${hook} hook`;
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

const MAX_UPDATE_COUNT = 100;

const queue = [];
const activatedChildren = [];
let has = {};
let circular = {};
let waiting = false;
let flushing = false;
let index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  {
    circular = {};
  }
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
let currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now();
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow();
  // 标记true，表示正在处理队列
  flushing = true;
  let watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 为了保证下面三点内容：
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 组件被更新的顺序是从父组件到子组件，因为先创建的父组件，后创建的子组件
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 组建的用户watcher要在其对应的渲染watcher之前运行，因为用户watcher是在渲染watcher之前创建的
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 如果一个组件在父组件执行之前被销毁了，那应该跳过

  // 先对queue进行id的从小到大排序，即watcher的创建顺序
  queue.sort((a, b) => a.id - b.id);

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  // 遍历queue中的所有watcher，不要缓存lenth，因为watcher在执行的过程中在队列中可能会加入新的watcher
  for (index = 0; index < queue.length; index++) {
    // 获取watcher，判断其是否有before函数，有before函数是在渲染watcher中才有的，触发钩子函数beforeUpdate
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    // 获取watcher的id，将其处理为null，下次调用的时候还能正常被运行
    id = watcher.id;
    has[id] = null;
    // 调用watcher的run方法
    watcher.run();
    // in dev build, check and stop circular updates.
    if ( has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  const activatedQueue = activatedChildren.slice();
  const updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i];
    const vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
// 接收一个参数，watcher对象
function queueWatcher (watcher) {
  // 获取watcher对象的id
  const id = watcher.id;
  // 判断has[id]，has是个对象，如果是null说明watcher没有被处理，防止重复处理
  if (has[id] == null) {
    // 标识已经处理过了
    has[id] = true;
    // 这段代码的功能是将watcher对象添加到队列中

    // flushing是正在刷新的意思，如果其为true说明队列正在被处理，队列queue就是watcher对象，是watcher对象正在被处理
    // 判断队列没有被处理的时候，将watcher直接放到队列的末尾中
    if (!flushing) {
      queue.push(watcher);
    } else {
      // 如果这个队列正在被处理
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      // 获取队列的长度
      let i = queue.length - 1;
      // index是处理到了队列的第几个元素，i > index 表示该队列还没有被处理完，就获取队列中的watcher对象，判断id是否大于当前正在处理的id，如果大于就将i--
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      // 这样就把处理的watcher放到了合适的位置中
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    // 判断当前队列是否被执行，如果没有被执行就进入
    if (!waiting) {
      waiting = true;
      // 如果是开发环境的话，就直接执行flushSchedulerQueue函数，如果是生产环境，将flushSchedulerQueue传给nextTick
      if ( !config.async) {
        // 这个函数会遍历所有的watcher，并调用watcher的run方法
        flushSchedulerQueue();
        return
      }
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



let uid$1 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
class Watcher {
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  constructor (
    vm,
    expOrFn,
    cb,
    options,
    // 是否是渲染Watcher，有三种Watcher
    /**
     * watcher有三种
     * - 第一种是渲染Watcher，当前的Watcher
     * - 计算属性的Watcher
     * - 侦听器的Watcher
     */
    isRenderWatcher
  ) {
    this.vm = vm;
    // 判断是不是渲染watcher，如果是就把当前watcher记录到实例的_watcher中
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    // 记录到_watchers中，这里面的watcher不仅仅是渲染watcher，还有计算属性watcher和侦听器的watcher
    vm._watchers.push(this);
    // options
    // 这些选项都与渲染watcher无关，默认这些值都是false，非渲染的watcher会传入一些选项
    if (options) {
      this.deep = !!options.deep;
      // 用户的user会将这个设置为true
      this.user = !!options.user;
      // lazy 延迟执行，watcher要更新视图，那lazy就是是否延迟更新视图，当前是首次渲染要立即更新所以值是false，如果是计算属性的话是true，当数据发生变化之后才去更新视图
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      // 传入的before函数，会触发生命周期的beforeUpdate
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    // cb是构造函数的第三个参数，渲染参数是noop空函数，当用watcher的时候会传入一个回调，会对比新旧两个值
    this.cb = cb;
    // watcher唯一标识
    this.id = ++uid$1; // uid for batching
    // 标识当前watcher是否是活动的
    this.active = true;
    // 开始让lazy的值给dirty
    this.dirty = this.lazy; // for lazy watchers
    // 记录与watcher相关的dep对象
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression =  expOrFn.toString()
      ;
    // parse expression for getter
    // 第二个参数如果是function就直接把变量赋值给getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      // 如果是字符串的话要进一步处理，如何处理先不关注，如果是侦听器的话第二个参数传入的就是字符串
      // 例如：watch:{ 'person': function ...}
      // parsePath这个函数的作用是生成一个函数来获取属性的值，将这个函数返回的新函数记录到getter中
      // 此时的getter是一个函数，这个函数的作用是返回属性结果，获取属性 person 的值，触发了这个属性的getter，触发 getter 的时候会去收集依赖
      // 此时并没有执行而是记录下来了
      this.getter = parsePath(expOrFn);
      // 做了一些错误的处理，开发环境getter不存在就会有警告
      if (!this.getter) {
        this.getter = noop;
         warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    // 给this.value赋值，先判断this.lazy，如果当前不要求延迟执行就立即执行get方法
    // this.lazy如果是计算属性的watcher是true，延迟执行，其他watcher是false立即执行
    this.value = this.lazy
      ? undefined
      : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    // 调用pushTarget，将当前的Watcher对象放入栈中
    // 每个组件对应一个Watcher，Watcher会去渲染视图，如果组件有嵌套的话会先渲染内部的组件，所以要将父组件的Watcher先保存起来，这是这个pushTarget的作用
    pushTarget(this);
    let value;
    const vm = this.vm;
    try {
      // 最关键的一句话
      // 这句话调用了getter，getter存储的是传入的第二个参数，且是函数，首次渲染是updateComponent，所以在get方法的内部调用了updateComponent，并且改变了函数内部的this指向到Vue实例vm，并且传入了vm
      // 这里将虚拟DOM转化成了真实DOM并更新到页面中

      // 如果是用户watcher的话，这个getter是获取属性的，如果在获取属性的时候有异常，下面会处理异常，这里不看
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`);
      } else {
        throw e
      }
      // 执行完毕之后会进行清理工作
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      // 将watcher从栈中弹出
      popTarget();
      // 会把当前watcher会从dep.subs数组中移除，把watcher里面的dep也移除
      this.cleanupDeps();
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  // 接收参数dep对象
  addDep (dep) {
    // 获取Dep的id，每创建一个dep都会让id++，是唯一标识
    const id = dep.id;
    // 当前是否已经存储了Dep对象，如果没有就将id和其对应的dep对象存储到内部的集合中
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        // 最后会将watcher对象添加到dep对象的sub中
        dep.addSub(this);
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    // 渲染watcher中，lazy和sync是false，会执行queueWatcher
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    // 标记当前watcher是否是存活的状态，默认为true，可处理
    if (this.active) {
      // 调用其get方法，如果是渲染watcher会调用getter，执行updateComponent方法渲染DOM更新页面
      // 之后用value记录返回结果，如果是渲染watcher没有返回结果，value是undefined，渲染函数的cb是noop空函数.
      // 如果是用户watcher，继续执行，获取旧值记录新值，调用cb回调函数，侦听器的function就是回调函数，
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;
        if (this.user) {
          // 如果是用户watcher，添加异常处理
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`);
          }
        } else {
          // 如果是其他watcher，直接调用
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    this.value = this.get();
    this.dirty = false;
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  }
}

/*  */

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  // 注册get，set
  // 获取的时候是this._props[属性名称] or this._data[属性名称]返回值
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };   
  // target是Vue实例，将key注入到实例中
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  // 获取了实例中的$options
  // 判断props，methods，data，computed，watch这些属性，如果有就用init进行初始化
  const opts = vm.$options;
  // initProps：把props数据转换成响应式数据并且注入到Vue实例中
  if (opts.props) initProps(vm, opts.props);
  // initMethods：初始化了选项中的methods，在注入之前判断了方法名称和值
  if (opts.methods) initMethods(vm, opts.methods);
  // 如果参数中有data就执行initData
  // 如果参数中没有data就在vm初始化一个_data并赋值一个空对象，并且进行响应式处理
  if (opts.data) {
    //initData：初始化选项中的data，注入到Vue实例中，注入之前进行重名判断.并且将data进行响应式处理
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  // 初始化计算属性和侦听器，注入到Vue实例中
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  const propsData = vm.$options.propsData || {};
  // 定义了一个_props对象并存到props常量中
  const props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = [];
  const isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  // 遍历propsOptions(vm.$options.props)的所有属性，将属性都通过defineReactive转换成 get\set 注入到props(vm._props)里面
  // 所有的成员都会再_props里面存储
  for (const key in propsOptions) {
    keys.push(key);
    const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    {
      const hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        );
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          );
        }
      });
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // vm.$options.props判断是否在Vue实例中存在，如果不存在通过proxy方法把属性注入到Vue实例中
    if (!(key in vm)) {
      proxy(vm, `_props`, key);
    }
  }
  toggleObserving(true);
}

function initData (vm) {
  // 获取options中的data选项
  let data = vm.$options.data;
  // 判断data是否是function，如果是就调用getData，该函数内部核心数据是用call调用data
  // 当组件中初始化data的时候会设置成一个函数
  // 如果是Vue实例中的data是一个对象，并没有传入就初始化一个空对象
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
     warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  // 接下来获取了data中的所有属性，还获取了props和methods的所有属性，目的也是判断data中的成员是否与props和methods重名.如果有就发送警告.
  const keys = Object.keys(data);
  const props = vm.$options.props;
  const methods = vm.$options.methods;
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
       warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      );
    // 如果不是_或者$开头，就会把属性注入到Vue实例中，
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key);
    }
  }
  // observe data
  // 把data转化成响应式对象
  // 第一个参数是选项options中的data
  // 第二个参数是根数据
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    // 此时的data是一个函数，通过call调用data
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`);
    return {}
  } finally {
    popTarget();
  }
}

const computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  // 定义了一个私有属性，里面存储的是一个键值对的形式，键是计算属性的名字，值就是计算属性对应的function
  const watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  // 判断当前环境是否是服务端渲染的环境
  const isSSR = isServerRendering();
  // 遍历用户定义的计算属性 computed：{ a: function () {}, b: { get: ..., set: ...}}
  // 值可能是函数，也可能是对象
  for (const key in computed) {
    // 获取计算属性的值
    const userDef = computed[key];
    // 判断是不是function，如果不是就调用其get方法
    const getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ( getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      );
    }
    // 如果不是服务端渲染，就会创建一个watcher对象，并且记录到刚才的vm._computedWatchers变量中
    if (!isSSR) {
      // create internal watcher for the computed property.
      // 第一个参数是Vue实例，第二个参数是计算属性对应的function，第三个参数侦听器里面用到的，第四个参数是开始的时候不立即执行
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions // { lazy: true }
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    // 如果vm上没有当前计算属性的名字，则在vm上定义该计算属性，否则如果是开发环境发送警告
    // 在初始化计算属性的时候，已经初始化了props，datas，methods，如果上面有key就已经发生了冲突
    if (!(key in vm)) {
      // 没有就执行这个函数，并把vue实例，key和值都传进去
      defineComputed(vm, key, userDef);
    } else {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm);
      }
    }
  }
}

// 把计算属性定义到vue的实例上
function defineComputed (
  target,
  key,
  userDef
) {
  // 如果不是服务端渲染的环境，应该就是去缓存的
  const shouldCache = !isServerRendering();
  // 判断用户传入的是对象还是function，用于去设置当前属性的描述符，get和set的值
  if (typeof userDef === 'function') {
    // 核心函数
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      );
    };
  }
  // 给vue实例增加计算属性的名字
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    // 获取该计算属性对应的watcher对象
    const watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // 这个位置起到缓存的作用
      // 第一次访问计算属性的时候，dirty为true执行evaluate获取计算属性的值，并把dirty设为false，
      /**
       *   evaluate () {
            this.value = this.get()
            this.dirty = false
          }
       */
      // 当再次访问计算属性，没有发生变化，dirty的值如果依然为false，不执行evaluate，直接返回watcher.value
      // 当数据改变之后会调用 watcher 的 update 方法，把dirty改变为true，下次访问就会访问新的值
      /**
       * update () {
            if (this.lazy) {
              this.dirty = true
            } else if (this.sync) {
              this.run()
            } else {
              queueWatcher(this)
            }
          }
       */
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  // 获取选项中的$options.props，这里为什么要获取props是为了下面名称重复排查需要
  const props = vm.$options.props;
  // 遍历methods中的所有属性(方法名称)
  for (const key in methods) {
    {
      // 如果是开发环境判断methods值是否是function，如果不是function就会发送警告
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        );
      }
      // 当前方法名称是否在props中存在，会警告此名称已经在props中存在，因为最终props和methods都要注入到Vue的实例上，所以他们不能有同名存在.
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        );
      }
      // 判断方法名称是否在vue中存在，并且判断该名称是否以_或者$开头
      // 如果以下划线开头，那Vue认为这是一个私有属性，不建议这样命名
      // 如果以$开头，公认为Vue提供的成员，也不建议这样命名
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        );
      }
    }
    // 最后将methods值注入到Vue实例中来，先判断这个值是否是function，如果不是就直接返回一个noop空函数，如果是就返回该函数的bind方法，bind方法是改变this指向
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  // 遍历用户传入的watch的属性，这里是user
  for (const key in watch) {
    // 获取watch的值，可以是数组，也可以是对象，函数
    const handler = watch[key];
    // 如果是数组，就对元素进行遍历，每一个元素都创建watcher，当这个属性变化的时候，会执行多个回调
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    // 如果不是数组，直接执行createWatcher
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  // Vue实例，对应属性，和handler
  vm,
  expOrFn,
  handler,
  options
) {
  // 先判断handler是否是一个原生对象
  if (isPlainObject(handler)) {
    options = handler;
    // 真正的handler，回调函数
    handler = handler.handler;
  }
  // 判断handler是否是字符串，如果是字符串就会去实例对象上找，也就是methods中定义的方法
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  // 将解析好的数据给$watch
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  // 定义描述符,get方法返回实例对象的_data,_props
  const dataDef = {};
  dataDef.get = function () { return this._data };
  const propsDef = {};
  propsDef.get = function () { return this._props };
  // 如果是开发环境下,不允许给$data和$props赋值
  {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn(`$props is readonly.`, this);
    };
  }
  // 通过Object.defineProperty给原型上添加$data,$props
  // 后面是两个对象的描述符,上面给描述符定义了get方法
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  // 在原型是挂载了$set和$delete,这个与Vue.set\Vue.delete是一模一样的
  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  //原型上挂载了$watch,监视数据的变化，和在选项中配置watch是一样的
  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    // 获取当前实例，没有对应的静态方法，因为其用到了vue的实例
    const vm = this;
    // 判断回调函数是否是原生对象，如果是继续放到createWatcher中，这里要保证回调函数是函数
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    // 把当前watch的属性赋值，如果没有赋值空对象
    options = options || {};
    // 标记为用户watcher，侦听器
    options.user = true;
    // 创建用户watcher对象，expOrFn是侦听器的名字，即监听的属性，cb就是handler
    // options里面传的就是deep和immediate
    const watcher = new Watcher(vm, expOrFn, cb, options);
    // 判断选项中是否要立即执行
    if (options.immediate) {
      try {
        // 如果是就立刻调用回调函数，使用call改变其内部指向为vue实例，并将值返回
        // 使用try-catch是不确定我们传入的代码是否安全，不要阻塞之后的代码执行，
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`);
      }
    }
    // 返回取消监听的方法
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

let uid$2 = 0;
// 初始化了Vue实例的成员，并且触发了beforeCreate和created钩子函数，触发$mount渲染整个页面
// 不同的初始化在不同的模块中，结构很清晰，这些代码不需要记住，用到哪些成员回头看即可
function initMixin (Vue) {
  // 给 Vue 实例增加 _init()方法
  Vue.prototype._init = function (options) {
    // 定义一个vm常量指代Vue的实例
    const vm = this;
    // 定义uid，唯一标识
    vm._uid = uid$2++;

    // 开发环境下的性能检测，略过
    let startTag, endTag;
    /* istanbul ignore if */
    if ( config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`;
      endTag = `vue-perf-end:${vm._uid}`;
      mark(startTag);
    }

    // a flag to avoid this being observed
    // 标识当前实例是Vue实例，之后做响应式数据的时候不对其进行处理
    vm._isVue = true;
    // merge options
    // 合并options，这两个相似的是把用户传入的options和构造函数中的options进行合并
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    // 渲染时候的代理对象，实际设置成了Vue实例
    // 在渲染过程的时候会看到这个属性的使用
    {
      initProxy(vm);
    }
    // expose real self
    vm._self = vm;
    // 初始化的函数
    // 初始化和生命周期相关的内容
    // $children/$parent/$root/$refs
    // 这个函数中记录了组件之间的父子关系
    initLifecycle(vm);
    // 初始化当前组件的事件
    initEvents(vm);
    // 初始化render中所使用的h函数，初始化了几个属性$slots/$scopedSlots/_c/$createElement/$attrs/$listeners
    initRender(vm);
    // 触发声明周期的钩子函数beforeCreate
    callHook(vm, 'beforeCreate');
    // initInjections与initProvide是一对，实现依赖注入
    initInjections(vm); // resolve injections before data/props
    // 初始化 vm 的 _props/methods/_data/computed/watch
    initState(vm);
    // initProvide函数中，会把父组件提供的成员存储到_provided里面中
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ( config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(`vue ${vm._name} init`, startTag, endTag);
    }
    // 挂载整个页面
    // 组件中没有el属性，所以组件这里是不执行$mount的
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  // 基于vue实例vm构造函数中的的options创建当前vm实例的options
  const opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  // 获取options._parentVnode，即刚才占位的vnode对象
  const parentVnode = options._parentVnode;
  // 获取当前子组件的父组件对象
  // 把parent和parentVnode都记录到当前options中
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;
 
  const vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  let options = Ctor.options;
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  let modified;
  const latest = Ctor.options;
  const sealed = Ctor.sealedOptions;
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {};
      modified[key] = latest[key];
    }
  }
  return modified
}

// 为什么不用类创建而用构造函数创建Vue
// 此处不用 class 的原因是因为方便后续给Vue实例混入实例成员,如果用了class再用原型,很不搭.

// 定义Vue构造函数,接收一个参数options
function Vue (options) {
  // 判断环境,如果是开发环境,且this不是Vue的实例,说明没有用new Vue去调用构造函数,会报出警告
  if (
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  // 调用 _init() 方法
  this._init(options);
}
// 注册 vm  的 _init()方法, 初始化vm
initMixin(Vue);
// 继续混入 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue);
// 初始化事件相关方法
eventsMixin(Vue);
// 混入生命周期相关的方法
// _update/$forceUpdate/$destory
lifecycleMixin(Vue);
// 混入 render
// $nextTick/_render
renderMixin(Vue);

/*  */

/**
 * 
 * @param {*} Vue 传入Vue构造函数
 */
function initUse (Vue) {
  // 定义了Vue.use的方法,接收了一个参数plugin(插件,可以是函数也可以是对象)
  Vue.use = function (plugin) {
    // 定义了一个常量,installedPlugins表示已经安装的插件
    // 这个地方的this只是的Vue的构造函数
    // 获取_installedPlugins属性如果有就返回,如果没有就初始化成一个空数组,这个里面记录了安装的插件.
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    // 如果注册的插件已经存在,则直接返回,如果没有注册,下面注册插件,注册插件其实就是调用传入的插件
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    
  // 这里整体的功能是调用插件的方法并传递相应的参数
    // additional parameters
    // 这里对调用此方法的其余参数做处理
    // use方法可以传一个参数,也可以传多个参数,如果传多个参数,那么第一个是插件,其余的都是调用时候传入的参数
    // toArray方法将arguments转换成数组,后面的1是把第一个参数去掉
    const args = toArray(arguments, 1);

    // 将Vue构造函数插入到参数数组的第一项中
    args.unshift(this);

    // 如果plugin.install有值的话说明plugin是一个对象,直接调用其install方法
    // 文档中说,如果要注册一个插件,其中必须要有一个install方法,这是对插件的要求
    if (typeof plugin.install === 'function') {
      // 使用apply方法改变其内部的this,第一个传plugin是plugin调用的方法,apply方法会将args数组展开,第一个参数是Vue,intall方法要求的第一个参数也是Vue
      plugin.install.apply(plugin, args);
    // 如果是函数那么直接调用这个函数
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }

    // 当注册好插件之后要将插件保存到已安装的插件数组中
    installedPlugins.push(plugin);
    // 返回Vue的构造函数
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  // 传入参数,
  Vue.mixin = function (mixin) {
    // 这里的this指的是Vue构造函数
    // 把mixin对象的成员拷贝到Vue.options中,所以mixin注册的是全局选项,官网上有
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   * 定义唯一cid的目的，是保证创建一个包裹的子构造函数，通过原型继承，并且能够缓存他们
   */
  Vue.cid = 0;
  let cid = 1;

  /**
   * Class inheritance
   * 参数是组件的选项,对象
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    // Super是this是Vue构造函数，或者是组件的构造函数
    const Super = this;
    const SuperId = Super.cid;
    // 从缓存中加载组件的构造函数，如果有就直接返回，没有就初始化成一个空对象{}
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    // 获取组件名称，开发环境验证组件名称是否合法
    // 在Vue.component中已经验证过一次，但是Vue.extend在外部可以直接使用，所以这里再验证一次
    const name = extendOptions.name || Super.options.name;
    if ( name) {
      // 如果是开发环境验证组件的名称
      validateComponentName(name);
    }

    // ----------核心代码-------------
    // 创建一个构造函数 VueComponent ,组件对应的构造函数
    const Sub = function VueComponent (options) {
      // 调用_init()初始化
      this._init(options);
    };
    // 改变了构造函数的原型,让其继承自Vue,故所有的组件都继承自Vue
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    //设置cid，后面缓存的时候用
    Sub.cid = cid++;
    // 合并 options 选项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 把Super中的成员拷贝到VueComponent构造函数中来
    // 初始化子组件的props，computed
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    // 静态方法继承
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    // 注册Vue.component\Vue.filter\Vue.directive方法
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    // 在选项的components中记录自己
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    // 把组件的构造函数缓存到options._Ctor中
    cachedCtors[SuperId] = Sub;
    // 最后返回组件的构造函数VueComponent
    return Sub
  };
}

function initProps$1 (Comp) {
  const props = Comp.options.props;
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key);
  }
}

function initComputed$1 (Comp) {
  const computed = Comp.options.computed;
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

//参数是Vue构造函数
function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   * 没有直接定义而是遍历数组,里面其实就是'component','directive','filter'
   */
  ASSET_TYPES.forEach(type => {
    // 给每个值分别设置一个function
    Vue[type] = function (
      id,
      definition
    ) {
      // 没有传定义的话会找到之前options中定义的方法直接返回
      // id就是组件名称 or 指令名称
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        // 验证名称是否合法，不合法的话就直接报警告
        if ( type === 'component') {
          validateComponentName(id);
        }
        // 判断类型是否是组件,并且定义是否是原始的object
        /**
         * 判断类型是否是组件,且定义是否是原始的Object,判断其转换成字符串是不是'[object Object]'
         */
        if (type === 'component' && isPlainObject(definition)) {
          // 如果设置了组件名称name就用name,如果没有就用id作为组件名称
          definition.name = definition.name || id;
          // this.options._base就是Vue构造函数
          // Vue.extend()就是把普通对象转换成了VueComponent构造函数
          // 官方文档中也可以直接传一个Vue.extend构造函数,如果第二个参数definition是Vue.extend的构造函数,那么就直接执行return的最后一句话
          definition = this.options._base.extend(definition);
        }
        // 如果是指令,且是函数的话,会把定义赋值给bind和update两个方法
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        // 所有的内容处理之后够会直接挂载到this.options下面去,通过这个注册的是全局的组件\指令等
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */



function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance;
  for (const key in cache) {
    const cachedNode = cache[key];
    if (cachedNode) {
      const name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  const cached = cache[key];
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

const patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name));
    });
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name));
    });
  },

  render () {
    const slot = this.$slots.default;
    const vnode = getFirstComponentChild(slot);
    const componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      const name = getComponentName(componentOptions);
      const { include, exclude } = this;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this;
      const key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive
};

/*  */

// 定义了一个initGlobalAPI函数
function initGlobalAPI (Vue) {
  // config
  // 初始化Vue.config静态成员,定义了config属性的描述符
  const configDef = {};
  configDef.get = () => config;
  // 如果是开发环境,给config设置值的时候会触发set方法,触发警告不要给Vue.config重新赋值,可以在上面挂载方法
  {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  // 利用Object.defineProperty定义Vue.config属性
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // Vue.util里面增加了一些方法
  // 上面给了NOTE:这些方法不能被视作全局API的一部分,除非你已经意识到某些风险,否则不要去依赖他们
  // 意思是我们在调用这些方法的时候可能会出现意外,所以要避免去调用这些方法,vue这么做是其内部要进行使用
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  };

  // 静态方法set/delete/nextTick的定义
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  // 静态方法observable,这个方法是让对象变成可响应的,设置响应式数据
  Vue.observable = (obj) => {
    observe(obj);
    return obj
  };
  
  // 初始化Vue.options中的一些属性
  // 初始化了components/directives/filters
  // 先设置一个空对象,创建改对象的同时设置原型等于null,说明当前不需要原型,可以提高性能
  Vue.options = Object.create(null);
  /**
   * 
   * export const ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ]
   * 遍历数组的名字加s之后挂载到Vue.options下面,这三个属性对应的值都是一个空对象,它们的作用分别是存储全局的组件\指令和过滤器
   * 我们通过Vue.component,Vue.directive,Vue.filter注册的全局组件\指令和过滤器都会存储到Vue.options对应的属性上
   */
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // Vue的构造函数放到了options._base中
  Vue.options._base = Vue;

  /**
   * 注册全局组件keep-alive
   * extend
   * 在shared/util.js目录下,extend是实现了浅拷贝,第二个参数的成员拷贝给了第一个参数的成员
   * export function extend (to: Object, _from: ?Object): Object {
      for (const key in _from) {
        to[key] = _from[key]
      }
      return to
    }

    builtInComponents
    名字可以看出来这是一个内置组件,在core/components/index.js目录下,导出的组件其实是KeepAlive
    所以在还注册了内置组件keep-alive
   */
  extend(Vue.options.components, builtInComponents);
  
  /**
   * 方法在core/global-api/use.js
   * 注册 Vue.use() 用来注册插件
   */
  initUse(Vue);
  // 注册 Vue.mixin() 实现混入
  initMixin$1(Vue);
  // 注册 Vue.extend() 基于传入的options返回一个组件的构造函数
  initExtend(Vue);
  // 注册 Vue.directive()\Vue.component()\Vue.filter()
  initAssetRegisters(Vue);
}

// 给Vue的构造函数增加一些静态方法
initGlobalAPI(Vue);

// 通过Object.defineProperty注册了一些成员,这些都是ssr,与服务端渲染相关的.暂时忽略
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

// Vue的版本
Vue.version = '2.6.12';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
const isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
const acceptValue = makeMap('input,textarea,option,select,progress');
const mustUseProp = (tag, type, attr) => {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

const isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

const convertEnumeratedValue = (key, value) => {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,' +
  'truespeed,typemustmatch,visible'
);

const xlinkNS = 'http://www.w3.org/1999/xlink';

const isXlink = (name) => {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

const getXlinkProp = (name) => {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

const isFalsyAttrValue = (val) => {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  let data = vnode.data;
  let parentNode = vnode;
  let childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  let res = '';
  let stringified;
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' ';
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  let res = '';
  for (const key in value) {
    if (value[key]) {
      if (res) res += ' ';
      res += key;
    }
  }
  return res
}

/*  */

const namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

const isPreTag = (tag) => tag === 'pre';

const isReservedTag = (tag) => {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

const unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

const isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 * 判断参数是字符串还是DOM元素，如果是DOM元素直接返回，
 * 如果是字符串这说明是选择器，要通过querySelector找到对应的DOM元素
 */
function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    // 如果这个DOM对象不存在就判断是开发环境就在控制台打印找不到元素，并返回一个空的div对象
    if (!selected) {
       warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */
// 这里定义的函数都是返回一个DOM对象或者直接进行DOM操作


// snabbdom中的createElement是直接创建一个DOM对象，把这个对象返回
// 这里面还处理了一些select标签的地方，如果是select标签，判断有没有attrs和mutiple属性，如果有就设置multiple属性，再返回
function createElement$1 (tagName, vnode) {
  const elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create (_, vnode) {
    registerRef(vnode);
  },
  update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  const key = vnode.data.ref;
  if (!isDef(key)) return

  const vm = vnode.context;
  const ref = vnode.componentInstance || vnode.elm;
  const refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

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

const emptyNode = new VNode('', {}, []);

const hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

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
  let i;
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  let i, key;
  const map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map
}

// 这个类似snabbdom中的init函数，在最后返回了patch函数
// 高阶函数
function createPatchFunction (backend) {
  let i, j;
  // callbacks，这里面存储的模块定义的钩子函数
  const cbs = {};
  // 接收了两个属性，解构
  const { modules, nodeOps } = backend;

  // 初始化cbs
  // 先遍历hooks数组，这里面都是生命周期钩子函数名称
  for (i = 0; i < hooks.length; ++i) {
    // 把这些名称作为cbs的属性，并把值初始化成一个数组(模块有很多，一个钩子函数会对应多个处理形式)
    // cbs['update'] = []
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      // 如果module函数里面定义对应的钩子函数，就取出来放到数组中
      if (isDef(modules[j][hooks[i]])) {
        // cbs['update'] = [updateAttrs, updateClass, update...]
        cbs[hooks[i]].push(modules[j][hooks[i]]);
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
        removeNode(childElm);
      }
    }
    remove.listeners = listeners;
    return remove
  }

  function removeNode (el) {
    const parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
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

  let creatingElmInVPre = 0;

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
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    // 处理组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    // 获取属性
    const data = vnode.data;
    const children = vnode.children;
    const tag = vnode.tag;

    // 下面的判断语句，判断了三种情况
    // 第一种情况判断vnode中是否有tag，tag是标签名称，即vnode是否是标签节点
    // 第二种情况判断vnode是否是注释节点
    // 第三种情况判断vnode是否是文本节点
    if (isDef(tag)) {
      // 是否是开发环境，
      {
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        // 判断标签是否是未知标签，即html中不存在的标签，自定义标签，会发送警告，是否注册了组件，但是不会影响程序的执行.
        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      // 判断是否有命名空间，如果有就用createElementNS创建对应的DOM元素(这种情况是针对svg的情况)，如果没有就createElement创建DOM元素
      // 当创建好之后会存储到vnode的elm属性中，到这里DOM元素还没有完全处理好
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      
      // 这里会对vnode的DOM元素设置样式的作用域
      // 会给这个DOM元素设置一个scopeId
      setScope(vnode);

      /* istanbul ignore if */
      // 判断环境是否是false，跳过直接看else
      {
        // 把vnode中所有的子元素或者文本节点转换成DOM对象
        createChildren(vnode, children, insertedVnodeQueue);
        // 判断data是否有值
        if (isDef(data)) {
          // 如果data有值就调用invokeCreateHooks触发钩子函数
          // 此时vnode已经创建好了对应的DOM对象，此时要去触发created钩子函数
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        // 到这里vnode对应的DOM对象就创建完毕了
        // 调用insert将vnode中创建好的DOM对象插入到parentElm中
        insert(parentElm, vnode.elm, refElm);
      }

      if ( data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      // 调用createComment创建注释节点并且放到elm中
      vnode.elm = nodeOps.createComment(vnode.text);
      // 插入到DOM树上来
      insert(parentElm, vnode.elm, refElm);
    } else {
      // 调用createTextNode创建文本节点并且放到elm中
      vnode.elm = nodeOps.createTextNode(vnode.text);
      // 插入到DOM树上来
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    // 判断是否有data属性
    let i = vnode.data;
    if (isDef(i)) {
      const isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      // 获取data中的hook，获取init钩子函数
      // 调用了init钩子函数的时候，传递了两个参数，一个是vnode对象，一个是false
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    let i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    let innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  // 将DOM对象挂载到DOM树上
  function insert (parent, elm, ref) {
    // parent如果有值，就把dom元素挂载到父元素里面
    if (isDef(parent)) {
      // 判断有没有ref，如果有就判断ref的父节点是不是传入的parent，如果是就插入到ref之前
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref);
        }
      // 如果没有ref的话，就把elm插入到parent中
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  // 处理子元素和文本节点
  function createChildren (vnode, children, insertedVnodeQueue) {
    // 判断children是否是数组，
    if (Array.isArray(children)) {
      {
        // 如果是开发环境判断子元素是否有相同的key
        checkDuplicateKeys(children);
      }
      // 遍历children，找到其vnode，通过createElm将其转换成真实DOM，并且挂载到DOM树上
      for (let i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    // 如果vnode.text是原始值，通过String将其转换成字符串，调用createTextNode创建一个文本节点，将这个DOM元素挂载到vnode.elm中
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    // 调用cbs中的所有create钩子函数，这些是模块中的钩子函数
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode);
    }
    // vnode.data.hook这些是vnode上的钩子函数
    i = vnode.data.hook; // Reuse variable
    // 判断是否有hook
    if (isDef(i)) {
      // 判断hook上面是否有create，如果有就触发create钩子函数
      if (isDef(i.create)) i.create(emptyNode, vnode);
      // 判断hook上面是否有insert钩子函数，如果有此处不去触发insert，以为此时只是创建了vnode还没有挂载到DOM树上，所以此时只是先添加到了insertedVnodeQueue上
      // 在patch函数最后会遍历insertedVnodeQueue中所有的vnode，触发他们的insert钩子函数
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    let i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      let ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    // 遍历新节点下的子节点，调用createElm将子节点转化成真实DOM挂载到DOM树上
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    let i, j;
    const data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    // 遍历所有的vnode节点，
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      // 判断这个节点是否存在，如果存在并且有tag说明是一个tag标签，此时将tag标签从DOM上移除，并且触发对应remove和destory的钩子函数
      // 如果没有tag说明是一个文本节点，直接将这个文本节点从DOM树上移除掉
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      let i;
      const listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  // 比较新老节点的子节点，更新差异
  // 接收参数：第一个是老节点的DOM元素，第二个是老节点的子节点，第三个是新节点的子节点
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // 新老节点的子节点传过来都是数组的形式，对比两个数组中的所有vnode，找到差异更新
    // 过程会进行优化，先对比两个数组中的开始和结束四个顶点
    // 新老节点的开始和结束索引，新老开始结束的节点本身
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly;

    // 判断是否有重复的key，如果有重复的key会报警告
    {
      checkDuplicateKeys(newCh);
    }

    // diff算法
    // 新老子节点都没有遍历完
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 先判断老开始节点是否有值
      if (isUndef(oldStartVnode)) {
        // 获取下一个老节点作为老开始节点
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      // 判断老结束节点是否有值  
      } else if (isUndef(oldEndVnode)) {
        // 没有就获取前一个节点作为老结束节点
        oldEndVnode = oldCh[--oldEndIdx];
      // 对比数组中的四个顶点 
      // 老开始和新开始比 
      // sameVnode值判断了key和tag是否相同，里面的内容是否具体相同并不知道，
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 如果这key和tag相同就用patchVnode继续比较这两个节点以及他们的子节点
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        // 当patch完成之后两个都移动到下一个节点
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      // 老结束和新结束比  
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      // 如果两个都不一样，可能进行了翻转操作  
      // 老开始和新结束比  
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        // 将老的开始节点移动到老的结束节点之后
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      // 老结束和新开始比  
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        // 如果上面四个都不满足，这个时候要拿着老节点的key去新节点的数组中一次找相同key的老节点
        // 这个找的过程做了优化：
        // 对象oldKeyToId这个变量在没有赋值的时候去调用createKeyToOldIdx函数
        // 他会把老节点的key和索引存储到对象oldKeyToIdx中
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        // 如果新开始节点有key，就用新开始节点的key来oldKeyToIdx中查找老节点的索引
        // 如果没key，就去老节点的数组中依次遍历找到相同老节点对应的索引
        // 这里也提现了，使用key的话会快一点
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

        // 如果没有找到老节点对应的索引  
        if (isUndef(idxInOld)) { // New element
          // 就调用createElm创建新开始节点对应的DOM对象并插入到老开始节点的前面
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          // 如果找到了老节点对应的索引
          // 把老节点取出来存到vnodeToMove里面，即将要移动的节点
          vnodeToMove = oldCh[idxInOld];
          // 如果找到的节点和新节点的key和tag相同，和之前一样的操作，比较当前两个节点和子节点
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            // 把老节点移动到老开始节点之前
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // 如果只是key相同，但是是不同的元素，那么创建新元素
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        // 新的开始节点向后移动
        newStartVnode = newCh[++newStartIdx];
      }
    }
    // 当循环结束之后，判断新老节点是否遍历完成
    if (oldStartIdx > oldEndIdx) {
      // 老节点遍历完成新节点没遍历完，把剩下的新节点插入到老节点后面
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      // 新节点遍历完成老节点没有被遍历完，把剩下的老节点删除
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    // 定义了一个对象，在对象中存储了子元素的key
    const seenKeys = {};
    // 遍历子元素，每一个子元素都是一个vnode，获取其key属性，如果key有值就判断对象中是否有对应的key，如果有就说明有重复的key，此时会报警告，如果没有就在对象中记录下来key
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i];
      const key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          // 当前开发中有相同的key
          warn(
            `Duplicate keys detected: '${key}'. This may cause an update error.`,
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
      const c = oldCh[i];
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
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    const elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
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
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    // 这里触发了用户传入的prepatch钩子函数
    let i;
    const data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    // 获取新旧节点的子节点
    const oldCh = oldVnode.children;
    const ch = vnode.children;

    if (isDef(data) && isPatchable(vnode)) {
      // 先调用cbs中update中的钩子函数，就是模块中的，先更新样式属性事件等
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      // 获取用户自定义的钩子函数并执行
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    // patchVnode的核心功能，核心核心
    // 对比新旧vnode
    // 先判断新vnode有没有text属性
    if (isUndef(vnode.text)) {
      // 是否新老节点的子节点是否都存在
      if (isDef(oldCh) && isDef(ch)) {
        // 如果子节点都存在且不相同，那么就调用updateChildren对比新老节点的子节点，把子节点的差异更新到DOM上
        // updateChildren 核心函数
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        // 如果新节点有子节点，老节点没有子节点
      } else if (isDef(ch)) {
        {
          // 去新节点的子节点中检查是否有重复的key，如果有重复的key在开发环境会报警告
          checkDuplicateKeys(ch);
        }
        // 判断老节点是否有text属性，如果有就把老节点的内容清空，再调用addVnodes函数
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
        // addVnodes这个函数的作用是将新节点中的子节点转换成DOM元素，并且添加到DOM树上
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        // 判断如果老节点有子节点，新节点没有子节点，调用removeVnodes函数，把老节点的子节点删除，并且触发remove和destory钩子函数
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      // 如果新老节点都没有子节点，判断老节点是否有text属性，如果有就清空文本内容
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果有text且新旧节点的text值不同
      // 将当前DOM对象中的内容设置为新vnode的text值
      nodeOps.setTextContent(elm, vnode.text);
    }
    // 操作完成之后会获取data中的hook里面的postpatch钩子函数并执行
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode);
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    // 如果没有在DOM树上且有parent属性说明是一个延缓操作，等插入到DOM树上之后才会去触发对应的钩子函数
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      // 否则就遍历触发对应的钩子函数
      for (let i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  let hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  const isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    let i;
    const { tag, data, children } = vnode;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */);
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if (
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false
            }
          } else {
            // iterate and compare children lists
            let childrenMatch = true;
            let childNode = elm.firstChild;
            for (let i = 0; i < children.length; i++) {
              if (!childNode || !hydrate(childNode, children[i], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if (
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        let fullInvoke = false;
        for (const key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
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
      if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
      return
    }

    // 定义变量，初始化为false，如果标签没有挂载到DOM树上会修改为true
    let isInitialPatch = false;
    // 常量，新插入vnode节点的队列，存储的目的是把这些新插入的节点对应的DOM元素挂载在DOM树上之后会去触发这些vnode的钩子函数
    const insertedVnodeQueue = [];

    // 判断老的vnode是否存在，
    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      // 不存在的情况，什么情况下会是undefined或者是null呢?
      // 在组件中的$mount方法，但是没有传入参数的时候，如果传入参数表示我们要把这个挂载到页面上的某个位置，如果没有传参数的话表示我们只是把组件创建出来但并不挂载到视图上
      
      // 这个时候将变量置为true，他vnode也创建好了，DOM元素也创建好了，但是仅仅存在内存中，没有挂到DOM树上来.
      isInitialPatch = true;
      // 将vnode转换成真实DOM，但是仅仅存在内存中，没有挂到DOM树上
      createElm(vnode, insertedVnodeQueue);
    } else {
      // 如果oldVnode存在
      // 判断oldVnode的nodeType是否存在，如果存在说明老的vnode是一个真实dom，说明是首次渲染的时候，首次渲染和数据更改的处理情况是有区别的
      const isRealElement = isDef(oldVnode.nodeType);
      // 判断如果不是真实DOM且与新的vnode是相同节点，
      // snabbdom中的sameVnode判断了key和sel选择器是否相同
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        // 核心核心
        // 在这里patchVnode比较新老节点的差异，并且将差异更新到DOM上，里面会执行diff算法
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      
      // 如果是真实DOM 或者 与新vnode不是相同节点走这里
      } else {
        // 如果是真实DOM，说明首次渲染，创建VNode
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          // 这的代码是与SSR相关的东西，
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          // 这的代码是与SSR相关的东西，
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          // 将真实DOM转换成VNode对象存储到了oldVnode节点中
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        // 获取oldVnode的elm，真实DOM节点，获取这个的目的是找到其真实DOM的父元素，将来要挂载到这个节点下面
        const oldElm = oldVnode.elm;
        const parentElm = nodeOps.parentNode(oldElm);

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
        );

        // update parent placeholder node element, recursively
        // 处理父节点的占位符的问题，与核心逻辑无关，跳过
        if (isDef(vnode.parent)) {
          let ancestor = vnode.parent;
          const patchable = isPatchable(vnode);
          while (ancestor) {
            for (let i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (let i = 0; i < cbs.create.length; ++i) {
                cbs.create[i](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              const insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (let i = 1; i < insert.fns.length; i++) {
                  insert.fns[i]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        // 判断parentElm是否存在，将oldVnode从界面上移除，并且触发相关的钩子函数
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        // 如果没有父节点说明这个节点并不在DOM树上，判断其是否有tag属性，如果有就触发相关的钩子函数
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    // 下面invokeInsertHook就是去触发insertedVnodeQueue队列中的新插入的vnode的钩子函数
    // isInitialPatch这个变量是vnode对应的DOM元素并没有挂载到DOM树上，而是存在内存中，如果是这种情况，就不会触发insertedVnodeQueue里面的钩子函数insert
    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    // 最后将新的vnode的DOM元素返回
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  const isCreate = oldVnode === emptyNode;
  const isDestroy = vnode === emptyNode;
  const oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  const newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  const dirsWithInsert = [];
  const dirsWithPostpatch = [];

  let key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    const callInsert = () => {
      for (let i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', () => {
      for (let i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

const emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  const res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  let i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || `${dir.name}.${Object.keys(dir.modifiers || {}).join('.')}`
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  const fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, `directive ${dir.name} ${hook} hook`);
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  const opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  let key, cur, old;
  const elm = vnode.elm;
  const oldAttrs = oldVnode.data.attrs || {};
  let attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur, vnode.data.pre);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value, isInPre) {
  if (isInPre || el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      const blocker = e => {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  // 导出了vnode生命周期钩子函数，其他模块也一样
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  const el = vnode.elm;
  const data = vnode.data;
  const oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  let cls = genClassForVnode(vnode);

  // handle transition classes
  const transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

const validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  let inSingle = false;
  let inDouble = false;
  let inTemplateString = false;
  let inRegex = false;
  let curly = 0;
  let square = 0;
  let paren = 0;
  let lastFilterIndex = 0;
  let c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false;
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false;
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false;
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1;
        let p;
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  const i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    const name = filter.slice(0, i);
    const args = filter.slice(i + 1);
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}

/*  */



/* eslint-disable no-unused-vars */
function baseWarn (msg, range) {
  console.error(`[Vue compiler]: ${msg}`);
}
/* eslint-enable no-unused-vars */

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(m => m[key]).filter(_ => _)
    : []
}

function addProp (el, name, value, range, dynamic) {
  (el.props || (el.props = [])).push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

function addAttr (el, name, value, range, dynamic) {
  const attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []));
  attrs.push(rangeSetItem({ name, value, dynamic }, range));
  el.plain = false;
}

// add a raw attr (use this in preTransforms)
function addRawAttr (el, name, value, range) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({ name, value }, range));
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  isDynamicArg,
  modifiers,
  range
) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name,
    rawName,
    value,
    arg,
    isDynamicArg,
    modifiers
  }, range));
  el.plain = false;
}

function prependModifierMarker (symbol, name, dynamic) {
  return dynamic
    ? `_p(${name},"${symbol}")`
    : symbol + name // mark the event as captured
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn,
  range,
  dynamic
) {
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
     warn &&
    modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.',
      range
    );
  }

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) {
    if (dynamic) {
      name = `(${name})==='click'?'contextmenu':(${name})`;
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = `(${name})==='click'?'mouseup':(${name})`;
    } else if (name === 'click') {
      name = 'mouseup';
    }
  }

  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }
  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  let events;
  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  const newHandler = rangeSetItem({ value: value.trim(), dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  const handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}

function getRawBindingAttr (
  el,
  name
) {
  return el.rawAttrsMap[':' + name] ||
    el.rawAttrsMap['v-bind:' + name] ||
    el.rawAttrsMap[name]
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  const dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
function getAndRemoveAttr (
  el,
  name,
  removeFromMap
) {
  let val;
  // 先获取name对应的属性
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  // 最后在从el.attrsMap中移除，最后返回这个属性的值
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val
}

function getAndRemoveAttrByRegex (
  el,
  name
) {
  const list = el.attrsList;
  for (let i = 0, l = list.length; i < l; i++) {
    const attr = list[i];
    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr
    }
  }
}

function rangeSetItem (
  item,
  range
) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  const { number, trim } = modifiers || {};

  const baseValueExpression = '$$v';
  let valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      `(typeof ${baseValueExpression} === 'string'` +
      `? ${baseValueExpression}.trim()` +
      `: ${baseValueExpression})`;
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`;
  }
  const assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: `(${value})`,
    expression: JSON.stringify(value),
    callback: `function (${baseValueExpression}) {${assignment}}`
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  const res = parseModel(value);
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

let len, str, chr, index$1, expressionPos, expressionEndPos;



function parseModel (val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index$1 = val.lastIndexOf('.');
    if (index$1 > -1) {
      return {
        exp: val.slice(0, index$1),
        key: '"' + val.slice(index$1 + 1) + '"'
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val;
  index$1 = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  let inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) inBracket++;
    if (chr === 0x5D) inBracket--;
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  const stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

let warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
const RANGE_TOKEN = '__r';
const CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  const value = dir.value;
  const modifiers = dir.modifiers;
  const tag = el.tag;
  const type = el.attrsMap.type;

  {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        `<${el.tag} v-model="${value}" type="file">:\n` +
        `File inputs are read only. Use a v-on:change listener instead.`,
        el.rawAttrsMap['v-model']
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else {
    warn$1(
      `<${el.tag} v-model="${value}">: ` +
      `v-model is not supported on this element type. ` +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  const valueBinding = getBindingAttr(el, 'value') || 'null';
  const trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  const falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    `Array.isArray(${value})` +
    `?_i(${value},${valueBinding})>-1` + (
      trueValueBinding === 'true'
        ? `:(${value})`
        : `:_q(${value},${trueValueBinding})`
    )
  );
  addHandler(el, 'change',
    `var $$a=${value},` +
        '$$el=$event.target,' +
        `$$c=$$el.checked?(${trueValueBinding}):(${falseValueBinding});` +
    'if(Array.isArray($$a)){' +
      `var $$v=${number ? '_n(' + valueBinding + ')' : valueBinding},` +
          '$$i=_i($$a,$$v);' +
      `if($$el.checked){$$i<0&&(${genAssignmentCode(value, '$$a.concat([$$v])')})}` +
      `else{$$i>-1&&(${genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')})}` +
    `}else{${genAssignmentCode(value, '$$c')}}`,
    null, true
  );
}

function genRadioModel (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  let valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? `_n(${valueBinding})` : valueBinding;
  addProp(el, 'checked', `_q(${value},${valueBinding})`);
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
  el,
  value,
  modifiers
) {
  const number = modifiers && modifiers.number;
  const selectedVal = `Array.prototype.filter` +
    `.call($event.target.options,function(o){return o.selected})` +
    `.map(function(o){var val = "_value" in o ? o._value : o.value;` +
    `return ${number ? '_n(val)' : 'val'}})`;

  const assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  let code = `var $$selectedVal = ${selectedVal};`;
  code = `${code} ${genAssignmentCode(value, assignment)}`;
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  const type = el.attrsMap.type;

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  {
    const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
    const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (value && !typeBinding) {
      const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
      warn$1(
        `${binding}="${value}" conflicts with v-model on the same element ` +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      );
    }
  }

  const { lazy, number, trim } = modifiers || {};
  const needCompositionGuard = !lazy && type !== 'range';
  const event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  let valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = `$event.target.value.trim()`;
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`;
  }

  let code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`;
  }

  addProp(el, 'value', `(${value})`);
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    const event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

let target$1;

function createOnceHandler$1 (event, handler, capture) {
  const _target = target$1; // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
const useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    const attachedTimestamp = currentFlushTimestamp;
    const original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture, passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {};
  const oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

let svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  let key, cur;
  const elm = vnode.elm;
  const oldProps = oldVnode.data.domProps || {};
  let props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0;
      if (cur === oldProps[key]) continue
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      const strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = `<svg>${cur}</svg>`;
      const svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecessary `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  let notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  const value = elm.value;
  const modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

const parseStyleText = cached(function (cssText) {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g;
  const propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  const style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  const res = {};
  let styleData;

  if (checkChild) {
    let childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  let parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

const cssVarRE = /^--/;
const importantRE = /\s*!important$/;
const setProp = (el, name, val) => {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    const normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (let i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

const vendorNames = ['Webkit', 'Moz', 'ms'];

let emptyStyle;
const normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  const capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (let i = 0; i < vendorNames.length; i++) {
    const name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  const data = vnode.data;
  const oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  let cur, name;
  const el = vnode.elm;
  const oldStaticStyle = oldData.staticStyle;
  const oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  const oldStyle = oldStaticStyle || oldStyleBinding;

  const style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  const newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

const whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.add(c));
    } else {
      el.classList.add(cls);
    }
  } else {
    const cur = ` ${el.getAttribute('class') || ''} `;
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(c => el.classList.remove(c));
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    let cur = ` ${el.getAttribute('class') || ''} `;
    const tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def) {
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    const res = {};
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'));
    }
    extend(res, def);
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

const autoCssTransition = cached(name => {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    enterActiveClass: `${name}-enter-active`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`,
    leaveActiveClass: `${name}-leave-active`
  }
});

const hasTransition = inBrowser && !isIE9;
const TRANSITION = 'transition';
const ANIMATION = 'animation';

// Transition property/event sniffing
let transitionProp = 'transition';
let transitionEndEvent = 'transitionend';
let animationProp = 'animation';
let animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
const raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ fn => fn();

function nextFrame (fn) {
  raf(() => {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  const transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) return cb()
  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  let ended = 0;
  const end = () => {
    el.removeEventListener(event, onEnd);
    cb();
  };
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

const transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  const styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  const transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  const transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  const animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  const animationTimeout = getTimeout(animationDelays, animationDurations);

  let type;
  let timeout = 0;
  let propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  const hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type,
    timeout,
    propCount,
    hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  const el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  const data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  const {
    css,
    type,
    enterClass,
    enterToClass,
    enterActiveClass,
    appearClass,
    appearToClass,
    appearActiveClass,
    beforeEnter,
    enter,
    afterEnter,
    enterCancelled,
    beforeAppear,
    appear,
    afterAppear,
    appearCancelled,
    duration
  } = data;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  let context = activeInstance;
  let transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  const isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  const startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  const activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  const toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  const beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  const enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  const afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  const enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  const explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ( explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  const expectsCSS = css !== false && !isIE9;
  const userWantsControl = getHookArgumentsLength(enterHook);

  const cb = el._enterCb = once(() => {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', () => {
      const parent = el.parentNode;
      const pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(() => {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  const el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  const data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  const {
    css,
    type,
    leaveClass,
    leaveToClass,
    leaveActiveClass,
    beforeLeave,
    leave,
    afterLeave,
    leaveCancelled,
    delayLeave,
    duration
  } = data;

  const expectsCSS = css !== false && !isIE9;
  const userWantsControl = getHookArgumentsLength(leave);

  const explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ( isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  const cb = el._leaveCb = once(() => {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(() => {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      `<transition> explicit ${name} duration is not a valid number - ` +
      `got ${JSON.stringify(val)}.`,
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      `<transition> explicit ${name} duration is NaN - ` +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  const invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
// modules拼接了两个数组，一个是platformModules，一个是baseModules
const modules = platformModules.concat(baseModules);

// 这个函数是通过createPatchFunction函数生成的，这个函数是一个高阶函数，也是一个柯里化函数
// 需要一个对象参数，一个nodeOps，一个modules
const patch = createPatchFunction({ nodeOps, modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

const directive = {
  inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', () => {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      const prevOptions = el._vOptions;
      const curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some((o, i) => !looseEqual(o, prevOptions[i]))) {
        // trigger change event if
        // no matching option found for at least one value
        const needReset = el.multiple
          ? binding.value.some(v => hasNoMatchingOption(v, curOptions))
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(() => {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  const value = binding.value;
  const isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
     warn(
      `<select multiple v-model="${binding.expression}"> ` +
      `expects an Array value for its binding, but got ${
        Object.prototype.toString.call(value).slice(8, -1)
      }`,
      vm
    );
    return
  }
  let selected, option;
  for (let i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(o => !looseEqual(o, value))
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) return
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  const e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind (el, { value }, vnode) {
    vnode = locateNode(vnode);
    const transition = vnode.data && vnode.data.transition;
    const originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition) {
      vnode.data.show = true;
      enter(vnode, () => {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update (el, { value, oldValue }, vnode) {
    /* istanbul ignore if */
    if (!value === !oldValue) return
    vnode = locateNode(vnode);
    const transition = vnode.data && vnode.data.transition;
    if (transition) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, () => {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, () => {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

// 导出的是v-model和v-show两个指令
var platformDirectives = {
  model: directive,
  show
};

/*  */

const transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  const compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  const data = {};
  const options = comp.$options;
  // props
  for (const key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  const listeners = options._parentListeners;
  for (const key in listeners) {
    data[camelize(key)] = listeners[key];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

const isNotTextNode = (c) => c.tag || isAsyncPlaceholder(c);

const isVShowDirective = d => d.name === 'show';

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render (h) {
    let children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ( children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    const mode = this.mode;

    // warn invalid mode
    if (
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    const rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    const id = `__transition-${this._uid}-`;
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    const data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    const oldRawChild = this._vnode;
    const oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      const oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', () => {
          this._leaving = false;
          this.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        let delayedLeave;
        const performLeave = () => { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', leave => { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

const props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props,

  beforeMount () {
    const update = this._update;
    this._update = (vnode, hydrating) => {
      const restoreActiveInstance = setActiveInstance(this);
      // force removing pass
      this.__patch__(
        this._vnode,
        this.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this._vnode = this.kept;
      restoreActiveInstance();
      update.call(this, vnode, hydrating);
    };
  },

  render (h) {
    const tag = this.tag || this.$vnode.data.tag || 'span';
    const map = Object.create(null);
    const prevChildren = this.prevChildren = this.children;
    const rawChildren = this.$slots.default || [];
    const children = this.children = [];
    const transitionData = extractTransitionData(this);

    for (let i = 0; i < rawChildren.length; i++) {
      const c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else {
          const opts = c.componentOptions;
          const name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(`<transition-group> children must be keyed: <${name}>`);
        }
      }
    }

    if (prevChildren) {
      const kept = [];
      const removed = [];
      for (let i = 0; i < prevChildren.length; i++) {
        const c = prevChildren[i];
        c.data.transition = transitionData;
        c.data.pos = c.elm.getBoundingClientRect();
        if (map[c.key]) {
          kept.push(c);
        } else {
          removed.push(c);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated () {
    const children = this.prevChildren;
    const moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach((c) => {
      if (c.data.moved) {
        const el = c.elm;
        const s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      const clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach((cls) => { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      const info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  const oldPos = c.data.pos;
  const newPos = c.data.newPos;
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    const s = c.elm.style;
    s.transform = s.WebkitTransform = `translate(${dx}px,${dy}px)`;
    s.transitionDuration = '0s';
  }
}

// 导出的是 v-transitiom 和 v-transition-group 两个组件
var platformComponents = {
  Transition,
  TransitionGroup
};

/*  */

// install platform specific utils
// 给Vue.config中注册了一些方法，这些方法是与平台相关的特定的通用的方法
// 这些方法是在Vue内部使用的，在外部很少去使用
// 感兴趣的话可以看一下下面的模块，里面导入了这些方法
/**
 * import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'
 */
Vue.config.mustUseProp = mustUseProp;
// 是否是保留的标签
Vue.config.isReservedTag = isReservedTag;
// 是否是保留的属性（传入的参数是否是html中特有的属性）
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
// 通过extend方法注册了一些与平台相关的全局的指令和组件
// extend的作用是把第二个对象的方法成员拷贝到第一个对象的方法成员上

// 注册指令（通过上面导入的模块可以看出是v-model，v-show）
extend(Vue.options.directives, platformDirectives);
// 注册组件（通过上面导入的模块可以看出是v-transition，v-transition-group）
// 这个组件是web平台特有的，并且是全局的
// 我们在全局注册的组件（Vue.components()）都会放到Vue.options.components里面
extend(Vue.options.components, platformComponents);

// install platform patch function
// 在Vue的原型对象上注册了一个patch函数，虚拟DOM中patch函数的功能是把虚拟DOM转换成真实DOM
// 赋值的时候会判断是否是浏览器,inBrowser是判断window类型是否为undefined
// 如果是就直接返回patch函数，如果不是就返回noop函数，noop是一个空函数
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
// 给vue实例增加了一个$mount的方法
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  // 内部调用了mountComponent方法,作用是渲染DOM
  return mountComponent(this, el, hydrating)
};

// devtools global hook
// 与调试相关的代码,不关心
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        );
      }
    }
    if (
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      );
    }
  }, 0);
}

/*  */

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&');
  const close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});



function parseText (
  text,
  delimiters
) {
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  const tokens = [];
  const rawTokens = [];
  let lastIndex = tagRE.lastIndex = 0;
  let match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    const exp = parseFilters(match[1].trim());
    tokens.push(`_s(${exp})`);
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

/*  */

function transformNode (el, options) {
  const warn = options.warn || baseWarn;
  const staticClass = getAndRemoveAttr(el, 'class');
  if ( staticClass) {
    const res = parseText(staticClass, options.delimiters);
    if (res) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  let data = '';
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`;
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`;
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode,
  genData
};

/*  */

function transformNode$1 (el, options) {
  const warn = options.warn || baseWarn;
  const staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    {
      const res = parseText(staticStyle, options.delimiters);
      if (res) {
        warn(
          `style="${staticStyle}": ` +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.',
          el.rawAttrsMap['style']
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  const styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  let data = '';
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle},`;
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding}),`;
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

/*  */

let decoder;

var he = {
  decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/*  */

const isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
const canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
const isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/**
 * Not type-checking this file because it's mostly vendor code.
 */

// Regular Expressions for parsing tags and attributes
// 匹配标签中的属性，包括指令
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 开始标签<
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// 开始标签>
const startTagClose = /^\s*(\/?)>/;
// 结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// 文档声明
const doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
// 文档中的注释
const comment = /^<!\--/;
const conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
const isPlainTextElement = makeMap('script,style,textarea', true);
const reCache = {};

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
};
const encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

// #5992
const isIgnoreNewlineTag = makeMap('pre,textarea', true);
const shouldIgnoreFirstNewline = (tag, html) => tag && isIgnoreNewlineTag(tag) && html[0] === '\n';

function decodeAttr (value, shouldDecodeNewlines) {
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, match => decodingMap[match])
}

// 上面的注释说借鉴了开源库simplehtmlparser
// 上面还定义了很多正则表达式
// 这些正则表达式的作用是用来匹配html模板字符串中的内容
// 
function parseHTML (html, options) {
  const stack = [];
  const expectHTML = options.expectHTML;
  const isUnaryTag = options.isUnaryTag || no;
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no;
  let index = 0;
  let last, lastTag;
  // 遍历HTML，html就是我们的模板字符串，会把处理完的文本截取掉，继续去处理剩余的部分
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      let textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              // 如果当前找到注释标签，并且找到comment方法后，这个是调用parseHTML方法传递进来的方法
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }
            //记录当前的位置，在处理完毕的位置截取剩余的内容
            advance(commentEnd + 3);
            // 后面继续去处理剩余的HTML，知道处理完毕
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        // 匹配是否是条件注释
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        // 匹配是否是文档声明
        const doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        // 是否是结束标签
        const endTagMatch = html.match(endTag);
        if (endTagMatch) {
          const curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        // 是否是开始标签
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue
        }
      }

      let text, rest, next;
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) break
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      let endTagLength = 0;
      const stackedTag = lastTag.toLowerCase();
      const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      const rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest.length;
      html = rest;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ( !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`, { start: index + html.length });
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      let end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    // 这里处理了很多内容，还处理了属性
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    const unary = isUnaryTag(tagName) || !!unarySlash;

    const l = match.attrs.length;
    const attrs = new Array(l);
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i];
      const value = args[3] || args[4] || args[5] || '';
      const shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };
      if ( options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
      lastTag = tagName;
    }
    // 在开始标签处理完毕之后，最终调用start方法，并把解析好的标签名，属性，是否是一元标签，起始位置都传递过去
    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName;
    if (start == null) start = index;
    if (end == null) end = index;

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`,
            { start: stack[i].start, end: stack[i].end }
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

const onRE = /^@|^v-on:/;
const dirRE =  /^v-|^@|^:|^#/;
const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const dynamicArgRE = /^\[.*\]$/;

const argRE = /:(.*)$/;
const bindRE = /^:|^\.|^v-bind:/;
const modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

const slotRE = /^v-slot(:|$)|^#/;

const lineBreakRE = /[\r\n]/;
const whitespaceRE$1 = /\s+/g;

const invalidAttributeRE = /[\s"'<>\/=]/;

const decodeHTMLCached = cached(he.decode);

const emptySlotScopeToken = `_empty_`;

// configurable state
let warn$2;
let delimiters;
let transforms;
let preTransforms;
let postTransforms;
let platformIsPreTag;
let platformMustUseProp;
let platformGetTagNamespace;
let maybeComponent;

function createASTElement (
  tag,
  attrs,
  parent
) {
  // 返回了一个AST对象
  return {
    type: 1,
    tag,
    // 属性数组
    attrsList: attrs,
    // 把对象转换成数组
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  // 1. 解析options
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  const isReservedTag = options.isReservedTag || no;
  maybeComponent = (el) => !!el.component || !isReservedTag(el.tag);

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  // 定义了一些变量和函数
  const stack = [];
  const preserveWhitespace = options.preserveWhitespace !== false;
  const whitespaceOption = options.whitespace;
  let root;
  let currentParent;
  let inVPre = false;
  let inPre = false;
  let warned = false;

  function warnOnce (msg, range) {
    if (!warned) {
      warned = true;
      warn$2(msg, range);
    }
  }

  function closeElement (element) {
    trimEndingWhitespace(element);
    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        {
          checkRootConstraints(element);
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });
      } else {
        warnOnce(
          `Component template should contain exactly one root element. ` +
          `If you are using v-if on multiple elements, ` +
          `use v-else-if to chain them instead.`,
          { start: element.start }
        );
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          const name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);
        element.parent = currentParent;
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(c => !(c).slotScope);
    // remove trailing whitespace node again
    trimEndingWhitespace(element);

    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
    // apply post-transforms
    for (let i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace (el) {
    // remove trailing whitespace node
    if (!inPre) {
      let lastNode;
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints (el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce(
        `Cannot use <${el.tag}> as component root element because it may ` +
        'contain multiple nodes.',
        { start: el.start }
      );
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce(
        'Cannot use v-for on stateful component root element because ' +
        'it renders multiple elements.',
        el.rawAttrsMap['v-for']
      );
    }
  }

  // 2.对模板解析
  // 接收模板字符串，第二个参数是一个对象，将选项的成员传入
  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    // 解析过程中的回调函数，生成AST
    // 分别开始标签，结束标签，文本内容，注释标签的时候去执行
    start (tag, attrs, unary, start, end) {
      // check namespace.
      // inherit parent ns if there is one
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }
      // 创建AST对象
      let element = createASTElement(tag, attrs, currentParent);
      if (ns) {
        element.ns = ns;
      }
      // 之后给AST对象进行赋值
      {
        if (options.outputSourceRange) {
          element.start = start;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce((cumulated, attr) => {
            cumulated[attr.name] = attr;
            return cumulated
          }, {});
        }
        attrs.forEach(attr => {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2(
              `Invalid dynamic argument expression: attribute names cannot contain ` +
              `spaces, quotes, <, >, / or =.`,
              {
                start: attr.start + attr.name.indexOf(`[`),
                end: attr.start + attr.name.length
              }
            );
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
         warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.',
          { start: element.start }
        );
      }

      // apply pre-transforms
      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      // 开始处理指令
      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        // 处理结构化指令
        // v-for v-if v-once
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;
        {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },

    end (tag, start, end) {
      const element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      if ( options.outputSourceRange) {
        element.end = end;
      }
      closeElement(element);
    },

    chars (text, start, end) {
      if (!currentParent) {
        {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.',
              { start }
            );
          } else if ((text = text.trim())) {
            warnOnce(
              `text "${text}" outside root element will be ignored.`,
              { start }
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      const children = currentParent.children;
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }
        let res;
        let child;
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text
          };
        }
        if (child) {
          if ( options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },

    comment (text, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        const child = {
          type: 3,
          text,
          isComment: true
        };
        if ( options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    }
  });
  // 返回root变量，里面存储了解析好的ast对象
  return root
}

function processPre (el) {
  // 获取v-pre指令，如果有值就在ast中移除对应的属性
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  const list = el.attrsList;
  const len = list.length;
  if (len) {
    const attrs = el.attrs = new Array(len);
    for (let i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      };
      if (list[i].start != null) {
        attrs[i].start = list[i].start;
        attrs[i].end = list[i].end;
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processElement (
  element,
  options
) {
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = (
    !element.key &&
    !element.scopedSlots &&
    !element.attrsList.length
  );

  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  processAttrs(element);
  return element
}

function processKey (el) {
  const exp = getBindingAttr(el, 'key');
  if (exp) {
    {
      if (el.tag === 'template') {
        warn$2(
          `<template> cannot be keyed. Place the key on real elements instead.`,
          getRawBindingAttr(el, 'key')
        );
      }
      if (el.for) {
        const iterator = el.iterator2 || el.iterator1;
        const parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2(
            `Do not use v-for index as key on <transition-group> children, ` +
            `this is the same as not using keys.`,
            getRawBindingAttr(el, 'key'),
            true /* tip */
          );
        }
      }
    }
    el.key = exp;
  }
}

function processRef (el) {
  const ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  let exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    const res = parseFor(exp);
    if (res) {
      extend(el, res);
    } else {
      warn$2(
        `Invalid v-for expression: ${exp}`,
        el.rawAttrsMap['v-for']
      );
    }
  }
}



function parseFor (exp) {
  const inMatch = exp.match(forAliasRE);
  if (!inMatch) return
  const res = {};
  res.for = inMatch[2].trim();
  const alias = inMatch[1].trim().replace(stripParensRE, '');
  const iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim();
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }
  return res
}

function processIf (el) {
  // 获取v-if指令的值
  const exp = getAndRemoveAttr(el, 'v-if');
  // 如果有就存到el.if中
  if (exp) {
    el.if = exp;
    // 函数的作用是把v-if的表达式和对应的ast对象存储到ifConditions数组中
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    const elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  const prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else {
    warn$2(
      `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
      `used on element <${el.tag}> without corresponding v-if.`,
      el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
    );
  }
}

function findPrevElement (children) {
  let i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ( children[i].text !== ' ') {
        warn$2(
          `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
          `will be ignored.`,
          children[i]
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  // 函数的作用是把v-if的表达式和对应的ast对象存储到ifConditions数组中
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  const once = getAndRemoveAttr(el, 'v-once');
  if (once != null) {
    el.once = true;
  }
}

// handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  let slotScope;
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope');
    /* istanbul ignore if */
    if ( slotScope) {
      warn$2(
        `the "scope" attribute for scoped slots have been deprecated and ` +
        `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
        `can also be used on plain elements in addition to <template> to ` +
        `denote scoped slots.`,
        el.rawAttrsMap['scope'],
        true
      );
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if ( el.attrsMap['v-for']) {
      warn$2(
        `Ambiguous combined usage of slot-scope and v-for on <${el.tag}> ` +
        `(v-for takes higher priority). Use a wrapper <template> for the ` +
        `scoped slot to make it clearer.`,
        el.rawAttrsMap['slot-scope'],
        true
      );
    }
    el.slotScope = slotScope;
  }

  // slot="xxx"
  const slotTarget = getBindingAttr(el, 'slot');
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
    }
  }

  // 2.6 v-slot syntax
  {
    if (el.tag === 'template') {
      // v-slot on <template>
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        {
          if (el.slotTarget || el.slotScope) {
            warn$2(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            );
          }
          if (el.parent && !maybeComponent(el.parent)) {
            warn$2(
              `<template v-slot> can only appear at the root level inside ` +
              `the receiving component`,
              el
            );
          }
        }
        const { name, dynamic } = getSlotName(slotBinding);
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      const slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        {
          if (!maybeComponent(el)) {
            warn$2(
              `v-slot can only be used on components or <template>.`,
              slotBinding
            );
          }
          if (el.slotScope || el.slotTarget) {
            warn$2(
              `Unexpected mixed usage of different slot syntaxes.`,
              el
            );
          }
          if (el.scopedSlots) {
            warn$2(
              `To avoid scope ambiguity, the default slot should also use ` +
              `<template> syntax when there are other named slots.`,
              slotBinding
            );
          }
        }
        // add the component's children to its default slot
        const slots = el.scopedSlots || (el.scopedSlots = {});
        const { name, dynamic } = getSlotName(slotBinding);
        const slotContainer = slots[name] = createASTElement('template', [], el);
        slotContainer.slotTarget = name;
        slotContainer.slotTargetDynamic = dynamic;
        slotContainer.children = el.children.filter((c) => {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true
          }
        });
        slotContainer.slotScope = slotBinding.value || emptySlotScopeToken;
        // remove children as they are returned from scopedSlots now
        el.children = [];
        // mark el non-plain so data gets generated
        el.plain = false;
      }
    }
  }
}

function getSlotName (binding) {
  let name = binding.name.replace(slotRE, '');
  if (!name) {
    if (binding.name[0] !== '#') {
      name = 'default';
    } else {
      warn$2(
        `v-slot shorthand syntax requires a slot name.`,
        binding
      );
    }
  }
  return dynamicArgRE.test(name)
    // dynamic [name]
    ? { name: name.slice(1, -1), dynamic: true }
    // static name
    : { name: `"${name}"`, dynamic: false }
}

// handle <slot/> outlets
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ( el.key) {
      warn$2(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`,
        getRawBindingAttr(el, 'key')
      );
    }
  }
}

function processComponent (el) {
  let binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  const list = el.attrsList;
  let i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        if (
          
          value.trim().length === 0
        ) {
          warn$2(
            `The value for a v-bind expression cannot be empty. Found in "v-bind:${name}"`
          );
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);
            if (name === 'innerHtml') name = 'innerHTML';
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, `$event`);
            if (!isDynamic) {
              addHandler(
                el,
                `update:${camelize(name)}`,
                syncGen,
                null,
                false,
                warn$2,
                list[i]
              );
              if (hyphenate(name) !== camelize(name)) {
                addHandler(
                  el,
                  `update:${hyphenate(name)}`,
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                `"update:"+(${name})`,
                syncGen,
                null,
                false,
                warn$2,
                list[i],
                true // dynamic
              );
            }
          }
        }
        if ((modifiers && modifiers.prop) || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        const argMatch = name.match(argRE);
        let arg = argMatch && argMatch[1];
        isDynamic = false;
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
        if ( name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      {
        const res = parseText(value, delimiters);
        if (res) {
          warn$2(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          );
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i]);
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}

function checkInFor (el) {
  let parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  const match = name.match(modifierRE);
  if (match) {
    const ret = {};
    match.forEach(m => { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  const map = {};
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (
      
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

const ieNSBug = /^xmlns:NS\d+/;
const ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  const res = [];
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  let _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`,
        el.rawAttrsMap['v-model']
      );
    }
    _el = _el.parent;
  }
}

/*  */

function preTransformNode (el, options) {
  if (el.tag === 'input') {
    const map = el.attrsMap;
    if (!map['v-model']) {
      return
    }

    let typeBinding;
    if (map[':type'] || map['v-bind:type']) {
      typeBinding = getBindingAttr(el, 'type');
    }
    if (!map.type && !typeBinding && map['v-bind']) {
      typeBinding = `(${map['v-bind']}).type`;
    }

    if (typeBinding) {
      const ifCondition = getAndRemoveAttr(el, 'v-if', true);
      const ifConditionExtra = ifCondition ? `&&(${ifCondition})` : ``;
      const hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
      const elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
      // 1. checkbox
      const branch0 = cloneASTElement(el);
      // process for on the main node
      processFor(branch0);
      addRawAttr(branch0, 'type', 'checkbox');
      processElement(branch0, options);
      branch0.processed = true; // prevent it from double-processed
      branch0.if = `(${typeBinding})==='checkbox'` + ifConditionExtra;
      addIfCondition(branch0, {
        exp: branch0.if,
        block: branch0
      });
      // 2. add radio else-if condition
      const branch1 = cloneASTElement(el);
      getAndRemoveAttr(branch1, 'v-for', true);
      addRawAttr(branch1, 'type', 'radio');
      processElement(branch1, options);
      addIfCondition(branch0, {
        exp: `(${typeBinding})==='radio'` + ifConditionExtra,
        block: branch1
      });
      // 3. other
      const branch2 = cloneASTElement(el);
      getAndRemoveAttr(branch2, 'v-for', true);
      addRawAttr(branch2, ':type', typeBinding);
      processElement(branch2, options);
      addIfCondition(branch0, {
        exp: ifCondition,
        block: branch2
      });

      if (hasElse) {
        branch0.else = true;
      } else if (elseIfCondition) {
        branch0.elseif = elseIfCondition;
      }

      return branch0
    }
  }
}

function cloneASTElement (el) {
  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

var model$1 = {
  preTransformNode
};

var modules$1 = [
  klass$1,
  style$1,
  model$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', `_s(${dir.value})`, dir);
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', `_s(${dir.value})`, dir);
  }
}

var directives$1 = {
  model,
  text,
  html
};

/*  */

const baseOptions = {
  //html相关
  expectHTML: true,
  // 模块
  modules: modules$1,
  // 指令
  directives: directives$1,
  // 是否是pre标签
  isPreTag,
  // 是否是自闭合标签
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  // 是否是html中的保留标签
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

let isStaticKey;
let isPlatformReservedTag;

const genStaticKeysCached = cached(genStaticKeys$1);

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
function optimize (root, options) {
  // 判断root，是否传递了ast对象，如果没有直接返回
  if (!root) return
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  // 标记静态节点
  markStatic$1(root);
  // second pass: mark static roots.
  // 标记静态根节点
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  // 判断当前 astNode 是否是静态的
  node.static = isStatic(node);
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
      const child = node.children[i];
      // 递归调用markStatic标记静态
      markStatic$1(child);
      if (!child.static) {
        // 如果有一个 child 不是 static，当前 node 不是 static
        node.static = false;
      }
    }
    // 处理条件渲染中的AST对象，与上一步处理相同
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        const block = node.ifConditions[i].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  // 判断当前根节点是否是元素节点
  if (node.type === 1) {
    // 判断该节点是否是静态的或者只渲染一次，来标记该节点在循环中是否是静态的
    if (node.static || node.once) {
      node.staticInFor = isInFor;
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
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    // 检测当前节点的子节点中是否有静态的Root，递归调用markStaticRoots
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    // 遍历条件渲染的子节点，递归调用markStaticRoots
    if (node.ifConditions) {
      for (let i = 1, l = node.ifConditions.length; i < l; i++) {
        markStaticRoots(node.ifConditions[i].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
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

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
const fnInvokeRE = /\([^)]*?\);*$/;
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

// KeyboardEvent.keyCode aliases
const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// KeyboardEvent.key aliases
const keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = condition => `if(${condition})return null;`;

const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
};

function genHandlers (
  events,
  isNative
) {
  const prefix = isNative ? 'nativeOn:' : 'on:';
  let staticHandlers = ``;
  let dynamicHandlers = ``;
  for (const name in events) {
    const handlerCode = genHandler(events[name]);
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name},${handlerCode},`;
    } else {
      staticHandlers += `"${name}":${handlerCode},`;
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`;
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
  } else {
    return prefix + staticHandlers
  }
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value);
  const isFunctionExpression = fnExpRE.test(handler.value);
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    return `function($event){${
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}` // inline statement
  } else {
    let code = '';
    let genModifierCode = '';
    const keys = [];
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === 'exact') {
        const modifiers = (handler.modifiers);
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(keyModifier => !modifiers[keyModifier])
            .map(keyModifier => `$event.${keyModifier}Key`)
            .join('||')
        );
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    const handlerCode = isMethodPath
      ? `return ${handler.value}.apply(null, arguments)`
      : isFunctionExpression
        ? `return (${handler.value}).apply(null, arguments)`
        : isFunctionInvocation
          ? `return ${handler.value}`
          : handler.value;
    return `function($event){${code}${handlerCode}}`
  }
}

function genKeyFilter (keys) {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    `if(!$event.type.indexOf('key')&&` +
    `${keys.map(genFilterCode).join('&&')})return null;`
  )
}

function genFilterCode (key) {
  const keyVal = parseInt(key, 10);
  if (keyVal) {
    return `$event.keyCode!==${keyVal}`
  }
  const keyCode = keyCodes[key];
  const keyName = keyNames[key];
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  )
}

/*  */

function on (el, dir) {
  if ( dir.modifiers) {
    warn(`v-on without argument does not support modifiers.`);
  }
  el.wrapListeners = (code) => `_g(${code},${dir.value})`;
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = (code) => {
    return `_b(${code},'${el.tag}',${dir.value},${
      dir.modifiers && dir.modifiers.prop ? 'true' : 'false'
    }${
      dir.modifiers && dir.modifiers.sync ? ',true' : ''
    })`
  };
}

/*  */

var baseDirectives = {
  on,
  bind: bind$1,
  cloak: noop
};

/*  */





class CodegenState {
  
  
  
  
  
  
  
  
  

  constructor (options) {
    // 存储了和代码生成相关的属性和方法
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, 'transformCode');
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    this.directives = extend(extend({}, baseDirectives), options.directives);
    const isReservedTag = options.isReservedTag || no;
    this.maybeComponent = (el) => !!el.component || !isReservedTag(el.tag);
    this.onceId = 0;
    // 下面是重点关注的两个属性
    this.staticRenderFns = []; // 存储静态根节点生成的代码，因为一个模板中可能有多个根节点，数组里面存储的是字符串形式的代码
    this.pre = false; // 当前处理的节点，是否是用v-pre标记的
  }
}



// 重点关注静态根节点的处理过程
function generate (
  ast,
  options
) {
  // 创建代码生成过程中使用的状态对象CodegenState
  const state = new CodegenState(options);
  // 判断如果ast存在，调用genElement开始生成代码，否则直接返回_c("div")
  const code = ast ? genElement(ast, state) : '_c("div")';
  // 返回render和staticRenderFns
  return {
    // 生成的ast对象对应的字符串形式
    render: `with(this){return ${code}}`,
    // 数组
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  // 判断当前的ast对象是否有parent属性
  // 当前的pre去记录pre或者父节点的pre
  // 如果是父节点有v-pre的话，那么子节点也是静态的
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  // 如果当前已经处理过静态根节点就不再处理
  // staticProcessed属性是用来标记当前属性是否被处理了
  // genElement会被递归调用，这里判断的目的就是防止重复处理
  if (el.staticRoot && !el.staticProcessed) {
    // 传入两个参数，el是静态根节点
    return genStatic(el, state)
  // 下面出依次处理once，for，if指令，把他们转换成相应的代码
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  // 如果是template标签，判断其不是slot或者pre，说明不是静态的，接下来会生成内部的子节点，以及对应的代码
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
  // 如果没有子节点，返回void 0，也就是undefined
    return genChildren(el, state) || 'void 0'
  // 处理slot标签
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  // 如果上面都不满足，下面处理组件以及内置的标签
  } else {
    // component or element
    let code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      // 这里只考虑普通标签的处理情况
      let data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        // 生成元素的属性/指令/事件等
        // 处理各种指令，包括 genDirectives(model/text/html)
        // 这里会把ast对象的相应属性转换成createElement所需要的data对象的字符串形式
        data = genData$2(el, state);
      }

      // 处理子节点，把el中的子节点转换成createElement中需要的数组形式，也就是第三个参数
      // 调用genChildren的时候传了三个参数，调用完之后就生成了render函数中需要的js代码
      const children = el.inlineTemplate ? null : genChildren(el, state, true);
      // 调用_c，传入标签，data和children
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`;
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    // 返回生成的代码
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  // 首先标记staticProcessed属性为true，即当前节点已经被处理过了
  el.staticProcessed = true;
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  // 将state.pre暂存到一个变量中
  const originalPreState = state.pre;
  // 获取ast中的pre属性赋值给state.pre
  if (el.pre) {
    state.pre = el.pre;
  }
  //把静态根节点转换成生成vnode的对应js代码，这里调用了genElement，这个时候staticProcessed已经标记为处理过，所以不用再处理
  // 这里使用数组是因为，一个模板中可能有多个静态子节点，这个是先把每一个静态子树对应的代码进行存储，最后返回的是当前节点对应的代码，下面返回了_m的调用，传入了当前节点在renderFunctions数组中对应的索引，即把刚刚生成的代码传递进来，
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`);
  // 处理完成之后将state.pre还原
  state.pre = originalPreState;
  return `_m(${
    // 注意，这里最终传递的是函数的形式，因为这些字符串形式的代码，都会被转化成函数
    // _m : renderStatic
    state.staticRenderFns.length - 1
  }${
    el.staticInFor ? ',true' : ''
  })`
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    let key = '';
    let parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
       state.warn(
        `v-once can only be used inside v-for that is keyed. `,
        el.rawAttrsMap['v-once']
      );
      return genElement(el, state)
    }
    return `_o(${genElement(el, state)},${state.onceId++},${key})`
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  const condition = conditions.shift();
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions, state, altGen, altEmpty)
    }`
  } else {
    return `${genTernaryExp(condition.block)}`
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  const exp = el.for;
  const alias = el.alias;
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : '';
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : '';

  if (
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
      `v-for should have explicit keys. ` +
      `See https://vuejs.org/guide/list.html#key for more info.`,
      el.rawAttrsMap['v-for'],
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${(altGen || genElement)(el, state)}` +
    '})'
}

function genData$2 (el, state) {
  // 这个内部拼的是普通的js对象的字符串形式，会根据el对象的属性去拼接相应的data，最后返回data
  // 返回的data就是createElement的第二个参数
  let data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state);
  if (dirs) data += dirs + ',';

  // key
  if (el.key) {
    data += `key:${el.key},`;
  }
  // ref
  if (el.ref) {
    data += `ref:${el.ref},`;
  }
  if (el.refInFor) {
    data += `refInFor:true,`;
  }
  // pre
  if (el.pre) {
    data += `pre:true,`;
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += `tag:"${el.tag}",`;
  }
  // module data generation functions
  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`;
  }
  // DOM props
  if (el.props) {
    data += `domProps:${genProps(el.props)},`;
  }
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`;
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true)},`;
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += `slot:${el.slotTarget},`;
  }
  // scoped slots
  if (el.scopedSlots) {
    data += `${genScopedSlots(el, el.scopedSlots, state)},`;
  }
  // component v-model
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`;
  }
  // inline-template
  if (el.inlineTemplate) {
    const inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += `${inlineTemplate},`;
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.
  if (el.dynamicAttrs) {
    data = `_b(${data},"${el.tag}",${genProps(el.dynamicAttrs)})`;
  }
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  const dirs = el.directives;
  if (!dirs) return
  let res = 'directives:[';
  let hasRuntime = false;
  let i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    const gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`;
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  const ast = el.children[0];
  if ( (
    el.children.length !== 1 || ast.type !== 1
  )) {
    state.warn(
      'Inline-template components must have exactly one child element.',
      { start: el.start }
    );
  }
  if (ast && ast.type === 1) {
    const inlineRenderFns = generate(ast, state.options);
    return `inlineTemplate:{render:function(){${
      inlineRenderFns.render
    }},staticRenderFns:[${
      inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
    }]}`
  }
}

function genScopedSlots (
  el,
  slots,
  state
) {
  // by default scoped slots are considered "stable", this allows child
  // components with only scoped slots to skip forced updates from parent.
  // but in some cases we have to bail-out of this optimization
  // for example if the slot contains dynamic names, has v-if or v-for on them...
  let needsForceUpdate = el.for || Object.keys(slots).some(key => {
    const slot = slots[key];
    return (
      slot.slotTargetDynamic ||
      slot.if ||
      slot.for ||
      containsSlotChild(slot) // is passing down slot from parent which may be dynamic
    )
  });

  // #9534: if a component with scoped slots is inside a conditional branch,
  // it's possible for the same component to be reused but with different
  // compiled slot content. To avoid that, we generate a unique key based on
  // the generated code of all the slot contents.
  let needsKey = !!el.if;

  // OR when it is inside another scoped slot or v-for (the reactivity may be
  // disconnected due to the intermediate scope variable)
  // #9438, #9506
  // TODO: this can be further optimized by properly analyzing in-scope bindings
  // and skip force updating ones that do not actually use scope variables.
  if (!needsForceUpdate) {
    let parent = el.parent;
    while (parent) {
      if (
        (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
        parent.for
      ) {
        needsForceUpdate = true;
        break
      }
      if (parent.if) {
        needsKey = true;
      }
      parent = parent.parent;
    }
  }

  const generatedSlots = Object.keys(slots)
    .map(key => genScopedSlot(slots[key], state))
    .join(',');

  return `scopedSlots:_u([${generatedSlots}]${
    needsForceUpdate ? `,null,true` : ``
  }${
    !needsForceUpdate && needsKey ? `,null,false,${hash(generatedSlots)}` : ``
  })`
}

function hash(str) {
  let hash = 5381;
  let i = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0
}

function containsSlotChild (el) {
  if (el.type === 1) {
    if (el.tag === 'slot') {
      return true
    }
    return el.children.some(containsSlotChild)
  }
  return false
}

function genScopedSlot (
  el,
  state
) {
  const isLegacySyntax = el.attrsMap['slot-scope'];
  if (el.if && !el.ifProcessed && !isLegacySyntax) {
    return genIf(el, state, genScopedSlot, `null`)
  }
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genScopedSlot)
  }
  const slotScope = el.slotScope === emptySlotScopeToken
    ? ``
    : String(el.slotScope);
  const fn = `function(${slotScope}){` +
    `return ${el.tag === 'template'
      ? el.if && isLegacySyntax
        ? `(${el.if})?${genChildren(el, state) || 'undefined'}:undefined`
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)
    }}`;
  // reverse proxy v-slot without scope on this.$slots
  const reverseProxy = slotScope ? `` : `,proxy:true`;
  return `{key:${el.slotTarget || `"default"`},fn:${fn}${reverseProxy}}`
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  // 先判断ast对象是否有子节点
  const children = el.children;
  if (children.length) {
    const el = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el.for &&
      el.tag !== 'template' &&
      el.tag !== 'slot'
    ) {
      const normalizationType = checkSkip
        ? state.maybeComponent(el) ? `,1` : `,0`
        : ``;
      return `${(altGenElement || genElement)(el, state)}${normalizationType}`
    }
    // 首先获取如何处理数组，即createElement的第四个参数
    // 数组是否需要被降维
    const normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    // 获取了gen函数，这个函数首先会获取altGenNode，这个是genChildren的第四个参数，刚才调用的时候没有传这个参数，所以此时这个没有值，
    // 返回的是genNode
    const gen = altGenNode || genNode;
    // 调用map遍历数组中的每一个元素，使用刚获取到的gen函数对每一个元素处理并且返回
    // map最终将所有的子节点通过gen函数转换成了代码，然后通过join把数组中的元素，把逗号进行分割，返回了字符串，把结果存储到数组中
    return `[${children.map(c => gen(c, state)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  let res = 0;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  //判断当前ast对象的类型，如果是标签，继续调用genElement处理当前的子节点
  if (node.type === 1) {
    return genElement(node, state)
  // 如果type是3，并且是注释节点，调用genComment生成注释节点的代码
  } else if (node.type === 3 && node.isComment) {
    /**
     * export function genComment (comment: ASTText): string {
        // 创建了一个被标识为comment的vnode节点
        // 参数JSON.stringify，给字符串加引号 hello -> "hello"
        // 因为最后生成的是字符串形式的代码
        return `_e(${JSON.stringify(comment.text)})`
      }
     */
    return genComment(node)
    // 处理文本节点，里面返回了render函数中的代码
  } else {
    /**
     * export function genText (text: ASTText | ASTExpression): string {
        // 用来创建文本的vnode节点
        // 如果type是2，此时处理的是表达式，直接返回该表达式，表达式已经使用了toString函数转换成了字符串
        // 下面还使用了JSON.stringify转成字符串，还用了transformSpecialNewlines函数，这个函数的作用是将代码中一些特殊的换行，unicode形式的进行修正，防止意外情况
        return `_v(${text.type === 2
          ? text.expression // no need for () because already wrapped in _s()
          : transformSpecialNewlines(JSON.stringify(text.text))
        })`
      }
     */
    return genText(node)
  }
}

function genText (text) {
  // 用来创建文本的vnode节点
  // 如果type是2，此时处理的是表达式，直接返回该表达式，表达式已经使用了toString函数转换成了字符串
  // 下面还使用了JSON.stringify转成字符串，还用了transformSpecialNewlines函数，这个函数的作用是将代码中一些特殊的换行，unicode形式的进行修正，防止意外情况
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}

function genComment (comment) {
  // 创建了一个被标识为comment的vnode节点
  // 参数JSON.stringify，给字符串加引号 hello -> "hello"
  // 因为最后生成的是字符串形式的代码
  return `_e(${JSON.stringify(comment.text)})`
}

function genSlot (el, state) {
  const slotName = el.slotName || '"default"';
  const children = genChildren(el, state);
  let res = `_t(${slotName}${children ? `,${children}` : ''}`;
  const attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      })))
    : null;
  const bind = el.attrsMap['v-bind'];
  if ((attrs || bind) && !children) {
    res += `,null`;
  }
  if (attrs) {
    res += `,${attrs}`;
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  const children = el.inlineTemplate ? null : genChildren(el, state, true);
  return `_c(${componentName},${genData$2(el, state)}${
    children ? `,${children}` : ''
  })`
}

function genProps (props) {
  let staticProps = ``;
  let dynamicProps = ``;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    const value =  transformSpecialNewlines(prop.value);
    if (prop.dynamic) {
      dynamicProps += `${prop.name},${value},`;
    } else {
      staticProps += `"${prop.name}":${value},`;
    }
  }
  staticProps = `{${staticProps.slice(0, -1)}}`;
  if (dynamicProps) {
    return `_d(${staticProps},[${dynamicProps.slice(0, -1)}])`
  } else {
    return staticProps
  }
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */



// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
const prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
const unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// strip strings in expressions
const stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast, warn) {
  if (ast) {
    checkNode(ast, warn);
  }
}

function checkNode (node, warn) {
  if (node.type === 1) {
    for (const name in node.attrsMap) {
      if (dirRE.test(name)) {
        const value = node.attrsMap[name];
        if (value) {
          const range = node.rawAttrsMap[name];
          if (name === 'v-for') {
            checkFor(node, `v-for="${value}"`, warn, range);
          } else if (name === 'v-slot' || name[0] === '#') {
            checkFunctionParameterExpression(value, `${name}="${value}"`, warn, range);
          } else if (onRE.test(name)) {
            checkEvent(value, `${name}="${value}"`, warn, range);
          } else {
            checkExpression(value, `${name}="${value}"`, warn, range);
          }
        }
      }
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

function checkEvent (exp, text, warn, range) {
  const stripped = exp.replace(stripStringRE, '');
  const keywordMatch = stripped.match(unaryOperatorsRE);
  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
    warn(
      `avoid using JavaScript unary operator as property name: ` +
      `"${keywordMatch[0]}" in expression ${text.trim()}`,
      range
    );
  }
  checkExpression(exp, text, warn, range);
}

function checkFor (node, text, warn, range) {
  checkExpression(node.for || '', text, warn, range);
  checkIdentifier(node.alias, 'v-for alias', text, warn, range);
  checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
  checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
}

function checkIdentifier (
  ident,
  type,
  text,
  warn,
  range
) {
  if (typeof ident === 'string') {
    try {
      new Function(`var ${ident}=_`);
    } catch (e) {
      warn(`invalid ${type} "${ident}" in expression: ${text.trim()}`, range);
    }
  }
}

function checkExpression (exp, text, warn, range) {
  try {
    new Function(`return ${exp}`);
  } catch (e) {
    const keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      warn(
        `avoid using JavaScript keyword as property name: ` +
        `"${keywordMatch[0]}"\n  Raw expression: ${text.trim()}`,
        range
      );
    } else {
      warn(
        `invalid expression: ${e.message} in\n\n` +
        `    ${exp}\n\n` +
        `  Raw expression: ${text.trim()}\n`,
        range
      );
    }
  }
}

function checkFunctionParameterExpression (exp, text, warn, range) {
  try {
    new Function(exp, '');
  } catch (e) {
    warn(
      `invalid function parameter expression: ${e.message} in\n\n` +
      `    ${exp}\n\n` +
      `  Raw expression: ${text.trim()}\n`,
      range
    );
  }
}

/*  */

const range = 2;

function generateCodeFrame (
  source,
  start = 0,
  end = source.length
) {
  const lines = source.split(/\r?\n/);
  let count = 0;
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        res.push(`${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`);
        const lineLength = lines[j].length;
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1;
          const length = end > count ? lineLength - pad : end - start;
          res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.min(end - count, lineLength);
            res.push(`   |  ` + repeat(`^`, length));
          }
          count += lineLength + 1;
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat (str, n) {
  let result = '';
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) result += str;
      n >>>= 1;
      if (n <= 0) break
      str += str;
    }
  }
  return result
}

/*  */



function createFunction (code, errors) {
  // 通过new Function的形式把字符串代码转换成函数形式
  // 如果失败就把错误进行收集并且返回一个空函数
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err, code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  // 创建了没有原型的对象，目的为了通过闭包缓存编译之后的结果
  const cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    // 将options克隆了一份，是vue实例化传入的options
    options = extend({}, options);
    // 开发环境中在控制台发送警告
    const warn$1 = options.warn || warn;
    delete options.warn;

    /* istanbul ignore if */
    {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$1(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    // 1. 是否有编译的结果，如果有直接把编译的结果返回，不需要重新编译
    // 这里是用空间换时间，这里的key是把模板作为key
    // options的这个属性只有完整版的才有，只有编译的时候才会使用到
    // 其作用是改变插值表达式使用的符号，插值表达式默认的是使用{{}}
    // 通过这个属性可以把插值表达式所使用的符号改成任意的内容
    // 例如es6的模板字符串，官方文档中有相应的解释
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    // 2. 开始进行编译，把模板和用户传入的选项作为参数
    // 编译结束compiled：{ render, staticRenderFns }，此时的render中存储的是js的字符串形式
    // 这个对象中还有两个辅助的属性，compiled.errors和compiled.tips
    // 在编译模板的过程中，会收集模板中遇到的错误和一些信息
    const compiled = compile(template, options);

    // check compilation errors/tips
    // 在开发环境中，把compiled.errors和compiled.tips遇到的错误和一些信息打印出来
    {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(e => {
            warn$1(
              `Error compiling template:\n\n${e.msg}\n\n` +
              generateCodeFrame(template, e.start, e.end),
              vm
            );
          });
        } else {
          warn$1(
            `Error compiling template:\n\n${template}\n\n` +
            compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(e => tip(e.msg, vm));
        } else {
          compiled.tips.forEach(msg => tip(msg, vm));
        }
      }
    }

    // turn code into functions
    const res = {};
    const fnGenErrors = [];

    // 3. 把字符串形式的js代码转换成js方法
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    // 检查把错误信息打印出来
    {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$1(
          `Failed to generate render function:\n\n` +
          fnGenErrors.map(({ err, code }) => `${err.toString()} in\n\n${code}\n`).join('\n'),
          vm
        );
      }
    }

    //4. 缓存并返回res对象(render, staticRenderFns)
    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  // baseCompile 平台相关options
  // 这个函数返回了一个createCompiler函数
  return function createCompiler (baseOptions) {
    // createCompiler在中定义了一个compile函数，用来接收模板和用户传递的选项两个参数
    // 在这个函数中会把与平台相关的选项和用于传入的选项参数进行合并
    // 再调用baseCompile把合并后的选项传递给它
    // 这是通过函数，返回函数的一个目的
    function compile (
      template,
      options
    ) {
      // 原型指向了baseOptions，作用是合并baseOptions和compile参数options
      const finalOptions = Object.create(baseOptions);
      // 存储编译过程中存储的错误和信息
      const errors = [];
      const tips = [];
      //把消息放到对应的数组中
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg);
      };

      // 如果options存在的话，开始合并baseOptions和optinos
      if (options) {
        if ( options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = (msg, range, tip) => {
            const data = { msg };
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }
            (tip ? tips : errors).push(data);
          };
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          );
        }
        // copy other options
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;
      
      //调用baseCompile，传入template和合并之后的选项，
      // 里面将template转化成ast语法树，优化语法树之后将语法树转化成js代码
      // 返回的值是
      /**
       * compiled ： 
       * return {
          ast,
          render: code.render,(js字符串形式的代码)
          staticRenderFns: code.staticRenderFns
        }
       */
      const compiled = baseCompile(template.trim(), finalOptions);
      
      {
        detectErrors(compiled.ast, warn);
      }
      // 会将errors和tips数组的信息赋值给compiled的属性errors和tips
      compiled.errors = errors;
      compiled.tips = tips;
      // 将编译好的对象返回
      return compiled
    }

    // 最后返回了compile和compileToFunctions
    // compileToFunctions是createCompileToFunctionFn返回的，这个函数是模板编译的入口
    /**
     * compiled ： 
     * return {
        ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
      }
      */
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// createCompiler也是通过一个函数返回，传入baseCompile函数，这个是核心函数
// createCompiler内部return了
/**
 *
  compiled ： 
    return {
      ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  createCompileToFunctionFn：compileToFunctions
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
 */
const createCompiler = createCompilerCreator(function baseCompile (
  //baseCompile接收模板和合并后的选项参数
  template,
  options
) {
  // 里面做了三件事情
  // 1.把模板转换成 ast 抽象语法树
  // 抽象语法树，用树形的方式描述代码结构

    //parse函数接收两个参数，一个是模板字符串，去除了前后空格，和合并后的选项，返回一个ast对象
  const ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    // 2.优化抽象语法树
    optimize(ast, options);
  }
  // 3.把抽象语法树生成字符串形式的js代码
  const code = generate(ast, options);
  // 将render和staticRenderFns返回
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

const { compile, compileToFunctions } = createCompiler(baseOptions);

/*  */

// check whether current browser encodes a char inside attribute values
let div;
function getShouldDecode (href) {
  div = div || document.createElement('div');
  div.innerHTML = href ? `<a href="\n"/>` : `<div a="\n"/>`;
  return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
const shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
// #6828: chrome encodes content in a[href]
const shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

/*  */

const idToTemplate = cached(id => {
  // 根据id获取DOM元素并返回其innerHTML
  const el = query(id);
  return el && el.innerHTML
});

// 将原来的$mount函数存到一个变量中，对原来的$mount方法进行template转化成render函数的操作
const mount = Vue.prototype.$mount;
// 这个方法是挂载，把DOM挂载到页面上
Vue.prototype.$mount = function (
  el,
  // 非 ssr 情况下为 false，ssr 时候为 true
  hydrating
) {
  // 获取 el 对象
  el = el && query(el);

  /* istanbul ignore if */
  // 判断el不能是body或者html DOM元素，只能是普通元素进行挂载，并返回这个元素
  if (el === document.body || el === document.documentElement) {
     warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    );
    return this
  }

  const options = this.$options;
  // resolve template/el and convert to render function
  // 判断选项中是否有render，如果没有render，就取template选项，进行转化
  if (!options.render) {
    let template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ( !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ( config.performance && mark) {
        mark('compile');
      }

      // 把 template 转换成 redner 函数
      // staticRenderFns是一个数组
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      // 将render和staticRenderFns记录到对应的options属性中
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ( config.performance && mark) {
        mark('compile end');
        measure(`vue ${this._name} compile`, 'compile', 'compile end');
      }
    }
  }
  // 如果有render选项就调用mount方法
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  // 如果el里面有outerHTML属性就直接返回作为模板
  if (el.outerHTML) {
    return el.outerHTML
  // 如果不是的话可能不是一个DOM元素，可能是一个文本节点或者一个注释节点
  } else {
    // 创建一个div，将el克隆一份放到div里面，最终把其innerHTML返回作为模板
    const container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

// 定义了一个新的静态方法compile，将html字符串编译成render函数
Vue.compile = compileToFunctions;

export default Vue;
