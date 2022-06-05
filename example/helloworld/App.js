import {
  h
} from '../../lib/guide-mini-vue.esm.js';
window.self = null
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    window.self = this
    return h('div', {
        id: "root",
        class: "red",
        onClick() {
          console.log("click");
        }
      },
      // [h('span', {
      //   class: "red"
      // }, "hi,"), h("span", {
      //   class: "blue"
      // }, "mini-vue")])
      // 'hi,mini-vue')
      'hi,' + this.msg)
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    }
  }
}