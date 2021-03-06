(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ReactDnDTouchBackend = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
   */
  function invariant(condition, format) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }

    if (!condition) {
      var error;

      if (format === undefined) {
        error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
      } else {
        var argIndex = 0;
        error = new Error(format.replace(/%s/g, function () {
          return args[argIndex++];
        }));
        error.name = 'Invariant Violation';
      }

      error.framesToPop = 1; // we don't care about invariant's own frame

      throw error;
    }
  }

  var ListenerType;

  (function (ListenerType) {
    ListenerType["mouse"] = "mouse";
    ListenerType["touch"] = "touch";
    ListenerType["keyboard"] = "keyboard";
  })(ListenerType || (ListenerType = {}));

  // Used for MouseEvent.buttons (note the s on the end).
  var MouseButtons = {
    Left: 1,
    Right: 2,
    Center: 4
  }; // Used for e.button (note the lack of an s on the end).

  var MouseButton = {
    Left: 0,
    Center: 1,
    Right: 2
  };
  /**
   * Only touch events and mouse events where the left button is pressed should initiate a drag.
   * @param {MouseEvent | TouchEvent} e The event
   */

  function eventShouldStartDrag(e) {
    // For touch events, button will be undefined. If e.button is defined,
    // then it should be MouseButton.Left.
    return e.button === undefined || e.button === MouseButton.Left;
  }
  /**
   * Only touch events and mouse events where the left mouse button is no longer held should end a drag.
   * It's possible the user mouse downs with the left mouse button, then mouse down and ups with the right mouse button.
   * We don't want releasing the right mouse button to end the drag.
   * @param {MouseEvent | TouchEvent} e The event
   */

  function eventShouldEndDrag(e) {
    // Touch events will have buttons be undefined, while mouse events will have e.buttons's left button
    // bit field unset if the left mouse button has been released
    return e.buttons === undefined || (e.buttons & MouseButtons.Left) === 0;
  }
  function isTouchEvent(e) {
    return !!e.targetTouches;
  }

  var ELEMENT_NODE = 1;
  function getNodeClientOffset(node) {
    var el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;

    if (!el) {
      return undefined;
    }

    var _el$getBoundingClient = el.getBoundingClientRect(),
        top = _el$getBoundingClient.top,
        left = _el$getBoundingClient.left;

    return {
      x: left,
      y: top
    };
  }
  function getEventClientTouchOffset(e, lastTargetTouchFallback) {
    if (e.targetTouches.length === 1) {
      return getEventClientOffset(e.targetTouches[0]);
    } else if (lastTargetTouchFallback && e.touches.length === 1) {
      if (e.touches[0].target === lastTargetTouchFallback.target) {
        return getEventClientOffset(e.touches[0]);
      }
    }
  }
  function getEventClientOffset(e, lastTargetTouchFallback) {
    if (isTouchEvent(e)) {
      return getEventClientTouchOffset(e, lastTargetTouchFallback);
    } else {
      return {
        x: e.clientX,
        y: e.clientY
      };
    }
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2));
  }
  function inAngleRanges(x1, y1, x2, y2, angleRanges) {
    if (!angleRanges) {
      return false;
    }

    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 180;

    for (var i = 0; i < angleRanges.length; ++i) {
      if ((angleRanges[i].start == null || angle >= angleRanges[i].start) && (angleRanges[i].end == null || angle <= angleRanges[i].end)) {
        return true;
      }
    }

    return false;
  }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var OptionsReader = /*#__PURE__*/function () {
    function OptionsReader(incoming, context) {
      var _this = this;

      _classCallCheck(this, OptionsReader);

      this.enableTouchEvents = true;
      this.enableMouseEvents = false;
      this.enableKeyboardEvents = false;
      this.ignoreContextMenu = false;
      this.enableHoverOutsideTarget = false;
      this.touchSlop = 0;
      this.scrollAngleRanges = undefined;
      this.context = context;
      this.delayTouchStart = incoming.delayTouchStart || incoming.delay || 0;
      this.delayMouseStart = incoming.delayMouseStart || incoming.delay || 0;
      Object.keys(incoming).forEach(function (key) {
        if (incoming[key] != null) {
          _this[key] = incoming[key];
        }
      });
    }

    _createClass(OptionsReader, [{
      key: "window",
      get: function get() {
        if (this.context && this.context.window) {
          return this.context.window;
        } else if (typeof window !== 'undefined') {
          return window;
        }

        return undefined;
      }
    }, {
      key: "document",
      get: function get() {
        if (this.window) {
          return this.window.document;
        }

        return undefined;
      }
    }]);

    return OptionsReader;
  }();

  var _eventNames;

  function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  var eventNames = (_eventNames = {}, _defineProperty(_eventNames, ListenerType.mouse, {
    start: 'mousedown',
    move: 'mousemove',
    end: 'mouseup',
    contextmenu: 'contextmenu'
  }), _defineProperty(_eventNames, ListenerType.touch, {
    start: 'touchstart',
    move: 'touchmove',
    end: 'touchend'
  }), _defineProperty(_eventNames, ListenerType.keyboard, {
    keydown: 'keydown'
  }), _eventNames);
  var TouchBackendImpl = /*#__PURE__*/function () {
    function TouchBackendImpl(manager, context, options) {
      var _this = this;

      _classCallCheck$1(this, TouchBackendImpl);

      this.getSourceClientOffset = function (sourceId) {
        var element = _this.sourceNodes.get(sourceId);

        return element && getNodeClientOffset(element);
      };

      this.handleTopMoveStartCapture = function (e) {
        if (!eventShouldStartDrag(e)) {
          return;
        }

        _this.moveStartSourceIds = [];
      };

      this.handleMoveStart = function (sourceId) {
        // Just because we received an event doesn't necessarily mean we need to collect drag sources.
        // We only collect start collecting drag sources on touch and left mouse events.
        if (Array.isArray(_this.moveStartSourceIds)) {
          _this.moveStartSourceIds.unshift(sourceId);
        }
      };

      this.handleTopMoveStart = function (e) {
        if (!eventShouldStartDrag(e)) {
          return;
        } // Don't prematurely preventDefault() here since it might:
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

      this.handleTopMoveStartDelay = function (e) {
        if (!eventShouldStartDrag(e)) {
          return;
        }

        var delay = e.type === eventNames.touch.start ? _this.options.delayTouchStart : _this.options.delayMouseStart;
        _this.timeout = setTimeout(_this.handleTopMoveStart.bind(_this, e), delay);
        _this.waitingForDelay = true;
      };

      this.handleTopMoveCapture = function () {
        _this.dragOverTargetIds = [];
      };

      this.handleMove = function (_evt, targetId) {
        if (_this.dragOverTargetIds) {
          _this.dragOverTargetIds.unshift(targetId);
        }
      };

      this.handleTopMove = function (e) {
        if (_this.timeout) {
          clearTimeout(_this.timeout);
        }

        if (!_this.document || _this.waitingForDelay) {
          return;
        }

        var moveStartSourceIds = _this.moveStartSourceIds,
            dragOverTargetIds = _this.dragOverTargetIds;
        var enableHoverOutsideTarget = _this.options.enableHoverOutsideTarget;
        var clientOffset = getEventClientOffset(e, _this.lastTargetTouchFallback);

        if (!clientOffset) {
          return;
        } // If the touch move started as a scroll, or is is between the scroll angles


        if (_this._isScrolling || !_this.monitor.isDragging() && inAngleRanges(_this._mouseClientOffset.x || 0, _this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y, _this.options.scrollAngleRanges)) {
          _this._isScrolling = true;
          return;
        } // If we're not dragging and we've moved a little, that counts as a drag start


        if (!_this.monitor.isDragging() && // eslint-disable-next-line no-prototype-builtins
        _this._mouseClientOffset.hasOwnProperty('x') && moveStartSourceIds && distance(_this._mouseClientOffset.x || 0, _this._mouseClientOffset.y || 0, clientOffset.x, clientOffset.y) > (_this.options.touchSlop ? _this.options.touchSlop : 0)) {
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

        if (e.cancelable) e.preventDefault(); // Get the node elements of the hovered DropTargets

        var dragOverTargetNodes = (dragOverTargetIds || []).map(function (key) {
          return _this.targetNodes.get(key);
        }).filter(function (e) {
          return !!e;
        }); // Get the a ordered list of nodes that are touched by

        var elementsAtPoint = _this.options.getDropTargetElementsAtPoint ? _this.options.getDropTargetElementsAtPoint(clientOffset.x, clientOffset.y, dragOverTargetNodes) : _this.document.elementsFromPoint(clientOffset.x, clientOffset.y); // Extend list with parents that are not receiving elementsFromPoint events (size 0 elements and svg groups)

        var elementsAtPointExtended = [];

        for (var nodeId in elementsAtPoint) {
          // eslint-disable-next-line no-prototype-builtins
          if (!elementsAtPoint.hasOwnProperty(nodeId)) {
            continue;
          }

          var currentNode = elementsAtPoint[nodeId];
          elementsAtPointExtended.push(currentNode);

          while (currentNode) {
            currentNode = currentNode.parentElement;

            if (currentNode && elementsAtPointExtended.indexOf(currentNode) === -1) {
              elementsAtPointExtended.push(currentNode);
            }
          }
        }

        var orderedDragOverTargetIds = elementsAtPointExtended // Filter off nodes that arent a hovered DropTargets nodes
        .filter(function (node) {
          return dragOverTargetNodes.indexOf(node) > -1;
        }) // Map back the nodes elements to targetIds
        .map(function (node) {
          return _this._getDropTargetId(node);
        }) // Filter off possible null rows
        .filter(function (node) {
          return !!node;
        }).filter(function (id, index, ids) {
          return ids.indexOf(id) === index;
        }); // Invoke hover for drop targets when source node is still over and pointer is outside

        if (enableHoverOutsideTarget) {
          for (var targetId in _this.targetNodes) {
            var targetNode = _this.targetNodes.get(targetId);

            if (sourceNode && targetNode && targetNode.contains(sourceNode) && orderedDragOverTargetIds.indexOf(targetId) === -1) {
              orderedDragOverTargetIds.unshift(targetId);
              break;
            }
          }
        } // Reverse order because dnd-core reverse it before calling the DropTarget drop methods


        orderedDragOverTargetIds.reverse();

        _this.actions.hover(orderedDragOverTargetIds, {
          clientOffset: clientOffset
        });
      };
      /**
       *
       * visible for testing
       */


      this._getDropTargetId = function (node) {
        var keys = _this.targetNodes.keys();

        var next = keys.next();

        while (next.done === false) {
          var targetId = next.value;

          if (node === _this.targetNodes.get(targetId)) {
            return targetId;
          } else {
            next = keys.next();
          }
        }

        return undefined;
      };

      this.handleTopMoveEndCapture = function (e) {
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

      this.handleCancelOnEscape = function (e) {
        if (e.key === 'Escape' && _this.monitor.isDragging()) {
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
    /**
     * Generate profiling statistics for the HTML5Backend.
     */


    _createClass$1(TouchBackendImpl, [{
      key: "profile",
      value: function profile() {
        var _this$dragOverTargetI;

        return {
          sourceNodes: this.sourceNodes.size,
          sourcePreviewNodes: this.sourcePreviewNodes.size,
          sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
          targetNodes: this.targetNodes.size,
          dragOverTargetIds: ((_this$dragOverTargetI = this.dragOverTargetIds) === null || _this$dragOverTargetI === void 0 ? void 0 : _this$dragOverTargetI.length) || 0
        };
      } // public for test

    }, {
      key: "setup",
      value: function setup() {
        if (!this.window) {
          return;
        }

        invariant(!TouchBackendImpl.isSetUp, 'Cannot have two Touch backends at the same time.');
        TouchBackendImpl.isSetUp = true;
        this.addEventListener(this.window, 'start', this.getTopMoveStartHandler());
        this.addEventListener(this.window, 'start', this.handleTopMoveStartCapture, true);
        this.addEventListener(this.window, 'move', this.handleTopMove);
        this.addEventListener(this.window, 'move', this.handleTopMoveCapture, true);
        this.addEventListener(this.window, 'end', this.handleTopMoveEndCapture, true);

        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
          this.addEventListener(this.window, 'contextmenu', this.handleTopMoveEndCapture);
        }

        if (this.options.enableKeyboardEvents) {
          this.addEventListener(this.window, 'keydown', this.handleCancelOnEscape, true);
        }
      }
    }, {
      key: "teardown",
      value: function teardown() {
        if (!this.window) {
          return;
        }

        TouchBackendImpl.isSetUp = false;
        this._mouseClientOffset = {};
        this.removeEventListener(this.window, 'start', this.handleTopMoveStartCapture, true);
        this.removeEventListener(this.window, 'start', this.handleTopMoveStart);
        this.removeEventListener(this.window, 'move', this.handleTopMoveCapture, true);
        this.removeEventListener(this.window, 'move', this.handleTopMove);
        this.removeEventListener(this.window, 'end', this.handleTopMoveEndCapture, true);

        if (this.options.enableMouseEvents && !this.options.ignoreContextMenu) {
          this.removeEventListener(this.window, 'contextmenu', this.handleTopMoveEndCapture);
        }

        if (this.options.enableKeyboardEvents) {
          this.removeEventListener(this.window, 'keydown', this.handleCancelOnEscape, true);
        }

        this.uninstallSourceNodeRemovalObserver();
      }
    }, {
      key: "addEventListener",
      value: function addEventListener(subject, event, handler, capture) {
        var options =  capture;
        this.listenerTypes.forEach(function (listenerType) {
          var evt = eventNames[listenerType][event];

          if (evt) {
            subject.addEventListener(evt, handler, options);
          }
        });
      }
    }, {
      key: "removeEventListener",
      value: function removeEventListener(subject, event, handler, capture) {
        var options =  capture;
        this.listenerTypes.forEach(function (listenerType) {
          var evt = eventNames[listenerType][event];

          if (evt) {
            subject.removeEventListener(evt, handler, options);
          }
        });
      }
    }, {
      key: "connectDragSource",
      value: function connectDragSource(sourceId, node) {
        var _this2 = this;

        var handleMoveStart = this.handleMoveStart.bind(this, sourceId);
        this.sourceNodes.set(sourceId, node);
        this.addEventListener(node, 'start', handleMoveStart);
        return function () {
          _this2.sourceNodes.delete(sourceId);

          _this2.removeEventListener(node, 'start', handleMoveStart);
        };
      }
    }, {
      key: "connectDragPreview",
      value: function connectDragPreview(sourceId, node, options) {
        var _this3 = this;

        this.sourcePreviewNodeOptions.set(sourceId, options);
        this.sourcePreviewNodes.set(sourceId, node);
        return function () {
          _this3.sourcePreviewNodes.delete(sourceId);

          _this3.sourcePreviewNodeOptions.delete(sourceId);
        };
      }
    }, {
      key: "connectDropTarget",
      value: function connectDropTarget(targetId, node) {
        var _this4 = this;

        if (!this.document) {
          return function () {
            /* noop */
          };
        }

        var handleMove = function handleMove(e) {
          if (!_this4.document || !_this4.monitor.isDragging()) {
            return;
          }

          var coords;
          /**
           * Grab the coordinates for the current mouse/touch position
           */

          switch (e.type) {
            case eventNames.mouse.move:
              coords = {
                x: e.clientX,
                y: e.clientY
              };
              break;

            case eventNames.touch.move:
              coords = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
              };
              break;
          }
          /**
           * Use the coordinates to grab the element the drag ended on.
           * If the element is the same as the target node (or any of it's children) then we have hit a drop target and can handle the move.
           */


          var droppedOn = coords != null ? _this4.document.elementFromPoint(coords.x, coords.y) : undefined;
          var childMatch = droppedOn && node.contains(droppedOn);

          if (droppedOn === node || childMatch) {
            return _this4.handleMove(e, targetId);
          } else if (coords) {
            var elements = _this4.document.elementsFromPoint(coords.x, coords.y);

            var found = elements.find(function (el) {
              return node === el;
            });

            if (found) {
              return _this4.handleMove(e, targetId);
            }
          }
        };
        /**
         * Attaching the event listener to the body so that touchmove will work while dragging over multiple target elements.
         */


        this.addEventListener(this.document.body, 'move', handleMove);
        this.targetNodes.set(targetId, node);
        return function () {
          if (_this4.document) {
            _this4.targetNodes.delete(targetId);

            _this4.removeEventListener(_this4.document.body, 'move', handleMove);
          }
        };
      }
    }, {
      key: "getTopMoveStartHandler",
      value: function getTopMoveStartHandler() {
        if (!this.options.delayTouchStart && !this.options.delayMouseStart) {
          return this.handleTopMoveStart;
        }

        return this.handleTopMoveStartDelay;
      }
    }, {
      key: "installSourceNodeRemovalObserver",
      value: function installSourceNodeRemovalObserver(node) {
        var _this5 = this;

        this.uninstallSourceNodeRemovalObserver();
        this.draggedSourceNode = node;
        this.draggedSourceNodeRemovalObserver = new MutationObserver(function () {
          if (node && !node.parentElement) {
            _this5.resurrectSourceNode();

            _this5.uninstallSourceNodeRemovalObserver();
          }
        });

        if (!node || !node.parentElement) {
          return;
        }

        this.draggedSourceNodeRemovalObserver.observe(node.parentElement, {
          childList: true
        });
      }
    }, {
      key: "resurrectSourceNode",
      value: function resurrectSourceNode() {
        if (this.document && this.draggedSourceNode) {
          this.draggedSourceNode.style.display = 'none';
          this.draggedSourceNode.removeAttribute('data-reactid');
          this.document.body.appendChild(this.draggedSourceNode);
        }
      }
    }, {
      key: "uninstallSourceNodeRemovalObserver",
      value: function uninstallSourceNodeRemovalObserver() {
        if (this.draggedSourceNodeRemovalObserver) {
          this.draggedSourceNodeRemovalObserver.disconnect();
        }

        this.draggedSourceNodeRemovalObserver = undefined;
        this.draggedSourceNode = undefined;
      }
    }, {
      key: "window",
      get: function get() {
        return this.options.window;
      } // public for test

    }, {
      key: "document",
      get: function get() {
        if (this.window) {
          return this.window.document;
        }

        return undefined;
      }
    }]);

    return TouchBackendImpl;
  }();

  var TouchBackend = function createBackend(manager) {
    var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return new TouchBackendImpl(manager, context, options);
  };

  exports.TouchBackend = TouchBackend;
  exports.TouchBackendImpl = TouchBackendImpl;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
