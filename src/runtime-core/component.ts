import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { shallowReadonly } from '../reactivity/reactive';

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {}
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  // initSlots()
  // 初始化一个有状态的component
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy(
    { _: instance }, PublicInstanceProxyHandlers
    // set() {

    // }
  )

  const { setup } = Component
  if (setup) {
    // function Object
    const setupResult = setup(shallowReadonly(instance.props))
    handleSetupResult(instance, setupResult)
  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
