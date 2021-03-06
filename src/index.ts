export type Node = {
  id: string
  radius: number
  x?: number
  y?: number
  fx?: number
  fy?: number
  label?: string
  style?: NodeStyle
  subgraph?: {
    nodes: Node[]
    edges: Edge[]
    options?: {}
  }
}

export type Edge = {
  id: string
  source: string
  target: string
  label?: string
  style?: EdgeStyle
}


export type TextIcon = {
  type: 'textIcon'
  family: string
  text: string
  color: string
  size: number
}


export type ImageIcon = {
  type: 'imageIcon'
  url: string
  scale?: number
  offsetX?: number
  offsetY?: number
}


export type NodeStyle = {
  color?: string
  stroke?: {
    color?: string
    width?: number
  }[]
  badge?: {
    position: number
    radius?: number
    color?: string
    stroke?: string
    strokeWidth?: number
    icon?: TextIcon | ImageIcon
  }[]
  icon?: TextIcon | ImageIcon
  labelFamily?: string
  labelColor?: string
  labelSize?: number
  labelWordWrap?: number
  labelBackground?: string
}


export type EdgeStyle = {
  width?: number
  stroke?: string
  strokeOpacity?: number
  labelFamily?: string
  labelColor?: string
  labelSize?: number
  labelWordWrap?: number
  arrow?: 'forward' | 'reverse' | 'both' | 'none'
}


export type CircleAnnotation = {
  type: 'circle'
  id: string
  x: number
  y: number
  radius: number
  style: {
    color: string
    stroke: {
      color: string
      width: number
    }
  }
}


export type RectangleAnnotation = {
  type: 'rectangle'
  id: string
  x: number
  y: number
  width: number
  height: number
  style: {
    color: string
    stroke: {
      color: string
      width: number
    }
  }
}


export type Annotation = CircleAnnotation
  | RectangleAnnotation


export type Bounds = { left: number, top: number, right: number, bottom: number }


export type Dimensions = { width: number, height: number }


export type Viewport = { x: number, y: number, zoom: number }


export const getSelectionBounds = (nodes: Node[], padding: number = 0): Bounds => {
  let left = 0
  let top = 0
  let right = 0
  let bottom = 0

  for (const node of nodes) {
    const nodeLeft = (node.x ?? 0) - node.radius
    const nodeTop = (node.y ?? 0) - node.radius
    const nodeRight = (node.x ?? 0) + node.radius
    const nodeBottom = (node.y ?? 0) + node.radius
    if (nodeLeft < left) left = nodeLeft
    if (nodeTop < top) top = nodeTop
    if (nodeRight > right) right = nodeRight
    if (nodeBottom > bottom) bottom = nodeBottom
  }

  return { left: left - padding, top: top - padding, right: right + padding, bottom: bottom + padding }
}


export const mergeBounds = (a: Bounds, b: Bounds, padding: number = 0): Bounds => {
  return {
    left: Math.min(a.left, b.left) - padding,
    top: Math.min(a.top, b.top) - padding,
    right: Math.max(a.right, b.right) + padding,
    bottom: Math.max(a.bottom, b.bottom) + padding,
  }
}


export const viewportToBounds = ({ x, y, zoom }: Viewport, { width, height }: Dimensions): Bounds => {
  const xOffset = width / 2 / zoom
  const yOffset = height / 2 / zoom
  return {
    left: -(x + xOffset),
    top: -(y + yOffset),
    right: -(x - xOffset),
    bottom: -(y - yOffset),
  }
}


export const boundsToViewport = ({ left, top, right, bottom }: Bounds, { width, height }: Dimensions): Viewport => {
  const targetWidth = right - left
  const targetHeight = bottom - top
  const x = (targetWidth / 2) - right
  const y = (targetHeight / 2) - bottom

  if (targetWidth / targetHeight > width / height) {
    // fit to width
    return { x, y, zoom: width / targetWidth }
  } else {
    // fit to height
    return { x, y, zoom: height / targetHeight }
  }
}


export const boundsToDimensions = ({ left, top, right, bottom }: Bounds, zoom: number): Dimensions => {
  return {
    width: (right - left) / zoom,
    height: (bottom - top) / zoom,
  }
}


export const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value))


export const equals = <T>(a: T, b: T) => {
  if (a === b) {
    return true
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }

    for (let i = 0; i < a.length; i++) {
      if (!equals(a[i], b[i])) {
        return false
      }
    }

    return true
  } else if (typeof a === 'object' && typeof b === 'object') {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false
    }

    for (const key in a) {
      if (!equals(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  return false
}


export const connectedComponents = <N extends Node, E extends Edge>(graph: { nodes: N[], edges: E[] }): { nodes: N[], edges: E[] }[] => {
  const adjacencyList: Record<string, Record<string, E[]>> = {}
  const nodes: Record<string, N> = {}
  const visited = new Set<string>()
  const components: { nodes: Record<string, N>, edges: Record<string, E> }[] = []


  for (const edge of graph.edges) {
    if (adjacencyList[edge.source] === undefined) {
      adjacencyList[edge.source] = {}
    }
    if (adjacencyList[edge.source][edge.target] === undefined) {
      adjacencyList[edge.source][edge.target] = []
    }
    if (adjacencyList[edge.target] === undefined) {
      adjacencyList[edge.target] = {}
    }
    if (adjacencyList[edge.target][edge.source] === undefined) {
      adjacencyList[edge.target][edge.source] = []
    }

    adjacencyList[edge.source][edge.target].push(edge)
    adjacencyList[edge.target][edge.source].push(edge)
  }


  for (const node of graph.nodes) {
    nodes[node.id] = node
  }


  for (const { id } of graph.nodes) {
    if (visited.has(id)) {
      continue
    }

    visited.add(id)
    const toVisit = [id]
    const component: { nodes: Record<string, N>, edges: Record<string, E> } = { nodes: { [id]: nodes[id] }, edges: {} }

    while (toVisit.length > 0) {
      const next = adjacencyList[toVisit.pop()!]
      if (next === undefined) {
        continue
      }

      for (const [adjacentNode, edges] of Object.entries(next)) {
        for (const edge of edges) {
          component.edges[edge.id] = edge
        }
        component.nodes[adjacentNode] = nodes[adjacentNode]

        if (!visited.has(adjacentNode)) {
          toVisit.push(adjacentNode)
          visited.add(adjacentNode)
        }
      }
    }

    components.push(component)
  }


  return components.map(({ nodes, edges }) => ({
    nodes: Object.values(nodes),
    edges: Object.values(edges),
  }))
}


export function* bfs<N extends Node, E extends Edge>(predicate: (node: N) => boolean, graph: { nodes: N[], edges: E[] }): Generator<N, void, void> {
  const adjacencyList: Record<string, string[]> = {}
  const nodes: Record<string, N> = {}
  const visited = new Set<string>()
  const queue = [graph.nodes[0].id]


  for (const edge of graph.edges) {
    if (adjacencyList[edge.source] === undefined) {
      adjacencyList[edge.source] = []
    }
    if (adjacencyList[edge.target] === undefined) {
      adjacencyList[edge.target] = []
    }

    adjacencyList[edge.source].push(edge.target)
    adjacencyList[edge.target].push(edge.source)
  }


  for (const node of graph.nodes) {
    nodes[node.id] = node
  }


  while (queue.length > 0) {
    const node = queue.shift()!

    if (visited.has(node)) {
      continue
    }

    visited.add(node)

    if (predicate(nodes[node])) {
      yield nodes[node]
    }

    for (const adjacentNode of adjacencyList[node]) {
      if (!visited.has(adjacentNode)) {
        queue.push(adjacentNode)
      }
    }
  }
}

export const distance = (x0: number, y0: number, x1: number, y1: number) => Math.hypot(x1 - x0, y1 - y0)