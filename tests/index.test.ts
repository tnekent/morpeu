import morph = require("../src/index");

test("errors when no arguments given", () => {
    // Simulate JavaScript behavior by passing undefined
    expect(() => morph(undefined)).toThrow();
});
