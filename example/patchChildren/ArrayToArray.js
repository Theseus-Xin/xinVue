import { ref, h } from "../../lib/guide-mini-vue.esm.js"
// // 1. 左侧对比
// // （a,b）,c
// const prevChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]

// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
// ]
// 2. 右侧的对比
// （a,b）,c
// const prevChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]

// const nextChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ]

// 3.新的比老的长
const prevChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B")
]

const nextChildren = [
  // h("div", { key: "C" }, "C"),
  h("div", { key: "D" }, "D"),
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),


]

// // 4.老的比新的长
// const prevChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
// ]

// const nextChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B")
// ]

export default {
  name: "ArrayToText",
  setup () {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange
    }
  },
  render () {
    const self = this;
    return self.isChange === true ? h("div", {}, nextChildren) : h("div", {}, prevChildren)
  }
}