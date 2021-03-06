import { NodeTypes } from "./ast"

const enum TagType {
  Start,
  End
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes = [] as any[]

  let node
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterpolation(context)
  } else if (s[0] == "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
  }
  if (!node) {
    node = parseText(context)
  }

  nodes.push(node)
  return nodes
}

function parseInterpolation(context) {

  // {{message}}

  const openDelimiter = "{{"
  const closeDelimiter = "}}"
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  const rawContent = parseTextData(context, rawContentLength)

  const content = rawContent.trim()

  advanceBy(context, closeDelimiter.length)



  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function createRoot(children) {
  return {
    children
  }
}

function createParserContext(content) {
  return {
    source: content
  }
}


function advanceBy(context, length) {

  context.source = context.source.slice(length)

}

function parseElement(context: any) {
  const element = parseTag(context, TagType.Start)
  parseTag(context, TagType.End)
  // console.log("element", context.source);

  return element
}
function parseTag(context: any, type: TagType) {
  // implement
  // 解析tag
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  // console.log("match", match);

  const tag = match[1]

  // 删除处理完成的代码

  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseText(context: any): any {
  // 获取当前的内容。

  const content = parseTextData(context, context.source.length)


  return {
    type: NodeTypes.TEXT,
    content
  }
}


function parseTextData(context, length) {
  const content = context.source.slice(0, length)
  // 推进
  advanceBy(context, length)

  return content
}
