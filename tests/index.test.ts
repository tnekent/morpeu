import morph = require("../src/index");

test("morphs a whole const string as it is", () => {
    expect(morph("Hello World!")).toBe("Hello World!");
});

test("morphs input with argrules", () => {
    let result = morph("{.name} with id {0.id} is in", { name: "Kent", id: 4 });
    expect(result).toBe("Kent with id 4 is in");
    result = morph("Foo {0.name}", { name: "Bar" });
    expect(result).toBe("Foo Bar");
    result = morph("{.a[b].c} {.x[y]}", { a: { b: { c: "d" } } }, { x: { y: "z" } });
    expect(result).toBe("d z");
});

test("morphs input with literal const braces", () => {
    expect(morph("{{ i: 2 }}")).toBe("{ i: 2 }");
    expect(morph("{{}}")).toBe("{}");
});

test("morphs input with argrules and modrules", () => {
    let result = morph("{} / {1|i} = {2|.3f}", 1, 3, 1.333333);
    expect(result).toBe("1 / 3 = 1.333");
    result = morph("{0.a}, {1.b}, {2.z}", { a: 1 }, { b: 2 }, { z: 3 });
    expect(result).toBe("1, 2, 3");
    result = morph("{2|f} {1|s} {0|i}", 4, "Hello", 3.14159);
    expect(result).toBe("3.141590 Hello 4");
});
