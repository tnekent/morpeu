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
