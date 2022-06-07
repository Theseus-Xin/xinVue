import {
  h
} from '../../lib/guide-mini-vue.esm.js';
import { Foo } from './Foo.js';
window.self = null
export const App = {
  name: "App",
  render () {
    return h('div', {}, [h("div", {}, "hi," + "App"), h(Foo, {
      // emit
      onAdd (a, b) {
        console.log("onAdd", a, b);
      }
    })])
  },
  setup () {
    return {}
  }
}