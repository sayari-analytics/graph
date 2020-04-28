import { createElement } from 'react'
import { render } from 'react-dom'
import Stats from 'stats.js'
import { LayoutOptions } from '../../src/layout/force'
import { Layout } from '../../src/layout/force/bindings/react'
import { Node, Edge, PositionedNode } from '../../src/types'
import { RendererOptions, NodeStyle, EdgeStyle } from '../../src/renderers/pixi'
import { Renderer } from '../../src/renderers/pixi/bindings/react'


const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

/**
 * Initialize Data
 */
const COMPANY_STYLE: Partial<NodeStyle> = { fill: '#FFAF1D', stroke: '#F7CA4D', strokeWidth: 4, icon: 'business' }
const PERSON_STYLE: Partial<NodeStyle> = { fill: '#7CBBF3', stroke: '#90D7FB', strokeWidth: 4, icon: 'person' }

let nodes: Node<{}, Partial<NodeStyle>>[] = [
  { id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }, { id: 'd', label: 'D' }, { id: 'e', label: 'E' }, { id: 'f', label: 'F' }, { id: 'g', label: 'G' },
  { id: 'h', label: 'H' }, { id: 'i', label: 'I' }, { id: 'j', label: 'J' }, { id: 'k', label: 'K' }, { id: 'l', label: 'L' }, { id: 'm', label: 'M' }, { id: 'n', label: 'N' },
  { id: 'o', label: 'O' }, { id: 'p', label: 'P' }, { id: 'q', label: 'Q' },
]
  .map(({ id, label }, idx) => ({
    id,
    label,
    radius: id === 'a' ? 62 : (20 - idx) * 4,
    style: id === 'a' ? COMPANY_STYLE : PERSON_STYLE
  }))

let edges: Edge<{}, EdgeStyle>[] = [
  { id: 'ba', source: 'a', target: 'b', label: 'Related To' }, { id: 'ca', source: 'a', target: 'c', label: 'Related To' }, { id: 'da', source: 'a', target: 'd', label: 'Related To' }, { id: 'ea', source: 'a', target: 'e', label: 'Related To' },
  { id: 'fa', source: 'a', target: 'f', label: 'Related To' }, { id: 'ga', source: 'a', target: 'g', label: 'Related To' }, { id: 'ha', source: 'a', target: 'h', label: 'Related To' }, { id: 'ia', source: 'a', target: 'i', label: 'Related To' },
  { id: 'ja', source: 'b', target: 'j', label: 'Related To' }, { id: 'ka', source: 'b', target: 'k', label: 'Related To' }, { id: 'la', source: 'b', target: 'l', label: 'Related To' }, { id: 'ma', source: 'l', target: 'm', label: 'Related To' },
  { id: 'na', source: 'c', target: 'n', label: 'Related To' }, { id: 'oa', source: 'c', target: 'o', label: 'Related To' }, { id: 'pa', source: 'c', target: 'p', label: 'Related To' }, { id: 'qa', source: 'c', target: 'q', label: 'Related To' },
]


/**
 * Initialize Layout and Renderer Options
 */
const layoutOptions: Partial<LayoutOptions> = {
  nodeStrength: -500,
}

const renderOptions: Partial<RendererOptions> = {
  onNodePointerDown: (_: PIXI.interaction.InteractionEvent, { id }: PositionedNode, x: number, y: number) => {
    nodes = nodes.map((node) => (node.id === id ? { ...node, x, y } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onNodeDrag: (_: PIXI.interaction.InteractionEvent, { id }: PositionedNode, x: number, y: number) => {
    nodes = nodes.map((node) => (node.id === id ? { ...node, x, y } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onNodePointerUp: (_: PIXI.interaction.InteractionEvent, { id }: PositionedNode) => {
    nodes = nodes.map((node) => (node.id === id ? { ...node, x: undefined, y: undefined } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onNodePointerEnter: (_: PIXI.interaction.InteractionEvent, { id }: PositionedNode) => {
    nodes = nodes.map((node) => (node.id === id ? { ...node, style: { ...node.style, stroke: '#CCC' } } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onNodePointerLeave: (_: PIXI.interaction.InteractionEvent, { id }: PositionedNode) => {
    nodes = nodes.map((node) => (node.id === id ?
      { ...node, style: { ...node.style, stroke: id === 'a' ? COMPANY_STYLE.stroke : PERSON_STYLE.stroke } } :
      node
    ))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onEdgePointerEnter: (_: PIXI.interaction.InteractionEvent, { id }: Edge) => {
    edges = edges.map((edge) => (edge.id === id ? { ...edge, style: { ...edge.style, width: 3 } } : edge))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onEdgePointerLeave: (_: PIXI.interaction.InteractionEvent, { id }: Edge) => {
    edges = edges.map((edge) => (edge.id === id ? { ...edge, style: { ...edge.style, width: 1 } } : edge))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onNodeDoubleClick: (_, { id }) => {
    nodes = nodes.map((node) => (node.id === id ? {
      ...node,
      style: { ...node.style, fill: '#efefef', fillOpacity: 0.8, icon: undefined },
      subGraph: {
        nodes: [
          { id: `${node.id}a`, radius: 21, label: `${node.id.toUpperCase()}A`, type: 'company', style: { ...COMPANY_STYLE } },
          { id: `${node.id}b`, radius: 21, label: `${node.id.toUpperCase()}B`, type: 'company', style: { ...COMPANY_STYLE } },
          { id: `${node.id}c`, radius: 21, label: `${node.id.toUpperCase()}C`, type: 'company', style: { ...COMPANY_STYLE } },
        ],
        edges: []
      },
    } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
  onContainerPointerUp: () => {
    nodes = nodes.map((node, idx) => (node.subGraph ? {
      ...node,
      style: node.id === 'a' ? COMPANY_STYLE : { ...PERSON_STYLE, width: (20 - idx) * 8 },
      subGraph: undefined,
    } : node))
    // layout({ nodes, edges, options: layoutOptions })
  },
}

render(
  createElement(Layout, {
    nodes,
    edges,
    options: layoutOptions,
    children: (graph) => (
      createElement(Renderer, {
        nodes: graph.nodes,
        edges: graph.edges,
        options: renderOptions
      })
    ),
  }),
  document.querySelector('#graph')
)



// /**
//  * Initialize Layout and Renderer
//  */
// const layout = Layout(({ nodes, edges }) => renderer({ nodes, edges, options: renderOptions }))

// const renderer = Renderer({
//   container,
//   debug: { stats, logPerformance: false }
// })


// /**
//  * Layout and Render Graph
//  */
// layout({ nodes, edges, options: layoutOptions })
