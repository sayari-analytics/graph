import * as PIXI from 'pixi.js';
import { PIXIRenderer as Renderer } from '../';
import { Node, Edge } from '../../../';
export declare class ArrowSprite<N extends Node, E extends Edge> {
    static ARROW_HEIGHT: number;
    static ARROW_WIDTH: number;
    texture: PIXI.RenderTexture;
    constructor(renderer: Renderer<N, E>);
    create(): PIXI.Sprite;
    delete(): void;
}
