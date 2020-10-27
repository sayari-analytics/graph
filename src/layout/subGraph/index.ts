import { Node, Edge } from '../..'


export const subgraphRadius = <E extends Edge>(node: Node<E>, nodes: Node<E>[]) => {
  let _radius = node.radius

  for (const node of nodes) {
    const newRadius = Math.hypot(node.x ?? 0, node.y ?? 0) + node.radius
    _radius = Math.max(_radius, newRadius)
  }

  return _radius
}


export const Layout = () => {
  return <N extends Node<E>, E extends Edge>(previousNodes: N[], nextNodes: N[]) => {
    let result: Node<E>[] = nextNodes.map((node) => ({ ...node })),
      collapseNode: Node<E>,
      collapseNodeX: number,
      collapseNodeY: number,
      expandNode: Node<E>,
      expandNodeX: number,
      expandNodeY: number,
      node: Node<E>,
      theta: number,
      radius: number,
      nodeX: number,
      nodeY: number

    /**
     * collapse all existing subgraphs
     */
    for (let i = previousNodes.length - 1; i >= 0; i--) {
      if (previousNodes[i].subgraph !== undefined) {
        collapseNode = result.find((node) => node.id === previousNodes[i].id) ?? previousNodes[i]
        collapseNodeX = collapseNode.x ?? 0
        collapseNodeY = collapseNode.y ?? 0
        radius = previousNodes[i].radius

        for (let j = 0; j < result.length; j++) {
          node = result[j]
          if (node.id !== collapseNode.id) {
            nodeX = node.x ?? 0
            nodeY = node.y ?? 0
            theta = Math.atan2(collapseNodeY - nodeY, collapseNodeX - nodeX)
            node.x = nodeX + (Math.cos(theta) * radius)
            node.y = nodeY + (Math.sin(theta) * radius)
          }
        }
      }
    }

    /**
     * expand all new subgraphs
     */
    for (let i = 0; i < nextNodes.length; i++) {
      if (nextNodes[i].subgraph !== undefined) {
        expandNode = result.find((node) => node.id === nextNodes[i].id) ?? nextNodes[i]
        expandNodeX = expandNode.x ?? 0
        expandNodeY = expandNode.y ?? 0
        radius = nextNodes[i].radius

        for (let j = 0; j < result.length; j++) {
          node = result[j]
          if (node.id !== expandNode.id) {
            nodeX = node.x ?? 0
            nodeY = node.y ?? 0
            theta = Math.atan2(nodeY - expandNodeY, nodeX - expandNodeX)
            node.x = nodeX + (Math.cos(theta) * radius)
            node.y = nodeY + (Math.sin(theta) * radius)
          }
        }
      }
    }

    return result
  }
}
