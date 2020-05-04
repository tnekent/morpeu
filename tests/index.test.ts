import morph = require("../src/index");

test("errors when no arguments given", () => {
    // Simulate JavaScript behavior by passing undefined
    expect(() => morph(undefined)).toThrow();
});

test("can construct Markdown heading + link", () => {
    const sturcture = { name: "Bar", link: "bar.com" },
        result = morph("## [{.name}]({0.link})", sturcture);

    expect(result).toBe("## [Bar](bar.com)");
});
