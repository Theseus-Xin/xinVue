// import { render } from "./ren derer";
import { createVNode } from "./vnode";

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      // 本来应该接收一个string，暂时先接收一个element实例
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

}

