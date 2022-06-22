import { hasChanged, isObject } from '../shared/index';
import { isTracking, trackEffects, triggerEffects } from './effect';
import { reactive } from './reactive';
class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true
  constructor(value) {
    // value -> reactive
    // 看看value是不是对象
    this._rawValue = value
    this._value = convert(value)
    this.dep = new Set()
  }

  get value() {
    // 依赖收集
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 一定是先修改
    // 对比的时候 object
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)

}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 看看是不是ref
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }

  })
}