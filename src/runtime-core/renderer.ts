import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    // patch 方便后续的递归处理
    patch(null, vnode, container, null)
  }
  // n1 => old
  // n2 => new
  function patch(n1, n2, container, parentComponent) {
    // 去处理组件
    // 判断是不是element类型
    // 是element，处理element
    // 如何判断是element还是component
    // processElement()

    // shapeFlags
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break;
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }


  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {

  }

  function mountElement(vnode: any, container: any, parentComponent) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    if (props) {
      for (const key in props) {
        const val = props[key]
        hostPatchProp(el, key, val)
      }
    }
    hostInsert(el, container)
  }

  function mountChildren(vnode: any, el: any[], parentComponent) {
    vnode.children.forEach(v => {
      patch(null, v, el, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    // 挂在组件
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("init");
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        // vnode => patch
        // vnode => element => mountElement
        patch(null, subTree, container, instance)

        // element => mount
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        console.log("update");
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        console.log("current", subTree);
        console.log("prevent", prevSubTree);
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance)
      }

    })

  }

  return {
    createApp: createAppAPI(render)
  }
}