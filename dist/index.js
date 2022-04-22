import { TouchBackendImpl } from "./TouchBackendImpl.js";
export * from "./interfaces.js";
export * from "./TouchBackendImpl.js";
export var TouchBackend = function createBackend(manager) {
    var context = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return new TouchBackendImpl(manager, context, options);
};
