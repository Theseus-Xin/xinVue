import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先vnode
      // component
      // 所有的逻辑操作，都会基于vnode 做处理
      const vnode = createVNode(rootComponent);
      // 调用patch方法
      render(vnode, rootContainer)
    }
  }
}

