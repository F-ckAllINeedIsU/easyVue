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

  defineReactive (obj, key, value) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        return value
      },
      set (newValue) {
        // 判断新旧值是否相等
        if (value === newValue) return
        value = newValue
        // 如果newValue是一个对象，也应该对她进行劫持
        that.hijackedData(newValue)
      }
    })
  }

}