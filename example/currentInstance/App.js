import {
  h, getCurrentInstance
} from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';
window.self = null
export const App = {
  name: "App",
  render () {
    return h("div", {}, [h("p", {}, "currentInstance dome"), h(Foo)])
  },

  setup () {
    const instance = getCurrentInstance()
  }
}