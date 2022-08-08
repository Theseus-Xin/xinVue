import { isString } from "../../shared"
import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {

  const context = createCodegenContext()
  const { push } = context

  getFunctionPreamble(ast, context)

  const functionName = "render"

  const args = ['_ctx, _cache']

  const signature = args.join(", ")

  push(`function ${functionName}(${signature}){`)
  push("return ")
  genNode(ast.codegenNode, context)
  push("}")

  return {
    code: context.code
  }
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpress(node, context)
      break;
    default:
      break;
  }
}

function genCompoundExpress(node, context) {
  const children = node.children
  const { push } = context
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node

  push(`${helper(CREATE_ELEMENT_VNODE)}( `)

  // const child = children[0]
  genNodeList(genNullable([tag, props, children]), context)
  // genNode(children, context)
  // for (let i = 0; i < children.length; i++) {
  //   genNode(child, context)
  // }

  push(")")
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) push(",")
  }
}

function genNullable(args) {
  return args.map(arg => arg || "null")
}
function genExpression(node, context) {
  const { push } = context
  push(`${node.content}`)
}

function genText(node, context) {
  const { push } = context
  push(`"${node.content}"`)
}

function genInterpolation(node, context) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(")")
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}


function getFunctionPreamble(ast, context) {

  const { push } = context
  const VueBinging = "Vue"
  const aliasHelper = (s) => `${helperMapName[s]}: _${helperMapName[s]}`

  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`)
  }
  push("\n")
  push("return ")
}