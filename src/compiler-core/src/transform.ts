import { NodeTypes } from "./ast";

export function transform(root, options = []) {

  const context = createTransformContext(root, options)
  // 遍历，深度优先搜索
  traverseNode(root, context)
  // 修改text  content

  createRootCodegen(root)
}

function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node)
  }

  traverseChildren(node, context)
}

function traverseChildren(node, context) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      traverseNode(child, context)
    }
  }
}

function createTransformContext(root: any, options: any) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

