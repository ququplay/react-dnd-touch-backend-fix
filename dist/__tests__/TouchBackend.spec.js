import { TouchBackend } from "../index.js";
describe("TouchBackend", function() {
    it("can be constructed", function() {
        var backend = TouchBackend(mockManager(), {}, {});
        expect(backend).toBeDefined();
    });
    it("can be constructed", function() {
        var backend = TouchBackend(mockManager(), {}, {});
        expect(backend).toBeDefined();
        var profile = backend.profile();
        expect(profile).toBeDefined();
        Object.keys(profile).forEach(function(profilingKey) {
            return expect(profile[profilingKey]).toEqual(0);
        });
    });
    it("can determine target ids", function() {
        var mockNode1 = {};
        var mockNode2 = {};
        var backend = TouchBackend(mockManager(), {}, {});
        backend.targetNodes.set("abc", mockNode1);
        backend.targetNodes.set("def", mockNode2);
        expect(backend._getDropTargetId(mockNode1)).toEqual("abc");
        expect(backend._getDropTargetId(mockNode2)).toEqual("def");
        expect(backend._getDropTargetId({})).toEqual(undefined);
    });
});
function mockManager() {
    return {
        getActions: function() {
            return null;
        },
        getMonitor: function() {
            return null;
        },
        getRegistry: function() {
            return null;
        }
    };
}
