/*
 * @Author: your name
 * @Date: 2022-04-21 10:30:12
 * @LastEditTime: 2022-04-21 15:03:15
 * @LastEditors: your name
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /xinVue/src/reactivity/baseHandlers.ts
 */
import { extend, isObject } from "../shared"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {

    if (key == ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key == ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (shallow) {
      return res
    }

    // 检查res是不是一个object
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    // 依赖收集
    if (!isReadonly) track(target, key)
    return res
  }
}

function createSetter(isReadonly = false) {
  return function set(target, key, value) {
    if (isReadonly) return true
    const res = Reflect.set(target, key, value)
    // 触发依赖
    trigger(target, key)
    return res
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} set 失败 因为 target 是 readonly 的`, target);
    return true
  }
}
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet
})