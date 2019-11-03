/**
  *  When I wrote this, only God and I understood what I was doing
  *  Now, God only knows
  *                                                       -- Chan
  *                                                       -- 2019-11-02
  */

// 负责解析模板
class Compiler {
  constructor(el, vm) {
    // el为new Vue传递的dom对象
    // 如果传递的是Id就通过选择器选择dom，如果传递的是dom直接使用
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    // vm为new Vue的实例
    this.vm = vm

    // 每次修改数据，然后依次渲染dom影响性能
    // 所以在内存中生成虚拟dom，全部修改完毕再一次性渲染
    if (this.el) {
      //1. 把el中所有的子节点都放入到内存中， fragment
      let fragment = this.node2Fragment(this.el)
      //2. 在内存中编译fragment
      this.compiler(fragment)
      //3. 把fragment一次性的添加到页面
      this.el.appendChild(fragment)
    }
  }

  // 核心方法

  // 在内存中生成虚拟碎片，减少页面回流
  node2Fragment (node) {
    // 创建文档碎片
    let fragment = document.createDocumentFragment()
    // 把el中所有的子节点挨个添加到文档碎片中
    // childNodes 返回值为 NodeList 类型，且为只读
    let childNodes = node.childNodes
    this.toArray(childNodes).forEach(node => {
      fragment.appendChild(node)
    })
    return fragment
  }

  // 编译文档碎片（内存中）
  compiler (fragment) {
    let childNodes = fragment.childNodes
    this.toArray(childNodes).forEach(node => {
      // 编译子节点
      // 如果是元素， 需要解析指令
      if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      // 如果是文本节点， 需要解析插值表达式
      if (this.isTextNode(node)) {
        this.compileText(node)
      }
      // 如果当前节点还有子节点，需要递归的解析
      if (node.childNodes && node.childNodes.length > 0) {
        this.compiler(node)
      }
    })
  }

  // 元素节点，解析指令
  compileElement (node) {
    // 1. 获取到当前节点下所有的属性
    let attributes = node.attributes
    // 2. 解析vue的指令（所以以v-开头的属性）
    this.toArray(attributes).forEach(attr => {
      // 获取属性名
      let attrName = attr.name
      // 判断是否是指令
      if (this.isDirective(attrName)) {
        let type = attrName.slice(2)
        let expr = attr.value
        // 判断是否是事件指令
        if (this.isEventDirective(type)) {
          CompileUtil["eventHandler"](node, this.vm, type, expr)
        } else {
          // 不是事件指令进行的操作
          CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
        }
      }
    })
  }

  // 解析文本节点
  compileText (node) {
    CompileUtil.mustache(node, this.vm)
  }

  // 工具方法
  toArray (likeArray) {
    return [].slice.call(likeArray)
  }
  // 判断是什么类型的节点
  //nodeType: 节点的类型  1：元素节点  3：文本节点
  // 元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
  // 文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断是否是指令
  isDirective (attrName) {
    return attrName.startsWith("v-")
  }
  // 判断是否是事件指令
  isEventDirective (type) {
    return type.split(":")[0] === "on"
  }
}

let CompileUtil = {
  // 处理插值表达式
  mustache (node, vm) {
    let txt = node.textContent
    let reg = /\{\{(.+)\}\}/
    if (reg.test(txt)) {
      let expr = RegExp.$1
      node.textContent = txt.replace(reg, this.getVMValue(vm, expr))
      new Watcher(vm, expr, newValue => node.textContent = txt.replace(reg, newValue))
    }
  },

  // 处理v-text指令
  text (node, vm, expr) {
    node.textContent = this.getVMValue(vm, expr)
    // 通过watcher对象，监听expr的数据的变化，一旦变化了，执行回调函数
    new Watcher(vm, expr, newValue => node.textContent = newValue)
  },

  // 处理 v-html 指令
  html (node, vm, expr) {
    node.innerHTML = this.getVMValue(vm, expr)
    new Watcher(vm, expr, newValue => node.innerHTML = newValue)
  },

  // 处理 v-model 指令
  model (node, vm, expr) {
    let _self = this
    node.value = this.getVMValue(vm, expr)
    // 实现双向的数据绑定， 给node注册input事件，当当前元素的value值发生改变，修改对应的数据
    node.addEventListener("input", function () {
      _self.setVMValue(vm, expr, this.value)
    })
    new Watcher(vm, expr, newValue => node.value = newValue)

  },

  // 处理 v-on 指令
  eventHandler (node, vm, type, expr) {
    // 给当前元素注册事件即可
    let eventType = type.split(":")[1]
    let fn = vm.$methods && vm.$methods[expr]
    if (eventType && fn) node.addEventListener(eventType, fn.bind(vm))
  },

  // 当data是复杂数据类型时，这个方法用于获取VM中的数据
  getVMValue (vm, expr) {
    // 获取到data中的数据
    let data = vm.$data
    expr.split(".").forEach(key => data = data[key])
    return data
  },
  // 当data是复杂数据类型时，这个方法用于设置VM中的数据
  setVMValue (vm, expr, value) {
    let data = vm.$data
    let arr = expr.split(".")

    // 如果index是最后一个
    arr.forEach((key, index) => index < arr.length - 1 ? data = data[key] : data[key] = value)
  }
}