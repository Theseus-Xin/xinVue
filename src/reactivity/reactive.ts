import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'
import { isObject } from '../shared/index';

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers)
}


export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers)
}


export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers)

}

export function isReactive(val) {
  return !!val[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(val) {
  return !!val[ReactiveFlags.IS_READONLY]
}

export function isProxy(val) {
  return isReactive(val) || isReadonly(val)
}

function createReactiveObject(target, baseHandlers) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`)
    return target
  }

  return new Proxy(target, baseHandlers)
}
