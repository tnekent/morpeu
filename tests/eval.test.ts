import Evaluator from "../src/eval";
import Parser from "../src/parse";

test("evaluates rules to a string", () => {
    const iter = new Parser("Hello World").parse();

    expect(new Evaluator(iter, []).eval()).toEqual(expect.any(String));
});

test("evaluates const fields", () => {
    const iter = new Parser("Foo {{Bar}}").parse();

    expect(new Evaluator(iter, []).eval()).toBe("Foo {Bar}");
});

describe("Format fields", () => {
    test.each`
        input                    |arglist                                           |output
        ${"Foo {0.name}"}        |${[{ name: "Bar" }]}                            |${"Foo Bar"}
        ${"{|5s}"}               |${["foo"]}                                      |${"     foo"}
        ${"{} / {|i} = {|.3f}"}  |${[1, 3, 1.333333]}                             |${"1 / 3 = 1.333"}
        ${"{|2.6s}ss"}            |${["fizzbuzz"]}                                 |${"  fizzbuss"}
        ${"{0.a}, {1.b}, {2.z}"} |${[{ a: 1 }, { b: 2 }, { z: 3 }]}               |${"1, 2, 3"}
        ${"{|f}"}                |${[1.5]}                                        |${"1.500000"}
        ${"{2|f} {1|s} {0|i}"}   |${[4, "Hello", 3.14159]}                        |${"3.141590 Hello 4"}
        ${"{.a[b].c} {.x[y]}"}   |${[{ a: { b: { c: "d" } } }, { x: { y: "z" } }]} |${"d z"}
        `("evaluates '$input' into '$output'", ({ input, arglist, output }) => {
    const iter = new Parser(input).parse();

    expect(new Evaluator(iter, arglist).eval()).toBe(output);
});
});
