export function shouldUpdateComponent(prevNode, nextNode) {
  const { props: prevProps } = prevNode
  const { props: nextProps } = prevNode

  for (const key in nextProps) {
    if (Object.prototype.hasOwnProperty.call(nextProps, key)) {
      if (nextProps[key] !== prevNode[key]) return true
    }
  }
  return false
}