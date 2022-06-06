import { createComponentInstance, setupComponent } from "./component"
import { isObject } from '../shared/index';

export function render(vnode, container) {
  // patch 方便后续的递归处理
  patch(vnode, container)
}

function patch(vnode, container) {
  // 去处理组件
  // 判断是不是element类型
  // 是element，处理element
  // 如何判断是element还是component
  // processElement()
  console.log(vnode.type);
  if (typeof vnode.type === "string") {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode
  const el = document.createElement(type)

  if (typeof children === "string") {
    el.textContent = children
  } else if (Array.isArray(children)) {
    children.forEach(v => {
      patch(v, el)
    })
  }

  // string array
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }
  container.append(el)
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

