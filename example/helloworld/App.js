import {
  h
} from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';
window.self = null
export const App = {
  name: "App",
  // .vue
  // <template></template>
  // render
  render () {
    return h('div', {
      id: "root",
      class: ["red", "hard"],
      onClick () {
        console.log("click");
      }
    },
      // [h('span', {
      //   class: "red"
      // }, "hi,"), h("span", {
      //   class: "blue"
      // }, "mini-vue")])
      // 'hi,mini-vue')
      // 'hi,' + this.msg)
      [h("div", {}, "hi," + this.msg), h(Foo, { count: 1 })])
  },
  setup () {
    // composition api
    return {
      msg: "mini-vue",
    }
  }
}