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
export var OptionsReader = /*#__PURE__*/ function() {
    "use strict";
    function OptionsReader(args, context) {
        _classCallCheck(this, OptionsReader);
        this.args = args;
        this.context = context;
    }
    _createClass(OptionsReader, [
        {
            key: "delay",
            get: function get() {
                var _delay;
                return (_delay = this.args.delay) !== null && _delay !== void 0 ? _delay : 0;
            }
        },
        {
            key: "scrollAngleRanges",
            get: function get() {
                return this.args.scrollAngleRanges;
            }
        },
        {
            key: "getDropTargetElementsAtPoint",
            get: function get() {
                return this.args.getDropTargetElementsAtPoint;
            }
        },
        {
            key: "ignoreContextMenu",
            get: function get() {
                var _ignoreContextMenu;
                return (_ignoreContextMenu = this.args.ignoreContextMenu) !== null && _ignoreContextMenu !== void 0 ? _ignoreContextMenu : false;
            }
        },
        {
            key: "enableHoverOutsideTarget",
            get: function get() {
                var _enableHoverOutsideTarget;
                return (_enableHoverOutsideTarget = this.args.enableHoverOutsideTarget) !== null && _enableHoverOutsideTarget !== void 0 ? _enableHoverOutsideTarget : false;
            }
        },
        {
            key: "enableKeyboardEvents",
            get: function get() {
                var _enableKeyboardEvents;
                return (_enableKeyboardEvents = this.args.enableKeyboardEvents) !== null && _enableKeyboardEvents !== void 0 ? _enableKeyboardEvents : false;
            }
        },
        {
            key: "enableMouseEvents",
            get: function get() {
                var _enableMouseEvents;
                return (_enableMouseEvents = this.args.enableMouseEvents) !== null && _enableMouseEvents !== void 0 ? _enableMouseEvents : false;
            }
        },
        {
            key: "enableTouchEvents",
            get: function get() {
                var _enableTouchEvents;
                return (_enableTouchEvents = this.args.enableTouchEvents) !== null && _enableTouchEvents !== void 0 ? _enableTouchEvents : true;
            }
        },
        {
            key: "touchSlop",
            get: function get() {
                return this.args.touchSlop || 0;
            }
        },
        {
            key: "delayTouchStart",
            get: function get() {
                var ref, ref1;
                var ref2, ref3;
                return (ref3 = (ref2 = (ref = this.args) === null || ref === void 0 ? void 0 : ref.delayTouchStart) !== null && ref2 !== void 0 ? ref2 : (ref1 = this.args) === null || ref1 === void 0 ? void 0 : ref1.delay) !== null && ref3 !== void 0 ? ref3 : 0;
            }
        },
        {
            key: "delayMouseStart",
            get: function get() {
                var ref, ref4;
                var ref5, ref6;
                return (ref6 = (ref5 = (ref = this.args) === null || ref === void 0 ? void 0 : ref.delayMouseStart) !== null && ref5 !== void 0 ? ref5 : (ref4 = this.args) === null || ref4 === void 0 ? void 0 : ref4.delay) !== null && ref6 !== void 0 ? ref6 : 0;
            }
        },
        {
            key: "window",
            get: function get() {
                if (this.context && this.context.window) {
                    return this.context.window;
                } else if (typeof window !== "undefined") {
                    return window;
                }
                return undefined;
            }
        },
        {
            key: "document",
            get: function get() {
                var ref;
                if ((ref = this.context) === null || ref === void 0 ? void 0 : ref.document) {
                    return this.context.document;
                }
                if (this.window) {
                    return this.window.document;
                }
                return undefined;
            }
        },
        {
            key: "rootElement",
            get: function get() {
                var ref;
                return ((ref = this.args) === null || ref === void 0 ? void 0 : ref.rootElement) || this.document;
            }
        }
    ]);
    return OptionsReader;
}();
