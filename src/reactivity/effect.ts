import { extend } from '../shared'

let activeEffect
let shouldTrack
export class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  public scheduler: Function | undefined
  onStop?: () => void
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    activeEffect = this
    // 会收集依赖
    if (!this.active) {
      this._fn()
    }
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    // reset
    shouldTrack = false
    return result
  }

  stop() {
    if (this.active) {
      // 清除依赖
      cleanupEffect(this)
      // 执行副作用
      if (this.onStop) this.onStop()
      // 设置为stop
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
}

const targetMap = new Map()
export function track(target, key) {
  if (!isTracking()) return
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}
export function trackEffects(dep) {
  // 已经在dep中
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}



export function trigger(target, key) {

  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {

  dep.forEach(effect => {
    if (effect.scheduler) effect.scheduler()
    else effect.run()
  })

  // for (const effect of dep) {
  //   if (effect.scheduler) effect.scheduler()
  //   else effect.run()
  // }
}

export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // options
  // Object.assign(_effect, options)
  // extend
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
export function stop(runner) {
  runner.effect.stop()
}
