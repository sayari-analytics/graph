import * as PIXI from 'pixi.js'
import { PIXIRenderer as Renderer } from '.'
import { colorToNumber } from './utils'
import { Node, Edge } from '../../types'
import { ArrowRenderer } from './edgeArrow'


const movePoint = (x: number, y: number, angle: number, distance: number): [number, number] => [x + Math.cos(angle) * distance, y + Math.sin(angle) * distance]

const midPoint = (x0: number, y0: number, x1: number, y1: number): [number, number] => [(x0 + x1) / 2, (y0 + y1) / 2]

const length = (x0: number, y0: number, x1: number, y1: number) => Math.hypot(x1 - x0, y1 - y0)

const angle = (x0: number, y0: number, x1: number, y1: number) => Math.atan2(y0 - y1, x0 - x1)

const HALF_PI = Math.PI / 2
const TWO_PI = Math.PI * 2
const THREE_HALF_PI = HALF_PI * 3
const LINE_HOVER_RADIUS = 4

const DEFAULT_EDGE_WIDTH = 1
const DEFAULT_EDGE_COLOR = '#ccc'
const DEFAULT_EDGE_OPACITY = 1
const DEFAULT_LABEL_FAMILY = 'Helvetica'
const DEFAULT_LABEL_COLOR = '#222'
const DEFAULT_LABEL_SIZE = 14


export class EdgeRenderer<N extends Node, E extends Edge>{

  edge: E | undefined

  private renderer: Renderer<N, E>
  private label?: string
  private labelFamily?: string
  private labelColor?: string
  private labelSize?: number
  private width: number = 0
  private stroke: number = 0
  private strokeOpacity: number = 0
  private line = new PIXI.Graphics()
  private arrow: PIXI.Sprite
  private hoveredEdge = false
  private labelContainer: PIXI.Container = new PIXI.Container()
  private labelSprite?: PIXI.Text
  private x0: number = 0
  private y0: number = 0
  private x1: number = 0
  private y1: number = 0
  private curvePeak?: [number, number]
  private curveControlPointA?: [number, number]
  private curveControlPointB?: [number, number]
  private curve: number = 0

  constructor(renderer: Renderer<N, E>, edgesLayer: PIXI.Container) {
    this.renderer = renderer
    this.line.interactive = true
    this.line.buttonMode = true
    this.line
      .on('pointerover', this.pointerEnter)
      .on('pointerout', this.pointerLeave)
      .on('pointerdown', this.pointerDown)
      .on('pointerup', this.pointerUp)
      .on('pointerupoutside', this.pointerUp)

    this.arrow = this.renderer.arrow.createSprite()

    edgesLayer.addChild(this.line)
    edgesLayer.addChild(this.arrow)
    edgesLayer.addChild(this.labelContainer) // TODO - add labelsContainer to edgeLabelLayer
  }

  update(edge: E) {
    this.edge = edge


    /**
     * Style
     */
    this.width = this.edge.style?.width ?? DEFAULT_EDGE_WIDTH
    this.stroke = colorToNumber(edge.style?.stroke ?? DEFAULT_EDGE_COLOR)
    this.strokeOpacity = edge.style?.strokeOpacity ?? DEFAULT_EDGE_OPACITY
    this.arrow.tint = this.stroke
    this.arrow.alpha = this.strokeOpacity


    /**
     * Label
     */
    const labelFamily = edge.style?.labelFamily ?? DEFAULT_LABEL_FAMILY
    const labelColor = edge.style?.labelColor ?? DEFAULT_LABEL_COLOR
    const labelSize = edge.style?.labelSize ?? DEFAULT_LABEL_SIZE

    if (
      edge.label !== this.label ||
      labelFamily !== this.labelFamily ||
      labelColor !== this.labelColor ||
      labelSize !== this.labelSize
    ) {
      this.label = edge.label
      this.labelFamily = labelFamily
      this.labelColor = labelColor
      this.labelSize = labelSize
      this.labelContainer.removeChildren()
      this.labelSprite?.destroy()
      this.labelSprite = undefined

      if (this.label) {
        this.labelSprite = new PIXI.Text(this.label, {
          fontFamily: this.labelFamily,
          fontSize: this.labelSize * 2.5,
          fill: this.labelColor,
          lineJoin: 'round',
          stroke: '#fafafaee',
          strokeThickness: 2 * 2.5,
        })
        this.labelSprite.name = 'text'
        this.labelSprite.scale.set(0.4)
        this.labelSprite.anchor.set(0.5, 0.5)
        this.labelContainer.addChild(this.labelSprite)
      }
    }


    /**
     * Curve
     * TODO - expose edge curve in style spec
     */
    this.curve = (this.renderer.forwardEdgeIndex[this.edge.source][this.edge.target].size - 1) * 0.5
    for (const edgeId of this.renderer.forwardEdgeIndex[this.edge.source][this.edge.target]) {
      if (edgeId === this.edge.id) {
        break
      }
      this.curve--
    }

    return this
  }

  /**
   * TODO - perf boost: render cheap version of things while still animating position
   */
  render() {
    const sourceContainer = this.renderer.nodesById[this.edge!.source],
      targetContainer = this.renderer.nodesById[this.edge!.target],
      sourceRadius = sourceContainer.radius + sourceContainer.strokeWidth,
      targetRadius = targetContainer.radius + targetContainer.strokeWidth,
      theta = angle(sourceContainer.x, sourceContainer.y, targetContainer.x, targetContainer.y),
      start = movePoint(sourceContainer.x, sourceContainer.y, theta, -sourceRadius),
      end = movePoint(targetContainer.x, targetContainer.y, theta, targetRadius + ArrowRenderer.ARROW_HEIGHT),
      center = midPoint(start[0], start[1], end[0], end[1])

    if (this.curve === 0) {
      /**
       * edge start/end is source/target node's center, offset by radius and, if rendered on edge source and/or target, arrow height
       * TODO - once arrows are encorporated into the style spec, add/remove arrowHeight offset
       */
      this.x0 = start[0]
      this.y0 = start[1]
      this.x1 = end[0]
      this.y1 = end[1]

      this.line
        .clear()
        .lineStyle(this.width, this.stroke, this.strokeOpacity)
        .moveTo(this.x0, this.y0)
        .lineTo(this.x1, this.y1)
        .endFill()

      this.labelContainer.x = center[0]
      this.labelContainer.y = center[1]
      this.labelContainer.rotation = theta > HALF_PI && theta < THREE_HALF_PI ? theta - Math.PI : theta

      // TODO - don't bother rendering arrow when animating position
      const arrowPosition = movePoint(targetContainer.x, targetContainer.y, theta, targetRadius)
      this.arrow.x = arrowPosition[0]
      this.arrow.y = arrowPosition[1]
      this.arrow.rotation = theta

      // TODO - don't bother rendering hitArea when animating position
      const hoverRadius = Math.max(this.width, LINE_HOVER_RADIUS)
      const perpendicular = theta + HALF_PI
      const hitAreaVerticies: number[] = new Array(8)
      let point = movePoint(this.x0, this.y0, perpendicular, hoverRadius)
      hitAreaVerticies[0] = point[0]
      hitAreaVerticies[1] = point[1]
      point = movePoint(arrowPosition[0], arrowPosition[1], perpendicular, hoverRadius)
      hitAreaVerticies[2] = point[0]
      hitAreaVerticies[3] = point[1]
      point = movePoint(arrowPosition[0], arrowPosition[1], perpendicular, -hoverRadius)
      hitAreaVerticies[4] = point[0]
      hitAreaVerticies[5] = point[1]
      point = movePoint(this.x0, this.y0, perpendicular, -hoverRadius)
      hitAreaVerticies[6] = point[0]
      hitAreaVerticies[7] = point[1]
      this.line.hitArea = new PIXI.Polygon(hitAreaVerticies)
      // this.line.lineStyle(1, 0xff0000, 0.5).drawPolygon(this.line.hitArea as any)
    } else {
      this.curvePeak = movePoint(center[0], center[1], theta > TWO_PI || theta < 0 ? theta - HALF_PI : theta + HALF_PI, this.curve * 20)
      const thetaCurveStart = angle(sourceContainer.x, sourceContainer.y, this.curvePeak[0], this.curvePeak[1])
      const thetaCurveEnd = angle(this.curvePeak[0], this.curvePeak[1], targetContainer.x, targetContainer.y)
      const curveStart = movePoint(sourceContainer.x, sourceContainer.y, thetaCurveStart, -sourceRadius)
      const curveEnd = movePoint(targetContainer.x, targetContainer.y, thetaCurveEnd, targetRadius + ArrowRenderer.ARROW_HEIGHT)
      this.x0 = curveStart[0]
      this.y0 = curveStart[1]
      this.x1 = curveEnd[0]
      this.y1 = curveEnd[1]

      const edgeLength = length(this.x0, this.y0, this.x1, this.y1)
      this.curveControlPointA = movePoint(this.curvePeak[0], this.curvePeak[1], theta, edgeLength / 4)
      this.curveControlPointB = movePoint(this.curvePeak[0], this.curvePeak[1], theta, edgeLength / -4)

      this.line
        .clear()
        .lineStyle(this.width, this.stroke, this.strokeOpacity)
        .moveTo(this.x0, this.y0)
        .bezierCurveTo(this.x0, this.y0, this.curveControlPointA[0], this.curveControlPointA[1], this.curvePeak[0], this.curvePeak[1])
        .bezierCurveTo(this.curveControlPointB[0], this.curveControlPointB[1], this.x1, this.y1, this.x1, this.y1)
        .endFill()

      this.labelContainer.x = this.curvePeak[0]
      this.labelContainer.y = this.curvePeak[1]
      this.labelContainer.rotation = theta > HALF_PI && theta < THREE_HALF_PI ? theta - Math.PI : theta

      const arrowPosition = movePoint(targetContainer.x, targetContainer.y, thetaCurveEnd, targetRadius)
      this.arrow.x = arrowPosition[0]
      this.arrow.y = arrowPosition[1]
      this.arrow.rotation = thetaCurveEnd

      const hoverRadius = Math.max(this.width, LINE_HOVER_RADIUS)
      const hitAreaVerticies: number[] = new Array(12)
      let point = movePoint(this.x0, this.y0, thetaCurveStart + HALF_PI, hoverRadius)
      hitAreaVerticies[0] = point[0]
      hitAreaVerticies[1] = point[1]
      point = movePoint(this.curvePeak[0], this.curvePeak[1], theta + HALF_PI, hoverRadius)
      hitAreaVerticies[2] = point[0]
      hitAreaVerticies[3] = point[1]
      point = movePoint(arrowPosition[0], arrowPosition[1], thetaCurveEnd + HALF_PI, hoverRadius)
      hitAreaVerticies[4] = point[0]
      hitAreaVerticies[5] = point[1]
      point = movePoint(arrowPosition[0], arrowPosition[1], theta + HALF_PI, -hoverRadius)
      hitAreaVerticies[6] = point[0]
      hitAreaVerticies[7] = point[1]
      point = movePoint(this.curvePeak[0], this.curvePeak[1], theta + HALF_PI, -hoverRadius)
      hitAreaVerticies[8] = point[0]
      hitAreaVerticies[9] = point[1]
      point = movePoint(this.x0, this.y0, thetaCurveStart + HALF_PI, -hoverRadius)
      hitAreaVerticies[10] = point[0]
      hitAreaVerticies[11] = point[1]
      this.line.hitArea = new PIXI.Polygon(hitAreaVerticies)
      // this.line.lineStyle(1, 0xff0000, 0.5).drawPolygon(this.line.hitArea as any)
    }


    /**
     * TODO
     * - only double text resolution at high zoom, using occlusion (edge can't be occluded, but edge label can)
     * - half text resolution at low zoom
     * - though dynamically changing font size has really bad performance... maybe separate text objects should be created on initialization, and they are swapped on zoom
     */
    // if (this.viewport.scale.x > 1) {
    //   text.style.fontSize *= 2
    //   text.style.strokeThickness *= 2
    //   text.scale.set(0.5)
    // } else {
    //   text.style.fontSize /= 2
    //   text.style.strokeThickness /= 2
    //   text.scale.set(1)
    // }

    /**
     * hide label if line is too long
     * TODO
     * - truncate text, rather than hiding, or shrink size
     * - improve text resolution at high zoom, and maybe decrease/hide at low zoom
     */
    if (this.label) {
      const edgeLength = length(this.x0, this.y0, this.x1, this.y1)
      const text = this.labelContainer.getChildAt(0) as PIXI.Text
      if (text.width > edgeLength) {
        text.visible = false
      } else {
        text.visible = true
      }
    }
  }

  delete() {
    this.line.destroy()
    this.arrow.destroy()
    this.labelContainer.destroy()
    delete this.renderer.edgesById[this.edge!.id]
    this.renderer.forwardEdgeIndex[this.edge!.source][this.edge!.target].delete(this.edge!.id)
    this.renderer.reverseEdgeIndex[this.edge!.target][this.edge!.source].delete(this.edge!.id)
  }

  private pointerEnter = (event: PIXI.InteractionEvent) => {
    if (!this.hoveredEdge) {
      this.hoveredEdge = true
      this.renderer.dirty = true
      const { x, y } = this.renderer.viewport.toWorld(event.data.global)
      this.renderer.onEdgePointerEnter(event, this.edge!, x, y)
    }
  }

  private pointerLeave = (event: PIXI.InteractionEvent) => {
    if (this.hoveredEdge) {
      this.hoveredEdge = false
      this.renderer.dirty = true

      const { x, y } = this.renderer.viewport.toWorld(event.data.global)
      this.renderer.onEdgePointerLeave(event, this.edge!, x, y)
    }
  }

  private pointerDown = (event: PIXI.InteractionEvent) => {
    const { x, y } = this.renderer.viewport.toWorld(event.data.global)
    this.renderer.onEdgePointerDown(event, this.edge!, x, y)
  }

  private pointerUp = (event: PIXI.InteractionEvent) => {
    const { x, y } = this.renderer.viewport.toWorld(event.data.global)
    this.renderer.onEdgePointerUp(event, this.edge!, x, y)
  }
}
