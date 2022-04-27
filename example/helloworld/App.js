export const App = {
  // .vue
  // <template></template>
  // render
  render (h) {
    return h('div', 'hi,' + this.msg)
  },
  setup (props) {
    // composition api
    return {
      msg: "mini-vue",
    }
  }
}