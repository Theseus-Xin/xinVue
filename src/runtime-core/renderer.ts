import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"

export function render(vnode, container) {
  // patch 方便后续的递归处理
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  // 去处理组件
  // 判断是不是element类型
  // 是element，处理element
  // 如何判断是element还是component
  // processElement()

  // shapeFlags
  const { type, shapeFlag } = vnode
  // Fragment -> 只渲染children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break;
  }
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent)
}
function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}


function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const { type, props, children, shapeFlag } = vnode;
  const el = (vnode.el = document.createElement(type))
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent)
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

function mountChildren(vnode: any, el: any[], parentComponent) {
  vnode.children.forEach(v => {
    patch(v, el, parentComponent)
  })
}

function processComponent(vnode, container, parentComponent) {
  // 挂在组件
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent)
  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container, parentComponent)
}

function setupRenderEffect(instance, initialVNode, container, parentComponent) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // vnode => patch
  // vnode => element => mountElement
  patch(subTree, container, instance)

  // element => mount
  initialVNode.el = subTree.el
}

