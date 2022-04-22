import { OptionsReader } from "../OptionsReader.js";
describe("The Touch Backend Options Reader", function() {
    it("can be constructed and emits some defaults", function() {
        var options = new OptionsReader({});
        expect(options.delayTouchStart).toEqual(0);
        expect(options.delayMouseStart).toEqual(0);
        expect(options.enableMouseEvents).toEqual(false);
        expect(options.enableTouchEvents).toEqual(true);
    });
});
