"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = exports.InternalRenderer = exports.RENDERER_OPTIONS = void 0;
var PIXI = __importStar(require("pixi.js"));
var unsafe_eval_1 = require("@pixi/unsafe-eval");
var utils_1 = require("../../utils");
var node_1 = require("./node");
var edge_1 = require("./edge");
var drag_1 = require("./interaction/drag");
var decelerate_1 = require("./interaction/decelerate");
var zoom_1 = require("./interaction/zoom");
var arrowSprite_1 = require("./sprites/arrowSprite");
var circleSprite_1 = require("./sprites/circleSprite");
var ImageSprite_1 = require("./sprites/ImageSprite");
var FontIconSprite_1 = require("./sprites/FontIconSprite");
var utils_2 = require("./utils");
unsafe_eval_1.install(PIXI);
exports.RENDERER_OPTIONS = {
    width: 800, height: 600, x: 0, y: 0, zoom: 1, minZoom: 0.1, maxZoom: 2.5,
    animate: true,
    nodesEqual: function () { return false; }, edgesEqual: function () { return false; },
};
var POSITION_ANIMATION_DURATION = 800;
PIXI.utils.skipHello();
var InternalRenderer = /** @class */ (function () {
    function InternalRenderer(options) {
        var _this = this;
        var _a;
        this.clickedContainer = false;
        this.dirty = false;
        this.viewportDirty = false;
        this.previousTime = performance.now();
        this.animationDuration = 0;
        this.animationPercent = 0;
        this.edgesLayer = new PIXI.Container();
        this.nodesLayer = new PIXI.Container();
        this.labelsLayer = new PIXI.Container();
        this.frontNodeLayer = new PIXI.Container();
        this.frontLabelLayer = new PIXI.Container();
        this.edgesGraphic = new PIXI.Graphics();
        this.nodes = [];
        this.edges = [];
        this.nodesById = {};
        this.edgesById = {};
        this.edgeIndex = {};
        this.width = exports.RENDERER_OPTIONS.width;
        this.height = exports.RENDERER_OPTIONS.height;
        this.zoom = exports.RENDERER_OPTIONS.zoom;
        this.minZoom = exports.RENDERER_OPTIONS.minZoom;
        this.maxZoom = exports.RENDERER_OPTIONS.maxZoom;
        this.x = exports.RENDERER_OPTIONS.x;
        this.y = exports.RENDERER_OPTIONS.y;
        this.animate = exports.RENDERER_OPTIONS.animate;
        this.root = new PIXI.Container();
        this._update = function (_a) {
            var e_1, _b, e_2, _c, e_3, _d;
            var _e, _f, _g, _h;
            var nodes = _a.nodes, edges = _a.edges, _j = _a.options, _k = _j === void 0 ? exports.RENDERER_OPTIONS : _j, _l = _k.width, width = _l === void 0 ? exports.RENDERER_OPTIONS.width : _l, _m = _k.height, height = _m === void 0 ? exports.RENDERER_OPTIONS.height : _m, _o = _k.x, x = _o === void 0 ? exports.RENDERER_OPTIONS.x : _o, _p = _k.y, y = _p === void 0 ? exports.RENDERER_OPTIONS.y : _p, _q = _k.zoom, zoom = _q === void 0 ? exports.RENDERER_OPTIONS.zoom : _q, _r = _k.minZoom, minZoom = _r === void 0 ? exports.RENDERER_OPTIONS.minZoom : _r, _s = _k.maxZoom, maxZoom = _s === void 0 ? exports.RENDERER_OPTIONS.maxZoom : _s, _t = _k.animate, animate = _t === void 0 ? exports.RENDERER_OPTIONS.animate : _t, _u = _k.nodesEqual, nodesEqual = _u === void 0 ? exports.RENDERER_OPTIONS.nodesEqual : _u, _v = _k.edgesEqual, edgesEqual = _v === void 0 ? exports.RENDERER_OPTIONS.edgesEqual : _v, onNodePointerEnter = _k.onNodePointerEnter, onNodePointerDown = _k.onNodePointerDown, onNodeDrag = _k.onNodeDrag, onNodePointerUp = _k.onNodePointerUp, onNodePointerLeave = _k.onNodePointerLeave, onNodeDoubleClick = _k.onNodeDoubleClick, onEdgePointerEnter = _k.onEdgePointerEnter, onEdgePointerDown = _k.onEdgePointerDown, onEdgePointerUp = _k.onEdgePointerUp, onEdgePointerLeave = _k.onEdgePointerLeave, onContainerPointerEnter = _k.onContainerPointerEnter, onContainerPointerDown = _k.onContainerPointerDown, onContainerDrag = _k.onContainerDrag, onContainerPointerMove = _k.onContainerPointerMove, onContainerPointerUp = _k.onContainerPointerUp, onContainerPointerLeave = _k.onContainerPointerLeave, onWheel = _k.onWheel;
            _this.onContainerPointerEnter = onContainerPointerEnter;
            _this.onContainerPointerDown = onContainerPointerDown;
            _this.onContainerDrag = onContainerDrag;
            _this.onContainerPointerMove = onContainerPointerMove;
            _this.onContainerPointerUp = onContainerPointerUp;
            _this.onContainerPointerLeave = onContainerPointerLeave;
            _this.onNodePointerEnter = onNodePointerEnter;
            _this.onNodePointerDown = onNodePointerDown;
            _this.onNodeDrag = onNodeDrag;
            _this.onNodePointerUp = onNodePointerUp;
            _this.onNodePointerLeave = onNodePointerLeave;
            _this.onNodeDoubleClick = onNodeDoubleClick;
            _this.onEdgePointerEnter = onEdgePointerEnter;
            _this.onEdgePointerDown = onEdgePointerDown;
            _this.onEdgePointerUp = onEdgePointerUp;
            _this.onEdgePointerLeave = onEdgePointerLeave;
            _this.onWheel = onWheel;
            _this.zoomInteraction.minZoom = minZoom;
            _this.zoomInteraction.maxZoom = maxZoom;
            _this.animate = animate;
            if (width !== _this.width || height !== _this.height) {
                _this.width = width;
                _this.height = height;
                _this.root.pivot.x = _this.width / zoom / -2;
                _this.root.pivot.y = _this.height / zoom / -2;
                _this.app.renderer.resize(_this.width, _this.height);
                _this.viewportDirty = true;
            }
            if (x !== _this.x) {
                _this.x = _this.root.x = x;
                _this.viewportDirty = true;
            }
            if (y !== _this.y) {
                _this.y = _this.root.y = y;
                _this.viewportDirty = true;
            }
            if (zoom !== _this.zoom) {
                _this.zoom = zoom;
                _this.root.pivot.x = (_this.width / zoom) / -2;
                _this.root.pivot.y = (_this.height / zoom) / -2;
                _this.root.scale.set(zoom); // TODO - interpolate zoom
                _this.viewportDirty = true;
            }
            var edgesAreEqual = edgesEqual(_this.edges, edges);
            var nodesAreEqual = nodesEqual(_this.nodes, nodes);
            /**
             * Build edge indices
             */
            if (!edgesAreEqual) {
                try {
                    for (var edges_1 = __values(edges), edges_1_1 = edges_1.next(); !edges_1_1.done; edges_1_1 = edges_1.next()) {
                        var edge = edges_1_1.value;
                        if (_this.edgeIndex[edge.source] === undefined) {
                            _this.edgeIndex[edge.source] = {};
                        }
                        if (_this.edgeIndex[edge.target] === undefined) {
                            _this.edgeIndex[edge.target] = {};
                        }
                        if (_this.edgeIndex[edge.source][edge.target] === undefined) {
                            _this.edgeIndex[edge.source][edge.target] = new Set();
                        }
                        if (_this.edgeIndex[edge.target][edge.source] === undefined) {
                            _this.edgeIndex[edge.target][edge.source] = new Set();
                        }
                        _this.edgeIndex[edge.source][edge.target].add(edge.id);
                        _this.edgeIndex[edge.target][edge.source].add(edge.id);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (edges_1_1 && !edges_1_1.done && (_b = edges_1.return)) _b.call(edges_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            /**
             * Ndge enter/update/exit
             */
            if (!nodesAreEqual) {
                _this.nodes = nodes;
                var nodesById = {};
                try {
                    for (var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                        var node = nodes_1_1.value;
                        if (_this.nodesById[node.id] === undefined) {
                            // node enter
                            var adjacentNode = void 0;
                            if (_this.edgeIndex[node.id]) {
                                // nodes w edges from existing positioned nodes enter from one of those nodes
                                adjacentNode = Object.keys(_this.edgeIndex[node.id]).find(function (adjacentNodeId) {
                                    var _a, _b;
                                    return (((_a = _this.nodesById[adjacentNodeId]) === null || _a === void 0 ? void 0 : _a.node.x) !== undefined && ((_b = _this.nodesById[adjacentNodeId]) === null || _b === void 0 ? void 0 : _b.node.y) !== undefined);
                                });
                            }
                            nodesById[node.id] = new node_1.NodeRenderer(_this, node, (_f = (_e = _this.nodesById[adjacentNode !== null && adjacentNode !== void 0 ? adjacentNode : '']) === null || _e === void 0 ? void 0 : _e.x) !== null && _f !== void 0 ? _f : 0, (_h = (_g = _this.nodesById[adjacentNode !== null && adjacentNode !== void 0 ? adjacentNode : '']) === null || _g === void 0 ? void 0 : _g.y) !== null && _h !== void 0 ? _h : 0, node.radius);
                            /**
                             * alternatively, don't animate entering nodes
                             */
                            // nodesById[node.id] = new NodeRenderer(this, node, this.nodesById[adjacentNode]?.x ?? node.x ?? 0, this.nodesById[adjacentNode]?.y ?? node.y ?? 0, node.radius)
                        }
                        else {
                            nodesById[node.id] = _this.nodesById[node.id].update(node);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (nodes_1_1 && !nodes_1_1.done && (_c = nodes_1.return)) _c.call(nodes_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                for (var nodeId in _this.nodesById) {
                    if (nodesById[nodeId] === undefined) {
                        // node exit
                        _this.nodesById[nodeId].delete();
                    }
                }
                _this.animationDuration = 0;
                _this.nodesById = nodesById;
                _this.dirty = true;
            }
            /**
             * Edge enter/update/exit
             */
            if (!edgesAreEqual) {
                _this.edges = edges;
                var edgesById = {};
                try {
                    for (var edges_2 = __values(edges), edges_2_1 = edges_2.next(); !edges_2_1.done; edges_2_1 = edges_2.next()) {
                        var edge = edges_2_1.value;
                        var id = edge.id;
                        if (_this.edgesById[id] === undefined) {
                            // edge enter
                            edgesById[id] = new edge_1.EdgeRenderer(_this, edge);
                        }
                        else {
                            // edge update
                            edgesById[id] = _this.edgesById[id].update(edge);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (edges_2_1 && !edges_2_1.done && (_d = edges_2.return)) _d.call(edges_2);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                for (var edgeId in _this.edgesById) {
                    if (edgesById[edgeId] === undefined) {
                        // edge exit
                        _this.edgesById[edgeId].delete();
                    }
                }
                _this.edgesById = edgesById;
                _this.dirty = true;
            }
            return _this;
        };
        this._debugUpdate = function (graph) {
            performance.mark('update');
            _this._update(graph);
            performance.measure('update', 'update');
        };
        this.render = function (time) {
            var elapsedTime = time - _this.previousTime;
            _this.animationDuration += Math.min(20, Math.max(0, elapsedTime)); // clamp to 0 <= x <= 20 to smooth animations
            // this.animationDuration += elapsedTime
            _this.animationPercent = _this.animate ?
                Math.min(_this.animationDuration / POSITION_ANIMATION_DURATION, 1) :
                1;
            _this.previousTime = time;
            _this.decelerateInteraction.update(elapsedTime);
            if (_this.dirty) {
                for (var nodeId in _this.nodesById) {
                    _this.nodesById[nodeId].render();
                }
                _this.edgesGraphic.clear();
                for (var edgeId in _this.edgesById) {
                    _this.edgesById[edgeId].render();
                }
                _this.app.render();
                _this.dirty = _this.animationPercent < 1;
            }
            else if (_this.viewportDirty) {
                _this.app.render();
                _this.viewportDirty = false;
            }
            if (_this.dataUrl) {
                _this.dataUrl(_this.app.renderer.view.toDataURL('image/png', 1));
                _this.dataUrl = undefined;
            }
        };
        this._debugFirstRender = true;
        this.debugRender = function (time) {
            var e_4, _a;
            var _b, _c, _d;
            var elapsedTime = time - _this.previousTime;
            _this.animationDuration += Math.min(20, Math.max(0, elapsedTime));
            // this.animationDuration += elapsedTime
            _this.animationPercent = _this.animate ?
                Math.min(_this.animationDuration / POSITION_ANIMATION_DURATION, 1) :
                1;
            _this.previousTime = time;
            _this.decelerateInteraction.update(elapsedTime);
            (_c = (_b = _this.debug) === null || _b === void 0 ? void 0 : _b.stats) === null || _c === void 0 ? void 0 : _c.update();
            if (!_this._debugFirstRender) {
                performance.measure('external', 'external');
            }
            else {
                _this._debugFirstRender = false;
            }
            if (_this.dirty) {
                performance.mark('render');
                for (var nodeId in _this.nodesById) {
                    _this.nodesById[nodeId].render();
                }
                _this.edgesGraphic.clear();
                for (var edgeId in _this.edgesById) {
                    _this.edgesById[edgeId].render();
                }
                performance.measure('render', 'render');
                performance.mark('draw');
                _this.app.render();
                performance.measure('draw', 'draw');
            }
            else if (_this.viewportDirty) {
                performance.mark('draw');
                _this.app.render();
                performance.measure('draw', 'draw');
            }
            if (((_d = _this.debug) === null || _d === void 0 ? void 0 : _d.logPerformance) && (_this.dirty || _this.viewportDirty)) {
                var external_1 = 0;
                var update = 0;
                var render = 0;
                var draw = 0;
                var total = 0;
                try {
                    for (var _e = __values(performance.getEntriesByType('measure')), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var measurement = _f.value;
                        if (measurement.name === 'update') {
                            update = measurement.duration;
                            total += measurement.duration;
                        }
                        else if (measurement.name === 'render') {
                            render = measurement.duration;
                            total += measurement.duration;
                        }
                        else if (measurement.name === 'draw') {
                            draw = measurement.duration;
                            total += measurement.duration;
                        }
                        else if (measurement.name === 'external') {
                            external_1 = measurement.duration;
                            total += measurement.duration;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // green: 50+ frames/sec, pink: 30 frames/sec, red: 20 frames/sec
                console.log("%c" + total.toFixed(1) + "ms%c (update: %c" + update.toFixed(1) + "%c, render: %c" + render.toFixed(1) + "%c, draw: %c" + draw.toFixed(1) + "%c, external: %c" + external_1.toFixed(1) + "%c)", "color: " + (total <= 20 ? '#6c6' : total <= 33 ? '#f88' : total <= 50 ? '#e22' : '#a00'), 'color: #666', "color: " + (update <= 5 ? '#6c6' : update <= 10 ? '#f88' : update <= 20 ? '#e22' : '#a00'), 'color: #666', "color: " + (render <= 5 ? '#6c6' : render <= 10 ? '#f88' : render <= 20 ? '#e22' : '#a00'), 'color: #666', "color: " + (draw <= 5 ? '#6c6' : draw <= 10 ? '#f88' : draw <= 20 ? '#e22' : '#a00'), 'color: #666', "color: " + (external_1 <= 5 ? '#6c6' : external_1 <= 10 ? '#f88' : external_1 <= 20 ? '#e22' : '#a00'), 'color: #666');
            }
            _this.dirty = _this.animationPercent < 1;
            _this.viewportDirty = false;
            performance.clearMarks();
            performance.clearMeasures();
            performance.mark('external');
        };
        this.delete = function () {
            _this.cancelAnimationLoop();
            _this.app.destroy(true, { children: true, texture: true, baseTexture: true });
            _this.circle.delete();
            _this.arrow.delete();
            _this.image.delete();
            _this.fontIcon.delete();
        };
        this.base64 = function () {
            return new Promise(function (resolve) { return _this.dataUrl = resolve; });
        };
        if (!(options.container instanceof HTMLDivElement)) {
            throw new Error('container must be an instance of HTMLDivElement');
        }
        var view = document.createElement('canvas');
        options.container.appendChild(view);
        options.container.style.position = 'relative';
        this.app = new PIXI.Application({
            view: view,
            width: this.width,
            height: this.height,
            resolution: 2,
            antialias: true,
            autoDensity: true,
            autoStart: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: (_a = options.preserveDrawingBuffer) !== null && _a !== void 0 ? _a : false,
            transparent: options.backgroundColor === undefined,
            backgroundColor: options.backgroundColor === undefined ? undefined : utils_2.colorToNumber(options.backgroundColor),
        });
        this.labelsLayer.interactiveChildren = false;
        this.nodesLayer.sortableChildren = true; // TODO - perf test
        this.root.pivot.x = this.width / this.zoom / -2;
        this.root.pivot.y = this.height / this.zoom / -2;
        this.app.stage.addChild(this.root);
        this.root.addChild(this.edgesGraphic);
        this.root.addChild(this.edgesLayer);
        this.root.addChild(this.nodesLayer);
        this.root.addChild(this.labelsLayer);
        this.root.addChild(this.frontNodeLayer);
        this.root.addChild(this.frontLabelLayer);
        this.zoomInteraction = new zoom_1.Zoom(this, function (e, x, y, zoom) { var _a; return (_a = _this.onWheel) === null || _a === void 0 ? void 0 : _a.call(_this, e, x, y, zoom); });
        this.dragInteraction = new drag_1.Drag(this, function (e, x, y) { var _a; return (_a = _this.onContainerDrag) === null || _a === void 0 ? void 0 : _a.call(_this, e, x, y); });
        this.decelerateInteraction = new decelerate_1.Decelerate(this, function (x, y) { var _a; return (_a = _this.onContainerDrag) === null || _a === void 0 ? void 0 : _a.call(_this, undefined, x, y); });
        var pointerEnter = function (event) {
            var _a;
            var _b = _this.root.toLocal(event.data.global), x = _b.x, y = _b.y;
            (_a = _this.onContainerPointerEnter) === null || _a === void 0 ? void 0 : _a.call(_this, event, x, y);
        };
        var pointerDown = function (event) {
            var _a;
            _this.dragInteraction.down(event);
            _this.decelerateInteraction.down();
            if (_this.hoveredNode === undefined && _this.clickedNode === undefined && _this.hoveredEdge === undefined && _this.clickedEdge === undefined) {
                _this.clickedContainer = true;
                var _b = _this.root.toLocal(event.data.global), x = _b.x, y = _b.y;
                (_a = _this.onContainerPointerDown) === null || _a === void 0 ? void 0 : _a.call(_this, event, x, y);
            }
        };
        var pointerMove = function (event) {
            _this.dragInteraction.move(event);
            _this.decelerateInteraction.move();
            if (_this.onContainerPointerMove) {
                var _a = _this.root.toLocal(event.data.global), x = _a.x, y = _a.y;
                _this.onContainerPointerMove(event, x, y);
            }
        };
        var pointerUp = function (event) {
            var _a;
            _this.dragInteraction.up();
            _this.decelerateInteraction.up();
            if (_this.clickedContainer) {
                _this.clickedContainer = false;
                var _b = _this.root.toLocal(event.data.global), x = _b.x, y = _b.y;
                (_a = _this.onContainerPointerUp) === null || _a === void 0 ? void 0 : _a.call(_this, event, x, y);
            }
        };
        var pointerLeave = function (event) {
            var _a;
            var _b = _this.root.toLocal(event.data.global), x = _b.x, y = _b.y;
            (_a = _this.onContainerPointerLeave) === null || _a === void 0 ? void 0 : _a.call(_this, event, x, y);
        };
        this.app.renderer.plugins.interaction.on('pointerenter', pointerEnter);
        this.app.renderer.plugins.interaction.on('pointerdown', pointerDown);
        this.app.renderer.plugins.interaction.on('pointermove', pointerMove);
        this.app.renderer.plugins.interaction.on('pointerup', pointerUp);
        this.app.renderer.plugins.interaction.on('pointerupoutside', pointerUp);
        this.app.renderer.plugins.interaction.on('pointercancel', pointerUp);
        this.app.renderer.plugins.interaction.on('pointerout', pointerUp);
        this.app.renderer.plugins.interaction.on('pointerleave', pointerLeave);
        this.app.view.addEventListener('wheel', this.zoomInteraction.wheel);
        this.arrow = new arrowSprite_1.ArrowSprite(this);
        this.circle = new circleSprite_1.CircleSprite(this);
        this.image = new ImageSprite_1.ImageSprite();
        this.fontIcon = new FontIconSprite_1.FontIconSprite();
        this.debug = options.debug;
        if (this.debug) {
            this.cancelAnimationLoop = utils_1.animationFrameLoop(this.debugRender);
            this.update = this._debugUpdate;
        }
        else {
            this.cancelAnimationLoop = utils_1.animationFrameLoop(this.render);
            this.update = this._update;
        }
    }
    return InternalRenderer;
}());
exports.InternalRenderer = InternalRenderer;
exports.Renderer = function (options) {
    var pixiRenderer = new InternalRenderer(options);
    var render = function (graph) {
        pixiRenderer.update(graph);
    };
    render.delete = pixiRenderer.delete;
    render.base64 = pixiRenderer.base64;
    return render;
};
//# sourceMappingURL=index.js.map