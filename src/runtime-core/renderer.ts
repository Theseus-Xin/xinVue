import { EMPTY_OBJ, isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode"
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';
export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  function render(vnode, container) {
    // patch 方便后续的递归处理
    patch(null, vnode, container, null, null)
  }
  // n1 => old
  // n2 => new
  function patch(n1, n2, container, parentComponent, anchor) {
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
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break;
    }
  }

  function processFragment(n1, n2: any, container: any, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }
  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }


  function processElement(n1, n2: any, container: any, parentComponent, anchor) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }


  function patchChildren(n1: any, n2: any, container, parentComponent, anchor) {

    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 把老的children 清空，
        unMountChildren(n1.children)
      }
      // 设置新的text
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "")
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    const l1 = c1.length, l2 = c2.length
    let i = 0, e1 = l1 - 1, e2 = l2 - 1


    function isSomeVNodeType(n1, n2) {
      // type key
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧开始遍历
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }
    // 右侧开始遍历
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的长
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    }
  }

  function unMountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        if (Object.prototype.hasOwnProperty.call(newProps, key)) {
          const prevProp = oldProps[key]
          const nextProp = newProps[key];
          if (prevProp !== nextProp)
            hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (Object.prototype.hasOwnProperty.call(oldProps, key))
            if (!(key in newProps))
              hostPatchProp(el, key, oldProps[key], null)

        }
      }

    }
  }
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    if (props) {
      for (const key in props) {
        const val = props[key]
        hostPatchProp(el, key, null, val)
      }
    }
    hostInsert(el, container, anchor)
  }

  function mountChildren(children: any, el: any[], parentComponent, anchor) {
    children.forEach(v => {
      patch(null, v, el, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    // 挂在组件
    mountComponent(n2, container, parentComponent, anchor)
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function setupRenderEffect(instance, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        // vnode => patch
        // vnode => element => mountElement
        patch(null, subTree, container, instance, anchor)

        // element => mount
        initialVNode.el = subTree.el
        instance.isMounted = true
      } else {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree
        patch(prevSubTree, subTree, container, instance, anchor)
      }

    })

  }

  return {
    createApp: createAppAPI(render)
  }
}
