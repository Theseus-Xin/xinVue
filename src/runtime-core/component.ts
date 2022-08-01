import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { shallowReadonly } from '../reactivity/reactive';
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
import { proxyRefs } from '../reactivity/ref';

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    next: null,
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => { },
  }
  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  // 初始化一个有状态的component
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy(
    { _: instance }, PublicInstanceProxyHandlers
  )

  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    // function Object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)

  }
}
function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}