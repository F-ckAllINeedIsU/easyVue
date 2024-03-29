/**
  *  When I wrote this, only God and I understood what I was doing
  *  Now, God only knows
  *                                                       -- Chan
  *                                                       -- 2019-11-02
  */

// 创建Vue类
class Vue {
  // 接收实例传输的数据，如果没传默认为空对象
  constructor(options = {}) {
    this.$el = options.el
    this.$data = options.data
    this.$methods = options.methods

    // 劫持 data 中的数据
    new Observer(this.$data)

    // 把data中所有的数据代理到了vm上
    this.proxy(this.$data)
    // 把methods中所有的数据代理到了vm上
    this.proxy(this.$methods)

    // 如果指定了$el，就对el进行解析
    // compiler负责解析模板，需要$el和$data
    this.$el ? new Compiler(this.$el, this) : (() => null)()
  }

  // 把数据和方法代理到 Vue 实力身上 
  proxy (data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (data[key] == newValue) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}