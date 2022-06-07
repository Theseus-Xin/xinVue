import { camelize, toHandlerKey } from "../shared"

export function emit(instance, event, ...args) {
  // instanceof.props
  const { props } = instance

  // TPP
  // 先写一个特定行为 => 重构成通用的行为
  // add -> Add

  const handlerName = toHandlerKey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}