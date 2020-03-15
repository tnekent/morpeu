import Parser from "../src/parse";
import Evaluator from "../src/eval";

function parseThenEval(input: string, arglist: any[]): string {
    return new Evaluator(new Parser(input).parse(), arglist).eval();
}

test("evaluates whole const field strings", () => {
    expect(parseThenEval("Purely const", []))
        .toBe("Purely const");
});

test("evaluates format field only strings", () => {
    expect(parseThenEval("{.input}", [{ input: "Hi" }]))
        .toBe("Hi");
});

test("evaluates empty format field", () => {
    expect(parseThenEval("{}", ["empty"]))
        .toBe("empty");
});

test("evaluates format field with delimiter only", () => {
    expect(parseThenEval("{|}", ["empty"]))
        .toBe("empty");
});

test("evaluates strings with both const and format fields", () => {
    expect(parseThenEval("Planet {.planet.name}", [{ planet: { name: "Earth" } }]))
        .toBe("Planet Earth");
});

describe("ArgRules", () => {
    test("automatically increments index when unspecified", () => {
        expect(parseThenEval("{}{}{}{}", [1,2,3,4]))
            .toBe("1234");
    });

    test("errors when unspecifying index after specifying in previous format field", () => {
        expect(() => parseThenEval("{}{2}{}", [1,3,2]))
            .toThrow();
    });

    test("manual indexing gets the right values", () => {
        expect(parseThenEval("{2}{1}{3}{0}", [4,2,1,3]))
            .toBe("1234");
    });

    test("indexing can be omitted when specifiying props", () => {
        expect(parseThenEval("{.a}", [{ a: "A" }]))
            .toBe("A");
    });

    test("bracket and dot props can be mixed", () => {
        expect(parseThenEval("{.a[b].c}", [{ a: { b: { c: "A" } } }]))
            .toBe("A");
    });

    test("bracket props indexes in arrays", () => {
        expect(parseThenEval("{[1]}", [[0, 1]]))
            .toBe("1");
        expect(parseThenEval("{.arr[2]}", [{ arr: [0, 1, 2] }]))
            .toBe("2");
    });

    test("bracket props accept non-alphanumeric chars", () => {
        expect(parseThenEval("{[-name-]}", [{ "-name-": "foo" }]))
            .toBe("foo");
    });

    test("dot props can be used from bracket props on properties with valid identifier names", () => {
        const list = [{ prop: "abc" }],
            dotprop = parseThenEval("{.prop}", list),
            bracketprop = parseThenEval("{[prop]}", list);

        expect(dotprop).toEqual(bracketprop); // Both should be "abc"
    });
});

// Modrules tested in "./mod.test.ts".
