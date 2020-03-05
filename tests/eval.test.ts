import Evaluator from "../src/eval";
import Parser from "../src/parse";

test("evaluates rules to a string", () => {
    const iter = new Parser("Hello World").parse();

    expect(new Evaluator(iter, []).eval()).toEqual(expect.any(String));
});
