import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  // patch 方便后续的递归处理
  patch(vnode, container)
}

function patch(vnode, container) {
  // 去处理组件
  // 判断是不是element类型
  processComponent(vnode, container)
}

function processComponent(vnode, container) {
  // 挂在组件
  mountedComponent(vnode, container)
}

function mountedComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render()
  // vnode => patch
  // vnode => element => mountElement
  patch(subTree, container)
}

