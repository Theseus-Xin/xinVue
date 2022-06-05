const ShapeFlags = {
  element: 0,
  stateful_component: 0,
  text_children: 0,
  array_children: 0
}

// vnode -> stateful_component ->
// 1. 可以设置，修改;
// ShapeFlags.array_children =1
// ShapeFlags.element =1

// 2.查找
// if (ShapeFlags.element)
// if (ShapeFlags.text_children)

// 不够高效-> 位运算
// 0000
// 0001->element
// 0010->stateful_component
// 0100->text_children
// 1000->array_children

// 0011->element stateful_children

// | （两位都为0，为0）
// & （两位都为1，为0）

