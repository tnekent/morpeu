import morph = require("../src/index");

test.each`
        input                    | arglist                                          | output
        ${"Annyeonghaseyo"}      | ${[]}                                            | ${"Annyeonghaseyo"}
        ${"{{ x: y }}"}          | ${[]}                                            | ${"{ x: y }"}
        ${"Foo {0.name}"}        | ${[{ name: "Bar" }]}                             | ${"Foo Bar"}
        ${"{|5s}"}               | ${["foo"]}                                       | ${"     foo"}
        ${"{} / {|i} = {|.3f}"}  | ${[1, 3, 1.333333]}                              | ${"1 / 3 = 1.333"}
        ${"{|2.6s}ss"}           | ${["fizzbuzz"]}                                  | ${"  fizzbuss"}
        ${"{0.a}, {1.b}, {2.z}"} | ${[{ a: 1 }, { b: 2 }, { z: 3 }]}                | ${"1, 2, 3"}
        ${"{|f}"}                | ${[1.5]}                                         | ${"1.500000"}
        ${"{2|f} {1|s} {0|i}"}   | ${[4, "Hello", 3.14159]}                         | ${"3.141590 Hello 4"}
        ${"{.a[b].c} {.x[y]}"}   | ${[{ a: { b: { c: "d" } } }, { x: { y: "z" } }]} | ${"d z"}
        ${"user is {|j}"}        | ${[{ user: "foo", id: 375 }]}                    | ${`user is ${JSON.stringify({ user: "foo", id: 375 })}`}
        `("evaluates '$input' into '$output'", ({ input, arglist, output }) => {
    expect(morph(input, ...arglist)).toBe(output);
});
