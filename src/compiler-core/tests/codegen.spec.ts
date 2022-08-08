import { NodeTypes } from '../src/ast';
import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
import { transformExpression } from '../src/transforms/transformExpression';
import { transformElement } from '../src/transforms/transformElement';
describe('codegen', () => {
  it('string', () => {
    const ast = baseParse("hi")
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse("{{message}}")

    transform(ast, {
      nodeTransforms: [transformExpression]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it.only('element', () => {
    const ast = baseParse("<div></div>")

    transform(ast, {
      nodeTransforms: [transformElement]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
