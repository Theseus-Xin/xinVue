import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

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

  // shapeFlags
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container)
  }
}
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type))
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }

  if (props) {
    for (const key in props) {
      const val = props[key]
      console.log(key);
      const isOn = (key: string) => /^on[A-Z]/.test(key)
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
      } else {
        el.setAttribute(key, val)
      }
    }
  }
  container.append(el)
}

function mountChildren(children: any, el: any[]) {
  children.forEach(v => {
    patch(v, el)
  })
}

function processComponent(vnode, container) {
  // 挂在组件
  mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // vnode => patch
  // vnode => element => mountElement
  patch(subTree, container)

  // element => mount
  initialVNode.el = subTree.el
}
