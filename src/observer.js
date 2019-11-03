/**
  *  When I wrote this, only God and I understood what I was doing
  *  Now, God only knows
  *                                                       -- Chan
  *                                                       -- 2019-11-02
  */

// observer用于给data中所有的数据添加getter和setter
// 实现数据劫持功能
class Observer {
  constructor(data) {
    this.data = data
    this.hijackedData(data)
  }

  // 核心方法
  // 遍历data中所有的数据，都添加上getter和setter
  // 实现数据劫持
  hijackedData (data) {
    // 判断用户是否传递了data，且data格式是否正确
    if (!data || typeof data != "object") return

    Object.keys(data).forEach(key => {
      // 给data对象的key设置getter和setter
      this.defineReactive(data, key, data[key])
      // 如果data[key]是一个复杂的类型，递归的walk
      this.hijackedData(data[key])
    })
  }

  // 定义响应式的数据（数据劫持）

  // data中的每一个数据都应该维护一个dep对象
  // dep保存了所有的订阅了该数据的订阅者

  defineReactive (obj, key, value) {
    let _self = this
    let dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 如果Dep.target中有watcher对象，存储到订阅者数组中
        Dep.target && dep.addSub(Dep.target)

        return value
      },
      set (newValue) {
        // 判断新旧值是否相等
        if (value === newValue) return
        value = newValue
        // 如果newValue是一个对象，也应该对她进行劫持
        _self.hijackedData(newValue)

        // 发布通知，让所有的订阅者更新内容
        dep.notify()

      }
    })
  }

}