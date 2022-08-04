import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
describe('codegen', () => {
  it('string', () => {
    const ast = baseParse("hi")
    transform(ast)
    const { code } = generate(ast)

    // 快照（string）
    // 抓bug
    // 更新快照（主动更新）
    expect(code).toMatchSnapshot()
  })
})
