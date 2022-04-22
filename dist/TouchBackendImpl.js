function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { invariant } from "@react-dnd/invariant";
import { ListenerType } from "./interfaces.js";
import { OptionsReader } from "./OptionsReader.js";
import { distance, inAngleRanges } from "./utils/math.js";
import { getEventClientOffset, getNodeClientOffset } from "./utils/offsets.js";
import { eventShouldEndDrag, eventShouldStartDrag, isTouchEvent } from "./utils/predicates.js";
import { supportsPassive } from "./utils/supportsPassive.js";
var _obj;
var eventNames = (_obj = {}, _defineProperty(_obj, ListenerType.mouse, {
    start: "mousedown",
    move: "mousemove",
    end: "mouseup",
    contextmenu: "contextmenu"
}), _defineProperty(_obj, ListenerType.touch, {
    start: "touchstart",
    move: "touchmove",
    end: "touchend"
}), _defineProperty(_obj, ListenerType.keyboard, {
    keydown: "keydown"
}), _obj);
export var TouchBackendImpl = /*#__PURE__*/ function() {
    "use strict";
    function TouchBackendImpl(manager, context, options) {
        var _this = this;
        _classCallCheck(this, TouchBackendImpl);
        this.getSourceClientOffset = function(sourceId) {
            var element = _this.sourceNodes.get(sourceId);
            return element && getNodeClientOffset(element);
        };
        this.handleTopMoveStartCapture = function(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }
            _this.moveStartSourceIds = [];
        };
        this.handleMoveStart = function(sourceId) {
            // Just because we received an event doesn't necessarily mean we need to collect drag sources.
            // We only collect start collecting drag sources on touch and left mouse events.
            if (Array.isArray(_this.moveStartSourceIds)) {
                _this.moveStartSourceIds.unshift(sourceId);
            }
        };
        this.handleTopMoveStart = function(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }
            // Don't prematurely preventDefault() here since it might:
            // 1. Mess up scrolling
            // 2. Mess up long tap (which brings up context menu)
            // 3. If there's an anchor link as a child, tap won't be triggered on link
            var clientOffset = getEventClientOffset(e);
            if (clientOffset) {
                if (isTouchEvent(e)) {
                    _this.lastTargetTouchFallback = e.targetTouches[0];
                }
                _this._mouseClientOffset = clientOffset;
            }
            _this.waitingForDelay = false;
        };
        this.handleTopMoveStartDelay = function(e) {
            if (!eventShouldStartDrag(e)) {
                return;
            }
            var delay = e.type === eventNames.touch.start ? _this.options.delayTouchStart : _this.options.delayMouseStart;
            _this.timeout = setTimeout(_this.handleTopMoveStart.bind(_this, e), delay);
            _this.waitingForDelay = true;
        };
        this.handleTopMoveCapture = function() {
            _this.dragOverTargetIds = [];
        };
        this.handleMove = function(_evt, targetId) {
            if (_this.dragOverTargetIds) {
                _this.dragOverTargetIds.unshift(targetId);
            }
        };
        this.handleTopMove = function(e1) {
            var _this1 = _this;
            if (_this.timeout) {
                clearTimeout(_this.timeout);
            }
            if (!_this.document || _this.waitingForDelay) {
                return;
            }
            var moveStartSourceIds = _this.moveStartSourceIds, dragOverTargetIds = _this.dragOverTargetIds;
            var enableHoverOutsideTarget = _this.options.enableHoverOutsideTarget;
            var clientOffset = getEventClientOffset(e1, _this.lastTargetTouchFallback);
            if (!clientOffset) {
                return;
            }
            // If the touch move started as a scroll, or is is between the scroll angles
            if (_this._isScrolling || !_this.monitor.isDragging() && inAngleRanges(_this._mouseClientOffset.x || 0, _this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y, _this.options.scrollAngleRanges)) {
                _this._isScrolling = true;
                return;
            }
            // If we're not dragging and we've moved a little, that counts as a drag start
            if (!_this.monitor.isDragging() && // eslint-disable-next-line no-prototype-builtins
            _this._mouseClientOffset.hasOwnProperty("x") && moveStartSourceIds && distance(_this._mouseClientOffset.x || 0, _this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y) > (_this.options.touchSlop ? _this.options.touchSlop : 0)) {
                _this.moveStartSourceIds = undefined;
                _this.actions.beginDrag(moveStartSourceIds, {
                    clientOffset: _this._mouseClientOffset,
                    getSourceClientOffset: _this.getSourceClientOffset,
                    publishSource: false
                });
            }
            if (!_this.monitor.isDragging()) {
                return;
            }
            var sourceNode = _this.sourceNodes.get(_this.monitor.getSourceId());
            _this.installSourceNodeRemovalObserver(sourceNode);
            _this.actions.publishDragSource();
            if (e1.cancelable) e1.preventDefault();
            // Get the node elements of the hovered DropTargets
            var dragOverTargetNodes = (dragOverTargetIds || []).map(function(key) {
                return _this1.targetNodes.get(key);
            }).filter(function(e) {
                return !!e;
            });
            // Get the a ordered list of nodes that are touched by
            var elementsAtPoint = _this.options.getDropTargetElementsAtPoint ? _this.options.getDropTargetElementsAtPoint(clientOffset.x, clientOffset.y, dragOverTargetNodes) : _this.document.elementsFromPoint(clientOffset.x, clientOffset.y);
            // Extend list with parents that are not receiving elementsFromPoint events (size 0 elements and svg groups)
            var elementsAtPointExtended = [];
            for(var nodeId in elementsAtPoint){
                // eslint-disable-next-line no-prototype-builtins
                if (!elementsAtPoint.hasOwnProperty(nodeId)) {
                    continue;
                }
                var currentNode = elementsAtPoint[nodeId];
                if (currentNode != null) {
                    elementsAtPointExtended.push(currentNode);
                }
                while(currentNode){
                    currentNode = currentNode.parentElement;
                    if (currentNode && elementsAtPointExtended.indexOf(currentNode) === -1) {
                        elementsAtPointExtended.push(currentNode);
                    }
                }
            }
            var orderedDragOverTargetIds = elementsAtPointExtended// Filter off nodes that arent a hovered DropTargets nodes
            .filter(function(node) {
                return dragOverTargetNodes.indexOf(node) > -1;
            })// Map back the nodes elements to targetIds
            .map(function(node) {
                return _this1._getDropTargetId(node);
            })// Filter off possible null rows
            .filter(function(node) {
                return !!node;
            }).filter(function(id, index, ids) {
                return ids.indexOf(id) === index;
            });
            // Invoke hover for drop targets when source node is still over and pointer is outside
            if (enableHoverOutsideTarget) {
                for(var targetId in _this.targetNodes){
                    var targetNode = _this.targetNodes.get(targetId);
                    if (sourceNode && targetNode && targetNode.contains(sourceNode) && orderedDragOverTargetIds.indexOf(targetId) === -1) {
                        orderedDragOverTargetIds.unshift(targetId);
                        break;
                    }
                }
            }
            // Reverse order because dnd-core reverse it before calling the DropTarget drop methods
            orderedDragOverTargetIds.reverse();
            _this.actions.hover(orderedDragOverTargetIds, {
                clientOffset: clientOffset
            });
        };
        /**
   *
   * visible for testing
   */ this._getDropTargetId = function(node) {
            var keys = _this.targetNodes.keys();
            var next = keys.next();
            while(next.done === false){
                var targetId = next.value;
                if (node === _this.targetNodes.get(targetId)) {
                    return targetId;
                } else {
                    next = keys.next();
                }
            }
            return undefined;
        };
        this.handleTopMoveEndCapture = function(e) {
            _this._isScrolling = false;
            _this.lastTargetTouchFallback = undefined;
            if (!eventShouldEndDrag(e)) {
                return;
            }
            if (!_this.monitor.isDragging() || _this.monitor.didDrop()) {
                _this.moveStartSourceIds = undefined;
                return;
            }
            if (e.cancelable) e.preventDefault();
            _this._mouseClientOffset = {};
            _this.uninstallSourceNodeRemovalObserver();
            _this.actions.drop();
            _this.actions.endDrag();
        };
        this.handleCancelOnEscape = function(e) {
            if (e.key === "Escape" && _this.monitor.isDragging()) {
                _this._mouseClientOffset = {};
                _this.uninstallSourceNodeRemovalObserver();
                _this.actions.endDrag();
            }
        };
        this.options = new OptionsReader(options, context);
        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.sourceNodes = new Map();
        this.sourcePreviewNodes = new Map();
        this.sourcePreviewNodeOptions = new Map();
        this.targetNodes = new Map();
        this.listenerTypes = [];
        this._mouseClientOffset = {};
        this._isScrolling = false;
        if (this.options.enableMouseEvents) {
            this.listenerTypes.push(ListenerType.mouse);
        }
        if (this.options.enableTouchEvents) {
            this.listenerTypes.push(ListenerType.touch);
        }
        if (this.options.enableKeyboardEvents) {
            this.listenerTypes.push(ListenerType.keyboard);
        }
    }
    var _proto = TouchBackendImpl.prototype;
    /**
   * Generate profiling statistics for the HTML5Backend.
   */ _proto.profile = function profile() {
        var ref;
        return {
            sourceNodes: this.sourceNodes.size,
            sourcePreviewNodes: this.sourcePreviewNodes.size,
            sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
            targetNodes: this.targetNodes.size,
            dragOverTargetIds: ((ref = this.dragOverTargetIds) === null || ref === void 0 ? void 0 : ref.length) || 0
        };
    };
    _proto.setup = function setup() {
        var root = this.options.rootElement;
        if (!root) {
            return;
        }
        invariant(!TouchBackendImpl.isSetUp, "Cannot have two Touch backends at the same time.");
        TouchBackendImpl.isSetUp = true;
        this.addEventListener(root, "start", this.getTopMoveStartHandler());
        this.addEventListener(root, "start", this.handleTopMoveStartCapture, true);
        this.addEventListener(root, "move", this.handleTopMove);
        this.addEventListener(root, "move", this.handleTopMoveCapture, true);
        this.addEventListener(root, "end", this.handleTopMoveEndCapture, true);
        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
            this.addEventListener(root, "contextmenu", this.handleTopMoveEndCapture);
        }
        if (this.options.enableKeyboardEvents) {
            this.addEventListener(root, "keydown", this.handleCancelOnEscape, true);
        }
    };
    _proto.teardown = function teardown() {
        var root = this.options.rootElement;
        if (!root) {
            return;
        }
        TouchBackendImpl.isSetUp = false;
        this._mouseClientOffset = {};
        this.removeEventListener(root, "start", this.handleTopMoveStartCapture, true);
        this.removeEventListener(root, "start", this.handleTopMoveStart);
        this.removeEventListener(root, "move", this.handleTopMoveCapture, true);
        this.removeEventListener(root, "move", this.handleTopMove);
        this.removeEventListener(root, "end", this.handleTopMoveEndCapture, true);
        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
            this.removeEventListener(root, "contextmenu", this.handleTopMoveEndCapture);
        }
        if (this.options.enableKeyboardEvents) {
            this.removeEventListener(root, "keydown", this.handleCancelOnEscape, true);
        }
        this.uninstallSourceNodeRemovalObserver();
    };
    _proto.addEventListener = function addEventListener(subject, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
        var options = supportsPassive ? {
            capture: capture,
            passive: false
        } : capture;
        this.listenerTypes.forEach(function(listenerType) {
            var evt = eventNames[listenerType][event];
            if (evt) {
                subject.addEventListener(evt, handler, options);
            }
        });
    };
    _proto.removeEventListener = function removeEventListener(subject, event, handler) {
        var capture = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
        var options = supportsPassive ? {
            capture: capture,
            passive: false
        } : capture;
        this.listenerTypes.forEach(function(listenerType) {
            var evt = eventNames[listenerType][event];
            if (evt) {
                subject.removeEventListener(evt, handler, options);
            }
        });
    };
    _proto.connectDragSource = function connectDragSource(sourceId, node) {
        var _this = this;
        var handleMoveStart = this.handleMoveStart.bind(this, sourceId);
        this.sourceNodes.set(sourceId, node);
        this.addEventListener(node, "start", handleMoveStart);
        return function() {
            _this.sourceNodes.delete(sourceId);
            _this.removeEventListener(node, "start", handleMoveStart);
        };
    };
    _proto.connectDragPreview = function connectDragPreview(sourceId, node, options) {
        var _this = this;
        this.sourcePreviewNodeOptions.set(sourceId, options);
        this.sourcePreviewNodes.set(sourceId, node);
        return function() {
            _this.sourcePreviewNodes.delete(sourceId);
            _this.sourcePreviewNodeOptions.delete(sourceId);
        };
    };
    _proto.connectDropTarget = function connectDropTarget(targetId, node) {
        var _this = this;
        var root = this.options.rootElement;
        if (!this.document || !root) {
            return function() {
            /* noop */ };
        }
        var handleMove = function(e) {
            if (!_this.document || !root || !_this.monitor.isDragging()) {
                return;
            }
            var coords;
            /**
       * Grab the coordinates for the current mouse/touch position
       */ switch(e.type){
                case eventNames.mouse.move:
                    coords = {
                        x: e.clientX,
                        y: e.clientY
                    };
                    break;
                case eventNames.touch.move:
                    var ref, ref1;
                    coords = {
                        x: ((ref = e.touches[0]) === null || ref === void 0 ? void 0 : ref.clientX) || 0,
                        y: ((ref1 = e.touches[0]) === null || ref1 === void 0 ? void 0 : ref1.clientY) || 0
                    };
                    break;
            }
            /**
       * Use the coordinates to grab the element the drag ended on.
       * If the element is the same as the target node (or any of it's children) then we have hit a drop target and can handle the move.
       */ var droppedOn = coords != null ? _this.document.elementFromPoint(coords.x, coords.y) : undefined;
            var childMatch = droppedOn && node.contains(droppedOn);
            if (droppedOn === node || childMatch) {
                return _this.handleMove(e, targetId);
            } else if (coords) {
                var elements = _this.document.elementsFromPoint(coords.x, coords.y);
                var found = elements.find(function(el) {
                    return node === el;
                });
                if (found) {
                    return _this.handleMove(e, targetId);
                }
            }
        };
        /**
     * Attaching the event listener to the body so that touchmove will work while dragging over multiple target elements.
     */ this.addEventListener(this.document.body, "move", handleMove);
        this.targetNodes.set(targetId, node);
        return function() {
            if (_this.document) {
                _this.targetNodes.delete(targetId);
                _this.removeEventListener(_this.document.body, "move", handleMove);
            }
        };
    };
    _proto.getTopMoveStartHandler = function getTopMoveStartHandler() {
        if (!this.options.delayTouchStart && !this.options.delayMouseStart) {
            return this.handleTopMoveStart;
        }
        return this.handleTopMoveStartDelay;
    };
    _proto.installSourceNodeRemovalObserver = function installSourceNodeRemovalObserver(node) {
        var _this = this;
        this.uninstallSourceNodeRemovalObserver();
        this.draggedSourceNode = node;
        this.draggedSourceNodeRemovalObserver = new MutationObserver(function() {
            if (node && !node.parentElement) {
                _this.resurrectSourceNode();
                _this.uninstallSourceNodeRemovalObserver();
            }
        });
        if (!node || !node.parentElement) {
            return;
        }
        this.draggedSourceNodeRemovalObserver.observe(node.parentElement, {
            childList: true
        });
    };
    _proto.resurrectSourceNode = function resurrectSourceNode() {
        if (this.document && this.draggedSourceNode) {
            this.draggedSourceNode.style.display = "none";
            this.draggedSourceNode.removeAttribute("data-reactid");
            this.document.body.appendChild(this.draggedSourceNode);
        }
    };
    _proto.uninstallSourceNodeRemovalObserver = function uninstallSourceNodeRemovalObserver() {
        if (this.draggedSourceNodeRemovalObserver) {
            this.draggedSourceNodeRemovalObserver.disconnect();
        }
        this.draggedSourceNodeRemovalObserver = undefined;
        this.draggedSourceNode = undefined;
    };
    _createClass(TouchBackendImpl, [
        {
            key: "document",
            get: // public for test
            function get() {
                return this.options.document;
            }
        }
    ]);
    return TouchBackendImpl;
}();
